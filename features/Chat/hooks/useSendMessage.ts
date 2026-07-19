"use client";

import useSWRMutation from "swr/mutation";

import { ApiError, isApiError } from "@/lib/api/errors";
import { createMessage } from "../api/messages";
import { CURRENT_USER, DEFAULT_MESSAGE_LIMIT } from "../constants";
import { chatKeys, type MessagesKey } from "../keys";
import type { Message } from "../types";

const sendMessageFetcher = async (
  _key: MessagesKey,
  { arg: text }: { arg: string },
): Promise<Message> => {
  try {
    return await createMessage({ message: text, author: CURRENT_USER });
  } catch (err) {
    throw isApiError(err)
      ? err
      : new ApiError("Failed to send message.", 0, err);
  }
};

/**
 * Sends a message with an optimistic update: the message card appears instantly, is
 * reconciled with the server's response, and rolls back automatically
 */
export const useSendMessage = (limit: number = DEFAULT_MESSAGE_LIMIT) => {
  const { trigger, isMutating, error } = useSWRMutation<
    Message,
    ApiError,
    MessagesKey,
    string,
    Message[]
  >(chatKeys.messages(limit), sendMessageFetcher);

  const sendMessage = async (text: string): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const optimistic: Message = {
      id: `optimistic-${crypto.randomUUID()}`,
      author: CURRENT_USER,
      text: trimmed,
      timestamp: new Date().toISOString(),
      isOutgoing: true,
    };

    await trigger<Message[]>(trimmed, {
      // Append the optimistic message card immediately.
      optimisticData: (current: Message[] = []) => [...current, optimistic],
      // Swap the optimistic entry for the persisted message on success.
      populateCache: (created: Message, current: Message[] = []) => [
        ...current.filter((m) => m.id !== optimistic.id),
        created,
      ],
      rollbackOnError: true,
      revalidate: true,
    });
  };

  return { sendMessage, isSending: isMutating, error: error ?? null };
};

"use client";

import useSWR from "swr";

import { DEFAULT_MESSAGE_LIMIT, POLL_INTERVAL_MS } from "../constants";
import { chatKeys, messagesFetcher } from "../keys";
import type { Message } from "../types";

type UseMessagesOptions = {
  /** SSR-rendered messages used to hydrate the cache with zero flicker. */
  fallbackData?: Message[];
  /** How many messages to keep in view. */
  limit?: number;
};

/**
 * Subscribes to the chat history with short polling (every {@link POLL_INTERVAL_MS}).
 * Seeded by SSR data so the first paint is instant, then kept fresh client-side.
 */
export const useMessages = ({
  fallbackData,
  limit = DEFAULT_MESSAGE_LIMIT,
}: UseMessagesOptions = {}) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Message[]>(
    chatKeys.messages(limit),
    messagesFetcher,
    {
      fallbackData,
      refreshInterval: POLL_INTERVAL_MS,
      // Chat intentionally overrides the app-wide default (see SWRProvider).
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  );

  return {
    messages: data ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

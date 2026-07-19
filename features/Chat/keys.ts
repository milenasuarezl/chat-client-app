import { fetchMessages } from "./api/messages";
import { DEFAULT_MESSAGE_LIMIT } from "./constants";
import type { Message } from "./types";

/**
 * SWR cache key for the message list. `limit` is part of the key so SWR caches
 * each page size separately and the send-mutation can target the same entry.
 */
export type MessagesKey = readonly ["messages", number];

export const chatKeys = {
  messages: (limit: number = DEFAULT_MESSAGE_LIMIT): MessagesKey => [
    "messages",
    limit,
  ],
} as const;

export const messagesFetcher = ([, limit]: MessagesKey): Promise<Message[]> =>
  fetchMessages({ limit });

import { fetchMessages } from "@/lib/api/messages";
import type { Message } from "@/lib/types";

/**
 * SWR cache key for the message list. `limit` is part of the key so SWR caches
 * each page size separately and the send-mutation can target the same entry.
 */
export type MessagesKey = readonly ["messages", number];

export const messagesFetcher = ([, limit]: MessagesKey): Promise<Message[]> =>
  fetchMessages({ limit });


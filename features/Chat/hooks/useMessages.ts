"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

import { fetchMessages, mergeMessages } from "../api/messages";
import {
  DEFAULT_MESSAGE_LIMIT,
  OPTIMISTIC_ID_PREFIX,
  POLL_INTERVAL_MS,
} from "../constants";
import { chatKeys, messagesFetcher } from "../keys";
import type { Message } from "../types";

type UseMessagesOptions = {
  /** SSR-rendered messages used to hydrate the cache with zero flicker. */
  fallbackData?: Message[];
  /** How many messages to keep in view. */
  limit?: number;
};

const cursorFrom = (messages: Message[]): string | undefined => {
  let cursor: string | undefined;
  for (const message of messages) {
    if (message.id.startsWith(OPTIMISTIC_ID_PREFIX)) continue;
    if (cursor === undefined || message.timestamp > cursor) {
      cursor = message.timestamp;
    }
  }
  return cursor;
};

/**
 * Subscribes to the chat history. The first load fetches the most recent
 * `limit` messages; after that we poll incrementally every
 * {@link POLL_INTERVAL_MS} using the `after` cursor, fetching only messages newer
 * than the ones we already have and merging them into the cache. Seeded by SSR
 * data so the first paint is instant.
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
      // Polling is handled manually below so we can fetch incrementally.
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  );

  const [pollError, setPollError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        await mutate(async (current = []) => {
          const cursor = cursorFrom(current);
          // No baseline yet (e.g. empty history): fall back to a full fetch.
          if (cursor === undefined) return fetchMessages({ limit });

          const fresh = await fetchMessages({ after: cursor });
          return mergeMessages(current, fresh, limit);
        }, { revalidate: false });
        if (active) setPollError(null);
      } catch (err) {
        if (active) setPollError(err);
      } finally {
        if (active) timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [mutate, limit]);

  return {
    messages: data ?? [],
    error: error ?? pollError,
    isLoading,
    isValidating,
    mutate,
  };
};

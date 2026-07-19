import { apiFetch } from "@/lib/api/http";
import { MESSAGE_FETCH_LIMIT } from "../constants";
import type {
  CreateMessageRequest,
  GetMessagesParams,
  Message,
  MessageResponse,
} from "../types";
import { toMessage } from "./mappers";

export const fetchMessages = async (
  params: GetMessagesParams = {},
): Promise<Message[]> => {
  const { limit, after, before } = params;

  const query = new URLSearchParams();
  // The API's `limit` returns the OLDEST messages first, so we always request a
  // wide window and keep the newest `limit` on the client (see below).
  query.set("limit", String(MESSAGE_FETCH_LIMIT));
  if (after) query.set("after", after);
  if (before) query.set("before", before);

  const dtos = await apiFetch<MessageResponse[]>(
    `/messages?${query.toString()}`,
    // Always hit the network so polling reflects the latest state.
    { cache: "no-store" },
  );

  const sorted = dtos
    .map(toMessage)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // Keep only the most recent `limit` messages so newly sent messages (appended
  // at the end by the API) always stay in view instead of falling out of an
  // oldest-first window.
  return limit != null ? sorted.slice(-limit) : sorted;
};

export const mergeMessages = (
  current: Message[],
  incoming: Message[],
  limit: number,
): Message[] => {
  if (incoming.length === 0) return current;

  const byId = new Map(current.map((m) => [m.id, m]));
  for (const message of incoming) byId.set(message.id, message);

  return [...byId.values()]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-limit);
};

export const createMessage = async (
  input: CreateMessageRequest,
): Promise<Message> => {
  const dto = await apiFetch<MessageResponse>("/messages", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return toMessage(dto);
};

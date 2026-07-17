import type {
  CreateMessageRequest,
  GetMessagesParams,
  Message,
  MessageResponse,
} from "@/lib/types";
import { apiFetch } from "./http";
import { toMessage } from "./mappers";

// Fetches messages and returns them sorted oldest.
export const fetchMessages = async (
  params: GetMessagesParams = {},
): Promise<Message[]> => {
  const query = new URLSearchParams();
  if (params.limit != null) query.set("limit", String(params.limit));
  if (params.after) query.set("after", params.after);
  if (params.before) query.set("before", params.before);

  const search = query.toString();
  const dtos = await apiFetch<MessageResponse[]>(
    `/messages${search ? `?${search}` : ""}`,
    // Always hit the network so polling reflects the latest state.
    { cache: "no-store" },
  );

  return dtos
    .map(toMessage)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};

// Creates a new message and returns it in domain shape.
export const createMessage = async (
  input: CreateMessageRequest,
): Promise<Message> => {
  const dto = await apiFetch<MessageResponse>("/messages", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return toMessage(dto);
};

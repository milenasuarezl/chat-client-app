import { fetchMessages } from "@/lib/api/messages";
import { DEFAULT_MESSAGE_LIMIT } from "@/lib/constants";
import type { Message } from "@/lib/types";
import { ChatClient } from "./ChatClient";

export const Chat = async () => {
  let initialMessages: Message[] = [];

  try {
    initialMessages = await fetchMessages({ limit: DEFAULT_MESSAGE_LIMIT });
  } catch {
    // Fail open — client polling will recover.
  }

  // TODO
  return <ChatClient initialMessages={initialMessages} />;
};

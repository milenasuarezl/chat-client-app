import { fetchMessages } from "./api/messages";
import { DEFAULT_MESSAGE_LIMIT } from "./constants";
import type { Message } from "./types";
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

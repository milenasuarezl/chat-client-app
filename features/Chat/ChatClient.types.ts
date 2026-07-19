import type { Message } from "./types";

export type ChatClientProps = {
  /** Initial message history used to hydrate the chat on first render. */
  initialMessages: Message[];
};

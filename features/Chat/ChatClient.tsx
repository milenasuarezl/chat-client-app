"use client";

import { useEffect, useRef, useState } from "react";
import { MessageList } from "./components/MessageList";
import { MessageComposer } from "./components/MessageComposer";
import { useMessages } from "./hooks/useMessages";
import { useSendMessage } from "./hooks/useSendMessage";
import styles from "./Chat.module.css";
import type { ChatClientProps } from "./ChatClient.types";

/**
 * Interactive chat screen (client). Hydrates SWR with the server-rendered
 * history, keeps it fresh via short polling, and sends new messages
 */
export const ChatClient = ({ initialMessages }: ChatClientProps) => {
  const {
    messages,
    error: pollError,
    isValidating,
    mutate,
  } = useMessages({ fallbackData: initialMessages });
  const { sendMessage } = useSendMessage();

  const [sendError, setSendError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSend = async (text: string) => {
    setSendError(null);
    try {
      await sendMessage(text);
      setLastFailedText(null);
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "Failed to send message.",
      );
      setLastFailedText(text);
    }
  };

  return (
    <main className={styles.chat} aria-label="Chat">
      <div className={styles.scroll}>
        <div className={styles.inner}>
          <MessageList messages={messages} />
          <div ref={bottomRef} aria-hidden="true" className={styles.bottomAnchor} />
        </div>
      </div>

      <MessageComposer onSend={handleSend} />
    </main>
  );
};

"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { MessageCard } from "../MessageCard";
import styles from "./MessageList.module.css";
import utilStyles from "@/utils/visuallyHidden.module.css";
import type { MessageListProps } from "./MessageList.types";
import type { Message } from "@/features/Chat/types";

const LIST_LABEL = "Message history";

const formatAnnouncement = (message: Message) =>
  `New message from ${message.author}: ${message.text}`;


export const MessageList = ({ messages }: MessageListProps) => {
  // Roving tabindex: only the active card is in the tab order; arrow keys move
  // focus between cards (the WhatsApp-style feed navigation).
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  const [announcement, setAnnouncement] = useState("");
  const seenIds = useRef<Set<string>>(new Set());
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      messages.forEach((message) => seenIds.current.add(message.id));
      return;
    }

    const newIncoming = messages.filter(
      (message) => !seenIds.current.has(message.id) && !message.isOutgoing,
    );
    messages.forEach((message) => seenIds.current.add(message.id));

    if (newIncoming.length > 0) {
      setAnnouncement(newIncoming.map(formatAnnouncement).join(". "));
    }
  }, [messages]);

  const focusCard = (index: number) => {
    const clamped = Math.max(0, Math.min(index, messages.length - 1));
    setActiveIndex(clamped);
    cardRefs.current[clamped]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusCard(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusCard(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusCard(0);
        break;
      case "End":
        event.preventDefault();
        focusCard(messages.length - 1);
        break;
    }
  };

  return (
    <>
      <div role="log" aria-live="polite" className={utilStyles.visuallyHidden}>
        {announcement}
      </div>
      <div className={styles.list} role="feed" aria-label={LIST_LABEL}>
        {messages.map((message, index) => (
          <MessageCard
            key={message.id}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            message={message}
            position={{ index: index + 1, total: messages.length }}
            tabIndex={index === activeIndex ? 0 : -1}
            onKeyDown={(event) => handleKeyDown(event, index)}
          />
        ))}
      </div>
    </>
  );
};

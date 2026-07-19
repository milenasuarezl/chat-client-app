import { useId } from "react";
import { formatTimestamp } from "@/lib/utils";
import styles from "./MessageCard.module.css";
import focusStyles from "@/utils/focusVisible.module.css";
import utilStyles from "@/utils/visuallyHidden.module.css";
import type { MessageCardProps } from "./MessageCard.types";

export function MessageCard({
  message,
  position,
  className,
  ref,
  ...rest
}: MessageCardProps) {
  const { author, text, timestamp, isOutgoing } = message;
  const senderId = useId();
  const sender = isOutgoing ? "You" : author;
  const variant = isOutgoing ? styles.own : styles.received;
  const classNames = [styles.card, variant, focusStyles.focusVisible, className]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      ref={ref}
      className={classNames}
      aria-labelledby={senderId}
      aria-posinset={position?.index}
      aria-setsize={position?.total}
      {...rest}
    >
      <p
        id={senderId}
        className={isOutgoing ? utilStyles.visuallyHidden : styles.author}
      >
        {sender}
      </p>
      <p className={styles.text}>{text}</p>
      <time className={styles.timestamp} dateTime={timestamp}>
        {formatTimestamp(timestamp)}
      </time>
    </article>
  );
}

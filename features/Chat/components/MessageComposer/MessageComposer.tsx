"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "./MessageComposer.module.css";
import type { MessageComposerProps } from "./MessageComposer.types";

const INPUT_LABEL = "Type a message";
const INPUT_PLACEHOLDER = "Message";
const SEND_LABEL = "Send";

/**
 * Bottom bar that lets the user write and send a message.
 * Client component: it owns the input state and handles submit.
 */
export const MessageComposer = ({ onSend }: MessageComposerProps) => {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;

    onSend(value.trim());
    setValue("");
  };

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <div className={styles.inputField}>
          <Input
            label={INPUT_LABEL}
            hideLabel
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={INPUT_PLACEHOLDER}
            autoComplete="off"
            enterKeyHint="send"
          />
        </div>
        <Button type="submit" disabled={!canSend}>
          {SEND_LABEL}
        </Button>
      </div>
    </form>
  );
};

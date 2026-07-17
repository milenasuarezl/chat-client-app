export type MessageComposerProps = {
  /** Invoked with the message text after it has been trimmed and validated as non-empty. */
  onSend: (text: string) => void;
};

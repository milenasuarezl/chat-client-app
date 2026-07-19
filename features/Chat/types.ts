export type Message = {
  /** Stable unique identifier. */
  id: string;
  /** Display name of the sender. */
  author: string;
  /** Message body. */
  text: string;
  /** ISO 8601 timestamp (UTC) for deterministic SSR/CSR rendering. */
  timestamp: string;
  /**
   * True when this message was sent by the current client/user, so it renders
   * as an outgoing (right-aligned) bubble. Derived from `author === CURRENT_USER`.
   */
  isOutgoing: boolean;
};

export type MessageResponse = {
  _id: string;
  message: string;
  author: string;
  createdAt: string;
};

export type GetMessagesParams = {
  /** Max messages to return (API default: 50). */
  limit?: number;
  /** Return messages created strictly after this ISO date (pagination). */
  after?: string;
  /** Return messages created strictly before this ISO date (pagination). */
  before?: string;
};

export type CreateMessageRequest = {
  message: string;
  author: string;
};

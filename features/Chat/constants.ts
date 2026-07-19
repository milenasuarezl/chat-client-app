/**
 * Identity used for outgoing messages. The challenge API has no concept of
 * users, so we tag our own messages with a single display name and treat any
 */
export const CURRENT_USER = "You";

export const DEFAULT_MESSAGE_LIMIT = 20;

/** Short-polling interval for SWR, in milliseconds. */
export const POLL_INTERVAL_MS = 3000;

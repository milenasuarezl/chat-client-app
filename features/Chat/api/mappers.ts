import { CURRENT_USER } from "../constants";
import type { Message, MessageResponse } from "../types";

/** Maps an API response into the domain `Message` the UI consumes. */
export const toMessage = (dto: MessageResponse): Message => ({
  id: dto._id,
  author: dto.author,
  text: dto.message,
  timestamp: dto.createdAt,
  isOutgoing: dto.author === CURRENT_USER,
});

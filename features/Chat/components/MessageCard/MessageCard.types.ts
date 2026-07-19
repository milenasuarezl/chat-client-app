import type { HTMLAttributes, Ref } from "react";
import type { Message } from "@/lib/types";

export type MessageCardProps = {
  message: Message;
  ref?: Ref<HTMLElement>;
  /**
   * This card's place in the feed, used to announce "message X of Y" to screen
   * readers. `index` is 1-based and maps to `aria-posinset`; `total` is the
   * number of messages and maps to `aria-setsize`.
   */
  position?: {
    index: number;
    total: number;
  };
} & Pick<HTMLAttributes<HTMLElement>, "tabIndex" | "onKeyDown" | "className">;

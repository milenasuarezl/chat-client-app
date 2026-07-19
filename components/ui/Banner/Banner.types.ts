import type { ReactNode } from "react";

export interface BannerAction {
  label: string;
  onClick: () => void;
}

export interface BannerProps {
  /** Visual + semantic tone. */
  tone?: "error" | "info";
  /** Message content. */
  children: ReactNode;
  /** Optional primary action, e.g. a "Retry" button. */
  action?: BannerAction;
  /** Optional dismiss handler; renders a close button when provided. */
  onDismiss?: () => void;
}

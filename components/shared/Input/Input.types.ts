import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Accessible name for screen readers (not the visual placeholder). */
  label: string;
  /** When true, the label stays available to assistive tech but is visually hidden. */
  hideLabel?: boolean;
}

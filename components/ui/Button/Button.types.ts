import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "solid" | "inverted" | "ghost";
export type ButtonSize = "md" | "sm" | "icon";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** Visual style. Defaults to the solid accent button. */
  variant?: ButtonVariant;
  /** Sizing preset. `icon` is for square, icon-only buttons. */
  size?: ButtonSize;
};

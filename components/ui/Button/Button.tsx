import styles from "./Button.module.css";
import focusStyles from "@/utils/focusVisible.module.css";
import type { ButtonProps } from "./Button.types";

export const Button = ({
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) => {
  const classNames = [styles.button, focusStyles.focusVisible, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classNames} {...rest}>
      {children}
    </button>
  );
};

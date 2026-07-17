import { useId } from "react";
import styles from "./Input.module.css";
import focusStyles from "@/utils/focusVisible.module.css";
import utilStyles from "@/utils/visuallyHidden.module.css";
import type { InputProps } from "./Input.types";

export const Input = ({
  label,
  hideLabel = false,
  id,
  className,
  ...rest
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const classNames = [styles.input, focusStyles.focusVisible, className]
    .filter(Boolean)
    .join(" ");
  const labelClassName = hideLabel ? utilStyles.visuallyHidden : styles.label;

  return (
    <div className={styles.root}>
      <label htmlFor={inputId} className={labelClassName}>
        {label}
      </label>
      <input id={inputId} className={classNames} {...rest} />
    </div>
  );
};

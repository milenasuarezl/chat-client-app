import { Button } from "@/components/ui/Button";
import styles from "./Banner.module.css";
import type { BannerProps } from "./Banner.types";

/**
 * Inline, dismissible notification for transient states (e.g. a failed poll or
 * a failed send). Uses `role="alert"` so assistive tech announces it as soon as
 * it appears.
 */
export const Banner = ({
  tone = "error",
  children,
  action,
  onDismiss,
}: BannerProps) => {
  return (
    <div className={`${styles.banner} ${styles[tone]}`} role="alert">
      <p className={styles.message}>{children}</p>

      <div className={styles.actions}>
        {action && (
          <Button variant="inverted" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            aria-label="Dismiss notification"
          >
            &times;
          </Button>
        )}
      </div>
    </div>
  );
};


// Re-export Sonner's toast API
import { toast as sonnerToast, Toast, ToastT } from "sonner";

// To maintain backward compatibility, we'll export a wrapped version
// that supports the old interface along with the new one
type ToastProps = ToastT & {
  variant?: "default" | "destructive" | "warning" | "success";
  title?: React.ReactNode;
  description?: React.ReactNode;
};

export const toast = Object.assign(
  (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast(props);
    }

    const { title, description, variant, ...restProps } = props;

    // Map variants to Sonner functions
    if (variant === "destructive") {
      return sonnerToast.error(title as string, {
        description,
        ...restProps,
      });
    } else if (variant === "warning") {
      return sonnerToast.warning(title as string, {
        description,
        ...restProps,
      });
    } else if (variant === "success") {
      return sonnerToast.success(title as string, {
        description,
        ...restProps,
      });
    }

    // Default case
    return sonnerToast(title as string, {
      description,
      ...restProps,
    });
  },
  {
    ...sonnerToast,
    // Add any additional methods for backward compatibility
  }
);

export type { Toast };

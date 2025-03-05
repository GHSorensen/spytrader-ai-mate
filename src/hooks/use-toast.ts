// Re-export Sonner's toast API with backward compatibility
import { toast as sonnerToast } from "sonner";
import type { ToastT, ExternalToast } from "sonner";
import { ReactNode } from "react";

// Our custom toast props extends Sonner's ToastT
export type ToastProps = {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive" | "warning" | "success";
  // Other props from Sonner's ToastT will be passed through
} & Omit<ExternalToast, "id">; // We omit id as it's optional in our implementation

// Create a wrapper function for our toast implementation
function createToast(props: ToastProps | string) {
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
}

// Create the toast object with all Sonner's methods
export const toast = Object.assign(createToast, {
  ...sonnerToast,
  success: sonnerToast.success,
  error: sonnerToast.error,
  warning: sonnerToast.warning,
  info: sonnerToast.info,
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
  custom: sonnerToast.custom,
  loading: sonnerToast.loading,
  message: sonnerToast.message
});

// Add a useToast hook for backward compatibility
export const useToast = () => {
  return {
    toast,
  };
};

export type { ToastT as Toast };


import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToastState = {
  toasts: ToasterToast[]
}

const state: ToastState = {
  toasts: [],
}

const listeners: ((state: ToastState) => void)[] = []

function notify(listeners: ((state: ToastState) => void)[]) {
  listeners.forEach((listener) => {
    listener({ ...state })
  })
}

function updateState(newState: ToastState) {
  state.toasts = newState.toasts
  notify(listeners)
}

export function useToast() {
  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId?: string) => {
      try {
        if (toastId) {
          updateState({
            toasts: state.toasts.map((t) =>
              t.id === toastId
                ? {
                    ...t,
                    open: false,
                  }
                : t
            ),
          })
        } else {
          updateState({
            toasts: state.toasts.map((t) => ({
              ...t,
              open: false,
            })),
          })
        }
      } catch (err) {
        console.error('Error dismissing toast:', err);
      }
    },
  }
}

export function toast({
  ...props
}: Omit<ToasterToast, "id"> & { id?: string }) {
  try {
    const id = props.id || String(Math.random())

    const update = (props: Omit<ToasterToast, "id">) => {
      updateState({
        toasts: state.toasts.map((t) =>
          t.id === id
            ? { ...t, ...props }
            : t
        ),
      })
      return id
    }

    const dismiss = () => {
      updateState({
        toasts: state.toasts.map((t) =>
          t.id === id
            ? { ...t, open: false }
            : t
        ),
      })
    }

    updateState({
      toasts: [
        {
          ...props,
          id,
          open: true,
          onOpenChange: (open) => {
            if (!open) dismiss()
          },
        },
        ...state.toasts.filter((t) => t.id !== id),
      ].slice(0, TOAST_LIMIT),
    })

    return {
      id,
      dismiss,
      update,
    }
  } catch (err) {
    console.error('Error creating toast:', err);
    return {
      id: String(Math.random()),
      dismiss: () => {},
      update: () => String(Math.random()),
    }
  }
}

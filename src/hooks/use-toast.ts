
// This is your toast hook implementation
import { useState, useEffect, useCallback } from 'react'

const TOAST_TIMEOUT = 5000

export type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'destructive' | 'success' | 'warning'
}

type ToastActionType = {
  add: (toast: Omit<ToastProps, "id">) => string
  remove: (id: string) => void
  update: (id: string, toast: Partial<ToastProps>) => void
}

let count = 0

function generateId() {
  return `${++count}`
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const add = useCallback(
    (toast: Omit<ToastProps, "id">) => {
      const id = generateId()

      setToasts((toasts) => [
        ...toasts,
        { ...toast, id },
      ])

      return id
    },
    []
  )

  const remove = useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }, [])

  const update = useCallback((id: string, toast: Partial<ToastProps>) => {
    setToasts((toasts) =>
      toasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
    )
  }, [])

  return {
    toasts,
    add,
    remove,
    update,
  }
}

type ToastFunction = {
  (props: Omit<ToastProps, "id">): string
  success: (props: Omit<ToastProps, "id" | "variant">) => string
  error: (props: Omit<ToastProps, "id" | "variant">) => string
  warning: (props: Omit<ToastProps, "id" | "variant">) => string
}

const toastFunction = ((props) => {
  return window.toast?.add(props) || ""
}) as ToastFunction

toastFunction.success = (props) => {
  return toastFunction({ ...props, variant: "success" })
}

toastFunction.error = (props) => {
  return toastFunction({ ...props, variant: "destructive" })
}

toastFunction.warning = (props) => {
  return toastFunction({ ...props, variant: "warning" })
}

declare global {
  interface Window {
    toast?: ToastActionType
  }
}

export const toast = toastFunction

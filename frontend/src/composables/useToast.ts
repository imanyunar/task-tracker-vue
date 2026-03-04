import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
  duration: number
}

// Singleton state — satu instance untuk seluruh app
const toasts = ref<Toast[]>([])
let nextId = 0

function addToast(type: ToastType, message: string, duration = 3500) {
  const id = ++nextId
  toasts.value.push({ id, type, message, duration })
  setTimeout(() => removeToast(id), duration)
}

function removeToast(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export function useToast() {
  return {
    toasts,
    removeToast,
    success: (message: string, duration?: number) => addToast('success', message, duration),
    error:   (message: string, duration?: number) => addToast('error',   message, duration),
    warning: (message: string, duration?: number) => addToast('warning', message, duration),
    info:    (message: string, duration?: number) => addToast('info',    message, duration),
  }
}
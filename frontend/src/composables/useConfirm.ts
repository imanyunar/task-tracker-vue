import { ref } from 'vue'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

// Singleton state
const visible   = ref(false)
const options   = ref<ConfirmOptions>({ message: '' })
let resolveFn: ((val: boolean) => void) | null = null

export function useConfirm() {
  const confirm = (opts: ConfirmOptions | string): Promise<boolean> => {
    options.value = typeof opts === 'string' ? { message: opts } : opts
    visible.value = true
    return new Promise((resolve) => {
      resolveFn = resolve
    })
  }

  const onConfirm = () => {
    visible.value = false
    resolveFn?.(true)
    resolveFn = null
  }

  const onCancel = () => {
    visible.value = false
    resolveFn?.(false)
    resolveFn = null
  }

  return { confirm, visible, options, onConfirm, onCancel }
}
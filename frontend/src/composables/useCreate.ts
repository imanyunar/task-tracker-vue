import { ref, reactive } from 'vue'
import apiClient from '@/services/api'
import { useToast } from '@/composables/useToast'

// POST /{endpoint}
// const { form, submitting, submit } = useCreate<Project>('projects', {
//   initial:    { name: '', status: 'planned' },
//   successMsg: 'Proyek berhasil dibuat!',
//   onSuccess:  (created) => router.push(`/projects/${created.id}`),
// })
//
// Multipart: useCreate('profile/avatar', { multipart: true })

export function useCreate<T = any, F extends Record<string, any> = Record<string, any>>(
  endpoint: string,
  options: {
    initial?: F
    successMsg?: string
    errorMsg?: string
    multipart?: boolean
    onSuccess?: (result: T) => void
    resetAfter?: boolean
  } = {}
) {
  const toast      = useToast()
  const form       = reactive<F>({ ...(options.initial ?? {}) } as F)
  const submitting = ref(false)
  const error      = ref<string | null>(null)

  const submit = async (overridePayload?: Partial<F>) => {
    submitting.value = true
    error.value      = null
    try {
      const payload = overridePayload ?? { ...form }
      let res

      if (options.multipart) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v as any)
        })
        res = await apiClient.post(`/${endpoint}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        res = await apiClient.post(`/${endpoint}`, payload)
      }

      const result = (res.data?.data ?? res.data) as T
      if (options.successMsg) toast.success(options.successMsg)
      if (options.resetAfter !== false && options.initial) Object.assign(form, options.initial)
      options.onSuccess?.(result)
      return result
    } catch (err: any) {
      const msg = options.errorMsg ?? err?.response?.data?.message ?? 'Gagal menyimpan data.'
      error.value = msg
      toast.error(msg)
      return null
    } finally {
      submitting.value = false
    }
  }

  const reset = () => { if (options.initial) Object.assign(form, options.initial) }

  return { form, submitting, error, submit, reset }
}
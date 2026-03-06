import { ref, reactive } from 'vue'
import apiClient from '@/services/api'
import { useToast } from '@/composables/useToast'

// PUT /{endpoint}/{id?}
// const { form, submitting, submit, fill } = useUpdate<Project>('projects', {
//   successMsg: 'Proyek berhasil diperbarui!',
//   onSuccess:  (updated) => Object.assign(project, updated),
// })
// fill(project)           // isi form dari data existing
// await submit(project.id)
//
// Tanpa ID (PUT /profile): await submit()

export function useUpdate<T = any, F extends Record<string, any> = Record<string, any>>(
  endpoint: string,
  options: {
    initial?: F
    successMsg?: string
    errorMsg?: string
    method?: 'put' | 'patch'
    onSuccess?: (result: T) => void
  } = {}
) {
  const toast      = useToast()
  const method     = options.method ?? 'put'
  const form       = reactive<F>({ ...(options.initial ?? {}) } as F)
  const submitting = ref(false)
  const error      = ref<string | null>(null)

  const submit = async (id?: number | string, overridePayload?: Partial<F>) => {
    submitting.value = true
    error.value      = null
    try {
      const url     = id !== undefined ? `/${endpoint}/${id}` : `/${endpoint}`
      const payload = overridePayload ?? { ...form }
      const res     = await apiClient[method](url, payload)
      const result  = (res.data?.data ?? res.data) as T
      if (options.successMsg) toast.success(options.successMsg)
      options.onSuccess?.(result)
      return result
    } catch (err: any) {
      const msg = options.errorMsg ?? err?.response?.data?.message ?? 'Gagal menyimpan perubahan.'
      error.value = msg
      toast.error(msg)
      return null
    } finally {
      submitting.value = false
    }
  }

  const fill  = (data: Partial<F>) => Object.assign(form, data)
  const reset = () => { if (options.initial) Object.assign(form, options.initial) }

  return { form, submitting, error, submit, fill, reset }
}
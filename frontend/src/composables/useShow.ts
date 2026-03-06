import { ref } from 'vue'
import apiClient from '@/services/api'
import { useToast } from '@/composables/useToast'

// GET /{endpoint}/{id}
// const { item, loading, fetch } = useShow<Project>('projects')
// await fetch(projectId)
//
// Auto-fetch: useShow<User>('users', { id: userId })

export function useShow<T = any>(
  endpoint: string,
  options: {
    id?: number | string
    transform?: (raw: any) => T
    onError?: () => void
  } = {}
) {
  const toast   = useToast()
  const item    = ref<T | null>(null)
  const loading = ref(false)
  const error   = ref<string | null>(null)

  const fetch = async (id: number | string) => {
    loading.value = true
    error.value   = null
    try {
      const res  = await apiClient.get(`/${endpoint}/${id}`)
      const raw  = res.data?.data ?? res.data
      item.value = options.transform ? options.transform(raw) : (raw as T)
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? 'Data tidak ditemukan.'
      toast.error(error.value!)
      options.onError?.()
    } finally {
      loading.value = false
    }
  }

  if (options.id !== undefined) fetch(options.id)

  return { item, loading, error, fetch }
}
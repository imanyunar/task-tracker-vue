import { ref, computed } from 'vue'
import apiClient from '@/services/api'
import { useToast } from '@/composables/useToast'

// GET /{endpoint}
// const { items, loading, fetch } = useList<Project>('projects')
// const { items, loading, fetch } = useList<User>('users', { immediate: false })

export function useList<T = any>(
  endpoint: string,
  options: {
    immediate?: boolean
    transform?: (raw: any) => T[]
    params?: Record<string, any>
  } = {}
) {
  const toast   = useToast()
  const items   = ref<T[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)
  const isEmpty = computed(() => !loading.value && items.value.length === 0)

  const fetch = async (params?: Record<string, any>) => {
    loading.value = true
    error.value   = null
    try {
      const res  = await apiClient.get(`/${endpoint}`, {
        params: { ...options.params, ...params },
      })
      const raw  = res.data?.data ?? res.data
      const list = Array.isArray(raw) ? raw : []
      items.value = options.transform ? options.transform(list) : (list as T[])
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? 'Gagal memuat data.'
      toast.error(error.value!)
    } finally {
      loading.value = false
    }
  }

  if (options.immediate !== false) fetch()

  return { items, loading, error, isEmpty, fetch }
}
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

  // ========== PAGINATION FUNCTIONALITY ==========
  // Extended for pagination support
  // Usage: const { items, loading, fetch, pagination } = useList('attachments')
  // pagination: { page, perPage, total, lastPage }
  
  const pagination = ref({
    page: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
  })

  const fetchPaginated = async (params?: Record<string, any>) => {
    loading.value = true
    error.value   = null
    try {
      const res = await apiClient.get(`/${endpoint}`, {
        params: { 
          page: pagination.value.page,
          per_page: pagination.value.perPage,
          ...options.params, 
          ...params 
        },
      })
      
      const raw = res.data?.data ?? res.data
      
      // Handle pagination response
      if (res.data?.meta) {
        items.value = res.data.data || []
        pagination.value = {
          page: res.data.meta.current_page || 1,
          perPage: res.data.meta.per_page || 15,
          total: res.data.meta.total || 0,
          lastPage: res.data.meta.last_page || 1,
        }
      } else {
        const list = Array.isArray(raw) ? raw : []
        items.value = options.transform ? options.transform(list) : (list as T[])
      }
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? 'Gagal memuat data.'
      toast.error(error.value!)
    } finally {
      loading.value = false
    }
  }

  const setPage = (page: number) => {
    pagination.value.page = page
    fetchPaginated()
  }

  const nextPage = () => {
    if (pagination.value.page < pagination.value.lastPage) {
      setPage(pagination.value.page + 1)
    }
  }

  const prevPage = () => {
    if (pagination.value.page > 1) {
      setPage(pagination.value.page - 1)
    }
  }

  return { 
    items, 
    loading, 
    error, 
    isEmpty, 
    fetch, 
    fetchPaginated,
    pagination,
    setPage,
    nextPage,
    prevPage,
  }
}

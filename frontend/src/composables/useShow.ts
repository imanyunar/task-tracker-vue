import { ref } from 'vue'
import apiClient from '@/services/api'
import { useToast } from '@/composables/useToast'

// GET /{endpoint}/{id}
// const { item, loading, fetch } = useShow<Project>('projects')
// await fetch(projectId)
//
// Auto-fetch: useShow<User>('users', { id: userId })
//
// File/Download: useShow('attachments')
// const { download, downloading } = useShow('tasks/files')

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

  // ========== FILE DOWNLOAD FUNCTIONALITY ==========
  // Extended for file download operations
  // Usage: const { download, downloading } = useShow('attachments')
  // await download(fileId, 'filename.pdf')
  
  const downloading = ref(false)
  const downloadError = ref<string | null>(null)

  const download = async (id: number | string, filename?: string) => {
    downloading.value = true
    downloadError.value = null
    try {
      const res = await apiClient.get(`/${endpoint}/${id}/download`, {
        responseType: 'blob',
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename || `file-${id}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('File berhasil didownload!')
      return true
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Gagal mendownload file.'
      downloadError.value = msg
      toast.error(msg)
      return false
    } finally {
      downloading.value = false
    }
  }

  // Get file URL for viewing
  const getFileUrl = (id: number | string) => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/${endpoint}/${id}`
  }

  return { item, loading, error, fetch, download, downloading, downloadError, getFileUrl }
}

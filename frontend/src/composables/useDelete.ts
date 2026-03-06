import { ref } from 'vue'
import apiClient from '@/services/api'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'

// DELETE /{endpoint}/{id}
// const { remove } = useDelete('projects', {
//   confirmMessage: 'Hapus proyek ini secara permanen?',
//   confirmText:    'Hapus Permanen',
//   successMsg:     'Proyek berhasil dihapus.',
//   onSuccess:      (id) => projects.value = projects.value.filter(p => p.id !== id),
// })
// await remove(projectId)
//
// Skip confirm:   await remove(id, { skipConfirm: true })
// Nested:         useDelete(`projects/${projectId}/members`)

export function useDelete(
  endpoint: string,
  options: {
    successMsg?: string
    errorMsg?: string
    confirmMessage?: string
    confirmTitle?: string
    confirmType?: 'danger' | 'warning' | 'info'
    confirmText?: string
    onSuccess?: (id: number | string) => void
  } = {}
) {
  const toast       = useToast()
  const { confirm } = useConfirm()
  const deleting    = ref(false)
  const error       = ref<string | null>(null)

  const remove = async (
    id: number | string,
    overrides: { skipConfirm?: boolean; confirmMessage?: string } = {}
  ) => {
    if (!overrides.skipConfirm) {
      const ok = await confirm({
        title:       options.confirmTitle   ?? 'Konfirmasi Hapus',
        message:     overrides.confirmMessage ?? options.confirmMessage ?? 'Hapus data ini secara permanen?',
        type:        options.confirmType    ?? 'danger',
        confirmText: options.confirmText    ?? 'Hapus',
      })
      if (!ok) return false
    }

    deleting.value = true
    error.value    = null
    try {
      await apiClient.delete(`/${endpoint}/${id}`)
      toast.success(options.successMsg ?? 'Data berhasil dihapus.')
      options.onSuccess?.(id)
      return true
    } catch (err: any) {
      const msg = options.errorMsg ?? err?.response?.data?.message ?? 'Gagal menghapus data.'
      error.value = msg
      toast.error(msg)
      return false
    } finally {
      deleting.value = false
    }
  }

  return { remove, deleting, error }
}
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
// File delete:    await remove(fileId, { skipConfirm: true })

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

  // ========== BATCH DELETE FUNCTIONALITY ==========
  // Delete multiple items at once
  // Usage: const { removeBatch } = useDelete('attachments')
  // await removeBatch([1, 2, 3])
  
  const removeBatch = async (
    ids: (number | string)[],
    overrides: { skipConfirm?: boolean; confirmMessage?: string } = {}
  ) => {
    if (!overrides.skipConfirm) {
      const ok = await confirm({
        title:       'Konfirmasi Hapus Massal',
        message:     overrides.confirmMessage ?? `Hapus ${ids.length} item secara permanen?`,
        type:        options.confirmType    ?? 'danger',
        confirmText: options.confirmText    ?? 'Hapus Semua',
      })
      if (!ok) return false
    }

    deleting.value = true
    error.value    = null
    const results: boolean[] = []

    try {
      for (const id of ids) {
        await apiClient.delete(`/${endpoint}/${id}`)
        results.push(true)
      }
      toast.success(`${ids.length} item berhasil dihapus.`)
      options.onSuccess?.(ids as any)
      return true
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Gagal menghapus beberapa item.'
      error.value = msg
      toast.error(msg)
      return false
    } finally {
      deleting.value = false
    }
  }

  return { remove, removeBatch, deleting, error }
}

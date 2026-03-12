import { ref } from 'vue'
import apiClient from '@/services/api'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'

// PATCH /{endpoint}/{id}/{action}
// Handles two-state status toggling (e.g. activate / deactivate) for any resource.
//
// Basic:
//   const { deactivate, activate, togglingId } = useToggleStatus('users', {
//     isActive:   (emp) => emp.is_active,
//     deactivate: {
//       action:     'deactivate',
//       confirm:    { title: 'Nonaktifkan', message: (r) => `Nonaktifkan ${r.name}?`, type: 'warning', confirmText: 'Nonaktifkan' },
//       successMsg: (r) => `${r.name} berhasil dinonaktifkan.`,
//       errorMsg:   'Gagal menonaktifkan.',
//     },
//     activate: {
//       action:     'restore',
//       successMsg: (r) => `${r.name} berhasil diaktifkan.`,
//       errorMsg:   'Gagal mengaktifkan.',
//     },
//     onSuccess: () => fetchEmployees(),
//   })
//
// Auto-route based on isActive predicate:
//   await toggle(employee)      // calls deactivate or activate automatically
//
// Or call each branch directly:
//   await deactivate(employee)
//   await activate(employee)
//
// Static message (no function needed):
//   successMsg: 'Berhasil dinonaktifkan.'
//
// No confirm dialog on a branch — just omit the confirm key.

type MsgOrFn   = string | ((record: any) => string)
const resolve  = (v: MsgOrFn | undefined, record: any, fallback: string): string =>
  typeof v === 'function' ? v(record) : (v ?? fallback)

export interface ToggleBranchOptions {
  /** Path segment appended after the id: PATCH /{endpoint}/{id}/{action} */
  action:      string
  confirm?: {
    title?:       MsgOrFn
    message?:     MsgOrFn
    type?:        'danger' | 'warning' | 'info'
    confirmText?: string
  }
  successMsg?: MsgOrFn
  errorMsg?:   MsgOrFn
}

export function useToggleStatus(
  endpoint: string,
  options: {
    deactivate: ToggleBranchOptions
    activate:   ToggleBranchOptions
    /** Return true when the record is currently active (should deactivate on toggle). */
    isActive:   (record: any) => boolean
    onSuccess?: (record: any, action: 'activate' | 'deactivate') => void
  }
) {
  const toast       = useToast()
  const { confirm } = useConfirm()
  const togglingId  = ref<number | string | null>(null)

  const runBranch = async (
    record:    any,
    branch:    ToggleBranchOptions,
    actionKey: 'activate' | 'deactivate'
  ): Promise<boolean> => {
    if (branch.confirm) {
      const ok = await confirm({
        title:       resolve(branch.confirm.title,   record, 'Konfirmasi'),
        message:     resolve(branch.confirm.message, record, 'Lanjutkan?'),
        type:        branch.confirm.type        ?? 'warning',
        confirmText: branch.confirm.confirmText ?? 'Lanjutkan',
      })
      if (!ok) return false
    }

    togglingId.value = record.id
    try {
      await apiClient.patch(`/${endpoint}/${record.id}/${branch.action}`)
      toast.success(resolve(branch.successMsg, record, 'Berhasil.'))
      options.onSuccess?.(record, actionKey)
      return true
    } catch {
      toast.error(resolve(branch.errorMsg, record, 'Gagal memproses permintaan.'))
      return false
    } finally {
      togglingId.value = null
    }
  }

  const deactivate = (record: any) => runBranch(record, options.deactivate, 'deactivate')
  const activate   = (record: any) => runBranch(record, options.activate,   'activate')

  /** Auto-routes based on isActive predicate. */
  const toggle = (record: any) =>
    options.isActive(record) ? deactivate(record) : activate(record)

  return { toggle, deactivate, activate, togglingId }
}
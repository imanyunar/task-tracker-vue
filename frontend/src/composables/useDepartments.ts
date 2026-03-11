import { ref, reactive, computed } from 'vue'
import { useList } from '@/composables/useList'
import { useCreate } from '@/composables/useCreate'
import { useUpdate } from '@/composables/useUpdate'
import { useDelete } from '@/composables/useDelete'

export function useDepartments() {
  // 1. Fetching Data
  const { items: departments, loading, fetch: fetchDepartments } = useList<any>('departments', { immediate: true })

  const totalEmployees = computed(() =>
    departments.value.reduce((sum: number, d: any) => sum + (d.users_count ?? d.users?.length ?? 0), 0)
  )

  // 2. CRUD Logic
  const creator = useCreate('departments', {
    initial: { name: '', description: '' },
    successMsg: 'Departemen berhasil dibuat.',
    onSuccess: () => { fetchDepartments(); closeModal() }
  })

  const updater = useUpdate('departments', {
    successMsg: 'Departemen berhasil diperbarui.',
    onSuccess: () => { fetchDepartments(); closeModal() }
  })

  const { remove: deleteDepartment } = useDelete('departments', {
    confirmTitle: 'Hapus Departemen',
    confirmMessage: 'Hapus departemen ini? Pastikan tidak ada karyawan yang terdaftar.',
    confirmText: 'Hapus',
    successMsg: 'Departemen berhasil dihapus.',
    onSuccess: () => fetchDepartments()
  })

  // 3. UI States
  const showModal = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)
  const submitting = computed(() => creator.submitting.value || updater.submitting.value)

  // 4. Single reactive formData — disinkronkan secara manual ke creator/updater
  const formData = reactive({
    name: '',
    description: '',
  })

  const openCreateModal = () => {
    isEditing.value = false
    editingId.value = null
    // Reset form
    formData.name = ''
    formData.description = ''
    creator.reset()
    showModal.value = true
  }

  const openEditModal = (dept: any) => {
    isEditing.value = true
    editingId.value = dept.id
    // Isi form dengan data existing
    formData.name = dept.name ?? ''
    formData.description = dept.description ?? ''
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
  }

  const submitDepartment = async () => {
    if (isEditing.value && editingId.value) {
      // Sinkronkan formData ke updater.form sebelum submit
      updater.fill({ name: formData.name, description: formData.description })
      await updater.submit(editingId.value)
    } else {
      // Sinkronkan formData ke creator.form sebelum submit
      Object.assign(creator.form, { name: formData.name, description: formData.description })
      await creator.submit()
    }
  }

  return {
    departments,
    loading,
    totalEmployees,

    showModal,
    isEditing,
    submitting,
    formData,

    openCreateModal,
    openEditModal,
    closeModal,
    submitDepartment,
    deleteDepartment,
  }
}
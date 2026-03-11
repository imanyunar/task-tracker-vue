import { ref, reactive, computed, onMounted } from "vue"
import { useAuthStore } from "../stores/auth"
import { useList } from "@/composables/useList"
import { useDelete } from "@/composables/useDelete"
import { useToast } from "@/composables/useToast"
import { useConfirm } from "@/composables/useConfirm"
import apiClient from "@/services/api"

export function useEmployees() {

  const authStore = useAuthStore()
  const toast = useToast()
  const { confirm } = useConfirm()

  const currentUser = computed(() => authStore.user)
  const isAdmin = computed(() => currentUser.value?.role_id === 1)

  const roleConfig: Record<number, { label: string; class: string }> = {
    1: { label: "Admin",    class: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
    2: { label: "Manager",  class: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
    3: { label: "Employee", class: "text-slate-400 border-slate-600 bg-slate-800/50" },
  }

  const filterTabs = [
    { label: "Semua",    value: "all" },
    { label: "Aktif",    value: "active" },
    { label: "Nonaktif", value: "inactive" },
  ]

  // ── Data ──────────────────────────────────────────────────────────────────
  const employees = ref<any[]>([])
  const loading   = ref(false)

  const { items: departments, fetch: fetchDepartments } =
    useList<any>("departments", { immediate: false })

  const fetchEmployees = async () => {
    loading.value = true
    try {
      const res = await apiClient.get("/users", { params: { with_inactive: 1 } })
      employees.value = res.data?.data ?? res.data
    } catch {
      toast.error("Gagal memuat data karyawan.")
    } finally {
      loading.value = false
    }
  }

  // ── Filter & Search ───────────────────────────────────────────────────────
  const searchQuery  = ref("")
  const filterStatus = ref("all")

  const filteredEmployees = computed(() => {
    let list = employees.value

    if (filterStatus.value === "active")   list = list.filter(e => e.is_active)
    if (filterStatus.value === "inactive") list = list.filter(e => !e.is_active)

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(
        e =>
          e.name?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q)
      )
    }

    return list
  })

  const activeCount   = computed(() => employees.value.filter(e =>  e.is_active).length)
  const inactiveCount = computed(() => employees.value.filter(e => !e.is_active).length)

  // ── Toggle Status ─────────────────────────────────────────────────────────
  const togglingId = ref<number | null>(null)

  const deactivateEmployee = async (emp: any) => {
    const ok = await confirm({
      title:       "Nonaktifkan Karyawan",
      message:     `Nonaktifkan akun ${emp.name}?`,
      type:        "warning",
      confirmText: "Nonaktifkan",
    })
    if (!ok) return

    togglingId.value = emp.id
    try {
      await apiClient.patch(`/users/${emp.id}/deactivate`)
      toast.success(`${emp.name} berhasil dinonaktifkan.`)
      await fetchEmployees()
    } catch {
      toast.error("Gagal menonaktifkan karyawan.")
    } finally {
      togglingId.value = null
    }
  }

  const restoreEmployee = async (emp: any) => {
    togglingId.value = emp.id
    try {
      await apiClient.patch(`/users/${emp.id}/restore`)
      toast.success(`${emp.name} berhasil diaktifkan kembali.`)
      await fetchEmployees()
    } catch {
      toast.error("Gagal mengaktifkan karyawan.")
    } finally {
      togglingId.value = null
    }
  }

  // ── Delete Permanen ───────────────────────────────────────────────────────
  const { remove: deleteEmployee } = useDelete("users", {
    confirmTitle:   "Hapus Permanen",
    confirmMessage: "Hapus karyawan ini secara permanen?",
    confirmText:    "Hapus Permanen",
    successMsg:     "Karyawan berhasil dihapus.",
    onSuccess:      () => fetchEmployees(),
  })

  // ── Modal & Form ──────────────────────────────────────────────────────────
  const showModal  = ref(false)
  const isEditing  = ref(false)
  const submitting = ref(false)
  const editingId  = ref<number | null>(null)

  const formData = reactive({
    name:          "",
    email:         "",
    password:      "",
    department_id: "" as any,
    role_id:       3  as any,
  })

  const openCreateModal = () => {
    isEditing.value = false
    editingId.value = null
    Object.assign(formData, {
      name: "", email: "", password: "", department_id: "", role_id: 3,
    })
    showModal.value = true
  }

  const openEditModal = (emp: any) => {
    isEditing.value = true
    editingId.value = emp.id
    Object.assign(formData, {
      name:          emp.name,
      email:         emp.email,
      password:      "",
      department_id: emp.department?.id ?? emp.department_id,
      role_id:       emp.role_id,
    })
    showModal.value = true
  }

  const closeModal = () => { showModal.value = false }

  const submitEmployee = async () => {
    submitting.value = true
    try {
      if (isEditing.value && editingId.value) {
        const payload: any = {
          name:          formData.name,
          email:         formData.email,
          department_id: formData.department_id,
          role_id:       formData.role_id,
        }
        if (formData.password) payload.password = formData.password

        await apiClient.put(`/users/${editingId.value}`, payload)
        toast.success("Data karyawan berhasil diperbarui.")
      } else {
        await apiClient.post("/users", formData)
        toast.success("Karyawan berhasil ditambahkan.")
      }

      await fetchEmployees()
      closeModal()
    } catch {
      toast.error("Gagal memproses data.")
    } finally {
      submitting.value = false
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMounted(async () => {
    await Promise.all([fetchEmployees(), fetchDepartments()])
  })

  // ── Return ────────────────────────────────────────────────────────────────
  return {
    currentUser,
    isAdmin,

    employees,
    filteredEmployees,
    loading,

    searchQuery,
    filterStatus,
    filterTabs,

    activeCount,
    inactiveCount,

    roleConfig,

    deactivateEmployee,
    restoreEmployee,
    deleteEmployee,

    togglingId,

    showModal,
    isEditing,
    submitting,
    formData,

    openCreateModal,
    openEditModal,
    closeModal,
    submitEmployee,

    departments,
  }
}
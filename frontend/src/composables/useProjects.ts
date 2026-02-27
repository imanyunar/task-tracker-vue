import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProjectStore } from '../stores/project'
import apiClient from '../services/api'

// ===== TYPES =====
export interface Project {
  id: number
  name: string
  description: string
  progress: number
  status?: 'planned' | 'on_progress' | 'completed'
  my_role_id: number
  created_by: number
  created_at: string
  updated_at: string
  start_date?: string
  end_date?: string
  department_id?: number
  department?: { id: number; name: string }
  members?: Member[]
  tasks?: Task[]
}

export interface Member {
  id: number
  name: string
  email: string
  pivot?: {
    role_in_project: number
  }
}

export interface Task {
  id: number
  name?: string
  title?: string
  status: string
  project_id: number
  user?: { name: string }
}

export interface Department {
  id: number
  name: string
}

export interface User {
  id: number
  name: string
  email: string
  role_id: number
  dept_id: number
  department?: { id: number; name: string }
}

export interface FormData {
  id: number | undefined
  name: string
  description: string
  start_date: string
  end_date: string
  status: 'planned' | 'on_progress' | 'completed'
  department_id: number | undefined
}

// ===== CONFIGS =====
export const roleConfig: Record<number, { label: string; class: string }> = {
  1: { label: 'Owner',       class: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  2: { label: 'Manager',     class: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  3: { label: 'Contributor', class: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  4: { label: 'Stakeholder', class: 'text-slate-400 border-slate-600 bg-slate-800/50' },
}

export const statusConfig: Record<string, { label: string; class: string }> = {
  planned:     { label: 'Planned',     class: 'bg-slate-700/40 text-slate-300 border-slate-600' },
  on_progress: { label: 'On Progress', class: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  completed:   { label: 'Completed',   class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

export const STATUS_KEYS = ['planned', 'on_progress', 'completed'] as const

// ===== COMPOSABLE =====
export function useProjects() {
  const authStore = useAuthStore()
  const projectStore = useProjectStore()
  const router = useRouter()

  // ===== STATE =====
  const loading = ref(false)
  const searchQuery = ref('')
  const currentPage = ref(1)
  const departments = ref<Department[]>([])

  // Modal create/edit
  const showModal = ref(false)
  const isEditing = ref(false)
  const isSubmitting = ref(false)
  const formData = reactive<FormData>({
    id: undefined,
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'planned',
    department_id: undefined,
  })

  // Modal detail
  const showDetailsModal = ref(false)
  const activeTab = ref<'tasks' | 'members'>('tasks')
  const selectedProject = ref<Project | null>(null)
  const projectTasks = ref<Task[]>([])
  const projectMembers = ref<Member[]>([])

  // Member management
  const availableUsers = ref<User[]>([])
  const newMemberId = ref<number | ''>('')
  const newMemberRole = ref<number>(3)
  const isAddingMember = ref(false)

  // ===== COMPUTED =====
  const user = computed(() => authStore.user as User | null)
  const projects = computed<Project[]>(() => (projectStore.projects as Project[]) || [])
  const canManageGlobal = computed(() => user.value?.role_id === 1 || user.value?.role_id === 2)

  // Pagination: gunakan type assertion karena store mungkin tidak expose pagination di TypeScript
  const pagination = computed(() => (projectStore as unknown as { pagination?: { current_page: number; last_page: number } }).pagination)
  const hasMore = computed(() => (pagination.value?.current_page ?? 0) < (pagination.value?.last_page ?? 0))

  const filteredProjects = computed<Project[]>(() =>
    projects.value.filter(p =>
      p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  )

  const completedCount = computed(() => filteredProjects.value.filter(p => p.status === 'completed').length)
  const activeCount = computed(() => filteredProjects.value.filter(p => p.status === 'on_progress').length)
  const plannedCount = computed(() => filteredProjects.value.filter(p => p.status === 'planned' || !p.status).length)

  // ===== LIFECYCLE =====
  onMounted(async () => {
    await loadProjects(1)
    if (canManageGlobal.value) {
      loadAllUsers()
      loadDepartments()
    }
  })

  // ===== METHODS: DATA FETCHING =====
  const loadProjects = async (page = 1) => {
    loading.value = true
    try {
      await projectStore.fetchProjects(page)
      currentPage.value = page
    } catch (err) {
      console.error('Fetch Error:', err)
    } finally {
      loading.value = false
    }
  }

  const loadDepartments = async () => {
    if (user.value?.role_id !== 1) return
    try {
      const res = await apiClient.get('/departments')
      departments.value = res.data.data || res.data || []
    } catch (err) {
      console.error(err)
    }
  }

  const loadAllUsers = async () => {
    try {
      const res = await apiClient.get('/users')
      availableUsers.value = res.data.data || res.data || []
    } catch (err) {
      console.error(err)
    }
  }

  const loadMore = async () => {
    if (hasMore.value && !loading.value) await loadProjects(currentPage.value + 1)
  }

  // ===== METHODS: MODAL CREATE/EDIT =====
  const openCreateModal = () => {
    isEditing.value = false
    Object.assign(formData, {
      id: undefined,
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'planned',
      department_id: user.value?.role_id === 1 ? undefined : user.value?.dept_id,
    })
    showModal.value = true
  }

  const openEditModal = (project: Project) => {
    isEditing.value = true
    Object.assign(formData, {
      id: project.id,
      name: project.name,
      description: project.description,
      start_date: project.start_date ? project.start_date.substring(0, 10) : '',
      end_date: project.end_date ? project.end_date.substring(0, 10) : '',
      status: project.status ?? 'planned',
      department_id: project.department_id,
    })
    showModal.value = true
  }

  const closeModal = () => { showModal.value = false }

  const submitProject = async () => {
    isSubmitting.value = true
    try {
      // Buat payload tanpa id: null agar tidak error type
      const { id, ...payload } = formData
      if (isEditing.value && id !== undefined) {
        await projectStore.updateProject(id, payload)
      } else {
        await projectStore.createProject(payload)
      }
      await loadProjects(1)
      closeModal()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      alert(error.response?.data?.message || 'Gagal memproses data.')
    } finally {
      isSubmitting.value = false
    }
  }

  const confirmDelete = async (id: number) => {
    if (!confirm('Hapus proyek ini secara permanen?')) return
    try {
      await projectStore.deleteProject(id)
      await loadProjects(1)
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus.')
    }
  }

  // ===== METHODS: MODAL DETAIL =====
  const openDetails = async (project: Project) => {
    selectedProject.value = project
    activeTab.value = 'tasks'
    showDetailsModal.value = true
    projectTasks.value = []
    projectMembers.value = []
    try {
      const [detailRes, taskRes] = await Promise.all([
        apiClient.get(`/projects/${project.id}`),
        apiClient.get('/tasks'),
      ])
      const detailData: Project = detailRes.data.data || detailRes.data
      projectMembers.value = detailData.members || []
      const allTasks: Task[] = taskRes.data.data || taskRes.data || []
      projectTasks.value = allTasks.filter((t: Task) => t.project_id === project.id)
    } catch (err) {
      console.error(err)
    }
  }

  const closeDetailsModal = () => { showDetailsModal.value = false }

  const goToWorkspace = (projectId: number) => {
    router.push({ name: 'ProjectDetail', params: { id: String(projectId) } })
  }

  // ===== METHODS: MEMBER MANAGEMENT =====
  const addMember = async () => {
    if (!newMemberId.value || !selectedProject.value) return
    isAddingMember.value = true
    try {
      await apiClient.post(`/projects/${selectedProject.value.id}/members`, {
        user_id: newMemberId.value,
        role_in_project: Number(newMemberRole.value),
      })
      const detailRes = await apiClient.get(`/projects/${selectedProject.value.id}`)
      const detailData: Project = detailRes.data.data || detailRes.data
      projectMembers.value = detailData.members || []
      newMemberId.value = ''
      alert('Anggota berhasil ditambahkan!')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      alert(error.response?.data?.message || 'Gagal menambahkan.')
    } finally {
      isAddingMember.value = false
    }
  }

  const removeMember = async (memberId: number) => {
    if (!confirm('Hapus anggota ini dari proyek?')) return
    if (!selectedProject.value) return
    try {
      await apiClient.delete(`/projects/${selectedProject.value.id}/members/${memberId}`)
      projectMembers.value = projectMembers.value.filter((m: Member) => m.id !== memberId)
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus anggota.')
    }
  }

  // ===== RETURN =====
  return {
    // State
    loading,
    searchQuery,
    departments,
    showModal,
    isEditing,
    isSubmitting,
    formData,
    showDetailsModal,
    activeTab,
    selectedProject,
    projectTasks,
    projectMembers,
    availableUsers,
    newMemberId,
    newMemberRole,
    isAddingMember,

    // Computed
    user,
    projects,
    canManageGlobal,
    hasMore,
    filteredProjects,
    completedCount,
    activeCount,
    plannedCount,

    // Methods
    loadMore,
    openCreateModal,
    openEditModal,
    closeModal,
    submitProject,
    confirmDelete,
    openDetails,
    closeDetailsModal,
    goToWorkspace,
    addMember,
    removeMember,
  }
}
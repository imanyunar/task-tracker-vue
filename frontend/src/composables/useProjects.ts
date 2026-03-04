import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProjectStore } from '../stores/project'
import { projectService, userService, departmentService } from '../services'
import type { Project as ServiceProject, Member, User } from '../services'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'

export interface Project extends ServiceProject {
  status?: 'planned' | 'on_progress' | 'completed'
  progress: number
  my_role_id: number | null
  department?: { id: number; name: string }
  members?: Member[]
  tasks?: Task[]
}

export interface Task {
  id: number
  title?: string
  status: string
  project_id: number
  user?: { name: string }
}

export interface Department {
  id: number
  name: string
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

export type { Member, User }

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

export function useProjects() {
  const authStore    = useAuthStore()
  const projectStore = useProjectStore()
  const router       = useRouter()
  const toast        = useToast()
  const { confirm }  = useConfirm()

  const loading     = ref(false)
  const searchQuery = ref('')
  const currentPage = ref(1)
  const departments = ref<Department[]>([])

  const showModal    = ref(false)
  const isEditing    = ref(false)
  const isSubmitting = ref(false)
  const formData = reactive<FormData>({
    id: undefined, name: '', description: '',
    start_date: '', end_date: '', status: 'planned', department_id: undefined,
  })

  const showDetailsModal = ref(false)
  const activeTab        = ref<'tasks' | 'members'>('tasks')
  const selectedProject  = ref<Project | null>(null)
  const projectTasks     = ref<Task[]>([])
  const projectMembers   = ref<Member[]>([])

  const availableUsers = ref<User[]>([])
  const newMemberId    = ref<number | ''>('')
  const newMemberRole  = ref<number>(3)
  const isAddingMember = ref(false)

  const user            = computed(() => authStore.user as User | null)
  const projects        = computed<Project[]>(() => (projectStore.projects as unknown as Project[]) || [])
  const canManageGlobal = computed(() => user.value?.role_id === 1 || user.value?.role_id === 2)

  const filteredProjects = computed<Project[]>(() => {
    if (!searchQuery.value) return projects.value
    const q = searchQuery.value.toLowerCase()
    return projects.value.filter(p =>
      p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    )
  })

  const completedCount = computed(() => filteredProjects.value.filter(p => p.status === 'completed').length)
  const activeCount    = computed(() => filteredProjects.value.filter(p => p.status === 'on_progress').length)
  const plannedCount   = computed(() => filteredProjects.value.filter(p => p.status === 'planned' || !p.status).length)

  onMounted(async () => {
    await loadProjects(1)
    if (canManageGlobal.value) { loadAllUsers(); loadDepartments() }
  })

  const loadProjects = async (page = 1, search = '') => {
    loading.value = true
    try {
      await projectStore.fetchProjects(page, search)
      currentPage.value = page
    } catch (err) { console.error('Fetch Error:', err) }
    finally { loading.value = false }
  }

  const handleSearch = async () => { await loadProjects(1, searchQuery.value) }

  const loadDepartments = async () => {
    if (user.value?.role_id !== 1) return
    try {
      const res = await departmentService.getAllDepartments()
      departments.value = res.data.data || (res.data as any) || []
    } catch (err) { console.error(err) }
  }

  const loadAllUsers = async () => {
    try {
      const res = await userService.getAllUsers()
      availableUsers.value = (res.data.data || (res.data as any) || []) as User[]
    } catch (err) { console.error(err) }
  }

  const openCreateModal = () => {
    isEditing.value = false
    Object.assign(formData, {
      id: undefined, name: '', description: '', start_date: '', end_date: '', status: 'planned',
      department_id: user.value?.role_id === 1 ? undefined : user.value?.department_id,
    })
    showModal.value = true
  }

  const openEditModal = (project: Project) => {
    isEditing.value = true
    Object.assign(formData, {
      id: project.id, name: project.name, description: project.description,
      start_date: project.start_date ? project.start_date.substring(0, 10) : '',
      end_date:   project.end_date   ? project.end_date.substring(0, 10)   : '',
      status:        project.status ?? 'planned',
      department_id: project.department_id,
    })
    showModal.value = true
  }

  const closeModal = () => { showModal.value = false }

  const submitProject = async () => {
    isSubmitting.value = true
    try {
      const { id, ...payload } = formData
      if (isEditing.value && id !== undefined) {
        await projectStore.updateProject(id, payload)
        toast.success('Proyek berhasil diperbarui!')
      } else {
        await projectStore.createProject(payload)
        toast.success('Proyek berhasil dibuat!')
      }
      await loadProjects(1)
      closeModal()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Gagal memproses data.')
    } finally { isSubmitting.value = false }
  }

  const confirmDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Hapus Proyek',
      message: 'Hapus proyek ini secara permanen? Semua data terkait akan hilang.',
      type: 'danger', confirmText: 'Hapus Permanen',
    })
    if (!ok) return
    try {
      await projectStore.deleteProject(id)
      await loadProjects(1)
      toast.success('Proyek berhasil dihapus.')
    } catch (err) { console.error(err); toast.error('Gagal menghapus proyek.') }
  }

  const openDetails = async (project: Project) => {
    selectedProject.value = project; activeTab.value = 'tasks'
    showDetailsModal.value = true; projectTasks.value = []; projectMembers.value = []
    try {
      const [detailRes, tasksRes] = await Promise.all([
        projectService.getProjectById(project.id),
        projectService.getTasksByProject(project.id),
      ])
      const detail = (detailRes.data as any).data || detailRes.data
      projectMembers.value = detail.members || []
      projectTasks.value   = (tasksRes.data as any).tasks || (tasksRes.data as any).data || []
    } catch (err) { console.error(err) }
  }

  const closeDetailsModal = () => { showDetailsModal.value = false }

  const goToWorkspace = (projectId: number) => {
    router.push({ name: 'ProjectDetail', params: { id: String(projectId) } })
  }

  const addMember = async () => {
    if (!newMemberId.value || !selectedProject.value) return
    isAddingMember.value = true
    try {
      await projectService.addMember(selectedProject.value.id, {
        user_id: newMemberId.value as number, role_in_project: Number(newMemberRole.value),
      })
      const detailRes = await projectService.getProjectById(selectedProject.value.id)
      const detail    = (detailRes.data as any).data || detailRes.data
      projectMembers.value = detail.members || []
      newMemberId.value = ''
      toast.success('Anggota berhasil ditambahkan!')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Gagal menambahkan anggota.')
    } finally { isAddingMember.value = false }
  }

  const removeMember = async (memberId: number) => {
    const ok = await confirm({ message: 'Hapus anggota ini dari proyek?', type: 'danger', confirmText: 'Hapus Anggota' })
    if (!ok || !selectedProject.value) return
    try {
      const { default: apiClient } = await import('../services/api')
      await apiClient.delete(`/projects/${selectedProject.value.id}/members/${memberId}`)
      projectMembers.value = projectMembers.value.filter(m => m.id !== memberId)
      toast.success('Anggota berhasil dihapus.')
    } catch (err) { console.error(err); toast.error('Gagal menghapus anggota.') }
  }

  const updateMemberRole = async (memberId: number, roleId: number) => {
    if (!selectedProject.value) return
    try {
      const { default: apiClient } = await import('../services/api')
      await apiClient.post(`/projects/${selectedProject.value.id}/members`, { user_id: memberId, role_in_project: roleId })
      const member = projectMembers.value.find(m => m.id === memberId)
      if (member) { if (member.pivot) member.pivot.role_in_project = roleId; (member as any).role_in_project = roleId }
      toast.success('Role berhasil diperbarui.')
    } catch (err) { console.error(err); toast.error('Gagal mengubah role.') }
  }

  return {
    loading, searchQuery, departments,
    showModal, isEditing, isSubmitting, formData,
    showDetailsModal, activeTab, selectedProject, projectTasks, projectMembers,
    availableUsers, newMemberId, newMemberRole, isAddingMember,
    user, projects, canManageGlobal, filteredProjects,
    completedCount, activeCount, plannedCount,
    handleSearch, openCreateModal, openEditModal, closeModal,
    submitProject, confirmDelete, openDetails, closeDetailsModal,
    goToWorkspace, addMember, removeMember, updateMemberRole,
  }
}
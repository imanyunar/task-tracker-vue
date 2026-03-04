import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { taskService, projectService } from '../services'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'

export function useTasksDashboard() {
  const authStore = useAuthStore()
  const toast     = useToast()
  const { confirm } = useConfirm()

  const tasks = ref<any[]>([])
  const projects = ref<any[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const showModal = ref(false)
  const editingTask = ref<any>(null)
  const filterStatus = ref('')

  const formData = reactive({
    title: '', description: '', priority: 'medium', status: 'todo',
    project_id: '' as string | number, user_id: '' as string | number, due_date: ''
  })

  const user            = computed(() => authStore.user)
  const isAdminGlobal   = computed(() => user.value?.role_id === 1)
  const isManagerGlobal = computed(() => user.value?.role_id === 2)

  const getRoleInProject = (project: any) => {
    if (!project || !project.members) return 'none'
    const member = project.members.find((m: any) => m.id === user.value?.id)
    return member?.pivot?.role || 'none'
  }

  const canCreateAnyTask = computed(() => {
    if (isAdminGlobal.value || isManagerGlobal.value) return true
    return projects.value.some(p => {
      const role = getRoleInProject(p)
      return role === 'owner' || role === 'manager'
    })
  })

  const canEditFullTask   = (task: any) => { if (isAdminGlobal.value) return true; const role = getRoleInProject(task.project); return role === 'owner' || role === 'manager' }
  const canDeleteTask     = (task: any) => { if (isAdminGlobal.value) return true; const role = getRoleInProject(task.project); return role === 'owner' }
  const canUpdateStatusOnly = (task: any) => { const role = getRoleInProject(task.project); return role !== 'none' && role !== 'stakeholder' }

  const projectMembers = computed(() => {
    if (!formData.project_id) return []
    const selected = projects.value.find(p => p.id === formData.project_id)
    return selected?.members || []
  })

  const taskCounts = computed(() => ({
    todo:   tasks.value.filter(t => t.status === 'todo').length,
    doing:  tasks.value.filter(t => t.status === 'doing').length,
    review: tasks.value.filter(t => t.status === 'review').length,
    done:   tasks.value.filter(t => t.status === 'done').length,
  }))

  const filteredTasks = computed(() => {
    let result = tasks.value.filter(t =>
      t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    if (filterStatus.value) result = result.filter(t => t.status === filterStatus.value)
    return result
  })

  const onProjectChange = () => { formData.user_id = '' }

  const fetchAllData = async () => {
    loading.value = true
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        taskService.getAllTasks(),
        projectService.getAllProjects(),
      ])
      tasks.value    = tasksRes.data.data    || tasksRes.data    || []
      projects.value = projectsRes.data.data || projectsRes.data || []
    } catch (error) { console.error('Error loading tasks:', error) }
    finally { loading.value = false }
  }

  const openModal = (task: any = null) => {
    if (task) {
      editingTask.value = task
      let formattedDate = ''
      if (task.due_date) {
        const d = new Date(task.due_date)
        formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      }
      Object.assign(formData, { title: task.title, description: task.description, priority: task.priority, status: task.status, project_id: task.project_id, user_id: task.user_id, due_date: formattedDate })
    } else {
      editingTask.value = null
      Object.assign(formData, { title: '', description: '', priority: 'medium', status: 'todo', project_id: '', user_id: '', due_date: '' })
    }
    showModal.value = true
  }

  const closeModal = () => { showModal.value = false; editingTask.value = null }

  const saveTask = async () => {
    try {
      if (!formData.due_date) { toast.warning('Deadline wajib diisi.'); return }
      const payload = { ...formData, project_id: Number(formData.project_id), user_id: Number(formData.user_id) }
      if (editingTask.value) {
        await taskService.updateTask(editingTask.value.id, payload)
        toast.success('Tugas berhasil diperbarui!')
      } else {
        await taskService.createTask(payload)
        toast.success('Tugas berhasil dibuat!')
      }
      closeModal()
      await fetchAllData()
    } catch (error: any) {
      toast.error('Gagal: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleQuickUpdate = async (task: any, newStatus: string) => {
    try {
      await taskService.updateTask(task.id, { status: newStatus })
      task.status = newStatus
      toast.success('Status tugas diperbarui.')
    } catch (error) {
      toast.error('Gagal update status.')
      await fetchAllData()
    }
  }

  const deleteTask = async (id: number) => {
    const ok = await confirm({
      message: 'Hapus tugas ini secara permanen?',
      type: 'danger', confirmText: 'Hapus Tugas',
    })
    if (!ok) return
    try {
      await taskService.deleteTask(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
      toast.success('Tugas berhasil dihapus.')
    } catch (error: any) {
      toast.error('Gagal menghapus: ' + (error.response?.data?.message || 'Error'))
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: any = { todo: 'To Do', doing: 'Doing', review: 'Review', done: 'Done' }
    return labels[status] || status
  }

  const statusBadgeClass = (status: string) => {
    const map: any = { done: 'badge-success', doing: 'badge-primary', review: 'badge-warning', todo: 'badge-danger' }
    return map[status] || 'badge-danger'
  }

  const priorityBadgeClass = (priority: string) => {
    const map: any = {
      low:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      high:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
      urgent: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }
    return map[priority] || 'bg-slate-700/30 text-slate-400 border-slate-700'
  }

  onMounted(fetchAllData)

  return {
    tasks, projects, loading, searchQuery, showModal, editingTask, filterStatus, formData,
    canCreateAnyTask, projectMembers, taskCounts, filteredTasks,
    canEditFullTask, canDeleteTask, canUpdateStatusOnly, onProjectChange,
    getStatusLabel, statusBadgeClass, priorityBadgeClass, openModal, closeModal,
    saveTask, handleQuickUpdate, deleteTask
  }
}
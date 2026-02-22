import { ref, Ref } from 'vue'
import { taskService } from '../services'

interface DashboardStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  total_projects: number
  completion_rate: number
  timeliness_rate: number
  kpi_score: number
}

interface Task {
  id: number
  name: string
  description: string
  project_id: number
  user_id: number
  status: string
  deadline: string
  created_at: string
  updated_at: string
}

interface UseDashboardReturn {
  stats: Ref<Partial<DashboardStats>>
  allTasks: Ref<Task[]>
  loading: Ref<boolean>
  error: Ref<string>
  loadDashboard: () => Promise<void>
  fetchDashboardStats: () => Promise<void>
  fetchAllTasks: () => Promise<void>
}

export const useDashboard = (): UseDashboardReturn => {
  const stats = ref<Partial<DashboardStats>>({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    total_projects: 0,
    completion_rate: 0,
    timeliness_rate: 0,
    kpi_score: 0,
  })

  const allTasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchDashboardStats = async () => {
    try {
      const response = await taskService.getDashboardStats()
      const data = (response.data as any).data || response.data
      stats.value = data
    } catch (err: any) {
      error.value = 'Gagal mengambil statistik dashboard'
      console.error('Error fetching dashboard stats:', err)
    }
  }

  const fetchAllTasks = async () => {
    try {
      const tasksResponse = await taskService.getAllTasks()
      const tasksList = (tasksResponse.data as any).data || tasksResponse.data || []
      allTasks.value = Array.isArray(tasksList) ? tasksList : []
    } catch (err: any) {
      error.value = 'Gagal mengambil daftar tugas'
      console.error('Error fetching tasks:', err)
    }
  }

  const loadDashboard = async () => {
    loading.value = true
    error.value = ''
    try {
      await Promise.all([fetchDashboardStats(), fetchAllTasks()])
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    allTasks,
    loading,
    error,
    loadDashboard,
    fetchDashboardStats,
    fetchAllTasks,
  }
}

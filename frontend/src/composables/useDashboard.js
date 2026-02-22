import { ref } from 'vue'
import { taskService } from '../services'

/**
 * useDashboard - Business logic untuk dashboard
 * Menghandle semua API calls dan data processing
 * UI components hanya perlu menggunakan return values
 */
export const useDashboard = () => {
  const stats = ref({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalProjects: 0,
    completionRate: 0,
    timelinessRate: 0,
    kpiScore: 0
  })

  const allTasks = ref([])
  const loading = ref(false)
  const error = ref('')

  /**
   * Fetch dashboard stats dari backend
   */
  const fetchDashboardStats = async () => {
    try {
      const response = await taskService.getDashboardStats()
      const data = response.data
      
      stats.value = {
        totalTasks: data.total_tasks || 0,
        completedTasks: data.completed_tasks || 0,
        pendingTasks: data.pending_tasks || 0,
        totalProjects: data.total_projects || 0,
        completionRate: data.completion_rate || 0,
        timelinessRate: data.timeliness_rate || 0,
        kpiScore: data.kpi_score || 0
      }
    } catch (err) {
      error.value = 'Gagal mengambil statistik dashboard'
      console.error('Error fetching dashboard stats:', err)
    }
  }

  /**
   * Fetch semua tasks dari backend
   */
  const fetchAllTasks = async () => {
    try {
      const tasksResponse = await taskService.getAllTasks()
      const tasksList = tasksResponse.data.data || tasksResponse.data || []
      allTasks.value = Array.isArray(tasksList) ? tasksList : []
    } catch (err) {
      error.value = 'Gagal mengambil daftar tugas'
      console.error('Error fetching tasks:', err)
    }
  }

  /**
   * Fetch semua data dashboard sekaligus
   */
  const loadDashboard = async () => {
    loading.value = true
    error.value = ''
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchAllTasks()
      ])
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    stats,
    allTasks,
    loading,
    error,
    
    // Methods
    loadDashboard,
    fetchDashboardStats,
    fetchAllTasks
  }
}

import { defineStore } from 'pinia'
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

interface TaskState {
  tasks: Task[]
  stats: Partial<DashboardStats>
  kpi: any
  loading: boolean
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: [],
    stats: {},
    kpi: null,
    loading: false,
  }),
  actions: {
    async fetchDashboardData() {
      this.loading = true
      try {
        const [resStats, resTasks] = await Promise.all([
          taskService.getDashboardStats(),
          taskService.getAllTasks(),
        ])
        const statsData = (resStats.data as any).data || resStats.data
        const tasksData = (resTasks.data as any).data || resTasks.data
        
        this.stats = statsData
        this.tasks = Array.isArray(tasksData) ? tasksData : []
      } finally {
        this.loading = false
      }
    },
  },
})

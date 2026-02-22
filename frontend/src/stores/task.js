import { defineStore } from 'pinia'
import { taskService } from '../services/task.service'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    stats: { project_count: 0, task_count_active: 0 },
    kpi: null,
    loading: false
  }),
  actions: {
    async fetchDashboardData() {
      this.loading = true
      try {
        const [resStats, resKpi, resTasks] = await Promise.all([
          taskService.getDashboardStats(),
          taskService.getKPI(),
          taskService.getAll()
        ])
        this.stats = resStats.data
        this.kpi = resKpi.data
        this.tasks = resTasks.data
      } finally {
        this.loading = false
      }
    }
  }
})
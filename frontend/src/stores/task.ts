import { defineStore } from 'pinia'
import apiClient from '@/services/api'
import type { Task } from '@/services'

interface DashboardStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
  timeliness_rate: number
  kpi_score: number
}

interface TaskState {
  tasks: Task[]
  stats: DashboardStats | null
  loading: boolean
}

function hitungStats(tasks: Task[], userId: number): DashboardStats {
  const myTasks  = tasks.filter(t => t.user_id === userId)
  const myDone   = myTasks.filter(t => t.status === 'done').length
  const myOnTime = myTasks.filter(t => {
    if (t.status !== 'done' || !t.updated_at || !t.due_date) return false
    return new Date(t.updated_at) <= new Date(t.due_date)
  }).length

  const completionRate = myTasks.length > 0 ? (myDone / myTasks.length) * 100 : 0
  const timelinessRate = myDone > 0 ? (myOnTime / myDone) * 100 : 0

  return {
    total_tasks:     tasks.length,
    completed_tasks: tasks.filter(t => t.status === 'done').length,
    pending_tasks:   tasks.filter(t => t.status !== 'done').length,
    completion_rate: Math.round(completionRate * 10) / 10,
    timeliness_rate: Math.round(timelinessRate * 10) / 10,
    kpi_score:       Math.round(((completionRate * 0.6) + (timelinessRate * 0.4)) * 100) / 100,
  }
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks:   [],
    stats:   null,
    loading: false,
  }),

  actions: {
    async fetchTasks(userId: number) {
      this.loading = true
      try {
        const res   = await apiClient.get('/tasks')
        const data  = (res.data as any).data || res.data
        const tasks = Array.isArray(data) ? data : []
        this.tasks  = tasks
        this.stats  = hitungStats(tasks, userId)
      } finally {
        this.loading = false
      }
    },

    async createTask(taskData: Partial<Task>) {
      const res  = await apiClient.post('/tasks', taskData)
      const data = (res.data as any).task || (res.data as any).data || res.data
      this.tasks.push(data)
      return data
    },

    async updateTask(id: number, taskData: Partial<Task>) {
      const res   = await apiClient.put(`/tasks/${id}`, taskData)
      const data  = (res.data as any).task || (res.data as any).data || res.data
      const index = this.tasks.findIndex(t => t.id === id)
      if (index !== -1) this.tasks[index] = data
      return data
    },

    async deleteTask(id: number) {
      await apiClient.delete(`/tasks/${id}`)
      this.tasks = this.tasks.filter(t => t.id !== id)
    },
  },
})
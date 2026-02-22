import api from './api'

export const taskService = {
  // List tugas (Filter otomatis oleh backend sesuai role)
  getAll() {
    return api.get('/tasks')
  },
  // Detail tugas
  getById(id) {
    return api.get(`/tasks/${id}`)
  },
  // Dashboard statistik (project_count, task_count_active)
  getDashboardStats() {
    return api.get('/dashboard/stats')
  },
  // Statistik KPI (Skor, Completion Rate, Timeliness)
  getKPI() {
    return api.get('/kpi-stats')
  },
  create(data) {
    return api.post('/tasks', data)
  },
  update(id, data) {
    return api.put(`/tasks/${id}`, data)
  },
  delete(id) {
    return api.delete(`/tasks/${id}`)
  }
}
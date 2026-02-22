import { ref, Ref } from 'vue'
import { taskService } from '../services'

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

interface UseTasksReturn {
  tasks: Ref<Task[]>
  loading: Ref<boolean>
  error: Ref<string>
  fetchTasks: () => Promise<void>
  createTask: (taskData: Partial<Task>) => Promise<any>
  updateTask: (id: number, taskData: Partial<Task>) => Promise<any>
  deleteTask: (id: number) => Promise<void>
  getTaskById: (id: number) => Promise<any>
}

export const useTasks = (): UseTasksReturn => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchTasks = async () => {
    loading.value = true
    error.value = ''
    try {
      const response = await taskService.getAllTasks()
      const data = (response.data as any).data || response.data
      tasks.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      error.value = 'Gagal mengambil tasks'
      console.error('Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const response = await taskService.createTask(taskData)
      const data = (response.data as any).data || response.data
      tasks.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Gagal membuat task'
      throw err
    }
  }

  const updateTask = async (id: number, taskData: Partial<Task>) => {
    try {
      const response = await taskService.updateTask(id, taskData)
      const data = (response.data as any).data || response.data
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = data
      }
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Gagal update task'
      throw err
    }
  }

  const deleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id)
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Gagal hapus task'
      throw err
    }
  }

  const getTaskById = async (id: number) => {
    try {
      const response = await taskService.getTaskById(id)
      const data = (response.data as any).data || response.data
      return data
    } catch (err: any) {
      error.value = 'Gagal mengambil detail task'
      throw err
    }
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
  }
}

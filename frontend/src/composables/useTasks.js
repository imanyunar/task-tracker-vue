import { ref } from 'vue'
import { taskService } from '../services'

/**
 * useTasks - Business logic untuk task management
 * Menghandle CRUD operations dan state management
 */
export const useTasks = () => {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref('')

  /**
   * Fetch semua tasks
   */
  const fetchTasks = async () => {
    loading.value = true
    error.value = ''
    try {
      const response = await taskService.getAllTasks()
      tasks.value = response.data.data || response.data || []
    } catch (err) {
      error.value = 'Gagal mengambil tasks'
      console.error('Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create task baru
   */
  const createTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData)
      tasks.value.push(response.data.data || response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal membuat task'
      throw err
    }
  }

  /**
   * Update task
   */
  const updateTask = async (id, taskData) => {
    try {
      const response = await taskService.updateTask(id, taskData)
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = response.data.data || response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal update task'
      throw err
    }
  }

  /**
   * Delete task
   */
  const deleteTask = async (id) => {
    try {
      await taskService.deleteTask(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal hapus task'
      throw err
    }
  }

  /**
   * Get task by ID
   */
  const getTaskById = async (id) => {
    try {
      const response = await taskService.getTaskById(id)
      return response.data
    } catch (err) {
      error.value = 'Gagal mengambil detail task'
      throw err
    }
  }

  return {
    // State
    tasks,
    loading,
    error,

    // Methods
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById
  }
}

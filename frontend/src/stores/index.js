import { defineStore } from 'pinia'
import { ref } from 'vue'
import { taskService, projectService, userService, departmentService, profileService } from '../services'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref('')

  const fetchTasks = async () => {
    loading.value = true
    try {
      const response = await taskService.getAllTasks()
      tasks.value = response.data.data || response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const getTaskById = async (id) => {
    try {
      const response = await taskService.getTaskById(id)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const createTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData)
      tasks.value.push(response.data.data || response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateTask = async (id, taskData) => {
    try {
      const response = await taskService.updateTask(id, taskData)
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = response.data.data || response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteTask = async (id) => {
    try {
      await taskService.deleteTask(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
  }
})

export const useProjectStore = defineStore('project', () => {
  const projects = ref([])
  const loading = ref(false)
  const error = ref('')

  const fetchProjects = async () => {
    loading.value = true
    try {
      const response = await projectService.getAllProjects()
      projects.value = response.data.data || response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const getProjectById = async (id) => {
    try {
      const response = await projectService.getProjectById(id)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const createProject = async (projectData) => {
    try {
      const response = await projectService.createProject(projectData)
      projects.value.push(response.data.data || response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateProject = async (id, projectData) => {
    try {
      const response = await projectService.updateProject(id, projectData)
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = response.data.data || response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteProject = async (id) => {
    try {
      await projectService.deleteProject(id)
      projects.value = projects.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
  }
})

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const profile = ref(null)
  const loading = ref(false)
  const error = ref('')

  const fetchUsers = async () => {
    loading.value = true
    try {
      const response = await userService.getAllUsers()
      users.value = response.data.data || response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchProfile = async () => {
    loading.value = true
    try {
      const response = await profileService.getProfile()
      profile.value = response.data.data || response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (userData) => {
    try {
      const response = await profileService.updateProfile(userData)
      profile.value = response.data.data || response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    users,
    profile,
    loading,
    error,
    fetchUsers,
    fetchProfile,
    updateProfile
  }
})

export const useDepartmentStore = defineStore('department', () => {
  const departments = ref([])
  const loading = ref(false)
  const error = ref('')

  const fetchDepartments = async () => {
    loading.value = true
    try {
      const response = await departmentService.getAllDepartments()
      departments.value = response.data.data || response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    departments,
    loading,
    error,
    fetchDepartments
  }
})

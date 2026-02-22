import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  taskService,
  projectService,
  userService,
  departmentService,
  profileService,
} from '../services'

// ==================== TASK STORE ====================

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

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchTasks = async () => {
    loading.value = true
    try {
      const response = await taskService.getAllTasks()
      const data = (response.data as any).data || response.data
      tasks.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const getTaskById = async (id: number) => {
    try {
      const response = await taskService.getTaskById(id)
      const data = (response.data as any).data || response.data
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const response = await taskService.createTask(taskData)
      const data = (response.data as any).data || response.data
      tasks.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.message
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
      error.value = err.message
      throw err
    }
  }

  const deleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id)
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (err: any) {
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
    deleteTask,
  }
})

// ==================== PROJECT STORE ====================

interface Project {
  id: number
  name: string
  description: string
  created_by: number
  created_at: string
  updated_at: string
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchProjects = async () => {
    loading.value = true
    try {
      const response = await projectService.getAllProjects()
      const data = (response.data as any).data || response.data
      projects.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const getProjectById = async (id: number) => {
    try {
      const response = await projectService.getProjectById(id)
      const data = (response.data as any).data || response.data
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const createProject = async (projectData: Partial<Project>) => {
    try {
      const response = await projectService.createProject(projectData)
      const data = (response.data as any).data || response.data
      projects.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const updateProject = async (id: number, projectData: Partial<Project>) => {
    try {
      const response = await projectService.updateProject(id, projectData)
      const data = (response.data as any).data || response.data
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = data
      }
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const deleteProject = async (id: number) => {
    try {
      await projectService.deleteProject(id)
      projects.value = projects.value.filter((p) => p.id !== id)
    } catch (err: any) {
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
    deleteProject,
  }
})

// ==================== USER STORE ====================

interface User {
  id: number
  name: string
  email: string
  role_id: number
  dept_id: number
  role?: {
    id: number
    name: string
  }
  department?: {
    id: number
    name: string
  }
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const profile = ref<User | null>(null)
  const loading = ref(false)
  const error = ref('')

  const fetchUsers = async () => {
    loading.value = true
    try {
      const response = await userService.getAllUsers()
      const data = (response.data as any).data || response.data
      users.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchProfile = async () => {
    loading.value = true
    try {
      const response = await profileService.getProfile()
      const userData = (response.data as any).user || (response.data as any).data || response.data
      profile.value = userData as User
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await profileService.updateProfile(userData)
      const userData2 = (response.data as any).user || (response.data as any).data || response.data
      profile.value = userData2 as User
      return userData2
    } catch (err: any) {
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
    updateProfile,
  }
})

// ==================== DEPARTMENT STORE ====================

interface Department {
  id: number
  name: string
}

export const useDepartmentStore = defineStore('department', () => {
  const departments = ref<Department[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchDepartments = async () => {
    loading.value = true
    try {
      const response = await departmentService.getAllDepartments()
      const data = (response.data as any).data || response.data
      departments.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    departments,
    loading,
    error,
    fetchDepartments,
  }
})

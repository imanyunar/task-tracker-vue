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
  title: string        // Sudah Sinkron dengan Service
  description: string
  project_id: number
  user_id: number
  status: string
  due_date: string     // Sudah Sinkron dengan Service
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

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const response = await taskService.createTask(taskData)
      const data = (response.data as any).data || response.data
      tasks.value.push(data)
      return data
    } catch (err: any) {
      throw err
    }
  }

  const updateTask = async (id: number, taskData: Partial<Task>) => {
    try {
      const response = await taskService.updateTask(id, taskData)
      const data = (response.data as any).data || response.data
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) tasks.value[index] = data
      return data
    } catch (err: any) {
      throw err
    }
  }

  const deleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id)
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (err: any) {
      throw err
    }
  }

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask }
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

  const fetchProjects = async () => {
    loading.value = true
    try {
      const response = await projectService.getAllProjects()
      const data = (response.data as any).data || response.data
      projects.value = Array.isArray(data) ? data : []
    } finally {
      loading.value = false
    }
  }

  return { projects, loading, fetchProjects }
})

// ==================== USER STORE (Profile & Users) ====================

interface User {
  id: number
  name: string
  email: string
  role_id: number
  department_id: number // Konsisten
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const profile = ref<User | null>(null)
  const loading = ref(false)

  const fetchProfile = async () => {
    loading.value = true
    try {
      const response = await profileService.getProfile()
      // Menangani berbagai kemungkinan struktur response
      const userData = (response.data as any).data || (response.data as any).user || response.data
      profile.value = userData as User
    } catch (err: any) {
      console.error("Gagal fetch profile:", err)
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (userData: Partial<User>) => {
    loading.value = true
    try {
      const response = await profileService.updateProfile(userData)
      const updatedData = (response.data as any).data || (response.data as any).user || response.data
      
      profile.value = updatedData as User
      
      const currentAuthuser= sessionStorage.getItem('user_data')
      if (currentAuthuser) {
        sessionStorage.setItem('user_data', JSON.stringify(updatedData))
      }
      return updatedData
    } catch (err: any) {
      console.error("Gagal update profile:", err) 
      throw err
    }finally {
      loading.value = false
    }   
  }  
  return { users, profile, loading, fetchProfile, updateProfile }
})

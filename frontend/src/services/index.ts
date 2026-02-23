import api from './api'
import { AxiosResponse } from 'axios'

// ==================== TYPE DEFINITIONS ====================

export interface AuthResponse {
  api_token: string
  user: User
}

export interface Task {
  id: number
  title: string         // Sesuai Laravel
  description: string
  project_id: number
  user_id: number
  priority: string
  status: string
  due_date: string      // Sesuai Laravel
  created_at: string
  updated_at: string
  user?: User
  project?: Project
}

export interface Project {
  id: number
  name: string
  description: string
  start_date: string; // Tambahkan ini
  end_date: string;   // Tambahkan ini
  created_by: number
  created_at: string
  updated_at: string
  members?: User[]
}

export interface User {
  id: number
  name: string
  email: string
  role_id: number
  department_id: number // Konsisten menggunakan department_id
  role?: {
    id: number
    name: string
  }
  department?: {
    id: number
    name: string
  }
}

export interface DashboardStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  total_projects: number
  completion_rate: number
  timeliness_rate: number
  kpi_score: number
}

// ==================== AUTH SERVICE ====================

export const authService = {
  login(credentials: { email: string; password: string }): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/login', credentials)
  },

  register(userData: any): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/register', userData)
  },

  logout(): Promise<AxiosResponse> {
    return api.post('/logout')
  },
}

// ==================== PROFILE SERVICE ====================

export const profileService = {
  getProfile(): Promise<AxiosResponse<{ data: User }>> {
    return api.get('/profile') // Menggunakan /profile agar tidak 404 saat refresh
  },

  updateProfile(profileData: Partial<User>): Promise<AxiosResponse<{ data: User }>> {
    return api.put('/profile', profileData)
  },
}

// ==================== TASK SERVICE ====================

export const taskService = {
  getAllTasks(): Promise<AxiosResponse<{ data: Task[] }>> {
    return api.get('/tasks')
  },

  getTaskById(id: number): Promise<AxiosResponse<{ data: Task }>> {
    return api.get(`/tasks/${id}`)
  },

  createTask(taskData: Partial<Task>): Promise<AxiosResponse<{ data: Task }>> {
    return api.post('/tasks', taskData)
  },

  updateTask(id: number, taskData: Partial<Task>): Promise<AxiosResponse<{ data: Task }>> {
    return api.put(`/tasks/${id}`, taskData)
  },

  deleteTask(id: number): Promise<AxiosResponse> {
    return api.delete(`/tasks/${id}`)
  },

  getDashboardStats(): Promise<AxiosResponse<{ data: DashboardStats }>> {
    return api.get('/dashboard-stats') 
  },
}

// ==================== PROJECT SERVICE ====================

// ==================== PROJECT SERVICE ====================

export const projectService = {
  // Ubah Return Type menjadi AxiosResponse saja agar bisa membaca data pagination Laravel
  getAllProjects(page: number = 1): Promise<AxiosResponse> {
    return api.get(`/projects?page=${page}`)
  },

  getProjectById(id: number): Promise<AxiosResponse<{ data: Project }>> {
    return api.get(`/projects/${id}`)
  },

  createProject(projectData: Partial<Project>): Promise<AxiosResponse<{ data: Project }>> {
    return api.post('/projects', projectData)
  },

  updateProject(id: number, projectData: Partial<Project>): Promise<AxiosResponse<{ data: Project }>> {
    return api.put(`/projects/${id}`, projectData)
  },

  deleteProject(id: number): Promise<AxiosResponse> {
    return api.delete(`/projects/${id}`)
  },
  
  addMember(projectId: number, payload: { user_id: number, role: string }): Promise<AxiosResponse> {
    return api.post(`/projects/${projectId}/members`, payload)
  },

  // Tambahkan fungsi ini agar error di useProjects.ts hilang
  searchProjects(query: string): Promise<AxiosResponse> {
    return api.get('/projects/search', {
      params: { q: query }
    })
  }
}

// ==================== USER & DEPT SERVICE ====================

export const userService = {
  getAllUsers(): Promise<AxiosResponse<{ data: User[] }>> { return api.get('/users') }
}

export const departmentService = {
  getAllDepartments(): Promise<AxiosResponse<{ data: any[] }>> { return api.get('/departments') }
}
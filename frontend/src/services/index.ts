import api from './api'
import { AxiosResponse } from 'axios'

// ==================== TYPE DEFINITIONS ====================

interface AuthResponse {
  api_token: string
  user: {
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

interface Project {
  id: number
  name: string
  description: string
  created_by: number
  created_at: string
  updated_at: string
}

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

interface Department {
  id: number
  name: string
}

interface DashboardStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  total_projects: number
  completion_rate: number
  timeliness_rate: number
  kpi_score: number
}

interface PaginatedResponse<T> {
  data: T[]
  meta?: {
    current_page: number
    total: number
    per_page: number
  }
}

// ==================== AUTH SERVICE ====================

export const authService = {
  register(userData: {
    name: string
    email: string
    password: string
    password_confirmation: string
    department?: string | number
  }): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/register', userData)
  },

  login(credentials: {
    email: string
    password: string
  }): Promise<AxiosResponse<AuthResponse>> {
    return api.post('/login', credentials)
  },

  logout(): Promise<AxiosResponse> {
    return api.post('/logout')
  },

  getUserProfile(): Promise<AxiosResponse<{ user: User }>> {
    return api.get('/user-profile')
  },
}

// ==================== PROFILE SERVICE ====================

export const profileService = {
  getProfile(): Promise<AxiosResponse<{ user: User }>> {
    return api.get('/profile')
  },
  updateProfile(data: Partial<User>): Promise<AxiosResponse<{ data: User }>> {
    return api.put('/profile', data)
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

  getKPIStats(): Promise<AxiosResponse<{ data: DashboardStats }>> {
    return api.get('/kpi-stats')
  },
}

// ==================== PROJECT SERVICE ====================

export const projectService = {
  getAllProjects(page = 1): Promise<AxiosResponse<PaginatedResponse<Project>>> {
    return api.get(`/projects?page=${page}`)
  },

  createProject(projectData: Partial<Project>): Promise<AxiosResponse<{ data: Project }>> {
    return api.post('/projects', projectData)
  },

  searchProjects(query: string): Promise<AxiosResponse<{ data: Project[] }>> {
    return api.get('/projects/search', { params: { q: query } })
  },

  addMember(
    projectId: number,
    memberData: { user_id: number; role: string }
  ): Promise<AxiosResponse> {
    return api.post(`/projects/${projectId}/add-member`, memberData)
  },

  getProjectById(id: number): Promise<AxiosResponse<{ data: Project }>> {
    return api.get(`/projects/${id}`)
  },

  updateProject(id: number, projectData: Partial<Project>): Promise<AxiosResponse<{ data: Project }>> {
    return api.put(`/projects/${id}`, projectData)
  },

  deleteProject(id: number): Promise<AxiosResponse> {
    return api.delete(`/projects/${id}`)
  },
}

// ==================== USER SERVICE ====================

export const userService = {
  getAllUsers(): Promise<AxiosResponse<{ data: User[] }>> {
    return api.get('/users')
  },

  getUserById(id: number): Promise<AxiosResponse<{ data: User }>> {
    return api.get(`/users/${id}`)
  },

  updateUser(id: number, userData: Partial<User>): Promise<AxiosResponse<{ data: User }>> {
    return api.put(`/users/${id}`, userData)
  },

  deleteUser(id: number): Promise<AxiosResponse> {
    return api.delete(`/users/${id}`)
  },
}

// ==================== DEPARTMENT SERVICE ====================

export const departmentService = {
  getAllDepartments(): Promise<AxiosResponse<{ data: Department[] }>> {
    return api.get('/departments')
  },

  getDepartmentById(id: number): Promise<AxiosResponse<{ data: Department }>> {
    return api.get(`/departments/${id}`)
  },

  createDepartment(
    deptData: Partial<Department>
  ): Promise<AxiosResponse<{ data: Department }>> {
    return api.post('/departments', deptData)
  },
}

// Export default untuk mempermudah import sekaligus
export default {
  authService,
  profileService,
  taskService,
  projectService,
  userService,
  departmentService,
}

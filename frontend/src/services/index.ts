import api from './api'
import { AxiosResponse } from 'axios'

// ==================== TYPE DEFINITIONS ====================

export interface AuthResponse {
  api_token: string
  user: User
}

export interface ChatMessage {
  id: number
  project_id: number
  user_id: number
  message: string
  created_at: string
  user: {
    id: number
    name: string
  }
}

export interface Task {
  id: number
  title: string
  description: string
  project_id: number
  user_id: number
  priority: string
  status: string
  due_date: string
  created_at: string
  updated_at: string
  user?: User
  project?: Project
}

export interface User {
  id: number
  name: string
  email: string
  role_id: number
  department_id: number
  role?: {
    id: number
    name: string
  }
  department?: {
    id: number
    name: string
  }
}

// Member adalah User + field pivot dari project
export interface Member extends User {
  role_in_project?: number
  pivot?: {
    role_in_project: number
  }
  avatar?: string
}

export interface Project {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  status?: string
  department_id?: number
  // Data mentah dari backend — kalkulasi progress dilakukan di frontend
  tasks_count?: number
  completed_tasks_count?: number
  my_role_id?: number | null
  created_by: number
  created_at: string
  updated_at: string
  // Pakai Member bukan User agar bisa extend tanpa conflict
  members?: Member[]
}

// DashboardStats dihitung di frontend dari data tasks
export interface DashboardStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
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
  // GET /profile → dynamic route ShowController@index dengan model='profile'
  getProfile(): Promise<AxiosResponse<{ data: User }>> {
    return api.get('/profile')
  },

  // PUT /profile/0 → dynamic route UpdateController@update, id diabaikan di backend
  updateProfile(profileData: Partial<User>): Promise<AxiosResponse<{ data: User }>> {
    return api.put('/profile/0', profileData)
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

  createTask(taskData: Partial<Task>): Promise<AxiosResponse> {
    return api.post('/tasks', taskData)
  },

  updateTask(id: number, taskData: Partial<Task>): Promise<AxiosResponse> {
    return api.put(`/tasks/${id}`, taskData)
  },

  deleteTask(id: number): Promise<AxiosResponse> {
    return api.delete(`/tasks/${id}`)
  },

  // getDashboardStats dihapus — stats dihitung di useDashboard.ts dari getAllTasks()
}

// ==================== PROJECT SERVICE ====================

export const projectService = {
  // Support search via query param ?search=keyword
  getAllProjects(page: number = 1, search: string = ''): Promise<AxiosResponse> {
    return api.get('/projects', {
      params: {
        page,
        ...(search !== '' && { search }),
      },
    })
  },

  getProjectById(id: number): Promise<AxiosResponse<{ data: Project }>> {
    return api.get(`/projects/${id}`)
  },

  createProject(projectData: Partial<Project>): Promise<AxiosResponse> {
    return api.post('/projects', projectData)
  },

  updateProject(id: number, projectData: Partial<Project>): Promise<AxiosResponse> {
    return api.put(`/projects/${id}`, projectData)
  },

  deleteProject(id: number): Promise<AxiosResponse> {
    return api.delete(`/projects/${id}`)
  },

  // POST /projects/{id}/members → dynamic action route
  addMember(projectId: number, payload: { user_id: number; role_in_project: number }): Promise<AxiosResponse> {
    return api.post(`/projects/${projectId}/members`, payload)
  },

  // POST /projects/{id}/posts → dynamic action route
  storePost(projectId: number, content: string): Promise<AxiosResponse> {
    return api.post(`/projects/${projectId}/posts`, { content })
  },

  // GET /projects/{id}/tasks → dynamic action route
  getTasksByProject(projectId: number): Promise<AxiosResponse> {
    return api.get(`/projects/${projectId}/tasks`)
  },

  // GET /projects/{id}/chats → dynamic action route
  getChats(projectId: number, lastId: number = 0): Promise<AxiosResponse<ChatMessage[]>> {
    return api.get(`/projects/${projectId}/chats`, {
      params: { last_id: lastId },
    })
  },

  // POST /projects/{id}/chats → dynamic action route
  sendChat(projectId: number, message: string): Promise<AxiosResponse<ChatMessage>> {
    return api.post(`/projects/${projectId}/chats`, { message })
  },
}

// ==================== USER SERVICE ====================

export const userService = {
  getAllUsers(): Promise<AxiosResponse<{ data: User[] }>> {
    return api.get('/users')
  },
}

// ==================== DEPARTMENT SERVICE ====================

export const departmentService = {
  getAllDepartments(): Promise<AxiosResponse<{ data: any[] }>> {
    return api.get('/departments')
  },
}
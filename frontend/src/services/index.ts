// ==================== TYPE DEFINITIONS ====================
// Hanya types — koneksi API ditangani oleh generic composables

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
  avatar?: string
  role?: {
    id: number
    name: string
  }
  department?: {
    id: number
    name: string
  }
}

export interface Member extends User {
  role_in_project?: number
  pivot?: {
    role_in_project: number
  }
}

export interface Project {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  status?: string
  department_id?: number
  tasks_count?: number
  completed_tasks_count?: number
  my_role_id?: number | null
  created_by: number
  created_at: string
  updated_at: string
  members?: Member[]
}

export interface Department {
  id: number
  name: string
}

export interface DashboardStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
  timeliness_rate: number
  kpi_score: number
  total_projects: number
}
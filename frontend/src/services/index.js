import api from './api'

/**
 * AUTH SERVICE
 * Menghubungkan ke: AuthController.php
 */
export const authService = {
  // Sesuai AuthController@register
  register(userData) {
    return api.post('/register', userData)
  },
  // Sesuai AuthController@login - Menghasilkan api_token
  login(credentials) {
    return api.post('/login', credentials)
  },
  // Sesuai AuthController@logout - Menghapus api_token
  logout() {
    return api.post('/logout')
  },
  // Sesuai AuthController@userProfile
  getUserProfile() {
    return api.get('/user-profile')
  }
}

/**
 * PROFILE SERVICE
 * Menghubungkan ke: ProfileController.php
 */
export const profileService = {
  // Sesuai ProfileController@show
  getProfile() {
    return api.get('/profile')
  }
}

/**
 * TASK SERVICE
 * Menghubungkan ke: TaskController.php
 */
export const taskService = {
  // Sesuai TaskController@index (Mengambil tugas berdasarkan role)
  getAllTasks() {
    return api.get('/tasks')
  },
  // Sesuai TaskController@show (Detail tugas + project + user)
  getTaskById(id) {
    return api.get(`/tasks/${id}`)
  },
  // Sesuai TaskController@store
  createTask(taskData) {
    return api.post('/tasks', taskData)
  },
  // Sesuai TaskController@update
  updateTask(id, taskData) {
    return api.put(`/tasks/${id}`, taskData)
  },
  // Sesuai TaskController@destroy
  deleteTask(id) {
    return api.delete(`/tasks/${id}`)
  },
  // Sesuai TaskController@getDashboardStats (project_count & task_count_active)
  getDashboardStats() {
    return api.get('/dashboard/stats')
  },
  // Sesuai TaskController@getKPIStats (Skor KPI otomatis dari backend)
  getKPIStats() {
    return api.get('/kpi-stats')
  }
}

/**
 * PROJECT SERVICE
 * Menghubungkan ke: ProjectController.php
 */
export const projectService = {
  // Sesuai ProjectController@index (Pagination 10 data)
  getAllProjects(page = 1) {
    return api.get(`/projects?page=${page}`)
  },
  // Sesuai ProjectController@store
  createProject(projectData) {
    return api.post('/projects', projectData)
  },
  // Sesuai ProjectController@search
  searchProjects(query) {
    return api.get('/projects/search', { params: { q: query } })
  },
  // Sesuai ProjectController@addMember
  addMember(projectId, memberData) {
    // memberData: { user_id: 1, role: 'Manager' }
    return api.post(`/projects/${projectId}/add-member`, memberData)
  }
}

/**
 * USER SERVICE
 * Menghubungkan ke: UserController.php
 */
export const userService = {
  // Sesuai UserController@index
  getAllUsers() {
    return api.get('/users')
  },
  // Sesuai UserController@show (Include tasks, projects, attendances)
  getUserById(id) {
    return api.get(`/users/${id}`)
  },
  // Sesuai UserController@update
  updateUser(id, userData) {
    return api.put(`/users/${id}`, userData)
  },
  // Sesuai UserController@destroy
  deleteUser(id) {
    return api.delete(`/users/${id}`)
  }
}

/**
 * DEPARTMENT SERVICE
 * Menghubungkan ke: DepartmentController.php
 */
export const departmentService = {
  // Sesuai DepartmentController@index
  getAllDepartments() {
    return api.get('/departments')
  },
  // Sesuai DepartmentController@show (Beserta daftar karyawan)
  getDepartmentById(id) {
    return api.get(`/departments/${id}`)
  },
  // Sesuai DepartmentController@store
  createDepartment(deptData) {
    return api.post('/departments', deptData)
  }
}

// Export default untuk mempermudah import sekaligus
export default {
  authService,
  profileService,
  taskService,
  projectService,
  userService,
  departmentService
}
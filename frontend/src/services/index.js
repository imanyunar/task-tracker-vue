import api from './api'

export const authService = {
  register(userData) {
    return api.post('/register', userData)
  },

  login(credentials) {
    return api.post('/login', credentials)
  },

  logout() {
    return api.post('/logout')
  }
}

export const profileService = {
  getProfile() {
    return api.get('/profile')
  },

  updateProfile(userData) {
    return api.put('/users/' + userData.id, userData)
  }
}

export const taskService = {
  getAllTasks() {
    return api.get('/tasks')
  },

  getTaskById(id) {
    return api.get(`/tasks/${id}`)
  },

  createTask(taskData) {
    return api.post('/tasks', taskData)
  },

  updateTask(id, taskData) {
    return api.put(`/tasks/${id}`, taskData)
  },

  deleteTask(id) {
    return api.delete(`/tasks/${id}`)
  },

  getTasksByProject(projectId) {
    return api.get(`/projects/${projectId}/tasks`)
  },

  getDashboardStats() {
    return api.get('/dashboard-stats')
  }
}

export const projectService = {
  getAllProjects() {
    return api.get('/projects')
  },

  getProjectById(id) {
    return api.get(`/projects/${id}`)
  },

  createProject(projectData) {
    return api.post('/projects', projectData)
  },

  updateProject(id, projectData) {
    return api.put(`/projects/${id}`, projectData)
  },

  deleteProject(id) {
    return api.delete(`/projects/${id}`)
  },

  searchProjects(query) {
    return api.get('/projects/search', { params: { q: query } })
  },

  addMember(projectId, userId) {
    return api.post(`/projects/${projectId}/add-member`, { user_id: userId })
  }
}

export const userService = {
  getAllUsers() {
    return api.get('/users')
  },

  getUserById(id) {
    return api.get(`/users/${id}`)
  },

  createUser(userData) {
    return api.post('/users', userData)
  },

  updateUser(id, userData) {
    return api.put(`/users/${id}`, userData)
  },

  deleteUser(id) {
    return api.delete(`/users/${id}`)
  }
}

export const departmentService = {
  getAllDepartments() {
    return api.get('/departments')
  },

  getDepartmentById(id) {
    return api.get(`/departments/${id}`)
  },

  createDepartment(deptData) {
    return api.post('/departments', deptData)
  },

  updateDepartment(id, deptData) {
    return api.put(`/departments/${id}`, deptData)
  },

  deleteDepartment(id) {
    return api.delete(`/departments/${id}`)
  }
}

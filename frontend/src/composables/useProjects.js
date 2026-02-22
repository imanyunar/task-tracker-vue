import { ref } from 'vue'
import { projectService } from '../services'

/**
 * useProjects - Business logic untuk project management
 * Menghandle CRUD operations dan state management
 */
export const useProjects = () => {
  const projects = ref([])
  const loading = ref(false)
  const error = ref('')

  /**
   * Fetch semua projects
   */
  const fetchProjects = async (page = 1) => {
    loading.value = true
    error.value = ''
    try {
      const response = await projectService.getAllProjects(page)
      projects.value = response.data.data || response.data || []
    } catch (err) {
      error.value = 'Gagal mengambil projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create project baru
   */
  const createProject = async (projectData) => {
    try {
      const response = await projectService.createProject(projectData)
      projects.value.push(response.data.data || response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal membuat project'
      throw err
    }
  }

  /**
   * Update project
   */
  const updateProject = async (id, projectData) => {
    try {
      const response = await projectService.updateProject(id, projectData)
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = response.data.data || response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal update project'
      throw err
    }
  }

  /**
   * Delete project
   */
  const deleteProject = async (id) => {
    try {
      await projectService.deleteProject(id)
      projects.value = projects.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal hapus project'
      throw err
    }
  }

  /**
   * Get project by ID
   */
  const getProjectById = async (id) => {
    try {
      const response = await projectService.getProjectById(id)
      return response.data
    } catch (err) {
      error.value = 'Gagal mengambil detail project'
      throw err
    }
  }

  /**
   * Search projects
   */
  const searchProjects = async (query) => {
    try {
      const response = await projectService.searchProjects(query)
      return response.data
    } catch (err) {
      error.value = 'Gagal mencari projects'
      throw err
    }
  }

  return {
    // State
    projects,
    loading,
    error,

    // Methods
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    searchProjects
  }
}

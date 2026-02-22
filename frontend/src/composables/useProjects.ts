import { ref, Ref } from 'vue'
import { projectService } from '../services'

interface Project {
  id: number
  name: string
  description: string
  created_by: number
  created_at: string
  updated_at: string
}

interface UseProjectsReturn {
  projects: Ref<Project[]>
  loading: Ref<boolean>
  error: Ref<string>
  fetchProjects: (page?: number) => Promise<void>
  createProject: (projectData: Partial<Project>) => Promise<any>
  updateProject: (id: number, projectData: Partial<Project>) => Promise<any>
  deleteProject: (id: number) => Promise<void>
  getProjectById: (id: number) => Promise<any>
  searchProjects: (query: string) => Promise<any>
}

export const useProjects = (): UseProjectsReturn => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchProjects = async (page = 1) => {
    loading.value = true
    error.value = ''
    try {
      const response = await projectService.getAllProjects(page)
      const data = (response.data as any).data || response.data
      projects.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      error.value = 'Gagal mengambil projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData: Partial<Project>) => {
    try {
      const response = await projectService.createProject(projectData)
      const data = (response.data as any).data || response.data
      projects.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Gagal membuat project'
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
      error.value = err.response?.data?.message || 'Gagal update project'
      throw err
    }
  }

  const deleteProject = async (id: number) => {
    try {
      await projectService.deleteProject(id)
      projects.value = projects.value.filter((p) => p.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Gagal hapus project'
      throw err
    }
  }

  const getProjectById = async (id: number) => {
    try {
      const response = await projectService.getProjectById(id)
      const data = (response.data as any).data || response.data
      return data
    } catch (err: any) {
      error.value = 'Gagal mengambil detail project'
      throw err
    }
  }

  const searchProjects = async (query: string) => {
    try {
      const response = await projectService.searchProjects(query)
      const data = (response.data as any).data || response.data
      return data
    } catch (err: any) {
      error.value = 'Gagal mencari projects'
      throw err
    }
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    searchProjects,
  }
}

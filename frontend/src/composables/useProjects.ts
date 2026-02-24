import { ref, Ref, computed } from 'vue'
import { projectService } from '../services'

// PERUBAHAN 1: Update Interface Project agar mendukung sistem Role
export interface Project {
  id: number
  name: string
  description: string
  progress: number      // Sekarang wajib karena dikirim dari backend
  my_role_id: number    // DATA KRUSIAL: Menentukan hak akses user di proyek ini
  status: string        // Tambahkan status
  start_date?: string
  end_date?: string
  created_by: number
  created_at: string
  updated_at: string
}

interface PaginationMeta {
  current_page: number
  last_page: number
  total: number
}

interface UseProjectsReturn {
  projects: Ref<Project[]>
  loading: Ref<boolean>
  error: Ref<string>
  pagination: Ref<PaginationMeta | null>
  hasMore: Ref<boolean>
  fetchProjects: (page?: number) => Promise<void>
  loadMore: () => Promise<void>
  createProject: (projectData: Partial<Project>) => Promise<any>
  updateProject: (id: number, projectData: Partial<Project>) => Promise<any>
  deleteProject: (id: number) => Promise<void>
  getProjectById: (id: number) => Promise<any>
  searchProjects: (query: string) => Promise<any>
}

export const useProjects = (): UseProjectsReturn => {
  const projects = ref<Project[]>([])
  const pagination = ref<PaginationMeta | null>(null)
  const loading = ref(false)
  const error = ref('')

  const hasMore = computed(() => {
    if (!pagination.value) return false
    return pagination.value.current_page < pagination.value.last_page
  })

  const fetchProjects = async (page = 1) => {
    loading.value = true
    error.value = ''
    try {
      const response = await projectService.getAllProjects(page)
      const rawData = response.data as any
      
      const dataItems = rawData.data || []
      
      if (page === 1) {
        projects.value = dataItems
      } else {
        projects.value = [...projects.value, ...dataItems]
      }

      pagination.value = {
        current_page: rawData.current_page,
        last_page: rawData.last_page,
        total: rawData.total
      }
    } catch (err: any) {
      error.value = 'Gagal mengambil daftar proyek'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    if (hasMore.value && !loading.value) {
      const nextPage = (pagination.value?.current_page || 1) + 1
      await fetchProjects(nextPage)
    }
  }

  const createProject = async (projectData: Partial<Project>) => {
    try {
      const response = await projectService.createProject(projectData)
      const data = (response.data as any).data || response.data
      
      // PERUBAHAN 2: Unshift agar proyek baru muncul paling atas dengan role Owner
      projects.value.unshift(data)
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
        // PERUBAHAN 3: Memastikan my_role_id tetap ada saat data diupdate
        projects.value[index] = { ...projects.value[index], ...data }
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
      return (response.data as any).data || response.data
    } catch (err: any) {
      error.value = 'Gagal mengambil detail proyek'
      throw err
    }
  }

  const searchProjects = async (query: string) => {
    try {
      const response = await projectService.searchProjects(query)
      const data = (response.data as any).data || response.data
      projects.value = Array.isArray(data) ? data : []
      return data
    } catch (err: any) {
      error.value = 'Gagal mencari proyek'
      throw err
    }
  }

  return {
    projects,
    loading,
    error,
    pagination,
    hasMore,
    fetchProjects,
    loadMore,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    searchProjects,
  }
}
import { defineStore } from 'pinia'
import apiClient from '@/services/api'
import type { Project } from '@/services'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
}

function hitungProgress(tasksCount: number, completedCount: number): number {
  if (tasksCount === 0) return 0
  return Math.round((completedCount / tasksCount) * 100 * 100) / 100
}

function withProgress(data: any): Project {
  return {
    ...data,
    progress: hitungProgress(data.tasks_count ?? 0, data.completed_tasks_count ?? 0),
  }
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    projects:       [],
    currentProject: null,
    loading:        false,
  }),

  actions: {
    async fetchProjects(page = 1, search = '') {
      this.loading = true
      try {
        const res  = await apiClient.get('/projects', {
          params: { page, ...(search !== '' && { search }) },
        })
        const data = (res.data as any).data || res.data
        const list = Array.isArray(data) ? data : []
        this.projects = list.map((p: any) => withProgress(p))
      } finally {
        this.loading = false
      }
    },

    async getProjectById(id: number) {
      this.loading = true
      try {
        const res  = await apiClient.get(`/projects/${id}`)
        const data = (res.data as any).data || res.data
        this.currentProject = withProgress(data)
      } finally {
        this.loading = false
      }
    },

    async createProject(projectData: Partial<Project>) {
      this.loading = true
      try {
        const res     = await apiClient.post('/projects', projectData)
        const data    = (res.data as any).data || res.data
        const project = withProgress(data)
        this.projects.push(project)
        return project
      } finally {
        this.loading = false
      }
    },

    async updateProject(id: number, projectData: Partial<Project>) {
      this.loading = true
      try {
        const res     = await apiClient.put(`/projects/${id}`, projectData)
        const data    = (res.data as any).data || res.data
        const project = withProgress(data)
        const index   = this.projects.findIndex(p => p.id === id)
        if (index !== -1) this.projects[index] = project
        return project
      } finally {
        this.loading = false
      }
    },

    async deleteProject(id: number) {
      this.loading = true
      try {
        await apiClient.delete(`/projects/${id}`)
        this.projects = this.projects.filter(p => p.id !== id)
      } finally {
        this.loading = false
      }
    },
  },
})
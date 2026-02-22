import { defineStore } from 'pinia'
import { projectService } from '../services'

interface Project {
  id: number
  name: string
  description: string
  created_by: number
  created_at: string
  updated_at: string
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    projects: [],
    currentProject: null,
    loading: false,
  }),
  actions: {
    async fetchProjects(page = 1) {
      this.loading = true
      try {
        const res = await projectService.getAllProjects(page)
        const data = (res.data as any).data || res.data
        this.projects = Array.isArray(data) ? data : []
      } finally {
        this.loading = false
      }
    },
    async getProjectById(id: number) {
      this.loading = true
      try {
        const res = await projectService.getProjectById(id)
        const data = (res.data as any).data || res.data
        this.currentProject = data as Project
      } finally {
        this.loading = false
      }
    },
    async createProject(projectData: Partial<Project>) {
      this.loading = true
      try {
        const res = await projectService.createProject(projectData)
        const data = (res.data as any).data || res.data
        this.projects.push(data as Project)
        return data
      } finally {
        this.loading = false
      }
    },
    async updateProject(id: number, projectData: Partial<Project>) {
      this.loading = true
      try {
        const res = await projectService.updateProject(id, projectData)
        const data = (res.data as any).data || res.data
        const index = this.projects.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.projects[index] = data as Project
        }
        return data
      } finally {
        this.loading = false
      }
    },
    async deleteProject(id: number) {
      this.loading = true
      try {
        await projectService.deleteProject(id)
        this.projects = this.projects.filter((p) => p.id !== id)
      } finally {
        this.loading = false
      }
    },
  },
})

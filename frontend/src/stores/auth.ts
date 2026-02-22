import { defineStore } from 'pinia'
import { authService, profileService } from '../services'

interface User {
  id: number
  name: string
  email: string
  role_id: number
  dept_id: number
  api_token?: string
  role?: {
    id: number
    name: string
  }
  department?: {
    id: number
    name: string
  }
}

interface AuthState {
  user: User | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('api_token') || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAuthenticated: (state) => !!state.token,
    isUserDataComplete: (state) =>
      state.user && state.user.role && state.user.department,
  },
  actions: {
    async register(userData: {
      name: string
      email: string
      password: string
      password_confirmation: string
      department?: string | number
    }) {
      const res = await authService.register(userData)
      this.token = res.data.api_token
      this.user = res.data.user
      localStorage.setItem('api_token', this.token)
      return res.data
    },
    async login(credentials: { email: string; password: string }) {
      const res = await authService.login(credentials)
      this.token = res.data.api_token
      this.user = res.data.user
      localStorage.setItem('api_token', this.token)
      return res.data
    },
    async fetchProfile() {
      const res = await profileService.getProfile()
      this.user = res.data.user
    },
    async refreshUserData() {
      try {
        const res = await profileService.getProfile()
        this.user = res.data.user
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    },
    logout() {
      authService.logout()
      this.token = null
      this.user = null
      localStorage.removeItem('api_token')
    },
  },
})

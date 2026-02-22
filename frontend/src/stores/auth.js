import { defineStore } from 'pinia'
import { authService, profileService } from '../services'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('api_token') || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    async login(credentials) {
      const res = await authService.login(credentials)
      this.token = res.data.api_token
      this.user = res.data.user
      localStorage.setItem('api_token', this.token)
      return res.data
    },
    async fetchProfile() {
      const res = await authService.getUserProfile()
      this.user = res.data.user
    },
    logout() {
      authService.logout()
      this.token = null
      this.user = null
      localStorage.removeItem('api_token')
    }
  }
})
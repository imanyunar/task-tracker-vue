import { defineStore } from 'pinia'
import apiClient from '@/services/api'
import type { User } from '@/services'

interface AuthState {
  user: User | null
  token: string | null
  _fetchingProfile: Promise<any> | null  // mencegah double fetch
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    let storedUser = null
    try {
      const userStr = sessionStorage.getItem('user_data')
      if (userStr) storedUser = JSON.parse(userStr)
    } catch (e) {
      console.error('Gagal membaca data user dari sessionStorage', e)
    }
    return {
      user:              storedUser,
      token:             sessionStorage.getItem('api_token') || null,
      _fetchingProfile:  null,
    }
  },

  getters: {
    isLoggedIn:        (state) => !!state.token,
    isAuthenticated:   (state) => !!state.token,
    isUserDataComplete:(state) => !!(state.user && state.user.role && state.user.department),
  },

  actions: {
    async register(userData: any) {
      const res  = await apiClient.post('/register', userData)
      const data = res.data as any

      this.token = data.api_token
      this.user  = data.user

      if (this.token) {
        sessionStorage.setItem('api_token', this.token)
        sessionStorage.setItem('user_data', JSON.stringify(this.user))
      }
      return data
    },

    async login(credentials: { email: string; password: string }) {
      try {
        const res  = await apiClient.post('/login', credentials)
        const data = res.data as any

        const token = data.api_token || data.token || data.access_token
        const user  = data.user || data.data

        if (!token) {
          console.error('Token tidak ditemukan. Periksa struktur API Backend.')
          return false
        }

        this.token = token
        this.user  = user

        sessionStorage.setItem('api_token', token)
        sessionStorage.setItem('user_data', JSON.stringify(user))
        return true
      } catch (error) {
        console.error('Login Store Error:', error)
        throw error
      }
    },

    async fetchProfile() {
      // Kalau sudah ada request yang sedang berjalan, tunggu yang itu saja
      // Ini mencegah App.vue dan router memanggil fetchProfile bersamaan
      if (this._fetchingProfile) return this._fetchingProfile

      this._fetchingProfile = apiClient.get('/profile')
        .then((res) => {
          const data     = res.data as any
          const userData = data.data || data.user || data
          this.user      = userData as User
          sessionStorage.setItem('user_data', JSON.stringify(this.user))
          return userData
        })
        .catch((error: any) => {
          console.error('Token tidak valid atau server offline:', error)
          this.logout()
          throw error
        })
        .finally(() => {
          this._fetchingProfile = null
        })

      return this._fetchingProfile
    },

    async refreshUserData() {
      return this.fetchProfile()
    },

    async logout() {
      try {
        await apiClient.post('/logout')
      } catch {
        console.warn('Gagal menghapus sesi di server, membersihkan lokal saja.')
      } finally {
        this.user  = null
        this.token = null
        sessionStorage.removeItem('api_token')
        sessionStorage.removeItem('user_data')
      }
    },
  },
})
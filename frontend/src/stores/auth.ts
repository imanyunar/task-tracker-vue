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
  state: (): AuthState => {
    // Membaca data awal dari sessionStorage
    let storedUser = null
    try {
      const userStr = sessionStorage.getItem('user_data')
      if (userStr) {
        storedUser = JSON.parse(userStr)
      }
    } catch (e) {
      console.error('Gagal membaca data user dari sessionStorage', e)
    }

    return {
      user: storedUser,
      token: sessionStorage.getItem('api_token') || null,
    }
  },
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAuthenticated: (state) => !!state.token,
    isUserDataComplete: (state) =>
      !!(state.user && state.user.role && state.user.department),
  },
  
  actions: {
    async register(userData: any) {
      const res = await authService.register(userData)
      const responseData = res.data as any
      
      this.token = responseData.api_token
      this.user = responseData.user
      
      if (this.token) {
        sessionStorage.setItem('api_token', this.token)
        sessionStorage.setItem('user_data', JSON.stringify(this.user))
      }
      return responseData
    },

    async login(credentials: { email: string; password: string }) {
      try {
        const res = await authService.login(credentials)
        const responseData = res.data as any
        
        const token = responseData.api_token || responseData.token || responseData.access_token
        const user = responseData.user || responseData.data
        
        if (!token) {
           console.error("Token tidak ditemukan. Periksa struktur API Backend.")
           return false
        }

        this.token = token
        this.user = user
        
        sessionStorage.setItem('api_token', token)
        sessionStorage.setItem('user_data', JSON.stringify(user))
        
        return true
      } catch (error) {
        console.error("Login Store Error:", error)
        throw error
      }
    },

    /**
     * PENTING: Gunakan ini di App.vue atau Router Guard 
     * untuk memastikan token masih ada di DB.
     */
    async fetchProfile() {
      try {
        const res = await profileService.getProfile()
        const responseData = res.data as any
        const userData = responseData.data || responseData.user || responseData
        
        this.user = userData as User
        sessionStorage.setItem('user_data', JSON.stringify(this.user))
        return userData
      } catch (error: any) {
        // Jika token tidak valid atau server offline,
        // paksa logout dan bersihkan sessionStorage
        console.error('Token tidak valid atau server offline:', error)
        this.logout() 
        throw error
      }
    },

    async refreshUserData() {
      return this.fetchProfile() // Re-use fungsi fetchProfile agar konsisten
    },

    async logout() {
      try {
        // Panggil API Logout agar token di Database dihapus secara permanen
        await authService.logout()
      } catch (error) {
        console.warn('Gagal menghapus sesi di server (mungkin server mati), membersihkan lokal saja.')
      } finally {
        // Bersihkan State
        this.user = null
        this.token = null
        
        // Bersihkan Browser Storage
        sessionStorage.removeItem('api_token')
        sessionStorage.removeItem('user_data')
      }
    }
  }
})
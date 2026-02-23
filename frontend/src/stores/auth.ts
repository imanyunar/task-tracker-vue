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
    // 1. Coba ambil data user dari localStorage saat aplikasi pertama dimuat/direfresh
    let storedUser = null
    try {
      const userStr = localStorage.getItem('user_data')
      if (userStr) {
        storedUser = JSON.parse(userStr)
      }
    } catch (e) {
      console.error('Gagal membaca data user dari localStorage', e)
    }

    return {
      user: storedUser,
      token: localStorage.getItem('api_token') || null,
    }
  },
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAuthenticated: (state) => !!state.token,
    isUserDataComplete: (state) =>
      !!(state.user && state.user.role && state.user.department),
  },
  
  actions: {
    async register(userData: {
      name: string
      email: string
      password: string
      password_confirmation: string
      department: string | number
    }) {
      const res = await authService.register(userData)
      const responseData = res.data as any
      
      this.token = responseData.api_token
      this.user = responseData.user
      
      // 2. Simpan token dan data user ke localStorage
      if (this.token) {
        localStorage.setItem('api_token', this.token)
        localStorage.setItem('user_data', JSON.stringify(this.user))
      }
      return responseData
    },

    async login(credentials: { email: string; password: string }) {
      const res = await authService.login(credentials)
      const responseData = res.data as any
      
      this.token = responseData.api_token
      this.user = responseData.user
      
      // 3. Simpan token dan data user ke localStorage
      if (this.token) {
        localStorage.setItem('api_token', this.token)
        localStorage.setItem('user_data', JSON.stringify(this.user))
      }
      return responseData
    },

    async fetchProfile() {
      try {
        const res = await profileService.getProfile()
        
        const responseData = res.data as any
        const userData = responseData.data || responseData.user || responseData
        
        this.user = userData as User
        
        // Update user data di localStorage agar selalu sinkron
        localStorage.setItem('user_data', JSON.stringify(this.user))
        
        return userData
      } catch (error) {
        console.error('Gagal mengambil data profil:', error)
        this.logout() 
        throw error
      }
    },

    async refreshUserData() {
      try {
        const res = await profileService.getProfile()
        
        const responseData = res.data as any
        const userData = responseData.data || responseData.user || responseData
        
        this.user = userData as User
        localStorage.setItem('user_data', JSON.stringify(this.user))
        
        return userData
      } catch (error) {
        console.error('Gagal memuat ulang data profil:', error)
        throw error
      }
    },

    async logout() {
      try {
        // Uncomment baris di bawah jika API backend Anda sudah siap menangani logout token
        // await authService.logout()
      } catch (error) {
        console.error('Gagal logout di server:', error)
      } finally {
        // 4. Bersihkan State Pinia
        this.user = null
        this.token = null
        
        // 5. Bersihkan semua jejak dari memori browser
        localStorage.removeItem('api_token')
        localStorage.removeItem('user_data') // WAJIB DIHAPUS SAAT LOGOUT
      }
    }
  }
})
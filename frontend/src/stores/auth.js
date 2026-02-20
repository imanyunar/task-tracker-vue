import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, profileService } from '../services'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('api_token') || '')
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => !!token.value)
  
  const isUserDataComplete = computed(() => {
    return user.value && user.value.role && user.value.department
  })

  const refreshUserData = async () => {
    if (!isAuthenticated.value) return
    try {
      const response = await profileService.getProfile()
      const profileData = response.data.data || response.data
      // Merge with existing user data
      user.value = { ...user.value, ...profileData }
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (err) {
      console.error('Error refreshing user data:', err)
    }
  }

  const register = async (userData) => {
    loading.value = true
    error.value = ''
    try {
      const response = await authService.register(userData)
      // Backend returns api_token (plain), not token!
      if (response.data.api_token) {
        token.value = response.data.api_token
        user.value = response.data.user
        localStorage.setItem('api_token', response.data.api_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Register failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials) => {
    loading.value = true
    error.value = ''
    try {
      const response = await authService.login(credentials)
      // Backend returns api_token (plain), not token!
      if (response.data.api_token) {
        token.value = response.data.api_token
        user.value = response.data.user
        localStorage.setItem('api_token', response.data.api_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      token.value = ''
      localStorage.removeItem('api_token')
      localStorage.removeItem('user')
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isUserDataComplete,
    register,
    login,
    logout,
    refreshUserData
  }
})

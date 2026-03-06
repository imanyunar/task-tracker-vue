import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'
import type { User } from '@/services'

// useTaskStore    → dipindah ke stores/task.ts
// useProjectStore → dipindah ke stores/project.ts

// ==================== USER STORE ====================
// Dipakai di profile.vue untuk fetch & update profil user yang sedang login

export const useUserStore = defineStore('user', () => {
  const profile = ref<User | null>(null)
  const loading = ref(false)

  const fetchProfile = async () => {
    loading.value = true
    try {
      const res     = await apiClient.get('/profile')
      const data    = res.data as any
      profile.value = data.data || data.user || data
    } catch (err: any) {
      console.error('Gagal fetch profile:', err)
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (userData: Partial<User>) => {
    loading.value = true
    try {
      const res     = await apiClient.put('/profile', userData)
      const data    = res.data as any
      const updated = data.data || data.user || data
      profile.value = updated as User
      sessionStorage.setItem('user_data', JSON.stringify(updated))
      return updated
    } catch (err: any) {
      console.error('Gagal update profile:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return { profile, loading, fetchProfile, updateProfile }
})
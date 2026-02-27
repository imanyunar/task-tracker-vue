import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export interface Notification {
  show: boolean
  message: string
  type: 'success' | 'error'
}

export function useLogin() {
  const authStore = useAuthStore()
  const router = useRouter()

  const email = ref('')
  const password = ref('')
  const loading = ref(false)
  const notification = ref<Notification>({ show: false, message: '', type: 'error' })

  const showNotify = (msg: string, type: 'success' | 'error' = 'error') => {
    notification.value = { show: true, message: msg, type }
    setTimeout(() => { notification.value.show = false }, 4000)
  }

  const handleLogin = async () => {
    loading.value = true
    try {
      const isSuccess = await authStore.login({
        email: email.value,
        password: password.value,
      })
      if (isSuccess) {
        showNotify('Login berhasil!', 'success')
        router.replace({ name: 'Dashboard' })
      }
    } catch (err) {
      showNotify('Email atau password salah', 'error')
    } finally {
      loading.value = false
    }
  }

  return {
    email,
    password,
    loading,
    notification,
    handleLogin,
  }
}
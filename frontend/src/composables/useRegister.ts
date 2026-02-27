import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export function useRegister() {
  const authStore = useAuthStore()
  const router = useRouter()

  const form = ref({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: '' // Menggunakan ID sesuai kebutuhan backend
  })

  // Data statis departemen
  const staticDepartments = [
    { id: 1, name: 'IT Support' },
    { id: 2, name: 'Human Resource' },
    { id: 3, name: 'Marketing' },
    { id: 5, name: 'Finance' },
    { id: 6, name: 'RnD' },
  ]

  const isSubmitting = ref(false)
  const notification = ref({ show: false, message: '', type: 'error' as 'error' | 'success' })

  const showNotify = (msg: string, type: 'error' | 'success' = 'error') => {
    notification.value = { show: true, message: msg, type }
    setTimeout(() => notification.value.show = false, 4000)
  }

  const handleSubmit = async () => {
    if (!form.value.name || !form.value.email || !form.value.password || !form.value.department) {
      return showNotify('Mohon lengkapi seluruh data formulir', 'error')
    }
    if (form.value.password !== form.value.password_confirmation) {
      return showNotify('Konfirmasi password tidak sesuai', 'error')
    }

    isSubmitting.value = true
    try {
      await authStore.register(form.value)
      showNotify('Registrasi Berhasil! Mengalihkan ke Dashboard...', 'success')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Gagal mendaftar. Silakan coba lagi.'
      showNotify(errorMsg, 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    staticDepartments,
    isSubmitting,
    notification,
    handleSubmit,
    showNotify
  }
}
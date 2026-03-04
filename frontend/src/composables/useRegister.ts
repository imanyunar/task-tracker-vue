import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { departmentService } from '../services'
import { useToast } from '@/composables/useToast'
export function useRegister() {
  const authStore = useAuthStore()
  const router    = useRouter()
  const toast     = useToast()  

  const form = ref({
    name:                  '',
    email:                 '',
    password:              '',
    password_confirmation: '',
    department:            '' as string | number,
  })

  // Fetch dari API — tidak hardcoded
  const departments  = ref<{ id: number; name: string }[]>([])
  const loadingDepts = ref(false)

  const isSubmitting = ref(false)
  const notification = ref({ show: false, message: '', type: 'error' as 'error' | 'success' })

  const showNotify = (msg: string, type: 'error' | 'success' = 'error') => {
    notification.value = { show: true, message: msg, type }
    setTimeout(() => (notification.value.show = false), 4000)
  }

  onMounted(async () => {
    loadingDepts.value = true
    try {
      const res = await departmentService.getAllDepartments()
      departments.value = res.data.data || (res.data as any) || []
    } catch {
      showNotify('Gagal memuat daftar departemen', 'error')
    } finally {
      loadingDepts.value = false
    }
  })

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
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.email?.[0]
        || 'Gagal mendaftar. Silakan coba lagi.'
      showNotify(msg, 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    departments,   // ganti staticDepartments → departments (fetch dari API)
    loadingDepts,  // bisa dipakai di template untuk disable select saat loading
    isSubmitting,
    notification,
    handleSubmit,
    showNotify,
  }
}
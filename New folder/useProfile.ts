import { onMounted, ref, reactive } from 'vue'
import { useUserStore } from '../stores'

export function useProfile() {
  const userStore = useUserStore()
  const editing = ref(false)
  const formData = reactive<any>({})
  const loading = ref(false)
  const notification = ref({ show: false, message: '', type: 'error' as 'error' | 'success' })

  const showNotify = (msg: string, type: 'error' | 'success' = 'error') => {
    notification.value = { show: true, message: msg, type }
    setTimeout(() => (notification.value.show = false), 4000)
  }

  onMounted(async () => {
    loading.value = true
    try {
      await userStore.fetchProfile()
      if (userStore.profile) {
        Object.assign(formData, userStore.profile)
      }
    } catch (error) {
      showNotify('Gagal memuat profil', 'error')
    } finally {
      loading.value = false
    }
  })

  const handleEdit = () => {
    editing.value = true
  }

  const handleCancel = () => {
    editing.value = false
    if (userStore.profile) {
      Object.assign(formData, userStore.profile)
    }
  }

  const handleSave = async () => {
    try {
      await userStore.updateProfile(formData)
      showNotify('Profil berhasil diperbarui', 'success')
      editing.value = false
    } catch (error: any) {
      showNotify('Gagal memperbarui profil: ' + error.message, 'error')
    }
  }

  return {
    userStore,
    editing,
    formData,
    loading,
    notification,
    handleEdit,
    handleCancel,
    handleSave,
    showNotify
  }
}
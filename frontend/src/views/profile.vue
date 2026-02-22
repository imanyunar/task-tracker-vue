<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useUserStore } from '../stores'

const userStore = useUserStore()
const editing = ref(false)
const formData = reactive({})
const loading = ref(false)
const notification = ref({ show: false, message: '', type: 'error' })

const showNotify = (msg, type = 'error') => {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => notification.value.show = false, 4000)
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
  } catch (error) {
    showNotify('Gagal memperbarui profil: ' + error.message, 'error')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- Notification -->
    <Transition name="slide">
      <div v-if="notification.show" :class="['fixed top-6 right-6 z-50', notification.type === 'success' ? 'alert-success' : 'alert-danger']">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="notification.type === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <p class="font-semibold">{{ notification.type === 'success' ? 'Berhasil' : 'Gagal' }}</p>
          <p class="text-sm opacity-90">{{ notification.message }}</p>
        </div>
      </div>
    </Transition>

    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8 animate-slide-up">
        <h1 class="text-4xl font-bold text-white mb-2">Profil Saya</h1>
        <p class="text-slate-400">Kelola informasi pribadi dan pengaturan akun Anda</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin">
          <svg class="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else-if="userStore.profile" class="space-y-6">
        <!-- Avatar Card -->
        <div class="card-elevated animate-slide-up" style="animation-delay: 0.1s">
          <div class="card-body">
            <div class="flex items-center gap-6">
              <div class="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-primary text-white text-4xl font-bold shadow-glow-primary">
                {{ userStore.profile.name?.charAt(0) || 'U' }}
              </div>
              <div>
                <h2 class="text-2xl font-bold text-white">{{ userStore.profile.name }}</h2>
                <p class="text-slate-400 mt-1">{{ userStore.profile.email }}</p>
                <div class="flex gap-2 mt-3">
                  <span class="badge badge-primary">{{ userStore.profile.role?.name || 'N/A' }}</span>
                  <span class="badge badge-primary">{{ userStore.profile.department?.name || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Info Card -->
        <div class="card-elevated animate-slide-up" style="animation-delay: 0.2s" v-if="!editing">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-white">Informasi Profil</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-slate-400 text-sm font-medium mb-2">Nama Lengkap</p>
                <p class="text-white text-lg">{{ userStore.profile.name }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm font-medium mb-2">Email</p>
                <p class="text-white text-lg break-all">{{ userStore.profile.email }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm font-medium mb-2">Departemen</p>
                <p class="text-white text-lg">{{ userStore.profile.department?.name || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm font-medium mb-2">Posisi</p>
                <p class="text-white text-lg">{{ userStore.profile.role?.name || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-slate-400 text-sm font-medium mb-2">Bergabung Sejak</p>
                <p class="text-white text-lg">{{ new Date(userStore.profile.created_at).toLocaleDateString('id-ID') }}</p>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button @click="handleEdit" class="btn-primary ml-auto">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profil
            </button>
          </div>
        </div>

        <!-- Edit Form -->
        <div v-else class="card-elevated animate-slide-up" style="animation-delay: 0.2s">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-white">Edit Profil</h3>
          </div>
          <form @submit.prevent="handleSave" class="card-body space-y-4">
            <div class="form-group">
              <label class="label-field">Nama Lengkap</label>
              <input
                v-model="formData.name"
                type="text"
                class="input-field"
                placeholder="Masukkan nama lengkap Anda"
                required
              />
            </div>

            <div class="form-group">
              <label class="label-field">Email</label>
              <input
                v-model="formData.email"
                type="email"
                class="input-field"
                placeholder="Masukkan email Anda"
                required
              />
            </div>
          </form>
          <div class="card-footer gap-3">
            <button @click="handleCancel" type="button" class="btn-secondary">
              Batal
            </button>
            <button @click="handleSave" class="btn-primary">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card-elevated text-center py-16">
        <svg class="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-slate-400 text-lg">Data profil tidak ditemukan</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100px);
  opacity: 0;
}
</style>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({ 
  name: '', 
  email: '', 
  password: '', 
  password_confirmation: '', 
  department: '' 
})

const staticDepartments = [
  { id: 1, name: 'IT Support' },
  { id: 2, name: 'Human Resource' },
  { id: 3, name: 'Marketing' }
]

const isSubmitting = ref(false)
const notification = ref({ show: false, message: '', type: 'error' })

const showNotify = (msg, type = 'error') => {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => notification.value.show = false, 4000)
}

const handleSubmit = async () => {
  if (form.value.password !== form.value.password_confirmation) {
    return showNotify('Password tidak cocok', 'error')
  }
  
  isSubmitting.value = true
  try {
    await authStore.register(form.value)
    showNotify('Pendaftaran berhasil! Selamat datang.', 'success')
    setTimeout(() => router.push('/dashboard'), 1500)
  } catch (err) {
    showNotify(err.response?.data?.message || 'Pendaftaran gagal', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <!-- Animated background blobs -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
    </div>

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

    <!-- Register Card -->
    <div class="w-full max-w-lg relative z-10 animate-slide-up">
      <div class="card-elevated p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary-500 to-primary-500 mb-4 shadow-glow-primary">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white">Buat Akun</h1>
          <div class="mt-4 px-4 py-3 rounded-lg" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);">
            <p class="text-slate-100 text-sm font-medium">Bergabunglah dan kelola tugas Anda dengan lebih baik</p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="form-group">
            <label class="label-field">Nama Lengkap</label>
            <input
              v-model="form.name"
              type="text"
              class="input-field"
              placeholder="Nama Anda"
              required
            />
          </div>

          <div class="form-group">
            <label class="label-field">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="input-field"
              placeholder="nama@example.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="label-field">Departemen</label>
            <select
              v-model="form.department"
              class="select-field"
              required
            >
              <option value="" disabled>Pilih Departemen</option>
              <option v-for="d in staticDepartments" :key="d.id" :value="d.id">
                {{ d.name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="label-field">Password</label>
              <input
                v-model="form.password"
                type="password"
                class="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div class="form-group">
              <label class="label-field">Konfirmasi Password</label>
              <input
                v-model="form.password_confirmation"
                type="password"
                class="input-field"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn-primary w-full mt-6" :disabled="isSubmitting">
            <span v-if="!isSubmitting" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Daftar
            </span>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="divider flex-1"></div>
          <span class="text-xs text-slate-400 uppercase tracking-wide">atau</span>
          <div class="divider flex-1"></div>
        </div>

        <!-- Footer -->
        <p class="text-center text-slate-300 text-sm">
          Sudah punya akun?
          <router-link to="/login" class="text-primary-300 hover:text-primary-200 font-semibold transition-colors">
            Masuk di sini
          </router-link>
        </p>
      </div>

      <!-- Bottom decoration -->
      <p class="text-center text-slate-500 text-xs mt-6">
        © 2026 TaskTracker. Semua hak dilindungi.
      </p>
    </div>
  </div>
</template>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

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
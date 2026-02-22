<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const notification = ref({ show: false, message: '', type: 'error' })

const showNotify = (msg, type = 'error') => {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => {
    notification.value.show = false
  }, 4000)
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    showNotify('Mohon isi email dan password Anda', 'error')
    return
  }

  loading.value = true

  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })
    
    showNotify('Login berhasil! Selamat datang kembali.', 'success')
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (err) {
    showNotify(authStore.error || 'Login gagal, periksa kembali akun Anda', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <!-- Animated background blobs -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
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

    <!-- Login Card -->
    <div class="w-full max-w-md relative z-10 animate-slide-up">
      <div class="card-elevated p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-glow-primary">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white">TaskTracker</h1>
          <div class="mt-4 px-4 py-3 rounded-lg" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);">
            <p class="text-slate-100 text-sm font-medium">Kelola tugas Anda dengan mudah dan efisien</p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="form-group">
            <label class="label-field">Email</label>
            <input
              v-model="email"
              type="email"
              class="input-field"
              placeholder="nama@example.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="label-field">Password</label>
            <input
              v-model="password"
              type="password"
              class="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" class="btn-primary w-full mt-6" :disabled="loading">
            <span v-if="!loading" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Masuk
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
          Belum punya akun?
          <router-link to="/register" class="text-primary-300 hover:text-primary-200 font-semibold transition-colors">
            Daftar sekarang
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
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

// Notification System State
const notification = ref({
  show: false,
  message: '',
  type: 'error' 
})

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
  <div class="main-viewport">
    <div class="login-page-container">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>

      <Transition name="toast">
        <div v-if="notification.show" :class="['toast-wrapper', notification.type]">
          <div class="toast-content">
            <div class="toast-icon">
              <span v-if="notification.type === 'success'">✓</span>
              <span v-else>✕</span>
            </div>
            <div class="toast-text">
              <strong>{{ notification.type === 'success' ? 'Berhasil' : 'Ups!' }}</strong>
              <p>{{ notification.message }}</p>
            </div>
          </div>
          <div class="progress-bar"></div>
        </div>
      </Transition>

      <div class="login-card">
        <header class="brand-section">
          <div class="logo-circle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </div>
          <h1>Task<span>Tracker</span></h1>
          <p>Masuk untuk mengelola tugas harian Anda</p>
        </header>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-stack">
            <div class="form-group">
              <label>Email Address</label>
              <input 
                v-model="email" 
                type="email" 
                placeholder="Masukkan email" 
                required 
              />
            </div>

            <div class="form-group">
              <label>Password</label>
              <input 
                v-model="password" 
                type="password" 
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="!loading">Sign In</span>
            <div v-else class="loader"></div>
          </button>
        </form>

        <footer class="footer-link">
          Belum punya akun? <router-link to="/register">Daftar sekarang</router-link>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* Main Container Fix */
.main-viewport {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #0a0c10;
  display: flex;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.login-page-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* Background Blobs */
.blob {
  position: absolute;
  filter: blur(80px);
  z-index: 0;
  border-radius: 50%;
  opacity: 0.4;
  animation: move 20s infinite alternate;
}
.blob-1 { width: 450px; height: 450px; background: #4f46e5; top: -100px; right: -50px; }
.blob-2 { width: 400px; height: 400px; background: #7c3aed; bottom: -50px; left: -100px; animation-delay: -5s; }
.blob-3 { width: 300px; height: 300px; background: #2563eb; top: 20%; left: 10%; animation-delay: -10s; }

@keyframes move {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(40px, 80px) scale(1.1); }
}

/* Glassmorphism Card */
.login-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: cardShow 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cardShow {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Brand Section */
.brand-section {
  text-align: center;
  margin-bottom: 32px;
}
.logo-circle {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-radius: 14px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}
.logo-circle svg { width: 24px; }
.brand-section h1 {
  color: #fff;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -1px;
}
.brand-section h1 span { color: #818cf8; }
.brand-section p { color: #94a3b8; font-size: 14px; margin-top: 6px; }

/* Form Styles */
.input-stack { display: grid; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { color: #cbd5e1; font-size: 13px; font-weight: 600; padding-left: 4px; }

input {
  background: rgba(15, 23, 42, 0.6);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px 18px;
  color: #fff;
  font-size: 15px;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

/* Submit Button */
.btn-submit {
  width: 100%;
  margin-top: 32px;
  padding: 15px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -6px rgba(99, 102, 241, 0.5);
  filter: brightness(1.1);
}
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* Toast Notification (Sama dengan Register) */
.toast-wrapper {
  position: fixed; top: 30px; right: 30px; z-index: 1000;
  min-width: 320px; padding: 16px; border-radius: 16px;
  background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4); overflow: hidden;
}
.toast-content { display: flex; align-items: center; gap: 16px; }
.toast-icon {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-weight: bold;
}
.error .toast-icon { background: #ef4444; color: white; }
.success .toast-icon { background: #10b981; color: white; }
.toast-text strong { display: block; color: #fff; font-size: 14px; }
.toast-text p { color: #94a3b8; font-size: 13px; margin: 0; }
.progress-bar { position: absolute; bottom: 0; left: 0; height: 4px; width: 100%; }
.error .progress-bar { background: #ef4444; animation: countdown 4s linear; }
.success .progress-bar { background: #10b981; animation: countdown 4s linear; }

@keyframes countdown { from { width: 100%; } to { width: 0%; } }

.toast-enter-active { animation: toastIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-leave-active { animation: toastIn 0.4s reverse cubic-bezier(0.6, -0.28, 0.735, 0.045); }
@keyframes toastIn {
  0% { transform: translateX(100px) scale(0.8); opacity: 0; }
  100% { transform: translateX(0) scale(1); opacity: 1; }
}

.loader {
  width: 20px; height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.footer-link {
  text-align: center;
  margin-top: 24px;
  color: #94a3b8;
  font-size: 14px;
}
.footer-link a { color: #818cf8; text-decoration: none; font-weight: 700; }
.footer-link a:hover { text-decoration: underline; }

/* Responsive HP */
@media (max-width: 480px) {
  .login-card { padding: 30px 20px; }
}
</style>

<style>
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background-color: #0a0c10;
  overflow-x: hidden;
}
#app {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
}
</style>
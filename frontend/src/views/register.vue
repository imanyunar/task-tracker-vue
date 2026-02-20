<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const department_id = ref('')
const loading = ref(false)

const notification = ref({ show: false, message: '', type: 'error' })

const showNotify = (msg, type = 'error') => {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => { notification.value.show = false }, 4000)
}

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value || !passwordConfirm.value || !department_id.value) {
    showNotify('Mohon lengkapi semua field', 'error')
    return
  }
  loading.value = true
  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirm.value,
      department: parseInt(department_id.value)
    })
    showNotify('Akun berhasil dibuat!', 'success')
    setTimeout(() => router.push('/dashboard'), 1500)
  } catch (err) {
    showNotify(authStore.error || 'Registrasi gagal', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="main-viewport">
    <div class="register-container">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>

      <Transition name="toast">
        <div v-if="notification.show" :class="['toast-box', notification.type]">
          <div class="toast-content">
            <span class="icon">{{ notification.type === 'success' ? '✓' : '✕' }}</span>
            <p>{{ notification.message }}</p>
          </div>
        </div>
      </Transition>

      <div class="register-card">
        <header class="brand">
          <div class="logo-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <h1>Task<span>Tracker</span></h1>
          <p>Bergabunglah untuk mulai mengelola tugas</p>
        </header>

        <form @submit.prevent="handleRegister" class="form">
          <div class="input-grid">
            <div class="group">
              <label>Nama Lengkap</label>
              <input v-model="name" type="text" placeholder="Masukkan nama" required />
            </div>
            <div class="group">
              <label>Email Perusahaan</label>
              <input v-model="email" type="email" placeholder="contoh@mail.com" required />
            </div>
            <div class="group">
              <label>Departemen</label>
              <select v-model="department_id" required>
                <option value="" disabled selected>Pilih Departemen</option>
                <option value="1">IT Support</option>
                <option value="2">Human Resource</option>
                <option value="3">Marketing</option>
              </select>
            </div>
            <div class="group">
              <label>Password</label>
              <input v-model="password" type="password" placeholder="••••••••" required />
            </div>
            <div class="group">
              <label>Konfirmasi Password</label>
              <input v-model="passwordConfirm" type="password" placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="!loading">Buat Akun</span>
            <div v-else class="spinner"></div>
          </button>
        </form>

        <p class="footer">
          Sudah punya akun? <router-link to="/login">Masuk sekarang</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ini memastikan background menutupi seluruh lebar monitor tanpa celah */
.main-viewport {
  position: fixed; /* Memaksa container menempel di layar */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #0a0c10;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto; /* Agar bisa di-scroll jika layar HP pendek */
}

.register-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 40px 20px;
}

/* Glassmorphism Card */
.register-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Background Blobs */
.blob {
  position: absolute;
  filter: blur(80px);
  z-index: 1;
  border-radius: 50%;
  opacity: 0.3;
}
.blob-1 { width: 400px; height: 400px; background: #4f46e5; top: -100px; right: -50px; }
.blob-2 { width: 400px; height: 400px; background: #7c3aed; bottom: -100px; left: -50px; }

/* Form Styles */
.brand { text-align: center; margin-bottom: 25px; }
.logo-box {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-radius: 14px;
  margin: 0 auto 15px;
  display: flex; align-items: center; justify-content: center; color: white;
}
.brand h1 { color: #fff; font-size: 26px; font-weight: 800; margin: 0; }
.brand h1 span { color: #818cf8; }
.brand p { color: #94a3b8; font-size: 14px; margin-top: 5px; }

.input-grid { display: grid; gap: 15px; }
.group { display: flex; flex-direction: column; gap: 5px; }
.group label { color: #cbd5e1; font-size: 13px; font-weight: 600; padding-left: 5px; }

input, select {
  background: rgba(15, 23, 42, 0.6);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: #fff;
  transition: 0.3s;
}

input:focus, select:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(30, 41, 59, 0.8);
}

.btn-submit {
  width: 100%;
  margin-top: 25px;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white; border: none; border-radius: 12px;
  font-weight: 700; cursor: pointer; transition: 0.3s;
}

.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.4); }

/* Responsive */
@media (max-width: 480px) {
  .register-card { padding: 30px 20px; }
  .brand h1 { font-size: 22px; }
}

/* Toast */
.toast-box {
  position: fixed; top: 20px; right: 20px; z-index: 1000;
  padding: 15px 25px; border-radius: 16px; background: #1e293b;
  color: white; border: 1px solid rgba(255,255,255,0.1);
}
.toast-content { display: flex; align-items: center; gap: 12px; }
.error { border-left: 4px solid #ef4444; }
.success { border-left: 4px solid #10b981; }

.footer { text-align: center; margin-top: 20px; color: #94a3b8; font-size: 14px; }
.footer a { color: #818cf8; text-decoration: none; font-weight: 700; }

.spinner {
  width: 20px; height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.8s linear infinite; margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>

<style>
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background-color: #0a0c10;
}

#app {
  width: 100%;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
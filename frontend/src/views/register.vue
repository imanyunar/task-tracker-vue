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
  department: '' // Menggunakan ID sesuai kebutuhan backend
})

// Data statis departemen
const staticDepartments = [
  { id: 1, name: 'IT Support' },
  { id: 2, name: 'Human Resource' },
  { id: 3, name: 'Marketing' },

]

const isSubmitting = ref(false)
const notification = ref({ show: false, message: '', type: 'error' })

const showNotify = (msg, type = 'error') => {
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
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Gagal mendaftar. Silakan coba lagi.'
    showNotify(errorMsg, 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#020617]">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-blob"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
    </div>

    <Transition name="notification">
      <div v-if="notification.show" class="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
        <div :class="[
          'flex items-center gap-4 p-5 rounded-2xl shadow-2xl border backdrop-blur-xl',
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        ]">
          <div :class="['p-2 rounded-lg', notification.type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20']">
            <svg v-if="notification.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-lg leading-none mb-1">
              {{ notification.type === 'success' ? 'Berhasil' : 'Perhatian' }}
            </h4>
            <p class="text-sm opacity-80 font-medium">{{ notification.message }}</p>
          </div>
          <button @click="notification.show = false" class="hover:opacity-70 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
          </button>
        </div>
      </div>
    </Transition>

    <div class="w-full max-w-lg relative z-10 animate-slide-up">
      <div class="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/20 rotate-3">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 class="text-4xl font-black text-white tracking-tight mb-2">Buat Akun</h1>
          <p class="text-slate-400 font-medium italic text-sm">Mulai perjalanan produktivitas Anda hari ini.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Nama Lengkap</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
              placeholder="Masukkan nama Anda"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Alamat Email</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Departemen</label>
            <div class="relative">
              <select
                v-model="form.department"
                class="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none"
              >
                <option value="" disabled>Pilih Departemen Kerja</option>
                <option v-for="d in staticDepartments" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
              <input
                v-model="form.password"
                type="password"
                class="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Konfirmasi</label>
              <input
                v-model="form.password_confirmation"
                type="password"
                class="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            class="group relative w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white font-black text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all overflow-hidden disabled:opacity-50"
            :disabled="isSubmitting"
          >
            <div class="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700"></div>
            <span v-if="!isSubmitting" class="flex items-center justify-center gap-3">
              Daftar Sekarang
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
            <div v-else class="flex justify-center items-center gap-2">
              <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </div>
          </button>
        </form>

        <div class="relative my-8 text-center">
          <div class="absolute inset-y-1/2 left-0 w-full h-px bg-slate-800"></div>
          <span class="relative px-4 bg-[#10172a] text-xs font-bold text-slate-500 uppercase tracking-widest">Atau</span>
        </div>

        <p class="text-center text-slate-400 font-medium">
          Sudah punya akun? 
          <router-link to="/login" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30 font-bold transition-colors ml-1">
            Masuk Sekarang
          </router-link>
        </p>
      </div>
      
      <p class="text-center text-slate-600 text-xs mt-8 font-medium tracking-wide">
        &copy; 2026 TASKTRACKER ECOSYSTEM. ALL RIGHTS RESERVED.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Animations */
.animate-blob {
  animation: blob 10s infinite;
}
.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -60px) scale(1.1); }
  66% { transform: translate(-30px, 30px) scale(0.9); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Notification Transition */
.notification-enter-active {
  animation: notifyIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.notification-leave-active {
  animation: notifyIn 0.3s reverse ease-in;
}

@keyframes notifyIn {
  from { opacity: 0; transform: translate(-50%, -100%); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.animation-delay-2000 { animation-delay: 2s; }

/* Custom Scrollbar for Select */
select::-webkit-scrollbar {
  width: 6px;
}
select::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
</style>
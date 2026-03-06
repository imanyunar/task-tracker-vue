<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useList }  from '@/composables/useList'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()
const router    = useRouter()
const toast     = useToast()

const form = ref({
  name: '', email: '', password: '', password_confirmation: '', department: '',
})

const isSubmitting = ref(false)

// departments diambil langsung via useList (bukan staticDepartments lagi)
const { items: departments } = useList('departments')

const handleSubmit = async () => {
  const { name, email, password, password_confirmation, department } = form.value
  if (!name || !email || !password || !department) {
    toast.warning('Mohon lengkapi seluruh data formulir.')
    return
  }
  if (password !== password_confirmation) {
    toast.error('Konfirmasi password tidak sesuai.')
    return
  }
  isSubmitting.value = true
  try {
    await authStore.register(form.value)
    toast.success('Registrasi berhasil! Mengalihkan ke Dashboard...')
    setTimeout(() => router.push('/dashboard'), 1500)
  } catch (err) {
    const msg = err?.response?.data?.message
      ?? err?.response?.data?.errors?.email?.[0]
      ?? 'Gagal mendaftar. Silakan coba lagi.'
    toast.error(msg)
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
              <select v-model="form.department" :disabled="loadingDepts">
                  <option value="" disabled>
                    {{ loadingDepts ? 'Memuat...' : 'Pilih Departemen' }}
                  </option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
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
<script setup>
import { useProfile } from '../composables/useProfile'

const {
  userStore,
  editing,
  formData,
  loading,
  notification,
  handleEdit,
  handleCancel,
  handleSave
} = useProfile()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <Transition name="slide">
      <div v-if="notification.show" :class="['fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md', notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400']">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="notification.type === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <p class="font-bold leading-none">{{ notification.type === 'success' ? 'Berhasil' : 'Gagal' }}</p>
          <p class="text-sm opacity-90 mt-1">{{ notification.message }}</p>
        </div>
      </div>
    </Transition>

    <div class="max-w-4xl mx-auto">
      <div class="mb-8 animate-slide-up">
        <h1 class="text-4xl font-black text-white mb-2 tracking-tight">Profil Saya</h1>
        <p class="text-slate-400 font-medium">Kelola informasi pribadi dan pengaturan akun Anda</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin text-indigo-500">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      <div v-else-if="userStore.profile" class="space-y-6">
        <div class="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2rem] p-8 shadow-2xl animate-slide-up" style="animation-delay: 0.1s">
          <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="relative group">
              <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div class="relative inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-slate-950 text-indigo-400 text-5xl font-black shadow-2xl border border-slate-800">
                {{ userStore.profile.name?.charAt(0) || 'U' }}
              </div>
            </div>
            <div class="text-center md:text-left">
              <h2 class="text-3xl font-black text-white tracking-tight">{{ userStore.profile.name }}</h2>
              <p class="text-slate-400 font-medium mt-1">{{ userStore.profile.email }}</p>
              <div class="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <span class="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-full">
                  {{ userStore.profile.role?.name || 'N/A' }}
                </span>
                <span class="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest rounded-full">
                  {{ userStore.profile.department?.name || 'N/A' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl animate-slide-up" style="animation-delay: 0.2s" v-if="!editing">
          <div class="px-8 py-6 border-b border-slate-800 flex justify-between items-center">
            <h3 class="text-xl font-bold text-white tracking-tight">Informasi Profil</h3>
            <button @click="handleEdit" class="group flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profil
            </button>
          </div>
          <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div v-for="(label, key) in { 'Nama Lengkap': userStore.profile.name, 'Email': userStore.profile.email, 'Departemen': userStore.profile.department?.name || 'N/A', 'Posisi': userStore.profile.role?.name || 'N/A' }" :key="key">
                <p class="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2">{{ key }}</p>
                <p class="text-white text-lg font-semibold break-all">{{ label }}</p>
              </div>
              <div>
                <p class="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Bergabung Sejak</p>
                <p class="text-white text-lg font-semibold">{{ new Date(userStore.profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl animate-slide-up" style="animation-delay: 0.2s">
          <div class="px-8 py-6 border-b border-slate-800">
            <h3 class="text-xl font-bold text-white tracking-tight">Edit Detail Profil</h3>
          </div>
          <form @submit.prevent="handleSave" class="p-8 space-y-6">
            <div class="space-y-2">
              <label class="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium"
                placeholder="Masukkan nama lengkap Anda"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Alamat Email</label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium"
                placeholder="Masukkan email Anda"
                required
              />
            </div>

            <div class="flex items-center justify-end gap-4 pt-4">
              <button @click="handleCancel" type="button" class="px-6 py-3 text-slate-400 hover:text-white font-bold transition-colors">
                Batal
              </button>
              <button type="submit" class="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold transition-all active:scale-95 shadow-xl shadow-indigo-500/20">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-else class="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2rem] text-center py-20 shadow-2xl">
        <div class="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-800">
          <svg class="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-slate-400 text-xl font-bold tracking-tight">Data profil tidak ditemukan</p>
        <p class="text-slate-600 mt-2">Silakan coba muat ulang halaman atau hubungi admin.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transisi Notifikasi */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-enter-from {
  transform: translateX(100px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100px);
  opacity: 0;
}

/* Animasi Slide Up */
.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
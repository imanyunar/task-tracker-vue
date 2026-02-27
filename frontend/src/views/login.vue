<script setup lang="ts">
import { useLogin } from '../composables/useLogin'

const { email, password, loading, notification, handleLogin } = useLogin()
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-slate-950">

    <!-- Ambient blobs — same as other pages -->
    <div class="fixed top-0 -left-10 w-[500px] h-[500px] bg-indigo-600/8 rounded-full filter blur-[120px] animate-blob pointer-events-none"></div>
    <div class="fixed -bottom-20 -right-10 w-[500px] h-[500px] bg-purple-600/8 rounded-full filter blur-[120px] animate-blob animation-delay-2000 pointer-events-none"></div>
    <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-900/10 rounded-full filter blur-[100px] pointer-events-none"></div>

    <!-- Notification -->
    <Transition name="slide">
      <div
        v-if="notification.show"
        :class="[
          'fixed top-6 right-6 z-50 flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl',
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
        ]"
      >
        <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="notification.type === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <p class="font-bold text-sm">{{ notification.type === 'success' ? 'Berhasil' : 'Gagal' }}</p>
          <p class="text-xs opacity-80 mt-0.5">{{ notification.message }}</p>
        </div>
      </div>
    </Transition>

    <!-- Login Card -->
    <div class="w-full max-w-md relative z-10 animate-slide-up">

      <!-- Glass card — same as .card in style.css -->
      <div class="glass rounded-3xl border border-white/5 shadow-2xl p-8 md:p-10">

        <!-- Header -->
        <div class="text-center mb-8">
          <!-- Icon -->
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-5 shadow-lg shadow-indigo-900/30">
            <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>

          <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight mt-2 m-0">
            Selamat <span class="text-gradient-primary">Datang</span>
          </h1>
          <p class="text-slate-500 text-sm mt-2 m-0 font-medium">Masuk untuk mengelola tugas dan proyek tim Anda.</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">

          <div class="form-group">
            <label class="label-field">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                v-model="email"
                type="email"
                required
                placeholder="nama@example.com"
                class="input-field pl-10"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="label-field">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                class="input-field pl-10"
              />
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full rounded-xl mt-2 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <template v-if="!loading">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Masuk
            </template>
            <template v-else>
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Memproses...
            </template>
          </button>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-slate-800"></div>
          <span class="text-[10px] text-slate-600 font-black uppercase tracking-widest">atau</span>
          <div class="flex-1 h-px bg-slate-800"></div>
        </div>

        <!-- Register link -->
        <p class="text-center text-slate-500 text-sm m-0">
          Belum punya akun?
          <router-link to="/register" class="text-indigo-400 hover:text-indigo-300 font-bold transition-colors ml-1">
            Daftar sekarang
          </router-link>
        </p>
      </div>

      <!-- Footer -->
      <p class="text-center text-slate-600 text-[11px] font-medium mt-6 tracking-wider">
        © 2026 TaskTracker. Semua hak dilindungi.
      </p>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(110%);
  opacity: 0;
}
</style>
<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-slate-950">

    <!-- Ambient blobs -->
    <div class="fixed top-0 -left-10 w-[500px] h-[500px] bg-indigo-600/8 rounded-full filter blur-[120px] animate-blob pointer-events-none"></div>
    <div class="fixed -bottom-20 -right-10 w-[500px] h-[500px] bg-purple-600/8 rounded-full filter blur-[120px] animate-blob animation-delay-2000 pointer-events-none"></div>

    <div class="relative z-10 text-center animate-slide-up">

      <!-- 404 number -->
      <div class="relative inline-block mb-6">
        <div class="absolute inset-0 bg-indigo-500 blur-[80px] opacity-10 rounded-full"></div>
        <p class="relative text-[9rem] md:text-[12rem] font-black leading-none tabular-nums text-gradient-primary" style="line-height:1;">
          404
        </p>
      </div>

      <!-- Icon -->
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
        Halaman Tidak Ditemukan
      </h1>
      <p class="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed font-medium">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan. Coba kembali ke dashboard.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          @click="router.push('/dashboard')"
          class="btn btn-primary rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Ke Dashboard
        </button>
        <button
          @click="router.back()"
          class="btn-secondary btn-sm rounded-xl text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>
      </div>

      <!-- dots decoration -->
      <div class="flex justify-center gap-1.5 mt-10">
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-60"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-60"></span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>
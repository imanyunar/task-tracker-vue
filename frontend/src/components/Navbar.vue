<template>
  <nav class="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between min-h-[72px]">
        
        <div class="flex items-center gap-3 flex-shrink-0">
          <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">
              TaskTracker
            </h1>
          </div>
        </div>

        <div class="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          <router-link 
            to="/dashboard" 
            class="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all whitespace-nowrap"
            active-class="bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20"
          >
            Dashboard
          </router-link>
          
          <router-link 
            to="/tasks"
            class="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all whitespace-nowrap"
            active-class="bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20"
          >
            Tasks
          </router-link>
          
          <router-link 
            to="/projects"
            class="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all whitespace-nowrap"
            active-class="bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20"
          >
            Projects
          </router-link>
          
          <div class="hidden sm:block h-5 w-px bg-slate-700 mx-1"></div>
          
          <router-link 
            to="/profile"
            class="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 whitespace-nowrap"
            active-class="bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20"
          >
            Profile
          </router-link>
          
          <button 
            @click="handleLogout"
            class="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-all whitespace-nowrap"
          >
            Logout
          </button>
        </div>
        
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth' // Menggunakan ../ karena keluar dari folder components
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
/* Class tambahan untuk menghilangkan scrollbar bawaan browser saat menu digeser di HP */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
<template>
  <nav class="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 z-50 shadow-lg">
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              TaskTracker
            </h1>
            <p class="text-xs text-slate-400">Manage Your Tasks</p>
          </div>
        </div>

        <!-- Menu -->
        <div class="flex items-center gap-2">
          <router-link 
            to="/dashboard" 
            class="px-4 py-2 rounded-lg text-white font-medium hover:bg-slate-700 transition-all"
          >
            Dashboard
          </router-link>
          <router-link 
            to="/tasks"
            class="px-4 py-2 rounded-lg text-white font-medium hover:bg-slate-700 transition-all"
          >
            Tasks
          </router-link>
          <router-link 
            to="/projects"
            class="px-4 py-2 rounded-lg text-white font-medium hover:bg-slate-700 transition-all"
          >
            Projects
          </router-link>
          <div class="h-6 w-px bg-slate-600 mx-2"></div>
          <router-link 
            to="/profile"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:bg-slate-700 transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Profile
          </router-link>
          <button 
            @click="logout"
            class="px-4 py-2 rounded-lg text-white font-medium hover:text-red-400 hover:bg-red-600 hover:bg-opacity-20 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* No additional CSS needed - all styles via Tailwind classes */
</style>

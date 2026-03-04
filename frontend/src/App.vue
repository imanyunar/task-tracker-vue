<template>
  <div class="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
    <Navbar v-if="authStore.isAuthenticated" />
    
    <main 
      class="flex-grow w-full transition-all duration-300 relative"
      :class="authStore.isAuthenticated ? 'pt-20' : ''"
    >
      <router-view v-slot="{ Component }">
        <transition name="page-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Global Notifications -->
    <ToastContainer />
    <ConfirmModal />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Navbar from './components/Navbar.vue'
import ToastContainer from './components/ToastContainer.vue'
import ConfirmModal from './components/ConfirmModal.vue'

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  const token = localStorage.getItem('api_token') || authStore.token

  if (token && token !== 'undefined' && token !== 'null' && token.length > 0) {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Server timeout')), 5000)
      )
      await Promise.race([authStore.fetchProfile(), timeoutPromise]) 
    } catch (err) {
      console.warn('Sesi tidak valid atau server offline. Logout otomatis...', err.message)
      localStorage.removeItem('api_token')
      localStorage.removeItem('user_data')
      authStore.user = null
      authStore.token = null
      router.push('/login')
    }
  } else {
    authStore.logout()
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

:root {
  --primary: #6366f1;
  --secondary: #a855f7;
  --bg-dark: #0a0c10;
}

* { 
  margin: 0; 
  padding: 0; 
  box-sizing: border-box; 
}

body {
  background-color: var(--bg-dark);
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #ffffff;
  overflow-x: hidden;
}

.page-slide-enter-active, 
.page-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-enter-from { 
  opacity: 0; 
  transform: translateX(20px); 
}

.page-slide-leave-to { 
  opacity: 0; 
  transform: translateX(-20px); 
}
</style>
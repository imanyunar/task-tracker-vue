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
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth' // Pastikan file auth.ts ada di src/stores/
import Navbar from './components/Navbar.vue' // Pastikan file Navbar.vue ada di src/components/

const authStore = useAuthStore()

onMounted(() => {
  const token = localStorage.getItem('api_token')
  // Cek jika token ada dan valid sebelum fetch profile otomatis
  if (token && token !== 'undefined' && token !== 'null' && token.length > 0) {
    authStore.fetchProfile().catch((err) => {
      console.warn('Gagal memuat profil otomatis:', err.message)
    })
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

/* Page Slide Transition */
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
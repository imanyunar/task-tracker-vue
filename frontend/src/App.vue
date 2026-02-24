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
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth' // Mengimpor store dari auth.ts
import Navbar from './components/Navbar.vue' 

const authStore = useAuthStore()
const router = useRouter()

/**
 * Validasi Sesi Manual saat Aplikasi Dimuat
 * Karena SESSION_DRIVER di Laravel menggunakan Redis, data sesi bisa hilang jika server restart.
 */
onMounted(async () => {
  // Mengambil token dari localStorage atau store
  const token = localStorage.getItem('api_token') || authStore.token

  // Cek jika token ada sebelum melakukan validasi ke backend
  if (token && token !== 'undefined' && token !== 'null' && token.length > 0) {
    try {
      /**
       * Memanggil profileService.getProfile() melalui action di Pinia.
       * Jika Redis masih menyimpan sesi ini, data user akan diperbarui.
       */
      // Menggunakan Promise.race untuk menambahkan timeout
      // Jika server tidak merespons dalam 5 detik, anggap server offline
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Server timeout')), 5000)
      )
      
      await Promise.race([
        authStore.fetchProfile(),
        timeoutPromise
      ]) 
    } catch (err) {
      /**
       * Jika fetchProfile gagal (Error 401 Unauthorized atau Server Mati):
       * 1. Action logout() di auth.ts akan dipanggil secara otomatis oleh blok catch di sana.
       * 2. Menghapus api_token dan user_data dari localStorage.
       * 3. Mengarahkan user kembali ke halaman login.
       */
      console.warn('Sesi tidak valid di Redis atau server offline. Logout otomatis...', err.message)
      
      //强制清除本地存储
      localStorage.removeItem('api_token')
      localStorage.removeItem('user_data')
      authStore.user = null
      authStore.token = null
      
      router.push('/login')
    }
  } else {
    /**
     * Jika tidak ada token sama sekali saat aplikasi dimuat, 
     * pastikan state Pinia benar-benar bersih.
     */
    authStore.logout()
  }
})
</script>

<style>
/* Font dan Global Style */
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

/* Page Slide Transition - Transisi antar halaman router */
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
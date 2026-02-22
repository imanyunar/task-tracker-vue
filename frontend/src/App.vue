<template>
  <router-view v-slot="{ Component }">
    <transition name="page-slide" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  const token = localStorage.getItem('token')
  // Validasi token sebelum hit API untuk mencegah 401 di awal load
  if (token && token !== 'undefined' && token !== 'null') {
    try {
      await authStore.fetchProfile()
    } catch (error) {
      authStore.logout()
    }
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

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background-color: var(--bg-dark);
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #ffffff;
  overflow-x: hidden;
}

/* Page Slide Transition */
.page-slide-enter-active, .page-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-slide-enter-from { opacity: 0; transform: translateX(20px); }
.page-slide-leave-to { opacity: 0; transform: translateX(-20px); }
</style>
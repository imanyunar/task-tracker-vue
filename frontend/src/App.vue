<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-container">
    <nav v-if="isAuthenticated" class="main-navbar">
      <div class="nav-content">
        <div class="nav-left">
          <div class="brand-logo">
            <span class="logo-icon">➔</span>
            <span class="brand-text">Task <span class="text-purple">Tracker</span></span>
          </div>
          
          <div class="nav-links">
            <RouterLink to="/dashboard" class="nav-item">Dashboard</RouterLink>
            <RouterLink to="/tasks" class="nav-item">Tasks</RouterLink>
            <RouterLink to="/projects" class="nav-item">Projects</RouterLink>
            <RouterLink to="/profile" class="nav-item">Profile</RouterLink>
          </div>
        </div>

        <div class="nav-right">
          <div class="user-info">
            <span class="user-name">{{ user?.name || 'User' }}</span>
            <div class="user-roles">
              <span class="role-badge admin">ADMIN</span>
              <span class="role-badge dept">{{ user?.department?.name || 'IT SUPPORT' }}</span>
            </div>
          </div>
          
          <button @click="handleLogout" class="logout-btn">
            <span class="logout-icon">Logout</span>
          </button>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* BAGIAN RESET GLOBAL: 
  Ini kunci untuk menghilangkan warna abu-abu di seluruh aplikasi 
*/
html, body {
  margin: 0;
  padding: 0;
  background-color: #0a0c10 !important; /* Warna hitam pekat sesuai dashboard */
  color: #f8fafc;
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow-x: hidden;
}

#app {
  background-color: #0a0c10;
  min-height: 100vh;
}

/* Container Utama */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0a0c10;
}

/* Styling Navbar Glassmorphism */
.main-navbar {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 24px;
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
}

.nav-content {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.5px;
}

.logo-icon {
  background: #818cf8;
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.text-purple {
  color: #818cf8;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-item {
  text-decoration: none;
  color: #94a3b8;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.05);
}

.router-link-active {
  color: #818cf8 !important;
  background: rgba(129, 140, 248, 0.1) !important;
  border-bottom: 2px solid #818cf8;
  border-radius: 0;
}

/* User Info & Logout */
.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 700;
  font-size: 14px;
  color: #f8fafc;
}

.user-roles {
  display: flex;
  gap: 5px;
  margin-top: 2px;
}

.role-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.role-badge.admin {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.role-badge.dept {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Scrollbar Styling agar tetap gelap */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #0a0c10;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}
</style>
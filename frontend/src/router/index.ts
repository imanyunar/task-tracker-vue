import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/register.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/tasks.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: () => import('../views/TaskDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/projects.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:id/chat',
    name: 'ProjectChat',
    component: () => import('../views/ProjectChat.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('../views/ProjectDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/departments',
    name: 'Departments',
    component: () => import('../views/department.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/employee.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/not-found.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore()
    const token = localStorage.getItem('api_token') || authStore.token

    // Tidak ada token yang valid
    if (!token || token === 'undefined' || token === 'null' || token.length === 0) {
      if (to.meta.requiresAuth) return next({ name: 'Login' })
      return next()
    }

    // Ada token tapi user belum di-load (misal: fresh page load / F5)
    // Harus fetch dulu supaya requiresAdmin tidak salah evaluasi karena user masih null
    if (!authStore.user) {
      try {
        await authStore.fetchProfile()
      } catch {
        // Token tidak valid → bersihkan sesi dan arahkan ke login
        localStorage.removeItem('api_token')
        localStorage.removeItem('user_data')
        authStore.user = null
        authStore.token = null
        return next({ name: 'Login' })
      }
    }

    // User sudah login, jangan biarkan masuk ke halaman guest (login/register)
    if (to.meta.requiresGuest) {
      return next({ name: 'Dashboard' })
    }

    // Halaman khusus admin — cek role setelah user pasti sudah ter-load
    if (to.meta.requiresAdmin && authStore.user?.role_id !== 1) {
      return next({ name: 'Dashboard' })
    }

    return next()
  }
)

export default router
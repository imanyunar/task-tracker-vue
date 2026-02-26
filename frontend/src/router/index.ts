import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login', // Biasanya landing awal ke login jika belum ada session
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login.vue'),
    meta: { requiresGuest: true }, // Gunakan meta khusus tamu
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
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore()
    
    // AMBIL TOKEN LANGSUNG DARI STORAGE UNTUK KEAMANAN EKSTRA
    // Ini memastikan router tidak hanya mengandalkan state Pinia yang mungkin telat update
    const token = localStorage.getItem('api_token') || authStore.token

    if (to.meta.requiresAuth && !token) {
      // Jika butuh auth tapi tidak ada token, paksa ke login
      next({ name: 'Login' })
    } else if (to.meta.requiresGuest && token) {
      // Jika sudah login tapi coba buka Login/Register, lempar ke dashboard
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
)

export default router
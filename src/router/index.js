import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/publicar',
    name: 'publicar',
    component: () => import('@/views/PublicarView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/mensajes',
    name: 'mensajes',
    component: () => import('@/views/MensajesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reservas',
    name: 'reservas',
    component: () => import('@/views/ReservasView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('@/views/ProfileSetupView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      return { name: 'login', query: { return: to.fullPath } }
    }
  }
})

export default router

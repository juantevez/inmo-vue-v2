<template>
  <header class="navbar">
    <div class="nav-container">
      <RouterLink to="/" class="nav-logo">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="4" fill="#C9A96E"/>
          <path d="M8 22 L16 10 L24 22" stroke="#1A1814" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 22 L12 17 L20 17 L20 22" stroke="#1A1814" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Inmo</span>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink to="/?op=SALE" class="nav-link">Comprar</RouterLink>
        <RouterLink to="/?op=RENT" class="nav-link">Alquilar</RouterLink>
        <RouterLink to="/?op=TEMP" class="nav-link">Temporario</RouterLink>
      </nav>

      <div class="nav-actions">
        <template v-if="auth.isLoggedIn">
          <span class="nav-greeting">Hola, {{ auth.firstName }}</span>
          <RouterLink to="/publicar" class="btn-nav-register">Publicar propiedad</RouterLink>
          <button class="btn-nav-logout" @click="handleLogout">Salir</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn-nav-login">Ingresá</RouterLink>
          <RouterLink to="/login?tab=register&return=/publicar" class="btn-nav-register">Publicar propiedad</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

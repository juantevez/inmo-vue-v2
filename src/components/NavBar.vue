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
        <template v-if="auth.isLoggedIn">
          <div class="nav-sep" aria-hidden="true" />
          <RouterLink to="/mensajes" class="nav-link nav-link-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Mensajes
          </RouterLink>
          <RouterLink to="/reservas" class="nav-link nav-link-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Reservas
          </RouterLink>
        </template>
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

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('inmo_token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('inmo_user') || 'null'))

  const isLoggedIn  = computed(() => !!token.value)
  const firstName   = computed(() => user.value?.firstName || user.value?.email?.split('@')[0] || null)
  const userId      = computed(() => {
    if (!token.value) return null
    try {
      return JSON.parse(atob(token.value.split('.')[1])).sub || null
    } catch { return null }
  })

  function setAuth(newToken, newUser) {
    token.value = newToken
    user.value  = newUser
    localStorage.setItem('inmo_token', newToken)
    localStorage.setItem('inmo_user', JSON.stringify(newUser))
  }

  function updateUser(patch) {
    user.value = { ...user.value, ...patch }
    localStorage.setItem('inmo_user', JSON.stringify(user.value))
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('inmo_token')
    localStorage.removeItem('inmo_user')
    localStorage.removeItem('inmo_pending_email')
    localStorage.removeItem('inmo_pending_role')
  }

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(token.value ? { 'Authorization': `Bearer ${token.value}` } : {}),
    }
  }

  return { token, user, isLoggedIn, firstName, userId, setAuth, updateUser, logout, authHeaders }
})

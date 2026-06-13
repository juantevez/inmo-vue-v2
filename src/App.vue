<template>
  <NavBar v-if="showNav" />
  <RouterView />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const route   = useRoute()
const noNavRoutes = ['/login', '/perfil']
const showNav = computed(() => !noNavRoutes.includes(route.path))
</script>

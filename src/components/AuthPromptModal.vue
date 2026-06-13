<template>
  <Teleport to="body">
    <div class="modal-overlay" :class="{ open: modelValue }" @click.self="$emit('update:modelValue', false)">
      <div class="modal-auth" @click.stop>
        <div class="auth-prompt-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h3 class="auth-prompt-title">{{ title }}</h3>
        <p class="auth-prompt-sub">{{ sub }}</p>
        <div class="auth-prompt-actions">
          <RouterLink :to="registerUrl" class="btn-auth-cta">Crear cuenta gratis</RouterLink>
          <RouterLink to="/login" class="btn-auth-secondary">Ya tengo cuenta — Ingresá</RouterLink>
        </div>
        <button class="auth-prompt-skip" @click="$emit('update:modelValue', false)">Seguir viendo propiedades</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  action: { type: String, default: 'contact' },
  propId: { type: String, default: '' },
})
defineEmits(['update:modelValue'])

const TITLES = {
  contact: 'Contactá al propietario',
  visit:   'Agendá una visita',
}
const SUBS = {
  contact: 'Registrate gratis para enviar un mensaje directo al propietario.',
  visit:   'Registrate para reservar un horario de visita con el agente.',
}

const title = computed(() => TITLES[props.action] || 'Para continuar necesitás una cuenta')
const sub   = computed(() => SUBS[props.action]   || '')

const registerUrl = computed(() => {
  const returnUrl = encodeURIComponent(`/?prop=${props.propId}&action=${props.action}`)
  return `/login?tab=register&return=${returnUrl}`
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" :class="{ open: modelValue }" @click.self="$emit('update:modelValue', false)">
      <div class="modal-visit" @click.stop>
        <div class="modal-visit-header">
          <p class="modal-visit-label">Agendar visita</p>
          <p class="modal-visit-prop">{{ prop?.title || 'Propiedad' }}</p>
          <button class="modal-visit-close" @click="$emit('update:modelValue', false)" aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-visit-body">
          <div class="visit-datetime-row">
            <div class="visit-field">
              <label>Fecha</label>
              <input type="date" v-model="date" :min="minDate" />
            </div>
          </div>

          <div class="visit-field">
            <label>Horario sugerido</label>
            <div class="visit-time-chips">
              <button
                v-for="t in timeOptions"
                :key="t.value"
                class="time-chip"
                :class="{ selected: selectedTime === t.value }"
                type="button"
                @click="selectedTime = t.value"
              >{{ t.label }}</button>
            </div>
          </div>

          <div class="visit-field">
            <label>Mensaje (opcional)</label>
            <textarea v-model="message" placeholder="¿Algo que quieras aclarar antes de la visita?" rows="3" />
          </div>

          <div v-if="msgText" class="visit-msg" :class="[msgType, 'visible']">{{ msgText }}</div>
        </div>

        <div class="modal-visit-footer">
          <button class="btn-visit-cancel" type="button" @click="$emit('update:modelValue', false)">Cancelar</button>
          <button class="btn-visit-submit" :class="{ loading }" :disabled="loading" type="button" @click="submit">
            <span class="btn-text">Enviar propuesta</span>
            <span class="btn-loader" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const props = defineProps({
  modelValue: Boolean,
  prop: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

const auth = useAuthStore()

const date         = ref('')
const message      = ref('')
const selectedTime = ref(null)
const loading      = ref(false)
const msgText      = ref('')
const msgType      = ref('error')

const API = 'http://127.0.0.1:8000'

const timeOptions = [
  { label: '09:00', value: '09:00' },
  { label: '11:00', value: '11:00' },
  { label: '14:00', value: '14:00' },
  { label: '16:00', value: '16:00' },
  { label: '18:00', value: '18:00' },
]

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

watch(() => props.modelValue, (val) => {
  if (val) {
    date.value = ''
    message.value = ''
    selectedTime.value = null
    msgText.value = ''
  }
})

async function submit() {
  if (!date.value) {
    msgText.value = 'Seleccioná una fecha para la visita.'
    msgType.value = 'error'
    return
  }

  if (!auth.isLoggedIn) {
    emit('update:modelValue', false)
    return
  }

  loading.value = true
  msgText.value = ''

  try {
    const chatRes = await fetch(`${API}/api/v1/chats`, {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify({ property_id: props.prop.id }),
    })

    if (!chatRes.ok) {
      const err = await chatRes.json().catch(() => ({}))
      msgText.value = err.message || `Error al iniciar conversación (${chatRes.status}).`
      msgType.value = 'error'
      return
    }

    const chatData = await chatRes.json()
    const chatId   = chatData.id || chatData.conversation_id
    if (!chatId) throw new Error('sin id de chat')

    const time             = selectedTime.value || '12:00'
    const proposedDatetime = `${date.value}T${time}:00`

    const proposalRes = await fetch(`${API}/api/v1/chats/${chatId}/visit-proposals`, {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify({
        proposed_datetime: proposedDatetime,
        message: message.value || null,
      }),
    })

    if (!proposalRes.ok) {
      const err = await proposalRes.json().catch(() => ({}))
      msgText.value = err.message || `Error al enviar propuesta (${proposalRes.status}).`
      msgType.value = 'error'
      return
    }

    msgText.value = '¡Propuesta enviada! El agente confirmará el horario a la brevedad.'
    msgType.value = 'success'
    setTimeout(() => emit('update:modelValue', false), 2200)
  } catch (err) {
    msgText.value = 'No se pudo conectar. Verificá tu conexión e intentá de nuevo.'
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

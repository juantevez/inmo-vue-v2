<template>
  <div class="res-card" :class="statusClass">
    <div class="res-card-header">
      <div class="res-card-avatar">{{ initials }}</div>
      <div class="res-card-info">
        <div class="res-card-guest">{{ res.guest_name || 'Inquilino' }}</div>
        <div class="res-card-prop">{{ res.property_title || `Propiedad ${(res.property_id || '').slice(0, 8)}` }}</div>
      </div>
      <span class="res-status-badge" :class="`badge-${res.status}`">{{ statusLabel }}</span>
    </div>

    <div class="res-card-body">
      <div class="res-field">
        <span class="res-field-lbl">Check-in</span>
        <span class="res-field-val">{{ formatDate(res.check_in_date) }}</span>
      </div>
      <div class="res-field">
        <span class="res-field-lbl">Check-out</span>
        <span class="res-field-val">{{ formatDate(res.check_out_date) }}</span>
      </div>
      <div class="res-field">
        <span class="res-field-lbl">Noches / Total</span>
        <span class="res-field-val">{{ nights }}n · {{ fmtCurrency(res.total_amount || res.total || 0, res.currency) }}</span>
      </div>

      <div class="res-card-actions">
        <template v-if="showActions">
          <button class="btn-reject" @click="$emit('reject', res.id)">
            <span class="btn-text">Rechazar</span>
          </button>
          <button class="btn-accept" @click="$emit('view', res)">
            <span class="btn-text">Ver detalle</span>
          </button>
        </template>
        <template v-else>
          <button class="btn-ghost" @click="$emit('view', res)">Ver detalle</button>
        </template>
      </div>
    </div>

    <div v-if="res.guest_message" class="res-card-message">
      <div class="res-message-text">"{{ res.guest_message }}"</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  res: { type: Object, required: true },
  showActions: { type: Boolean, default: false },
})
defineEmits(['view', 'reject'])

const STATUS_CLASS = {
  PENDING_APPROVAL: 'pending',
  CONFIRMED:        'confirmed',
  CANCELLED:        'cancelled',
  REJECTED:         'rejected',
  COMPLETED:        '',
}

const STATUS_LABEL = {
  PENDING_APPROVAL: 'Pendiente',
  CONFIRMED:        'Confirmada',
  CANCELLED:        'Cancelada',
  REJECTED:         'Rechazada',
  COMPLETED:        'Completada',
}

const statusClass = computed(() => STATUS_CLASS[props.res.status] || '')
const statusLabel = computed(() => STATUS_LABEL[props.res.status] || props.res.status)

const initials = computed(() => {
  const name = props.res.guest_name || 'I'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const nights = computed(() => {
  const a = props.res.check_in_date
  const b = props.res.check_out_date
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86_400_000))
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtCurrency(amount, currency = 'USD') {
  const n = Number(amount || 0)
  if (currency === 'ARS') return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
  return `U$S ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
</script>

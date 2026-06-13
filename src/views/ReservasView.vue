<template>
  <div class="app">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-top">
        <RouterLink to="/" class="logo">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="4" fill="#C9A96E"/>
            <path d="M8 22 L16 10 L24 22" stroke="#1A1814" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 22 L12 17 L20 17 L20 22" stroke="#1A1814" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="logo-text">Inmo</span>
        </RouterLink>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          Inicio
        </RouterLink>
        <RouterLink to="/reservas" class="nav-item active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Reservas
          <span v-if="pendingCount > 0" id="nav-pending-count" class="nav-badge">{{ pendingCount }}</span>
        </RouterLink>
        <RouterLink to="/mensajes" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Mensajes
        </RouterLink>
      </nav>

      <div class="sidebar-bottom">
        <div class="user-chip">
          <div class="user-avatar">{{ userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ displayName }}</span>
            <span class="user-email">{{ auth.user?.email || '' }}</span>
          </div>
        </div>
        <button class="btn-logout" @click="handleLogout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Salir
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="main">

      <!-- Topbar -->
      <div class="topbar">
        <div class="topbar-left">
          <button class="btn-hamburger" @click="sidebarOpen = !sidebarOpen" aria-label="Menú">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span class="page-title">Reservas</span>
        </div>
        <div class="topbar-right">
          <div class="status-pill">
            <span class="status-dot" :class="{ error: !connected }" id="status-dot" />
            <span id="status-text">{{ connected ? 'Conectado' : 'Sin conexión' }}</span>
          </div>
          <span id="last-refresh-text" style="font-size:11px;color:var(--ink-40)">{{ lastRefresh }}</span>
        </div>
      </div>

      <!-- Alert banner -->
      <div v-if="pendingCount > 0 && !bannerDismissed" id="alert-banner" class="alert-banner">
        <div class="alert-banner-content">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <p id="alert-banner-text">Tenés {{ pendingCount }} solicitud{{ pendingCount !== 1 ? 'es' : '' }} de reserva pendiente{{ pendingCount !== 1 ? 's' : '' }} de aprobación.</p>
            <p id="alert-banner-sub" class="alert-banner-sub">Revisalas para que los inquilinos reciban una respuesta a tiempo.</p>
          </div>
        </div>
        <button class="alert-banner-close" @click="bannerDismissed = true" aria-label="Cerrar">×</button>
      </div>

      <!-- Vista de reservas -->
      <div class="view active">

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-val">{{ stats.pending }}</span>
            <span class="stat-lbl">Pendientes</span>
          </div>
          <div class="stat-card">
            <span class="stat-val">{{ stats.confirmed }}</span>
            <span class="stat-lbl">Confirmadas</span>
          </div>
          <div class="stat-card">
            <span class="stat-val">{{ stats.completed }}</span>
            <span class="stat-lbl">Completadas</span>
          </div>
          <div class="stat-card">
            <span class="stat-val">{{ stats.cancelled }}</span>
            <span class="stat-lbl">Canceladas / Rechazadas</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="res-tabs">
          <button
            v-for="tab in tabDefs"
            :key="tab.key"
            class="res-tab"
            :class="{ active: activeTab === tab.key }"
            :id="`tab-${tab.key}`"
            :aria-selected="activeTab === tab.key"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
            <span class="res-tab-count" :class="{ 'has-items': tab.key === 'pending' && pendingCount > 0 }">
              {{ tab.key === 'pending' ? pendingList.length : tab.key === 'confirmed' ? confirmedList.length : historyList.length }}
            </span>
          </button>
        </div>

        <!-- Panel pending -->
        <div v-show="activeTab === 'pending'" id="panel-pending">
          <div v-if="!pendingList.length" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <p>No hay solicitudes pendientes</p>
            <span>Cuando un inquilino solicite una reserva, aparecerá acá.</span>
          </div>
          <div v-for="r in pendingList" :key="r.id">
            <ReservationCard :res="r" :show-actions="true" @view="openActionModal" @reject="openRejectModal" />
          </div>
        </div>

        <!-- Panel confirmed -->
        <div v-show="activeTab === 'confirmed'" id="panel-confirmed">
          <div v-if="!confirmedList.length" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p>Sin registros</p>
            <span>No hay reservas confirmadas aún.</span>
          </div>
          <div v-for="r in confirmedList" :key="r.id">
            <ReservationCard :res="r" :show-actions="false" @view="openActionModal" />
          </div>
        </div>

        <!-- Panel history -->
        <div v-show="activeTab === 'history'" id="panel-history">
          <div v-if="!historyList.length" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p>Sin registros</p>
            <span>No hay reservas en esta categoría aún.</span>
          </div>
          <div v-for="r in historyList" :key="r.id">
            <ReservationCard :res="r" :show-actions="false" @view="openActionModal" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast container -->
  <div id="toast-container" class="toast-container">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
      <svg v-if="t.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      <svg v-else-if="t.type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      <span>{{ t.text }}</span>
    </div>
  </div>

  <!-- Modal de detalle/acción -->
  <Teleport to="body">
    <div v-if="actionModal.open" class="modal-overlay open" @click.self="actionModal.open = false">
      <div class="modal modal-lg" @click.stop>
        <div class="modal-header">
          <h2 id="modal-prop-title">{{ actionModal.title }}</h2>
          <button class="modal-close" @click="actionModal.open = false" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body" v-if="actionModal.res">
          <!-- Guest info -->
          <div class="guest-row">
            <div class="guest-avatar-lg">{{ getInitials(actionModal.res.guest_name || 'I') }}</div>
            <div class="guest-details">
              <div class="guest-name">{{ actionModal.res.guest_name || 'Inquilino' }}</div>
              <div class="guest-meta">
                <span v-if="actionModal.res.guest_email">{{ actionModal.res.guest_email }}</span>
                <span v-if="actionModal.res.guest_phone">{{ actionModal.res.guest_phone }}</span>
                <span>ID: <code style="font-size:11px">{{ actionModal.res.id }}</code></span>
              </div>
            </div>
          </div>
          <!-- Fechas -->
          <div class="dates-block">
            <div class="date-field"><span class="date-lbl">Check-in</span><span class="date-val">{{ formatDate(actionModal.res.check_in_date) }}</span></div>
            <div class="date-field"><span class="date-lbl">Check-out</span><span class="date-val">{{ formatDate(actionModal.res.check_out_date) }}</span></div>
            <div class="date-field"><span class="date-lbl">Estadía</span><span class="date-val">{{ calcNights(actionModal.res.check_in_date, actionModal.res.check_out_date) }} noche{{ calcNights(actionModal.res.check_in_date, actionModal.res.check_out_date) !== 1 ? 's' : '' }}</span></div>
          </div>
          <!-- Desglose financiero -->
          <div class="finance-block">
            <div class="finance-title">Desglose financiero</div>
            <div class="finance-rows">
              <div v-if="actionModal.res.night_price > 0" class="finance-row">
                <span>{{ calcNights(actionModal.res.check_in_date, actionModal.res.check_out_date) }} noches × {{ fmtCurrency(actionModal.res.night_price, actionModal.res.currency) }}</span>
                <span>{{ fmtCurrency(actionModal.res.subtotal || actionModal.res.night_price * calcNights(actionModal.res.check_in_date, actionModal.res.check_out_date), actionModal.res.currency) }}</span>
              </div>
              <div v-if="actionModal.res.cleaning_fee > 0" class="finance-row">
                <span>Limpieza</span><span>{{ fmtCurrency(actionModal.res.cleaning_fee, actionModal.res.currency) }}</span>
              </div>
              <div v-if="actionModal.res.security_deposit > 0" class="finance-row" style="color:var(--ink-40)">
                <span>Depósito en garantía <small>(reintegrable)</small></span>
                <span>{{ fmtCurrency(actionModal.res.security_deposit, actionModal.res.currency) }}</span>
              </div>
              <div class="finance-row total">
                <span>Total bruto a recibir</span>
                <span class="finance-amount">{{ fmtCurrency(actionModal.res.total_amount || actionModal.res.total || 0, actionModal.res.currency) }}</span>
              </div>
            </div>
          </div>
          <div v-if="actionModal.res.guest_message" class="message-block">
            <div class="message-lbl">Mensaje del inquilino</div>
            <div class="message-text">{{ actionModal.res.guest_message }}</div>
          </div>
          <div v-if="actionMsg.text" class="form-msg" :class="[actionMsg.type, 'visible']">{{ actionMsg.text }}</div>
        </div>
        <div class="modal-footer" id="modal-action-footer">
          <template v-if="actionModal.res?.status === 'PENDING_APPROVAL'">
            <button class="btn-ghost" @click="actionModal.open = false">Cancelar</button>
            <button class="btn-reject" :class="{ loading: rejecting }" :disabled="rejecting" @click="openRejectModal(actionModal.res?.id)">
              <span class="btn-text">Rechazar</span><span class="btn-loader" />
            </button>
            <button class="btn-accept" :class="{ loading: accepting }" :disabled="accepting" @click="acceptReservation(actionModal.res?.id)">
              <span class="btn-text">Aceptar reserva</span><span class="btn-loader" />
            </button>
          </template>
          <button v-else class="btn-ghost" @click="actionModal.open = false">Cerrar</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal de rechazo -->
  <Teleport to="body">
    <div v-if="rejectModal.open" class="modal-overlay open" @click.self="rejectModal.open = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Rechazar solicitud</h2>
          <button class="modal-close" @click="rejectModal.open = false" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <p style="font-size:13.5px;color:var(--ink-70)">Seleccioná el motivo del rechazo:</p>
          <div class="reject-reasons">
            <label v-for="r in rejectReasons" :key="r.value" class="reject-radio">
              <input type="radio" name="reject-reason" :value="r.value" v-model="rejectReason" />
              {{ r.label }}
            </label>
          </div>
          <div v-if="rejectMsg.text" class="form-msg" :class="[rejectMsg.type, 'visible']">{{ rejectMsg.text }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="rejectModal.open = false">Cancelar</button>
          <button id="btn-reject-confirm" class="btn-reject" :class="{ loading: rejecting }" :disabled="rejecting" @click="confirmReject">
            <span class="btn-text">Confirmar rechazo</span><span class="btn-loader" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import ReservationCard from '@/components/ReservationCard.vue'

const router = useRouter()
const auth   = useAuthStore()

const API           = 'http://localhost:8000'
const POLL_INTERVAL = 30_000

if (!auth.isLoggedIn) { router.push('/login') }

const reservations  = ref([])
const connected     = ref(true)
const lastRefresh   = ref('')
const sidebarOpen   = ref(false)
const bannerDismissed = ref(false)
const activeTab     = ref('pending')

const accepting  = ref(false)
const rejecting  = ref(false)
const actionMsg  = ref({ text: '', type: '' })
const rejectMsg  = ref({ text: '', type: '' })
const rejectReason = ref('OTHER')

const actionModal = ref({ open: false, res: null, title: '' })
const rejectModal = ref({ open: false, resId: null })
const toasts      = ref([])

let pollTimer = null

const tabDefs = [
  { key: 'pending',   label: 'Pendientes' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'history',   label: 'Historial' },
]

const rejectReasons = [
  { value: 'DATES_UNAVAILABLE', label: 'Fechas no disponibles' },
  { value: 'GUEST_REJECTED',    label: 'No apruebo al huésped' },
  { value: 'OTHER',             label: 'Otro motivo' },
]

const pendingList   = computed(() => reservations.value.filter(r => r.status === 'PENDING_APPROVAL'))
const confirmedList = computed(() => reservations.value.filter(r => r.status === 'CONFIRMED'))
const historyList   = computed(() => reservations.value.filter(r => ['CANCELLED','REJECTED','COMPLETED'].includes(r.status)))

const pendingCount  = computed(() => pendingList.value.length)

const stats = computed(() => ({
  pending:   pendingList.value.length,
  confirmed: confirmedList.value.length,
  completed: reservations.value.filter(r => r.status === 'COMPLETED').length,
  cancelled: reservations.value.filter(r => ['CANCELLED','REJECTED'].includes(r.status)).length,
}))

const userInitials = computed(() => {
  const u = auth.user
  if (!u) return '?'
  const fn = u.firstName?.[0] || ''
  const ln = u.lastName?.[0]  || ''
  return (fn + ln).toUpperCase() || '?'
})

const displayName = computed(() => {
  const u = auth.user
  return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '' : ''
})

function getInitials(name) {
  return (name || 'I').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

async function loadAll() {
  try {
    const res = await fetch(`${API}/api/v1/reservations/owner`, { headers: auth.authHeaders() })
    if (res.status === 401) { auth.logout(); router.push('/login'); return }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    reservations.value = Array.isArray(data) ? data : (data.reservations || data.items || data.data || [])
    connected.value  = true
    const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    lastRefresh.value = `Actualizado ${now}`
  } catch (_) {
    connected.value = false
  }
}

function openActionModal(r) {
  actionMsg.value    = { text: '', type: '' }
  actionModal.value  = { open: true, res: r, title: `Solicitud — ${r.property_title || 'Propiedad'}` }
}

function openRejectModal(id) {
  rejectMsg.value   = { text: '', type: '' }
  rejectReason.value = 'OTHER'
  rejectModal.value = { open: true, resId: id }
}

async function acceptReservation(id) {
  accepting.value     = true
  actionMsg.value     = { text: '', type: '' }
  try {
    const res = await fetch(`${API}/api/v1/reservations/${id}/confirm`, { method: 'POST', headers: auth.authHeaders() })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      actionMsg.value = { text: err.message || `Error ${res.status}`, type: 'error' }
      return
    }
    actionModal.value.open = false
    showToast('¡Reserva confirmada con éxito!', 'success')
    await loadAll()
  } catch (_) {
    actionMsg.value = { text: 'No se pudo conectar.', type: 'error' }
  } finally {
    accepting.value = false
  }
}

async function confirmReject() {
  rejecting.value = true
  rejectMsg.value = { text: '', type: '' }
  const id = rejectModal.value.resId || actionModal.value.res?.id
  try {
    const res = await fetch(`${API}/api/v1/reservations/${id}/cancel`, {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify({ reason: rejectReason.value }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      rejectMsg.value = { text: err.message || `Error ${res.status}`, type: 'error' }
      return
    }
    rejectModal.value.open = false
    actionModal.value.open = false
    showToast('Solicitud rechazada.', 'error')
    await loadAll()
  } catch (_) {
    rejectMsg.value = { text: 'No se pudo conectar.', type: 'error' }
  } finally {
    rejecting.value = false
  }
}

function showToast(text, type = '') {
  const id = Date.now()
  toasts.value.push({ id, text, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 4200)
}

function handleLogout() { auth.logout(); router.push('/') }

/* ── Utils ── */
function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function calcNights(a, b) {
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86_400_000))
}

function fmtCurrency(amount, currency = 'USD') {
  const n = Number(amount || 0)
  if (currency === 'ARS') return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
  return `U$S ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

onMounted(async () => {
  await loadAll()
  pollTimer = setInterval(loadAll, POLL_INTERVAL)
})

onUnmounted(() => clearInterval(pollTimer))
</script>

<style>
@import '@/assets/reservations.css';
</style>

<template>
  <div class="mensajes-app" :class="{ 'chat-open': activeChatPanel }">

    <!-- Panel izquierdo: lista de conversaciones -->
    <aside class="conv-list-panel" :class="{ hidden: activeChatPanel && isMobile }">
      <div class="conv-list-header">
        <div class="topbar-user">
          <div class="topbar-avatar">{{ userInitials }}</div>
          <div class="topbar-info">
            <span class="topbar-name">Mensajes</span>
            <span class="topbar-role">{{ roleLabel }}</span>
          </div>
        </div>
        <div class="conv-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="conv-search-input" type="text" v-model="searchQuery" placeholder="Buscar conversación…" />
        </div>
      </div>

      <div class="conv-list" id="conv-list">
        <template v-if="filteredConvs.length">
          <div
            v-for="c in filteredConvs"
            :key="c.id"
            class="conv-item"
            :class="{ active: activeConvId === c.id, unread: c.unread_count > 0 && activeConvId !== c.id }"
            @click="selectConversation(c.id)"
          >
            <div class="conv-avatar">{{ getInitials(c.partner_name || 'U') }}</div>
            <div class="conv-item-body">
              <div class="conv-item-top">
                <span class="conv-item-name">{{ c.partner_name || 'Usuario' }}</span>
                <span class="conv-item-time">{{ fmtTime(c.updated_at) }}</span>
              </div>
              <div class="conv-item-prop">{{ c.property_title || c.property_id?.slice(0, 12) || '—' }}</div>
              <div class="conv-item-preview">{{ c.last_message || 'Sin mensajes aún' }}</div>
            </div>
            <div class="conv-unread-dot" />
          </div>
        </template>
        <div v-else class="conv-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p>{{ searchQuery ? 'Sin resultados' : 'Sin conversaciones' }}</p>
          <span>{{ searchQuery ? 'Probá con otra búsqueda' : 'Cuando consultes por una propiedad, aparecerá acá' }}</span>
        </div>
      </div>
    </aside>

    <!-- Panel derecho: hilo de mensajes -->
    <section class="chat-panel" :class="{ visible: activeChatPanel }">

      <!-- Back (mobile) -->
      <button v-if="isMobile && activeChatPanel" class="btn-back" @click="goBackToList">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15 18 9 12 15 6"/></svg>
        Conversaciones
      </button>

      <!-- Placeholder cuando no hay chat seleccionado -->
      <div v-if="!activeConvId" id="chat-placeholder" class="chat-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <p>Seleccioná una conversación para leer los mensajes</p>
      </div>

      <template v-if="activeConvId">
        <!-- Header del chat -->
        <div class="chat-header" id="chat-header">
          <div class="chat-header-avatar" id="chat-header-avatar">{{ activeConvInitials }}</div>
          <div class="chat-header-info">
            <div class="chat-header-name" id="chat-header-name">{{ activeConv?.partner_name || '—' }}</div>
            <div class="chat-header-prop" id="chat-header-prop">{{ activeConv?.property_title || '—' }}</div>
          </div>
          <div class="chat-status">
            <span class="chat-status-dot" :class="{ polling: true }" id="chat-status-dot" />
            <span class="chat-status-text" id="chat-status-text">En vivo</span>
          </div>
        </div>

        <!-- Mensajes -->
        <div class="chat-messages" id="chat-messages" ref="messagesEl">
          <template v-if="loadingMessages">
            <div class="conv-skeleton" style="flex-direction:column;gap:12px;padding:20px 24px;align-items:flex-start">
              <div style="display:flex;gap:10px;align-self:flex-start;max-width:55%">
                <div class="skel-circle" style="width:28px;height:28px;flex-shrink:0" />
                <div class="skel-lines"><div class="skel-line" /><div class="skel-line short" /></div>
              </div>
              <div style="align-self:flex-end;max-width:60%;width:100%">
                <div class="skel-lines"><div class="skel-line" /></div>
              </div>
            </div>
          </template>

          <template v-else>
            <div v-if="!messages.length" class="chat-empty">
              <div class="chat-empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <p>Sin mensajes aún</p>
              <span>Escribí el primer mensaje</span>
            </div>

            <template v-for="(msg, idx) in messages" :key="msg.id">
              <!-- Separador de fecha -->
              <div v-if="shouldShowDate(idx)" class="msg-date-sep">{{ fmtDate(msg.created_at) }}</div>

              <!-- Propuesta de visita -->
              <div v-if="msg.type === 'visit_proposal'" class="visit-proposal-card" :data-proposal-id="msg.visit_proposal?.id || msg.id">
                <div class="visit-card-header">
                  <div class="visit-card-icon" :class="visitStatus(msg)">
                    <svg v-if="visitStatus(msg) === 'confirmed'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else-if="visitStatus(msg) === 'rejected'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <span class="visit-card-label" :class="visitStatus(msg)">
                    {{ { pending: 'Visita propuesta', confirmed: 'Visita confirmada', rejected: 'Visita rechazada' }[visitStatus(msg)] }}
                  </span>
                </div>
                <div class="visit-card-body">
                  <div class="visit-card-datetime">{{ fmtDatetimeFull(msg.visit_proposal?.proposed_datetime || msg.visit_proposal?.datetime) }}</div>
                  <div v-if="msg.visit_proposal?.message || msg.content" class="visit-card-msg">{{ msg.visit_proposal?.message || msg.content }}</div>
                </div>
                <div v-if="canRespondVisit(msg)" class="visit-card-actions">
                  <button class="btn-visit-confirm" @click="respondVisit(msg.visit_proposal?.id || msg.id, 'confirm')">Confirmar</button>
                  <button class="btn-visit-reject"  @click="respondVisit(msg.visit_proposal?.id || msg.id, 'reject')">Rechazar</button>
                </div>
              </div>

              <!-- Burbuja normal -->
              <div v-else class="msg-bubble-wrap" :class="msg.sender_id === userId ? 'mine' : 'theirs'">
                <div class="msg-bubble">{{ msg.content || msg.body || '' }}</div>
                <span v-if="shouldShowTime(idx)" class="msg-meta">{{ fmtTime(msg.created_at) }}</span>
              </div>
            </template>
          </template>
        </div>

        <!-- Input de mensaje -->
        <div class="chat-input-bar" id="chat-input-bar">
          <textarea
            id="chat-input"
            v-model="inputText"
            placeholder="Escribí un mensaje…"
            rows="1"
            @keydown.enter.prevent="sendMessage"
            @input="autoResize"
            ref="inputEl"
          />
          <button class="btn-send" id="btn-send" :disabled="sendingMsg || !inputText.trim()" @click="sendMessage">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const API           = 'http://localhost:8000'
const POLL_CONV_MS  = 15_000
const POLL_MSG_MS   =  5_000

const conversations  = ref([])
const messages       = ref([])
const activeConvId   = ref(null)
const loadingMessages = ref(false)
const sendingMsg     = ref(false)
const inputText      = ref('')
const searchQuery    = ref('')
const isMobile       = ref(window.innerWidth <= 700)
const activeChatPanel = ref(false)

const messagesEl = ref(null)
const inputEl    = ref(null)

let pollConvTimer = null
let pollMsgTimer  = null
let lastMsgCount  = 0

if (!auth.isLoggedIn) {
  router.push(`/login?return=${encodeURIComponent(route.fullPath)}`)
}

const userId = computed(() => auth.userId)
const userInitials = computed(() => {
  const u = auth.user
  if (!u) return '?'
  const name = u.firstName || u.email || '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
})
const roleLabel = computed(() => {
  const r = auth.user?.role || auth.user?.profileType || ''
  return { PROPIETARIO: 'Propietario', INQUILINO: 'Inquilino', INTERESADO: 'Buscador', PROVEEDOR: 'Proveedor' }[r] || r || ''
})

const filteredConvs = computed(() => {
  if (!searchQuery.value) return conversations.value
  const q = searchQuery.value.toLowerCase()
  return conversations.value.filter(c => {
    const prop    = (c.property_title || c.property_id || '').toLowerCase()
    const partner = (c.partner_name   || '').toLowerCase()
    return prop.includes(q) || partner.includes(q)
  })
})

const activeConv = computed(() => conversations.value.find(c => c.id === activeConvId.value) || null)
const activeConvInitials = computed(() => getInitials(activeConv.value?.partner_name || 'U'))

function getInitials(name) {
  return (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

/* ── Load conversations ── */
async function loadConversations() {
  try {
    const res  = await fetch(`${API}/api/v1/chats`, { headers: auth.authHeaders() })
    if (res.status === 401 || res.status === 403) { auth.logout(); router.push('/login'); return }
    if (!res.ok) return
    const data = await res.json()
    conversations.value = Array.isArray(data) ? data : (data.conversations || data.items || [])
  } catch (_) {}
}

/* ── Select conversation ── */
async function selectConversation(convId) {
  if (activeConvId.value === convId) return
  activeConvId.value = convId
  lastMsgCount       = 0
  activeChatPanel.value = true
  loadingMessages.value = true

  clearInterval(pollMsgTimer)
  await loadMessages()
  loadingMessages.value = false
  pollMsgTimer = setInterval(pollMessages, POLL_MSG_MS)
}

/* ── Messages ── */
async function loadMessages() {
  try {
    const res  = await fetch(`${API}/api/v1/chats/${activeConvId.value}?limit=60&offset=0`, { headers: auth.authHeaders() })
    if (!res.ok) { if (res.status === 401) { auth.logout(); router.push('/login') }; return }
    const data = await res.json()
    messages.value = normalizeMessages(data)
    lastMsgCount   = messages.value.length
    await nextTick()
    scrollToBottom()
  } catch (_) {}
}

async function pollMessages() {
  if (!activeConvId.value) return
  try {
    const res  = await fetch(`${API}/api/v1/chats/${activeConvId.value}?limit=60&offset=0`, { headers: auth.authHeaders() })
    if (!res.ok) return
    const data = await res.json()
    const msgs = normalizeMessages(data)
    if (msgs.length !== lastMsgCount) {
      messages.value = msgs
      lastMsgCount   = msgs.length
      await nextTick()
      scrollToBottom()
    }
  } catch (_) {}
}

function normalizeMessages(data) {
  const msgs = Array.isArray(data) ? data : (data.messages || data.items || [])
  return msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
}

/* ── Send ── */
async function sendMessage() {
  if (!activeConvId.value || !inputText.value.trim()) return

  const content   = inputText.value.trim()
  inputText.value = ''
  sendingMsg.value = true

  const optimistic = {
    id: 'opt-' + Date.now(),
    sender_id: userId.value,
    content,
    created_at: new Date().toISOString(),
    type: 'text',
  }
  messages.value.push(optimistic)
  await nextTick()
  scrollToBottom()

  try {
    const res = await fetch(`${API}/api/v1/chats/${activeConvId.value}/messages`, {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify({ body: content }),
    })
    if (!res.ok) {
      messages.value = messages.value.filter(m => m.id !== optimistic.id)
    }
  } catch (_) {
    messages.value = messages.value.filter(m => m.id !== optimistic.id)
  } finally {
    sendingMsg.value = false
    inputEl.value?.focus()
  }
}

/* ── Visit proposals ── */
function visitStatus(msg) {
  return msg.visit_proposal?.status || 'pending'
}

function canRespondVisit(msg) {
  const userRole = auth.user?.role || auth.user?.profileType || ''
  return visitStatus(msg) === 'pending' && ['PROPIETARIO', 'agente', 'admin'].includes(userRole)
}

async function respondVisit(proposalId, action) {
  const endpoint = action === 'confirm'
    ? `${API}/api/v1/chats/${activeConvId.value}/visit-proposals/${proposalId}/confirm`
    : `${API}/api/v1/chats/${activeConvId.value}/visit-proposals/${proposalId}/reject`
  try {
    const res = await fetch(endpoint, { method: 'POST', headers: auth.authHeaders() })
    if (res.ok) await loadMessages()
  } catch (_) {}
}

/* ── Mobile ── */
function goBackToList() {
  activeChatPanel.value = false
  activeConvId.value    = null
  clearInterval(pollMsgTimer)
}

/* ── UI helpers ── */
function scrollToBottom() {
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

function autoResize(e) {
  e.target.style.height = 'auto'
  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
}

function shouldShowDate(idx) {
  if (idx === 0) return true
  const prev = messages.value[idx - 1]
  const curr = messages.value[idx]
  return fmtDate(prev.created_at) !== fmtDate(curr.created_at)
}

function shouldShowTime(idx) {
  if (idx === 0) return true
  const prev = messages.value[idx - 1]
  const curr = messages.value[idx]
  return prev.sender_id !== curr.sender_id || prev.type === 'visit_proposal'
}

/* ── Date/time formatters ── */
function fmtTime(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) } catch { return '' }
}

function fmtDate(iso) {
  if (!iso) return ''
  try {
    const d   = new Date(iso)
    const hoy = new Date()
    const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1)
    if (d.toDateString() === hoy.toDateString())  return 'Hoy'
    if (d.toDateString() === ayer.toDateString()) return 'Ayer'
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
  } catch { return '' }
}

function fmtDatetimeFull(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

/* ── Lifecycle ── */
onMounted(async () => {
  await loadConversations()
  pollConvTimer = setInterval(loadConversations, POLL_CONV_MS)

  window.addEventListener('resize', () => { isMobile.value = window.innerWidth <= 700 })

  const convId = route.query.conv
  if (convId) {
    setTimeout(() => selectConversation(convId), 400)
  }
})

onUnmounted(() => {
  clearInterval(pollConvTimer)
  clearInterval(pollMsgTimer)
})
</script>

<style>
@import '@/assets/mensajes.css';
</style>

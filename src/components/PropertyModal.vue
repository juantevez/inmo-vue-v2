<template>
  <Teleport to="body">
    <div class="modal-overlay" :class="{ open: modelValue }" @click.self="close">
      <div class="modal-detail" @click.stop>
        <button class="modal-close" @click="close" aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <!-- Media -->
        <div class="modal-detail-img">
          <template v-if="mediaImages.length">
            <img v-if="mediaImages[0].type !== 'VIDEO'" class="detail-main-img" :src="mediaImages[0].url" alt="Foto principal" />
            <video v-else class="detail-main-img" :src="mediaImages[0].url" controls preload="metadata" />
            <div v-if="mediaImages.length > 1" class="detail-thumbs">
              <template v-for="(m, i) in mediaImages.slice(1)" :key="i">
                <img v-if="m.type !== 'VIDEO'" class="detail-thumb-sm" :src="m.url" alt="" loading="lazy"
                  @click="swapMain(m)" />
                <video v-else class="detail-thumb-sm" :src="m.url" preload="none" @click="swapMain(m)" />
              </template>
            </div>
            <div v-if="socialLinks.length" class="detail-social-pills">
              <a v-for="(url, platform) in socialLinks[0].social_links" :key="platform"
                class="detail-social-pill" :href="url" target="_blank" rel="noopener">{{ platform }}</a>
            </div>
          </template>
          <svg v-else width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".15" aria-hidden="true">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>

        <!-- Body -->
        <div class="modal-detail-body">
          <!-- Info -->
          <div v-if="!editOpen">
            <div v-if="prop?.operation_type" class="detail-op-badge">{{ opLabel }}</div>
            <h2 class="detail-title">{{ prop?.title || 'Sin título' }}</h2>
            <p class="detail-address">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {{ prop?.address || prop?.location?.address || '—' }}
            </p>
            <div class="detail-price">
              <span class="detail-price-amount">{{ formattedPrice }}</span>
              <span class="detail-price-currency">{{ currency }}</span>
            </div>
            <p v-if="prop?.description" class="detail-desc">{{ prop.description }}</p>
            <div v-if="petChip" class="detail-pet-chip">{{ petChip }}</div>
          </div>

          <!-- Acciones (solo si no es dueño) -->
          <div v-if="!isOwner && !editOpen" class="modal-detail-actions">
            <button class="btn-contact" @click="handleContact">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Enviar mensaje al propietario
            </button>
            <button class="btn-visit" :class="{ sent: visitSent }" @click="handleVisit">
              <template v-if="visitSent">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Propuesta enviada
              </template>
              <template v-else>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Agendar visita
              </template>
            </button>
          </div>

          <div v-if="actionMsg" class="detail-action-msg">{{ actionMsg }}</div>

          <!-- Botón editar (solo dueño) -->
          <button v-if="isOwner && !editOpen" class="btn-edit-prop" @click="editOpen = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar publicación
          </button>

          <!-- Formulario de edición inline -->
          <section v-if="editOpen" id="detail-edit-section">
            <div class="edit-form-header">
              <h3 class="edit-form-title">Editar publicación</h3>
              <button class="edit-form-cancel" type="button" @click="editOpen = false">Cancelar</button>
            </div>
            <form @submit.prevent="submitEdit">
              <div class="edit-form-grid">
                <div class="edit-field full">
                  <label class="edit-label">Título</label>
                  <input class="edit-input" type="text" v-model="editForm.title" maxlength="120" />
                </div>
                <div class="edit-field full">
                  <label class="edit-label">Descripción</label>
                  <textarea class="edit-input edit-textarea" v-model="editForm.description" rows="3" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Precio</label>
                  <input class="edit-input" type="number" v-model.number="editForm.price" min="0" step="0.01" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Moneda</label>
                  <select class="edit-input edit-select" v-model="editForm.currency">
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div class="edit-field full">
                  <label class="edit-label">Dirección</label>
                  <input class="edit-input" type="text" v-model="editForm.address" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Mascotas</label>
                  <select class="edit-input edit-select" v-model="editForm.pet_policy">
                    <option value="NOT_ALLOWED">No permite mascotas</option>
                    <option value="SMALL_ONLY">Solo mascotas chicas/medianas</option>
                    <option value="ALLOWED">Permite mascotas</option>
                  </select>
                </div>

                <!-- Fotos -->
                <div class="edit-field full">
                  <div class="edit-photos-header">
                    <span class="edit-label">Fotos</span>
                    <label class="btn-add-photo" for="edit-photo-input">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Agregar foto
                      <input type="file" id="edit-photo-input" accept="image/*,video/*" multiple style="display:none" @change="handlePhotoSelect" />
                    </label>
                  </div>
                  <div class="edit-photos-grid">
                    <span v-if="!editPhotos.length && !loadingPhotos" class="edit-photos-empty">Sin fotos aún</span>
                    <span v-if="loadingPhotos" class="edit-photos-loading">Cargando…</span>
                    <div v-for="m in editPhotos" :key="m.id" class="edit-photo-item">
                      <img v-if="m.type !== 'VIDEO'" class="edit-photo-thumb" :src="m.url" alt="" loading="lazy" />
                      <video v-else class="edit-photo-thumb" :src="m.url" preload="none" />
                      <button class="edit-photo-del" type="button" @click="deletePhoto(m.id)" aria-label="Eliminar foto">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
                  <div v-if="photoMsg" class="edit-photos-msg error">{{ photoMsg }}</div>
                </div>

                <!-- Campos TEMP -->
                <template v-if="prop?.operation_type === 'TEMP'">
                  <div class="edit-temp-fields edit-field full">
                    <div class="edit-temp-divider">Alquiler temporario</div>
                    <div class="edit-temp-grid">
                      <div class="edit-field">
                        <label class="edit-label">Precio por noche</label>
                        <input class="edit-input" type="number" v-model.number="editForm.night_price" min="0" step="0.01" />
                      </div>
                      <div class="edit-field">
                        <label class="edit-label">Limpieza</label>
                        <input class="edit-input" type="number" v-model.number="editForm.cleaning_fee" min="0" step="0.01" />
                      </div>
                      <div class="edit-field">
                        <label class="edit-label">Depósito</label>
                        <input class="edit-input" type="number" v-model.number="editForm.security_deposit" min="0" step="0.01" />
                      </div>
                      <div class="edit-field">
                        <label class="edit-label">Mín. noches</label>
                        <input class="edit-input" type="number" v-model.number="editForm.min_nights" min="1" step="1" />
                      </div>
                      <div class="edit-field">
                        <label class="edit-label">Máx. noches</label>
                        <input class="edit-input" type="number" v-model.number="editForm.max_nights" min="1" step="1" />
                      </div>
                      <div class="edit-field">
                        <label class="edit-label">Check-in</label>
                        <input class="edit-input" type="time" v-model="editForm.check_in_time" />
                      </div>
                      <div class="edit-field">
                        <label class="edit-label">Check-out</label>
                        <input class="edit-input" type="time" v-model="editForm.check_out_time" />
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <div v-if="editMsg.text" class="edit-form-msg" :class="editMsg.type">{{ editMsg.text }}</div>

              <div class="edit-form-actions">
                <button class="btn-save-edit" type="submit" :disabled="savingEdit">
                  {{ savingEdit ? 'Guardando…' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: Boolean,
  prop: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'require-auth', 'visit-opened', 'prop-updated'])

const auth   = useAuthStore()
const router = useRouter()

const API = 'http://127.0.0.1:8000'

const mediaImages  = ref([])
const socialLinks  = ref([])
const mainMedia    = ref(null)
const editOpen     = ref(false)
const editPhotos   = ref([])
const loadingPhotos = ref(false)
const photoMsg     = ref('')
const savingEdit   = ref(false)
const editMsg      = ref({ text: '', type: '' })
const actionMsg    = ref('')
const visitSent    = ref(false)

const editForm = ref({
  title: '', description: '', address: '',
  price: '', currency: 'ARS', pet_policy: 'NOT_ALLOWED',
  night_price: '', cleaning_fee: '', security_deposit: '',
  min_nights: '', max_nights: '', check_in_time: '', check_out_time: '',
})

const isOwner = computed(() => {
  if (!auth.isLoggedIn || !props.prop) return false
  return String(auth.userId) === String(props.prop.owner_id)
})

const opLabel = computed(() => ({ SALE: 'En venta', RENT: 'En alquiler', TEMP: 'Temporario' })[props.prop?.operation_type] || '')

const rawPrice = computed(() =>
  typeof props.prop?.price === 'object' ? props.prop?.price?.amount : props.prop?.price
)
const currency = computed(() =>
  (typeof props.prop?.price === 'object' ? props.prop?.price?.currency : props.prop?.currency) || 'ARS'
)
const formattedPrice = computed(() =>
  Number(rawPrice.value || props.prop?.amount || 0).toLocaleString('es-AR')
)

const petChip = computed(() => {
  const p = props.prop?.pet_policy
  if (!p || p === 'NOT_ALLOWED') return null
  return p === 'SMALL_ONLY' ? 'Solo mascotas chicas/medianas 🐾' : 'Acepta mascotas 🐾'
})

watch(() => props.modelValue, async (val) => {
  if (!val || !props.prop) return
  editOpen.value = false
  visitSent.value = false
  actionMsg.value = ''
  mediaImages.value = []
  socialLinks.value = []
  await loadMedia()
  if (isOwner.value) await loadEditPhotos()
})

watch(editOpen, (val) => {
  if (val) fillEditForm()
})

function close() {
  emit('update:modelValue', false)
}

async function loadMedia() {
  try {
    const res   = await fetch(`${API}/api/v1/properties/${props.prop.id}/media`)
    if (!res.ok) return
    const items = await res.json()
    if (!Array.isArray(items)) return
    mediaImages.value = items.filter(m => m.type === 'IMAGE' || m.type === 'VIDEO')
    socialLinks.value = items.filter(m => m.type === 'SOCIAL_LINK')
  } catch (_) {}
}

function swapMain(m) {
  const idx = mediaImages.value.indexOf(m)
  if (idx > 0) {
    const tmp = mediaImages.value[0]
    mediaImages.value[0] = m
    mediaImages.value[idx] = tmp
  }
}

async function handleContact() {
  if (!auth.isLoggedIn) {
    emit('require-auth', { action: 'contact', propId: props.prop.id })
    return
  }
  const btn = document.querySelector('.btn-contact')
  if (btn) { btn.disabled = true; btn.textContent = 'Iniciando chat…' }
  try {
    const res = await fetch(`${API}/api/v1/chats`, {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify({ property_id: props.prop.id, advertiser_id: props.prop.owner_id }),
    })
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      actionMsg.value = friendlyContactError(errBody.message || '')
      if (btn) { btn.disabled = false; btn.textContent = 'Enviar mensaje al propietario' }
      return
    }
    const data   = await res.json()
    const chatId = data.id || data.conversation_id
    close()
    router.push(`/mensajes?conv=${chatId}`)
  } catch (err) {
    actionMsg.value = 'No se pudo iniciar la conversación. Intentá de nuevo.'
    if (btn) { btn.disabled = false; btn.textContent = 'Enviar mensaje al propietario' }
  }
}

function handleVisit() {
  if (!auth.isLoggedIn) {
    emit('require-auth', { action: 'visit', propId: props.prop.id })
    return
  }
  emit('visit-opened', props.prop)
}

function friendlyContactError(msg) {
  if (msg.includes('mismo usuario')) return 'Esta es tu propia propiedad — no podés enviarte un mensaje a vos mismo.'
  if (msg.includes('advertiser_id') || msg.includes('obligatorio')) return 'Faltan datos de la propiedad. Cerrá y volvé a intentarlo.'
  return msg || 'No se pudo iniciar la conversación. Intentá de nuevo.'
}

function fillEditForm() {
  const p = props.prop
  const rawPrice = typeof p.price === 'object' ? p.price?.amount : p.price
  const cur = (typeof p.price === 'object' ? p.price?.currency : p.currency) || 'ARS'
  editForm.value = {
    title: p.title || '', description: p.description || '',
    address: p.address || p.location?.address || '',
    price: rawPrice || '', currency: cur,
    pet_policy: p.pet_policy || 'NOT_ALLOWED',
    night_price: p.night_price || '', cleaning_fee: p.cleaning_fee || '',
    security_deposit: p.security_deposit || '', min_nights: p.min_nights || '',
    max_nights: p.max_nights || '', check_in_time: p.check_in_time || '',
    check_out_time: p.check_out_time || '',
  }
  editMsg.value = { text: '', type: '' }
}

async function loadEditPhotos() {
  loadingPhotos.value = true
  photoMsg.value = ''
  try {
    const res   = await fetch(`${API}/api/v1/properties/${props.prop.id}/media`)
    const items = res.ok ? await res.json() : []
    editPhotos.value = Array.isArray(items) ? items.filter(m => m.type === 'IMAGE' || m.type === 'VIDEO') : []
  } catch (_) {
    editPhotos.value = []
  } finally {
    loadingPhotos.value = false
  }
}

async function deletePhoto(mediaId) {
  const idx = editPhotos.value.findIndex(m => m.id === mediaId)
  if (idx !== -1) editPhotos.value[idx]._deleting = true
  try {
    const res = await fetch(`${API}/api/v1/properties/${props.prop.id}/media/${mediaId}`, {
      method: 'DELETE',
      headers: auth.authHeaders(),
    })
    if (res.ok) {
      editPhotos.value = editPhotos.value.filter(m => m.id !== mediaId)
      await loadMedia()
    } else {
      const err = await res.json().catch(() => ({}))
      photoMsg.value = err.message || 'No se pudo eliminar.'
    }
  } catch (_) {
    photoMsg.value = 'Error de conexión al eliminar.'
  }
}

async function handlePhotoSelect(e) {
  const files = Array.from(e.target.files || [])
  e.target.value = ''
  if (!files.length || !props.prop) return
  photoMsg.value = ''
  for (const file of files) await uploadPhoto(file)
  await loadEditPhotos()
  await loadMedia()
}

async function uploadPhoto(file) {
  try {
    const urlRes = await fetch(`${API}/api/v1/properties/${props.prop.id}/media/upload-url`, {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify({ filename: file.name, content_type: file.type }),
    })
    if (!urlRes.ok) throw new Error(`HTTP ${urlRes.status}`)
    const { presigned_url: presignedURL, final_url: finalURL } = await urlRes.json()

    const uploadRes = await fetch(presignedURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
    if (!uploadRes.ok) throw new Error('Error al subir a S3')

    const confirmRes = await fetch(`${API}/api/v1/properties/${props.prop.id}/media`, {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify({ url: finalURL, type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE', sort_order: 0 }),
    })
    if (!confirmRes.ok) throw new Error(`HTTP ${confirmRes.status}`)
  } catch (err) {
    photoMsg.value = `${file.name}: ${err.message || 'Error al subir'}`
  }
}

async function submitEdit() {
  const p   = props.prop
  const f   = editForm.value
  const body = {}

  if (f.title.trim())       body.title       = f.title.trim()
  if (f.description.trim()) body.description = f.description.trim()
  if (f.address.trim())     body.address     = f.address.trim()
  if (f.price > 0)          body.price       = f.price
  if (f.currency)           body.currency    = f.currency
  if (f.pet_policy)         body.pet_policy  = f.pet_policy

  if (p.operation_type === 'TEMP') {
    if (f.night_price > 0)      body.night_price       = f.night_price
    if (f.cleaning_fee >= 0)    body.cleaning_fee      = f.cleaning_fee
    if (f.security_deposit >= 0) body.security_deposit = f.security_deposit
    if (f.min_nights > 0)       body.min_nights        = f.min_nights
    if (f.max_nights > 0)       body.max_nights        = f.max_nights
    if (f.check_in_time)        body.check_in_time     = f.check_in_time
    if (f.check_out_time)       body.check_out_time    = f.check_out_time
  }

  if (!Object.keys(body).length) {
    editMsg.value = { text: 'No hiciste ningún cambio.', type: 'warning' }
    return
  }

  savingEdit.value = true
  editMsg.value    = { text: '', type: '' }

  try {
    const res = await fetch(`${API}/api/v1/properties/${p.id}`, {
      method: 'PUT',
      headers: auth.authHeaders(),
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    emit('prop-updated', { ...p, ...body })
    editOpen.value = false
  } catch (err) {
    editMsg.value = { text: err.message || 'No se pudo guardar. Intentá de nuevo.', type: 'error' }
  } finally {
    savingEdit.value = false
  }
}
</script>

<template>
  <div class="publicar-layout">
    <div class="publicar-header">
      <h1>Publicar propiedad</h1>
      <p>Completá los datos de tu propiedad para publicarla en el catálogo.</p>
    </div>

    <div class="publicar-card">
      <form @submit.prevent="submitProperty" novalidate>

        <!-- Basic info -->
        <div class="field-group">
          <label for="pub-title">Título</label>
          <input type="text" id="pub-title" v-model="form.title" placeholder="Ph 3 ambientes con patio" required />
        </div>

        <div class="field-group">
          <label for="pub-desc">Descripción</label>
          <textarea id="pub-desc" v-model="form.description" rows="3" placeholder="Descripción de la propiedad..."></textarea>
        </div>

        <div class="form-row">
          <div class="field-group">
            <label for="pub-operation">Tipo de operación</label>
            <select id="pub-operation" v-model="form.operationType" required>
              <option value="SALE">Venta</option>
              <option value="RENT">Alquiler</option>
              <option value="TEMP">Temporario</option>
            </select>
          </div>
          <div class="field-group">
            <label for="pub-pet-policy">Mascotas</label>
            <select id="pub-pet-policy" v-model="form.petPolicy">
              <option value="NOT_ALLOWED">No acepta</option>
              <option value="ALLOWED">Acepta mascotas</option>
              <option value="SMALL_ONLY">Solo chicas/medianas</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="field-group">
            <label for="pub-price">Precio</label>
            <input type="number" id="pub-price" v-model.number="form.price" placeholder="150000" required />
          </div>
          <div class="field-group">
            <label for="pub-currency">Moneda</label>
            <select id="pub-currency" v-model="form.currency">
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div class="field-group">
          <label for="pub-address">Dirección</label>
          <input type="text" id="pub-address" v-model="form.address" placeholder="Av. Corrientes 1234, CABA" required />
        </div>

        <div class="form-row">
          <div class="field-group">
            <label for="pub-lat">Latitud</label>
            <input type="number" id="pub-lat" v-model.number="form.latitude" step="any" placeholder="-34.6037" />
          </div>
          <div class="field-group">
            <label for="pub-lng">Longitud</label>
            <input type="number" id="pub-lng" v-model.number="form.longitude" step="any" placeholder="-58.3816" />
          </div>
        </div>

        <!-- Temp config -->
        <template v-if="form.operationType === 'TEMP'">
          <div class="form-section-divider">Configuración temporario</div>

          <div class="form-row">
            <div class="field-group">
              <label for="pub-night-price">Precio por noche</label>
              <input type="number" id="pub-night-price" v-model.number="temp.nightPrice" step="0.01" placeholder="40.00" />
            </div>
            <div class="field-group">
              <label for="pub-cleaning-fee">Tarifa de limpieza (fija)</label>
              <input type="number" id="pub-cleaning-fee" v-model.number="temp.cleaningFee" step="0.01" placeholder="15.00" />
            </div>
          </div>

          <div class="form-row">
            <div class="field-group">
              <label for="pub-deposit">Depósito en garantía</label>
              <input type="number" id="pub-deposit" v-model.number="temp.securityDeposit" step="0.01" placeholder="100.00" />
            </div>
            <div class="field-group"><!-- spacer --></div>
          </div>

          <div class="form-row">
            <div class="field-group">
              <label for="pub-min-nights">Noches mínimas</label>
              <input type="number" id="pub-min-nights" v-model.number="temp.minNights" min="1" placeholder="3" />
            </div>
            <div class="field-group">
              <label for="pub-max-nights">Noches máximas</label>
              <input type="number" id="pub-max-nights" v-model.number="temp.maxNights" min="1" placeholder="90" />
            </div>
          </div>

          <div class="form-row">
            <div class="field-group">
              <label for="pub-checkin-time">Check-in (hora)</label>
              <input type="time" id="pub-checkin-time" v-model="temp.checkInTime" />
            </div>
            <div class="field-group">
              <label for="pub-checkout-time">Check-out (hora)</label>
              <input type="time" id="pub-checkout-time" v-model="temp.checkOutTime" />
            </div>
          </div>

          <div class="form-section-divider">
            Descuentos por estadía <span class="optional-tag">opcional</span>
          </div>

          <div class="form-row">
            <div class="field-group">
              <label for="pub-discount-weekly">Desc. semanal (7+ noches) %</label>
              <input type="number" id="pub-discount-weekly" v-model.number="temp.discountWeekly" min="0" max="100" step="0.5" placeholder="10" />
            </div>
            <div class="field-group">
              <label for="pub-discount-monthly">Desc. mensual (28+ noches) %</label>
              <input type="number" id="pub-discount-monthly" v-model.number="temp.discountMonthly" min="0" max="100" step="0.5" placeholder="25" />
            </div>
          </div>

          <div class="form-section-divider">
            Comodidades <span class="optional-tag">opcional</span>
          </div>

          <div class="amenities-grid">
            <label v-for="a in AMENITIES" :key="a.value" class="amenity-check">
              <input type="checkbox" :value="a.value" v-model="selectedAmenities" />
              <span>{{ a.icon }} {{ a.label }}</span>
            </label>
          </div>
        </template>

        <!-- Media upload -->
        <div class="form-section-divider">
          Multimedia <span class="optional-tag">opcional</span>
        </div>

        <div class="field-group">
          <label>Fotos y videos</label>
          <div
            class="media-drop-zone"
            :class="{ 'drag-over': isDragging }"
            @click="fileInput.click()"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Hacé clic o arrastrá archivos acá</span>
            <span class="drop-hint">JPG, PNG, MP4 — máx 50 MB c/u</span>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*,video/*"
            multiple
            style="display:none"
            @change="onFileSelect"
          />
        </div>

        <div class="media-file-list">
          <div v-for="item in mediaQueue" :key="item.name" class="media-file-item">
            <svg v-if="item.isVideo" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span class="file-name">{{ item.name }}</span>
            <span class="file-status" :class="item.statusClass">{{ item.status }}</span>
          </div>
        </div>

        <!-- Social links -->
        <div class="field-group" style="margin-top:8px">
          <label>Links de redes sociales <span class="optional-tag">opcional</span></label>
          <div class="social-links-list">
            <div v-for="(link, i) in socialLinks" :key="i" class="social-link-row">
              <input type="text" v-model="link.platform" placeholder="Red (ej: instagram)" />
              <input type="url"  v-model="link.url"      placeholder="https://..." />
            </div>
          </div>
          <button type="button" class="btn-add-row" @click="addSocialLinkRow">+ Agregar otro enlace</button>
        </div>

        <div v-if="msg.text" class="form-msg" :class="msg.type" role="alert">{{ msg.text }}</div>

        <div class="publicar-footer">
          <RouterLink to="/" class="btn-ghost">Cancelar</RouterLink>
          <button type="submit" class="btn-primary" :disabled="loading">
            <span class="btn-text">{{ isEditMode ? 'Guardar cambios' : 'Publicar' }}</span>
            <span v-if="loading" class="btn-loader" aria-hidden="true"></span>
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const fileInput    = ref(null)
const isDragging   = ref(false)
const loading      = ref(false)
const isEditMode   = ref(false)
const editPropId   = ref(null)
const mediaQueue   = ref([])
const socialLinks  = ref([{ platform: '', url: '' }])
const selectedAmenities = ref([])

const msg = reactive({ text: '', type: '' })

const form = reactive({
  title:         '',
  description:   '',
  operationType: 'SALE',
  petPolicy:     'NOT_ALLOWED',
  price:         null,
  currency:      'ARS',
  address:       '',
  latitude:      null,
  longitude:     null,
})

const temp = reactive({
  nightPrice:       null,
  cleaningFee:      null,
  securityDeposit:  null,
  minNights:        null,
  maxNights:        null,
  checkInTime:      '14:00',
  checkOutTime:     '10:00',
  discountWeekly:   null,
  discountMonthly:  null,
})

const AMENITIES = [
  { value: 'wifi',        label: 'Wi-Fi',            icon: '📶', cat: 'infrastructure' },
  { value: 'ac',          label: 'Aire acondicionado', icon: '❄️', cat: 'infrastructure' },
  { value: 'heating',     label: 'Calefacción',       icon: '🔥', cat: 'infrastructure' },
  { value: 'elevator',    label: 'Ascensor',          icon: '🛗', cat: 'infrastructure' },
  { value: 'bed_linen',   label: 'Ropa de cama',      icon: '🛏️', cat: 'comfort' },
  { value: 'kitchen',     label: 'Vajilla completa',  icon: '🍽️', cat: 'comfort' },
  { value: 'coffee_maker',label: 'Cafetera',          icon: '☕', cat: 'comfort' },
  { value: 'microwave',   label: 'Microondas',        icon: '📦', cat: 'comfort' },
  { value: 'hair_dryer',  label: 'Secador de pelo',   icon: '💨', cat: 'comfort' },
  { value: 'iron',        label: 'Plancha',           icon: '👔', cat: 'comfort' },
  { value: 'pool',        label: 'Piscina',           icon: '🏊', cat: 'premium' },
  { value: 'gym',         label: 'Gimnasio',          icon: '🏋️', cat: 'premium' },
  { value: 'bbq',         label: 'Parrilla',          icon: '🔥', cat: 'premium' },
  { value: 'sum',         label: 'SUM',               icon: '🎉', cat: 'premium' },
  { value: 'security',    label: 'Seguridad 24hs',    icon: '🔒', cat: 'premium' },
]

onMounted(() => {
  const editId = route.query.edit
  if (editId) {
    isEditMode.value = true
    editPropId.value = editId
    loadPropertyForEdit(editId)
  }
})

async function loadPropertyForEdit(id) {
  try {
    const res  = await fetch(`/api/v1/properties/${id}`, { headers: auth.authHeaders() })
    if (!res.ok) return
    const p    = await res.json()
    form.title         = p.title || ''
    form.description   = p.description || ''
    form.operationType = p.operation_type || 'SALE'
    form.petPolicy     = p.pet_policy || 'NOT_ALLOWED'
    form.price         = typeof p.price === 'object' ? p.price?.amount : p.price
    form.currency      = (typeof p.price === 'object' ? p.price?.currency : p.currency) || 'ARS'
    form.address       = p.address || p.location?.address || ''
    form.latitude      = p.latitude || p.location?.lat
    form.longitude     = p.longitude || p.location?.lng

    if (p.operation_type === 'TEMP') {
      const tc = p.temp_config || p
      temp.nightPrice      = tc.night_price      || tc.nightPrice      || null
      temp.cleaningFee     = tc.cleaning_fee     || tc.cleaningFee     || null
      temp.securityDeposit = tc.security_deposit || tc.securityDeposit || null
      temp.minNights       = tc.min_nights       || tc.minNights       || null
      temp.maxNights       = tc.max_nights       || tc.maxNights       || null
      temp.checkInTime     = tc.check_in_time    || tc.checkInTime     || '14:00'
      temp.checkOutTime    = tc.check_out_time   || tc.checkOutTime    || '10:00'
    }
  } catch (err) {
    console.error('[edit load]', err)
  }
}

function onDrop(e) {
  isDragging.value = false
  addFilesToQueue([...e.dataTransfer.files])
}

function onFileSelect(e) {
  addFilesToQueue([...e.target.files])
  e.target.value = ''
}

function addFilesToQueue(files) {
  const MAX = 50 * 1024 * 1024
  files.forEach(f => {
    if (f.size > MAX) {
      mediaQueue.value.push({ name: f.name, status: 'Excede 50 MB', statusClass: 'err', file: null, isVideo: false })
      return
    }
    const isVideo = /\.(mp4|mov|avi|webm)$/i.test(f.name)
    mediaQueue.value.push({ name: f.name, status: 'Pendiente', statusClass: '', file: f, isVideo })
  })
}

function updateFileStatus(name, status, statusClass) {
  const item = mediaQueue.value.find(i => i.name === name)
  if (item) { item.status = status; item.statusClass = statusClass }
}

function addSocialLinkRow() {
  socialLinks.value.push({ platform: '', url: '' })
}

function buildAmenities() {
  return selectedAmenities.value.map(val => {
    const def = AMENITIES.find(a => a.value === val)
    return { key: val, label: def?.label || val, category: def?.cat || 'comfort' }
  })
}

function buildPricingRules() {
  const rules = []
  if (temp.discountWeekly  > 0) rules.push({ type: 'weekly',  min_nights: 7,  discount_pct: temp.discountWeekly })
  if (temp.discountMonthly > 0) rules.push({ type: 'monthly', min_nights: 28, discount_pct: temp.discountMonthly })
  return rules
}

async function submitProperty() {
  loading.value = true
  msg.text = ''

  const propID = isEditMode.value ? editPropId.value : ('prop-' + Date.now())
  const opType = form.operationType

  const body = {
    id:             propID,
    title:          form.title.trim(),
    description:    form.description.trim(),
    operation_type: opType,
    pet_policy:     form.petPolicy,
    price:          form.price,
    currency:       form.currency,
    address:        form.address.trim(),
    latitude:       form.latitude  || -34.6037,
    longitude:      form.longitude || -58.3816,
    ...(opType === 'TEMP' && {
      night_price:       temp.nightPrice      || 0,
      cleaning_fee:      temp.cleaningFee     || 0,
      security_deposit:  temp.securityDeposit || 0,
      min_nights:        temp.minNights       || 1,
      max_nights:        temp.maxNights       || 90,
      check_in_time:     temp.checkInTime     || '14:00',
      check_out_time:    temp.checkOutTime    || '10:00',
      amenities:         buildAmenities(),
      pricing_rules:     buildPricingRules(),
    }),
  }

  try {
    const method = isEditMode.value ? 'PUT' : 'POST'
    const url    = isEditMode.value
      ? `/api/v1/properties/${propID}`
      : '/api/v1/properties'

    const res = await fetch(url, {
      method,
      headers: auth.authHeaders(),
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      msg.text = err.message || err.error || `Error ${res.status}`
      msg.type = 'error'
      loading.value = false
      return
    }
  } catch (err) {
    msg.text = 'No se pudo conectar al servidor de catálogo.'
    msg.type = 'error'
    loading.value = false
    return
  }

  // Upload media (only in create mode)
  if (!isEditMode.value) {
    const mediaErrors = []
    for (const [i, item] of mediaQueue.value.filter(q => q.file).entries()) {
      try {
        updateFileStatus(item.name, 'Subiendo...', '')
        const urlRes = await fetch(`/api/v1/properties/${propID}/media/upload-url`, {
          method: 'POST',
          headers: auth.authHeaders(),
          body: JSON.stringify({ filename: item.file.name, content_type: item.file.type || 'application/octet-stream' }),
        })
        if (!urlRes.ok) {
          const e = await urlRes.json().catch(() => ({}))
          updateFileStatus(item.name, e.message || `Error ${urlRes.status}`, 'err')
          mediaErrors.push(item.name)
          continue
        }
        const { presigned_url, final_url } = await urlRes.json()

        const putRes = await fetch(presigned_url, {
          method: 'PUT',
          headers: { 'Content-Type': item.file.type || 'application/octet-stream' },
          body: item.file,
        })
        if (!putRes.ok) {
          updateFileStatus(item.name, `Error S3 ${putRes.status}`, 'err')
          mediaErrors.push(item.name)
          continue
        }

        const mediaType = item.file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
        await fetch(`/api/v1/properties/${propID}/media`, {
          method: 'POST',
          headers: auth.authHeaders(),
          body: JSON.stringify({ url: final_url, type: mediaType, sort_order: i }),
        })
        updateFileStatus(item.name, 'Subido', 'ok')
      } catch (err) {
        console.error('[media upload]', item.name, err)
        updateFileStatus(item.name, 'Error de red', 'err')
        mediaErrors.push(item.name)
      }
    }

    // Upload social links
    const links = {}
    socialLinks.value.forEach(({ platform, url }) => {
      if (platform.trim() && url.trim()) links[platform.trim().toLowerCase()] = url.trim()
    })
    if (Object.keys(links).length > 0) {
      try {
        await fetch(`/api/v1/properties/${propID}/media`, {
          method: 'POST',
          headers: auth.authHeaders(),
          body: JSON.stringify({ type: 'SOCIAL_LINK', sort_order: 99, social_links: links }),
        })
      } catch (err) {
        console.error('[social links]', err)
      }
    }

    const mediaNote = mediaErrors.length > 0
      ? ` (${mediaErrors.length} archivo(s) fallaron)`
      : (mediaQueue.value.filter(q => q.file).length > 0 ? ' con multimedia guardada' : '')
    msg.text = `¡Propiedad publicada${mediaNote}!`
    msg.type = mediaErrors.length > 0 ? 'error' : 'success'
  } else {
    msg.text = '¡Publicación actualizada!'
    msg.type = 'success'
  }

  loading.value = false
  setTimeout(() => router.push('/'), 1400)
}
</script>

<style scoped>
.publicar-layout {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 16px 64px;
}

.publicar-header {
  margin-bottom: 24px;
}

.publicar-header h1 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 28px;
  font-weight: 400;
  color: var(--ink);
  margin: 0 0 6px;
}

.publicar-header p {
  font-size: 14px;
  color: var(--ink-40);
  margin: 0;
}

.publicar-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 28px 28px 20px;
}

.field-group {
  margin-bottom: 16px;
}

.field-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 6px;
}

.field-group input,
.field-group textarea,
.field-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--ink);
  background: var(--bg);
  transition: border-color .15s;
  font-family: inherit;
}

.field-group input:focus,
.field-group textarea:focus,
.field-group select:focus {
  outline: none;
  border-color: var(--gold);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-section-divider {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-40);
  text-transform: uppercase;
  letter-spacing: .06em;
  border-top: 1px solid var(--border);
  padding-top: 14px;
  margin: 20px 0 14px;
}

.optional-tag {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--ink-40);
  font-size: 11px;
}

/* Amenities */
.amenities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.amenity-check {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 10px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  transition: border-color .15s, background .15s;
}

.amenity-check:has(input:checked) {
  border-color: var(--gold);
  background: color-mix(in srgb, var(--gold) 8%, transparent);
}

.amenity-check input {
  display: none;
}

/* Media drop zone */
.media-drop-zone {
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--ink-40);
  transition: border-color .15s, background .15s;
}

.media-drop-zone:hover,
.media-drop-zone.drag-over {
  border-color: var(--gold);
  background: color-mix(in srgb, var(--gold) 5%, transparent);
}

.drop-hint {
  font-size: 12px;
}

.media-file-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.media-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 6px 10px;
  background: var(--bg);
  border-radius: 6px;
  border: 1px solid var(--border);
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-status { font-size: 12px; color: var(--ink-40); }
.file-status.ok  { color: #2e7d32; }
.file-status.err { color: var(--danger); }

/* Social links */
.social-links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.social-link-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 8px;
}

.social-link-row input {
  padding: 8px 10px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--ink);
  background: var(--bg);
  font-family: inherit;
}

.social-link-row input:focus {
  outline: none;
  border-color: var(--gold);
}

.btn-add-row {
  font-size: 13px;
  color: var(--gold);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

/* Message */
.form-msg {
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 8px;
  margin: 12px 0;
}

.form-msg.error   { background: #fef2f2; color: #c0392b; border: 1px solid #fecaca; }
.form-msg.success { background: #f0fdf4; color: #2e7d32; border: 1px solid #bbf7d0; }

/* Footer */
.publicar-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.btn-ghost {
  padding: 9px 18px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--ink);
  text-decoration: none;
  font-family: inherit;
  transition: border-color .15s;
}

.btn-ghost:hover { border-color: var(--ink-40); }

.btn-primary {
  padding: 9px 22px;
  background: var(--ink);
  border: 1.5px solid var(--ink);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: #fff;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity .15s;
}

.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

.btn-loader {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .publicar-card { padding: 20px 16px; }
  .form-row { grid-template-columns: 1fr; }
}
</style>

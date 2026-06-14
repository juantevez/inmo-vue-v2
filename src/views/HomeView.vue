<template>
  <!-- HERO -->
  <section class="hero">
    <div class="hero-content">
      <h1 class="hero-title">Encontrá tu próximo hogar</h1>
      <p class="hero-sub">Miles de propiedades en venta y alquiler en toda Argentina</p>

      <div class="search-box">
        <div class="search-tabs">
          <button v-for="tab in tabs" :key="tab.op"
            class="search-tab" :class="{ active: filters.op === tab.op }"
            @click="setTab(tab.op)">{{ tab.label }}</button>
        </div>
        <div class="search-fields">
          <div class="search-main">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" v-model="filters.zone" placeholder="Barrio, zona o dirección…" @keydown.enter="search" />
          </div>
          <div class="search-divider" />
          <select v-model="filters.type" class="search-select">
            <option value="">Tipo de propiedad</option>
            <option value="APARTMENT">Departamento</option>
            <option value="HOUSE">Casa</option>
            <option value="PH">PH</option>
            <option value="OFFICE">Oficina</option>
            <option value="COMMERCIAL">Local comercial</option>
          </select>
          <div class="search-divider" />
          <div class="search-price">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <input type="number" v-model.number="filters.minPrice" placeholder="Precio mín." />
            <span>—</span>
            <input type="number" v-model.number="filters.maxPrice" placeholder="Precio máx." />
          </div>
          <button class="search-btn" @click="search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Buscar
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- RESULTS -->
  <main class="results-section" ref="resultsEl">
    <div class="results-container">

      <div class="results-header-row">
        <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap">
          <h2 class="results-title">Propiedades disponibles</h2>
          <span class="results-count">{{ countLabel }}</span>
        </div>
        <div class="view-toggle">
          <button class="view-toggle-btn" :class="{ active: mobileView === 'list' }" @click="mobileView = 'list'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Lista
          </button>
          <button class="view-toggle-btn" :class="{ active: mobileView === 'map' }" @click="mobileView = 'map'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Mapa
          </button>
        </div>
      </div>

      <!-- Geo bar -->
      <div class="geo-search-bar">
        <label for="geo-radius">Buscar en radio de:</label>
        <select id="geo-radius" class="geo-radius-select" v-model.number="geoRadius" @change="onRadiusChange">
          <option :value="2">2 km</option>
          <option :value="5">5 km</option>
          <option :value="10">10 km</option>
          <option :value="20">20 km</option>
          <option :value="50">50 km</option>
        </select>
        <button class="btn-geo-locate" :class="{ locating: geoLocating }" @click="geoLocateMe">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          <span>{{ geoLocating ? 'Localizando...' : 'Mi ubicación' }}</span>
        </button>
        <span v-if="geoCenter" class="geo-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.4-8 14-8 14S4 15.4 4 10a8 8 0 0 1 8-8z"/></svg>
          <span class="geo-badge-label">Radio {{ geoRadius }} km</span>
          <button class="geo-badge-clear" @click="clearGeo" aria-label="Quitar filtro de ubicación">×</button>
        </span>
      </div>

      <!-- Pets filter -->
      <div class="advanced-filters">
        <label class="pet-toggle">
          <input type="checkbox" v-model="filters.pets" @change="search" />
          <span class="pet-toggle-track"><span class="pet-toggle-thumb" /></span>
          <span class="pet-toggle-text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 1.844-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-1.844-2.5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"/></svg>
            Acepta mascotas
          </span>
        </label>
      </div>

      <!-- Split body -->
      <div class="split-body">
        <!-- Lista -->
        <div class="list-panel">
          <!-- Skeleton -->
          <div v-if="loading" class="properties-grid">
            <div v-for="i in 6" :key="i" class="prop-skeleton" />
          </div>

          <!-- Empty -->
          <div v-else-if="!loading && !properties.length" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".3" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <p>No encontramos propiedades con esos filtros</p>
            <span>Probá ajustando la búsqueda</span>
          </div>

          <!-- Grid -->
          <div v-else class="properties-grid" :class="gridAnim">
            <PropertyCard
              v-for="(p, idx) in properties"
              :key="p.id"
              :prop="p"
              :style="{ '--i': Math.min(idx, 8) }"
              @open="openDetail"
              @hover-enter="mapRef?.highlightMarker(p.id)"
              @hover-leave="mapRef?.clearHighlight()"
            />
          </div>

          <!-- Paginación -->
          <div v-if="totalPages > 1" class="pagination">
            <button v-if="currentPage > 0" class="page-btn" @click="goPage(currentPage - 1)">&#8249;</button>
            <button
              v-for="n in pageButtons"
              :key="n"
              class="page-btn"
              :class="{ active: n === currentPage }"
              @click="goPage(n)"
            >{{ n + 1 }}</button>
            <button v-if="currentPage < totalPages - 1" class="page-btn" @click="goPage(currentPage + 1)">&#8250;</button>
          </div>
        </div>

        <!-- Mapa -->
        <PropertyMap
          ref="mapRef"
          :properties="properties"
          :mobile-visible="mobileView === 'map'"
          :geo-center="geoCenter"
          :radius-km="geoRadius"
          @close="mobileView = 'list'"
        />
      </div>
    </div>
  </main>

  <!-- Modales -->
  <PropertyModal
    v-model="detailOpen"
    :prop="selectedProp"
    @require-auth="openAuthPrompt"
    @visit-opened="openVisitModal"
    @prop-updated="onPropUpdated"
  />

  <ModalVisita
    v-model="visitOpen"
    :prop="selectedProp"
  />

  <AuthPromptModal
    v-model="authPromptOpen"
    :action="authAction"
    :prop-id="selectedProp?.id || ''"
  />
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import PropertyCard from '@/components/PropertyCard.vue'
import PropertyMap from '@/components/PropertyMap.vue'
import PropertyModal from '@/components/PropertyModal.vue'
import ModalVisita from '@/components/ModalVisita.vue'
import AuthPromptModal from '@/components/AuthPromptModal.vue'

const API      = 'http://127.0.0.1:8000'
const PAGE_SIZE = 12
const route    = useRoute()

const tabs = [
  { op: '', label: 'Todo' },
  { op: 'SALE', label: 'Comprar' },
  { op: 'RENT', label: 'Alquilar' },
  { op: 'TEMP', label: 'Temporario' },
]

const filters = reactive({ op: '', zone: '', type: '', minPrice: '', maxPrice: '', pets: false })

const loading      = ref(false)
const gridAnim     = ref('')
const properties   = ref([])
const total        = ref(0)
const currentPage  = ref(0)
const resultsEl    = ref(null)
const mobileView   = ref('list')

const geoCenter    = ref(null)
const geoRadius    = ref(5)
const geoLocating  = ref(false)

const detailOpen      = ref(false)
const selectedProp    = ref(null)
const visitOpen       = ref(false)
const authPromptOpen  = ref(false)
const authAction      = ref('contact')

const mapRef = ref(null)

const countLabel  = computed(() => total.value > 0 ? `${total.value} propiedad${total.value !== 1 ? 'es' : ''} encontrada${total.value !== 1 ? 's' : ''}` : '')
const totalPages  = computed(() => Math.ceil(total.value / PAGE_SIZE))

const pageButtons = computed(() => {
  const pages = totalPages.value
  const cur   = currentPage.value
  const max   = 8
  let start   = Math.max(0, cur - Math.floor(max / 2))
  let end     = Math.min(pages, start + max)
  if (end - start < max) start = Math.max(0, end - max)
  return Array.from({ length: end - start }, (_, i) => start + i)
})

function setTab(op) {
  filters.op = op
  search()
}

function search() {
  currentPage.value = 0
  loadProperties()
  resultsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function loadProperties() {
  const params = new URLSearchParams({ limit: PAGE_SIZE, offset: currentPage.value * PAGE_SIZE })
  if (filters.op)       params.set('operation', filters.op)
  if (filters.type)     params.set('property_type', filters.type)
  if (filters.minPrice) params.set('min_price', filters.minPrice)
  if (filters.maxPrice) params.set('max_price', filters.maxPrice)
  if (filters.zone)     params.set('zone', filters.zone)
  if (filters.pets)     params.set('pets', 'ALLOWED')
  if (geoCenter.value) {
    params.set('lat',       geoCenter.value.lat)
    params.set('lon',       geoCenter.value.lon)
    params.set('radius_km', geoRadius.value)
  }

  // Exit animation for existing cards before showing skeleton
  if (properties.value.length > 0) {
    gridAnim.value = 'grid-exit'
    await new Promise(r => setTimeout(r, 210))
    gridAnim.value = ''
  }

  loading.value = true

  try {
    const res  = await fetch(`${API}/api/v1/properties?${params}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    properties.value = Array.isArray(data) ? data : (data.properties || data.items || data.data || [])
    total.value      = data.total ?? data.Total ?? properties.value.length
    // Set enter class before grid mounts so cards animate in from the start
    gridAnim.value = 'grid-enter'
  } catch (_) {
    properties.value = []
    total.value      = 0
    gridAnim.value   = ''
  } finally {
    loading.value = false
  }

  // Remove enter class after stagger completes (8 cards × 48ms + 360ms anim = ~744ms)
  if (gridAnim.value === 'grid-enter') {
    setTimeout(() => { gridAnim.value = '' }, 750)
  }
}

function goPage(n) {
  currentPage.value = n
  loadProperties()
  resultsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ── Geo ── */
function geoLocateMe() {
  if (!navigator.geolocation) { alert('Tu navegador no soporta geolocalización.'); return }
  geoLocating.value = true
  navigator.geolocation.getCurrentPosition(
    pos => {
      geoLocating.value = false
      applyGeo(pos.coords.latitude, pos.coords.longitude)
    },
    () => {
      geoLocating.value = false
      alert('No se pudo obtener tu ubicación. Verificá los permisos del navegador.')
    },
    { timeout: 8000 }
  )
}

function applyGeo(lat, lon) {
  geoCenter.value = { lat, lon }
  search()
}

function onRadiusChange() {
  if (geoCenter.value) search()
}

function clearGeo() {
  geoCenter.value = null
  search()
}

/* ── Detail ── */
function openDetail(prop) {
  selectedProp.value = prop
  detailOpen.value   = true
}

function openVisitModal(prop) {
  selectedProp.value = prop
  visitOpen.value    = true
}

function openAuthPrompt({ action, propId }) {
  authAction.value      = action
  selectedProp.value    = { id: propId }
  authPromptOpen.value  = true
}

function onPropUpdated(updated) {
  const idx = properties.value.findIndex(p => p.id === updated.id)
  if (idx !== -1) properties.value[idx] = { ...properties.value[idx], ...updated }
  selectedProp.value = { ...selectedProp.value, ...updated }
}

/* ── Map popup global bridge ── */
function setupMapBridge() {
  window.__inmoOpenDetail = async (propId) => {
    const p = properties.value.find(p => p.id === propId)
    if (p) { openDetail(p); return }
    try {
      const res = await fetch(`${API}/api/v1/properties/${propId}`)
      if (res.ok) openDetail(await res.json())
    } catch (_) {}
  }
}

onMounted(() => {
  // Leer query params del router (ej: /?op=SALE desde NavBar)
  if (route.query.op) filters.op = route.query.op

  setupMapBridge()
  loadProperties()

  // Retorno desde login con prop+action pendiente
  const propId = route.query.prop
  const action = route.query.action
  if (propId && action && localStorage.getItem('inmo_token')) {
    // abriremos el modal una vez que carguen las propiedades
    setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/v1/properties/${propId}`)
        if (res.ok) {
          selectedProp.value = await res.json()
          openAuthPrompt({ action, propId })
        }
      } catch (_) {}
    }, 800)
  }
})

// Sync filter when NavBar RouterLinks change ?op= param without remounting
watch(() => route.query.op, (newOp) => {
  const op = newOp ?? ''
  if (filters.op !== op) {
    filters.op = op
    currentPage.value = 0
    loadProperties()
  }
})

onUnmounted(() => {
  delete window.__inmoOpenDetail
})
</script>

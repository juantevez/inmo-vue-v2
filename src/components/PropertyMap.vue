<template>
  <div class="map-panel" :class="{ 'mobile-visible': mobileVisible }">
    <button v-if="mobileVisible" class="map-close-btn" @click="$emit('close')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Volver a la lista
    </button>
    <div ref="mapEl" id="map" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'

const props = defineProps({
  properties: { type: Array, default: () => [] },
  mobileVisible: { type: Boolean, default: false },
  geoCenter: { type: Object, default: null },
  radiusKm: { type: Number, default: 5 },
})

const emit = defineEmits(['open', 'close'])

const API   = 'http://127.0.0.1:8000'
const mapEl = ref(null)

let map         = null
let markers     = []
let radiusCircle = null
let userMarker  = null

onMounted(() => {
  map = L.map(mapEl.value, {
    center: [-34.6037, -58.3816],
    zoom: 12,
    zoomControl: true,
    scrollWheelZoom: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  map.zoomControl.setPosition('bottomright')
  renderMarkers(props.properties)
})

onUnmounted(() => {
  if (map) { map.remove(); map = null }
})

watch(() => props.properties, (newProps) => renderMarkers(newProps), { deep: true })

watch(() => props.mobileVisible, (visible) => {
  if (visible && map) setTimeout(() => map.invalidateSize(), 50)
})

watch(() => props.geoCenter, (geo) => {
  if (!map) return
  if (geo) {
    map.setView([geo.lat, geo.lon], 13, { animate: true })
    setUserMarker(geo.lat, geo.lon)
    drawRadiusCircle(geo.lat, geo.lon, props.radiusKm)
  } else {
    clearGeoOverlays()
  }
})

function renderMarkers(propsArr) {
  if (!map) return
  markers.forEach(({ marker }) => map.removeLayer(marker))
  markers = []

  const bounds = []
  propsArr.forEach(p => {
    const lat = p.location?.latitude  ?? p.latitude
    const lng = p.location?.longitude ?? p.longitude
    if (!lat || !lng) return

    const rawPrice = typeof p.price === 'object' ? p.price?.amount : p.price
    const currency = (typeof p.price === 'object' ? p.price?.currency : p.currency) || 'ARS'
    const symbol   = currency === 'USD' ? 'U$S' : '$'
    const label    = `${symbol} ${Number(rawPrice).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`

    const icon = L.divIcon({
      className: '',
      html: `<div class="map-marker">${label}</div>`,
      iconSize: null, iconAnchor: [0, 0],
    })

    const marker = L.marker([lat, lng], { icon, riseOnHover: true })
    marker.bindPopup(buildPopupHTML(p), { closeButton: true, maxWidth: 220, minWidth: 220 })

    marker.on('popupopen', () => {
      setMarkerActive(marker, true)
      loadPopupImage(p.id)
    })
    marker.on('popupclose', () => setMarkerActive(marker, false))

    marker.addTo(map)
    markers.push({ marker, propId: p.id, lat, lng })
    bounds.push([lat, lng])
  })

  if (bounds.length > 0 && !props.geoCenter) {
    try { map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 }) } catch (_) {}
  }
}

function buildPopupHTML(p) {
  const rawPrice = typeof p.price === 'object' ? p.price?.amount : p.price
  const price    = Number(rawPrice || 0).toLocaleString('es-AR')
  const currency = (typeof p.price === 'object' ? p.price?.currency : p.currency) || 'ARS'
  const op       = p.operation_type || 'SALE'
  const opLabel  = { SALE: 'Venta', RENT: 'Alquiler', TEMP: 'Temporario' }[op] || op
  const symbol   = currency === 'USD' ? 'U$S' : '$'
  const address  = (p.address || p.location?.address || '').replace(/"/g, '&quot;')
  const title    = (p.title || 'Sin título').replace(/"/g, '&quot;')
  // btn dispatches to a global fn we expose on window
  return `
    <div class="map-popup">
      <div class="map-popup-img" id="popup-img-${p.id}">
        <svg class="map-popup-img-placeholder" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <div class="map-popup-body">
        <span class="map-popup-op ${op}">${opLabel}</span>
        <div class="map-popup-title">${title}</div>
        <div class="map-popup-addr">${address}</div>
        <div class="map-popup-footer">
          <span class="map-popup-price">${symbol} ${price}<span class="map-popup-currency">${currency}</span></span>
          <button class="map-popup-btn" onclick="window.__inmoOpenDetail('${p.id}')">Ver más</button>
        </div>
      </div>
    </div>`
}

async function loadPopupImage(propertyId) {
  try {
    const res  = await fetch(`${API}/api/v1/properties/${propertyId}/media`)
    if (!res.ok) return
    const items = await res.json()
    const first = Array.isArray(items) ? items.find(m => m.type === 'IMAGE') : null
    if (!first?.url) return
    const container = document.getElementById(`popup-img-${propertyId}`)
    if (!container) return
    container.innerHTML = `<img src="${first.url}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block" />`
  } catch (_) {}
}

function setMarkerActive(marker, active) {
  const el = marker.getElement()
  if (!el) return
  const div = el.querySelector('.map-marker')
  if (div) div.classList.toggle('active', active)
}

function setUserMarker(lat, lng) {
  if (userMarker) map.removeLayer(userMarker)
  const icon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:var(--gold);border:3px solid var(--white);border-radius:50%;box-shadow:0 0 0 3px rgba(201,169,110,0.3)"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7],
  })
  userMarker = L.marker([lat, lng], { icon, zIndexOffset: 500 })
    .addTo(map)
    .bindTooltip('Tu ubicación', { direction: 'top', offset: [0, -10] })
}

function drawRadiusCircle(lat, lng, radiusKm) {
  if (radiusCircle) map.removeLayer(radiusCircle)
  radiusCircle = L.circle([lat, lng], {
    radius: radiusKm * 1000,
    className: 'map-radius-circle',
  }).addTo(map)
}

function clearGeoOverlays() {
  if (radiusCircle) { map.removeLayer(radiusCircle); radiusCircle = null }
  if (userMarker)   { map.removeLayer(userMarker);   userMarker   = null }
}

function openMarkerPopup(propId) {
  const found = markers.find(m => m.propId === propId)
  if (found) {
    found.marker.openPopup()
    map.panTo([found.lat, found.lng], { animate: true, duration: 0.3 })
  }
}

defineExpose({ openMarkerPopup })
</script>

<template>
  <article class="prop-card"
    @click="$emit('open', prop)"
    @mouseenter="$emit('hover-enter')"
    @mouseleave="$emit('hover-leave')"
  >
    <div class="prop-img-carousel">
      <div class="prop-carousel-track">
        <template v-if="images.length">
          <video v-if="images[currentIdx].type === 'VIDEO'"
            class="prop-carousel-img"
            :src="images[currentIdx].url"
            preload="metadata"
            style="width:100%;height:100%;object-fit:cover" />
          <img v-else
            class="prop-carousel-img"
            :src="images[currentIdx].url"
            alt=""
            loading="lazy"
            style="width:100%;height:100%;object-fit:cover" />
        </template>
        <svg v-else class="prop-img-placeholder" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".2" aria-hidden="true">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>

      <template v-if="images.length > 1">
        <div class="prop-carousel-nav prop-carousel-prev" @click.stop="prev">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </div>
        <div class="prop-carousel-nav prop-carousel-next" @click.stop="next">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="prop-carousel-dots">
          <span
            v-for="(_, i) in images"
            :key="i"
            class="prop-carousel-dot"
            :class="{ active: i === currentIdx }"
            @click.stop="currentIdx = i"
          />
        </div>
      </template>

      <span v-if="opLabel" class="op-badge">{{ opLabel }}</span>
      <span v-if="prop.pet_policy && prop.pet_policy !== 'NOT_ALLOWED'" class="pet-badge"
        :title="prop.pet_policy === 'SMALL_ONLY' ? 'Solo mascotas chicas/medianas' : 'Acepta mascotas'">🐾</span>
    </div>

    <div class="prop-body">
      <p class="prop-title">{{ prop.title || 'Sin título' }}</p>
      <p class="prop-address">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        {{ prop.address || prop.location?.address || 'Dirección no disponible' }}
      </p>
      <div class="prop-footer">
        <div class="prop-price">
          <span class="price-amount">{{ formattedPrice }}</span>
          <span class="price-currency">{{ currency }}</span>
        </div>
        <span class="btn-ver-mas">Ver más</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({ prop: { type: Object, required: true } })
defineEmits(['open', 'hover-enter', 'hover-leave'])

const API = 'http://127.0.0.1:8000'
const images    = ref([])
const currentIdx = ref(0)

const opLabel = computed(() => ({ SALE: 'Venta', RENT: 'Alquiler', TEMP: 'Temporario' })[props.prop.operation_type] || '')

const rawPrice = computed(() =>
  typeof props.prop.price === 'object' ? props.prop.price?.amount : props.prop.price
)
const currency = computed(() =>
  (typeof props.prop.price === 'object' ? props.prop.price?.currency : props.prop.currency) || 'ARS'
)
const formattedPrice = computed(() =>
  Number(rawPrice.value || props.prop.amount || 0).toLocaleString('es-AR')
)

function prev() { currentIdx.value = (currentIdx.value - 1 + images.value.length) % images.value.length }
function next() { currentIdx.value = (currentIdx.value + 1) % images.value.length }

onMounted(async () => {
  try {
    const res = await fetch(`${API}/api/v1/properties/${props.prop.id}/media`)
    if (!res.ok) return
    const items = await res.json()
    images.value = Array.isArray(items)
      ? items.filter(m => m.type === 'IMAGE' || m.type === 'VIDEO')
      : []
  } catch (_) {}
})
</script>

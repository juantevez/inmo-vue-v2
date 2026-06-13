<template>
  <div class="setup-layout">
    <!-- LEFT: branding -->
    <div class="setup-panel-left">
      <RouterLink to="/" class="setup-logo">
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="4" fill="#C9A96E"/>
          <path d="M8 22 L16 10 L24 22" stroke="#1A1814" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 22 L12 17 L20 17 L20 22" stroke="#1A1814" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Inmo</span>
      </RouterLink>

      <div class="setup-branding">
        <div class="setup-step-badge">Paso 2 de 2</div>
        <h2 class="setup-brand-title">Contanos quién sos en el mercado inmobiliario</h2>
        <p class="setup-brand-sub">Con tu perfil completo podés publicar propiedades, contactar interesados y gestionar contratos desde el panel.</p>

        <ul class="setup-features">
          <li class="setup-feature">
            <div class="feature-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span>Identidad verificada para mayor confianza</span>
          </li>
          <li class="setup-feature">
            <div class="feature-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span>Acceso al panel según tu rol</span>
          </li>
          <li class="setup-feature">
            <div class="feature-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <span>Contratos y pagos gestionados en un lugar</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- RIGHT: form -->
    <div class="setup-panel-right">
      <div class="setup-card">
        <div class="setup-card-header">
          <h1 class="setup-card-title">Completá tu perfil</h1>
          <p class="setup-card-sub">Solo lleva un minuto. Podés actualizarlo después.</p>
        </div>

        <form @submit.prevent="handleSubmit" novalidate>
          <!-- Role selector -->
          <div class="field-group">
            <label>¿Cómo vas a usar Inmo?</label>
            <div class="role-grid">

              <label class="role-option">
                <input type="radio" name="profile-role" value="buscador" v-model="selectedRole" />
                <div class="role-card">
                  <div class="role-card-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                  <span class="role-card-label">Buscador</span>
                  <span class="role-card-desc">Quiero comprar o alquilar una propiedad</span>
                </div>
              </label>

              <label class="role-option">
                <input type="radio" name="profile-role" value="propietario" v-model="selectedRole" />
                <div class="role-card">
                  <div class="role-card-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <span class="role-card-label">Propietario</span>
                  <span class="role-card-desc">Tengo propiedades para vender o alquilar</span>
                </div>
              </label>

              <label class="role-option">
                <input type="radio" name="profile-role" value="inquilino" v-model="selectedRole" />
                <div class="role-card">
                  <div class="role-card-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <span class="role-card-label">Inquilino</span>
                  <span class="role-card-desc">Actualmente alquilo o busco alquilar</span>
                </div>
              </label>

              <label class="role-option">
                <input type="radio" name="profile-role" value="inmobiliaria" v-model="selectedRole" />
                <div class="role-card">
                  <div class="role-card-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect x="9" y="13" width="6" height="9"/></svg>
                  </div>
                  <span class="role-card-label">Inmobiliaria</span>
                  <span class="role-card-desc">Soy corredor o trabajo en una agencia</span>
                </div>
              </label>

            </div>
          </div>

          <!-- Personal data (shown once role selected) -->
          <div v-if="selectedRole" class="personal-data">
            <div class="section-divider"><span>Datos personales</span></div>

            <div class="form-row">
              <div class="field-group">
                <label for="p-firstname">Nombre</label>
                <input type="text" id="p-firstname" v-model="form.firstName" placeholder="Juan" autocomplete="given-name" />
              </div>
              <div class="field-group">
                <label for="p-lastname">Apellido</label>
                <input type="text" id="p-lastname" v-model="form.lastName" placeholder="García" autocomplete="family-name" />
              </div>
            </div>

            <div class="form-row">
              <div class="field-group">
                <label for="p-dnicuit">DNI / CUIT</label>
                <input type="text" id="p-dnicuit" v-model="form.dniCuit" placeholder="20-12345678-3" />
              </div>
              <div class="field-group">
                <label for="p-phone">Teléfono</label>
                <input type="tel" id="p-phone" v-model="form.phone" placeholder="+54 11 1234-5678" autocomplete="tel" />
              </div>
            </div>

            <!-- Commercial fields (only inmobiliaria) -->
            <template v-if="selectedRole === 'inmobiliaria'">
              <div class="section-divider"><span>Datos comerciales</span></div>
              <div class="field-group">
                <label for="p-company">Nombre de la empresa / agencia</label>
                <input type="text" id="p-company" v-model="form.companyName" placeholder="Inmobiliaria García S.R.L." />
              </div>
              <div class="field-group">
                <label for="p-license">Número de matrícula habilitante</label>
                <input type="text" id="p-license" v-model="form.licenseNumber" placeholder="CUCICBA 1234" />
              </div>
            </template>

            <div v-if="msg.text" class="form-msg" :class="msg.type" role="alert">{{ msg.text }}</div>

            <button type="submit" class="btn-setup-submit" :disabled="loading">
              <span class="btn-text">Guardar perfil y continuar</span>
              <span v-if="loading" class="btn-loader" aria-hidden="true"></span>
            </button>
          </div>
        </form>
      </div>

      <button class="skip-link" type="button" @click="skipSetup">Completar más tarde</button>
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

const selectedRole = ref('')
const loading      = ref(false)
const msg          = reactive({ text: '', type: '' })

const form = reactive({
  firstName:     '',
  lastName:      '',
  dniCuit:       '',
  phone:         '',
  companyName:   '',
  licenseNumber: '',
})

const ROLE_TO_PROFILE_TYPE = {
  buscador:     'INDIVIDUAL',
  propietario:  'INDIVIDUAL',
  inquilino:    'INDIVIDUAL',
  inmobiliaria: 'COMMERCIAL',
}

onMounted(() => {
  const pending = localStorage.getItem('inmo_pending_role')
  if (pending) selectedRole.value = pending
})

function showMsg(text, type) {
  msg.text = text
  msg.type = type
}

async function handleSubmit() {
  if (!selectedRole.value) {
    showMsg('Elegí un rol para continuar.', 'error')
    return
  }

  const { firstName, lastName, dniCuit, phone, companyName, licenseNumber } = form

  if (!firstName || !lastName || !dniCuit) {
    showMsg('Nombre, apellido y DNI/CUIT son obligatorios.', 'error')
    return
  }

  const profileType  = ROLE_TO_PROFILE_TYPE[selectedRole.value]
  const isCommercial = profileType === 'COMMERCIAL'

  if (isCommercial && (!companyName || !licenseNumber)) {
    showMsg('Nombre de empresa y matrícula son obligatorios para inmobiliarias.', 'error')
    return
  }

  loading.value = true
  msg.text = ''

  try {
    const res = await fetch('/api/v1/catalog/profiles', {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify({
        first_name:     firstName,
        last_name:      lastName,
        dni_cuit:       dniCuit,
        phone,
        profile_type:   profileType,
        company_name:   isCommercial ? companyName   : '',
        license_number: isCommercial ? licenseNumber : '',
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (res.status === 401) {
      auth.logout()
      router.push('/login')
      return
    }
    if (res.status === 409) {
      throw new Error('Ya existe un perfil con ese DNI/CUIT.')
    }
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo guardar el perfil. Intentá de nuevo.')
    }

    auth.updateUser({
      firstName,
      lastName,
      role: selectedRole.value,
      profileType,
      profileStatus: 'PENDING_VERIFICATION',
    })
    localStorage.removeItem('inmo_pending_role')

    showMsg('¡Perfil guardado! Redirigiendo...', 'success')
    setTimeout(() => {
      const returnTo = route.query.return
      router.push(returnTo ? decodeURIComponent(returnTo) : '/')
    }, 800)

  } catch (err) {
    showMsg(err.message, 'error')
  } finally {
    loading.value = false
  }
}

function skipSetup() {
  localStorage.removeItem('inmo_pending_role')
  router.push('/')
}
</script>

<style scoped>
@import '@/assets/profile-setup.css';
</style>

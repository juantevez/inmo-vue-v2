<template>
  <div class="auth-layout">
    <!-- ── Panel izquierdo ── -->
    <div class="auth-panel-left">
      <div class="auth-logo">
        <RouterLink to="/" class="auth-logo-link">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="4" fill="#C9A96E"/>
            <path d="M8 22 L16 10 L24 22" stroke="#1A1814" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 22 L12 17 L20 17 L20 22" stroke="#1A1814" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Inmo</span>
        </RouterLink>
      </div>

      <div class="auth-branding">
        <h1 class="auth-brand-title">Tu próximo hogar te espera</h1>
        <p class="auth-brand-sub">Accedé a miles de propiedades en venta y alquiler en toda Argentina.</p>
        <ul class="auth-features">
          <li class="auth-feature">
            <span class="auth-feature-icon">✓</span>
            Encontrá departamentos, casas, PH y más
          </li>
          <li class="auth-feature">
            <span class="auth-feature-icon">✓</span>
            Contactá directamente a los propietarios
          </li>
          <li class="auth-feature">
            <span class="auth-feature-icon">✓</span>
            Agendá visitas en pocos clics
          </li>
        </ul>

        <div class="fp3d-outer">
          <FloorPlan3D />
        </div>
      </div>
    </div>

    <!-- ── Panel derecho: formulario ── -->
    <div class="auth-panel-right">
      <div class="auth-card">

        <!-- Tabs -->
        <div class="auth-tabs" role="tablist">
          <button
            class="auth-tab"
            :class="{ active: activeTab === 'login' }"
            role="tab"
            :aria-selected="activeTab === 'login'"
            @click="activeTab = 'login'"
          >Iniciar sesión</button>
          <button
            class="auth-tab"
            :class="{ active: activeTab === 'register' }"
            role="tab"
            :aria-selected="activeTab === 'register'"
            @click="activeTab = 'register'"
          >Crear cuenta</button>
        </div>

        <!-- ── Formulario Login ── -->
        <form v-if="activeTab === 'login'" class="auth-form active" @submit.prevent="handleLogin" novalidate>
          <div class="field-group">
            <label for="login-email">Email</label>
            <div class="input-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input id="login-email" type="email" v-model="loginForm.email" placeholder="tu@email.com" autocomplete="email" required />
            </div>
          </div>
          <div class="field-group">
            <label for="login-password">Contraseña</label>
            <div class="input-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input id="login-password" type="password" v-model="loginForm.password" placeholder="••••••••" autocomplete="current-password" required />
            </div>
          </div>

          <div v-if="loginMsg.text" class="form-msg" :class="[loginMsg.type, 'visible']" role="alert">{{ loginMsg.text }}</div>

          <button class="btn-auth-submit" :class="{ loading: loginLoading }" :disabled="loginLoading" type="submit">
            <span class="btn-text">Ingresar</span>
            <span class="btn-loader" aria-hidden="true" />
          </button>

          <div class="sso-divider"><span>o continuá con</span></div>
          <div class="sso-buttons">
            <button type="button" class="btn-sso btn-sso-google" @click="loginWithGoogle">
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Google
            </button>
          </div>

          <p class="auth-switch">¿No tenés cuenta?
            <button type="button" class="link-btn" @click="activeTab = 'register'">Registrate gratis</button>
          </p>
        </form>

        <!-- ── Formulario Register ── -->
        <form v-if="activeTab === 'register'" class="auth-form active" @submit.prevent="handleRegister" novalidate>
          <div class="field-group">
            <label for="reg-email">Email</label>
            <div class="input-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input id="reg-email" type="email" v-model="regForm.email" placeholder="tu@email.com" autocomplete="email" required />
            </div>
          </div>
          <div class="field-group">
            <label for="reg-password">Contraseña</label>
            <div class="input-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input id="reg-password" type="password" v-model="regForm.password" placeholder="Mínimo 8 caracteres" autocomplete="new-password" required minlength="8" />
            </div>
          </div>

          <div class="field-group">
            <label>¿Cómo vas a usar Inmo?</label>
            <div class="user-type-grid">
              <label v-for="role in roles" :key="role.value" class="type-option">
                <input type="radio" name="user-type" :value="role.value" v-model="regForm.role" style="display:none" />
                <div class="type-card">
                  <component :is="'svg'" v-html="role.iconSvg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" />
                  <span class="type-label">{{ role.label }}</span>
                  <span class="type-desc">{{ role.desc }}</span>
                </div>
              </label>
            </div>
            <span v-if="roleHint" class="role-hint visible">Seleccioná tu tipo de cuenta para continuar</span>
          </div>

          <div v-if="regMsg.text" class="form-msg" :class="[regMsg.type, 'visible']" role="alert">{{ regMsg.text }}</div>

          <button class="btn-auth-submit" :class="{ loading: regLoading }" :disabled="regLoading" type="submit">
            <span class="btn-text">Crear cuenta gratis</span>
            <span class="btn-loader" aria-hidden="true" />
          </button>

          <div class="sso-divider"><span>o registrate con</span></div>
          <div class="sso-buttons">
            <button type="button" class="btn-sso btn-sso-google" @click="loginWithGoogle">
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Google
            </button>
          </div>

          <p class="auth-switch">¿Ya tenés cuenta?
            <button type="button" class="link-btn" @click="activeTab = 'login'">Ingresá</button>
          </p>
        </form>

        <!-- SSO loading overlay -->
        <div v-if="ssoLoading" class="sso-loading-overlay">
          <div class="sso-loading-spinner" />
          <p>Autenticando…</p>
        </div>

      </div>

      <RouterLink to="/" class="back-to-landing">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15 18 9 12 15 6"/></svg>
        Volver a propiedades
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FloorPlan3D from '@/components/FloorPlan3D.vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const activeTab   = ref('login')
const ssoLoading  = ref(false)
const roleHint    = ref(false)
let   _ssoConfig  = null

const loginForm    = ref({ email: '', password: '' })
const loginLoading = ref(false)
const loginMsg     = ref({ text: '', type: '' })

const regForm    = ref({ email: '', password: '', role: '' })
const regLoading = ref(false)
const regMsg     = ref({ text: '', type: '' })

const roles = [
  { value: 'buyer',    label: 'Busco propiedad',  iconSvg: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',                                                        desc: 'Quiero ponerme en contacto para visitar propiedades' },
  { value: 'renter',  label: 'Inquilino',         iconSvg: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',                              desc: 'Cargar comprobantes de transferencias y servicios pagos' },
  { value: 'owner',   label: 'Propietario',       iconSvg: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',            desc: 'Tengo propiedades para publicar' },
  { value: 'provider',label: 'Proveedor técnico', iconSvg: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>', desc: 'Plomero, electricista u otro oficio' },
]

const ROLE_MAP = { buyer: 'INTERESADO', renter: 'INQUILINO', owner: 'PROPIETARIO', provider: 'PROVEEDOR' }

function getReturnUrl() { return route.query.return || '/' }

/* ── SSO ── */
async function loadSSOConfig() {
  try {
    const res = await fetch('/api/v1/auth/sso/config')
    if (res.ok) _ssoConfig = await res.json()
  } catch (_) {}
}

function loginWithGoogle() {
  const clientId    = _ssoConfig?.google_client_id
  const redirectUri = _ssoConfig?.google_redirect_uri || (window.location.origin + '/login')
  if (!clientId) { showSSOMsg('Google SSO no está configurado en el servidor.'); return }
  const state = btoa(JSON.stringify({ provider: 'google', return: getReturnUrl() }))
  window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth' +
    '?client_id='    + encodeURIComponent(clientId) +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&response_type=code&scope=' + encodeURIComponent('openid email profile') +
    '&access_type=offline&state=' + encodeURIComponent(state)
}

async function handleGoogleCallback(code, returnUrl) {
  ssoLoading.value = true
  try {
    const res  = await fetch('/api/v1/auth/sso/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
    await handleSSOSuccess(data, returnUrl)
  } catch (err) {
    ssoLoading.value = false
    showSSOMsg(err.message || 'No se pudo iniciar sesión con Google.')
  }
}

async function handleSSOSuccess(data, returnUrl) {
  const token = data.AccessToken
  auth.setAuth(token, {})
  const profile = await fetchProfile(token)
  if (!profile) {
    const qs = (returnUrl && returnUrl !== '/') ? `?return=${encodeURIComponent(returnUrl)}` : ''
    router.push(`/perfil${qs}`)
  } else {
    auth.updateUser({ firstName: profile.first_name, lastName: profile.last_name, profileType: profile.profile_type })
    router.push(returnUrl !== '/' ? decodeURIComponent(returnUrl) : '/')
  }
}

function showSSOMsg(text) {
  if (activeTab.value === 'register') regMsg.value = { text, type: 'error' }
  else loginMsg.value = { text, type: 'error' }
}

/* ── Login ── */
async function handleLogin() {
  loginLoading.value = true
  loginMsg.value     = { text: '', type: '' }

  const { email, password } = loginForm.value
  try {
    const res  = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))

    if (res.status === 403) throw new Error('Verificá tu email antes de iniciar sesión. Revisá tu casilla de correo.')
    if (res.status === 429) throw new Error('Demasiados intentos. Esperá 15 minutos antes de reintentar.')
    if (!res.ok)            throw new Error(data.error || 'Email o contraseña incorrectos.')

    auth.setAuth(data.AccessToken, { email })
    loginMsg.value = { text: '¡Bienvenido!', type: 'success' }

    setTimeout(async () => {
      const profile = await fetchProfile(data.AccessToken)
      const returnUrl = getReturnUrl()
      if (!profile) {
        const qs = returnUrl !== '/' ? `?return=${encodeURIComponent(returnUrl)}` : ''
        router.push(`/perfil${qs}`)
      } else {
        auth.updateUser({ firstName: profile.first_name, lastName: profile.last_name, profileType: profile.profile_type })
        router.push(returnUrl !== '/' ? decodeURIComponent(returnUrl) : '/')
      }
    }, 600)
  } catch (err) {
    loginMsg.value = { text: err.message, type: 'error' }
    loginLoading.value = false
  }
}

/* ── Register ── */
async function handleRegister() {
  const role = ROLE_MAP[regForm.value.role]
  if (!role) {
    roleHint.value = true
    regMsg.value   = { text: 'Seleccioná cómo vas a usar Inmo para continuar.', type: 'error' }
    return
  }
  roleHint.value = false
  regLoading.value = true
  regMsg.value     = { text: '', type: '' }

  try {
    const res  = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: regForm.value.email, password: regForm.value.password, role }),
    })
    const data = await res.json().catch(() => ({}))

    if (res.status === 409) throw new Error('Ese email ya tiene una cuenta. ¿Querés iniciar sesión?')
    if (res.status === 400) throw new Error(data.error || 'Verificá los datos ingresados.')
    if (!res.ok)            throw new Error(data.error || 'No se pudo crear la cuenta. Intentá de nuevo.')

    regMsg.value = { text: `✓ Cuenta creada. Revisá tu email para verificarla.`, type: 'success' }
    localStorage.setItem('inmo_pending_email', regForm.value.email)
    setTimeout(() => { activeTab.value = 'login' }, 2800)
  } catch (err) {
    regMsg.value = { text: err.message, type: 'error' }
  } finally {
    regLoading.value = false
  }
}

/* ── Profile ── */
async function fetchProfile(token) {
  try {
    const res = await fetch('/api/v1/catalog/profiles/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    return res.ok ? await res.json() : null
  } catch { return null }
}


/* ── Init ── */
onMounted(async () => {
  await loadSSOConfig()

  const code     = route.query.code
  const stateRaw = route.query.state
  if (code && stateRaw) {
    try {
      const state = JSON.parse(atob(stateRaw))
      if (state.provider === 'google') {
        router.replace('/login')
        handleGoogleCallback(code, state.return || '/')
        return
      }
    } catch (_) {}
  }

  if (route.query.tab === 'register') activeTab.value = 'register'
  else {
    const pendingEmail = localStorage.getItem('inmo_pending_email')
    if (pendingEmail) {
      loginForm.value.email = pendingEmail
      localStorage.removeItem('inmo_pending_email')
    }
  }

})

</script>

<style>
@import '@/assets/loginregister.css';

.auth-panel-left {
  display: flex;
  flex-direction: column;
}
.auth-panel-left .auth-logo    { flex-shrink: 0; }
.auth-panel-left .auth-branding {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.auth-panel-left .auth-brand-title {
  font-size: clamp(17px, 1.9vw, 38px);
  margin-bottom: 6px;
}
.auth-panel-left .auth-brand-sub {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}
@media (max-height: 820px) {
  .auth-panel-left .auth-features { display: none !important; }
  .auth-panel-left .auth-brand-sub { margin-bottom: 0; }
}
@media (min-height: 821px) {
  .auth-panel-left .auth-features { margin-bottom: 16px; }
}

.fp3d-outer {
  flex: 1;
  min-height: 0;
  margin-left: -52px;
  margin-right: -52px;
  margin-bottom: -52px;
  width: calc(100% + 104px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* SSO loading overlay */
.sso-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(250,248,244,0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: inherit;
  z-index: 10;
}
.sso-loading-spinner {
  width: 28px; height: 28px;
  border: 3px solid rgba(201,169,110,0.25);
  border-top-color: #C9A96E;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* auth-feature-icon (diferente del .feature-icon del profile setup) */
.auth-feature-icon {
  color: #C9A96E;
  font-weight: 600;
  margin-right: 8px;
}

.auth-logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.auth-logo-link span {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 22px;
  color: #fff;
}

.auth-card {
  position: relative;
}
</style>

<template>
  <div ref="container" class="fp3d">
    <canvas ref="canvas" class="fp3d-canvas" />
    <div class="fp3d-hud-top">
      <span>PLANO 3D &nbsp;·&nbsp; VISTA ISO</span>
      <span>{{ phaseLabel }}</span>
    </div>
    <div class="fp3d-hud-bot">{{ phaseLabel }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const container  = ref(null)
const canvas     = ref(null)
const phaseLabel = ref('INICIANDO…')

let renderer, scene, camera, clock
let items        = []   // { mesh, startT, dur, phase }
let phaseMarkers = []   // { t, label }
let cycleStart   = 0
let resizeObs    = null

const WH = 2.8   // wall height
const WT = 0.15  // wall thickness
const FH = 0.06  // floor height

/* ─── easing ─────────────────────────────── */
function easeOut3(t) { return 1 - Math.pow(1 - Math.min(t, 1), 3) }

/* ─── geometry helpers ───────────────────── */
function makeGeo(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(0, h / 2, 0) // bottom at local y=0 → grows upward when scale.y animates
  return g
}

function makeCylGeo(r, h) {
  const g = new THREE.CylinderGeometry(r, r, h, 16)
  g.translate(0, h / 2, 0)
  return g
}

function addBox(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(makeGeo(w, h, d), mat)
  m.position.set(x, y, z)
  m.scale.y = 0.001
  m.castShadow = true; m.receiveShadow = true
  scene.add(m)
  return m
}

function addCyl(r, h, mat, x, y, z) {
  const m = new THREE.Mesh(makeCylGeo(r, h), mat)
  m.position.set(x, y, z)
  m.scale.y = 0.001
  m.castShadow = true; m.receiveShadow = true
  scene.add(m)
  return m
}

/* ─── animation queue ─────────────────────── */
let _t = 0

function at(time, label) {
  phaseMarkers.push({ t: time, label })
  _t = time
}

function seq(meshArray, dur = 0.55, stagger = 0.14) {
  meshArray.forEach((m, i) => {
    items.push({ mesh: m, startT: _t + i * stagger, dur })
  })
  _t += meshArray.length * stagger + dur
  return meshArray
}

function pause(s) { _t += s }

/* ─── mat helper ─────────────────────────── */
function m(hex, roughness = 0.85, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness, metalness })
}

/* ─── init Three.js ──────────────────────── */
function init() {
  const w = container.value.offsetWidth  || 400
  const h = container.value.offsetHeight || 320

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(w, h)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1A1814)
  scene.fog = new THREE.FogExp2(0x1A1814, 0.025)

  camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 120)
  camera.position.set(18, 20, 18)
  camera.lookAt(0, 1, 0)

  clock = new THREE.Clock()

  /* lights */
  scene.add(new THREE.AmbientLight(0xFFE4C8, 0.55))

  const sun = new THREE.DirectionalLight(0xFFF5E0, 1.8)
  sun.position.set(10, 22, 10)
  sun.castShadow = true
  sun.shadow.mapSize.setScalar(1024)
  sun.shadow.camera.left = sun.shadow.camera.bottom = -14
  sun.shadow.camera.right = sun.shadow.camera.top = 14
  sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 60
  scene.add(sun)

  const fill = new THREE.DirectionalLight(0xB8D4FF, 0.35)
  fill.position.set(-8, 6, -10)
  scene.add(fill)

  /* resize */
  resizeObs = new ResizeObserver(() => {
    const w2 = container.value?.offsetWidth  || 400
    const h2 = container.value?.offsetHeight || 320
    renderer.setSize(w2, h2)
    camera.aspect = w2 / h2
    camera.updateProjectionMatrix()
  })
  resizeObs.observe(container.value)
}

/* ─── build apartment ────────────────────── */
function build() {
  items = []; phaseMarkers = []; _t = 0

  /* ── materials ── */
  const mFloor   = m(0xC8B490)
  const mBalcony = m(0xB8A880)
  const mWallOut = m(0xF0EBE0, 0.9)
  const mWallIn  = m(0xDDD5C5, 0.9)
  const mCap     = m(0xC9A96E, 0.4, 0.55)
  const mSofa    = m(0x4A3D35)
  const mCush    = m(0xC47848)
  const mTabDk   = m(0x3C2E22)
  const mTabMd   = m(0x7A5C38)
  const mChair   = m(0xA09080)
  const mKitch   = m(0xC0B0A0)
  const mBedFr   = m(0x6E5640)
  const mMatt    = m(0xEADDB8)
  const mBed1    = m(0xD4A070)
  const mBed2    = m(0x90B8A8)
  const mWard    = m(0x5E4838)

  /* ═══════════════════════════════
     PHASE 1 — PISO
  ═══════════════════════════════ */
  at(0.4, 'PISO')
  seq([
    addBox(10, FH, 8,  mFloor,   0,  -FH, 0),   // main floor
    addBox(2,  FH, 4,  mBalcony, 6,  -FH, -1),  // balcony
  ], 0.9, 0.25)

  /* ═══════════════════════════════
     PHASE 2 — PERIMETRO
  ═══════════════════════════════ */
  pause(0.2)
  at(_t, 'PERIMETRO')

  const wallFront   = addBox(10+WT*2, WH, WT, mWallOut,   0,    0, -4)
  const capFront    = addBox(10+WT*2, 0.06, WT+0.01, mCap, 0, WH, -4)
  const wallBack    = addBox(10+WT*2, WH, WT, mWallOut,   0,    0, +4)
  const capBack     = addBox(10+WT*2, 0.06, WT+0.01, mCap, 0, WH, +4)
  const wallLeft    = addBox(WT, WH, 8+WT*2, mWallOut, -5,   0,  0)
  const capLeft     = addBox(WT+0.01, 0.06, 8+WT*2, mCap, -5, WH,  0)
  const wallRBk     = addBox(WT, WH, 4+WT, mWallOut,   +5,   0, +2)   // right (bedroom side)
  const capRBk      = addBox(WT+0.01, 0.06, 4+WT, mCap, +5, WH, +2)
  // balcony walls
  const wallBalcR   = addBox(WT, WH, 4+WT, mWallOut,  +7,   0, -1)
  const wallBalcBk  = addBox(2+WT*2, WH, WT, mWallOut, +6,   0,  0)

  seq([wallFront, capFront],   0.7, 0)
  seq([wallBack,  capBack],    0.7, 0)
  seq([wallLeft,  capLeft],    0.7, 0)
  seq([wallRBk,   capRBk],     0.7, 0)
  seq([wallBalcR, wallBalcBk], 0.5, 0.2)

  /* ═══════════════════════════════
     PHASE 3 — DIVISIONES
  ═══════════════════════════════ */
  pause(0.15)
  at(_t, 'DIVISIONES')

  const iw1  = addBox(WT, WH, 4+WT, mWallIn, -1.5, 0, -2)  // kitchen–living (front half)
  const iw1c = addBox(WT+0.01, 0.06, 4+WT, mCap, -1.5, WH, -2)
  const iw2  = addBox(10+WT*2, WH, WT, mWallIn,  0,    0,  0)  // living–bedroom
  const iw2c = addBox(10+WT*2, 0.06, WT+0.01, mCap, 0, WH,  0)
  const iw3  = addBox(WT, WH, 4+WT, mWallIn,  0,    0, +2)  // bedroom divider
  const iw3c = addBox(WT+0.01, 0.06, 4+WT, mCap, 0, WH, +2)

  seq([iw1, iw1c], 0.65, 0)
  seq([iw2, iw2c], 0.65, 0)
  seq([iw3, iw3c], 0.65, 0)

  /* ═══════════════════════════════
     PHASE 4 — LIVING
  ═══════════════════════════════ */
  pause(0.2)
  at(_t, 'LIVING')

  // Sofa L-shape
  const sofaMain = addBox(2.6, 0.52, 0.88, mSofa, 1.8, 0, -3.1)
  const sofaArm  = addBox(0.88, 0.52, 1.6,  mSofa, 3.2, 0, -2.5)
  const sofaBk   = addBox(2.6, 0.32, 0.1,   mSofa, 1.8, 0.52, -3.5)
  const cush1    = addBox(2.4, 0.32, 0.72,  mCush, 1.8, 0.52, -3.1)
  const cush2    = addBox(0.72, 0.32, 1.4,  mCush, 3.2, 0.52, -2.5)
  const cTable   = addBox(1.1, 0.36, 0.68,  mTabDk, 1.8, 0, -2.1)
  const tvUnit   = addBox(1.8, 0.42, 0.36,  mTabDk, 0.6, 0, -3.8)

  seq([sofaMain, sofaArm, sofaBk],  0.45, 0.12)
  seq([cush1, cush2],               0.35, 0.1)
  seq([cTable, tvUnit],             0.4,  0.18)

  /* ═══════════════════════════════
     PHASE 5 — COCINA
  ═══════════════════════════════ */
  pause(0.2)
  at(_t, 'COCINA')

  const cnt1 = addBox(3.1, 0.88, 0.62, mKitch, -3.2, 0, -3.7)   // main counter
  const cnt2 = addBox(0.62, 0.88, 2.8, mKitch, -4.65, 0, -2.3)  // side counter
  const cntT = addBox(3.1, 0.04, 0.62, mCap,   -3.2, 0.88, -3.7) // gold countertop
  const dTab = addBox(1.3, 0.74, 0.78, mTabMd, -2.7, 0, -1.4)   // dining table
  const ch1  = addCyl(0.17, 0.74, mChair, -3.5, 0, -1.4)
  const ch2  = addCyl(0.17, 0.74, mChair, -1.9, 0, -1.4)
  const ch3  = addCyl(0.17, 0.74, mChair, -2.7, 0, -2.0)
  const ch4  = addCyl(0.17, 0.74, mChair, -2.7, 0, -0.8)

  seq([cnt1, cnt2, cntT], 0.5, 0.16)
  seq([dTab, ch1, ch2, ch3, ch4], 0.38, 0.1)

  /* ═══════════════════════════════
     PHASE 6 — DORMITORIOS
  ═══════════════════════════════ */
  pause(0.2)
  at(_t, 'DORMITORIOS')

  // Bedroom 1 (x: 0 to +5, z: 0 to +4)
  const bf1  = addBox(2.1, 0.44, 1.9, mBedFr, +2.5, 0, +1.4)
  const hb1  = addBox(2.1, 0.88, 0.14, mBedFr, +2.5, 0.44, +0.5)
  const mt1  = addBox(1.95, 0.28, 1.7, mMatt,  +2.5, 0.44, +1.4)
  const bd1  = addBox(1.78, 0.16, 1.2, mBed1,  +2.5, 0.72, +1.6)
  const wd1  = addBox(1.5, 2.25, 0.55, mWard,  +4.2, 0, +3.55)

  // Bedroom 2 (x: -5 to 0, z: 0 to +4)
  const bf2  = addBox(2.0, 0.44, 1.9, mBedFr, -2.5, 0, +1.4)
  const hb2  = addBox(2.0, 0.88, 0.14, mBedFr, -2.5, 0.44, +0.5)
  const mt2  = addBox(1.85, 0.28, 1.7, mMatt,  -2.5, 0.44, +1.4)
  const bd2  = addBox(1.68, 0.16, 1.2, mBed2,  -2.5, 0.72, +1.6)
  const wd2  = addBox(1.5, 2.25, 0.55, mWard,  -4.2, 0, +3.55)

  seq([bf1, hb1, mt1, bd1, wd1], 0.42, 0.12)
  seq([bf2, hb2, mt2, bd2, wd2], 0.42, 0.12)
}

/* ─── animation loop ─────────────────────── */
function tick() {
  const elapsed = clock.getElapsedTime()
  const t = elapsed - cycleStart

  /* ── determine current phase label ── */
  let lbl = phaseMarkers[0]?.label || 'INICIANDO…'
  for (const mk of phaseMarkers) {
    if (t >= mk.t) lbl = mk.label
  }

  /* ── cycle end: last item finishes at _t, hold 2s, fade 1.5s ── */
  const buildEnd = _t
  const holdEnd  = buildEnd + 2.0
  const fadeEnd  = holdEnd  + 1.5

  if (t < holdEnd) {
    scene.fog.density = 0.025
    phaseLabel.value = 'FASE: ' + lbl
  } else if (t < fadeEnd) {
    const p = (t - holdEnd) / 1.5
    scene.fog.density = 0.025 + p * 0.85
    phaseLabel.value = 'BORRANDO…'
  } else {
    // Reset cycle
    cycleStart = elapsed
    items.forEach(i => { i.mesh.scale.y = 0.001 })
    scene.fog.density = 0.025
  }

  /* ── animate items ── */
  items.forEach(({ mesh, startT, dur }) => {
    const lt = t - startT
    if      (lt <= 0)   mesh.scale.y = 0.001
    else if (lt < dur)  mesh.scale.y = Math.max(0.001, easeOut3(lt / dur))
    else                mesh.scale.y = 1
  })

  /* ── camera orbit ── */
  const angle  = -Math.PI / 4 + t * 0.055
  const radius = 22
  camera.position.set(
    Math.cos(angle) * radius,
    19,
    Math.sin(angle) * radius
  )
  camera.lookAt(0, 1.4, 0)

  renderer.render(scene, camera)
}

/* ─── lifecycle ──────────────────────────── */
onMounted(() => {
  init()
  build()
  cycleStart = 0
  renderer.setAnimationLoop(tick)
})

onUnmounted(() => {
  renderer.setAnimationLoop(null)
  resizeObs?.disconnect()
  scene.traverse(obj => {
    if (!obj.isMesh) return
    obj.geometry?.dispose()
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    mats.forEach(m => m?.dispose())
  })
  renderer.dispose()
  items = []
})
</script>

<style scoped>
.fp3d {
  flex: 1;
  min-height: 0;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.fp3d-canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
  flex: 1;
  min-height: 0;
}

.fp3d-hud-top,
.fp3d-hud-bot {
  position: absolute;
  left: 0; right: 0;
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: rgba(201, 169, 110, 0.32);
  letter-spacing: 0.04em;
  user-select: none;
  pointer-events: none;
  padding: 0 10px;
}

.fp3d-hud-top { top: 4px; }
.fp3d-hud-bot {
  bottom: 4px;
  justify-content: flex-end;
}
</style>

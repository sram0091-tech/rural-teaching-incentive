<template>
  <div class="school-map-section" :class="{ 'school-map-fullscreen': isFullscreen }">
    <div class="nearby-bar">
      <span class="nearby-label">Nearby Places</span>
      <div class="nby-radius-ctrl">
        <span class="nby-radius-lbl">within</span>
        <select v-model="radius" class="nby-radius-select">
          <option :value="5000">5 km</option>
          <option :value="10000">10 km</option>
          <option :value="20000">20 km</option>
          <option :value="50000">50 km</option>
        </select>
      </div>
      <span
        v-for="cat in categories" :key="cat.key"
        class="nby-pill"
        :class="{
          'nby-pill--zero': cat.count === 0,
          'nby-pill--loading': cat.loading,
          'nby-pill--active': activeFilter === cat.key
        }"
        :style="cat.count !== 0 ? { '--c': cat.color } : {}"
        @click="cat.count > 0 && !cat.loading && toggleFilter(cat.key)"
      >
        <span v-if="cat.loading" class="nby-spinner"></span>
        <span v-else class="nby-dot"></span>
        {{ cat.label }}
        <strong v-if="cat.loading">…</strong>
        <strong v-else>{{ cat.count ?? '…' }}</strong>
      </span>
      <button class="nby-fullscreen-btn" @click="toggleFullscreen" :title="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'">
        <svg v-if="!isFullscreen" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>
      </button>
    </div>
    <div ref="mapEl" class="school-map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({ school: { type: Object, required: true } })

const mapEl = ref(null)
const radius = ref(10000)
const isFullscreen = ref(false)
let currentLatLng = null

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  setTimeout(() => mapInstance?.invalidateSize(), 50)
}


const categories = ref([
  { key: 'grocery',    label: 'Supermarkets',    tags: '["shop"~"supermarket|grocery|convenience"]',                  color: '#f97316', count: null, loading: false },
  { key: 'healthcare', label: 'Healthcare',       tags: '["amenity"~"hospital|clinic|doctors|pharmacy|health_post"]', color: '#ef4444', count: null, loading: false },
  { key: 'rail',       label: 'Rail & Metro',     tags: '["railway"~"station|halt|subway_entrance|tram_stop"]',       color: '#3b82f6', count: null, loading: false },
  { key: 'bus',        label: 'Bus stops',        tags: '["highway"="bus_stop"]',                                     color: '#8b5cf6', count: null, loading: false },
  { key: 'parks',      label: 'Parks & Leisure',  tags: '["leisure"="park"]',                                         color: '#22c55e', count: null, loading: false },
])

let mapInstance = null
let baseGroup = null       // circle + school pin
let catGroups = {}         // per-category layer groups
let radiusCircle = null
let maskLayer = null
let pinchEndTimer = null
const activeFilter = ref(null) // null = all visible, key = only that category

function buildMask(lat, lng, r) {
  const outer = [[-90, -180], [-90, 180], [90, 180], [90, -180]]
  const inner = []
  const steps = 72
  const cosLat = Math.cos(lat * Math.PI / 180)
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * 2 * Math.PI
    inner.push([lat + (r / 111320) * Math.cos(a), lng + (r / (111320 * cosLat)) * Math.sin(a)])
  }
  return L.polygon([outer, inner], {
    color: 'none', fillColor: '#000', fillOpacity: 0.22, stroke: false, interactive: false,
  })
}

const SCHOOL_PIN_HTML = (name) =>
  `<div class="school-pin">
    <svg class="school-pin-svg" width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25S30 25.5 30 15C30 6.716 23.284 0 15 0z" fill="#f59e0b"/>
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25S30 25.5 30 15C30 6.716 23.284 0 15 0z" fill="url(#sp)" opacity="0.18"/>
      <defs><linearGradient id="sp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient></defs>
      <circle cx="15" cy="15" r="7" fill="#fff" opacity="0.95"/>
      <text x="15" y="19" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#d97706">🏫</text>
    </svg>
    <div class="school-pin-label">${name}</div>
  </div>`

function dotIcon(color, size = 20) {
  return L.divIcon({
    html: `<div class="nby-marker" style="--mc:${color};width:${size}px;height:${size}px">
      <span class="nby-ring nby-ring--1"></span>
      <span class="nby-ring nby-ring--2"></span>
    </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

async function initMap() {
  if (!mapEl.value) return
  const lat = Number(props.school?.lat)
  const lng = Number(props.school?.lng)
  if (!lat || !lng) return

  currentLatLng = { lat, lng }
  categories.value.forEach(c => { c.count = null; c.loading = false })
  activeFilter.value = null

  if (mapInstance) { mapInstance.remove(); mapInstance = null }
  catGroups = {}

  mapInstance = L.map(mapEl.value, { zoomControl: true, scrollWheelZoom: false, touchZoom: true }).setView([lat, lng], 13)

  // Trackpad pinch sends ctrlKey+wheel — re-enable scroll zoom only for that gesture
  mapEl.value.addEventListener('wheel', (e) => {
    if (!e.ctrlKey || !mapInstance) return
    mapInstance.scrollWheelZoom.enable()
    clearTimeout(pinchEndTimer)
    pinchEndTimer = setTimeout(() => mapInstance?.scrollWheelZoom.disable(), 300)
  }, { passive: true })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(mapInstance)

  baseGroup = L.layerGroup().addTo(mapInstance)

  // create a layer group per category
  for (const cat of categories.value) {
    catGroups[cat.key] = L.layerGroup().addTo(mapInstance)
  }

  radiusCircle = L.circle([lat, lng], {
    radius: radius.value,
    color: '#1F6FEB',
    fillColor: '#1F6FEB',
    fillOpacity: 0.04,
    weight: 1.5,
    dashArray: '6 4',
  }).addTo(baseGroup)

  if (maskLayer) { mapInstance.removeLayer(maskLayer); maskLayer = null }
  maskLayer = buildMask(lat, lng, radius.value).addTo(mapInstance)

  const schoolIcon = L.divIcon({
    html: SCHOOL_PIN_HTML(props.school.name),
    className: '',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  })
  L.marker([lat, lng], { icon: schoolIcon, zIndexOffset: 1000 }).addTo(baseGroup)

  const city = props.school?.nearest_city
  const dist = props.school?.distance_to_city
  if (city && dist) {
    const cityLabel = L.divIcon({
      html: `<div style="font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:700;color:#374151;background:rgba(255,255,255,0.88);padding:3px 8px;border-radius:6px;border:1px solid #e5e7eb;white-space:nowrap">🏙 ${city} — ${Math.round(dist)} km away</div>`,
      className: '',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    })
    L.marker([lat, lng], { icon: cityLabel, zIndexOffset: -100, interactive: false })
      .addTo(baseGroup)
      ._icon?.style.setProperty('transform', 'translate(14px, 24px)')
  }

  await fetchNearby(lat, lng)
}

function buildPopup(el, cat, lat, lng) {
  const t = el.tags || {}
  const name = t.name || cat.label

  const addrParts = [
    t['addr:housenumber'] && t['addr:street'] ? `${t['addr:housenumber']} ${t['addr:street']}` : t['addr:street'],
    t['addr:suburb'] || t['addr:city'],
  ].filter(Boolean)
  const address = addrParts.join(', ')

  const phone = t.phone || t['contact:phone'] || ''
  const website = t.website || t['contact:website'] || ''
  const hours = t.opening_hours || ''

  const f = (icon, text) => text
    ? `<div style="display:flex;gap:6px;align-items:flex-start;margin-top:5px">
        <span style="flex-shrink:0;color:#6b7280;margin-top:1px">${icon}</span>
        <span style="font-size:0.76rem;color:#374151;line-height:1.4">${text}</span>
       </div>`
    : ''

  return `
    <div style="font-family:'DM Sans',sans-serif;min-width:180px">
      <div style="font-size:0.88rem;font-weight:700;color:#111827;margin-bottom:4px;line-height:1.3">${name}</div>
      <div style="display:inline-block;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${cat.color};background:${cat.color}18;padding:2px 7px;border-radius:99px;margin-bottom:6px">${cat.label}</div>
      ${f('📍', address)}
      ${f('📞', phone ? `<a href="tel:${phone}" style="color:#1F6FEB;text-decoration:none">${phone}</a>` : '')}
      ${f('🕐', hours)}
      ${website ? f('🌐', `<a href="${website}" target="_blank" rel="noopener" style="color:#1F6FEB;text-decoration:none;word-break:break-all">${website.replace(/^https?:\/\//, '')}</a>`) : ''}
    </div>`
}

async function fetchNearby(lat, lng) {
  const r = radius.value
  for (const cat of categories.value) {
    cat.loading = true
    try {
      const q = `[out:json][timeout:20];
(
  node${cat.tags}(around:${r},${lat},${lng});
  way${cat.tags}(around:${r},${lat},${lng});
);
out center;`
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`)
      const data = await res.json()
      const elements = data.elements || []
      cat.count = elements.length

      const icon = dotIcon(cat.color, 20)
      for (const el of elements) {
        const elLat = el.lat ?? el.center?.lat
        const elLng = el.lon ?? el.center?.lon
        if (elLat && elLng) {
          L.marker([elLat, elLng], { icon })
            .bindPopup(buildPopup(el, cat, elLat, elLng), { maxWidth: 260, className: 'osm-popup' })
            .addTo(catGroups[cat.key])
        }
      }
    } catch (_) {
      cat.count = 0
    } finally {
      cat.loading = false
    }
  }
}

function toggleFilter(key) {
  if (activeFilter.value === key) {
    // deactivate — show all categories
    activeFilter.value = null
    for (const cat of categories.value) {
      if (catGroups[cat.key] && !mapInstance.hasLayer(catGroups[cat.key])) {
        catGroups[cat.key].addTo(mapInstance)
      }
    }
  } else {
    // activate — hide all others, show only this one
    activeFilter.value = key
    for (const cat of categories.value) {
      if (!catGroups[cat.key]) continue
      if (cat.key === key) {
        if (!mapInstance.hasLayer(catGroups[cat.key])) catGroups[cat.key].addTo(mapInstance)
      } else {
        if (mapInstance.hasLayer(catGroups[cat.key])) mapInstance.removeLayer(catGroups[cat.key])
      }
    }
  }
}

async function refreshPlaces() {
  if (!mapInstance || !currentLatLng) return
  const { lat, lng } = currentLatLng
  categories.value.forEach(c => { c.count = null; c.loading = false })
  activeFilter.value = null

  baseGroup.clearLayers()
  for (const cat of categories.value) {
    if (catGroups[cat.key]) {
      catGroups[cat.key].clearLayers()
      if (!mapInstance.hasLayer(catGroups[cat.key])) catGroups[cat.key].addTo(mapInstance)
    }
  }

  radiusCircle = L.circle([lat, lng], {
    radius: radius.value,
    color: '#1F6FEB', fillColor: '#1F6FEB', fillOpacity: 0.04,
    weight: 1.5, dashArray: '6 4',
  }).addTo(baseGroup)

  if (maskLayer) { mapInstance.removeLayer(maskLayer); maskLayer = null }
  maskLayer = buildMask(lat, lng, radius.value).addTo(mapInstance)
  mapInstance.fitBounds(radiusCircle.getBounds(), { padding: [30, 30] })

  const schoolIcon = L.divIcon({
    html: SCHOOL_PIN_HTML(props.school.name),
    className: '',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  })
  L.marker([lat, lng], { icon: schoolIcon, zIndexOffset: 1000 }).addTo(baseGroup)

  await fetchNearby(lat, lng)
}

function onKeydown(e) { if (e.key === 'Escape' && isFullscreen.value) toggleFullscreen() }

onMounted(() => { initMap(); document.addEventListener('keydown', onKeydown) })
watch(() => props.school?.id, initMap)
watch(radius, refreshPlaces)
onUnmounted(() => {
  if (mapInstance) { mapInstance.remove(); mapInstance = null }
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.school-map-section {
  border: 1px solid var(--b);
  border-radius: var(--r);
  overflow: hidden;
  background: var(--s);
}
.nearby-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-bottom: 1px solid var(--b);
  background: #fff;
}
.nearby-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ink);
  margin-right: 4px;
}
.nby-radius-ctrl {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 4px;
}
.nby-radius-lbl {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  color: var(--ink3);
}
.nby-radius-select {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--blue);
  border: 1.5px solid var(--blue);
  border-radius: 6px;
  padding: 2px 6px;
  background: var(--blue-s, #eff6ff);
  cursor: pointer;
  outline: none;
}
.nby-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px 3px 7px;
  border-radius: 99px;
  border: 1.5px solid var(--c);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  color: var(--c);
  background: #fff;
  cursor: pointer;
  transition: opacity 0.2s, border-color 0.2s, color 0.2s, background 0.2s;
}
.nby-pill:not(.nby-pill--zero):not(.nby-pill--loading):hover {
  background: color-mix(in srgb, var(--c) 10%, #fff);
}
.nby-pill--active {
  background: var(--c) !important;
  color: #fff !important;
}
.nby-pill--active .nby-dot {
  background: #fff !important;
}
.nby-pill--zero {
  --c: #9ca3af;
  opacity: 0.55;
}
.nby-pill--loading {
  opacity: 0.8;
}
.nby-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c);
  flex-shrink: 0;
}
.nby-spinner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid var(--c);
  border-top-color: transparent;
  flex-shrink: 0;
  animation: nby-spin 0.7s linear infinite;
}
@keyframes nby-spin {
  to { transform: rotate(360deg); }
}
.nby-pill strong { font-weight: 700; }
.school-map {
  width: 100%;
  height: 520px;
}
.school-map-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  border-radius: 0 !important;
  border: none !important;
  display: flex;
  flex-direction: column;
}
.school-map-fullscreen .school-map {
  flex: 1;
  height: 100% !important;
}
.nby-fullscreen-btn {
  margin-left: auto;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1.5px solid var(--b2);
  background: var(--s);
  color: var(--ink2);
  cursor: pointer;
  transition: all 0.13s;
}
.nby-fullscreen-btn:hover {
  border-color: var(--blue);
  color: var(--blue);
  background: var(--blue-s);
}
</style>

<style>
.nby-marker {
  border-radius: 50%;
  background: var(--mc);
  border: 2.5px solid #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,0.4);
  position: relative;
}
.nby-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--mc);
  animation: nby-pulse 2.2s ease-out infinite;
  opacity: 0;
}
.nby-ring--2 {
  animation-delay: 1.1s;
}
@keyframes nby-pulse {
  0%   { transform: scale(1);   opacity: 0.75; }
  100% { transform: scale(2.8); opacity: 0; }
}

.osm-popup .leaflet-popup-content-wrapper {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.14);
  padding: 0;
}
.osm-popup .leaflet-popup-content {
  margin: 14px 14px 12px;
}
.osm-popup .leaflet-popup-tip {
  box-shadow: none;
}
.school-pin {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}
.school-pin-svg {
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
  display: block;
}
.school-pin-label {
  margin-top: 4px;
  background: #f59e0b;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}
</style>

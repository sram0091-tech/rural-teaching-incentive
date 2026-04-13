/**
 * Explorer REST API — paths relative to same origin (/api/explorer/…).
 */

function normalizeLocationsPayload(json) {
  const items = json.items ?? json.data ?? json.locations ?? []
  const total = json.total ?? json.meta?.total ?? json.count ?? items.length
  return { items: Array.isArray(items) ? items : [], total: Number(total) || 0 }
}

function normalizeHeroPayload(json) {
  if (Array.isArray(json)) return json
  return json.items ?? json.data ?? json.locations ?? []
}

function normalizeComparePayload(json) {
  if (Array.isArray(json)) return json
  return json.items ?? json.data ?? json.locations ?? []
}

export async function fetchExplorerFilters() {
  const r = await fetch('/api/explorer/filters')
  if (!r.ok) throw new Error(`filters ${r.status}`)
  return r.json()
}

export async function fetchExplorerLocations(params) {
  const u = new URL('/api/explorer/locations', window.location.origin)
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    u.searchParams.set(k, String(v))
  })
  const r = await fetch(u.pathname + u.search)
  if (!r.ok) throw new Error(`locations ${r.status}`)
  const json = await r.json()
  return normalizeLocationsPayload(json)
}

export async function fetchExplorerLocation(id) {
  const r = await fetch(`/api/explorer/locations/${encodeURIComponent(id)}`)
  if (!r.ok) throw new Error(`location ${r.status}`)
  return r.json()
}

export async function fetchExplorerCompare(locationIds) {
  const u = new URL('/api/explorer/compare', window.location.origin)
  u.searchParams.set('location_ids', locationIds.join(','))
  const r = await fetch(u.pathname + u.search)
  if (!r.ok) throw new Error(`compare ${r.status}`)
  const json = await r.json()
  return normalizeComparePayload(json)
}

export async function fetchExplorerHeroTop() {
  const r = await fetch('/api/explorer/hero-top')
  if (!r.ok) throw new Error(`hero-top ${r.status}`)
  const json = await r.json()
  return normalizeHeroPayload(json)
}

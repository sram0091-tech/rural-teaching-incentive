/**
 * Explorer REST API — paths under `/api/explorer/*`.
 *
 * URLs: `import { API_BASE } from '../config/api.js'` then
 *   fetch(`${API_BASE}/api/explorer/filters`)
 *
 * Query params (FastAPI):
 *   state, employee_type, remoteness_ids, search, sort, page, page_size
 */

import { API_BASE, apiUrlObject } from '../config/api.js'

function pickTotal(json) {
  const t =
    json.total ??
    json.total_count ??
    json.totalCount ??
    json.count ??
    json.meta?.total ??
    json.pagination?.total
  return Number(t)
}

export function normalizeLocationsPayload(json) {
  const items = json.items ?? json.results ?? json.data ?? json.locations ?? []
  const arr = Array.isArray(items) ? items : []
  const total = pickTotal(json)
  return { items: arr, total: Number.isFinite(total) ? total : arr.length }
}

export function normalizeHeroPayload(json) {
  if (Array.isArray(json)) return json
  return json.items ?? json.results ?? json.data ?? json.locations ?? json.hero ?? []
}

export function normalizeComparePayload(json) {
  if (Array.isArray(json)) return json
  return json.items ?? json.results ?? json.data ?? json.locations ?? json.comparison ?? []
}

export async function fetchExplorerFilters() {
  const r = await fetch(`${API_BASE}/api/explorer/filters`)
  if (!r.ok) throw new Error(`filters ${r.status}`)
  return r.json()
}

/**
 * @param {Record<string, string | number | undefined | null>} params
 */
export async function fetchExplorerLocations(params) {
  const u = apiUrlObject('/api/explorer/locations')
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    u.searchParams.set(k, String(v))
  })
  const r = await fetch(u.toString())
  if (!r.ok) throw new Error(`locations ${r.status}`)
  const json = await r.json()
  return normalizeLocationsPayload(json)
}

export async function fetchExplorerLocation(locationId) {
  const r = await fetch(
    `${API_BASE}/api/explorer/locations/${encodeURIComponent(locationId)}`
  )
  if (!r.ok) throw new Error(`location ${r.status}`)
  return r.json()
}

export async function fetchExplorerCompare(locationIds) {
  const u = apiUrlObject('/api/explorer/compare')
  u.searchParams.set('location_ids', locationIds.join(','))
  const r = await fetch(u.toString())
  if (!r.ok) throw new Error(`compare ${r.status}`)
  const json = await r.json()
  return normalizeComparePayload(json)
}

export async function fetchExplorerHeroTop() {
  const r = await fetch(`${API_BASE}/api/explorer/hero-top`)
  if (!r.ok) throw new Error(`hero-top ${r.status}`)
  const json = await r.json()
  return normalizeHeroPayload(json)
}

export async function fetchIncentiveBreakdown(schoolId) {
  const u = apiUrlObject('/api/incentives/breakdown')
  u.searchParams.set('school_id', String(schoolId))
  const r = await fetch(u.toString())
  if (!r.ok) throw new Error(`incentive breakdown ${r.status}`)
  return r.json()
}

export async function checkEligibility(payload) {
  const r = await fetch(`${API_BASE}/api/eligibility/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error(`eligibility ${r.status}`)
  return r.json()
}

export async function fetchIncentiveEstimate(payload) {
  const r = await fetch(`${API_BASE}/api/incentives/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error(`incentive estimate ${r.status}`)
  return r.json()
}

export async function fetchVerifyIncentiveLink(schoolId) {
  const u = apiUrlObject('/api/incentives/verify-link')
  u.searchParams.set('school_id', String(schoolId))
  const r = await fetch(u.toString())
  if (!r.ok) throw new Error(`verify incentive link ${r.status}`)
  return r.json()
}

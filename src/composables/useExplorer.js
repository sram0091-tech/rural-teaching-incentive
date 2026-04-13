import { ref, reactive, computed, watch } from 'vue'
import { PAGE_SIZE } from '../data/db.js'
import {
  fetchExplorerFilters,
  fetchExplorerLocations,
  fetchExplorerLocation,
  fetchExplorerCompare,
  fetchExplorerHeroTop,
} from '../api/explorerApi.js'

const DEFAULT_STATE_OPTS = [
  { v: 'both', icon: '🗺️', label: 'Both' },
  { v: 'qld', icon: '☀️', label: 'QLD' },
  { v: 'nsw', icon: '🌉', label: 'NSW' },
]
const DEFAULT_REMOTENESS_OPTS = [
  { v: '5', icon: '🔴', label: 'Very Remote' },
  { v: '4', icon: '🟠', label: 'Remote' },
  { v: '3', icon: '🟡', label: 'Outer Regional' },
  { v: '2', icon: '🟢', label: 'Inner Regional' },
  { v: '1', icon: '🔵', label: 'Major Cities' },
]

function mapFiltersPayload(json) {
  const states = json.states ?? json.state_options ?? []
  const rem = json.remoteness_categories ?? json.remoteness ?? json.remoteness_options ?? []
  const stateOpts = states.length
    ? states.map((s) => ({
        v: s.value ?? s.v ?? s.id,
        icon: s.icon ?? '📍',
        label: s.label ?? s.name ?? String(s.value ?? ''),
      }))
    : DEFAULT_STATE_OPTS
  const remotenessOpts = rem.length
    ? rem.map((r) => ({
        v: String(r.id ?? r.remoteness_category_id ?? r.v),
        icon: r.icon ?? '📍',
        label: r.label ?? r.name ?? String(r.id ?? ''),
      }))
    : DEFAULT_REMOTENESS_OPTS
  return { stateOpts, remotenessOpts }
}

let filtersPromise = null
const stateOpts = ref([...DEFAULT_STATE_OPTS])
const remotenessOpts = ref([...DEFAULT_REMOTENESS_OPTS])

function loadFiltersOnce() {
  if (!filtersPromise) {
    filtersPromise = fetchExplorerFilters()
      .then((json) => {
        const m = mapFiltersPayload(json)
        stateOpts.value = m.stateOpts
        remotenessOpts.value = m.remotenessOpts
      })
      .catch((e) => {
        console.warn('explorer filters fallback', e)
      })
  }
  return filtersPromise
}

const heroTop = ref([])

let heroLoaded = false
function loadHeroTopOnce() {
  if (heroLoaded) return
  heroLoaded = true
  fetchExplorerHeroTop()
    .then((rows) => {
      heroTop.value = Array.isArray(rows) ? rows : []
    })
    .catch((e) => {
      console.warn('hero-top', e)
      heroTop.value = []
      heroLoaded = false
    })
}

// ── Shared reactive state ──
const fState = ref('both')
const fEmp = ref('perm')
const fRem = reactive(new Set())
const fSort = ref('inc')
const cmpList = reactive([])
const openRow = ref(null)
const showCmp = ref(false)
const insSchool = ref(null)
const sbsMode = ref(false)
const currentPage = ref(1)
const guidePage = ref(1)

const searchListItems = ref([])
const searchTotal = ref(0)
const searchLoading = ref(false)

const guideListItems = ref([])
const guideTotal = ref(0)
const guideLoading = ref(false)

const compareSchools = ref([])
const compareLoading = ref(false)

// ── Filters ──
function selState(v) {
  fState.value = v
  currentPage.value = 1
}
function selEmp(v) {
  fEmp.value = v
  currentPage.value = 1
}
function toggleRem(v) {
  fRem.has(v) ? fRem.delete(v) : fRem.add(v)
  currentPage.value = 1
}
function setSort(v) {
  fSort.value = v
  currentPage.value = 1
}

const filterBadgeCount = computed(() => {
  let n = 0
  if (fState.value !== 'both') n++
  if (fRem.size > 0) n++
  return n
})

const remSize = computed(() => fRem.size)

function buildLocationQuery({ page, q }) {
  const remoteness_ids = [...fRem].sort().join(',')
  const params = {
    page,
    per_page: PAGE_SIZE,
    state: fState.value,
    employee_type: fEmp.value,
    sort: fSort.value,
  }
  if (remoteness_ids) params.remoteness_ids = remoteness_ids
  const t = (q || '').trim()
  if (t) params.q = t
  return params
}

function shouldSkipLocationsList(q) {
  const t = (q || '').trim()
  return !t && fRem.size === 0 && fState.value === 'both'
}

async function loadSearchLocations(q) {
  if (shouldSkipLocationsList(q)) {
    searchListItems.value = []
    searchTotal.value = 0
    return
  }
  searchLoading.value = true
  try {
    const { items, total } = await fetchExplorerLocations(
      buildLocationQuery({ page: currentPage.value, q })
    )
    searchListItems.value = items
    searchTotal.value = total
  } catch (e) {
    console.warn('search locations', e)
    searchListItems.value = []
    searchTotal.value = 0
  } finally {
    searchLoading.value = false
  }
}

async function loadGuideLocations() {
  guideLoading.value = true
  try {
    const { items, total } = await fetchExplorerLocations(
      buildLocationQuery({ page: guidePage.value, q: '' })
    )
    guideListItems.value = items
    guideTotal.value = total
  } catch (e) {
    console.warn('guide locations', e)
    guideListItems.value = []
    guideTotal.value = 0
  } finally {
    guideLoading.value = false
  }
}

// ── Compare ──
function toggleCmp(id) {
  const idx = cmpList.indexOf(id)
  if (idx > -1) cmpList.splice(idx, 1)
  else if (cmpList.length < 4) cmpList.push(id)
}
function clearCompare() {
  cmpList.splice(0, cmpList.length)
}
function isCmp(id) {
  return cmpList.includes(id)
}

watch(
  () => [...cmpList],
  async (ids) => {
    if (!ids.length) {
      compareSchools.value = []
      return
    }
    compareLoading.value = true
    try {
      const rows = await fetchExplorerCompare(ids)
      const byId = new Map(rows.map((r) => [String(r.id), r]))
      compareSchools.value = ids.map((id) => byId.get(String(id))).filter(Boolean)
    } catch (e) {
      console.warn('compare', e)
      compareSchools.value = []
    } finally {
      compareLoading.value = false
    }
  },
  { deep: true }
)

// ── Open row ──
function toggleRow(id) {
  openRow.value = openRow.value === id ? null : id
}

// ── Lifestyle ──
async function viewLifestyle(id) {
  try {
    const l = await fetchExplorerLocation(id)
    insSchool.value = l
    sbsMode.value = false
    return 'insights'
  } catch (e) {
    console.warn('viewLifestyle', e)
    return null
  }
}
async function selectIns(id) {
  try {
    insSchool.value = await fetchExplorerLocation(id)
    sbsMode.value = false
  } catch (e) {
    console.warn('selectIns', e)
  }
}
function clearIns() {
  insSchool.value = null
  sbsMode.value = false
}
function toggleSbs() {
  if (cmpList.length < 2) return
  sbsMode.value = !sbsMode.value
}

async function searchSchoolsForDropdown(q) {
  const t = (q || '').trim()
  if (!t) return []
  try {
    const { items } = await fetchExplorerLocations({
      page: 1,
      per_page: 8,
      state: 'both',
      employee_type: 'perm',
      sort: 'az',
      q: t,
    })
    return items
  } catch (e) {
    console.warn('school search', e)
    return []
  }
}

export function useExplorer() {
  loadFiltersOnce()
  loadHeroTopOnce()
  return {
    PAGE_SIZE,
    stateOpts,
    remotenessOpts,
    fState,
    fEmp,
    fRem,
    fSort,
    cmpList,
    openRow,
    showCmp,
    insSchool,
    sbsMode,
    currentPage,
    guidePage,
    filterBadgeCount,
    remSize,
    selState,
    selEmp,
    toggleRem,
    setSort,
    loadSearchLocations,
    loadGuideLocations,
    searchListItems,
    searchTotal,
    searchLoading,
    guideListItems,
    guideTotal,
    guideLoading,
    compareSchools,
    compareLoading,
    toggleCmp,
    clearCompare,
    isCmp,
    toggleRow,
    viewLifestyle,
    selectIns,
    clearIns,
    toggleSbs,
    heroTop,
    searchSchoolsForDropdown,
  }
}

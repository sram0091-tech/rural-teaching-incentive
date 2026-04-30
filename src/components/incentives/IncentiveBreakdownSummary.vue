<template>
  <section class="summary">
    <div class="summary-head">
      <h3>Incentive breakdown</h3>
    </div>
    <div v-if="loading" class="summary-skeleton">
      <div class="skel" v-for="i in 3" :key="i"></div>
    </div>
    <div v-else-if="cards.length" class="cards">
      <article v-for="card in cards" :key="card.key" class="allowance-card">
        <div class="card-top">
          <div>
            <h4>{{ card.category }}</h4>
            <div class="card-meta">{{ card.level }} · {{ card.frequency }}</div>
          </div>
          <div class="amount-pill" :class="{ variable: card.isVariable }">{{ card.amount }}</div>
        </div>
        <div class="card-details">
          <div>
            <span>Employee types</span>
            <strong>{{ card.employeeTypes }}</strong>
          </div>
          <div>
            <span>Min experience</span>
            <strong>{{ card.minExperience }} yrs</strong>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="empty">No incentive breakdown available for this school</div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchIncentiveBreakdown } from '../../api/explorerApi.js'

const props = defineProps({
  school: { type: Object, required: true },
})

const loading = ref(false)
const breakdown = ref(null)

const groups = computed(() => {
  const rawGroups = breakdown.value?.groups || breakdown.value?.categories
  if (Array.isArray(rawGroups) && rawGroups.length) {
    return rawGroups.map((g) => ({
      category: g.category || g.name || g.allowance_type || 'Allowance',
      rows: g.rows || g.incentives || g.variants || [],
    })).filter((g) => g.rows.length)
  }

  const rows = breakdown.value?.rows || breakdown.value?.incentives || breakdown.value?.variants
  if (Array.isArray(rows) && rows.length) return groupRows(rows)

  const fallback = Number(props.school?.annual_incentive || 0)
  if (fallback <= 0) return []
  return [{
    category: props.school?.inc_label || 'Incentive package',
    rows: [{
      level: props.school?.remoteness || '—',
      amount: fallback,
      frequency: 'annual',
      employee_types: ['Permanent', 'Temporary'],
      min_experience: 0,
    }],
  }]
})

const cards = computed(() => groups.value.flatMap((group) =>
  group.rows.map((row, index) => ({
    key: `${group.category}-${row.id || row.level || row.name || index}`,
    category: group.category,
    level: row.level || row.tier || props.school.remoteness || '—',
    amount: amount(row),
    isVariable: isVariable(row),
    frequency: row.frequency || 'annual',
    employeeTypes: employeeTypes(row),
    minExperience: row.min_experience ?? row.minExperience ?? 0,
  }))
))

async function load() {
  const schoolId = props.school?.school_id || props.school?.id
  if (!schoolId) return
  loading.value = true
  try {
    breakdown.value = await fetchIncentiveBreakdown(schoolId)
  } catch (e) {
    breakdown.value = null
  } finally {
    loading.value = false
  }
}

function groupRows(rows) {
  const map = new Map()
  rows.forEach((row) => {
    const key = row.category || row.allowance_type || row.allowanceType || 'Allowance'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(row)
  })
  return [...map.entries()].map(([category, groupedRows]) => ({ category, rows: groupedRows }))
}

function amount(row) {
  if (isVariable(row)) return 'Variable'
  const n = Number(row.amount ?? row.annual_amount ?? 0)
  return n > 0 ? `$${Math.round(n).toLocaleString()}` : '—'
}

function isVariable(row) {
  const value = row.amount ?? row.annual_amount
  return Boolean(row.is_variable_amount || row.variable || String(value).trim() === '—')
}

function employeeTypes(row) {
  const value = row.employee_types || row.employeeTypes || row.employee_type || row.employeeType
  if (Array.isArray(value)) return value.join(', ')
  return value || 'Permanent, Temporary'
}

onMounted(load)
watch(() => props.school?.school_id || props.school?.id, load)
</script>

<style scoped>
.summary { margin-top:0; }
.summary-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.summary h3 { font-size:0.88rem; color:var(--ink); line-height:1.2; letter-spacing:0; }
.cards { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.allowance-card { background:var(--s); border:1px solid var(--b); border-radius:var(--r); padding:12px; transition:border-color 0.14s, box-shadow 0.14s, transform 0.14s; }
.allowance-card:hover { border-color:rgba(30,158,86,0.35); box-shadow:0 8px 20px rgba(26,23,20,0.06); transform:translateY(-1px); }
.card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; padding-bottom:10px; border-bottom:1px solid var(--b); }
.card-top h4 { font-size:0.78rem; line-height:1.25; color:var(--ink); margin:0 0 3px; }
.card-meta { font-size:0.64rem; color:var(--ink3); font-weight:700; }
.amount-pill { flex-shrink:0; border-radius:99px; padding:4px 9px; background:var(--green-s); color:var(--green-d); font-size:0.72rem; font-weight:900; }
.amount-pill.variable { background:var(--blue-s); color:var(--blue-d); font-style:italic; }
.card-details { display:grid; grid-template-columns:1.2fr 0.8fr; gap:10px; padding-top:10px; }
.card-details div { min-width:0; }
.card-details span { display:block; font-size:0.56rem; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink3); font-weight:900; margin-bottom:2px; }
.card-details strong { display:block; font-size:0.68rem; line-height:1.3; color:var(--ink2); font-weight:800; }
.empty { font-size:0.72rem; color:var(--ink3); padding:8px 0; }
.summary-skeleton { display:flex; flex-direction:column; gap:7px; }
.skel { height:34px; border-radius:var(--r2); background:linear-gradient(90deg,var(--s2),#f8f7f4,var(--s2)); background-size:220% 100%; animation:pulse 1.1s infinite linear; }
@keyframes pulse { from{background-position:0 0} to{background-position:-220% 0} }
@media (max-width:720px) {
  .cards { grid-template-columns:1fr; }
}
</style>

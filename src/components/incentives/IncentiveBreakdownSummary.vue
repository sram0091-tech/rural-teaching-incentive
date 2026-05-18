<template>
  <section class="summary">
    <div class="summary-head">
      <h3>{{ profile?.ready ? 'Personalised eligible incentives' : 'Included incentives' }}</h3>
      <span v-if="!loading && cards.length" class="summary-count">{{ cards.length }}</span>
    </div>
    <p v-if="employmentBasisNote" class="summary-note">{{ employmentBasisNote }}</p>
    <div v-if="loading" class="summary-skeleton">
      <div class="skel" v-for="i in 3" :key="i"></div>
    </div>
    <div v-else-if="cards.length" class="cards">
      <article v-for="card in cards" :key="card.key" class="allowance-card" :class="{ 'card-variable': card.isVariable }">
        <div class="card-top">
          <div class="card-label-wrap">
            <h4>{{ card.category }}</h4>
            <div v-if="card.employeeTypes" class="card-emp-types">Applies to: {{ card.employeeTypes }}</div>
          </div>
          <div class="amount-pill" :class="{ variable: card.isVariable }">
            <span v-if="card.isVariable">Verify amount</span>
            <span v-else>{{ card.amount }}</span>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="empty">{{ emptyMessage }}</div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchIncentiveBreakdown, fetchIncentiveEstimate } from '../../api/explorerApi.js'

const props = defineProps({
  school: { type: Object, required: true },
  profile: { type: Object, default: null },
})

const loading = ref(false)
const breakdown = ref(null)
const estimate = ref(null)

const emptyMessage = computed(() => 'No incentive breakdown available for this school')
const employmentBasisNote = computed(() => {
  if (!props.profile?.ready) return ''
  return props.school?.state_id === '1'
    ? 'Only applicable to Public Service Officers and Temporary employees.'
    : 'Only applicable to Permanent teachers.'
})

const groups = computed(() => {
  const estimateRows = rowsFromEstimate(estimate.value)
  if (props.profile?.ready && estimateRows.length) {
    const grouped = groupRows(estimateRows)
    if (props.school?.state_id === '1') {
      return grouped.map((g) => {
        if ((g.category || '').toLowerCase().includes('locality allowance')) {
          return { ...g, rows: filterQldLocalityRows(g.rows) }
        }
        return g
      }).filter((g) => g.rows.length)
    }
    return grouped
  }

  const rawGroups = breakdown.value?.groups || breakdown.value?.categories
  if (Array.isArray(rawGroups) && rawGroups.length) {
    let mapped = rawGroups.map((g) => ({
      category: g.category || g.name || g.allowance_type || 'Allowance',
      rows: g.rows || g.incentives || g.variants || [],
    })).filter((g) => g.rows.length)
    if (props.profile?.ready && props.school?.state_id === '1') {
      mapped = mapped.map((g) => {
        if ((g.category || '').toLowerCase().includes('locality allowance')) {
          return { ...g, rows: filterQldLocalityRows(g.rows) }
        }
        return g
      }).filter((g) => g.rows.length)
    }
    return mapped
  }

  const rows = breakdown.value?.rows || breakdown.value?.incentives || breakdown.value?.variants
  if (Array.isArray(rows) && rows.length) {
    const grouped = groupRows(rows)
    if (props.profile?.ready && props.school?.state_id === '1') {
      return grouped.map((g) => {
        if ((g.category || '').toLowerCase().includes('locality allowance')) {
          return { ...g, rows: filterQldLocalityRows(g.rows) }
        }
        return g
      }).filter((g) => g.rows.length)
    }
    return grouped
  }

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

const cards = computed(() => disambiguateCards(groups.value.flatMap((group) =>
  group.rows.filter(employeeMatchesProfile).map((row, index) => ({
    key: `${group.category}-${row.id || row.level || row.name || row.incentive_name || index}`,
    category: displayName(row, group),
    rawCategory: group.category,
    row,
    level: row.level || row.tier || props.school.remoteness || '—',
    amount: amount(row),
    amountValue: numericAmount(row),
    isVariable: isVariable(row),
    frequency: row.frequency || 'annual',
    employeeTypes: employeeTypesLabel(row),
  }))
)))

async function load() {
  const schoolId = props.school?.school_id || props.school?.id
  if (!schoolId) return
  loading.value = true
  try {
    const [breakdownPayload, estimatePayload] = await Promise.all([
      fetchIncentiveBreakdown(schoolId).catch(() => null),
      props.profile?.ready
        ? fetchIncentiveEstimate({
            school_id: schoolId,
            employment_type: props.profile.employmentType || defaultEmploymentType(props.school),
            years_experience: Number(props.profile.yearsExperience || 0),
            years_of_experience: Number(props.profile.yearsExperience || 0),
            experience_years: Number(props.profile.yearsExperience || 0),
            years_experience_band: yearsExperienceBand(Number(props.profile.yearsExperience || 0)),
            has_dependants: Boolean(props.profile.hasDependants),
          }).catch(() => null)
        : Promise.resolve(null),
    ])
    breakdown.value = breakdownPayload
    estimate.value = estimatePayload
  } catch (e) {
    breakdown.value = null
    estimate.value = null
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

function rowsFromEstimate(payload) {
  const rows = payload?.breakdown || payload?.rows || payload?.incentives || payload?.eligible_incentives || payload?.eligibleIncentives
  if (!Array.isArray(rows)) return []
  return rows.flatMap((row) => {
    const nested = row?.rows || row?.incentives
    if (Array.isArray(nested)) {
      return nested.map((nestedRow) => ({
        ...nestedRow,
        category: nestedRow.category || row.category || row.name || row.allowance_type || row.allowanceType || 'Incentive',
      }))
    }
    return row
  }).filter(isEligibleEstimateRow).map((row) => ({
    ...row,
    category: row.category || row.allowance_type || row.allowanceType || 'Incentive',
    amount: row.amount ?? row.annual_amount ?? row.annualAmount ?? 0,
    frequency: row.frequency || 'annual',
  }))
}

function isEligibleEstimateRow(row) {
  if (!row || typeof row !== 'object') return false
  const status = String(row.status || row.eligibility_status || row.eligibilityStatus || '').toLowerCase()
  return row.eligible !== false && row.ineligible !== true && status !== 'ineligible' && status !== 'not_eligible'
}

function displayName(row, group) {
  const combined = [
    row.display_name,
    row.displayName,
    row.incentive_name,
    row.incentiveName,
    row.allowance_name,
    row.allowanceName,
    row.name,
    row.category,
    group.category,
    row.allowance_type,
    row.allowanceType,
  ].filter(Boolean).join(' ').toLowerCase()

  if (props.school?.state_id === '1' && combined.includes('locality allowance')) {
    return 'QLD Locality Allowance'
  }

  if (combined.includes('rental subsidy')) {
    return 'Rental Subsidy'
  }

  return (
    row.display_name ||
    row.displayName ||
    row.incentive_name ||
    row.incentiveName ||
    row.allowance_name ||
    row.allowanceName ||
    row.variant_name ||
    row.variantName ||
    row.rule_name ||
    row.ruleName ||
    row.name ||
    group.category ||
    row.category ||
    'Incentive'
  )
}

function filterQldLocalityRows(rows) {
  if (rows.length < 2) return rows
  const sorted = [...rows].sort((a, b) => numericAmount(b) - numericAmount(a))
  return props.profile?.hasDependants ? [sorted[0]] : [sorted[sorted.length - 1]]
}

function disambiguateCards(list) {
  const counts = list.reduce((acc, card) => {
    const key = card.category.trim().toLowerCase()
    acc.set(key, (acc.get(key) || 0) + 1)
    return acc
  }, new Map())

  const duplicateIndexes = new Map()
  return list.map((card) => {
    const key = card.category.trim().toLowerCase()
    if ((counts.get(key) || 0) < 2) return card

    const explicit = duplicateQualifier(card.row, card)
    if (explicit) return { ...card, category: `${card.category} — ${explicit}` }

    const current = (duplicateIndexes.get(key) || 0) + 1
    duplicateIndexes.set(key, current)
    return { ...card, category: `${card.category} — component ${current}` }
  })
}

function duplicateQualifier(row, card = null) {
  const value =
    row.rate_type ||
    row.rateType ||
    row.component ||
    row.component_name ||
    row.componentName ||
    row.variant ||
    row.notes ||
    row.description ||
    row.condition ||
    row.eligibility_condition ||
    row.eligibilityCondition

  const name = [
    row.name,
    row.incentive_name,
    row.incentiveName,
    row.allowance_name,
    row.allowanceName,
    row.category,
    row.allowance_type,
    row.allowanceType,
    card?.rawCategory,
    card?.category,
  ].filter(Boolean).join(' ').toLowerCase()

  if (props.school?.state_id === '1' && name.includes('locality allowance')) {
    const explicit = String(value || '').trim()
    if (explicit && !/^component\s*\d+$/i.test(explicit)) return explicit
  }
  if (value && String(value).trim()) return String(value).trim()
  return ''
}

function amount(row) {
  if (isRentalSubsidy(row) && numericAmount(row) <= 0) return '90% of rent'
  if (isVariable(row)) return 'Variable'
  const n = numericAmount(row)
  return n > 0 ? `$${Math.round(n).toLocaleString()}` : '—'
}

function numericAmount(row) {
  return Number(row.amount ?? row.annual_amount ?? row.annualAmount ?? 0)
}

function isVariable(row) {
  const value = row.amount ?? row.annual_amount
  if (isRentalSubsidy(row) && numericAmount(row) <= 0) return false
  return Boolean(row.is_variable_amount || row.variable || ['—', '-'].includes(String(value).trim()))
}

function isRentalSubsidy(row) {
  const text = [
    row.name,
    row.display_name,
    row.displayName,
    row.incentive_name,
    row.incentiveName,
    row.allowance_name,
    row.allowanceName,
    row.category,
    row.allowance_type,
    row.allowanceType,
  ].filter(Boolean).join(' ').toLowerCase()
  return text.includes('rental subsidy')
}

function yearsExperienceBand(years) {
  if (years < 2) return '0-1'
  if (years < 5) return '2-4'
  return '5+'
}

const EMP_LABELS = {
  permanent: 'Permanent',
  permanent_employee: 'Permanent',
  temporary: 'Temporary',
  temporary_employee: 'Temporary',
  public_service_officer: 'Public Service Officer',
  pso: 'Public Service Officer',
}

function formatEmpType(v) {
  return EMP_LABELS[String(v).toLowerCase().trim()] || v
}

function defaultEmploymentType(school) {
  const types = Array.isArray(school?.employee_types)
    ? school.employee_types.map((v) => String(v).toLowerCase())
    : []
  if (types.some((v) => v.includes('permanent'))) return 'permanent'
  if (types.some((v) => v.includes('temporary') || v === 'temp')) return 'temporary'
  if (types.some((v) => v.includes('public_service') || v.includes('public service') || v === 'pso')) return 'public_service_officer'
  return 'temporary'
}

function employeeTypesLabel(row) {
  const value = row.employee_types || row.employeeTypes || row.employee_type || row.employeeType
  if (Array.isArray(value)) return value.map(formatEmpType).join(', ')
  if (typeof value === 'string' && value) return formatEmpType(value)
  return ''
}

function employeeMatchesProfile() {
  return true
}

onMounted(load)
watch(() => [
  props.school?.school_id || props.school?.id,
  props.profile?.yearsExperience,
  props.profile?.hasDependants,
  props.profile?.ready,
], load)
</script>

<style scoped>
.summary { width:100%; max-width:none; margin-top:0; padding-top:2px; }
.summary-head { display:flex; align-items:center; gap:8px; justify-content:flex-start; margin-bottom:10px; text-align:left; }
.summary h3 { font-size:0.68rem; color:var(--ink3); line-height:1.2; letter-spacing:0.09em; text-transform:uppercase; font-weight:800; }
.summary-count { display:inline-flex; align-items:center; justify-content:center; min-width:18px; height:18px; border-radius:99px; background:var(--green-s); color:var(--green-d); font-size:0.65rem; font-weight:900; padding:0 5px; }
.summary-note { margin:-4px 0 10px; font-size:0.68rem; color:var(--ink3); font-weight:700; line-height:1.35; }
.cards { display:flex; flex-direction:column; gap:6px; width:100%; }
.allowance-card { width:100%; background:#fbfaf8; border:1px solid var(--b); border-radius:var(--r2); padding:10px 14px; transition:border-color 0.14s, box-shadow 0.14s; }
.allowance-card:hover { border-color:rgba(30,158,86,0.28); box-shadow:0 4px 12px rgba(26,23,20,0.04); }
.card-variable { background:#fafaf8; }
.card-top { display:flex; align-items:center; justify-content:space-between; gap:12px; text-align:left; }
.card-label-wrap { min-width:0; flex:1; }
.card-top h4 { font-size:0.82rem; line-height:1.3; color:var(--ink); margin:0 0 2px; }
.card-meta { font-size:0.64rem; color:var(--ink3); font-weight:700; text-transform:capitalize; }
.card-emp-types { font-size:0.62rem; color:var(--ink3); font-weight:600; margin-top:2px; }
.amount-pill { flex-shrink:0; border-radius:99px; padding:4px 10px; background:var(--green-s); color:var(--green-d); font-size:0.74rem; font-weight:900; white-space:nowrap; }
.amount-pill.variable { background:#fef9ec; color:#92400e; font-size:0.66rem; font-weight:700; border:1px solid #fde68a; }
.empty { font-size:0.72rem; color:var(--ink3); padding:8px 0; }
.summary-skeleton { display:flex; flex-direction:column; gap:7px; }
.skel { height:34px; border-radius:var(--r2); background:linear-gradient(90deg,var(--s2),#f8f7f4,var(--s2)); background-size:220% 100%; animation:pulse 1.1s infinite linear; }
@keyframes pulse { from{background-position:0 0} to{background-position:-220% 0} }
</style>

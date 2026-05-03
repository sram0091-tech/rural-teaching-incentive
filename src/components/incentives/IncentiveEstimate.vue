<template>
  <div class="estimate">
    <div v-if="loading" class="estimate-skeleton">
      <div class="skel skel-total"></div>
      <div class="skel skel-sub"></div>
      <div class="skel skel-row" v-for="i in 3" :key="i"></div>
    </div>
    <template v-else>
      <div class="estimate-total">{{ money(total) }}/yr in incentives</div>
      <div class="estimate-sub">on top of your base salary</div>
      <IncentiveBreakdownTable :rows="rows" :total="total" />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchIncentiveBreakdown, fetchIncentiveEstimate } from '../../api/explorerApi.js'
import IncentiveBreakdownTable from './IncentiveBreakdownTable.vue'

const props = defineProps({
  school: { type: Object, required: true },
  eligibility: { type: Object, default: () => ({}) },
  form: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['eligible-count'])

const loading = ref(false)
const estimate = ref(null)
const breakdown = ref(null)

const fallbackTotal = computed(() => Number(props.school?.annual_incentive || 0))
const rows = computed(() => {
  const payloadRows = estimate.value?.breakdown || estimate.value?.rows || estimate.value?.incentives
  const estimateRows = Array.isArray(payloadRows) ? payloadRows.filter(isEligibleEstimateRow) : []
  const breakdownRows = rowsFromBreakdown(breakdown.value)
  if (estimateRows.length) return estimateRows
  if (shouldUseBreakdownRows(estimateRows, breakdownRows)) return breakdownRows
  if (fallbackTotal.value <= 0) return []
  return [{
    name: props.school?.inc_label || 'Incentive package',
    amount: fallbackTotal.value,
    frequency: 'annual',
    notes: '',
  }]
})
const total = computed(() => {
  const explicit =
    estimate.value?.eligible_total ??
    estimate.value?.eligible_annual_total ??
    estimate.value?.personalised_total ??
    estimate.value?.personalized_total ??
    estimate.value?.total ??
    estimate.value?.annual_total
  const n = Number(explicit)
  if (Number.isFinite(n)) return n
  const rowsTotal = nonVariableTotal(rows.value)
  return rowsTotal > 0 ? rowsTotal : fallbackTotal.value
})
const eligibleCount = computed(() => rows.value.filter((row) => row.eligible !== false).length)

async function load() {
  const schoolId = props.school?.school_id || props.school?.id
  if (!schoolId) return
  loading.value = true
  try {
    const [estimatePayload, breakdownPayload] = await Promise.all([
      fetchIncentiveEstimate({
        school_id: schoolId,
        employment_type: props.form.employmentType,
        years_experience: Number(props.form.yearsExperience || 0),
        has_dependants: Boolean(props.form.hasDependants),
      }).catch(() => null),
      fetchIncentiveBreakdown(schoolId).catch(() => null),
    ])
    estimate.value = estimatePayload
    breakdown.value = breakdownPayload
  } catch (e) {
    estimate.value = null
    breakdown.value = null
  } finally {
    loading.value = false
  }
}

function rowsFromBreakdown(payload) {
  if (!payload) return []
  const groups = payload.groups || payload.categories
  if (Array.isArray(groups) && groups.length) {
    return groups.flatMap((group) => {
      const groupRows = group.rows || group.incentives || group.variants || []
      return groupRows.map((row) => estimateRowFromBreakdown(row, group))
    })
  }

  const flatRows = payload.rows || payload.incentives || payload.variants
  if (Array.isArray(flatRows)) return flatRows.map((row) => estimateRowFromBreakdown(row))
  return []
}

function estimateRowFromBreakdown(row, group = {}) {
  const amount = row.amount ?? row.annual_amount ?? row.annualAmount ?? 0
  const isVariable = Boolean(row.is_variable_amount || row.variable || String(amount).trim() === '—')
  return {
    id: row.id,
    name: row.name || row.incentive_name || row.incentiveName || group.category || group.name || group.allowance_type || 'Incentive',
    amount: isVariable ? 'Variable' : amount,
    frequency: row.frequency || 'annual',
    notes: row.notes || (isVariable ? 'Based on your rent — up to 90% subsidised' : ''),
    is_variable_amount: isVariable,
    eligible: row.eligible,
  }
}

function isEligibleEstimateRow(row) {
  if (!row || typeof row !== 'object') return false
  const status = String(row.status || row.eligibility_status || row.eligibilityStatus || '').toLowerCase()
  return row.eligible !== false && row.ineligible !== true && status !== 'ineligible' && status !== 'not_eligible'
}

function shouldUseBreakdownRows(estimateRows, breakdownRows) {
  if (!breakdownRows.length) return false
  if (!estimateRows.length) return true
  if (breakdownRows.length > estimateRows.length) return true
  return nonVariableTotal(estimateRows) < total.value && nonVariableTotal(breakdownRows) >= total.value
}

function nonVariableTotal(list) {
  return list.reduce((sum, row) => {
    if (row.is_variable_amount || row.variable || row.amount === 'Variable') return sum
    return sum + Number(row.amount ?? row.annual_amount ?? 0)
  }, 0)
}

function money(value) {
  const n = Number(value || 0)
  return `$${Math.round(n).toLocaleString()}`
}

onMounted(load)
watch(() => [props.school?.school_id || props.school?.id, props.form.employmentType, props.form.yearsExperience, props.form.hasDependants], load)
watch(eligibleCount, (count) => emit('eligible-count', count), { immediate: true })
</script>

<style scoped>
.estimate { margin-top:12px; padding:12px; border:1px solid rgba(30,158,86,0.22); border-radius:var(--r2); background:linear-gradient(180deg,var(--green-s),#fff 72%); }
.estimate-total { font-family:'DM Sans',sans-serif; font-size:1.45rem; font-weight:900; color:var(--green-d); line-height:1.12; letter-spacing:0; }
.estimate-sub { font-size:0.68rem; color:var(--ink3); margin:4px 0 10px; }
.estimate-skeleton { display:flex; flex-direction:column; gap:8px; }
.skel { background:linear-gradient(90deg,var(--s2),#f8f7f4,var(--s2)); background-size:220% 100%; animation:pulse 1.1s infinite linear; border-radius:var(--r2); }
.skel-total { height:34px; width:220px; }
.skel-sub { height:12px; width:150px; }
.skel-row { height:32px; width:100%; }
@keyframes pulse { from{background-position:0 0} to{background-position:-220% 0} }
</style>

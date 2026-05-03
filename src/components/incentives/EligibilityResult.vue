<template>
  <div class="elig-result">
    <div class="result-banner" :class="statusClass">
      <div class="result-title">{{ title }}</div>
      <div v-if="reason" class="result-reason">{{ reason }}</div>
      <div v-if="isPartial" class="partial-list">
        <div v-if="eligibleNames.length"><strong>Eligible:</strong> {{ eligibleNames.join(', ') }}</div>
        <div v-if="ineligibleNames.length"><strong>Not eligible:</strong> {{ ineligibleNames.join(', ') }}</div>
      </div>
    </div>
    <div class="disclaimer">This is an estimate only. Verify your exact entitlement via the official government source.</div>
    <IncentiveEstimate
      v-if="isEligible || isPartial"
      :school="school"
      :eligibility="result"
      :form="form"
      @eligible-count="estimateCount = $event"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import IncentiveEstimate from './IncentiveEstimate.vue'

const props = defineProps({
  school: { type: Object, required: true },
  result: { type: Object, required: true },
  form: { type: Object, default: () => ({}) },
})

const normalizedStatus = computed(() => {
  const raw = String(props.result.status || props.result.eligibility_status || '').toLowerCase()
  const hasEligibleRows = incentiveList(props.result.eligible_incentives || props.result.eligibleIncentives).length > 0
  const hasIneligibleRows = incentiveList(props.result.ineligible_incentives || props.result.ineligibleIncentives).length > 0
  if (raw.includes('partial')) return 'partial'
  if (hasEligibleRows && (hasIneligibleRows || props.result.eligible === false)) return 'partial'
  if (raw.includes('ineligible') || props.result.eligible === false) return 'ineligible'
  if (raw.includes('eligible') || props.result.eligible === true) return 'eligible'
  return Number(props.school?.annual_incentive || 0) > 0 ? 'eligible' : 'ineligible'
})
const isEligible = computed(() => normalizedStatus.value === 'eligible')
const isPartial = computed(() => normalizedStatus.value === 'partial')
const statusClass = computed(() => `is-${normalizedStatus.value}`)
const estimateCount = ref(0)
const incentiveCount = computed(() => estimateCount.value || props.result.incentive_count || props.result.count || 1)
const title = computed(() => {
  if (isEligible.value) {
    const noun = Number(incentiveCount.value) === 1 ? 'incentive' : 'incentives'
    return `You appear eligible for ${incentiveCount.value} ${noun} at this school`
  }
  if (isPartial.value) return 'You are eligible for some incentives at this school'
  return 'Based on your details, you may not be eligible for incentives at this school'
})
const reason = computed(() => {
  const apiReason = props.result.reason || props.result.message
  if (apiReason) return apiReason
  if (normalizedStatus.value === 'ineligible' && props.form.employmentType === 'public_service_officer') {
    return 'Incentives at this school require permanent or temporary employment — public service officers may not be eligible.'
  }
  return ''
})
const eligibleNames = computed(() => listNames(props.result.eligible_incentives || props.result.eligibleIncentives))
const ineligibleNames = computed(() => listNames(props.result.ineligible_incentives || props.result.ineligibleIncentives))

function listNames(rows) {
  return incentiveList(rows).map((r) => typeof r === 'string' ? r : r.name || r.incentive_name).filter(Boolean)
}

function incentiveList(rows) {
  return Array.isArray(rows) ? rows : []
}
</script>

<style scoped>
.elig-result { margin-top:12px; }
.result-banner { border:1px solid var(--b); border-left-width:4px; border-radius:var(--r2); padding:10px 12px; background:var(--s); }
.result-banner.is-eligible { border-left-color:var(--green); background:var(--green-s); }
.result-banner.is-ineligible { border-left-color:#d99720; background:#fff8e7; }
.result-banner.is-partial { border-left-color:var(--blue); background:var(--blue-s); }
.result-title { font-weight:800; color:var(--ink); font-size:0.78rem; line-height:1.35; }
.result-reason,.partial-list { margin-top:5px; font-size:0.7rem; color:var(--ink2); line-height:1.45; }
.disclaimer { margin-top:7px; font-size:0.66rem; color:var(--ink3); font-style:italic; }
</style>

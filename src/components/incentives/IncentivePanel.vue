<template>
  <div class="inc-panel">
    <div class="package-title">
      <span aria-hidden="true">💰</span>
      <span>Incentive Package</span>
    </div>

    <div class="package-rule"></div>

    <div class="package-content">
      <div v-if="hasIncentive" class="package-total">
        <div class="inc-big">{{ money(displayTotal) }}</div>
        <div class="hero-caption">
          <span class="hero-caption-main">{{ profile?.ready ? 'personalised estimate' : 'up to max package' }}</span>
          <span class="hero-caption-dot">·</span>
          <span class="hero-caption-sub">per year on top of base salary</span>
        </div>
      </div>
      <div v-else class="no-inc">No incentive data linked to this school.</div>

      <div class="package-main">
        <IncentiveBreakdownSummary :school="school" :profile="profile" />
        <p class="verify-note">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          Amounts are indicative. Verify directly with {{ policyOwner }} before deciding.
        </p>
      </div>
    </div>

    <div class="package-rule"></div>

    <div class="inc-actions">
      <VerifyIncentiveLink :school="school" compact />
      <button class="life-lnk" type="button" @click="$emit('view-lifestyle')">
        🌿 View lifestyle for {{ school.suburb || 'this location' }} →
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchIncentiveEstimate } from '../../api/explorerApi.js'
import IncentiveBreakdownSummary from './IncentiveBreakdownSummary.vue'
import VerifyIncentiveLink from './VerifyIncentiveLink.vue'

const props = defineProps({
  school: { type: Object, required: true },
  profile: { type: Object, default: null },
})

defineEmits(['view-lifestyle'])

const estimate = ref(null)
const genericTotal = computed(() => Number(props.school?.annual_incentive || 0))
const personalisedTotal = computed(() => estimateTotal(estimate.value))
const displayTotal = computed(() => props.profile?.ready && personalisedTotal.value !== null ? personalisedTotal.value : genericTotal.value)
const hasIncentive = computed(() => Number(displayTotal.value || 0) > 0 || Number(props.school?.annual_incentive || 0) > 0)
const stateLabel = computed(() => props.school?.state_id === '1' ? 'QLD' : 'NSW')
const policyOwner = computed(() => stateLabel.value === 'QLD' ? 'Teach Queensland' : 'Teach.NSW')
const employmentLabel = computed(() => ({
  permanent: 'Permanent',
  temporary: 'Temporary',
  public_service_officer: 'Public Service Officer',
}[props.profile?.employmentType] || ''))

function money(value) {
  return `$${Math.round(Number(value || 0)).toLocaleString()}`
}

function estimateTotal(payload) {
  if (!payload || typeof payload !== 'object') return null
  const value =
    payload.personalised_total ??
    payload.personalized_total ??
    payload.personalised_annual_total ??
    payload.personalized_annual_total ??
    payload.annual_total ??
    payload.annualTotal ??
    payload.total
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

async function loadEstimate() {
  const schoolId = props.school?.school_id || props.school?.id
  if (!schoolId || !props.profile?.ready) {
    estimate.value = null
    return
  }
  try {
    estimate.value = await fetchIncentiveEstimate({
      school_id: schoolId,
      employment_type: props.profile.employmentType,
      years_experience: Number(props.profile.yearsExperience || 0),
      has_dependants: Boolean(props.profile.hasDependants),
    })
  } catch (e) {
    estimate.value = null
  }
}

onMounted(loadEstimate)
watch(() => [
  props.school?.school_id || props.school?.id,
  props.profile?.employmentType,
  props.profile?.yearsExperience,
  props.profile?.hasDependants,
  props.profile?.ready,
], loadEstimate)

</script>

<style scoped>
.inc-panel { background:#fff; border:1px solid var(--b); border-left:4px solid var(--blue); border-radius:0 var(--r) var(--r) 0; padding:24px 22px; }
.est-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:6px; font-size:0.72rem; font-weight:700; margin-bottom:16px; }
.est-badge--on { background:var(--green-s); color:var(--green-d); }
.est-badge--off { background:var(--s2); color:var(--ink3); }
.package-title { display:flex; align-items:center; gap:9px; font-size:0.82rem; font-weight:900; letter-spacing:0.09em; text-transform:uppercase; color:var(--ink2); }
.package-rule { height:1px; background:var(--b); margin:14px 0 22px; }
.package-content { display:grid; grid-template-columns:1fr; gap:22px; align-items:start; }
.package-total { margin:0; }
.inc-big { font-family:'DM Sans',sans-serif; font-size:3.5rem; font-weight:900; color:var(--green-d); line-height:0.95; letter-spacing:0; }
.hero-caption { display:flex; align-items:center; gap:6px; margin-top:8px; }
.hero-caption-main { font-size:0.88rem; color:var(--ink2); font-weight:800; }
.hero-caption-dot { color:var(--ink3); font-size:0.82rem; }
.hero-caption-sub { font-size:0.78rem; color:var(--ink3); font-weight:600; }
.no-inc { font-size:0.78rem; color:var(--ink3); padding:4px 0 8px; }
.verify-note { display:flex; align-items:flex-start; gap:5px; margin:14px 0 0; color:var(--ink3); font-size:0.76rem; font-style:italic; font-weight:600; line-height:1.4; }
.package-main { width:100%; min-width:0; max-width:none; margin:0; }
.inc-actions { display:flex; align-items:center; justify-content:space-between; gap:18px; flex-wrap:wrap; }
.life-lnk { margin-left:auto; border:0; background:transparent; padding:0; font:inherit; font-size:0.82rem; font-weight:900; color:var(--blue); cursor:pointer; }
.life-lnk:hover { text-decoration:underline; }
@media (max-width:640px) {
  .inc-panel { padding:18px; }
  .inc-big { font-size:2.65rem; }
  .inc-actions { align-items:flex-start; flex-direction:column; }
  .life-lnk { margin-left:0; }
}
</style>

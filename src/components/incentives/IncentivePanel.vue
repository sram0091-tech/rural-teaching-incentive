<template>
  <div class="inc-panel">
    <div class="package-title">
      <span aria-hidden="true">💰</span>
      <span>Incentive Package</span>
    </div>

    <div class="package-rule"></div>

    <!-- ── YOUR ESTIMATE CARD ── -->
    <div class="total-card" :class="{ 'total-card--ready': submitted && hasIncentive }">
      <div class="total-label">Your estimate</div>
      <template v-if="submitted && hasIncentive">
        <div class="inc-big">{{ money(displayTotal) }}</div>
        <div class="hero-caption">
          <span class="hero-caption-main">personalised estimate</span>
          <span class="hero-caption-dot">·</span>
          <span class="hero-caption-sub">per year on top of base salary</span>
        </div>
        <div class="estimate-prefs">
          <span>Based on</span>
          <strong>{{ estimatePreferenceText }}</strong>
        </div>
      </template>
      <template v-else-if="submitted && !hasIncentive">
        <p class="no-inc-msg">No incentive data linked to this school.</p>
      </template>
      <div v-else class="est-placeholder">
        <p class="est-ph-body">Use the calculator below to know your personalised incentive</p>
      </div>
    </div>

    <!-- ── INCENTIVE CALCULATOR ── -->
    <div class="school-calculator" :class="{ 'school-calculator--open': calculatorOpen }">

      <!-- Collapsed pill -->
      <button v-if="!calculatorOpen" class="calc-pill" type="button" @click="calculatorOpen = true">
        <div class="calc-pill-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
        </div>
        <div class="calc-pill-body">
          <span class="calc-pill-name">Incentive calculator</span>
          <template v-if="submitted">
            <span class="calc-pill-dot">·</span>
            <span class="calc-pill-info">{{ profileSummary }}</span>
          </template>
        </div>
        <span class="calc-pill-cta">{{ submitted ? 'Edit' : 'Open' }}</span>
      </button>

      <!-- Open calculator -->
      <template v-else>
        <div class="calc-open-head">
          <div></div>
          <div class="calc-open-copy">
            <span class="calc-open-title">Incentive calculator</span>
            <span class="calc-open-sub">{{ calculatorDescription }}</span>
          </div>
          <button class="calc-collapse-btn" type="button" @click="calculatorOpen = false">Collapse ↑</button>
        </div>
        <div class="calculator-body">
          <EligibilityChecker
            compact
            :school="school"
            :initial-profile="activeProfile"
            :show-result="false"
            :show-header="false"
            action-label="Update this estimate"
            @profile-submit="applyLocalProfile"
          />
        </div>
      </template>
    </div>

    <div class="package-rule"></div>

    <div class="package-main">
      <IncentiveBreakdownSummary :school="school" :profile="activeProfile" />
      <p class="verify-note">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        Amounts are indicative. Verify directly with {{ policyOwner }} before deciding.
      </p>
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
import EligibilityChecker from './EligibilityChecker.vue'
import IncentiveBreakdownSummary from './IncentiveBreakdownSummary.vue'
import VerifyIncentiveLink from './VerifyIncentiveLink.vue'

const props = defineProps({
  school: { type: Object, required: true },
  profile: { type: Object, default: null },
})

defineEmits(['view-lifestyle'])

const estimate = ref(null)
const calculatorOpen = ref(true)
const submitted = ref(false)
const localProfile = ref({
  employmentType: props.profile?.employmentType || '',
  yearsExperience: props.profile?.yearsExperience ?? '',
  hasDependants: Boolean(props.profile?.hasDependants),
  ready: Boolean(props.profile?.ready),
})

const isQld = computed(() => props.school?.state_id === '1')
const genericTotal = computed(() => Number(props.school?.annual_incentive || 0))
const personalisedTotal = computed(() => estimateTotal(estimate.value))
const activeProfile = computed(() => localProfile.value?.ready ? localProfile.value : null)
const displayTotal = computed(() =>
  activeProfile.value?.ready && personalisedTotal.value !== null
    ? personalisedTotal.value
    : genericTotal.value
)
const hasIncentive = computed(() => Number(props.school?.annual_incentive || 0) > 0)
const policyOwner = computed(() => isQld.value ? 'Teach Queensland' : 'Teach.NSW')

const profileSummary = computed(() => {
  const p = activeProfile.value
  if (!p?.ready) return ''
  const roleMap = { permanent: 'Permanent', temporary: 'Temporary', public_service_officer: 'PSO' }
  const parts = []
  if (p.employmentType) parts.push(roleMap[p.employmentType] || p.employmentType)
  const yrs = Number(p.yearsExperience)
  if (!isNaN(yrs)) parts.push(`${yrs} yr${yrs !== 1 ? 's' : ''}`)
  if (p.hasDependants && isQld.value) parts.push('+ dependant')
  return parts.join(' · ')
})

const estimatePreferenceText = computed(() => {
  const p = activeProfile.value
  if (!p?.ready) return ''
  const roleMap = {
    permanent: 'Permanent',
    temporary: 'Temporary',
    public_service_officer: 'Public Service Officer',
  }
  const yrs = Number(p.yearsExperience)
  const parts = [
    roleMap[p.employmentType] || p.employmentType || 'Selected role',
    `${Number.isNaN(yrs) ? 0 : yrs} year${yrs === 1 ? '' : 's'} experience`,
  ]
  if (isQld.value) {
    parts.push(p.hasDependants ? 'with dependants' : 'no dependants')
  }
  return parts.join(' · ')
})

const calculatorDescription = computed(() => (
  activeProfile.value?.ready
    ? `Currently using: ${estimatePreferenceText.value}.`
    : 'Enter your role and experience to personalise this school.'
))

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
  if (!schoolId || !activeProfile.value?.ready) { estimate.value = null; return }
  try {
    estimate.value = await fetchIncentiveEstimate({
      school_id: schoolId,
      employment_type: activeProfile.value.employmentType,
      years_experience: Number(activeProfile.value.yearsExperience || 0),
      has_dependants: Boolean(activeProfile.value.hasDependants),
    })
  } catch (e) {
    estimate.value = null
  }
}

function applyLocalProfile(profile) {
  localProfile.value = { ...profile }
  submitted.value = true
  calculatorOpen.value = false
}

onMounted(loadEstimate)
watch(() => [
  props.school?.school_id || props.school?.id,
  activeProfile.value?.employmentType,
  activeProfile.value?.yearsExperience,
  activeProfile.value?.hasDependants,
  activeProfile.value?.ready,
], loadEstimate)

watch(() => props.school?.school_id || props.school?.id, () => {
  submitted.value = false
  calculatorOpen.value = true
  localProfile.value = { employmentType: '', yearsExperience: '', hasDependants: false, ready: false }
  estimate.value = null
})
</script>

<style scoped>
.inc-panel { background:#fff; border:1px solid var(--b); border-left:4px solid var(--blue); border-radius:0 var(--r) var(--r) 0; padding:24px 22px; display:flex; flex-direction:column; gap:0; }
.package-title { display:flex; align-items:center; gap:9px; font-size:0.82rem; font-weight:900; letter-spacing:0.09em; text-transform:uppercase; color:var(--ink2); }
.package-rule { height:1px; background:var(--b); margin:14px 0; }

/* ── YOUR ESTIMATE CARD ── */
.total-card {
  border: 1px solid var(--b);
  border-radius: 12px;
  padding: 14px 16px;
  background: var(--s);
  margin-bottom: 12px;
  transition: background 0.28s ease, border-color 0.28s ease;
}
.total-card--ready {
  background: linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%);
  border-color: rgba(30,158,86,0.28);
}
.total-label {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--ink3);
  margin-bottom: 10px;
}
.total-card--ready .total-label { color: rgba(16,124,66,0.7); }
.inc-big { font-family:'DM Sans',sans-serif; font-size:3.2rem; font-weight:900; color:var(--green-d); line-height:0.95; letter-spacing:-0.01em; }
.hero-caption { display:flex; align-items:center; gap:6px; margin-top:8px; flex-wrap:wrap; }
.hero-caption-main { font-size:0.84rem; color:var(--green-d); font-weight:800; }
.hero-caption-dot { color:var(--ink3); font-size:0.82rem; }
.hero-caption-sub { font-size:0.78rem; color:var(--ink3); font-weight:600; }
.estimate-prefs {
  display:flex;
  align-items:center;
  gap:6px;
  flex-wrap:wrap;
  margin-top:10px;
  padding-top:10px;
  border-top:1px solid rgba(30,158,86,0.16);
  color:var(--ink2);
  font-size:0.74rem;
  line-height:1.35;
}
.estimate-prefs span { font-weight:700; color:var(--ink3); }
.estimate-prefs strong { font-weight:900; color:var(--green-d); }
.no-inc-msg { font-size:0.8rem; color:var(--ink3); margin:0; }
.est-placeholder { padding:2px 0; }
.est-ph-body { margin:0; font-size:0.84rem; font-weight:400; color:var(--ink2); line-height:1.5; }

/* ── INCENTIVE CALCULATOR ── */
.school-calculator { margin-bottom: 4px; }

/* collapsed pill */
.calc-pill {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 10px 10px;
  background: linear-gradient(to right, rgba(31,111,235,0.08), rgba(31,111,235,0.02));
  border: 1.5px solid rgba(31,111,235,0.2);
  border-left: 4px solid var(--blue);
  border-radius: 12px;
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition: background 0.16s, box-shadow 0.16s;
}
.calc-pill:hover {
  background: linear-gradient(to right, rgba(31,111,235,0.14), rgba(31,111,235,0.05));
  box-shadow: 0 4px 14px rgba(31,111,235,0.1);
}
.calc-pill-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: var(--blue);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.calc-pill-body { flex:1; display:flex; align-items:center; gap:6px; min-width:0; flex-wrap:wrap; }
.calc-pill-name { font-size:0.82rem; font-weight:900; color:var(--ink); white-space:nowrap; }
.calc-pill-dot { color:var(--ink3); font-size:0.8rem; }
.calc-pill-info { font-size:0.76rem; color:var(--ink2); font-weight:600; }
.calc-pill-cta {
  flex-shrink:0; font-size:0.7rem; font-weight:800; color:var(--blue);
  border:1px solid rgba(31,111,235,0.3); border-radius:6px; padding:3px 9px;
  background:rgba(255,255,255,0.7);
}

/* open state */
.school-calculator--open {
  border: 1px solid rgba(31,111,235,0.18);
  border-radius: 12px;
  background: #f8fbff;
  overflow: hidden;
}
.calc-open-head {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(31,111,235,0.12);
}
.calc-open-copy { text-align:center; min-width:0; }
.calc-open-title { display:block; font-size:0.88rem; font-weight:900; color:var(--ink); }
.calc-open-sub { display:block; margin-top:3px; font-size:0.68rem; line-height:1.35; color:var(--ink2); font-weight:700; }
.calc-collapse-btn {
  justify-self:end;
  flex-shrink:0; border:1px solid rgba(31,111,235,0.3); border-radius:6px;
  background:#fff; color:var(--blue); padding:4px 10px;
  font:inherit; font-size:0.72rem; font-weight:900; cursor:pointer;
}
.calc-collapse-btn:hover { background:var(--blue-s); }
.calculator-body { padding: 14px; }

/* ── SHARED ── */
.no-inc { font-size:0.78rem; color:var(--ink3); padding:4px 0 8px; }
.verify-note { display:flex; align-items:flex-start; gap:5px; margin:14px 0 0; color:var(--ink3); font-size:0.76rem; font-style:italic; font-weight:600; line-height:1.4; }
.package-main { width:100%; min-width:0; }
.inc-actions { display:flex; align-items:center; justify-content:space-between; gap:18px; flex-wrap:wrap; }
.life-lnk { margin-left:auto; border:0; background:transparent; padding:0; font:inherit; font-size:0.82rem; font-weight:900; color:var(--blue); cursor:pointer; }
.life-lnk:hover { text-decoration:underline; }

@media (max-width:640px) {
  .inc-panel { padding:18px; }
  .inc-big { font-size:2.5rem; }
  .inc-actions { align-items:flex-start; flex-direction:column; }
  .life-lnk { margin-left:0; }
  .calc-pill-body { flex-wrap:wrap; }
  .calc-open-head { grid-template-columns:1fr; }
  .calc-open-head > div:first-child { display:none; }
  .calc-collapse-btn { justify-self:center; }
}
</style>

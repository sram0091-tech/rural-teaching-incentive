<template>
  <div class="inc-panel">
    <div class="package-hero">
      <div>
        <div class="remoteness-badge" :class="badgeClass">{{ school.remoteness || 'Remoteness unknown' }}</div>
        <div class="inc-box-title">Incentive Package</div>
        <div class="inc-sublbl">Potential annual package for {{ school.name || 'this school' }}</div>
      </div>
      <div v-if="hasIncentive" class="hero-total">
        <div class="inc-big">{{ money(school.annual_incentive) }}</div>
        <div class="hero-caption">per year on top of base salary</div>
      </div>
      <div v-else class="no-inc">No incentive data linked to this school.</div>
    </div>

    <div class="inc-layout" :class="{ 'result-mode': hasCalculatorResult }">
      <div class="package-main">
        <IncentiveBreakdownSummary :school="school" />
      </div>
      <aside class="calculator-card" aria-label="Personalised incentive calculator">
        <EligibilityChecker :school="school" @result-change="hasCalculatorResult = $event" />
        <div class="calculator-links">
          <VerifyIncentiveLink :school="school" />
          <button class="life-lnk" type="button" @click="$emit('view-lifestyle')">
            View lifestyle for {{ school.suburb || 'this location' }} →
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RC } from '../../data/db.js'
import IncentiveBreakdownSummary from './IncentiveBreakdownSummary.vue'
import EligibilityChecker from './EligibilityChecker.vue'
import VerifyIncentiveLink from './VerifyIncentiveLink.vue'

const props = defineProps({
  school: { type: Object, required: true },
})

defineEmits(['view-lifestyle'])

const hasCalculatorResult = ref(false)
const hasIncentive = computed(() => Number(props.school?.annual_incentive || 0) > 0)
const badgeClass = computed(() => RC[String(props.school?.remoteness_id)] || 'c3')

function money(value) {
  return `$${Math.round(Number(value || 0)).toLocaleString()}`
}
</script>

<style scoped>
.inc-panel { background:linear-gradient(135deg,#fff 0%,#fbfaf7 100%); border:1px solid var(--b); border-left:4px solid var(--green); border-radius:0 var(--r) var(--r) 0; padding:18px; }
.package-hero { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; padding:2px 2px 16px; border-bottom:1px solid var(--b); }
.remoteness-badge { display:inline-flex; align-items:center; width:fit-content; margin-bottom:9px; padding:4px 10px; border-radius:99px; font-size:0.58rem; font-weight:900; letter-spacing:0.08em; text-transform:uppercase; }
.remoteness-badge.c5 { background:#fee2e2; color:#991b1b; }
.remoteness-badge.c4 { background:#ffedd5; color:#9a3412; }
.remoteness-badge.c3 { background:#fef3c7; color:#92400e; }
.remoteness-badge.c2 { background:#dcfce7; color:#166534; }
.remoteness-badge.c1 { background:#dbeafe; color:#1e40af; }
.inc-box-title { font-size:0.72rem; font-weight:900; letter-spacing:0.09em; text-transform:uppercase; color:var(--ink2); }
.inc-big { font-family:'DM Sans',sans-serif; font-size:2.1rem; font-weight:900; color:var(--green-d); line-height:1; letter-spacing:0; }
.inc-sublbl { font-size:0.74rem; color:var(--ink3); margin-top:4px; }
.hero-total { text-align:right; flex-shrink:0; padding:8px 12px; border-radius:var(--r); background:var(--green-s); border:1px solid rgba(30,158,86,0.2); }
.hero-caption { font-size:0.68rem; color:var(--green-d); margin-top:3px; font-weight:700; }
.no-inc { font-size:0.78rem; color:var(--ink3); padding:4px 0 8px; }
.inc-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(360px,430px); gap:22px; align-items:start; margin-top:18px; }
.inc-layout.result-mode { grid-template-columns:1fr; gap:14px; }
.package-main { min-width:0; }
.calculator-card { position:sticky; top:72px; min-width:0; padding:17px; background:#fff; border:1px solid rgba(30,158,86,0.28); border-top:4px solid var(--green); border-radius:var(--r); box-shadow:0 14px 34px rgba(22,120,64,0.12); }
.result-mode .calculator-card { position:relative; top:auto; box-shadow:0 10px 26px rgba(22,120,64,0.08); }
.calculator-card::before { content:'Recommended next step'; display:inline-flex; margin-bottom:10px; border-radius:99px; padding:4px 9px; background:var(--green-s); color:var(--green-d); font-size:0.58rem; font-weight:900; letter-spacing:0.06em; text-transform:uppercase; }
.calculator-links { margin-top:14px; padding-top:12px; border-top:1px solid var(--b); }
.life-lnk { margin-top:12px; border:0; background:transparent; padding:0; font:inherit; font-size:0.72rem; font-weight:800; color:var(--blue); cursor:pointer; }
.life-lnk:hover { text-decoration:underline; }
@media (max-width:1080px) {
  .inc-layout { grid-template-columns:1fr; }
  .calculator-card { position:relative; top:auto; }
}
@media (max-width:640px) {
  .inc-panel { padding:14px; }
  .package-hero { flex-direction:column; }
  .hero-total { width:100%; text-align:left; }
  .inc-big { font-size:1.75rem; }
}
</style>

<template>
  <form class="elig-checker" :class="{ compact }" @submit.prevent="submit">
    <div class="checker-head">
      <div>
        <div class="checker-title">{{ title }}</div>
        <div class="checker-sub">{{ subtitle }}</div>
      </div>
      <div v-if="!compact" class="profile-status" :class="{ ready: profileReady }">{{ profileReady ? readyLabel : 'In progress' }}</div>
    </div>

    <div class="profile-steps" aria-label="Incentive profile progress">
      <div
        v-for="(step, index) in steps"
        :key="step.key"
        class="profile-step"
        :class="{ complete: step.complete, active: step.active }"
      >
        <div class="step-dot">
          <span v-if="step.complete">✓</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="step-copy">
          <span>{{ step.label }}</span>
          <small v-if="!compact">{{ step.hint }}</small>
        </div>
        <label v-if="compact && step.key === 'role'" class="step-control">
          <select v-model="form.employmentType" :disabled="loading">
            <option value="">Select employment type</option>
            <option value="permanent">Permanent</option>
            <option value="temporary">Temporary</option>
            <option value="public_service_officer">Public Service Officer</option>
          </select>
          <small v-if="errors.employmentType">{{ errors.employmentType }}</small>
        </label>
        <label v-else-if="compact && step.key === 'experience'" class="step-control">
          <div class="exp-input-wrap">
            <input v-model="form.yearsExperience" type="number" min="0" max="40" step="1" placeholder="0" :disabled="loading" />
            <span class="exp-suffix">years taught</span>
          </div>
          <small v-if="errors.yearsExperience">{{ errors.yearsExperience }}</small>
        </label>
        <button v-else-if="compact && step.key === 'estimate'" class="step-action" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Updating...' : compactEstimateLabel }}
        </button>
      </div>
    </div>

    <div v-if="!compact" class="checker-title form-title">Check your eligibility</div>
    <div v-if="!compact" class="checker-grid">
      <label class="field">
        <span>Employment type</span>
        <select v-model="form.employmentType" :disabled="loading">
          <option value="">Select employment type</option>
          <option value="permanent">Permanent</option>
          <option value="temporary">Temporary</option>
          <option value="public_service_officer">Public Service Officer</option>
        </select>
        <small v-if="errors.employmentType">{{ errors.employmentType }}</small>
      </label>
      <label class="field">
        <span>Years of experience</span>
        <input v-model="form.yearsExperience" type="number" min="0" max="40" step="1" :disabled="loading" />
        <small v-if="errors.yearsExperience">{{ errors.yearsExperience }}</small>
      </label>
      <label v-if="isQld" class="toggle-field">
        <input v-model="form.hasDependants" type="checkbox" :disabled="loading" />
        <span>Do you have a dependent spouse or child?</span>
      </label>
    </div>
    <button v-if="!compact" class="check-btn" type="submit" :disabled="loading">
      <span v-if="loading" class="spinner"></span>
      {{ loading ? 'Checking...' : actionLabel }}
    </button>
    <div v-if="apiError" class="api-error">{{ apiError }}</div>
    <EligibilityResult
      v-if="showResult && result"
      :school="school"
      :result="result"
      :form="form"
    />
  </form>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { checkEligibility } from '../../api/explorerApi.js'
import EligibilityResult from './EligibilityResult.vue'

const props = defineProps({
  school: { type: Object, default: null },
  compact: { type: Boolean, default: false },
  showResult: { type: Boolean, default: true },
  initialProfile: { type: Object, default: null },
  title: { type: String, default: 'Your incentive profile' },
  subtitle: { type: String, default: 'Personalise the package for your role and experience.' },
  actionLabel: { type: String, default: 'Check my eligibility' },
  readyLabel: { type: String, default: 'Estimate ready' },
})
const emit = defineEmits(['result-change', 'profile-change', 'profile-submit'])

const form = reactive({
  employmentType: props.initialProfile?.employmentType || '',
  yearsExperience: props.initialProfile?.yearsExperience ?? '',
  hasDependants: Boolean(props.initialProfile?.hasDependants),
})
const errors = reactive({})
const loading = ref(false)
const result = ref(null)
const apiError = ref('')
const applied = ref(false)
const isQld = computed(() => props.school?.state_id === '1')
const hasRole = computed(() => Boolean(form.employmentType))
const hasExperience = computed(() => form.yearsExperience !== '' && Number(form.yearsExperience) >= 0 && Number(form.yearsExperience) <= 40)
const profileReady = computed(() => hasRole.value && hasExperience.value)
const estimateComplete = computed(() => props.compact ? applied.value && profileReady.value : Boolean(result.value))
const compactEstimateLabel = computed(() => estimateComplete.value ? 'Ready' : props.actionLabel)
const steps = computed(() => [
  {
    key: 'role',
    label: 'Role',
    hint: hasRole.value ? employmentLabel(form.employmentType) : 'Select employment type',
    complete: hasRole.value,
    active: !hasRole.value,
  },
  {
    key: 'experience',
    label: 'Experience',
    hint: hasExperience.value ? `${Number(form.yearsExperience)} years added` : 'Add years taught',
    complete: hasExperience.value,
    active: hasRole.value && !hasExperience.value,
  },
  {
    key: 'estimate',
    label: 'Estimate',
    hint: estimateComplete.value ? 'Personalised result ready' : 'Check to calculate',
    complete: estimateComplete.value,
    active: hasRole.value && hasExperience.value && !estimateComplete.value,
  },
])

function validate() {
  errors.employmentType = ''
  errors.yearsExperience = ''
  if (!form.employmentType) errors.employmentType = 'Employment type is required'
  if (form.yearsExperience === '' || form.yearsExperience === null) {
    errors.yearsExperience = 'Years of experience is required'
  } else if (Number(form.yearsExperience) < 0) {
    errors.yearsExperience = 'Years of experience must be 0 or more'
  } else if (Number(form.yearsExperience) > 40) {
    errors.yearsExperience = 'Years of experience must be 40 or less'
  }
  return !errors.employmentType && !errors.yearsExperience
}

async function submit() {
  if (!validate()) return
  const profile = profilePayload()
  emit('profile-submit', profile)
  if (!props.school) {
    applied.value = true
    result.value = null
    emit('result-change', false)
    return
  }
  loading.value = true
  apiError.value = ''
  try {
    result.value = await checkEligibility({
      school_id: props.school.school_id || props.school.id,
      employment_type: form.employmentType,
      years_experience: Number(form.yearsExperience),
      has_dependants: isQld.value ? Boolean(form.hasDependants) : false,
    })
  } catch (e) {
    apiError.value = 'Eligibility service is not available yet. Showing a provisional estimate.'
    result.value = provisionalResult()
  } finally {
    loading.value = false
    emit('result-change', Boolean(result.value))
  }
}

function provisionalResult() {
  const hasIncentive = Number(props.school?.annual_incentive || 0) > 0
  return {
    eligible: hasIncentive && form.employmentType !== 'public_service_officer',
    status: hasIncentive && form.employmentType !== 'public_service_officer' ? 'eligible' : 'ineligible',
    incentive_count: hasIncentive ? 1 : 0,
    reason: hasIncentive ? '' : 'No incentive data is currently linked to this school.',
  }
}

function profilePayload() {
  return {
    employmentType: form.employmentType,
    yearsExperience: form.yearsExperience === '' ? '' : Number(form.yearsExperience),
    hasDependants: Boolean(form.hasDependants),
    ready: profileReady.value,
  }
}

function employmentLabel(value) {
  return {
    permanent: 'Permanent',
    temporary: 'Temporary',
    public_service_officer: 'Public Service Officer',
  }[value] || 'Role selected'
}

watch(
  () => [form.employmentType, form.yearsExperience, form.hasDependants],
  () => {
    result.value = null
    applied.value = false
    emit('profile-change', profilePayload())
  },
  { immediate: true }
)

watch(
  () => props.initialProfile,
  (profile) => {
    if (!profile) return
    form.employmentType = profile.employmentType || ''
    form.yearsExperience = profile.yearsExperience ?? ''
    form.hasDependants = Boolean(profile.hasDependants)
  },
  { deep: true }
)
</script>

<style scoped>
.elig-checker { margin:0; padding:0; }
.elig-checker.compact { display:grid; grid-template-columns:1fr; gap:12px; }
.elig-checker.compact .checker-head { justify-content:center; margin:0 auto; max-width:760px; text-align:center; }
.elig-checker.compact .toggle-field { grid-column:auto; min-height:34px; padding:6px 10px; }
.checker-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px; }
.checker-title { font-size:0.9rem; font-weight:900; color:var(--ink); line-height:1.25; letter-spacing:0; }
.checker-sub { margin-top:2px; font-size:0.68rem; color:var(--ink3); line-height:1.35; }
/* compact: section title matches site heading font */
.elig-checker.compact .checker-title { font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:900; color:var(--ink); letter-spacing:0; text-transform:none; }
.elig-checker.compact .checker-sub { font-size:0.82rem; max-width:38rem; color:var(--ink2); margin-top:6px; font-weight:400; }
.profile-status { flex-shrink:0; border:1px solid var(--b); border-radius:99px; padding:4px 9px; font-size:0.62rem; font-weight:800; color:var(--ink3); background:#fbfaf8; }
.profile-status.ready { color:var(--green-d); background:var(--green-s); border-color:rgba(30,158,86,0.28); }
.profile-steps { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-bottom:14px; }
.elig-checker.compact .profile-steps { grid-column:auto; margin:0; grid-template-columns:repeat(3,minmax(0,1fr)); }
.profile-step { position:relative; display:flex; align-items:center; gap:10px; min-width:0; padding:10px 11px; border:1px solid rgba(217,211,202,0.72); border-radius:var(--r2); background:rgba(255,255,255,0.74); }
.profile-step.active { background:var(--blue-s); }
.profile-step.complete { background:var(--green-s); }
.elig-checker.compact .profile-step { display:grid; grid-template-columns:auto 1fr; align-items:start; min-height:auto; background:linear-gradient(150deg,#f2efe9 0%,#fff 70%); border-top:2.5px solid var(--b2); box-shadow:0 2px 8px rgba(13,31,60,0.05); padding:12px 14px; }
.elig-checker.compact .profile-step:nth-child(1) { background:linear-gradient(150deg,#eef4fd 0%,#fff 70%); border-top-color:#93bef5; }
.elig-checker.compact .profile-step:nth-child(2) { background:linear-gradient(150deg,#fef8e8 0%,#fff 70%); border-top-color:#f0c84a; }
.elig-checker.compact .profile-step:nth-child(3) { background:linear-gradient(150deg,#ebf8f2 0%,#fff 70%); border-top-color:#72d4a2; }
.elig-checker.compact .profile-step.active { background:var(--blue-s); border-top-color:var(--blue); border-color:rgba(31,111,235,0.28); }
.elig-checker.compact .profile-step.complete { background:var(--green-s); border-top-color:var(--green); border-color:rgba(30,158,86,0.26); }
.step-dot { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:28px; height:28px; border-radius:50%; border:1px solid var(--b2); background:var(--s); color:var(--ink2); font-size:0.68rem; font-weight:900; }
.profile-step.active .step-dot { border-color:var(--blue); color:var(--blue-d); }
.profile-step.complete .step-dot { border-color:var(--green); background:var(--green); color:#fff; }
.step-copy { min-width:0; display:flex; flex-direction:column; line-height:1.25; }
.step-copy span { font-size:0.74rem; font-weight:900; color:var(--ink); }
.step-copy small { font-size:0.64rem; color:var(--ink3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.elig-checker.compact .step-copy span { font-size:0.86rem; }
.elig-checker.compact .step-copy small { font-size:0.7rem; }
.step-control { display:flex; flex-direction:column; gap:4px; min-width:0; }
.elig-checker.compact .step-control,
.elig-checker.compact .step-action { grid-column:1 / -1; margin-top:4px; }
.step-control select,
.step-control input { width:100%; min-height:42px; border:1px solid rgba(217,211,202,0.9); border-radius:var(--r2); padding:8px 10px; font:inherit; font-size:0.84rem; color:var(--ink); background:rgba(255,255,255,0.88); }
.exp-input-wrap { display:flex; align-items:center; border:1px solid rgba(217,211,202,0.9); border-radius:var(--r2); background:rgba(255,255,255,0.88); overflow:hidden; }
.exp-input-wrap input { border:none; border-radius:0; background:transparent; width:80px; flex-shrink:0; min-height:42px; padding:8px 10px; font:inherit; font-size:0.84rem; color:var(--ink); }
.exp-input-wrap input:focus { outline:none; }
.exp-suffix { flex:1; padding:0 10px 0 4px; font-size:0.78rem; color:var(--ink3); font-weight:600; white-space:nowrap; border-left:1px solid rgba(217,211,202,0.6); padding-left:10px; }
.step-control small { font-size:0.62rem; color:var(--red); }
.step-action { width:100%; min-height:42px; justify-content:center; display:inline-flex; align-items:center; gap:7px; border:0; border-radius:var(--r2); background:var(--green); color:#fff; padding:10px 14px; font:inherit; font-size:0.86rem; font-weight:900; cursor:pointer; box-shadow:none; }
.step-action:disabled { opacity:0.7; cursor:wait; }
.form-title { margin-bottom:9px; font-size:0.75rem; color:var(--ink2); }
.checker-grid { display:grid; grid-template-columns:1fr; gap:10px; }
.field { display:flex; flex-direction:column; gap:4px; }
.field span,.toggle-field span { font-size:0.66rem; font-weight:700; color:var(--ink2); }
.elig-checker.compact .field span { font-size:0.72rem; }
.field select,.field input { min-height:34px; border:1px solid var(--b); border-radius:var(--r2); padding:6px 8px; font:inherit; font-size:0.76rem; color:var(--ink); background:var(--s); }
.elig-checker.compact .field select,
.elig-checker.compact .field input { min-height:42px; font-size:0.84rem; padding:8px 10px; }
.field small { font-size:0.62rem; color:var(--red); }
.toggle-field { grid-column:1 / -1; display:flex; align-items:center; gap:8px; padding:8px 10px; background:#fbfaf8; border:1px solid var(--b); border-radius:var(--r2); }
.check-btn { width:100%; justify-content:center; margin-top:10px; display:inline-flex; align-items:center; gap:7px; border:0; border-radius:var(--r2); background:var(--green); color:#fff; padding:10px 13px; font:inherit; font-size:0.78rem; font-weight:900; cursor:pointer; }
.check-btn:disabled { opacity:0.7; cursor:wait; }
.spinner { width:13px; height:13px; border:2px solid rgba(255,255,255,0.45); border-top-color:#fff; border-radius:50%; animation:spin 0.75s linear infinite; }
.api-error { margin-top:8px; font-size:0.66rem; color:#9a640e; }
@keyframes spin { to{ transform:rotate(360deg); } }
@media (max-width:640px) {
  .checker-head { flex-direction:column; }
  .profile-steps,
  .elig-checker.compact,
  .elig-checker.compact .checker-grid,
  .elig-checker.compact .profile-step,
  .elig-checker.compact .profile-step:has(.step-action) { grid-template-columns:1fr; }
  .elig-checker.compact .check-btn { width:100%; }
}

@media (max-width:900px) {
  .elig-checker.compact .profile-steps { grid-template-columns:1fr; }
  .elig-checker.compact .profile-step { min-height:auto; }
}
</style>

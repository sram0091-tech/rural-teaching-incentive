<template>
  <form class="elig-checker" @submit.prevent="submit">
    <div class="checker-head">
      <div>
        <div class="checker-title">Your incentive profile</div>
        <div class="checker-sub">Personalise the package for your role and experience.</div>
      </div>
      <div class="profile-status" :class="{ ready: result }">{{ result ? 'Estimate ready' : 'In progress' }}</div>
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
          <small>{{ step.hint }}</small>
        </div>
      </div>
    </div>

    <div class="checker-title form-title">Check your eligibility</div>
    <div class="checker-grid">
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
    <button class="check-btn" type="submit" :disabled="loading">
      <span v-if="loading" class="spinner"></span>
      {{ loading ? 'Checking...' : 'Check my eligibility' }}
    </button>
    <div v-if="apiError" class="api-error">{{ apiError }}</div>
    <EligibilityResult
      v-if="result"
      :school="school"
      :result="result"
      :form="form"
    />
  </form>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { checkEligibility } from '../../api/explorerApi.js'
import EligibilityResult from './EligibilityResult.vue'

const props = defineProps({
  school: { type: Object, required: true },
})
const emit = defineEmits(['result-change'])

const form = reactive({
  employmentType: '',
  yearsExperience: '',
  hasDependants: false,
})
const errors = reactive({})
const loading = ref(false)
const result = ref(null)
const apiError = ref('')
const isQld = computed(() => props.school?.state_id === '1')
const hasRole = computed(() => Boolean(form.employmentType))
const hasExperience = computed(() => form.yearsExperience !== '' && Number(form.yearsExperience) >= 0 && Number(form.yearsExperience) <= 40)
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
    hint: result.value ? 'Personalised result ready' : 'Check to calculate',
    complete: Boolean(result.value),
    active: hasRole.value && hasExperience.value && !result.value,
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

function employmentLabel(value) {
  return {
    permanent: 'Permanent',
    temporary: 'Temporary',
    public_service_officer: 'Public Service Officer',
  }[value] || 'Role selected'
}
</script>

<style scoped>
.elig-checker { margin:0; padding:0; }
.checker-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px; }
.checker-title { font-size:0.9rem; font-weight:900; color:var(--ink); line-height:1.25; letter-spacing:0; }
.checker-sub { margin-top:2px; font-size:0.68rem; color:var(--ink3); line-height:1.35; }
.profile-status { flex-shrink:0; border:1px solid var(--b); border-radius:99px; padding:4px 9px; font-size:0.62rem; font-weight:800; color:var(--ink3); background:#fbfaf8; }
.profile-status.ready { color:var(--green-d); background:var(--green-s); border-color:rgba(30,158,86,0.28); }
.profile-steps { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-bottom:14px; }
.profile-step { position:relative; display:flex; align-items:center; gap:10px; min-width:0; padding:10px 11px; border:1px solid var(--b); border-radius:var(--r2); background:#fbfaf8; }
.profile-step.active { background:var(--blue-s); }
.profile-step.complete { background:var(--green-s); }
.step-dot { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:28px; height:28px; border-radius:50%; border:1px solid var(--b2); background:var(--s); color:var(--ink2); font-size:0.68rem; font-weight:900; }
.profile-step.active .step-dot { border-color:var(--blue); color:var(--blue-d); }
.profile-step.complete .step-dot { border-color:var(--green); background:var(--green); color:#fff; }
.step-copy { min-width:0; display:flex; flex-direction:column; line-height:1.25; }
.step-copy span { font-size:0.74rem; font-weight:900; color:var(--ink); }
.step-copy small { font-size:0.64rem; color:var(--ink3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.form-title { margin-bottom:9px; font-size:0.75rem; color:var(--ink2); }
.checker-grid { display:grid; grid-template-columns:1fr; gap:10px; }
.field { display:flex; flex-direction:column; gap:4px; }
.field span,.toggle-field span { font-size:0.66rem; font-weight:700; color:var(--ink2); }
.field select,.field input { min-height:34px; border:1px solid var(--b); border-radius:var(--r2); padding:6px 8px; font:inherit; font-size:0.76rem; color:var(--ink); background:var(--s); }
.field small { font-size:0.62rem; color:var(--red); }
.toggle-field { grid-column:1 / -1; display:flex; align-items:center; gap:8px; padding:8px 10px; background:#fbfaf8; border:1px solid var(--b); border-radius:var(--r2); }
.check-btn { width:100%; justify-content:center; margin-top:10px; display:inline-flex; align-items:center; gap:7px; border:0; border-radius:var(--r2); background:var(--green); color:#fff; padding:10px 13px; font:inherit; font-size:0.78rem; font-weight:900; cursor:pointer; }
.check-btn:disabled { opacity:0.7; cursor:wait; }
.spinner { width:13px; height:13px; border:2px solid rgba(255,255,255,0.45); border-top-color:#fff; border-radius:50%; animation:spin 0.75s linear infinite; }
.api-error { margin-top:8px; font-size:0.66rem; color:#9a640e; }
@keyframes spin { to{ transform:rotate(360deg); } }
@media (max-width:640px) {
  .checker-head { flex-direction:column; }
  .profile-steps { grid-template-columns:1fr; }
}
</style>

<template>
  <div class="verify">
    <div v-if="loading" class="verify-muted">Checking official policy link...</div>
    <div v-else-if="hasData" class="verify-box">
      <a :href="policyUrl" target="_blank" rel="noopener noreferrer">
        View official {{ stateLabel }} incentive policy →
      </a>
    </div>
    <div v-else class="verify-muted">No incentive data is currently linked to this school</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchVerifyIncentiveLink } from '../../api/explorerApi.js'

const props = defineProps({
  school: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})

const loading = ref(false)
const response = ref(null)

const stateLabel = computed(() => props.school?.state_id === '1' ? 'QLD' : 'NSW')
const fallbackUrl = computed(() =>
  props.school?.state_id === '1'
    ? 'https://www.forgov.qld.gov.au/__data/assets/pdf_file/0028/185491/1618-locality-allowances.pdf'
    : 'https://education.nsw.gov.au/content/dam/main-education/about-us/strategies-and-reports/media/documents/Final_Societel_Copy_Edited_240921.pdf'
)
const hasData = computed(() => response.value?.has_incentive_data ?? props.school?.has_incentive_data ?? Number(props.school?.annual_incentive || 0) > 0)
const policyUrl = computed(() => response.value?.url || response.value?.policy_url || fallbackUrl.value)

async function load() {
  const schoolId = props.school?.school_id || props.school?.id
  if (!schoolId) return
  loading.value = true
  try {
    response.value = await fetchVerifyIncentiveLink(schoolId)
  } catch (e) {
    response.value = { has_incentive_data: props.school?.has_incentive_data ?? Number(props.school?.annual_incentive || 0) > 0 }
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.school?.school_id || props.school?.id, load)
</script>

<style scoped>
.verify { margin:0; }
.verify-box { display:flex; align-items:center; gap:10px; flex-wrap:wrap; font-size:0.82rem; color:var(--ink2); }
.verify a { color:var(--blue); font-size:0.82rem; font-weight:900; text-decoration:none; }
.verify a:hover { text-decoration:underline; }
.verify-muted { font-size:0.7rem; color:var(--ink3); }
</style>

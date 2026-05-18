import { reactive } from 'vue'

const estimatesBySchool = reactive({})

function schoolKey(schoolOrId) {
  if (schoolOrId && typeof schoolOrId === 'object') {
    return String(schoolOrId.school_id || schoolOrId.id || '')
  }
  return String(schoolOrId || '')
}

export function usePersonalisedIncentives() {
  function setPersonalisedIncentive(schoolOrId, payload) {
    const key = schoolKey(schoolOrId)
    if (!key) return

    if (!payload) {
      delete estimatesBySchool[key]
      return
    }

    const total = Number(payload.total)

    if (!Number.isFinite(total) || total < 0) {
      console.warn(`[usePersonalisedIncentives] invalid total for key "${key}":`, payload.total)
      delete estimatesBySchool[key]
      return
    }

    if (total === 0) {
      delete estimatesBySchool[key]
      return
    }

    if (total > 80000) {
      console.warn(`[usePersonalisedIncentives] suspiciously large total ($${total}) for key "${key}" — storing anyway`)
    }

    const yrs = Number(payload.profile?.yearsExperience)
    if (payload.profile?.ready && (!Number.isFinite(yrs) || yrs < 0 || yrs > 40)) {
      console.warn(`[usePersonalisedIncentives] unexpected yearsExperience "${payload.profile.yearsExperience}" for key "${key}"`)
    }

    estimatesBySchool[key] = {
      ...payload,
      total,
    }
  }

  function getPersonalisedIncentive(schoolOrId) {
    return estimatesBySchool[schoolKey(schoolOrId)] || null
  }

  return {
    estimatesBySchool,
    setPersonalisedIncentive,
    getPersonalisedIncentive,
  }
}

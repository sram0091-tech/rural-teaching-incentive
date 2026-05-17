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
    if (!payload || !Number.isFinite(Number(payload.total))) {
      delete estimatesBySchool[key]
      return
    }
    estimatesBySchool[key] = {
      ...payload,
      total: Number(payload.total),
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

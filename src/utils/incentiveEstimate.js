export function yearsExperienceBand(years) {
  if (years < 2) return '0-1'
  if (years < 5) return '2-4'
  return '5+'
}

export function estimateTotalFromResult(result, isQld, hasDependants) {
  const rawRows = result?.breakdown || result?.rows || result?.incentives || result?.eligible_incentives || result?.eligibleIncentives
  if (Array.isArray(rawRows)) {
    let rows = rawRows.flatMap((row) => {
      const nested = row?.rows || row?.incentives || row?.variants
      return Array.isArray(nested) ? nested : row
    }).filter((row) => {
      if (!row || typeof row !== 'object') return false
      const status = String(row.status || row.eligibility_status || row.eligibilityStatus || '').toLowerCase()
      return row.eligible !== false && row.ineligible !== true && status !== 'ineligible' && status !== 'not_eligible'
    })
    if (isQld) {
      const locality = rows.filter((r) => {
        const text = [r.category, r.allowance_type, r.name, r.incentive_name].filter(Boolean).join(' ').toLowerCase()
        return text.includes('locality allowance')
      })
      if (locality.length >= 2) {
        const sorted = [...locality].sort((a, b) => {
          const an = Number(a.amount ?? a.annual_amount ?? 0)
          const bn = Number(b.amount ?? b.annual_amount ?? 0)
          return bn - an
        })
        const keep = hasDependants ? sorted[0] : sorted[sorted.length - 1]
        rows = rows.filter((r) => !locality.includes(r) || r === keep)
      }
    }
    const rowTotal = rows.reduce((sum, row) => {
      const val = row.amount ?? row.annual_amount ?? row.annualAmount ?? row.value
      if (row.is_variable_amount || row.variable || String(val).trim() === '—') return sum
      const n = Number(val)
      return Number.isFinite(n) ? sum + n : sum
    }, 0)
    if (rowTotal > 0) return rowTotal
  }
  const topLevel = result?.personalised_total ?? result?.personalized_total ??
    result?.personalised_annual_total ?? result?.personalized_annual_total ??
    result?.total_estimate ?? result?.annual_total ?? result?.annualTotal ?? result?.total
  const n = Number(topLevel)
  return Number.isFinite(n) && n > 0 ? n : 0
}

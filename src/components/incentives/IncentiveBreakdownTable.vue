<template>
  <div class="ibt-wrap">
    <table class="ibt">
      <thead>
        <tr>
          <th>Incentive name</th>
          <th>Amount</th>
          <th>Frequency</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in displayRows"
          :key="row.id || row.name"
          :class="{ muted: isMuted(row) }"
        >
          <td>{{ row.name || row.incentive_name || 'Incentive' }}</td>
          <td :class="{ variable: isVariable(row) }">
            {{ amountLabel(row) }}
            <span v-if="isVariable(row)" class="info" title="Variable amount depends on your circumstances">i</span>
          </td>
          <td>{{ row.frequency || 'annual' }}</td>
          <td>{{ notesLabel(row) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>Total</td>
          <td>{{ money(totalAmount) }}</td>
          <td colspan="2">+ on top of base salary<span v-if="hasVariable">*</span></td>
        </tr>
        <tr v-if="hasVariable" class="ibt-note">
          <td colspan="4">* Variable components not included in total</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
})

const displayRows = computed(() => props.rows.length ? props.rows : [])
const hasVariable = computed(() => displayRows.value.some(isVariable))
const totalAmount = computed(() => {
  if (props.total > 0) return props.total
  return displayRows.value.reduce((sum, row) => {
    if (isVariable(row) || row.eligible === false) return sum
    return sum + Number(row.amount || row.annual_amount || 0)
  }, 0)
})

function isVariable(row) {
  const name = String(row.name || row.incentive_name || '').toLowerCase()
  const notes = String(row.notes || '').toLowerCase()
  return Boolean(
    row.is_variable_amount ||
    row.variable ||
    row.amount === 'Variable' ||
    name.includes('rental subsidy') ||
    notes.includes('rent')
  )
}

function isMuted(row) {
  return row.eligible === false || (!isVariable(row) && Number(row.amount ?? row.annual_amount ?? 0) === 0)
}

function money(value) {
  const n = Number(value || 0)
  return n > 0 ? `$${Math.round(n).toLocaleString()}` : '$0'
}

function amountLabel(row) {
  if (isVariable(row)) return 'Variable'
  return money(row.amount ?? row.annual_amount)
}

function notesLabel(row) {
  if (row.notes || row.reason) return row.notes || row.reason
  if (row.eligible === false) return 'Not eligible based on your details'
  if (isVariable(row)) return 'Based on your rent — up to 90% subsidised'
  return ''
}
</script>

<style scoped>
.ibt-wrap { overflow-x:auto; border:1px solid var(--b); border-radius:var(--r2); background:var(--s); }
.ibt { width:100%; border-collapse:collapse; min-width:0; }
.ibt th,.ibt td { padding:8px 10px; border-bottom:1px solid var(--b); font-size:0.72rem; text-align:left; vertical-align:top; }
.ibt th { background:var(--s2); color:var(--ink2); font-size:0.62rem; letter-spacing:0.06em; text-transform:uppercase; }
.ibt tbody tr.muted { color:var(--ink3); background:#fafafa; }
.ibt td.variable { font-style:italic; color:var(--ink2); }
.info { display:inline-flex; align-items:center; justify-content:center; width:15px; height:15px; margin-left:4px; border-radius:50%; background:var(--blue-s); color:var(--blue-d); font-size:0.58rem; font-weight:800; font-style:normal; }
.ibt tfoot td { font-weight:800; color:var(--ink); background:#fbfaf8; }
.ibt-note td { font-weight:500; color:var(--ink3); font-size:0.66rem; font-style:italic; }
</style>

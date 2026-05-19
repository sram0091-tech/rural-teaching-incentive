<template>
  <Transition name="tray">
    <div v-if="cmpList.length" class="cmp-tray show">
      <span class="tray-lbl">Saved schools:</span>
      <div class="tray-items">
        <div v-for="id in cmpList" :key="id" class="tray-item">
          <span class="tray-name">{{ shortName(id) }}</span>
          <span v-if="personalisedAmount(id)" class="tray-est">{{ personalisedAmount(id) }}</span>
          <button class="tray-x" @click="$emit('remove', id)" title="Remove">✕</button>
        </div>
        <div v-for="i in (4 - cmpList.length)" :key="'slot-'+i" class="tray-slot">+ save</div>
      </div>
      <button
        class="tray-go"
        :class="{ 'tray-go--dim': cmpList.length < 2 }"
        :title="cmpList.length < 2 ? 'Save at least 2 schools to compare' : ''"
        @click="cmpList.length >= 2 && $emit('open-compare')"
      >Explore in Neighbourhood →</button>
      <span class="tray-clear" @click="$emit('clear')">Clear</span>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useExplorer } from '../composables/useExplorer.js'
import { usePersonalisedIncentives } from '../composables/usePersonalisedIncentives.js'

const { compareSchools } = useExplorer()
const { getPersonalisedIncentive } = usePersonalisedIncentives()

const props = defineProps({ cmpList: Array })
defineEmits(['remove', 'clear', 'open-compare'])

const byId = computed(() => {
  const m = new Map()
  for (const s of compareSchools.value) m.set(String(s.id), s)
  return m
})

function shortName(id) {
  const l = byId.value.get(String(id))
  return l ? l.name.split(' ').slice(0, 3).join(' ') : '—'
}

function personalisedAmount(id) {
  const estimate = getPersonalisedIncentive(id)
  const total = Number(estimate?.total || 0)
  return total > 0 ? `$${Math.round(total).toLocaleString()}/yr` : ''
}
</script>

<style scoped>
.tray-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--s, #fff);
  border: 1.5px solid var(--blue, #1F6FEB);
  color: var(--blue, #1F6FEB);
  border-radius: 999px;
  padding: 3px 6px 3px 12px;
  font-size: 0.76rem;
  font-weight: 600;
}
.tray-name {
  white-space: nowrap;
}
.tray-est {
  border-left: 1px solid rgba(31,111,235,0.22);
  padding-left: 6px;
  color: var(--green-d, #15803d);
  font-size: 0.68rem;
  font-weight: 800;
  white-space: nowrap;
}
.tray-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(31,111,235,0.12);
  color: var(--blue, #1F6FEB);
  border: none;
  cursor: pointer;
  font-size: 0.58rem;
  font-weight: 700;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.12s, color 0.12s;
}
.tray-x:hover {
  background: #dc2626;
  color: #fff;
}
.tray-go--dim {
  opacity: 0.4;
  cursor: default;
}
</style>

<template>
  <div class="srow" :class="{ open: isOpen }">
    <div class="srow-main" @click="$emit('toggle', school.id)">
      <div class="srow-left">
        <div class="srow-name">{{ school.name }}</div>
        <div class="srow-meta">
          <span>{{ school.suburb || '—' }}</span>
          <span class="chip" :class="school.state_id === '1' ? 'cq' : 'cn'">
            {{ school.state_id === '1' ? 'QLD' : 'NSW' }}
          </span>
          <span class="chip" :class="RC[String(school.remoteness_id)] || 'c3'">{{ school.remoteness || '—' }}</span>
          <span style="color:var(--ink3)">{{ school.type || '—' }}</span>
        </div>
      </div>
      <div class="srow-metric">
        <template v-if="sort === 'inc'">
          <div v-if="numInc(school) > 0" class="mv mv-inc">
            ${{ Math.round(numInc(school)).toLocaleString() }}<span style="font-size:0.6rem;font-weight:400">/yr</span>
          </div>
          <div v-else class="mv mv-none">No incentive</div>
          <div class="msub">on top of base</div>
        </template>
        <template v-else-if="sort === 'hc'">
          <div class="mv">{{ numHc(school) }}</div>
          <div class="msub">health svcs</div>
        </template>
        <template v-else-if="sort === 'dist'">
          <div class="mv">{{ Math.round(numDist(school)) }}km</div>
          <div class="msub">from {{ school.nearest_city || 'nearest city' }}</div>
        </template>
        <template v-else-if="sort === 'az'">
          <div class="mv" style="font-size:0.72rem;font-weight:600">{{ school.name || '—' }}</div>
          <div class="msub">A → Z</div>
        </template>
      </div>
      <div class="srow-acts" @click.stop>
        <button
          class="btn-cmp"
          :class="{ added: inCmp }"
          @click="$emit('toggle-cmp', school.id)"
        >{{ inCmp ? '✓' : '+' }} Compare</button>
        <button class="btn-exp" @click="$emit('toggle', school.id)">
          {{ isOpen ? 'Close ↑' : 'Details ↓' }}
        </button>
      </div>
    </div>

    <!-- Desktop inline detail -->
    <Transition name="detail">
      <div v-if="isOpen && !isMobile" class="srow-detail">
        <IncentivePanel :school="school" :profile="incentiveProfile" @view-lifestyle="$emit('view-lifestyle', school.id)" />
      </div>
    </Transition>

    <!-- Mobile bottom sheet -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="isOpen && isMobile" class="sheet-backdrop" @click.self="$emit('toggle', school.id)">
          <div class="sheet-panel">
            <div class="sheet-handle"></div>
            <div class="sheet-header">
              <div>
                <div class="sheet-name">{{ school.name }}</div>
                <div class="sheet-meta">
                  <span>{{ school.suburb }}</span>
                  <span class="chip" :class="school.state_id === '1' ? 'cq' : 'cn'">{{ school.state_id === '1' ? 'QLD' : 'NSW' }}</span>
                  <span class="chip" :class="RC[String(school.remoteness_id)] || 'c3'">{{ school.remoteness }}</span>
                </div>
              </div>
              <button class="sheet-close" @click="$emit('toggle', school.id)">✕</button>
            </div>
            <div class="sheet-body">
              <IncentivePanel :school="school" :profile="incentiveProfile" @view-lifestyle="$emit('view-lifestyle', school.id)" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RC } from '../data/db.js'
import { toNum } from '../utils/locationFields.js'
import IncentivePanel from './incentives/IncentivePanel.vue'

defineProps({
  school: Object,
  isOpen: Boolean,
  inCmp: Boolean,
  sort: String,
  empType: String,
  incentiveProfile: Object,
})
defineEmits(['toggle', 'toggle-cmp', 'view-lifestyle'])

const isMobile = ref(false)
function checkMobile() { isMobile.value = window.innerWidth < 768 }
onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
onUnmounted(() => { window.removeEventListener('resize', checkMobile) })

function numInc(s) { return toNum(s?.annual_incentive, 0) }
function numHc(s)  { return toNum(s?.healthcare_count, 0) }
function numDist(s){ return toNum(s?.distance_to_city, 0) }
</script>

<style scoped>
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 800;
  display: flex;
  align-items: flex-end;
}
.sheet-panel {
  background: var(--s);
  border-radius: 18px 18px 0 0;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
.sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--b2);
  border-radius: 99px;
  margin: 12px auto 4px;
}
.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 18px 12px;
  border-bottom: 1px solid var(--b);
}
.sheet-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 4px;
}
.sheet-meta {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 0.72rem;
  color: var(--ink2);
}
.sheet-close {
  background: var(--s2);
  border: none;
  border-radius: 99px;
  width: 28px;
  height: 28px;
  font-size: 0.75rem;
  color: var(--ink2);
  cursor: pointer;
  flex-shrink: 0;
}
.sheet-body { padding: 14px 18px 20px; }

.sheet-enter-active { transition: transform 0.28s cubic-bezier(0.22,1,0.36,1), opacity 0.2s ease; }
.sheet-leave-active { transition: transform 0.22s ease, opacity 0.18s ease; }
.sheet-enter-from  { transform: translateY(100%); opacity: 0; }
.sheet-leave-to    { transform: translateY(100%); opacity: 0; }
</style>

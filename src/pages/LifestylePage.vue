<template>
  <div class="page active">
    <div class="page-topbar">
      <div class="page-title">Lifestyle Insights</div>
      <div class="page-sub">Real lifestyle data for every school — housing costs, healthcare, education, and nature.</div>
    </div>

    <!-- Search bar -->
    <div class="ins-search-bar">
      <div style="position:relative;flex:1;max-width:360px">
        <div class="ins-sw">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--ink3);flex-shrink:0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            v-model="insQ"
            placeholder="Search for a school to view its lifestyle…"
            @input="onInsSearch"
            @keydown.down.prevent="insHighlight = Math.min(insHighlight + 1, insResults.length - 1)"
            @keydown.up.prevent="insHighlight = Math.max(insHighlight - 1, 0)"
            @keydown.enter.prevent="insResults[insHighlight] && selectIns(insResults[insHighlight].id)"
            @keydown.escape="closeDropdown"
            autocomplete="off"
          >
        </div>
        <div v-if="insResults.length" class="ins-sr show">
          <div
            v-for="(l, i) in insResults" :key="l.id"
            class="ins-sri"
            :class="{ highlighted: i === insHighlight }"
            @mouseenter="insHighlight = i"
            @click="selectIns(l.id)"
          >
            <div class="ins-sri-name">{{ l.name }}</div>
            <div class="ins-sri-sub">{{ l.suburb || '—' }} · {{ stateLabelFromRecord(l) }} · {{ l.remoteness || '—' }}</div>
          </div>
        </div>
      </div>
      <span v-if="insSchool" class="ins-clear" @click="doClearIns">✕ Clear</span>
      <button class="ins-back-btn" @click="$emit('navigate', 'explorer')">← Back to Explorer</button>
    </div>

    <!-- Tray pills -->
    <div v-if="cmpList.length" class="ins-tray-bar show">
      <span class="itp-lbl">From your compare tray:</span>
      <span
        v-for="id in cmpList" :key="id"
        class="itp-pill"
        :class="{ active: !sbsMode && insSchool && insSchool.id === id }"
      >
        <span @click="selectIns(id)" style="cursor:pointer">{{ shortName(id) }}</span>
        <button class="itp-pill-x" @click.stop="toggleCmp(id)" title="Remove">✕</button>
      </span>
      <button v-if="cmpList.length >= 2"
        class="sbs-toggle-btn"
        :class="{ active: sbsMode }"
        @click="toggleSbs"
      >⊞ {{ sbsMode ? 'Exit comparison' : 'Compare side by side' }}</button>
    </div>

    <!-- Body -->
    <div class="ins-body">
      <!-- Empty state -->
      <div v-if="!insSchool && !sbsMode" class="ins-empty">
        <div class="ins-empty-prompt">
          <div class="ins-empty-icon">🌿</div>
          <div class="ins-empty-title">Search for a school above to explore its lifestyle</div>
          <ul class="ins-empty-hints">
            <li>Search by school name or suburb above</li>
            <li>Add schools to your compare tray in <strong>Explorer</strong> — they'll appear here</li>
            <li>Tap "View Lifestyle →" on any school in Explorer to jump straight in</li>
          </ul>
        </div>
        <div class="ins-explainers">
          <div class="ins-exp-card">
            <div class="ins-exp-icon">📍</div>
            <div class="ins-exp-title">Location & Cost</div>
            <div class="ins-exp-desc">Distance from nearest city, median weekly rent, and how far your salary stretches in the area.</div>
          </div>
          <div class="ins-exp-card">
            <div class="ins-exp-icon">🏥</div>
            <div class="ins-exp-title">Healthcare & Safety</div>
            <div class="ins-exp-desc">Number of healthcare facilities nearby, graded A–F, plus a local crime rank so you know what to expect.</div>
          </div>
          <div class="ins-exp-card">
            <div class="ins-exp-icon">🎓</div>
            <div class="ins-exp-title">Education & Nature</div>
            <div class="ins-exp-desc">Schools in the area, national parks, and nature reserves — for you, your family, and your weekends.</div>
          </div>
        </div>
      </div>

      <!-- Single school view -->
      <template v-else-if="insSchool && !sbsMode">
        <div class="ins-school-hdr anim-fadeup">
          <div>
            <div class="ish-name">{{ insSchool.name }}</div>
            <div class="ish-meta">
              <span>{{ insSchool.suburb }}</span>
              <span class="chip" :class="insSchool.state_id === '1' ? 'cq' : 'cn'">{{ insSchool.state_id === '1' ? 'QLD' : 'NSW' }}</span>
              <span class="chip" :class="RC[String(insSchool.remoteness_id)] || 'c3'">{{ insSchool.remoteness || '—' }}</span>
              <span style="color:var(--ink3)">{{ insSchool.type }}·{{ insSchool.sector }}</span>
            </div>
          </div>
          <div class="ish-acts">
            <button class="btn btn-sm" :class="isCmp(insSchool.id) ? 'btn-g' : 'btn-gh'" @click="toggleCmp(insSchool.id)">
              {{ isCmp(insSchool.id) ? '✓ In Compare' : '+ Compare' }}
            </button>
          </div>
        </div>

        <div class="life-grid anim-fadeup" style="animation-delay:0.05s">
          <div class="life-card">
            <div class="lc-title">📍 Location & Cost</div>
            <div class="lr"><span class="lrk">Nearest city</span><span class="lrv">{{ metricVal(insSchool, 'nearest_city_name') || insSchool.nearest_city || '—' }} <span style="color:var(--ink3);font-size:0.7rem">({{ Math.round(n(insSchool.distance_to_city)) }} km)</span></span></div>
            <div class="lr"><span class="lrk">Median rent</span><span class="lrv" :class="n(metricVal(insSchool, 'median_rent_weekly')) < 250 ? 'good' : n(metricVal(insSchool, 'median_rent_weekly')) > 450 ? 'warn' : ''">${{ n(metricVal(insSchool, 'median_rent_weekly')) }}/wk</span></div>
          </div>
          <div class="life-card">
            <div class="lc-title">🏥 Healthcare & Safety</div>
            <div class="lr"><span class="lrk">Healthcare grade</span><span class="lrv"><span class="gbadge" :class="GC[insSchool.healthcare_grade] || 'gd'">{{ insSchool.healthcare_grade || '—' }}</span> <span style="color:var(--ink3);font-size:0.72rem;margin-left:2px">{{ n(metricVal(insSchool, 'healthcare_count')) }} facilities</span></span></div>
            <div class="lr"><span class="lrk">Crime rank <span style="font-weight:400;color:var(--ink3);font-size:0.62rem">(lower = safer)</span></span><span class="lrv" :class="crimeClass(n(insSchool.crime_rank))">{{ n(metricVal(insSchool, 'crime_rank')) > 0 ? n(metricVal(insSchool, 'crime_rank')) + ' / 130' : 'No data' }}</span></div>
            <div class="grade-legend">
              <span class="gl-row" v-for="g in healthcareScale" :key="g.grade"><span class="gbadge" :class="GC[g.grade] || 'gd'">{{ g.grade }}</span> {{ g.label }}</span>
            </div>
          </div>
          <div class="life-card">
            <div class="lc-title">🎓 Education & Nature</div>
            <div class="lr"><span class="lrk">Education grade</span><span class="lrv"><span class="gbadge" :class="GC[insSchool.education_grade] || 'gd'">{{ insSchool.education_grade || '—' }}</span> <span style="color:var(--ink3);font-size:0.72rem;margin-left:2px">{{ n(metricVal(insSchool, 'education_count')) }} schools nearby</span></span></div>
            <div class="lr"><span class="lrk">National parks</span><span class="lrv" :class="n(metricVal(insSchool, 'national_parks_count')) > 3 ? 'good' : ''">{{ n(metricVal(insSchool, 'national_parks_count')) }} parks</span></div>
            <div class="lr"><span class="lrk">Nature reserves</span><span class="lrv">{{ n(metricVal(insSchool, 'nature_reserves_count')) }} reserves</span></div>
            <div class="grade-legend">
              <span class="gl-row" v-for="g in educationScale" :key="g.grade"><span class="gbadge" :class="GC[g.grade] || 'gd'">{{ g.grade }}</span> {{ g.label }}</span>
            </div>
          </div>
        </div>

        <!-- Trade-offs -->
        <div class="editorial anim-fadeup" style="animation-delay:0.1s">
          <div class="editorial-title">The honest trade-offs.</div>
          <div class="editorial-sub">Neither column wins — these are differences. You decide what matters more.</div>
          <div class="tradeoffs"><div class="to-cols">
            <div class="to-col reg">
              <div class="to-col-lbl">🌿 Regional & Remote</div>
              <div class="to-item"><span class="au">↑</span>Higher incentives on top of your base salary</div>
              <div class="to-item"><span class="au">↑</span>Lower cost of living</div>
              <div class="to-item"><span class="au">↑</span>Stronger community bonds</div>
              <div class="to-item"><span class="au">↑</span>Faster-developing skills</div>
              <div class="to-item"><span class="ad">↓</span>Fewer healthcare services</div>
              <div class="to-item"><span class="ad">↓</span>Further from nearest city amenities</div>
            </div>
            <div class="to-col city">
              <div class="to-col-lbl">🏙️ City & Inner Regional</div>
              <div class="to-item"><span class="au">↑</span>Excellent hospital access</div>
              <div class="to-item"><span class="au">↑</span>Rich cultural and social life</div>
              <div class="to-item"><span class="au">↑</span>Larger professional networks</div>
              <div class="to-item"><span class="au">↑</span>More specialist opportunities</div>
              <div class="to-item"><span class="ad">↓</span>Higher housing costs</div>
              <div class="to-item"><span class="ad">↓</span>Lower incentive packages</div>
            </div>
          </div></div>
        </div>
      </template>

      <!-- Side-by-side view -->
      <template v-else-if="sbsMode && cmpSchools.length >= 2">
<div class="sbs-wrap anim-fadeup">
          <table class="sbs-tbl">
            <thead>
              <tr>
                <th>Factor</th>
                <th v-for="s in cmpSchools" :key="s.id" style="min-width:170px">
                  {{ s.name }}<br>
                  <span style="font-weight:400;font-size:0.61rem;color:var(--ink3)">{{ s.suburb }}</span>
                  <span class="chip" :class="s.state_id === '1' ? 'cq' : 'cn'" style="margin-left:2px">{{ s.state_id === '1' ? 'QLD' : 'NSW' }}</span>
                  <span class="chip" :class="RC[String(s.remoteness_id)] || 'c3'" style="margin-left:2px">{{ s.remoteness || '—' }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="sbs-sec"><td :colspan="cmpSchools.length + 1">📍 Location & Cost</td></tr>
              <tr>
                <td>Nearest city</td>
                <td v-for="(s, i) in cmpSchools" :key="s.id" :class="bestIdx(cmpSchools.map(x => n(metricVal(x, 'distance_to_nearest_city_km') || x.distance_to_city)), false) === i ? 'sbs-best' : 'sbs-lo'">{{ metricVal(s, 'nearest_city_name') || s.nearest_city || '—' }} <span style="color:var(--ink3);font-size:0.7rem">({{ Math.round(n(s.distance_to_city)) }} km)</span></td>
              </tr>
              <tr>
                <td>Median rent</td>
                <td v-for="(s, i) in cmpSchools" :key="s.id" :class="bestIdx(cmpSchools.map(x => n(metricVal(x, 'median_rent_weekly'))), false) === i ? 'sbs-best' : 'sbs-lo'">${{ n(metricVal(s, 'median_rent_weekly')) }}/wk</td>
              </tr>
              <tr class="sbs-sec"><td :colspan="cmpSchools.length + 1">🏥 Healthcare & Safety</td></tr>
              <tr>
                <td>Healthcare grade</td>
                <td v-for="s in cmpSchools" :key="s.id"><span class="gbadge" :class="GC[s.healthcare_grade] || 'gd'">{{ s.healthcare_grade }}</span> <span style="color:var(--ink3);font-size:0.7rem">{{ n(metricVal(s, 'healthcare_count')) }} facilities</span></td>
              </tr>
              <tr>
                <td>Crime rank (lower=safer)</td>
                <td v-for="(s, i) in cmpSchools" :key="s.id" :class="bestIdx(cmpSchools.map(x => n(metricVal(x, 'crime_rank'))), false) === i ? 'sbs-best' : 'sbs-lo'">{{ n(metricVal(s, 'crime_rank')) > 0 ? n(metricVal(s, 'crime_rank')) + '/130' : 'No data' }}</td>
              </tr>
              <tr class="sbs-sec"><td :colspan="cmpSchools.length + 1">🎓 Education & Nature</td></tr>
              <tr>
                <td>Education grade</td>
                <td v-for="s in cmpSchools" :key="s.id"><span class="gbadge" :class="GC[s.education_grade] || 'gd'">{{ s.education_grade }}</span> <span style="color:var(--ink3);font-size:0.7rem">{{ n(metricVal(s, 'education_count')) }} schools</span></td>
              </tr>
              <tr>
                <td>National parks</td>
                <td v-for="(s, i) in cmpSchools" :key="s.id" :class="bestIdx(cmpSchools.map(x => n(metricVal(x, 'national_parks_count'))), true) === i ? 'sbs-best' : 'sbs-lo'">{{ n(metricVal(s, 'national_parks_count')) }} parks</td>
              </tr>
              <tr>
                <td>Nature reserves</td>
                <td v-for="(s, i) in cmpSchools" :key="s.id" :class="bestIdx(cmpSchools.map(x => n(metricVal(x, 'nature_reserves_count'))), true) === i ? 'sbs-best' : 'sbs-lo'">{{ n(metricVal(s, 'nature_reserves_count')) }} reserves</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="font-size:0.7rem;color:var(--ink3);margin-top:4px;">Green highlight = strongest value per row</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useExplorer } from '../composables/useExplorer.js'
import { RC, GC } from '../data/db.js'
import { toNum, stateLabelFromRecord } from '../utils/locationFields.js'

defineEmits(['navigate'])

function n(v) {
  // Handle nested metric objects like {value: "2.0", unit: "rank"}
  if (v !== null && v !== undefined && typeof v === 'object' && 'value' in v) {
    return toNum(v.value, 0)
  }
  return toNum(v, 0)
}

function metricVal(school, key) {
  // Try flat field first, then nested lifestyle_metrics
  const flat = school?.[key]
  if (flat !== null && flat !== undefined && flat !== 0 && flat !== '') return flat
  const nested = school?.lifestyle_metrics?.[key]
  if (nested === null || nested === undefined) return null
  if (typeof nested === 'object' && 'value' in nested) return nested.value
  return nested
}

const {
  insSchool,
  sbsMode,
  cmpList,
  selectIns: _selectIns,
  clearIns,
  toggleSbs,
  toggleCmp,
  isCmp,
  compareSchools,
  searchSchoolsForDropdown,
} = useExplorer()

const insQ = ref('')
const insResults = ref([])
const insHighlight = ref(0)
let insSearchTimer

function closeDropdown() {
  insResults.value = []
}

onMounted(() => document.addEventListener('click', (e) => {
  if (!e.target.closest('.ins-search-bar')) closeDropdown()
}))
onUnmounted(() => document.removeEventListener('click', closeDropdown))

async function onInsSearch() {
  const q = insQ.value.toLowerCase().trim()
  clearTimeout(insSearchTimer)
  if (!q) { insResults.value = []; return }
  insSearchTimer = setTimeout(async () => {
    insResults.value = await searchSchoolsForDropdown(q)
    insHighlight.value = 0
  }, 260)
}

async function selectIns(id) {
  await _selectIns(id)
  insResults.value = []
  insQ.value = insSchool.value?.name || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function doClearIns() {
  clearIns()
  insQ.value = ''
  insResults.value = []
}

const cmpSchools = computed(() => compareSchools.value)

function shortName(id) {
  const l = compareSchools.value.find((x) => String(x.id) === String(id))
  return l ? (l.name || '—').split(' ').slice(0, 3).join(' ') : '—'
}

function crimeClass(rank) {
  if (rank > 0 && rank < 30) return 'good'
  if (rank > 70) return 'bad'
  return ''
}

const healthcareScale = [
  { grade: 'A+', label: '195+ facilities' },
  { grade: 'A',  label: '120–194' },
  { grade: 'B',  label: '67–119' },
  { grade: 'C',  label: '33–66' },
  { grade: 'D',  label: '1–32' },
  { grade: 'F',  label: 'None' },
]
const educationScale = [
  { grade: 'A+', label: '51+ schools' },
  { grade: 'A',  label: '26–50' },
  { grade: 'B',  label: '15–25' },
  { grade: 'C',  label: '8–14' },
  { grade: 'D',  label: '1–7' },
  { grade: 'F',  label: 'None' },
]

function bestIdx(vals, hi) {
  const ns = vals.map(v => parseFloat(v) || 0)
  const best = hi ? Math.max(...ns) : Math.min(...ns.filter(n => n > 0).concat([0]))
  return ns.indexOf(best)
}
</script>

<style scoped>
.page-topbar {
  width: 100%;
  padding: 56px 20px 40px;
  background:
    radial-gradient(circle at 20% 50%, rgba(31,111,235,0.16) 0%, transparent 42%),
    radial-gradient(circle at 80% 20%, rgba(30,158,86,0.10) 0%, transparent 34%),
    linear-gradient(135deg, #0D1F3C 0%, #1A3557 45%, #0F2D4A 72%, #081828 100%);
  color: #fff;
  box-shadow: 0 20px 40px rgba(13,31,60,0.18);
}
.page-title {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto 8px;
  font-size: 2.1rem;
  font-weight: 900;
  line-height: 1.08;
  color: #fff !important;
}
.page-sub {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  font-size: 1rem;
  color: rgba(255,255,255,0.82) !important;
}

.itp-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 10px !important;
}
.itp-pill-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(31,111,235,0.15);
  color: var(--blue, #1F6FEB);
  border: none;
  cursor: pointer;
  font-size: 0.55rem;
  font-weight: 700;
  padding: 0;
  transition: background 0.12s, color 0.12s;
}
.itp-pill-x:hover {
  background: #dc2626;
  color: #fff;
}

.sbs-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: var(--r2);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  border: 1.5px solid var(--blue);
  background: var(--blue-s);
  color: var(--blue);
  transition: all 0.14s;
  white-space: nowrap;
  margin-left: auto;
}
.sbs-toggle-btn:hover { background: var(--blue); color: #fff; }
.sbs-toggle-btn.active { background: var(--blue); color: #fff; }

.ins-sri.highlighted { background: var(--s2); }

.ins-back-btn {
  margin-left: auto;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--r2);
  border: 1.5px solid var(--b2);
  background: var(--s);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--ink2);
  cursor: pointer;
  transition: all 0.13s;
}
.ins-back-btn:hover { border-color: var(--blue); color: var(--blue); background: var(--blue-s); }

.ins-empty {
  max-width: 600px;
  margin: 36px auto 0;
}
.ins-empty-prompt {
  text-align: center;
  margin-bottom: 28px;
}
.ins-empty-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  opacity: 0.3;
}
.ins-empty-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink2);
  margin-bottom: 6px;
}
.ins-empty-hints {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 340px;
  text-align: left;
}
.ins-empty-hints li {
  font-size: 0.74rem;
  color: var(--ink3);
  padding-left: 14px;
  position: relative;
  line-height: 1.5;
}
.ins-empty-hints li::before {
  content: '·';
  position: absolute;
  left: 0;
  color: var(--ink3);
  font-weight: 700;
}
.ins-explainers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.ins-exp-card {
  background: var(--s);
  border: 1px solid var(--b);
  border-radius: var(--r);
  padding: 16px 14px;
}
.ins-exp-icon {
  font-size: 1.3rem;
  margin-bottom: 8px;
}
.ins-exp-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 5px;
}
.ins-exp-desc {
  font-size: 0.71rem;
  color: var(--ink3);
  line-height: 1.6;
}
@media (max-width: 600px) {
  .ins-explainers { grid-template-columns: 1fr; }
}

.grade-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--b);
}
.gl-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.64rem;
  color: var(--ink3);
}

.sbs-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  padding: 10px 14px;
  background: var(--s2);
  border: 1px solid var(--b);
  border-radius: var(--r2);
  flex-wrap: wrap;
}
.sbs-legend-col {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  flex: 1;
  min-width: 200px;
}
.sbs-legend-title {
  font-size: 0.63rem;
  font-weight: 700;
  color: var(--ink2);
  width: 100%;
  margin-bottom: 2px;
}
.sbs-legend-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.63rem;
  color: var(--ink3);
}

</style>
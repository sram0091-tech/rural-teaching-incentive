<template>
  <div class="page active">
    <div class="page-topbar">
      <div class="page-title">Neighbourhood</div>
      <div class="page-sub">Real lifestyle data for every school — housing costs, healthcare, education, and nature.</div>
    </div>

    <!-- Search bar -->
    <div class="ins-search-bar">
      <div class="ins-search-wrap">
        <div class="ins-sw">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--ink3);flex-shrink:0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            ref="searchInputEl"
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
      <span class="itp-lbl">From your saved schools:</span>
      <span
        v-for="(id, idx) in cmpList" :key="id"
        class="itp-pill"
        :class="{ active: !sbsMode && insSchool && insSchool.id === id, 'coach-pulse': !tourDismissed && idx === 0 }"
      >
        <span @click="selectIns(id)" style="cursor:pointer">{{ shortName(id) }}</span>
        <button class="itp-pill-x" @click.stop="toggleCmp(id)" title="Remove">✕</button>
      </span>
      <button v-if="cmpList.length >= 2"
        class="sbs-toggle-btn"
        :class="{ active: sbsMode, 'coach-pulse': !tourDismissed }"
        @click="toggleSbs"
      >⊞ {{ sbsMode ? 'Exit comparison' : 'Compare side by side' }}</button>
    </div>


    <!-- Body -->
    <div class="ins-body">
      <!-- Empty state -->
      <div v-if="!insSchool && !sbsMode" class="ins-empty">
        <div class="ies-hero">
          <h2 class="ies-h">What's life like near a school?</h2>
          <p class="ies-sub">Find out before you commit.</p>
          <div class="ies-steps-row">
            <div class="ies-step-item" style="animation-delay: 0.05s">
              <div class="ies-step-num">1</div>
              <div class="ies-step-info">
                <div class="ies-step-title">Search a school</div>
                <div class="ies-step-desc">Search by name above or pick one from the Explorer</div>
              </div>
            </div>
            <div class="ies-step-arrow">→</div>
            <div class="ies-step-item" style="animation-delay: 0.15s">
              <div class="ies-step-num">2</div>
              <div class="ies-step-info">
                <div class="ies-step-title">Read the scorecard</div>
                <div class="ies-step-desc">Rent, healthcare, safety &amp; nature at a glance</div>
              </div>
            </div>
            <div class="ies-step-arrow">→</div>
            <div class="ies-step-item" style="animation-delay: 0.25s">
              <div class="ies-step-num">3</div>
              <div class="ies-step-info">
                <div class="ies-step-title">Compare schools</div>
                <div class="ies-step-desc">Add up to 4 schools and compare side by side</div>
              </div>
            </div>
          </div>
          <div class="ies-actions">
            <button class="ies-btn-primary" @click="focusSearch">Search a school</button>
            <button class="ies-btn-secondary" @click="emit('navigate', 'explorer')">Browse Explorer →</button>
          </div>
        </div>
      </div>

      <!-- Single school view -->
      <template v-else-if="insSchool && !sbsMode">
        <div class="ins-school-hdr anim-fadeup">
          <div class="ish-left">
            <div class="ish-suburb">{{ insSchool.suburb }}</div>
            <div class="ish-meta">
              <span class="chip" :class="insSchool.state_id === '1' ? 'cq' : 'cn'">{{ insSchool.state_id === '1' ? 'QLD' : 'NSW' }}</span>
              <span class="chip" :class="RC[String(insSchool.remoteness_id)] || 'c3'">{{ insSchool.remoteness || '—' }}</span>
              <span class="ish-school-name">{{ insSchool.name }}</span>
            </div>
          </div>
          <div v-if="insPersonalisedIncentive || insSchool.annual_incentive > 0" class="ish-incentive">
            <span class="ish-inc-amount">+${{ Math.round(insPersonalisedIncentive?.total || insSchool.annual_incentive).toLocaleString() }}/yr</span>
            <span class="ish-inc-label">{{ insPersonalisedIncentive ? 'personalised estimate · on top of base salary' : 'up to · incentive on top of base salary' }}</span>
          </div>
          <div class="ish-acts">
            <button class="btn btn-sm" :class="isCmp(insSchool.id) ? 'btn-g' : 'btn-gh'" @click="toggleCmp(insSchool.id)">
              {{ isCmp(insSchool.id) ? '✓ In Compare' : '+ Compare' }}
            </button>
            <a :href="applyUrl(insSchool)" target="_blank" rel="noopener noreferrer" class="ls-apply-btn">
              Link to job site →
            </a>
          </div>
        </div>

        <div class="section-source-row anim-fadeup" style="animation-delay:0.03s">
          <button class="source-badge source-badge--data" @click="goDataSources" title="Where does the data come from?">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Verified data
          </button>
        </div>

        <div class="life-grid anim-fadeup" style="animation-delay:0.05s">
          <div class="life-card">
            <div class="lc-title">Location & Cost</div>
            <div class="lr"><span class="lrk">Nearest city</span><span class="lrv">{{ metricVal(insSchool, 'nearest_city_name') || insSchool.nearest_city || '—' }} <span style="color:var(--ink3);font-size:0.7rem">({{ Math.round(n(insSchool.distance_to_city)) }} km)</span></span></div>
            <div class="lr">
              <span class="lrk">Median rent</span>
              <span class="lrv" style="display:inline-flex;align-items:center;gap:6px">
                <span :class="n(metricVal(insSchool, 'median_rent_weekly')) < 250 ? 'good' : n(metricVal(insSchool, 'median_rent_weekly')) > 450 ? 'warn' : ''">${{ n(metricVal(insSchool, 'median_rent_weekly')) }}/wk</span>
                <span v-if="rentDiff" class="rent-trend" :class="rentDiff.cls">{{ rentDiff.arrow }} {{ rentDiff.pct }}% vs {{ rentDiff.label }}</span>
              </span>
            </div>
          </div>
          <div class="life-card">
            <div class="lc-title">Healthcare & Safety</div>
            <div class="lr">
              <span class="lrk">Healthcare grade</span>
              <span class="lrv">
                <span class="grade-tip-wrap">
                <span class="gbadge" :class="GC[insSchool.healthcare_grade] || 'gd'">{{ insSchool.healthcare_grade || '—' }}</span>
                <div class="grade-tip">
                  <div v-for="g in healthcareScale" :key="g.grade" class="grade-tip-row">
                    <span class="gbadge" :class="GC[g.grade] || 'gd'">{{ g.grade }}</span>
                    <span>{{ g.label }}</span>
                  </div>
                </div>
              </span>
                <span style="color:var(--ink3);font-size:0.72rem;margin-left:4px">{{ n(metricVal(insSchool, 'healthcare_count')) }} facilities</span>
              </span>
            </div>
            <div class="lr"><span class="lrk">Crime rank <span style="font-weight:400;color:var(--ink3);font-size:0.62rem">(lower = safer)</span></span><span class="lrv" :class="crimeClass(n(insSchool.crime_rank))">{{ n(metricVal(insSchool, 'crime_rank')) > 0 ? n(metricVal(insSchool, 'crime_rank')) + ' / 130' : 'No data' }}</span></div>
          </div>
          <div class="life-card">
            <div class="lc-title">Education & Nature</div>
            <div class="lr">
              <span class="lrk">Education grade</span>
              <span class="lrv">
                <span class="grade-tip-wrap">
                <span class="gbadge" :class="GC[insSchool.education_grade] || 'gd'">{{ insSchool.education_grade || '—' }}</span>
                <div class="grade-tip">
                  <div v-for="g in educationScale" :key="g.grade" class="grade-tip-row">
                    <span class="gbadge" :class="GC[g.grade] || 'gd'">{{ g.grade }}</span>
                    <span>{{ g.label }}</span>
                  </div>
                </div>
              </span>
                <span style="color:var(--ink3);font-size:0.72rem;margin-left:4px">{{ n(metricVal(insSchool, 'education_count')) }} schools nearby</span>
              </span>
            </div>
            <div class="lr"><span class="lrk">National parks</span><span class="lrv" :class="n(metricVal(insSchool, 'national_parks_count')) > 3 ? 'good' : ''">{{ n(metricVal(insSchool, 'national_parks_count')) }} parks</span></div>
            <div class="lr"><span class="lrk">Nature reserves</span><span class="lrv">{{ n(metricVal(insSchool, 'nature_reserves_count')) }} reserves</span></div>
          </div>
        </div>

        <!-- Map -->
        <SchoolMap :school="insSchool" class="anim-fadeup" style="animation-delay:0.08s" />

        <!-- AI Trade-offs Summary -->
        <div class="editorial anim-fadeup" style="animation-delay:0.1s">
          <div class="editorial-title">
            Life in {{ insSchool.suburb }}
            <span class="source-badge source-badge--ai">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/></svg>
              AI-generated
            </span>
          </div>
          <div v-if="aiLoading" class="ai-skeleton">
            <div class="ai-skel-cols">
              <div class="ai-skel-col">
                <div class="ai-skel-bar ai-skel-bar--label"></div>
                <div class="ai-skel-bar"></div>
                <div class="ai-skel-bar ai-skel-bar--sm"></div>
                <div class="ai-skel-bar"></div>
              </div>
              <div class="ai-skel-col">
                <div class="ai-skel-bar ai-skel-bar--label"></div>
                <div class="ai-skel-bar ai-skel-bar--sm"></div>
                <div class="ai-skel-bar"></div>
                <div class="ai-skel-bar ai-skel-bar--sm"></div>
              </div>
            </div>
            <div class="ai-skel-divider"></div>
            <div class="ai-skel-sentences">
              <div class="ai-skel-bar ai-skel-bar--full"></div>
              <div class="ai-skel-bar ai-skel-bar--lg"></div>
              <div class="ai-skel-bar ai-skel-bar--full"></div>
              <div class="ai-skel-bar ai-skel-bar--md"></div>
            </div>
            <div class="ai-skel-fact"></div>
          </div>
          <div v-else-if="aiSummary" class="ai-summary-wrap">
            <div class="ai-cols">
              <div class="ai-col ai-col--neg">
                <div class="ai-col-label">
                  <span class="ai-col-icon">↓</span> Challenges
                </div>
                <div
                  v-for="(pt, i) in aiSummary.negative" :key="pt"
                  class="ai-point ai-point--neg"
                  :style="{ animationDelay: `${i * 0.1}s` }"
                  v-html="boldify(pt)"
                ></div>
              </div>
              <div class="ai-col ai-col--pos">
                <div class="ai-col-label">
                  <span class="ai-col-icon">↑</span> Upsides
                </div>
                <div
                  v-for="(pt, i) in aiSummary.positive" :key="pt"
                  class="ai-point ai-point--pos"
                  :style="{ animationDelay: `${i * 0.1 + 0.15}s` }"
                  v-html="boldify(pt)"
                ></div>
              </div>
            </div>
            <div class="ai-suburb">
              <div v-if="aiSummary.social" class="ai-suburb-row" style="animation-delay: 0.45s">
                <span class="ai-row-tag ai-row-tag--social">Social</span>
                <span v-html="boldify(aiSummary.social)"></span>
              </div>
              <div v-if="aiSummary.spending" class="ai-suburb-row" style="animation-delay: 0.55s">
                <span class="ai-row-tag ai-row-tag--spend">Spending</span>
                <span v-html="boldify(aiSummary.spending)"></span>
              </div>
              <div v-if="showAiSpendingInput" class="spending-inline" style="animation-delay: 0.6s">
                <span class="ai-row-tag ai-row-tag--cost">Cost</span>
                <span class="spending-inline-text">
                  Weekly living costs around <strong>${{ localWeeklyEstimate.toLocaleString() }}</strong> locally.
                  Your weekly budget:
                  <input
                    v-model.number="spendingForm.weeklyTotal"
                    class="spending-inline-input"
                    type="number" min="0" inputmode="numeric" placeholder="e.g. 650"
                  />
                  <span v-if="hasSpendingInput" class="spending-inline-result" :class="{ saving: weeklySavings > 0, extra: weeklySavings < 0 }">
                    {{ weeklySavings > 0 ? '↓' : '↑' }} {{ spendingResultAmount }} {{ weeklySavings > 0 ? 'saving' : 'extra' }}
                  </span>
                </span>
              </div>
              <div v-if="aiSummary.sports" class="ai-suburb-row" style="animation-delay: 0.65s">
                <span class="ai-row-tag ai-row-tag--sport">Sport</span>
                <span v-html="boldify(aiSummary.sports)"></span>
              </div>
              <div v-if="aiSummary.students" class="ai-suburb-row" style="animation-delay: 0.75s">
                <span class="ai-row-tag ai-row-tag--students">Students</span>
                <span v-html="boldify(aiSummary.students)"></span>
              </div>
              <div v-if="aiSummary.funFact" class="ai-fun-fact" style="animation-delay: 0.85s">
                <span>{{ aiSummary.funFact }}</span>
              </div>
            </div>
          </div>
          <p v-else class="ai-summary-muted">No summary available for this school.</p>
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
                <td v-for="(s, i) in cmpSchools" :key="s.id" :class="bestIdx(cmpSchools.map(x => n(metricVal(x, 'median_rent_weekly'))), false) === i ? 'sbs-best' : 'sbs-lo'">
                  ${{ n(metricVal(s, 'median_rent_weekly')) }}/wk
                  <span v-if="schoolRentTrend(s)" class="rent-trend" :class="schoolRentTrend(s).cls" style="margin-left:6px">
                    {{ schoolRentTrend(s).arrow }} {{ schoolRentTrend(s).pct }}% vs {{ schoolRentTrend(s).label }}
                  </span>
                </td>
              </tr>
              <tr class="sbs-sec"><td :colspan="cmpSchools.length + 1">🏥 Healthcare & Safety</td></tr>
              <tr>
                <td>Healthcare grade</td>
                <td v-for="s in cmpSchools" :key="s.id">
                  <span class="grade-tip-wrap">
                    <span class="gbadge" :class="GC[s.healthcare_grade] || 'gd'">{{ s.healthcare_grade }}</span>
                    <div class="grade-tip">
                      <div v-for="g in healthcareScale" :key="g.grade" class="grade-tip-row">
                        <span class="gbadge" :class="GC[g.grade] || 'gd'">{{ g.grade }}</span>
                        <span>{{ g.label }}</span>
                      </div>
                    </div>
                  </span>
                  <span style="color:var(--ink3);font-size:0.7rem;margin-left:4px">{{ n(metricVal(s, 'healthcare_count')) }} facilities</span>
                </td>
              </tr>
              <tr>
                <td>Crime rank (lower=safer)</td>
                <td v-for="(s, i) in cmpSchools" :key="s.id" :class="bestIdx(cmpSchools.map(x => n(metricVal(x, 'crime_rank'))), false) === i ? 'sbs-best' : 'sbs-lo'">{{ n(metricVal(s, 'crime_rank')) > 0 ? n(metricVal(s, 'crime_rank')) + '/130' : 'No data' }}</td>
              </tr>
              <tr class="sbs-sec"><td :colspan="cmpSchools.length + 1">🎓 Education & Nature</td></tr>
              <tr>
                <td>Education grade</td>
                <td v-for="s in cmpSchools" :key="s.id">
                  <span class="grade-tip-wrap">
                    <span class="gbadge" :class="GC[s.education_grade] || 'gd'">{{ s.education_grade }}</span>
                    <div class="grade-tip">
                      <div v-for="g in educationScale" :key="g.grade" class="grade-tip-row">
                        <span class="gbadge" :class="GC[g.grade] || 'gd'">{{ g.grade }}</span>
                        <span>{{ g.label }}</span>
                      </div>
                    </div>
                  </span>
                  <span style="color:var(--ink3);font-size:0.7rem;margin-left:4px">{{ n(metricVal(s, 'education_count')) }} schools</span>
                </td>
              </tr>
              <tr>
                <td>National parks</td>
                <td v-for="(s, i) in cmpSchools" :key="s.id" :class="bestIdx(cmpSchools.map(x => n(metricVal(x, 'national_parks_count'))), true) === i ? 'sbs-best' : 'sbs-lo'">{{ n(metricVal(s, 'national_parks_count')) }} parks</td>
              </tr>
              <tr>
                <td>Nature reserves</td>
                <td v-for="(s, i) in cmpSchools" :key="s.id" :class="bestIdx(cmpSchools.map(x => n(metricVal(x, 'nature_reserves_count'))), true) === i ? 'sbs-best' : 'sbs-lo'">{{ n(metricVal(s, 'nature_reserves_count')) }} reserves</td>
              </tr>
              <tr>
                <td></td>
                <td v-for="s in cmpSchools" :key="s.id">
                  <a :href="applyUrl(s)" target="_blank" rel="noopener noreferrer" class="ls-apply-btn ls-apply-btn--sm">
                    Link to job site →
                  </a>
                </td>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useExplorer } from '../composables/useExplorer.js'
import { usePersonalisedIncentives } from '../composables/usePersonalisedIncentives.js'
import { fetchIncentiveEstimate } from '../api/explorerApi.js'
import { yearsExperienceBand, estimateTotalFromResult } from '../utils/incentiveEstimate.js'
import { RC, GC } from '../data/db.js'
import { toNum, stateLabelFromRecord } from '../utils/locationFields.js'
import SchoolMap from '../components/lifestyle/SchoolMap.vue'

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

const emit = defineEmits(['navigate'])

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
  launchView,
  launchSort,
} = useExplorer()

const {
  activeProfile: insActiveProfile,
  getPersonalisedIncentive: insGetEstimate,
  setPersonalisedIncentive: insSetEstimate,
} = usePersonalisedIncentives()

const insPersonalisedIncentive = computed(() => {
  if (!insActiveProfile.value?.ready || !insSchool.value) return null
  return insGetEstimate(insSchool.value.school_id || insSchool.value.id)
})

watch(insSchool, async (school) => {
  if (!school || !insActiveProfile.value?.ready) return
  const key = school.school_id || school.id
  if (insGetEstimate(key)) return
  const profile = insActiveProfile.value
  const isQld = school.state_id === '1'
  const years = Number(profile.yearsExperience || 0)
  try {
    const result = await fetchIncentiveEstimate({
      school_id: key,
      employment_type: isQld ? 'temporary' : 'permanent',
      years_experience: years,
      years_of_experience: years,
      experience_years: years,
      years_experience_band: yearsExperienceBand(years),
      has_dependants: isQld ? Boolean(profile.hasDependants) : false,
    })
    const total = estimateTotalFromResult(result, isQld, Boolean(profile.hasDependants))
    if (total > 0) insSetEstimate(key, { total, profile: { ...profile } })
  } catch {}
})

function goDataSources() {
  sessionStorage.setItem('about_scroll', 'data-sources')
  emit('navigate', 'about')
}

function goExplorerSort(sort) {
  launchSort.value = sort
  launchView.value = 'search'
  emit('navigate', 'explorer')
}

const tourDismissed = ref(sessionStorage.getItem('nbhd_tour_dismissed') === '1')
function dismissTour() { tourDismissed.value = true; sessionStorage.setItem('nbhd_tour_dismissed', '1') }
let tourTimer = null
watch(cmpList, (list) => {
  if (list.length >= 2 && !tourDismissed.value && !tourTimer) {
    tourTimer = setTimeout(dismissTour, 10000)
  }
}, { immediate: true })

const insQ = ref('')
const insResults = ref([])
const insHighlight = ref(0)
const searchInputEl = ref(null)
let insSearchTimer

const aiSummary = ref(null)
const aiLoading = ref(false)
const showAiSpendingInput = import.meta.env.VITE_AI_SPENDING_INPUT !== 'false'
const spendingPlannerOpen = ref(false)
const spendingForm = ref({
  weeklyTotal: null,
})

const hasSpendingInput = computed(() => Number(spendingForm.value.weeklyTotal) > 0)

const currentWeeklySpend = computed(() => Number(spendingForm.value.weeklyTotal || 0))

const localWeeklyEstimate = computed(() => {
  const rent = n(metricVal(insSchool.value, 'median_rent_weekly'))
  const profile = remotenessSpendProfile(insSchool.value?.remoteness)
  return Math.round(rent + profile.groceries + profile.transport + profile.utilities)
})

const weeklySavings = computed(() => Math.round(currentWeeklySpend.value - localWeeklyEstimate.value))
const spendingResultLabel = computed(() => weeklySavings.value >= 0 ? 'Potential saving' : 'Potential extra cost')
const spendingResultAmount = computed(() => {
  const weekly = Math.abs(weeklySavings.value)
  const annual = weekly * 52
  return `$${weekly.toLocaleString()}/wk`
})

function remotenessSpendProfile(remoteness = '') {
  const text = String(remoteness).toLowerCase()
  if (text.includes('very remote')) return { groceries: 145, transport: 95, utilities: 55 }
  if (text.includes('remote')) return { groceries: 130, transport: 80, utilities: 52 }
  if (text.includes('outer')) return { groceries: 120, transport: 65, utilities: 48 }
  if (text.includes('inner')) return { groceries: 110, transport: 55, utilities: 45 }
  return { groceries: 105, transport: 50, utilities: 45 }
}

function aiCacheGet(id) {
  try { const v = localStorage.getItem(`ai_summary_v2_${id}`); return v ? JSON.parse(v) : null } catch { return null }
}
function aiCacheSet(id, val) {
  try { localStorage.setItem(`ai_summary_v2_${id}`, JSON.stringify(val)) } catch {}
}

async function generateAISummary(school, retry = 0) {
  const key = import.meta.env.VITE_OPENAI_API_KEY
  if (!school || retry > 2) return
  const cacheKey = school.id
  const cached = aiCacheGet(cacheKey)
  if (cached) { aiSummary.value = cached; return }
  aiLoading.value = true
  aiSummary.value = null
  try {
    const prompt = `You are writing a hyperlocal lifestyle brief for a teacher considering a placement in ${school.suburb}, ${school.state_id === '1' ? 'QLD' : 'NSW'}. Every point MUST use real, specific proper nouns — actual facility names, reserve names, club names, waterway names, street names, events. Never write a generic phrase like "local clinic", "nearby reserve", "community club", "limited facilities", or "few parks". If you know the name, use it. If you are not confident of a specific name, use the closest real landmark or institution you do know for that region.

Return ONLY valid JSON:

- "positive": array of exactly 3 short phrases (under 8 words each). Each must name something real and specific. Always wrap the key proper noun or place name in **double asterisks**. Use digits for all numbers, not words (e.g. "2 km", "3 mins", not "two kilometres"). Examples: "Fishing the **Tully River** for barramundi", "**Ayr Bowls Club** 2 mins away", "**Atherton Tablelands** trail network on doorstep". No generic phrases.

- "negative": array of exactly 3 short phrases (under 8 words each). Each must name something real and specific. Always wrap the key proper noun or place name in **double asterisks**. Use digits for all numbers. Examples: "Nearest hospital: **Atherton Hospital**, 42 km", "No Woolworths — **IGA Ravenshoe** only", "**Eungella NP** the only nearby reserve". Reflect the actual data: healthcare grade ${school.healthcare_grade || '—'} with ${n(metricVal(school, 'healthcare_count'))} facilities, ${n(metricVal(school, 'national_parks_count'))} national parks, ${n(metricVal(school, 'nature_reserves_count'))} nature reserves nearby.

- "social": one sentence about the actual social scene in ${school.suburb} — name a real venue, club, event, or gathering spot locals use (e.g. "Locals gather at the **Ravenshoe Hotel** most Friday evenings"). Bold the venue/club name. Under 20 words. No generic phrases.

- "spending": one sentence estimating realistic weekly spending for a single person. Start from rent $${n(metricVal(school, 'median_rent_weekly'))}/wk, add groceries/transport/utilities for a town of this remoteness. Bold the total range using **double asterisks**. Under 20 words.

- "sports": one sentence naming the actual sports clubs or events in or near ${school.suburb} — use real club names, competitions, or events (e.g. "The **Ingham Leprechauns** dominate local rugby league on Friday nights"). Bold the club/event name. Under 18 words.

- "students": one sentence describing the typical student background at ${school.name} — the likely family occupations, cultural mix, or socioeconomic context (e.g. "Most students come from **sugarcane and cattle farming** families across the Burdekin district"). Bold the key descriptor. Under 20 words.

- "funFact": one surprising real fact about ${school.suburb} or its immediate region — history, ecology, industry, record, or quirk. Must be verifiable. Under 20 words. No bold.

- "rentTrend": { "arrow": "↓" or "↑", "pct": integer, "label": e.g. "QLD median" } comparing $${n(metricVal(school, 'median_rent_weekly'))}/wk to the ${school.state_id === '1' ? 'QLD' : 'NSW'} state-wide median rent.

School data:
- ${school.name}, ${school.suburb} (${school.state_id === '1' ? 'QLD' : 'NSW'}, ${school.remoteness})
- Incentive: $${school.annual_incentive || 0}/yr
- Distance to ${metricVal(school, 'nearest_city_name') || school.nearest_city || 'nearest city'}: ${Math.round(n(school.distance_to_city))} km
- Median rent: $${n(metricVal(school, 'median_rent_weekly'))}/wk
- Healthcare: grade ${school.healthcare_grade || '—'}, ${n(metricVal(school, 'healthcare_count'))} facilities
- Crime rank: ${n(metricVal(school, 'crime_rank')) || 'unknown'} / 130
- National parks: ${n(metricVal(school, 'national_parks_count'))}, Nature reserves: ${n(metricVal(school, 'nature_reserves_count'))}

Return format: {"positive":["...","...","..."],"negative":["...","...","..."],"social":"...","spending":"...","sports":"...","students":"...","funFact":"...","rentTrend":{"arrow":"↓","pct":45,"label":"QLD median"}}`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.2
      })
    })
    const data = await res.json()
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, 15000))
      return generateAISummary(school, retry + 1)
    }
    const raw = data.choices?.[0]?.message?.content?.trim() || ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    if (parsed) aiCacheSet(cacheKey, parsed)
    aiSummary.value = parsed
  } catch (e) {
    console.warn('AI summary error:', e)
    aiSummary.value = null
  } finally {
    aiLoading.value = false
  }
}

let aiDebounceTimer = null
watch(insSchool, (school) => {
  clearTimeout(aiDebounceTimer)
  spendingPlannerOpen.value = false
  spendingForm.value.weeklyTotal = null
  if (!school) { aiSummary.value = null; return }
  aiDebounceTimer = setTimeout(() => generateAISummary(school), 800)
}, { immediate: true })

function focusSearch() {
  searchInputEl.value?.focus()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

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

const rentDiff = computed(() => {
  const t = aiSummary.value?.rentTrend
  if (!t?.arrow || !t?.pct || !t?.label) return null
  const correctState = insSchool.value?.state_id === '1' ? 'QLD' : 'NSW'
  const wrongState   = correctState === 'QLD' ? 'NSW' : 'QLD'
  const label = t.label.replace(wrongState, correctState)
  return { ...t, label, cls: t.arrow === '↓' ? 'rent-trend--good' : 'rent-trend--warn' }
})

function schoolRentTrend(school) {
  const rent = n(metricVal(school, 'median_rent_weekly'))
  if (!rent) return null
  // ABS 2023 median weekly rent: QLD ~$450, NSW ~$500
  const median = school.state_id === '1' ? 450 : 500
  const pct = Math.round(Math.abs((rent - median) / median * 100))
  const arrow = rent <= median ? '↓' : '↑'
  const label = school.state_id === '1' ? 'QLD median' : 'NSW median'
  return { arrow, pct, label, cls: arrow === '↓' ? 'rent-trend--good' : 'rent-trend--warn' }
}

function boldify(text) {
  return text
    .replace(/\+\+(.+?)\+\+/g, '<strong class="ai-pos">$1</strong>')
    .replace(/--(.+?)--/g, '<strong class="ai-neg">$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<em class="ai-neu">$1</em>')
}

function applyUrl(school) {
  return school?.state_id === '1'
    ? 'https://smartjobs.qld.gov.au/jobtools/jncustomsearch.searchResults%3Fin_organid%3D14904%26in_jobDate%3DAll%26in_multi01_id%3D1108%26in_skills%3Dteacher'
    : 'https://education.nsw.gov.au/teach-nsw/find-teaching-jobs/jobfeed#Rural0'
}
</script>

<style scoped>
/* ── Coach mark pulse ── */
.coach-pulse {
  animation: coach-ring 1.4s ease-out 7;
}
@keyframes coach-ring {
  0%   { box-shadow: 0 0 0 0 rgba(31,111,235,0.75); }
  50%  { box-shadow: 0 0 0 14px rgba(31,111,235,0.2); }
  100% { box-shadow: 0 0 0 18px rgba(31,111,235,0); }
}

/* ── Inline spending row ── */
.spending-inline {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  opacity: 0;
  animation: ai-slidein 0.4s ease forwards;
}
.spending-inline-text {
  font-size: 0.84rem;
  color: var(--ink2);
  line-height: 1.6;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
}
.spending-inline-input {
  width: 80px;
  border: none;
  border-bottom: 1.5px solid var(--b);
  background: transparent;
  font: inherit;
  font-size: 0.82rem;
  color: var(--ink);
  padding: 1px 4px;
  outline: none;
  transition: border-color 0.15s;
}
.spending-inline-input:focus { border-color: var(--blue); }
.spending-inline-input::placeholder { color: var(--ink3); }
.spending-inline-result {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 99px;
}
.spending-inline-result.saving { background: #dcfce7; color: #166534; }
.spending-inline-result.extra  { background: #fee2e2; color: #991b1b; }

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
  font-size: 0.84rem;
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

.ins-search-wrap {
  position: relative;
  flex: 1 1 320px;
  max-width: 360px;
  min-width: 0;
}

.ins-empty {
  padding: 40px 0 60px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Hero */
.ies-hero {
  text-align: center;
  animation: ies-fadein 0.5s ease both;
}
.ies-h {
  font-family: 'Playfair Display', serif;
  font-size: 2.3rem;
  font-weight: 900;
  color: var(--ink);
  line-height: 1.15;
  margin-bottom: 8px;
}
.ies-sub {
  font-size: 1rem;
  color: var(--ink3);
  margin-bottom: 32px;
}
@keyframes ies-fadein {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ies-steps-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.ies-step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--s);
  border: 1px solid var(--b);
  border-radius: 14px;
  padding: 14px 18px;
  min-width: 190px;
  opacity: 0;
  animation: ies-fadein 0.45s ease forwards;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.ies-step-item:hover {
  border-color: var(--blue);
  box-shadow: 0 4px 16px rgba(31,111,235,0.10);
  transform: translateY(-2px);
}
.ies-step-num {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--blue);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ies-step-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}
.ies-step-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--ink);
}
.ies-step-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.76rem;
  color: var(--ink3);
  line-height: 1.4;
}
.ies-step-arrow {
  font-size: 1.1rem;
  color: var(--b2);
  flex-shrink: 0;
}
.ies-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
.ies-btn-primary {
  padding: 10px 24px;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 99px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.94rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.14s;
}
.ies-btn-primary:hover { background: var(--blue-d, #1558c0); }
.ies-btn-secondary {
  padding: 10px 24px;
  background: transparent;
  color: var(--ink2);
  border: 1.5px solid var(--b2);
  border-radius: 99px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.94rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.14s;
}
.ies-btn-secondary:hover { border-color: var(--blue); color: var(--blue); }

@media (max-width: 700px) {
  .ies-h { font-size: 1.75rem; }
  .ins-search-bar {
    align-items: stretch;
    top: 60px;
  }
  .ins-search-wrap {
    flex-basis: 100%;
    max-width: none;
    width: 100%;
  }
  .ins-clear {
    width: auto;
    align-self: center;
  }
  .ins-back-btn {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    min-height: 42px;
  }
  .ins-school-hdr {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin: -12px 0 20px;
    padding: 16px;
    top: 116px;
    gap: 12px;
  }
  .ish-left,
  .ish-incentive,
  .ish-acts {
    width: 100%;
    min-width: 0;
  }
  .ish-suburb {
    font-size: 1.2rem;
    overflow-wrap: anywhere;
  }
  .ish-meta {
    gap: 7px;
  }
  .ish-incentive {
    justify-content: center;
    flex-wrap: wrap;
    border-radius: 12px;
    text-align: center;
    white-space: normal;
  }
  .ish-acts {
    display: grid;
    grid-template-columns: 1fr;
  }
  .ish-acts .btn,
  .ls-apply-btn {
    width: 100%;
    justify-content: center;
    min-height: 44px;
  }
  .lr {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
  .lrv {
    width: 100%;
    overflow-wrap: anywhere;
  }
  .ai-skel-cols { grid-template-columns: 1fr; }
  .page-topbar { padding: 40px 16px 30px; }
  .page-title { font-size: 1.7rem; }
  .page-sub { font-size: 0.88rem; }
  .editorial { padding: 16px; }
  .editorial-title { flex-wrap: wrap; gap: 8px; }
  .source-badge--ai { margin-left: 0; }
  .ai-cols { grid-template-columns: 1fr; }
  .ai-suburb-row { align-items: flex-start; flex-direction: column; gap: 5px; }
  .spending-result {
    flex-direction: column;
    align-items: stretch;
  }
  .spending-planner-toggle { grid-template-columns: 1fr auto; }
  .spending-local-total { text-align: left; }
  .spending-simple-row { grid-template-columns: 1fr; }
}

.lc-scale {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--b);
  font-size: 0.72rem;
  color: var(--ink3);
}
.grade-tip-wrap {
  position: relative;
  display: inline-flex;
  cursor: default;
}
.grade-tip {
  position: absolute;
  top: 50%;
  left: calc(100% + 10px);
  transform: translateY(-50%);
  background: #fff;
  border: 1px solid var(--b);
  border-radius: 10px;
  padding: 8px 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  min-width: 170px;
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.grade-tip::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: var(--b);
}
.grade-tip-wrap:hover .grade-tip { opacity: 1; }
.grade-tip-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  color: var(--ink2);
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
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--ink2);
  width: 100%;
  margin-bottom: 2px;
}
.sbs-legend-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.74rem;
  color: var(--ink3);
}

.ins-school-hdr {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 117px;
  z-index: 90;
  background: var(--s);
  margin: -20px 0 20px;
  padding: 16px 20px 20px;
  border: 1px solid var(--b);
  border-top: 3px solid var(--blue);
  border-radius: 0 0 16px 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.10);
}
.ish-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ish-suburb {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.1;
}
.ish-school-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  color: var(--ink3);
  font-weight: 400;
}
.ish-incentive {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-self: center;
  padding: 6px 16px 6px 12px;
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 99px;
  white-space: nowrap;
}
.ish-inc-amount {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  color: #15803d;
  letter-spacing: -0.01em;
}
.ish-inc-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: #166534;
  font-weight: 500;
}
.rent-trend {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
}
.rent-trend--good { background: #f0fdf4; color: #15803d; }
.rent-trend--warn { background: #fef2f2; color: #b91c1c; }

.ish-acts {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.ls-apply-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border-radius: 99px;
  background: linear-gradient(135deg, #1F6FEB 0%, #1558c0 100%);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(31,111,235,0.35);
  transition: transform 0.15s, box-shadow 0.15s;
  letter-spacing: 0.01em;
}
.ls-apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(31,111,235,0.45);
}
.sbs-apply-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}
.ls-apply-btn--sm {
  padding: 6px 14px;
  font-size: 0.78rem;
}

.section-source-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}
.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.69rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 99px;
}
.source-badge--data {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  cursor: pointer;
  transition: background 0.13s, border-color 0.13s;
}
.source-badge--data:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}
.source-badge--ai {
  background: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
  margin-left: 10px;
  vertical-align: middle;
}

.editorial {
  background: #fff;
  border: 1px solid var(--b);
  border-radius: var(--r);
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.editorial-title {
  display: flex;
  align-items: center;
  gap: 0;
  color: var(--ink);
  font-family: 'DM Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
}
.ai-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}
.ai-col {
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ai-col--neg { background: #fef2f2; border: 1px solid #fecaca; }
.ai-col--pos { background: #f0fdf4; border: 1px solid #bbf7d0; }
.ai-col-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 2px;
}
.ai-col--neg .ai-col-label { color: #b91c1c; }
.ai-col--pos .ai-col-label { color: #15803d; }
.ai-col-icon { font-size: 0.8rem; }
.ai-point {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  line-height: 1.5;
  opacity: 0;
  animation: ai-slidein 0.4s ease forwards;
  padding-left: 2px;
}
.ai-point--neg { color: #7f1d1d; }
.ai-point--pos { color: #14532d; }
.ai-suburb {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--b);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ai-suburb-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--ink2);
  opacity: 0;
  animation: ai-slidein 0.4s ease forwards;
}
.ai-row-tag {
  flex-shrink: 0;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 99px;
}
.ai-row-tag--social   { background: #ede9fe; color: #6d28d9; }
.ai-row-tag--spend    { background: #fef9c3; color: #92400e; }
.ai-row-tag--cost     { background: #f0fdf4; color: #15803d; }
.ai-row-tag--sport    { background: #dcfce7; color: #15803d; }
.ai-row-tag--students { background: #dbeafe; color: #1d4ed8; }
.ai-suburb-row :deep(em.ai-neu) { font-style: italic; font-weight: 600; color: var(--ink); }
:deep(em.ai-neu) { font-style: italic; font-weight: 600; color: var(--ink); }
.spending-planner {
  opacity: 0;
  animation: ai-slidein 0.4s ease forwards;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fbfaf8;
  overflow: hidden;
}
.spending-planner.open {
  border-color: rgba(31,111,235,0.2);
  background: #fff;
}
.spending-planner-toggle {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.spending-planner-toggle strong {
  display: block;
  color: var(--ink);
  font-size: 0.82rem;
  line-height: 1.3;
}
.spending-planner-toggle > div:first-child span {
  display: block;
  color: var(--ink3);
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.spending-local-total {
  flex-shrink: 0;
  color: var(--blue-d);
  font-size: 0.9rem;
  font-weight: 900;
  text-align: right;
}
.spending-local-total span {
  display: block;
  color: var(--ink3);
  font-size: 0.62rem;
  font-weight: 800;
}
.spending-toggle-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--blue-s);
  color: var(--blue);
  font-weight: 900;
}
.spending-planner-body {
  padding: 0 12px 12px;
}
.spending-simple-row {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto;
  align-items: end;
  gap: 8px;
}
.spending-simple-row label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.spending-simple-row span {
  color: var(--ink2);
  font-size: 0.66rem;
  font-weight: 800;
}
.spending-simple-row input {
  width: 100%;
  border: 1px solid var(--b);
  border-radius: 8px;
  padding: 9px 10px;
  color: var(--ink);
  font: inherit;
  font-size: 0.78rem;
  background: #fff;
}
.spending-simple-row input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(31,111,235,0.12);
}
.spending-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  margin-top: 0;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 800;
}
.spending-result.saving {
  background: #dcfce7;
  color: #166534;
}
.spending-result.extra {
  background: #fee2e2;
  color: #991b1b;
}
.spending-result strong { font-size: 0.86rem; }
.spending-note {
  margin: 8px 0 0;
  color: var(--ink3);
  font-size: 0.7rem;
  line-height: 1.45;
}
.ai-fun-fact {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 4px;
  padding: 9px 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: #78350f;
  line-height: 1.55;
  opacity: 0;
  animation: ai-slidein 0.4s ease forwards;
}
.ai-fun-fact::before {
  content: '★';
  font-size: 0.7rem;
  flex-shrink: 0;
  margin-top: 1px;
  color: #d97706;
}
.ai-summary-muted { font-size: 0.82rem; color: var(--ink3); font-style: italic; }
@keyframes ai-slidein {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Skeleton loader */
.ai-skeleton { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.ai-skel-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ai-skel-col {
  border-radius: 10px;
  padding: 14px 16px;
  background: #f9fafb;
  border: 1px solid var(--b);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ai-skel-bar {
  height: 10px;
  border-radius: 6px;
  width: 85%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ai-shimmer 1.6s ease-in-out infinite;
}
.ai-skel-bar--label { width: 45%; height: 8px; }
.ai-skel-bar--sm    { width: 60%; }
.ai-skel-bar--md    { width: 75%; }
.ai-skel-bar--lg    { width: 90%; }
.ai-skel-bar--full  { width: 100%; }
.ai-skel-divider {
  height: 1px;
  background: var(--b);
  margin: 2px 0;
}
.ai-skel-sentences {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 14px;
}
.ai-skel-fact {
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(90deg, #fef9ec 25%, #fdf3d0 50%, #fef9ec 75%);
  background-size: 200% 100%;
  animation: ai-shimmer 1.6s ease-in-out infinite;
  animation-delay: 0.3s;
}
@keyframes ai-shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
</style>

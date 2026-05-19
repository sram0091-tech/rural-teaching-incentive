<template>
  <div class="page active">
    <div class="page-topbar">
      <div class="page-title">School Explorer</div>
      <div class="page-sub">Explore schools, understand what you'd earn on top of your base salary, and get a feel for life there.</div>
    </div>

    <!-- ── Compare View ── -->
    <div v-if="showCmp" id="cmp-view">
      <div class="back-row" style="padding:20px 28px 0" @click="closeCompare">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15,18 9,12 15,6"/></svg>
        Back to Explorer
      </div>
      <div style="padding:8px 28px 40px;max-width:1060px;margin:0 auto;">
        <div class="cmp-title">Compare Saved Schools</div>
        <div class="cmp-sub-txt">Incentive comparison · green = strongest value</div>
        <div v-if="compareLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>Loading comparison…</span>
        </div>
        <div v-else-if="compareError" class="error-state">{{ compareError }}</div>
        <div v-else class="cmp-wrap">
          <table class="cmp-tbl">
            <thead>
              <tr>
                <th>Factor</th>
                <th v-for="s in compareSchools" :key="s.id">
                  {{ s.name }}<br>
                  <span style="font-weight:400;font-size:0.61rem;color:var(--ink3)">{{ s.suburb }} · {{ s.state_id === '1' ? 'QLD' : 'NSW' }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="cmp-sec"><td :colspan="compareSchools.length + 1">General</td></tr>
              <tr>
                <td>State</td>
                <td v-for="s in compareSchools" :key="s.id">
                  <span class="chip" :class="s.state_id === '1' ? 'cq' : 'cn'">{{ s.state_id === '1' ? 'QLD' : 'NSW' }}</span>
                </td>
              </tr>
              <tr>
                <td>Remoteness</td>
                <td v-for="s in compareSchools" :key="s.id">{{ s.remoteness }}</td>
              </tr>
              <tr class="cmp-sec"><td :colspan="compareSchools.length + 1">Incentives</td></tr>
              <tr>
                <td>Personalised incentive (on top of base salary)</td>
                <td v-for="(s, i) in compareSchools" :key="s.id" :class="bestIncentiveIdx === i ? 'cmp-best' : 'cmp-lo'">
                  <strong v-if="compareIncentiveValue(s) > 0">{{ compareIncentiveLabel(s) }}</strong>
                  <span v-else>—</span>
                  <div v-if="compareIncentiveSubtext(s)" class="cmp-cell-note">{{ compareIncentiveSubtext(s) }}</div>
                </td>
              </tr>
              <tr class="cmp-sec"><td :colspan="compareSchools.length + 1">Job Site</td></tr>
              <tr>
                <td>Link to job site</td>
                <td v-for="s in compareSchools" :key="s.id">
                  <a :href="cmpApplyUrl(s)" target="_blank" rel="noopener noreferrer" class="cmp-apply-btn">
                    Link to job site →
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="cmp-breakdown-section">
            <div class="cmp-sec-row">Incentive Breakdown</div>
            <div
              class="cmp-breakdown-grid"
              :style="{ gridTemplateColumns: `repeat(${compareSchools.length}, 1fr)` }"
            >
              <div v-for="s in compareSchools" :key="s.id" class="cmp-breakdown-col">
                <div class="cmp-breakdown-school-name">{{ s.name }}</div>
                <IncentiveBreakdownSummary :school="s" :profile="activeIncentiveProfile" />
              </div>
            </div>
          </div>
        </div>
        <div class="cmp-lifestyle-row">
          <p>Ready to explore lifestyle and community feel?</p>
          <button class="cmp-lifestyle-btn" @click="$emit('navigate', 'insights')">Go to Neighbourhood →</button>
        </div>
      </div>
    </div>

    <!-- ── Entry ── -->
    <div v-if="!showCmp && view === 'entry'" class="exp-entry anim-fadeup">

      <!-- Step 1 -->
      <div class="explorer-flow">
        <div class="flow-node"></div>
        <div class="esh-label">Personalise your view</div>
        <div class="esh-hint">We'll show what you'd actually earn at every school</div>

        <div class="explorer-profile-card" :class="{ collapsed: profileCollapsed && activeIncentiveProfile?.ready }">
          <div class="explorer-profile-inner">
            <button
              v-if="profileCollapsed && activeIncentiveProfile?.ready"
              class="profile-summary-bar"
              type="button"
              @click="profileCollapsed = false"
            >
              <span class="profile-summary-title">Incentive preferences</span>
              <span class="profile-summary-divider">·</span>
              <span class="profile-summary-copy">{{ explorerProfileSummary }}</span>
              <span class="profile-summary-edit">Edit</span>
            </button>
            <template v-else>
              <button
                v-if="activeIncentiveProfile?.ready"
                class="profile-collapse-btn"
                type="button"
                @click="profileCollapsed = true"
              >
                Collapse ↑
              </button>
              <EligibilityChecker
                compact
                show-dependants
                :initial-profile="activeIncentiveProfile"
                :show-result="false"
                title="Incentive preferences"
                subtitle="Tell us your experience and whether you have dependants — we'll show exactly what you'd earn on top of your salary at every school."
                action-label="Apply preferences"
                @profile-submit="applyExplorerProfile"
              />
              <div v-if="activeIncentiveProfile?.ready" class="profile-applied">
                ✓ Personalised estimates applied · {{ explorerProfileSummary }}
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="explorer-flow">
        <div class="flow-node"></div>
        <div class="esh-label">Explore schools on the map</div>

        <div class="map-flow-trail">
          <span class="mft-step">Explore the map</span>
          <span class="mft-arrow">→</span>
          <span class="mft-step">See incentive details</span>
          <span class="mft-arrow">→</span>
          <span class="mft-step">Explore Neighbourhood</span>
        </div>

        <!-- Map section — search is first in DOM so on mobile it flows above the map naturally -->
        <div class="exp-map-section">
          <!-- Search: absolute overlay on desktop, flows above map on mobile -->
          <div class="map-search-overlay" @keydown.escape="showMapDropdown = false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="color:rgba(0,0,0,0.45);flex-shrink:0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              v-model="mapSearchQ"
              class="map-search-input"
              placeholder="Search a school or town…"
              autocomplete="off"
              @focus="showMapDropdown = true"
              @blur="onMapSearchBlur"
              @input="onMapSearchInput"
            />
            <button v-if="mapSearchQ" class="map-search-clear" @mousedown.prevent="clearMapSearch" aria-label="Clear">✕</button>
            <Transition name="msd">
              <div v-if="showMapDropdown && mapSearchResults.length" class="map-search-dropdown">
                <div
                  v-for="s in mapSearchResults"
                  :key="s.id"
                  class="msd-item"
                  @mousedown.prevent="selectMapSchool(s)"
                  @mouseover="glitterMarker(s)"
                  @mouseleave="unglitterMarker(s)"
                >
                  <div class="msd-name">{{ s.name }}</div>
                  <div class="msd-meta">{{ s.suburb }} · {{ s.state_id === '1' ? 'QLD' : 'NSW' }} · {{ s.remoteness }}</div>
                </div>
              </div>
            </Transition>
          </div>

          <div ref="mapEl" class="exp-map-container"></div>

          <!-- Personalised vs max status chip -->
          <div class="map-status-chip" :class="activeIncentiveProfile?.ready ? 'msc-personalised' : 'msc-max'">
            <span v-if="activeIncentiveProfile?.ready">✓ Showing personalised estimates</span>
            <span v-else>Showing maximum packages</span>
          </div>

          <div class="map-legend">
            <div class="ml-title">Incentive amount</div>
            <div class="ml-gradient-row">
              <div class="ml-gradient qld-grad"></div>
              <div class="ml-grad-labels"><span>Low</span><span>High</span></div>
              <div class="ml-grad-state">QLD</div>
            </div>
            <div class="ml-gradient-row" style="margin-top:6px">
              <div class="ml-gradient nsw-grad"></div>
              <div class="ml-grad-labels"><span>Low</span><span>High</span></div>
              <div class="ml-grad-state">NSW</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3 — Guide card -->
      <div class="explorer-flow explorer-flow--last">
        <div class="flow-node"></div>
        <div class="esh-label">Need a hand?</div>
        <div class="esh-hint">3 quick questions — we'll filter and sort schools to match what you care about most</div>

      <div class="guide-card" @click="startGuide">
        <div class="gc-icon-wrap">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
        </div>
        <div class="gc-body">
          <div class="gc-title">Not sure where to start?</div>
          <div class="gc-outcomes">
            <span class="gc-outcome-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Filtered to your state &amp; remoteness
            </span>
            <span class="gc-outcome-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Sorted by your top priority
            </span>
            <span class="gc-outcome-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Best matches surfaced first
            </span>
          </div>
        </div>
        <button class="gc-btn" type="button" @click.stop="startGuide">Find my match →</button>
      </div>

      </div><!-- /explorer-flow--last -->

    </div><!-- /exp-entry -->

    <!-- ── Search Path ── -->
    <div v-else-if="!showCmp && view === 'search'" class="search-path anim-fadeup">
      <div class="back-row" @click="view = 'entry'">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15,18 9,12 15,6"/></svg>
        Back to overview
      </div>

      <div v-if="!fromMap" class="srch-row">
        <div class="srch-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--ink3);flex-shrink:0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input ref="searchInput" v-model="searchQ" placeholder="Search by school name or suburb…" @input="onSearchInput" />
        </div>
        <button class="filter-tog" :class="{ open: filterOpen }" @click="filterOpen = !filterOpen">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filters
          <span v-if="filterBadgeCount > 0" class="f-badge">{{ filterBadgeCount }}</span>
        </button>
      </div>

      <Transition name="fp-slide">
        <div v-if="!fromMap && filterOpen" class="filter-panel open">
          <div class="fp-inner">
            <div class="fp-sec">
              <div class="fp-lbl">State</div>
              <div class="fp-tiles">
                <div v-for="s in stateOpts" :key="s.v" class="fp-tile"
                  :class="[fState === s.v ? 'sel-' + s.v : '', { selected: fState === s.v }]"
                  @click="onSelState(s.v)">
                  <span class="fp-tile-icon">{{ s.icon }}</span>{{ s.label }}
                </div>
              </div>
            </div>
            <div class="fp-sec">
              <div class="fp-lbl">Employment</div>
              <div class="fp-tiles">
                <div v-for="e in empOpts" :key="e.v" class="fp-tile"
                  :class="[fEmp === e.v ? 'sel-' + e.v : '', { selected: fEmp === e.v }]"
                  @click="onSelEmp(e.v)">
                  <span class="fp-tile-icon">{{ e.icon }}</span>{{ e.label }}
                </div>
              </div>
            </div>
            <div class="fp-sec">
              <div class="fp-lbl">Remoteness <span style="font-weight:400;color:var(--ink3);font-size:0.6rem;text-transform:none;letter-spacing:0">· more remote = higher incentive</span></div>
              <div class="fp-tiles">
                <div v-for="r in remotenessOpts" :key="r.v" class="fp-tile"
                  :class="[fRem.has(r.v) ? 'sel-rem' : '', { selected: fRem.has(r.v) }]"
                  @click="onToggleRem(r.v)">
                  <span class="fp-tile-icon">{{ r.icon }}</span>{{ r.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <div v-if="!fromMap" class="sort-row">
        <span class="sort-lbl">Sort:</span>
        <div v-for="s in sortOpts" :key="s.v" class="sort-pill"
          :class="{ active: fSort === s.v }"
          @click="onSetSort(s.v)">
          <span class="sort-icon" v-html="s.svg"></span>{{ s.label }}
        </div>
      </div>

      <div class="results-zone">
        <div v-if="searchLoading" class="skel-list">
          <div v-for="i in 5" :key="i" class="skel-row">
            <div class="skel-left">
              <div class="skel-line skel-name"></div>
              <div class="skel-line skel-meta"></div>
            </div>
            <div class="skel-right">
              <div class="skel-line skel-amt"></div>
              <div class="skel-line skel-sub"></div>
            </div>
          </div>
        </div>
        <div v-else-if="searchError" class="error-state">{{ searchError }}</div>
        <template v-else-if="searchListItems.length">
          <div v-if="!fromMap" class="r-meta">
            <strong>{{ searchTotal }}</strong> school{{ searchTotal !== 1 ? 's' : '' }} · sorted by {{ sortLabel }}
          </div>
          <div class="school-list">
            <SchoolRow
              v-for="s in visibleSearchListItems"
              :key="s.id"
              :school="s"
              :is-open="openRow === String(s.id)"
              :in-cmp="isCmp(s.id)"
              :sort="fSort"
              :emp-type="fEmp"
              :incentive-profile="activeIncentiveProfile"
              @toggle="handleToggleRow"
              @toggle-cmp="handleToggleCmp"
              @view-lifestyle="handleViewLifestyle"
            />
          </div>
          <AppPagination v-if="!openRow" :total="searchTotal" :page="currentPage" @change="goPage" />
        </template>
        <div v-else class="search-empty-state">
          <div class="ses-title">{{ hasActiveSearchCriteria ? 'No schools match' : 'Search for a school' }}</div>
          <div class="ses-sub">{{ hasActiveSearchCriteria ? 'Try adjusting your preferences, filters, or search term.' : 'Type a name or suburb, use filters, or add incentive preferences.' }}</div>
        </div>
      </div>
    </div>

    <!-- ── Guided Path ── -->
    <div v-else-if="!showCmp && view === 'guide'" class="guide-path anim-fadeup">
      <div class="guide-inner">
        <div class="back-row" @click="view = 'entry'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15,18 9,12 15,6"/></svg>
          Back to overview
        </div>

        <div class="guide-progress">
          <div class="gp-steps">
            <template v-for="(lbl, i) in ['State', 'Distance', 'Priority', 'Results']" :key="i">
              <div class="gp-step" :class="{ done: guideStep > i, active: guideStep === i }">
                <div class="gp-step-circle">
                  <span v-if="guideStep > i">✓</span>
                  <span v-else>{{ i + 1 }}</span>
                </div>
                <div class="gp-step-label">{{ lbl }}</div>
              </div>
              <div v-if="i < 3" class="gp-step-line" :class="{ done: guideStep > i }"></div>
            </template>
          </div>
        </div>

        <div class="guide-q-wrap">
          <Transition name="guide-slide" mode="out-in">
            <div v-if="guideStep === 0" class="guide-q" key="q1">
              <div class="gq-label">Step 1 of 3</div>
              <div class="gq-text">Which state are you considering?</div>
              <div class="gq-opts">
                <div v-for="opt in q1opts" :key="opt.title" class="gq-opt" :class="{ sel: gqAnswers[0] === opt.title }" @click="gqSel(0, opt.title)">
                  <div class="gqo-state-img"><img :src="opt.flag" :alt="opt.title" /></div>
                  <div><div class="gqo-title">{{ opt.title }}</div><div class="gqo-sub">{{ opt.sub }}</div></div>
                  <span v-if="gqAnswers[0] === opt.title" class="gqo-check">✓</span>
                </div>
              </div>
              <div class="guide-footer">
                <span class="gf-skip" @click="gqNext(0)">Skip</span>
                <button class="gf-next" :class="{ ready: gqAnswers[0] !== null }" @click="gqNext(0)">Next →</button>
              </div>
            </div>
            <div v-else-if="guideStep === 1" class="guide-q" key="q2">
              <div class="gq-label">Step 2 of 3</div>
              <div class="gq-text">How remote are you open to going?</div>
              <div class="gq-opts">
                <div v-for="opt in q2opts" :key="opt.title" class="gq-opt" :class="{ sel: gqAnswers[1] === opt.title }" @click="gqSel(1, opt.title)">
                  <span class="gqo-emoji">{{ opt.emoji }}</span>
                  <div><div class="gqo-title">{{ opt.title }}</div><div class="gqo-sub">{{ opt.sub }}</div></div>
                  <span v-if="gqAnswers[1] === opt.title" class="gqo-check">✓</span>
                </div>
              </div>
              <div class="guide-footer">
                <span class="gf-skip" @click="gqNext(1)">Skip</span>
                <button class="gf-next" :class="{ ready: gqAnswers[1] !== null }" @click="gqNext(1)">Next →</button>
              </div>
            </div>
            <div v-else-if="guideStep === 2" class="guide-q" key="q3">
              <div class="gq-label">Step 3 of 3</div>
              <div class="gq-text">What matters most to you?</div>
              <div class="gq-opts">
                <div v-for="opt in q3opts" :key="opt.title" class="gq-opt" :class="{ sel: gqAnswers[2] === opt.title }" @click="gqSel(2, opt.title)">
                  <span class="gqo-icon" v-html="opt.svg"></span>
                  <div><div class="gqo-title">{{ opt.title }}</div><div class="gqo-sub">{{ opt.sub }}</div></div>
                  <span v-if="gqAnswers[2] === opt.title" class="gqo-check">✓</span>
                </div>
              </div>
              <div class="guide-footer">
                <span class="gf-skip" @click="gqFinish">Skip</span>
                <button class="gf-next" :class="{ ready: gqAnswers[2] !== null }" @click="gqFinish">Show my schools →</button>
              </div>
            </div>
            <div v-else-if="guideStep === 3" class="guide-q guide-q--results" key="results">
              <div class="gq-label">
                {{ guideLoading ? 'Loading…' : guideTotal + ' school' + (guideTotal !== 1 ? 's' : '') + ' matched' }}
              </div>
              <div v-if="guideLoading" class="skel-list">
                <div v-for="i in 4" :key="i" class="skel-row">
                  <div class="skel-left">
                    <div class="skel-line skel-name"></div>
                    <div class="skel-line skel-meta"></div>
                  </div>
                  <div class="skel-right">
                    <div class="skel-line skel-amt"></div>
                    <div class="skel-line skel-sub"></div>
                  </div>
                </div>
              </div>
              <div v-else-if="guideError" class="error-state">{{ guideError }}</div>
              <template v-else-if="guideListItems.length">
                <div class="r-meta" style="margin-top:4px">
                  <strong>{{ guideTotal }}</strong> school{{ guideTotal !== 1 ? 's' : '' }} matched · sorted by {{ sortLabel }}
                </div>
                <div class="school-list">
                  <SchoolRow
                    v-for="s in visibleGuideListItems"
                    :key="s.id"
                    :school="s"
                    :is-open="openRow === String(s.id)"
                    :in-cmp="isCmp(s.id)"
                  :sort="fSort"
                  :emp-type="fEmp"
                  :incentive-profile="activeIncentiveProfile"
                  @toggle="handleToggleRow"
                  @toggle-cmp="handleToggleCmp"
                  @view-lifestyle="handleViewLifestyle"
                  />
                </div>
                <AppPagination v-if="!openRow" :total="guideTotal" :page="guidePage" @change="goGuidePage" />
              </template>
              <div v-else class="search-empty-state">
                <div class="ses-title">No schools match</div>
                <div class="ses-sub">Try different answers.</div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <CompareTray
      :cmp-list="[...cmpList]"
      @remove="toggleCmp"
      @clear="clearCompare"
      @open-compare="openCompare"
    />

    <Transition name="toast">
      <button v-if="showBackTop" class="back-top-btn" @click="$el.ownerDocument.defaultView.scrollTo({top:0,behavior:'smooth'})" aria-label="Back to top">↑</button>
    </Transition>

    <Transition name="toast">
      <div v-if="toastVisible" class="cmp-toast">✓ {{ toastMsg }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useExplorer } from '../composables/useExplorer.js'
import { fetchExplorerLocations, fetchIncentiveEstimate } from '../api/explorerApi.js'
import { normalizeLocationList } from '../utils/locationFields.js'
import SchoolRow from '../components/SchoolRow.vue'
import AppPagination from '../components/AppPagination.vue'
import CompareTray from '../components/CompareTray.vue'
import EligibilityChecker from '../components/incentives/EligibilityChecker.vue'
import IncentiveBreakdownSummary from '../components/incentives/IncentiveBreakdownSummary.vue'
import { usePersonalisedIncentives } from '../composables/usePersonalisedIncentives.js'
import { yearsExperienceBand, estimateTotalFromResult } from '../utils/incentiveEstimate.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const emit = defineEmits(['navigate', 'view-lifestyle'])

const {
  PAGE_SIZE,
  stateOpts, empOpts, remotenessOpts,
  fState, fEmp, fRem, fSort,
  cmpList, openRow, showCmp,
  currentPage, guidePage,
  filterBadgeCount, remSize,
  selState, selEmp, toggleRem, setSort,
  loadSearchLocations, loadGuideLocations,
  searchListItems, searchTotal, searchLoading, searchError,
  guideListItems, guideTotal, guideLoading, guideError,
  compareSchools, compareLoading, compareError,
  toggleCmp, clearCompare, isCmp,
  toggleRow, viewLifestyle,
  heroTop, launchView, launchSort, launchRem,
  searchSchoolsForDropdown,
} = useExplorer()

const view        = ref('entry')
const filterOpen  = ref(false)
const fromMap     = ref(false)
const searchQ     = ref('')
const searchInput = ref(null)
const mapEl       = ref(null)
const profileCollapsed = ref(false)
let mapInstance   = null
let qldLayer      = null
let nswLayer      = null
let pulseMarker   = null
let plotGen       = 0   // incremented on every plotMarkers call; stale setTimeout callbacks check this

// Map search
const mapSearchQ       = ref('')
const showMapDropdown  = ref(false)
const mapSearchResults = ref([])
const mapSearchLoading = ref(false)
let   mapSearchTimer   = null
const markerMap        = new Map() // schoolId → Leaflet circleMarker

async function runMapSearch(q) {
  const t = (q || '').trim()
  if (!t) { mapSearchResults.value = []; return }
  mapSearchLoading.value = true
  try {
    mapSearchResults.value = await searchSchoolsForDropdown(t)
  } finally {
    mapSearchLoading.value = false
  }
}

function onMapSearchInput() {
  clearTimeout(mapSearchTimer)
  showMapDropdown.value = true
  if (!mapSearchQ.value.trim()) { mapSearchResults.value = []; return }
  mapSearchTimer = setTimeout(() => runMapSearch(mapSearchQ.value), 220)
}

function onMapSearchBlur() {
  setTimeout(() => { showMapDropdown.value = false }, 150)
}

function clearMapSearch() {
  mapSearchQ.value = ''
  mapSearchResults.value = []
  showMapDropdown.value = false
}

function glitterMarker(s) {
  const key = String(s.school_id || s.id)
  const marker = markerMap.get(key)
  if (!marker) return
  marker.setRadius(12)
  marker.setStyle({ weight: 3, color: '#3b82f6', fillOpacity: 1 })
  marker.bringToFront()
}

function unglitterMarker(s) {
  const key = String(s.school_id || s.id)
  const marker = markerMap.get(key)
  if (!marker) return
  marker.setRadius(7)
  marker.setStyle({ weight: 1.5, color: '#fff', fillOpacity: 0.92 })
}

function selectMapSchool(school) {
  showMapDropdown.value = false
  mapSearchQ.value = school.name
  if (!mapInstance || !school.lat || !school.lng) return

  if (pulseMarker) { mapInstance.removeLayer(pulseMarker); pulseMarker = null }

  mapInstance.flyTo([school.lat, school.lng], 10, { duration: 0.8, easeLinearity: 0.4 })

  pulseMarker = L.marker([school.lat, school.lng], {
    icon: L.divIcon({ className: 'pulse-ring-icon', iconSize: [48, 48], iconAnchor: [24, 24] }),
    interactive: false,
    zIndexOffset: 1000,
  }).addTo(mapInstance)

  setTimeout(() => {
    if (pulseMarker) { mapInstance.removeLayer(pulseMarker); pulseMarker = null }
  }, 3200)

  const isQld = school.state_id === '1'
  const personalised = getPersonalisedIncentive(school.school_id || school.id)
  const incValue = personalised ? personalised.total : (school.annual_incentive || 0)
  const inc = Math.round(incValue).toLocaleString()
  const incLabel = personalised ? 'personalised estimate' : 'incentive package'
  const color = incentiveColor(incValue, isQld)
  const schoolId = school.school_id || school.id
  const escSub = (school.suburb || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')
  const escName = (school.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')

  setTimeout(() => {
    L.popup({ className: 'school-popup', maxWidth: 260, closeButton: true, autoPan: true })
      .setLatLng([school.lat, school.lng])
      .setContent(`
        <div class="sp-wrap">
          <div class="sp-tag ${isQld ? 'sp-qld' : 'sp-nsw'}">${isQld ? 'QLD' : 'NSW'} · ${school.remoteness || ''}</div>
          <div class="sp-name">${escName}</div>
          <div class="sp-suburb">${school.suburb || ''}</div>
          <div class="sp-inc"><span class="sp-inc-num" style="color:${color}">$${inc}</span><span class="sp-inc-lbl">/yr ${incLabel}</span></div>
          <button class="sp-cta" onclick="window.__viewSchoolDetail('${schoolId}', '${escSub}')">View details →</button>
        </div>`)
      .openOn(mapInstance)
  }, 420)
}

const mapSchools = ref([])
const {
  getPersonalisedIncentive,
  estimatesBySchool,
  setPersonalisedIncentive,
  activeProfile,
  setActiveProfile,
} = usePersonalisedIncentives()

const activeIncentiveProfile = activeProfile

function loadSearchWithProfile(text = searchQ.value) {
  return loadSearchLocations(text, activeIncentiveProfile.value?.ready ? activeIncentiveProfile.value : null)
}

function loadGuideWithProfile() {
  return loadGuideLocations(activeIncentiveProfile.value?.ready ? activeIncentiveProfile.value : null)
}

const explorerProfileSummary = computed(() => {
  const p = activeIncentiveProfile.value
  if (!p?.ready) return 'No preferences applied'
  const yrs = Number(p.yearsExperience)
  const parts = [
    `${Number.isNaN(yrs) ? 0 : yrs} year${yrs === 1 ? '' : 's'} experience`,
    p.hasDependants ? 'with dependants' : 'no dependants',
  ]
  return parts.join(' · ')
})

async function batchLoadEstimates(schools) {
  const profile = activeIncentiveProfile.value
  if (!profile?.ready || !schools.length) return
  const years = Number(profile.yearsExperience || 0)
  await Promise.allSettled(
    schools.map(async (school) => {
      const schoolId = school.school_id || school.id
      if (!schoolId) return
      const isQld = school.state_id === '1'
      try {
        const result = await fetchIncentiveEstimate({
          school_id: schoolId,
          employment_type: isQld ? 'temporary' : 'permanent',
          years_experience: years,
          years_of_experience: years,
          experience_years: years,
          years_experience_band: yearsExperienceBand(years),
          has_dependants: isQld ? Boolean(profile.hasDependants) : false,
        })
        const total = estimateTotalFromResult(result, isQld, Boolean(profile.hasDependants))
        if (total > 0 && activeIncentiveProfile.value === profile) {
          setPersonalisedIncentive(schoolId, { total, profile: { ...profile } })
        }
      } catch {
        // ignore individual failures
      }
    })
  )
}

async function applyExplorerProfile(profile) {
  Object.keys(estimatesBySchool).forEach(key => delete estimatesBySchool[key])
  setActiveProfile({ ...profile })
  profileCollapsed.value = true
  currentPage.value = 1
  guidePage.value = 1
  openRow.value = null
  const loads = [loadMapSchools()]
  if (view.value === 'guide') loads.push(loadGuideWithProfile())
  else if (view.value === 'search') loads.push(loadSearchWithProfile())
  await Promise.all(loads)
  const listSchools = view.value === 'guide' ? guideListItems.value : searchListItems.value
  const topMapSchools = [...mapSchools.value]
    .sort((a, b) => (b.annual_incentive || 0) - (a.annual_incentive || 0))
    .slice(0, 20)
  const uniqueSchools = [...new Map(
    [...listSchools, ...topMapSchools].map(s => [String(s.school_id || s.id), s])
  ).values()]
  batchLoadEstimates(uniqueSchools)
}

function employeeTypeForApi(value) {
  return {
    perm: 'perm',
    temp: 'temp',
    permanent: 'perm',
    temporary: 'temp',
    public_service_officer: 'public_service_officer',
    nsbts: 'nsbts',
  }[String(value || '').toLowerCase()] || value
}

function mapProfileParams(state) {
  const profile = activeIncentiveProfile.value
  if (!profile?.ready) return {}
  const years = Number(profile.yearsExperience || 0)
  if (state === 'qld') {
    return {
      employee_type: 'temp',
      has_dependants: Boolean(profile.hasDependants),
    }
  }
  if (state === 'nsw') {
    return {
      employee_type: 'perm',
      years_experience: years,
      years_of_experience: years,
      experience_years: years,
      years_experience_band: yearsExperienceBand(years),
    }
  }
  return {}
}


async function loadMapSchools() {
  try {
    const responses = await Promise.all(['qld', 'nsw'].map((state) =>
      fetchExplorerLocations({ page: 1, page_size: 200, state, sort: 'name' })
    ))
    mapSchools.value = responses.flatMap((r) => normalizeLocationList(r.items)).filter(s => s.annual_incentive > 0)
  } catch (e) {
    console.warn('loadMapSchools failed:', e)
    mapSchools.value = heroTop.value.filter(s => s.annual_incentive > 0)
  }
}

const topIncentive = computed(() => {
  const src = mapSchools.value.length ? mapSchools.value : heroTop.value
  if (!src.length) return '—'
  const max = Math.max(...src.map(s => s.annual_incentive || 0))
  return max > 0 ? '$' + (max / 1000).toFixed(0) + 'k+' : '—'
})

const sortLabel = computed(() =>
  ({ inc: 'highest incentive first', hc: 'best healthcare first', dist: 'closest to nearest city first', az: 'A → Z by name' }[fSort.value] || 'highest incentive first')
)

const hasActiveSearchCriteria = computed(() =>
  Boolean(searchQ.value || remSize.value > 0 || fState.value !== 'both' || activeIncentiveProfile.value?.ready)
)

const bestIncentiveIdx = computed(() => {
  if (!compareSchools.value.length) return -1
  const vals = compareSchools.value.map(s => compareIncentiveValue(s))
  return vals.indexOf(Math.max(...vals))
})

function comparePersonalisedEstimate(school) {
  return getPersonalisedIncentive(school) || getPersonalisedIncentive(school?.school_id) || getPersonalisedIncentive(school?.id)
}

function compareIncentiveValue(school) {
  const personalised = comparePersonalisedEstimate(school)
  if (personalised) return Number(personalised.total || 0)
  return Number(school?.annual_incentive || 0)
}

function compareIncentiveLabel(school) {
  const value = compareIncentiveValue(school)
  if (value <= 0) return '—'
  const amount = `$${Math.round(value).toLocaleString()}/yr`
  return comparePersonalisedEstimate(school) ? amount : `Up to ${amount}`
}

function compareIncentiveSubtext(school) {
  const personalised = comparePersonalisedEstimate(school)
  return personalised ? 'personalised incentive' : 'max package until personalised'
}

function cmpApplyUrl(school) {
  return school?.state_id === '1'
    ? 'https://smartjobs.qld.gov.au/jobtools/jncustomsearch.searchResults%3Fin_organid%3D14904%26in_jobDate%3DAll%26in_multi01_id%3D1108%26in_skills%3Dteacher'
    : 'https://education.nsw.gov.au/teach-nsw/find-teaching-jobs/jobfeed#Rural0'
}

const visibleSearchListItems = computed(() => {
  if (!openRow.value) return searchListItems.value
  return searchListItems.value.filter(s => String(s.id) === openRow.value)
})

const visibleGuideListItems = computed(() => {
  if (!openRow.value) return guideListItems.value
  return guideListItems.value.filter(s => String(s.id) === openRow.value)
})

function onSelState(v)  { selState(v);  openRow.value = null; loadSearchWithProfile() }
function onSelEmp(v)    { selEmp(v);    openRow.value = null; loadSearchWithProfile() }
function onToggleRem(v) { toggleRem(v); openRow.value = null; loadSearchWithProfile() }
function onSetSort(v)   { setSort(v);   openRow.value = null; loadSearchWithProfile() }

let searchDebounce = null
function onSearchInput() {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    currentPage.value = 1
    openRow.value = null
    loadSearchWithProfile()
  }, 300)
}

function goPage(p) {
  currentPage.value = p
  openRow.value = null
  loadSearchWithProfile()
}
function goGuidePage(p) {
  guidePage.value = p
  openRow.value = null
  loadGuideWithProfile()
}

function openCompare()  { if (cmpList.length >= 2) emit('navigate', 'insights') }
function closeCompare() { showCmp.value = false }

function handleToggleRow(id) { toggleRow(id) }

const toastMsg = ref('')
const toastVisible = ref(false)
let toastTimer = null

function handleToggleCmp(id) {
  const wasIn = isCmp(id)
  toggleCmp(id)
  if (!wasIn) {
    const school = [...searchListItems.value, ...guideListItems.value].find(s => String(s.id) === String(id))
    toastMsg.value = school ? `${school.name} added to compare` : 'Added to compare'
    toastVisible.value = true
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toastVisible.value = false }, 2500)
  }
}

async function handleViewLifestyle(id) {
  const dest = await viewLifestyle(id)
  if (dest) emit('navigate', dest)
}

function resetFilters() {
  selState('both')
  ;[...fRem].forEach(v => toggleRem(v))
  setSort('inc')
}

watch(view, (v) => {
  openRow.value = null
  if (v !== 'search') fromMap.value = false
  if (v === 'search') {
    resetFilters()
    if (launchRem.value)  { toggleRem(launchRem.value);   launchRem.value  = null }
    if (launchSort.value) { setSort(launchSort.value);    launchSort.value = null }
    nextTick(() => { searchInput.value?.focus(); loadSearchWithProfile() })
  }
  if (v === 'entry') {
    mapSearchQ.value = ''
    mapSearchResults.value = []
    showMapDropdown.value = false
    nextTick(() => {
      if (mapInstance) { mapInstance.remove(); mapInstance = null; qldLayer = null; nswLayer = null }
      initMap()
      plotMarkers()
    })
  }
})

const showBackTop = ref(false)
function onScroll() {
  showBackTop.value = window.scrollY > 400
}

onMounted(async () => {
  if (launchView.value) {
    view.value = launchView.value
    launchView.value = null
    loadSearchWithProfile('')
  }
  nextTick(() => initMap())
  await loadMapSchools()
  if (activeIncentiveProfile.value?.ready) {
    profileCollapsed.value = true
    const topMapSchools = [...mapSchools.value]
      .sort((a, b) => (b.annual_incentive || 0) - (a.annual_incentive || 0))
      .slice(0, 20)
    batchLoadEstimates(topMapSchools)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  if (pulseMarker && mapInstance) { mapInstance.removeLayer(pulseMarker); pulseMarker = null }
  if (mapInstance) { mapInstance.remove(); mapInstance = null; qldLayer = null; nswLayer = null }
  delete window.__mapSchoolSearch
  delete window.__viewSchoolDetail
  window.removeEventListener('scroll', onScroll)
})

watch(mapSchools, (v) => { if (v.length && mapInstance) { plotMarkers() } })
watch(activeIncentiveProfile, () => { if (mapInstance) plotMarkers() }, { deep: true })
watch(estimatesBySchool, () => { if (mapInstance) plotMarkers() }, { deep: true })

const INC_MIN = 4232, INC_MAX = 30000
function lerp(a, b, t) { return a + (b - a) * t }
function hexToRgb(h) { return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)] }
function rgbToHex(r,g,b) { return '#' + [r,g,b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('') }
function lerpColor(h1, h2, t) {
  const [r1,g1,b1] = hexToRgb(h1), [r2,g2,b2] = hexToRgb(h2)
  return rgbToHex(lerp(r1,r2,t), lerp(g1,g2,t), lerp(b1,b2,t))
}
function incentiveColor(inc, isQld) {
  const t = Math.max(0, Math.min(1, (inc - INC_MIN) / (INC_MAX - INC_MIN)))
  return isQld ? lerpColor('#fbbf24', '#92400e', t) : lerpColor('#4ade80', '#14532d', t)
}

function initMap() {
  if (!mapEl.value || mapInstance) return
  mapInstance = L.map(mapEl.value, { center: [-27, 145], zoom: 5, zoomControl: true, scrollWheelZoom: false })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors · © CARTO',
    subdomains: 'abcd', maxZoom: 19,
  }).addTo(mapInstance)

  qldLayer = L.layerGroup().addTo(mapInstance)
  nswLayer = L.layerGroup().addTo(mapInstance)

  // State filter control
  const stateCtrl = L.control({ position: 'topleft' })
  stateCtrl.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-state-ctrl')
    div.innerHTML = `
      <button class="msc-btn msc-active" data-s="all">All</button>
      <button class="msc-btn" data-s="qld">QLD</button>
      <button class="msc-btn" data-s="nsw">NSW</button>
    `
    L.DomEvent.on(div, 'click', (e) => {
      const btn = e.target.closest('[data-s]')
      if (!btn) return
      div.querySelectorAll('.msc-btn').forEach(b => b.classList.toggle('msc-active', b === btn))
      const s = btn.dataset.s
      if (s === 'all') { mapInstance.addLayer(qldLayer); mapInstance.addLayer(nswLayer) }
      else if (s === 'qld') { mapInstance.addLayer(qldLayer); mapInstance.removeLayer(nswLayer) }
      else { mapInstance.removeLayer(qldLayer); mapInstance.addLayer(nswLayer) }
    })
    L.DomEvent.disableClickPropagation(div)
    return div
  }
  stateCtrl.addTo(mapInstance)

  window.__mapSchoolSearch = (suburb) => {
    view.value = 'search'
    searchQ.value = suburb
    loadSearchWithProfile(suburb)
    mapInstance?.closePopup()
  }

  window.__viewSchoolDetail = (schoolId, suburb) => {
    fromMap.value = true
    view.value = 'search'
    searchQ.value = suburb
    nextTick(() => {
      loadSearchWithProfile(suburb).then(() => {
        openRow.value = String(schoolId)
      })
    })
    mapInstance?.closePopup()
  }

  plotMarkers()
}

function buildPopupHtml(s, inc, color, label, escSub) {
  const isQld = s.state_id === '1'
  const sid   = s.school_id || s.id
  return `
    <div class="sp-wrap">
      <div class="sp-tag ${isQld ? 'sp-qld' : 'sp-nsw'}">${isQld ? 'QLD' : 'NSW'} · ${s.remoteness || ''}</div>
      <div class="sp-name">${s.name}</div>
      <div class="sp-suburb">${s.suburb || ''}</div>
      <div class="sp-inc"><span class="sp-inc-num" style="color:${color}">$${inc}</span><span class="sp-inc-lbl">/yr ${label}</span></div>
      <button class="sp-cta" onclick="window.__viewSchoolDetail('${sid}', '${escSub}')">View details →</button>
    </div>`
}

function plotMarkers() {
  if (!mapInstance || !qldLayer || !nswLayer) return
  qldLayer.clearLayers()
  nswLayer.clearLayers()
  markerMap.clear()

  const gen = ++plotGen  // any stale setTimeout from a previous call will see gen !== plotGen and bail

  const schools = mapSchools.value.length ? mapSchools.value : heroTop.value
  const profile = activeIncentiveProfile.value
  const profileReady = profile?.ready

  schools.forEach((s, i) => {
    if (!s.lat || !s.lng) return
    const isQld      = s.state_id === '1'
    const personalised = getPersonalisedIncentive(s.school_id || s.id)
    const rowPersonalised = profileReady && Number(s.personalised_annual_total || 0) > 0
    if (personalised && personalised.total === 0) return

    const incValue = personalised ? personalised.total : (rowPersonalised ? s.personalised_annual_total : (s.annual_incentive || 0))
    const color    = incentiveColor(incValue, isQld)
    const layer    = isQld ? qldLayer : nswLayer
    const inc      = Math.round(incValue).toLocaleString()
    const incLabel = personalised || rowPersonalised ? 'personalised estimate' : 'incentive package'
    const escSub   = (s.suburb || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')

    const tooltip = `
      <div style="font-family:'DM Sans',sans-serif;min-width:160px">
        <div style="font-weight:700;font-size:0.8rem;margin-bottom:2px">${s.name}</div>
        <div style="font-size:0.7rem;color:#94a3b8;margin-bottom:5px">${s.suburb} · ${isQld ? 'QLD' : 'NSW'} · ${s.remoteness}</div>
        <div style="font-size:0.88rem;font-weight:800;color:${color}">$${inc}/yr <span style="font-weight:500;font-size:0.75rem;opacity:0.85">${incLabel}</span></div>
      </div>`

    setTimeout(() => {
      if (plotGen !== gen) return  // stale — a newer plotMarkers already ran, discard this marker

      const marker = L.circleMarker([s.lat, s.lng], {
        radius: 7, fillColor: color, color: '#fff', weight: 1.5, opacity: 0, fillOpacity: 0,
      }).addTo(layer)

      markerMap.set(String(s.school_id || s.id), marker)

      let op = 0
      const fade = setInterval(() => {
        op += 0.12
        marker.setStyle({ opacity: Math.min(op, 1), fillOpacity: Math.min(op * 0.92, 0.92) })
        if (op >= 1) clearInterval(fade)
      }, 25)

      marker.bindTooltip(tooltip, { permanent: false, direction: 'top', offset: [0, -10], opacity: 1, className: 'school-tooltip' })
      marker.on('mouseover', function() { this.setRadius(10); this.setStyle({ weight: 3 }) })
      marker.on('mouseout',  function() { this.setRadius(7);  this.setStyle({ weight: 2 }) })

      marker.on('click', () => {
        mapInstance.flyTo([s.lat, s.lng], 9, { duration: 0.7, easeLinearity: 0.4 })

        // Use freshest cached estimate at click time (may differ from plotMarkers time)
        const cached = getPersonalisedIncentive(s.school_id || s.id)
        const clickInc    = cached ? cached.total : incValue
        const clickColor  = cached ? incentiveColor(cached.total, isQld) : color
        const clickLabel  = cached ? 'personalised estimate' : incLabel

        const popup = L.popup({ className: 'school-popup', maxWidth: 260, closeButton: true, autoPan: true })
          .setLatLng([s.lat, s.lng])
          .setContent(buildPopupHtml(s, Math.round(clickInc).toLocaleString(), clickColor, clickLabel, escSub))
          .openOn(mapInstance)

        // On-demand fetch: if profile is active but no estimate cached, fetch and update popup live
        const prof = activeIncentiveProfile.value
        if (prof?.ready && !cached) {
          const sid  = s.school_id || s.id
          const yrs  = Number(prof.yearsExperience || 0)
          const hdep = Boolean(prof.hasDependants)
          fetchIncentiveEstimate({
            school_id: sid,
            employment_type: isQld ? 'temporary' : 'permanent',
            years_experience: yrs,
            years_of_experience: yrs,
            experience_years: yrs,
            years_experience_band: yearsExperienceBand(yrs),
            has_dependants: isQld ? hdep : false,
          }).then(result => {
            const total = estimateTotalFromResult(result, isQld, hdep)
            if (total > 0) {
              setPersonalisedIncentive(sid, { total, profile: { ...prof } })
              if (popup.isOpen?.()) {
                const nc = incentiveColor(total, isQld)
                popup.setContent(buildPopupHtml(s, Math.round(total).toLocaleString(), nc, 'personalised estimate', escSub))
              }
            }
          }).catch(() => {})
        }
      })
    }, i * 6)
  })
}

watch(heroTop, (v) => { if (v.length && mapInstance && !mapSchools.value.length) plotMarkers() }, { once: true })

const guideStep     = ref(0)
const gqAnswers     = ref([null, null, null])
const guideProgress = computed(() => [0, 33, 66, 100][guideStep.value] ?? 100)

function startGuide() {
  view.value = 'guide'
  guideStep.value = 0
  gqAnswers.value = [null, null, null]
}
function gqSel(step, title) {
  const updated = [...gqAnswers.value]; updated[step] = title; gqAnswers.value = updated
}
function gqNext(step) { guideStep.value = step + 1 }

function gqFinish() {
  const a1 = gqAnswers.value[0] || ''
  const a2 = gqAnswers.value[1] || ''
  const a3 = gqAnswers.value[2] || ''
  selState(a1.includes('Queensland') ? 'qld' : a1.includes('New South Wales') ? 'nsw' : 'both')
  ;[...fRem].forEach(v => toggleRem(v))
  if (a2.includes('Outer Regional')) toggleRem('3')
  else if (a2.includes('Very Remote')) toggleRem('5')
  else if (a2.includes('Remote')) toggleRem('4')
  if (a3.includes('Healthcare')) setSort('hc')
  else if (a3.includes('Distance')) setSort('dist')
  else setSort('inc')
  guidePage.value = 1
  guideStep.value = 3
  loadGuideWithProfile()
}

const SVG_INC  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
const SVG_HC   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
const SVG_DIST = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
const SVG_AZ   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`

const sortOpts = [
  { v: 'inc',  svg: SVG_INC,  label: 'Incentive' },
  { v: 'hc',   svg: SVG_HC,   label: 'Healthcare' },
  { v: 'dist', svg: SVG_DIST, label: 'Distance' },
  { v: 'az',   svg: SVG_AZ,   label: 'A–Z' },
]
const q1opts = [
  { title: 'Both states',     flag: new URL('../assets/flag-au.png',  import.meta.url).href, sub: 'Show QLD and NSW together' },
  { title: 'Queensland',      flag: new URL('../assets/flag-qld.png', import.meta.url).href, sub: 'QLD Locality Allowance applies' },
  { title: 'New South Wales', flag: new URL('../assets/flag-nsw.png', import.meta.url).href, sub: 'NSW Rural Teacher Incentive applies' },
]
const q2opts = [
  { title: 'Outer Regional', emoji: '🛣️', sub: '~100–300 km from nearest city · incentives apply' },
  { title: 'Remote',         emoji: '🌾', sub: '300–600 km from nearest city · higher incentives on top of base' },
  { title: 'Very Remote',    emoji: '🌵', sub: '600+ km from nearest city · highest incentives on top of base' },
  { title: 'Open to all',    emoji: '✨', sub: 'Show me everything' },
]
const SVG_INC_LG  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
const SVG_HC_LG   = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
const SVG_DIST_LG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
const SVG_NATURE  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.11a1 1 0 0 0 1.59 1.21C6.72 18.49 8 17 12 17h1c3 0 5-2 5-5s-2-5-5-5"/><line x1="3" y1="22" x2="12" y2="13"/></svg>`

const q3opts = [
  { title: 'Highest incentive', svg: SVG_INC_LG,  sub: 'Maximise my annual payment' },
  { title: 'Healthcare access', svg: SVG_HC_LG,   sub: 'Prioritise areas with more services' },
  { title: 'Distance to city',  svg: SVG_DIST_LG, sub: 'Stay as close to a city as possible' },
  { title: 'Nature & outdoors', svg: SVG_NATURE,  sub: 'Parks, reserves, wide open spaces' },
]
</script>

<!-- Global styles: Leaflet popups + map controls (must be unscoped) -->
<style>
/* popup wrapper */
.school-popup .leaflet-popup-content-wrapper {
  background: #0D1F3C !important; border: none !important;
  border-radius: 14px !important; padding: 0 !important;
  box-shadow: 0 16px 40px rgba(13,31,60,0.32) !important;
  overflow: hidden !important;
}
.school-popup .leaflet-popup-tip-container .leaflet-popup-tip { background: #0D1F3C !important; }
.school-popup .leaflet-popup-close-button { color: rgba(255,255,255,0.5) !important; top: 8px !important; right: 10px !important; font-size: 16px !important; }
.school-popup .leaflet-popup-close-button:hover { color: #fff !important; }
.school-popup .leaflet-popup-content { margin: 0 !important; }
.sp-wrap { padding: 14px 16px 14px; font-family: 'DM Sans', sans-serif; }
.sp-tag { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 5px; }
.sp-tag.sp-qld { color: #fbbf24; }
.sp-tag.sp-nsw { color: #93c5fd; }
.sp-name { font-weight: 700; font-size: 0.9rem; color: #fff; line-height: 1.25; margin-bottom: 2px; }
.sp-suburb { font-size: 0.7rem; color: rgba(255,255,255,0.45); margin-bottom: 10px; }
.sp-inc { margin-bottom: 13px; }
.sp-inc-num { font-size: 1.4rem; font-weight: 900; color: #4ade80; line-height: 1; }
.sp-inc-lbl { font-size: 0.67rem; color: rgba(255,255,255,0.45); margin-left: 4px; }
.sp-cta { display: block; width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.09); border: 1px solid rgba(255,255,255,0.16); border-radius: 8px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.74rem; font-weight: 600; cursor: pointer; transition: background 0.14s; text-align: center; }
.sp-cta:hover { background: rgba(255,255,255,0.18); }
/* state filter control */
.map-state-ctrl { display: flex; gap: 4px; background: rgba(255,255,255,0.95); border-radius: 8px; padding: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.12); border: 1px solid rgba(0,0,0,0.08); backdrop-filter: blur(6px); }
.msc-btn { padding: 5px 12px; border: none; border-radius: 5px; font-family: 'DM Sans', sans-serif; font-size: 0.7rem; font-weight: 600; cursor: pointer; background: transparent; color: #6b7280; transition: all 0.15s; }
.msc-btn:hover { background: #f3f4f6; color: #1a1714; }
.msc-btn.msc-active { background: #0D1F3C; color: #fff; }

/* Pulse ring shown on selected school marker */
.pulse-ring-icon { background: transparent !important; border: none !important; }
.pulse-ring-icon::after {
  content: '';
  display: block;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2.5px solid #3b82f6;
  box-shadow: 0 0 0 0 rgba(59,130,246,0.5);
  animation: pulse-ring 1.3s cubic-bezier(0.215,0.61,0.355,1) infinite;
}
@keyframes pulse-ring {
  0%   { transform: scale(0.7); opacity: 1; box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
  70%  { transform: scale(1.25); opacity: 0.4; box-shadow: 0 0 0 14px rgba(59,130,246,0); }
  100% { transform: scale(0.7); opacity: 0; box-shadow: 0 0 0 0 rgba(59,130,246,0); }
}
</style>

<style scoped>
.page.active {
  background: var(--bg);
  color: var(--ink);
  min-height: 100%;
}

.page-topbar {
  width: 100%;
  margin: 0 0 16px;
  padding: 56px 20px 40px;
  background:
    radial-gradient(circle at 20% 50%, rgba(31,111,235,0.16) 0%, transparent 42%),
    radial-gradient(circle at 80% 20%, rgba(30,158,86,0.10) 0%, transparent 34%),
    linear-gradient(135deg, #0D1F3C 0%, #1A3557 45%, #0F2D4A 72%, #081828 100%);
  color: #fff;
  box-shadow: 0 20px 40px rgba(13,31,60,0.18);
}

.page-topbar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(255,255,255,0));
  pointer-events: none;
}

.page-title {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto 8px;
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.02;
  color: #fff !important;
}

.page-title {
  font-size: 2.1rem;
  font-weight: 900;
  line-height: 1.08;
  margin-bottom: 6px;
}

.page-sub {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  font-size: 1rem;
  color: rgba(255,255,255,0.82) !important;
}

.exp-entry-h p,
.exp-entry-h p,
.pc-sub,
.gqo-sub,
.ses-sub,
.r-meta,
.exp-map-hint,
.cmp-sub-txt,
.gq-label {
  color: var(--ink2);
}

.loading-state {
  display:flex;
  align-items:center;
  gap:10px;
  padding:2rem 1rem;
  justify-content:center;
  color:var(--ink3,#6b7280);
  font-size:0.85rem;
}

.loading-spinner {
  width:18px;
  height:18px;
  border:2px solid var(--b);
  border-top-color: var(--blue);
  border-radius:50%;
  animation:spin 0.7s linear infinite;
  flex-shrink:0;
}

@keyframes spin { to { transform:rotate(360deg); } }

.error-state {
  padding:1.5rem;
  text-align:center;
  color:#b42318;
  font-size:0.82rem;
  background:#fff4f2;
  border:1px solid #fecaca;
  border-radius:12px;
  margin:12px 0;
}

.back-row {
  display:inline-flex;
  align-items:center;
  gap:8px;
  font-size:0.85rem;
  color:var(--blue);
  font-weight:700;
  cursor:pointer;
  margin-bottom:16px;
}

.back-row:hover { color: var(--blue-d); }

.explorer-profile-card {
  width: 100%;
  margin: 0 0 22px;
  padding: 14px 20px 10px;
  background: transparent;
  border-bottom: 0;
  box-shadow: none;
}

.explorer-profile-card.collapsed {
  width: min(980px, 100%);
  margin: -10px auto 26px;
  padding: 8px 20px;
  background: transparent;
  border-bottom: 0;
  box-shadow: none;
}

.explorer-profile-inner {
  position:relative;
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 28px;
  background: var(--s);
  border: 1px solid var(--b);
  border-radius: var(--r);
  box-shadow: 0 4px 20px rgba(13,31,60,0.07);
}

.collapsed .explorer-profile-inner {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.profile-collapse-btn {
  position:absolute;
  top:12px;
  right:14px;
  border:0;
  border-radius:6px;
  background:#fff;
  color:var(--blue);
  padding:6px 10px;
  font:inherit;
  font-size:0.72rem;
  font-weight:900;
  cursor:pointer;
  box-shadow:0 6px 16px rgba(13,31,60,0.08);
}

.profile-collapse-btn:hover {
  background:var(--blue-s);
}

.profile-applied {
  display:inline-flex;
  align-items:center;
  margin-top: 12px;
  padding:7px 10px;
  border-radius:6px;
  background:var(--green-s);
  color: var(--green-d);
  font-size: 0.76rem;
  font-weight: 800;
}

.profile-summary-bar {
  width:100%;
  min-height:58px;
  display:flex;
  align-items:center;
  justify-content:flex-start;
  gap:12px;
  border:1.5px solid rgba(31,111,235,0.42);
  border-left:5px solid var(--blue);
  border-radius:14px;
  background:linear-gradient(135deg,#fff 0%,#f4f8ff 70%,#ecfdf5 100%);
  padding:12px 18px;
  font:inherit;
  text-align:left;
  cursor:pointer;
  box-shadow:0 18px 38px rgba(13,31,60,0.16);
}

.profile-summary-bar::before {
  content:'$';
  width:30px;
  height:30px;
  border-radius:9px;
  flex-shrink:0;
  background:var(--blue);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:900;
  box-shadow:0 10px 20px rgba(31,111,235,0.22);
}

.profile-summary-title {
  font-size:0.9rem;
  font-weight:900;
  color:var(--ink);
  white-space:nowrap;
}

.profile-summary-divider {
  color:var(--ink3);
  font-size:0.76rem;
}

.profile-summary-copy {
  flex:1 1 auto;
  color:var(--ink2);
  font-size:0.86rem;
  font-weight:800;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.profile-summary-edit {
  flex-shrink:0;
  font-size:0.82rem;
  font-weight:900;
  color:#fff;
  border:1px solid var(--blue);
  background:var(--blue);
  border-radius:8px;
  padding:7px 12px;
  margin-left:4px;
}

/* ── Entry personalised note ── */
.entry-personalised-note {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  padding: 5px 12px;
  background: var(--green-s);
  color: var(--green-d);
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* ── Map personalised chip ── */
.map-personalised-chip {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 8px;
  background: var(--green-s);
  color: var(--green-d);
  border-radius: 99px;
  font-size: 0.66rem;
  font-weight: 800;
  vertical-align: middle;
}

/* ── Results personalised chip ── */
.r-personalised-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  padding: 2px 8px;
  background: var(--green-s);
  color: var(--green-d);
  border-radius: 99px;
  font-size: 0.68rem;
  font-weight: 800;
  vertical-align: middle;
}

.exp-entry {
  padding:16px 140px 0;
}

.exp-entry-h {
  text-align:center;
  margin-bottom:32px;
}

.exp-entry-h h2 {
  font-size:2.3rem;
  font-weight:900;
  line-height:1.1;
  margin-bottom:10px;
}

.exp-entry-h p {
  font-size:0.95rem;
}

.two-paths {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px;
}

.path-card,
.exp-stats-bar,
.exp-map-section,
.filter-panel,
.search-empty-state,
.gq-opt,
.cmp-lifestyle-row,
.cmp-wrap,
.srch-wrap,
.sort-pill,
.guide-progress,
.guide-q {
  background: var(--s);
  border: 1px solid var(--b);
  box-shadow: 0 10px 30px rgba(13,31,60,0.05);
}

.path-card {
  border-radius:18px;
  padding:30px 30px 26px;
  cursor:pointer;
  transition:box-shadow 0.2s,transform 0.2s,border-color 0.2s;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.path-card:hover {
  box-shadow:0 16px 36px rgba(13,31,60,0.10);
  transform:translateY(-4px);
}

.pc-search:hover { border-color: var(--blue); }
.pc-guide:hover  { border-color: var(--blue); }

.pc-icon {
  width:56px;
  height:56px;
  border-radius:16px;
  display:flex;
  align-items:center;
  justify-content:center;
}

.pc-icon.blue  { background: var(--blue-s); }
.pc-icon.green { background: var(--blue-s); color: var(--blue); }

.pc-title {
  font-size:1.08rem;
  font-weight:800;
  color:var(--ink);
}

.pc-sub {
  font-size:0.82rem;
  line-height:1.6;
}

.pc-features {
  list-style:none;
  padding:0;
  margin:6px 0 10px;
  display:flex;
  flex-direction:column;
  gap:8px;
}

.pc-features li {
  font-size:0.79rem;
  color:var(--ink2);
  display:flex;
  align-items:center;
  gap:7px;
}

.pc-btn,
.gf-next,
.filter-tog,
.cmp-lifestyle-btn {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  padding:10px 18px;
  border-radius:8px;
  font-size:0.84rem;
  font-weight:700;
  width:fit-content;
  margin-top:auto;
  cursor:pointer;
  transition:all 0.16s;
  border:none;
}

.pc-btn.blue,
.gf-next.ready,
.filter-tog.open {
  background: var(--blue);
  color:#fff;
}

.pc-btn.blue:hover,
.gf-next.ready:hover,
.filter-tog.open:hover {
  background: var(--blue-d);
}

.pc-btn.green,
.cmp-lifestyle-btn {
  background: var(--blue);
  color:#fff;
}

.pc-btn.green:hover,
.cmp-lifestyle-btn:hover {
  background: var(--blue-d);
}

.exp-stats-bar {
  display:flex;
  align-items:center;
  justify-content:center;
  margin-top:22px;
  border-radius:16px;
  padding:18px 24px;
}

.exp-stat {
  display:flex;
  flex-direction:column;
  align-items:center;
  flex:1;
}

.es-num {
  font-family: 'Playfair Display', serif;
  font-size:1.55rem;
  font-weight:900;
  color:var(--ink);
}

.es-lbl {
  font-size:0.72rem;
  color:var(--ink3,#6b7280);
  margin-top:3px;
  text-transform:uppercase;
  letter-spacing:0.05em;
}

.exp-stat-div {
  width:1px;
  height:36px;
  background:var(--b);
  margin:0 8px;
}

/* ── Map section (no header, full-bleed) ── */
.exp-map-section {
  margin-top: 16px;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  margin-bottom: 0;
}

/* ── Search overlay: inside the map, top-right ── */
.map-search-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1000;
  width: 280px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 42px;
  background: rgba(255,255,255,0.96);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.14);
  backdrop-filter: blur(6px);
  transition: box-shadow 0.15s;
}
.map-search-overlay:focus-within {
  box-shadow: 0 0 0 3px rgba(31,111,235,0.2), 0 4px 16px rgba(0,0,0,0.14);
  border-color: rgba(31,111,235,0.5);
}
.map-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.84rem;
  color: #1a1714;
  outline: none;
  min-width: 0;
}
.map-search-input::placeholder { color: rgba(0,0,0,0.38); }
.map-search-clear {
  background: rgba(0,0,0,0.08);
  border: none;
  border-radius: 99px;
  width: 20px;
  height: 20px;
  font-size: 0.6rem;
  color: rgba(0,0,0,0.5);
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.map-search-clear:hover { background: rgba(0,0,0,0.16); }

.map-search-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.18);
  overflow: hidden;
  max-height: 280px;
  overflow-y: auto;
}
.msd-item {
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.11s;
}
.msd-item:hover { background: #f4f8ff; }
.msd-item + .msd-item { border-top: 1px solid #f1f5f9; }
.msd-name { font-size: 0.83rem; font-weight: 700; color: #1a1714; }
.msd-meta { font-size: 0.69rem; color: #6b7280; margin-top: 1px; }

.msd-enter-active { transition: opacity 0.13s ease, transform 0.13s ease; }
.msd-leave-active { transition: opacity 0.1s ease; }
.msd-enter-from { opacity: 0; transform: translateY(-4px); }
.msd-leave-to  { opacity: 0; }

/* ── Progress rail ── */
.explorer-flow {
  position: relative;
  padding-left: 2rem;
  margin-top: 32px;
}
.explorer-flow:first-child {
  margin-top: 0;
}
/* Line running from just below this node down to the next node */
.explorer-flow::before {
  content: '';
  position: absolute;
  left: 0.44rem;
  top: 1.6rem;
  bottom: -32px;
  width: 1px;
  background: linear-gradient(180deg, rgba(31,111,235,0.22), rgba(31,111,235,0.06));
}
/* Last section: fade the line out partway, don't extend below */
.explorer-flow--last::before {
  bottom: 60%;
  background: linear-gradient(180deg, rgba(31,111,235,0.18), transparent);
}
.flow-node {
  position: absolute;
  left: 0;
  top: 0.8rem;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 999px;
  background: #fff;
  border: 2px solid rgba(31,111,235,0.6);
  box-shadow: 0 0 0 5px rgba(31,111,235,0.08);
}
.esh-label {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ink);
  margin: 0 0 0 0;
  padding-top: 0.6rem;
}
.esh-hint {
  font-size: 0.73rem;
  color: var(--ink3);
  margin: 0.25rem 0 0.9rem;
}
.map-flow-trail {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  flex-wrap: wrap;
}
.mft-step {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--ink3);
}
.mft-arrow {
  font-size: 0.7rem;
  color: rgba(0,0,0,0.2);
}

/* ── Guide card ── */
.guide-card {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  padding: 24px 28px;
  border-radius: 18px;
  background: linear-gradient(120deg, #f0f6ff 0%, #e8f0fe 100%);
  border: 1px solid rgba(31,111,235,0.15);
  box-shadow: 0 4px 20px rgba(31,111,235,0.07);
  cursor: pointer;
  transition: box-shadow 0.18s, transform 0.18s;
}
.guide-card:hover {
  box-shadow: 0 10px 32px rgba(31,111,235,0.14);
  transform: translateY(-2px);
}
.gc-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #fff;
  color: var(--blue);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(31,111,235,0.12);
}
.gc-body {
  flex: 1;
  min-width: 0;
}
.gc-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 4px;
}
.gc-sub {
  font-size: 0.78rem;
  color: var(--ink2);
  line-height: 1.55;
  margin-bottom: 12px;
}
.gc-outcomes {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.gc-outcome-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(31,111,235,0.09);
  color: #1f6feb;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 600;
}
.gc-btn {
  flex-shrink: 0;
  padding: 11px 22px;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 99px;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, transform 0.15s;
  box-shadow: 0 4px 14px rgba(31,111,235,0.3);
}
.gc-btn:hover { background: #1a56c4; transform: translateX(2px); }

/* legacy guide-strip — kept for any remaining references */
.guide-strip {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  margin-bottom: 40px;
  padding: 18px 22px;
  background: var(--s);
  border: 1px solid var(--b);
  border-left: 4px solid var(--blue);
  border-radius: 14px;
  cursor: pointer;
  transition: box-shadow 0.18s, transform 0.18s;
  box-shadow: 0 4px 16px rgba(13,31,60,0.06);
}
.guide-strip:hover {
  box-shadow: 0 8px 28px rgba(13,31,60,0.12);
  transform: translateY(-2px);
}
.guide-strip-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--blue-s);
  color: var(--blue);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.guide-strip-body { flex: 1; min-width: 0; }
.guide-strip-title { font-size: 0.92rem; font-weight: 800; color: var(--ink); margin-bottom: 3px; }
.guide-strip-sub { font-size: 0.78rem; color: var(--ink2); line-height: 1.5; }
.guide-strip-cta { flex-shrink: 0; font-size: 0.82rem; font-weight: 800; color: var(--blue); white-space: nowrap; }

.exp-map-label {
  font-size:0.84rem;
  font-weight:700;
  color:var(--ink);
}

.exp-map-hint {
  font-size:0.72rem;
}

.exp-map-container { height:460px; width:100%; z-index:0; }

.map-legend {
  position:absolute;
  bottom:16px;
  right:16px;
  background:rgba(255,255,255,0.95);
  border:1px solid var(--b);
  border-radius:12px;
  padding:10px 14px;
  z-index:999;
  min-width:130px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  backdrop-filter: blur(6px);
}

.ml-title {
  font-size:0.68rem;
  font-weight:700;
  color:var(--ink3,#6b7280);
  text-transform:uppercase;
  letter-spacing:0.05em;
  margin-bottom:8px;
}

.ml-gradient-row { display:flex; flex-direction:column; gap:2px; }
.ml-gradient { height:10px; border-radius:4px; width:100%; }
.qld-grad { background:linear-gradient(to right,#fbbf24,#92400e); }
.nsw-grad { background:linear-gradient(to right,#4ade80,#14532d); }
.ml-grad-labels { display:flex; justify-content:space-between; font-size:0.62rem; color:var(--ink3,#9ca3af); }
.ml-grad-state { font-size:0.7rem; font-weight:700; color:var(--ink2,#374151); margin-top:1px; }

/* ── Map status chip (bottom-left of map section) ── */
.map-status-chip {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 999;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
  pointer-events: none;
  white-space: nowrap;
}
.map-status-chip.msc-personalised {
  background: rgba(22,163,74,0.92);
  color: #fff;
  border: 1px solid rgba(22,163,74,0.4);
}
.map-status-chip.msc-max {
  background: rgba(255,255,255,0.92);
  color: #6b7280;
  border: 1px solid rgba(0,0,0,0.1);
}

:global(.school-tooltip) {
  background:#0D1F3C !important;
  border:none !important;
  border-radius:10px !important;
  color:#fff !important;
  padding:10px 12px !important;
  font-size:0.78rem !important;
  box-shadow:0 8px 24px rgba(13,31,60,0.22) !important;
}

/* FIX: make incentive text always visible */
:global(.school-tooltip strong),
:global(.school-tooltip .inc-value) {
  color: #ffffff !important;
  font-weight: 800;
}

:global(.school-tooltip div[style*="color"]) {
  color: #93c5fd !important; /* light blue instead of dark */
  font-weight: 700;
}

:global(.school-tooltip::before) { border-top-color:#0D1F3C !important; }

.search-path,
.guide-path {
  padding: 8px 160px 32px;
}

.srch-row {
  display:flex;
  gap:12px;
  align-items:center;
  margin-bottom:14px;
}

.srch-wrap {
  flex:1;
  display:flex;
  align-items:center;
  gap:10px;
  border-radius:12px;
  padding:0 14px;
  min-height:52px;
}

.srch-wrap input {
  flex:1;
  border:none;
  background:transparent;
  outline:none;
  font-size:0.92rem;
  color:var(--ink);
}

.filter-tog {
  background: var(--s);
  color: var(--ink);
  border:1px solid var(--b);
  min-height:52px;
}

.f-badge {
  min-width:18px;
  height:18px;
  border-radius:999px;
  background: var(--blue);
  color:#fff;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:0.68rem;
  padding:0 5px;
}

.fp-slide-enter-active,.fp-slide-leave-active { transition:max-height 0.28s ease,opacity 0.22s ease; overflow:hidden; }
.fp-slide-enter-from,.fp-slide-leave-to { max-height:0; opacity:0; }
.fp-slide-enter-to,.fp-slide-leave-from { max-height:420px; opacity:1; }

.filter-panel {
  border-radius:16px;
  margin-bottom:14px;
}

.fp-inner {
  padding:18px;
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap:16px;
}

.fp-sec { display:flex; flex-direction:column; gap:10px; }
.fp-lbl {
  font-size:0.76rem;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:0.06em;
  color:var(--ink3);
}

.fp-tiles {
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}

.fp-tile,
.sort-pill {
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:10px 14px;
  border-radius:999px;
  font-size:0.82rem;
  font-weight:700;
  color:var(--ink2);
  cursor:pointer;
  transition: all 0.16s;
}

.fp-tile:hover,
.sort-pill:hover {
  border-color: var(--blue);
  background: var(--blue-s);
  color: var(--blue-d);
}

.sel-qld,
.sel-both,
.sel-permanent,
.sel-temporary,
.sel-public_service_officer,
.sel-nsbts,
.sel-rem,
.fp-tile.selected,
.sort-pill.active {
  border-color: rgba(30,158,86,0.55);
  background: var(--green-s);
  color: var(--green-d);
}

.fp-tile-icon { font-size:0.9rem; }
.sort-icon {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  color: inherit;
}

.sort-row {
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:10px;
  margin-bottom:16px;
}

.sort-lbl {
  font-size:0.78rem;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:0.06em;
  color:var(--ink3);
}

.results-zone {
  min-height: 280px;
}

.r-meta {
  font-size:0.84rem;
  margin-bottom:14px;
}

.school-list {
  display:flex;
  flex-direction:column;
  gap:12px;
}

.search-empty-state {
  text-align:center;
  padding:2.8rem 1rem;
  border-radius:16px;
}

.ses-title {
  font-size:1rem;
  font-weight:800;
  color:var(--ink);
  margin-bottom:6px;
}

.guide-inner { flex:1; }

.guide-progress {
  padding: 14px 18px 18px;
  margin-bottom: 18px;
  background: var(--s);
  border: 1px solid var(--b);
  border-radius: var(--r);
}

.gp-steps {
  display: flex;
  align-items: center;
  gap: 0;
}

.gp-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.gp-step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--b2);
  background: var(--s);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ink3);
  transition: all 0.2s ease;
}

.gp-step.active .gp-step-circle {
  border-color: var(--blue);
  background: var(--blue);
  color: #fff;
  box-shadow: 0 0 0 3px var(--blue-s);
}

.gp-step.done .gp-step-circle {
  border-color: var(--green);
  background: var(--green);
  color: #fff;
}

.gp-step-label {
  font-size: 0.63rem;
  font-weight: 600;
  color: var(--ink3);
  white-space: nowrap;
  transition: color 0.2s;
}

.gp-step.active .gp-step-label { color: var(--blue-d); }
.gp-step.done  .gp-step-label  { color: var(--green-d); }

.gp-step-line {
  flex: 1;
  height: 2px;
  background: var(--b);
  margin: 0 4px;
  margin-bottom: 22px;
  border-radius: 99px;
  transition: background 0.3s ease;
}

.gp-step-line.done { background: var(--green); }

.guide-slide-enter-active { transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.guide-slide-leave-active { transition:all 0.18s ease; }
.guide-slide-enter-from { opacity:0; transform:translateX(32px) scale(0.97); }
.guide-slide-leave-to   { opacity:0; transform:translateX(-20px); }

.guide-q {
  padding:22px;
  border-radius:18px;
}

.guide-q--results {
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.gq-label {
  font-size:0.76rem;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:0.06em;
  margin-bottom:10px;
}

.gq-text {
  font-size:1.8rem;
  font-weight:900;
  margin-bottom:22px;
  line-height:1.15;
}

.gq-opts { display:flex; flex-direction:column; gap:12px; }

.gq-opt {
  display:flex;
  align-items:center;
  gap:14px;
  border-radius:14px;
  padding:15px 16px;
  cursor:pointer;
  transition:border-color 0.15s,background 0.15s,transform 0.15s;
  position:relative;
}

.gq-opt:hover {
  border-color: var(--blue);
  background: var(--blue-s);
  transform:translateX(3px);
}

.gq-opt.sel {
  border-color: var(--blue);
  background: var(--blue-s);
  transform:translateX(3px);
}

.gqo-state-img {
  width:56px;
  height:36px;
  border-radius:6px;
  overflow:hidden;
  flex-shrink:0;
  border:1px solid var(--b);
  background:#f3f4f6;
}

.gqo-state-img img { width:100%; height:100%; object-fit:cover; display:block; }
.gqo-icon {
  display:flex;
  align-items:center;
  justify-content:center;
  width:38px;
  height:38px;
  border-radius:10px;
  background:var(--blue-s);
  color:var(--blue);
  flex-shrink:0;
}
.gq-opt.sel .gqo-icon { background:rgba(31,111,235,0.15); color:var(--blue); }
.gqo-title { font-weight:700; font-size:0.92rem; color: var(--ink); }
.gqo-sub { font-size:0.76rem; margin-top:2px; }
.gqo-check { position:absolute; right:14px; color:var(--blue); font-weight:800; font-size:1rem; }

.guide-footer {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-top:18px;
}

.gf-skip {
  font-size:0.84rem;
  font-weight:700;
  color: var(--ink3);
  cursor:pointer;
}

.gf-skip:hover { color: var(--blue); }

.gf-next {
  background: var(--blue-s);
  color: var(--blue-d);
}

:global(.cmp-tray) {
  padding: 14px 32px !important;
  min-height: 64px !important;
}
:global(.tray-lbl) {
  font-size: 0.8rem !important;
  font-weight: 700 !important;
}
:global(.tray-item) {
  font-size: 0.8rem !important;
  padding: 5px 12px !important;
}
:global(.tray-go) {
  padding: 9px 22px !important;
  font-size: 0.84rem !important;
}

.cmp-title {
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 6px;
}

.cmp-sub-txt {
  font-size: 0.84rem;
  margin-bottom: 18px;
}

.cmp-wrap {
  border-radius: 16px;
  overflow: hidden;
}

.cmp-tbl {
  width:100%;
  border-collapse: collapse;
}

.cmp-tbl th,
.cmp-tbl td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--b);
  text-align: left;
  font-size: 0.84rem;
}

.cmp-tbl th {
  background: #f8fbff;
  color: var(--ink);
  font-weight: 800;
}

.cmp-sec td {
  background: var(--blue-s);
  color: var(--blue-d);
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cmp-best {
  background: #f1fbf5;
}

.cmp-cell-note {
  margin-top: 4px;
  color: var(--ink3);
  font-size: 0.66rem;
  font-weight: 700;
}

.cmp-apply-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 6px;
  background: var(--blue);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s;
  white-space: nowrap;
}
.cmp-apply-btn:hover { background: var(--blue-d); }

.cmp-breakdown-section {
  border-top: 1px solid var(--b);
}
.cmp-sec-row {
  background: var(--blue-s);
  color: var(--blue-d);
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 10px 16px;
}
.cmp-breakdown-grid {
  display: grid;
  gap: 0;
}
.cmp-breakdown-col {
  padding: 16px;
  border-right: 1px solid var(--b);
  min-width: 0;
}
.cmp-breakdown-col:last-child { border-right: none; }
.cmp-breakdown-school-name {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--ink2);
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cmp-lifestyle-row {
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-top:20px;
  padding:16px 20px;
  border-radius:14px;
  gap:12px;
}

.cmp-lifestyle-row p {
  font-size:0.84rem;
  color:var(--green-d);
  font-weight:700;
  margin:0;
}

@media (max-width: 900px) {
  .two-paths,
  .fp-inner {
    grid-template-columns: 1fr;
  }

  .exp-entry,
  .search-path,
  .guide-path,
  .page-topbar {
    padding-left: 20px;
    padding-right: 20px;
  }

  .explorer-profile-card {
    padding-left: 20px;
    padding-right: 20px;
  }

  .srch-row,
  .guide-footer,
  .cmp-lifestyle-row,
  .exp-map-header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .page-topbar {
    padding: 44px 20px 36px;
  }

  .page-title { font-size: 2.4rem; }
  .page-sub { font-size: 0.92rem; }

  :global(.cmp-tray) {
    padding: 12px 16px !important;
    justify-content: flex-start !important;
  }
  :global(.tray-items) {
    flex: 1 !important;
  }

  .page-title { font-size: 1.75rem; }
  .exp-entry-h h2,
  .gq-text,
  .cmp-title { font-size: 1.5rem; }
  .exp-stats-bar { flex-direction: column; gap: 14px; }
  .exp-stat-div { display: none; }
  .cmp-tbl { display:block; overflow-x:auto; }

  .guide-card { flex-direction: column; align-items: flex-start; padding: 20px 18px; gap: 14px; }
  .gc-btn { align-self: stretch; text-align: center; }
  .gc-outcomes { gap: 6px; }
  /* Hide the progress rail gutter on mobile */
  .explorer-flow { padding-left: 0; margin-top: 24px; }
  .explorer-flow::before { display: none; }
  .flow-node { display: none; }

  /* Search bar flows above the map on mobile */
  .exp-map-section {
    display: flex;
    flex-direction: column;
    overflow: visible;
  }
  .map-search-overlay {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    border-radius: 12px;
    margin-bottom: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    order: -1;
  }
  .exp-map-container {
    order: 0;
  }
  .map-status-chip {
    bottom: 8px;
    left: 8px;
  }
  .map-legend {
    bottom: 8px;
    right: 8px;
  }
}

@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skel-list { display: flex; flex-direction: column; gap: 8px; }
.skel-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--s);
  border: 1px solid var(--b);
  border-radius: var(--r2);
  gap: 12px;
}
.skel-left { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.skel-right { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
.skel-line {
  border-radius: 4px;
  background: linear-gradient(90deg, var(--s2) 25%, var(--b) 50%, var(--s2) 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
}
.skel-name  { height: 12px; width: 55%; }
.skel-meta  { height: 9px;  width: 35%; }
.skel-amt   { height: 13px; width: 64px; }
.skel-sub   { height: 8px;  width: 48px; }

.back-top-btn {
  position: fixed;
  bottom: 84px;
  right: 20px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--ink);
  color: #fff;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  z-index: 599;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  transition: background 0.14s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-top-btn:hover { background: var(--blue); }

.cmp-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--ink);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 9px 18px;
  border-radius: 99px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  z-index: 600;
  white-space: nowrap;
  pointer-events: none;
}
.toast-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.toast-leave-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.toast-enter-from  { opacity: 0; transform: translateX(-50%) translateY(8px); }
.toast-leave-to    { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>

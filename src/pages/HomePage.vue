<template>
  <div class="page active">

    <!-- SCROLL PROGRESS BAR -->
    <div class="scroll-progress" :style="{ width: scrollPct + '%' }"></div>

    <!-- HERO -->
    <section class="cin-section">
      <div class="cin-video-bg" :style="heroVideoStyle"></div>
      <div class="cin-overlay"></div>

      <div class="cin-content">

        <div class="cin-slide cin-slide--active">
          <div class="cin-eyebrow">For Australian Teachers</div>
          <h1 class="cin-hero-h1">Rural teaching isn't a compromise.<br>It's an <em>opportunity</em>.</h1>
          <p class="cin-hero-sub">Find schools, compare incentives, and understand the lifestyle before you decide.</p>
          <div class="cin-hero-acts">
            <button class="btn-hero-p" @click="$emit('navigate', 'explorer')">Find your school</button>
            <button class="btn-hero-s" @click="$emit('navigate', 'insights')">Know the Place</button>
          </div>
        </div>

      </div>

      <div class="cin-photo-credit">Photo: <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a></div>

      <div class="hero-trust-strip">
        <div class="trust-item">
          <div class="trust-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="trust-title">Government data only</div>
          <div class="trust-text">ACARA, ABS Census, QLD Directive 16/18, NSW RTI Review 2020</div>
        </div>
        <div class="hero-trust-div"></div>
        <div class="trust-item">
          <div class="trust-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
          <div class="trust-title">645 schools</div>
          <div class="trust-text">Government, Catholic, and Independent across QLD and NSW</div>
        </div>
        <div class="hero-trust-div"></div>
        <div class="trust-item">
          <div class="trust-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div class="trust-title">Your decision</div>
          <div class="trust-text">We show differences, not recommendations. You decide.</div>
        </div>
        <div class="hero-trust-div"></div>
        <div class="trust-item">
          <div class="trust-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div>
          <div class="trust-title">No sign-up required</div>
          <div class="trust-text">Free and open access. No account or registration needed.</div>
        </div>
      </div>

    </section>

    <!-- STATE SPLIT -->
    <section class="state-split-section">
      <div class="state-split-header">
        <div class="section-eyebrow">Incentive Programs by State</div>
        <h2>Choose your state</h2>
        <p>Queensland and NSW each run their own rural incentive program — same goal, different structures.</p>
      </div>
      <div class="state-split-grid">
        <div class="state-card" @click="$emit('navigate', 'explorer')">
          <div class="state-card-bg state-bg-qld"></div>
          <div class="state-card-overlay"></div>
          <div class="state-card-content">
            <div class="state-chip state-chip-qld">QLD</div>
            <h3 class="state-card-h">Queensland</h3>
            <p class="state-card-desc">Locality Allowance paid fortnightly to all eligible government school teachers, based on location zone.</p>
            <div class="state-stats">
              <div class="state-stat">
                <div class="state-stat-val">$11,470/yr</div>
                <div class="state-stat-lab">Max annual incentive</div>
              </div>
              <div class="state-stat-div"></div>
              <div class="state-stat">
                <div class="state-stat-val">All gov schools</div>
                <div class="state-stat-lab">In eligible zones</div>
              </div>
            </div>
          </div>
        </div>
        <div class="state-card" @click="$emit('navigate', 'explorer')">
          <div class="state-card-bg state-bg-nsw"></div>
          <div class="state-card-overlay"></div>
          <div class="state-card-content">
            <div class="state-chip state-chip-nsw">NSW</div>
            <h3 class="state-card-h">New South Wales</h3>
            <p class="state-card-desc">Rural Teaching Incentive scales with remoteness. Retention bonus adds $5k/yr for up to 10 years on top.</p>
            <div class="state-stats">
              <div class="state-stat">
                <div class="state-stat-val">$30,000/yr</div>
                <div class="state-stat-lab">Max annual incentive</div>
              </div>
              <div class="state-stat-div"></div>
              <div class="state-stat">
                <div class="state-stat-val">All gov schools</div>
                <div class="state-stat-lab">In eligible zones</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- REGIONAL BENEFITS -->
    <section class="regional-section">
      <div class="how-inner">
        <div class="section-header centered">
          <div class="section-eyebrow">What regional can offer</div>
          <h2>Look beyond the incentive figure.</h2>
        </div>
        <div class="proof-card-grid">
          <button class="proof-card" type="button" @click="openModal('financial')">
            <div class="proof-card-icon proof-icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="proof-card-cat cat-green">Financial</div>
            <div class="proof-card-title">A real pay difference</div>
            <div class="proof-card-link">See the breakdown →</div>
          </button>
          <button class="proof-card" type="button" @click="openModal('cost')">
            <div class="proof-card-icon proof-icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div class="proof-card-cat cat-blue">Cost of Living</div>
            <div class="proof-card-title">Your salary stretches further</div>
            <div class="proof-card-link">What the data shows →</div>
          </button>
          <button class="proof-card" type="button" @click="openModal('career')">
            <div class="proof-card-icon proof-icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <div class="proof-card-cat cat-amber">Career Pace</div>
            <div class="proof-card-title">Smaller schools, broader role</div>
            <div class="proof-card-link">How careers progress →</div>
          </button>
          <button class="proof-card" type="button" @click="openModal('community')">
            <div class="proof-card-icon proof-icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="proof-card-cat cat-purple">Community</div>
            <div class="proof-card-title">You are not anonymous</div>
            <div class="proof-card-link">What this means in practice →</div>
          </button>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how-section">
      <div class="how-inner">
        <div class="section-header centered">
          <div class="section-eyebrow">How it works</div>
          <h2>Three steps to your decision</h2>
        </div>
        <div class="how-cards">
          <div class="how-card" @click="openModal('search')">
            <div class="how-card-img img-search"></div>
            <div class="how-card-body">
              <div class="how-card-num">01</div>
              <div class="how-card-title">Find by incentive</div>
              <p class="how-card-text">Search 645 schools. Filter by state, remoteness, and role. Sort by highest incentive package.</p>
              <span class="how-card-learn">Learn how it works ↗</span>
            </div>
          </div>
          <div class="how-connector">›</div>
          <div class="how-card" @click="openModal('rural')">
            <div class="how-card-img img-rural"></div>
            <div class="how-card-body">
              <div class="how-card-num">02</div>
              <div class="how-card-title">Explore the lifestyle</div>
              <p class="how-card-text">Every school links to its Know the Place profile: healthcare, rent, distance to city, and nature access.</p>
              <span class="how-card-learn">See what's measured ↗</span>
            </div>
          </div>
          <div class="how-connector">›</div>
          <div class="how-card" @click="openModal('compare')">
            <div class="how-card-img img-compare"></div>
            <div class="how-card-body">
              <div class="how-card-num">03</div>
              <div class="how-card-title">Compare side by side</div>
              <p class="how-card-text">Add up to 4 schools to your compare tray. Incentives and lifestyle in one table.</p>
              <span class="how-card-learn">How comparing works ↗</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TEACHER STORY -->
    <div class="story-plain-wrap fade-section">
      <div class="story-plain-card">
      <div class="story-plain-split">
        <div class="story-plain-player">
          <div class="story-video-card">
            <iframe
              ref="storyFrameEl"
              class="story-plain-frame"
              allowfullscreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              scrolling="no"
              frameborder="0"
            ></iframe>
          </div>
        </div>
        <div class="story-plain-text">
          <div class="section-eyebrow story-title-blue story-eyebrow-centered">Why Teachers Stay</div>
          <p class="story-plain-context">Many teachers who move regional report stronger career growth, community connection, and better work-life balance.</p>
          <h2 class="story-plain-h">Meet Katie.</h2>
          <p class="story-plain-desc">Katie moved from the city to teach at a remote school in <strong>Cooktown, Cape York Peninsula, Far North Queensland</strong>. It changed everything.</p>
          <ul class="story-plain-points">
            <li>Landed a <strong>Head of Department role in her 20s</strong>, career opportunities she never would have seen staying in the city</li>
            <li>Six years in, she's found a community and lifestyle that makes <strong>going back feel unimaginable</strong></li>
          </ul>
        </div>
      </div>
      </div>
    </div>

    <!-- READY TO EXPLORE CTA -->
    <section class="final-cta">
      <div class="final-cta-overlay"></div>
      <div class="final-cta-inner">
        <h2>Ready to explore real placements?</h2>
        <p>Browse 645 schools across QLD and NSW. Filter by pay, remoteness, and lifestyle then decide.</p>
        <div class="final-cta-btns">
          <button class="btn-hero-p" @click="$emit('navigate', 'explorer')">Find your school</button>
          <button class="btn-hero-s" @click="$emit('navigate', 'insights')">Know the Place</button>
        </div>
      </div>
    </section>

  <!-- HOW-IT-WORKS MODAL -->
  <Teleport to="body">
    <Transition name="hmodal">
      <div v-if="activeModal" class="hm-backdrop" @click.self="closeModal">
        <div class="hm-panel">
          <button class="hm-close" @click="closeModal">✕</button>
          <div class="hm-img" :style="{ backgroundImage: `url('${modals[activeModal].image}')` }"></div>
          <div class="hm-body">
            <div class="hm-tag">{{ modals[activeModal].tag }}</div>
            <h3 class="hm-title">{{ modals[activeModal].title }}</h3>
            <ul class="hm-list">
              <li v-for="item in modals[activeModal].items" :key="item">{{ item }}</li>
            </ul>
            <div class="hm-source">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              {{ modals[activeModal].source }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import heroImage from '../assets/hero.jpg'

const emit = defineEmits(['navigate', 'view-lifestyle'])

const scrollPct = ref(0)
const heroParallaxY = ref(0)

const heroVideoStyle = computed(() => ({
  backgroundImage: `url(${heroImage})`,
}))


// ── Story iframe autoplay on scroll ──
const storyFrameEl = ref(null)
const FB_SRC = 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1667299444305344&show_text=false&width=560&autoplay=1&mute=1'
const FB_SRC_PAUSED = 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1667299444305344&show_text=false&width=560&autoplay=0&mute=0'

// ── How-it-works modals ──
const activeModal = ref(null)

const modals = {
  search: {
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=900',
    tag: 'Step 01 · Find Schools',
    title: 'How incentive packages work',
    items: [
      'More remote = higher payment. Simple as that',
      'NSW: up to $30k/yr. QLD: up to $11k/yr. Paid fortnightly',
      'NSW stacks on $5k/yr retention on top. Runs for up to 10 years.',
      '645 schools. All figures straight from government policy',
    ],
    source: 'QLD Directive 16/18 · NSW RTI Review 2020',
    cta: { label: 'Open Explorer', nav: 'explorer' },
  },
  rural: {
    image: 'https://images.pexels.com/photos/1687093/pexels-photo-1687093.jpeg?auto=compress&cs=tinysrgb&w=900',
    tag: 'Step 02 · Know the Place',
    title: 'What the lifestyle metrics measure',
    items: [
      'Healthcare nearby. Clinics and hospitals within your area.',
      'Rent: what locals actually pay, not city averages',
      'Distance to the nearest city. Know what you\'re signing up for.',
      'Nature access: parks and reserves on your doorstep',
    ],
    source: 'ABS Census 2021 · ACARA My School 2025',
    cta: { label: 'View Know the Place', nav: 'insights' },
  },
  compare: {
    image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=900',
    tag: 'Step 03 · Compare',
    title: 'Comparing schools side by side',
    items: [
      'Pin up to 4 schools. Hit Compare on any listing.',
      'Pay + lifestyle side by side in one table',
      'Mix QLD and NSW schools freely',
      'No login, no account. Works right now.',
    ],
    source: 'ABS Census 2021 · QLD Directive 16/18 · NSW RTI Review 2020',
    cta: { label: 'Start comparing', nav: 'explorer' },
  },

  // Why-section modals
  financial: {
    image: 'https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?auto=compress&cs=tinysrgb&w=900',
    tag: 'Financial',
    title: 'Up to $30k extra. Every year.',
    items: [
      'NSW pays $20k, $25k, or $30k/yr depending on how remote you go',
      'QLD adds up to $11,470/yr on top. Locality allowance, paid fortnightly',
      'NSW also stacks on $5k/yr retention for up to 10 years',
      'It hits your account every pay cycle. Not a one-off at year end.',
    ],
    source: 'QLD Directive 16/18 · NSW RTI Review 2020',
    cta: { label: 'See which schools pay most', nav: 'explorer' },
  },
  cost: {
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=900',
    tag: 'Cost of Living',
    title: 'Your money goes further out there.',
    items: [
      'Rent can be 60% cheaper than Sydney',
      'Many postings offer subsidised government housing',
      'No tolls, no $15 coffees, no $8 city parking',
      'Groceries do cost more remotely. Worth factoring in.',
    ],
    source: 'ABS Census 2021, SA2 household data',
    cta: { label: 'Check rent data by school', nav: 'insights' }, hideCta: true,
  },
  career: {
    image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=900',
    tag: 'Career',
    title: 'Acting HoD in your 20s? Common.',
    items: [
      'Fewer staff = real leadership. Not a title you wait a decade for.',
      'Teach across year levels and subjects. Builds skills fast.',
      'Permanent placements fill quicker in regional areas',
      'Experience that stands out when you return to the city',
    ],
    source: 'QLD Dept of Education case studies · AITSL Workforce Data',
    cta: { label: 'Find your school', nav: 'explorer' },
  },
  community: {
    image: 'https://www.healthworkforce.com.au/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMTEyTGc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--df26c928a3624325d84754867c7244d3b3b3d058/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2QzNKbGMybDZaVWtpRFRnd01IZzRNREE4QmpzR1ZBPT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--9dd97854259a2667a77c23567cd4e48d29891f7c/Blog%20Images_V2.jpg',
    tag: 'Community',
    title: 'People know your name.',
    items: [
      'Families greet you at the shops. The relationship is real.',
      'You might be the first uni grad some of your students ever meet',
      'Watch the same kids grow up over years, not just one term',
      'Small town, genuine belonging. Not just another face in a staffroom.',
    ],
    source: 'AITSL Workforce Data · ABS 2021 Remote Community profiles',
    cta: { label: 'Explore regional schools', nav: 'explorer' },
  },
}

function openModal(key) {
  activeModal.value = key
  document.body.style.overflow = 'hidden'
}
function closeModal() {
  activeModal.value = null
  document.body.style.overflow = ''
}
function onKeydown(e) { if (e.key === 'Escape') closeModal() }

function onScroll() {
  const el = document.documentElement
  const scrolled = el.scrollTop || document.body.scrollTop
  const total = el.scrollHeight - el.clientHeight
  scrollPct.value = total > 0 ? (scrolled / total) * 100 : 0
  heroParallaxY.value = scrolled
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target) } }),
    { threshold: 0.1 }
  )
  document.querySelectorAll('.fade-section').forEach(el => observer.observe(el))

  const cardObserver = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); cardObserver.unobserve(e.target) } }),
    { threshold: 0.12 }
  )
  document.querySelectorAll('.why-card, .how-card').forEach(el => cardObserver.observe(el))

  if (storyFrameEl.value) {
    storyFrameEl.value.src = FB_SRC_PAUSED
    const frameObserver = new IntersectionObserver(
      ([entry]) => {
        if (storyFrameEl.value) {
          storyFrameEl.value.src = entry.isIntersecting ? FB_SRC : FB_SRC_PAUSED
        }
      },
      { threshold: 0.5 }
    )
    frameObserver.observe(storyFrameEl.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>

.story-title-blue { color: var(--blue); }

/* TEACHER STORY — plain split layout, no box */
.story-plain-wrap {
  padding: 48px 80px;
  background: var(--bg);
}
.story-plain-card {
  max-width: 1080px;
  margin: 0 auto;
  background: var(--s2);
  border: 1px solid var(--b);
  border-radius: 20px;
  padding: 36px 48px 48px;
  box-shadow: 0 2px 12px rgba(26,23,20,0.06);
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.story-plain-split {
  display: flex;
  align-items: stretch;
  gap: 48px;
}
.story-plain-player {
  flex: 0 0 34%;
  aspect-ratio: 9 / 16;
}
.story-video-card {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  background: #0d1f3c;
  box-shadow: 0 12px 40px rgba(0,0,0,0.22);
}
.story-plain-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
.story-plain-text {
  flex: 1;
  display: grid;
  align-content: center;
  gap: 12px;
}
.story-eyebrow-centered {
  text-align: center;
}
.story-plain-context {
  font-size: 0.9rem;
  color: var(--ink3);
  line-height: 1.6;
  margin: 0;
}
.story-plain-h {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3vw, 2.8rem);
  font-weight: 900;
  color: var(--ink);
  line-height: 1.1;
  margin: 2px 0 0;
}
.story-plain-desc {
  font-size: 0.94rem;
  color: var(--ink2);
  line-height: 1.65;
  margin: 0;
}
.story-plain-points {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.story-plain-points li {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.93rem;
  color: var(--ink2);
  line-height: 1.55;
  padding-left: 1.1em;
  position: relative;
}
.story-plain-points li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--blue);
  font-weight: 700;
}
.story-plain-points li strong { color: var(--ink); font-weight: 700; }

@media (max-width: 900px) {
  .story-plain-wrap { padding: 32px 24px; }
  .story-plain-card { padding: 32px; }
  .story-plain-player { flex: 0 0 38%; }
  .story-plain-split { gap: 32px; }
}
@media (max-width: 640px) {
  .story-plain-wrap { padding: 24px 16px; }
  .story-plain-card { padding: 24px 20px; }
  .story-plain-split { flex-direction: column; gap: 24px; }
  .story-plain-player { flex: 0 0 auto; width: 72vw; max-width: 260px; }
}

/* SCROLL PROGRESS */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #1F6FEB, #1E9E56);
  z-index: 9999;
  transition: width 0.1s linear;
  pointer-events: none;
}

/* APPLE-STYLE ANIMATIONS */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes appleReveal {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes heroIn {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Scroll reveals — Apple spring easing */
.fade-section { opacity: 0; transform: translateY(22px); }
.fade-section.in-view { animation: fadeUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

/* Hero entrance — staggered on page load */
.cin-eyebrow   { animation: heroIn 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.10s both; }
.cin-hero-h1   { animation: heroIn 0.90s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both; }
.cin-hero-acts { animation: heroIn 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.54s both; }
.hero-trust-strip { animation: heroIn 0.80s cubic-bezier(0.22, 1, 0.36, 1) 0.76s both; }

.btn-hero-p {
  padding: 16px 32px;
  background: #1F6FEB;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  box-shadow: 0 4px 20px rgba(31,111,235,0.35);
}
.btn-hero-p:hover { background: #1558C4; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(31,111,235,0.45); }

.btn-hero-s {
  padding: 16px 32px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-hero-s:hover { background: rgba(255,255,255,0.18); }

.hstat { flex: 1; text-align: center; }
.hstat-n { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 900; color: #fff; line-height: 1; margin-bottom: 5px; }
.hstat-l { font-size: 0.74rem; font-weight: 600; color: rgba(255,255,255,0.45); letter-spacing: 0.06em; text-transform: uppercase; }
.hstat-sep { width: 1px; height: 40px; background: rgba(255,255,255,0.12); }

/* WHY REGIONAL */
.why-section {
  background: var(--bg);
  padding: 40px 24px 0;
  border-bottom: none;
  border-top: 1px solid var(--b);
}
.why-inner { max-width: 1200px; margin: 0 auto; }
.why-inner h2 { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 900; line-height: 1.12; margin-bottom: 6px; color: var(--ink); }
.why-inner .section-header p { color: var(--ink2); }
.why-inner > .section-header { margin-bottom: 40px; }

.why-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 8px; }

.why-disclaimer {
  margin-top: 24px;
  font-size: 0.7rem;
  color: var(--ink3);
  text-align: center;
  line-height: 1.6;
  padding: 0 16px;
}

/* ── CINEMATIC SECTION ── */
@keyframes kenBurns {
  0%   { transform: scale(1)    translate(0%,    0%); }
  50%  { transform: scale(1.10) translate(-1.5%, 1%); }
  100% { transform: scale(1)    translate(0%,    0%); }
}


.cin-section {
  position: relative;
  height: 93vh;
  min-height: 580px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cin-bg {
  position: absolute;
  inset: -5%;
  background-image: url('https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=2200');
  background-size: cover;
  background-position: center 48%;
  animation: kenBurns 18s ease-in-out infinite;
  will-change: transform;
}

.cin-video-bg {
  position: absolute;
  inset: -8px;
  background-size: cover;
  background-position: center 20%;
  filter: blur(2px);
  z-index: 0;
}

.story-cin-section .cin-bg {
  transition: opacity 0.4s ease;
}

.cin-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 43%, rgba(13,31,60,0.03) 0%, rgba(13,31,60,0.10) 44%, rgba(8,20,40,0.22) 100%),
    linear-gradient(to bottom, rgba(8,20,40,0.12) 0%, rgba(8,20,40,0.04) 36%, rgba(8,20,40,0.28) 100%);
}

.cin-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px 64px;
  text-align: center;
}

/* Slide 1: hero content */
.cin-eyebrow {
  width: fit-content;
  margin: 0 auto 18px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(232,241,253,0.14);
  border: 1px solid rgba(147,197,253,0.42);
  box-shadow: 0 8px 30px rgba(13,31,60,0.24);
  backdrop-filter: blur(10px);
  font-size: 1.03rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #F8FBFF;
  text-shadow: 0 2px 12px rgba(0,0,0,0.35);
}
.cin-hero-h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.4rem, 3.6vw, 3.2rem);
  font-weight: 900;
  line-height: 1.1;
  color: #fff;
  margin-bottom: 20px;
  letter-spacing: 0;
  text-shadow: 0 3px 28px rgba(0,0,0,0.52);
  text-align: center;
}
.cin-hero-h1 em {
  color: #7DB4FF;
  font-style: italic;
  text-shadow: 0 0 28px rgba(31,111,235,0.52), 0 3px 20px rgba(0,0,0,0.44);
}
.cin-hero-sub {
  font-size: 1.12rem;
  font-weight: 650;
  color: rgba(255,255,255,0.86);
  line-height: 1.72;
  margin-bottom: 32px;
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 2px 16px rgba(0,0,0,0.42);
}
.cin-hero-acts { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

.hero-trust-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-width: 620px;
  margin: 0 auto 32px;
}
.hero-trust-tile {
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  padding: 12px 16px;
  text-align: left;
}
.hero-trust-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 3px;
}
.hero-trust-sub {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.60);
  line-height: 1.5;
}

/* Stats bar at bottom of cinematic hero */
.cin-stats-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 22px 80px;
  background: rgba(0,0,0,0.45);
  border-top: 1px solid rgba(255,255,255,0.08);
}

.cin-slide {
  position: absolute;
  width: 100%;
  max-width: 760px;
  opacity: 0;
  transform: translateY(12px);
  pointer-events: none;
  transition: opacity 0.55s ease, transform 0.55s ease;
  z-index: 0;
}
.cin-slide--active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  z-index: 1;
}

/* Photo credit watermark */
.cin-photo-credit {
  position: absolute;
  bottom: 72px;
  right: 16px;
  z-index: 3;
  font-size: 0.62rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.03em;
}
.cin-photo-credit a { color: rgba(255,255,255,0.45); text-decoration: none; }
.cin-photo-credit a:hover { color: rgba(255,255,255,0.7); text-decoration: underline; }

/* Why card stagger animations — Apple scale reveal */
.why-card { opacity: 0; transform: translateY(20px) scale(0.96); }
.why-card.in-view { animation: appleReveal 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.why-grid .why-card:nth-child(1).in-view { animation-delay: 0.00s; }
.why-grid .why-card:nth-child(2).in-view { animation-delay: 0.10s; }
.why-grid .why-card:nth-child(3).in-view { animation-delay: 0.20s; }
.why-grid .why-card:nth-child(4).in-view { animation-delay: 0.30s; }

.why-card {
  background: var(--s);
  border: 1px solid var(--b);
  border-radius: 16px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
}
.why-card:hover {
  background: var(--s2);
  border-color: var(--b2);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  transform: translateY(-3px);
}

.why-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; flex-shrink: 0; }
.why-financial .why-icon { background: #d1fae5; color: #059669; }
.why-cost .why-icon { background: #dbeafe; color: #2563eb; }
.why-career .why-icon { background: #fef3c7; color: #d97706; }
.why-community .why-icon { background: #ede9fe; color: #7c3aed; }

.why-label { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
.why-financial .why-label { color: #059669; }
.why-cost .why-label { color: #2563eb; }
.why-career .why-label { color: #d97706; }
.why-community .why-label { color: #7c3aed; }

.why-title { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 900; color: var(--ink); line-height: 1.2; margin-bottom: 4px; }
.why-body { font-size: 0.85rem; color: rgba(255,255,255,0.65); line-height: 1.7; }
.why-body li { padding-left: 0.25rem; margin-bottom: 4px; }
.why-body { padding-left: 1.1rem; margin: 4px 0 0; }
.why-card-learn { font-size: 0.78rem; font-weight: 700; color: var(--blue); margin-top: 10px; transition: color 0.15s; }
.why-card:hover .why-card-learn { color: rgba(255,255,255,0.8); }

/* TEACHER STORY */
.story-cin-section {
  height: 58vh;
  min-height: 460px;
  max-height: 600px;
  border-top: 1px solid rgba(255,255,255,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  opacity: 0;
  transform: translateY(20px);
}
.story-cin-section.in-view {
  animation: fadeUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.cin-tag-pill {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.18);
  padding: 5px 14px;
  border-radius: 999px;
  white-space: nowrap;
  backdrop-filter: blur(4px);
  display: inline-block;
  margin-bottom: 16px;
}
.cin-location {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #93c5fd;
  margin-bottom: 16px;
}
.cin-headline {
  font-family: 'Playfair Display', serif;
  font-size: 4.2rem;
  font-weight: 900;
  color: #fff;
  line-height: 1.08;
  text-shadow: 0 2px 24px rgba(0,0,0,0.4);
}
.cin-sub {
  font-size: 0.88rem;
  color: rgba(255,255,255,0.65);
  letter-spacing: 0.04em;
  margin-bottom: 20px;
}
.cin-journey {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
.cj-stop {
  font-size: 1.3rem;
  font-weight: 700;
  color: rgba(255,255,255,0.75);
}
.cj-stop--dest {
  font-size: 1.7rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 20px rgba(96,165,250,0.6);
}
.cj-arr {
  color: rgba(255,255,255,0.4);
  font-size: 1.4rem;
  font-weight: 300;
  line-height: 1;
}
.cin-qmark {
  font-family: 'Playfair Display', serif;
  font-size: 6rem;
  color: #60A5FA;
  line-height: 0.7;
  margin-bottom: 12px;
}
.cin-qtext {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.55;
  max-width: 640px;
  margin: 0 auto 14px;
  font-style: italic;
}
.cin-qattr {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.06em;
}
.section-header { margin-bottom: 40px; text-align: center;}
.section-header.centered { text-align: center; }
.section-eyebrow { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--blue); margin-bottom: 10px; display: inline-block; }
.section-header h2 { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 900; line-height: 1.12; margin-bottom: 10px; }
.section-header p { font-size: 0.96rem; color: var(--ink2); }

/* COMPACT DECISION NARRATIVE */
.decision-section {
  background: var(--bg);
  padding: 44px 24px 30px;
  border-top: 1px solid var(--b);
}
.regional-section {
  background: var(--bg);
  padding: 44px 24px 52px;
  border-top: 1px solid var(--b);
}

/* PROOF CARDS — regional benefits grid */
.proof-card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-width: 1180px;
  margin: 0 auto;
}
.proof-card {
  background: var(--s);
  border: 1px solid var(--b);
  border-radius: 12px;
  padding: 20px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
}
.proof-card:hover {
  border-color: var(--b2);
  box-shadow: 0 6px 22px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}
.proof-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  flex-shrink: 0;
}
.proof-icon-green { background: #d1fae5; color: #059669; }
.proof-icon-blue  { background: #dbeafe; color: #2563eb; }
.proof-icon-amber { background: #fef3c7; color: #d97706; }
.proof-icon-purple { background: #ede9fe; color: #7c3aed; }
.proof-card-cat {
  font-size: 0.60rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.cat-green  { color: #059669; }
.cat-blue   { color: #2563eb; }
.cat-amber  { color: #d97706; }
.cat-purple { color: #7c3aed; }
.proof-card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  font-weight: 900;
  color: var(--ink);
  line-height: 1.2;
  margin: 3px 0 8px;
}
.proof-card-link {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--blue);
  margin-top: auto;
}
.decision-inner {
  max-width: 1180px;
  margin: 0 auto;
}
.decision-header {
  max-width: 760px;
  margin: 0 auto 24px;
  text-align: center;
}
.decision-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.65rem, 3vw, 2.45rem);
  font-weight: 900;
  line-height: 1.08;
  color: var(--ink);
  margin: 0 0 10px;
}
.decision-header p {
  max-width: 620px;
  margin: 0 auto;
  color: var(--ink2);
  font-size: 0.96rem;
  line-height: 1.65;
}
.decision-grid {
  display: grid;
  grid-template-columns: 1.12fr 0.88fr;
  gap: 16px;
  align-items: stretch;
}
.decision-panel {
  background: rgba(255,255,255,0.76);
  border: 1px solid var(--b);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 16px 36px rgba(42, 35, 24, 0.07);
}
.panel-kicker {
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--ink3);
  margin-bottom: 12px;
}
.proof-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.proof-panel .panel-kicker {
  grid-column: 1 / -1;
}
.flow-steps,
.proof-grid {
  display: grid;
  gap: 14px;
}
.flow-steps {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.proof-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.proof-row,
.process-row {
  width: 100%;
  border: 1px solid rgba(217,211,202,0.9);
  border-radius: 10px;
  background: #fff;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.16s, background 0.16s, transform 0.16s, box-shadow 0.16s;
}
.proof-row {
  min-height: 160px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 13px;
  align-items: start;
  padding: 16px;
}
.proof-row:hover,
.process-row:hover {
  border-color: rgba(31,111,235,0.35);
  background: #fbfaf5;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(42,35,24,0.07);
}
.proof-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}
.proof-green { background: #d1fae5; color: #059669; }
.proof-gold { background: #dbeafe; color: #2563eb; }
.proof-rust { background: #fef3c7; color: #d97706; }
.proof-teal { background: #ede9fe; color: #7c3aed; }
.proof-row strong,
.process-row strong {
  display: block;
  color: var(--ink);
  font-size: 0.9rem;
  line-height: 1.25;
  margin-bottom: 3px;
}
.proof-row small,
.process-row small {
  display: block;
  color: var(--ink2);
  font-size: 0.74rem;
  line-height: 1.45;
}
.proof-row em,
.process-row em {
  display: inline-block;
  margin-top: 5px;
  color: var(--blue);
  font-size: 0.68rem;
  font-style: normal;
  font-weight: 900;
}
.process-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.process-row {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 14px;
  align-items: center;
  min-height: 130px;
  padding: 18px;
}
.process-num {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 900;
  color: var(--blue);
  line-height: 1;
}
/* HOW STEPS */
.how-section { background: var(--bg); padding: 36px 24px; border-bottom: 1px solid var(--b); }
.how-inner { max-width: 1200px; margin: 0 auto; }
.how-inner .section-header { margin-bottom: 24px; }

.how-cards { display: flex; align-items: stretch; gap: 0; }
.how-connector { display: flex; align-items: center; justify-content: center; color: var(--b); flex-shrink: 0; padding: 0 4px; margin-top: -40px; }

.how-card { flex: 1; background: var(--s); border: 1px solid var(--b); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; transition: box-shadow 0.18s; }
.how-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.08); }

.how-card { opacity: 0; transform: translateY(20px) scale(0.96); }
.how-card.in-view { animation: appleReveal 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.how-cards .how-card:nth-child(1).in-view { animation-delay: 0.00s; }
.how-cards .how-card:nth-child(3).in-view { animation-delay: 0.14s; }
.how-cards .how-card:nth-child(5).in-view { animation-delay: 0.28s; }

.how-card-img { height: 160px; background-size: cover; background-position: center; }
.img-search {
  background-image: url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800');
  filter: grayscale(30%) brightness(0.88);
}
.img-rural {
  background-image: url('https://images.pexels.com/photos/1687093/pexels-photo-1687093.jpeg?auto=compress&cs=tinysrgb&w=800');
  filter: grayscale(25%) brightness(0.85);
}
.img-compare {
  background-image: url('https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800');
  filter: grayscale(30%) brightness(0.88);
}

.how-card { cursor: pointer; }
.how-card:hover { box-shadow: 0 12px 36px rgba(0,0,0,0.12); transform: translateY(-3px); }
.how-card:hover .how-card-img { filter: brightness(1) !important; }
.how-card-body { padding: 24px 28px; display: flex; flex-direction: column; flex: 1; }
.how-card-num { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 900; color: var(--b); line-height: 1; margin-bottom: 6px; }
.how-card-title { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 900; margin-bottom: 8px; }
.how-card-text { font-size: 0.84rem; color: var(--ink2); line-height: 1.68; margin-bottom: 16px; flex: 1; }
.how-card-learn { font-size: 0.8rem; font-weight: 700; color: var(--blue); align-self: flex-start; }
.btn-ghost { padding: 9px 20px; background: transparent; color: var(--blue); border: 1.5px solid var(--blue); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.14s; align-self: flex-start; }
.btn-ghost:hover { background: var(--blue-s); }

/* ── HOW-IT-WORKS MODAL ── */
.hm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(8,16,32,0.72);
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(4px);
}
.hm-panel {
  background: var(--s);
  border-radius: 18px;
  width: 100%;
  max-width: 840px;
  max-height: 88vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: 340px 1fr;
  position: relative;
  box-shadow: 0 32px 80px rgba(0,0,0,0.4);
}
.hm-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  background: rgba(0,0,0,0.45);
  border: none;
  border-radius: 99px;
  width: 32px;
  height: 32px;
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.hm-close:hover { background: rgba(0,0,0,0.7); }
.hm-img {
  background-size: cover;
  background-position: center;
  min-height: 320px;
}
.hm-body {
  padding: 36px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.hm-tag {
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue);
  margin-bottom: 10px;
}
.hm-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.45rem;
  font-weight: 900;
  line-height: 1.2;
  color: var(--ink);
  margin-bottom: 18px;
}
.hm-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hm-list li {
  font-size: 0.86rem;
  color: var(--ink2);
  line-height: 1.65;
  padding-left: 18px;
  position: relative;
}
.hm-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--blue);
  font-size: 0.78rem;
  top: 2px;
}
.hm-source {
  font-size: 0.72rem;
  color: var(--ink3);
  line-height: 1.5;
  margin-bottom: 24px;
  display: flex;
  gap: 6px;
  align-items: flex-start;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--b);
}
.hm-source svg { flex-shrink: 0; margin-top: 1px; }
.hm-cta { align-self: flex-start; }

/* Modal transition */
.hmodal-enter-active { transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.22,1,0.36,1); }
.hmodal-leave-active { transition: opacity 0.18s ease, transform 0.2s ease; }
.hmodal-enter-from  { opacity: 0; transform: scale(0.95); }
.hmodal-leave-to    { opacity: 0; transform: scale(0.95); }

/* TRUST STRIP */
.trust-strip { background: var(--s); border-top: 1px solid var(--b); padding: 32px 0; }
.trust-inner { padding: 0 80px; display: flex; align-items: center; }
.trust-item { flex: 1; text-align: center; padding: 0 24px; }
.trust-icon { width: 42px; height: 42px; border-radius: 11px; background: var(--blue-s); color: var(--blue); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
.trust-title { font-size: 0.92rem; font-weight: 700; margin-bottom: 5px; }
.trust-text { font-size: 0.79rem; color: var(--ink2); line-height: 1.55; }
.trust-div { width: 1px; height: 52px; background: var(--b); flex-shrink: 0; }

.hero-trust-strip {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding: 14px 80px;
  background: #253045;
  border-top: 1px solid rgba(255,255,255,0.12);
}
.hero-trust-strip .trust-item { flex: 1; text-align: center; padding: 0 20px; }
.hero-trust-strip .trust-icon { width: 32px; height: 32px; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.9); margin: 0 auto 6px; }
.hero-trust-strip .trust-title { color: #fff; font-size: 0.88rem; text-shadow: 0 1px 8px rgba(0,0,0,0.6); }
.hero-trust-strip .trust-text { color: rgba(255,255,255,0.85); font-size: 0.72rem; text-shadow: 0 1px 6px rgba(0,0,0,0.5); }
.hero-trust-div { width: 1px; height: 32px; background: rgba(255,255,255,0.15); flex-shrink: 0; }

/* FINAL CTA */
.final-cta {
  position: relative;
  padding: 60px 0;
  background: linear-gradient(135deg, #0D1F3C 0%, #1A3557 50%, #0F2D4A 100%);
  overflow: hidden;
}

.final-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 30% 50%, rgba(31,111,235,0.15) 0%, transparent 50%),
    radial-gradient(circle at 75% 30%, rgba(30,158,86,0.08) 0%, transparent 40%);
  pointer-events: none;
}

.final-cta-overlay { display: none; }

.final-cta-inner { position: relative; z-index: 1; text-align: center; padding: 0 80px; max-width: 680px; margin: 0 auto; }
.final-cta-inner h2 { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 900; color: #fff; margin-bottom: 14px; line-height: 1.15; }
.final-cta-inner p { font-size: 1rem; color: rgba(255,255,255,0.62); line-height: 1.7; margin-bottom: 30px; }
.final-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

/* STATE SPLIT SECTION */
.state-split-section {
  background: var(--bg);
  padding: 0 24px 64px;
}
.state-split-header {
  max-width: 580px;
  margin: 0 auto;
  text-align: center;
  padding: 28px 0 22px;
}
.state-split-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  font-weight: 900;
  line-height: 1.1;
  color: var(--ink);
  margin: 5px 0 8px;
}
.state-split-header p {
  color: var(--ink2);
  font-size: 0.88rem;
  line-height: 1.6;
}
.state-split-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  min-height: 260px;
  max-width: 1280px;
  margin: 0 auto;
}
.state-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 250px;
  border-radius: 8px;
  box-shadow: 0 18px 44px rgba(42, 35, 24, 0.12);
}
.state-card-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.55s ease;
}
.state-bg-qld {
  background-color: #0e2310;
  background-image: url('https://commons.wikimedia.org/wiki/Special:FilePath/1%20-%20Atherton%20Tableland%2C%20Queensland%2C%20Australia.jpg');
  background-position: center 50%;
}
.state-bg-nsw {
  background-color: #0d1f3c;
  background-image: url('https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=900');
  background-position: center 42%;
}
.state-card:hover .state-card-bg { transform: scale(1.04); }
.state-card-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(6,14,36,0.92) 0%, rgba(6,14,36,0.72) 38%, rgba(6,14,36,0.28) 76%, rgba(6,14,36,0.12) 100%),
    linear-gradient(to top, rgba(6,14,36,0.86) 0%, rgba(6,14,36,0.36) 58%, rgba(6,14,36,0.18) 100%);
}
.state-card-content {
  position: relative;
  z-index: 2;
  padding: 22px 28px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 250px;
}
.state-chip {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.63rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 12px;
  width: fit-content;
}
.state-chip-qld { background: rgba(31,111,235,0.22); color: #7DB4FF; border: 1px solid rgba(125,180,255,0.35); }
.state-chip-nsw { background: rgba(31,111,235,0.22); color: #7DB4FF; border: 1px solid rgba(125,180,255,0.35); }
.state-card-h {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem;
  font-weight: 900;
  color: #fff;
  line-height: 1.05;
  margin-bottom: 7px;
  text-shadow: 0 2px 16px rgba(0,0,0,0.4);
}
.state-card-desc {
  font-size: 0.79rem;
  color: rgba(255,255,255,0.68);
  line-height: 1.58;
  margin-bottom: 14px;
  max-width: 340px;
}
.state-stats {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.state-stat-val {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 900;
  color: #fff;
}
.state-stat-lab {
  font-size: 0.61rem;
  color: rgba(255,255,255,0.50);
  font-weight: 600;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.state-stat-div {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.18);
  flex-shrink: 0;
}

/* MOBILE */
@media (max-width: 900px) {
  .cin-section { height: 100vh; min-height: 480px; }
  .cin-hero-h1 { font-size: 2.6rem; }
  .cin-eyebrow { font-size: 0.78rem; letter-spacing: 0.1em; padding: 7px 12px; }
  .cin-hero-sub { font-size: 0.95rem; }
  .cin-stats-bar { padding: 16px 20px; flex-wrap: wrap; gap: 12px; }
  .hstat { min-width: 90px; }
  .hstat-sep { display: none; }
  .why-section { padding: 48px 16px; }
  .why-grid { grid-template-columns: 1fr; gap: 12px; }
  .decision-section { padding: 38px 16px 28px; }
  .regional-section { padding: 28px 16px 38px; }
  .decision-grid { grid-template-columns: 1fr; }
  .flow-steps,
  .proof-grid { grid-template-columns: 1fr; }
  .proof-card-grid { grid-template-columns: 1fr 1fr; }
  .proof-row { min-height: 0; }
  .process-row { min-height: 0; }
  .state-split-section { padding: 0 16px 44px; }
  .state-split-grid { grid-template-columns: 1fr; gap: 14px; }
  .state-card { min-height: 230px; }
  .state-card-content { padding: 18px 20px; min-height: 230px; }
  .state-split-header { padding: 22px 0 16px; }
  .state-card-h { font-size: 1.35rem; }
  .proof-panel { grid-template-columns: 1fr; }
  .decision-panel { padding: 14px; }
  .cin-headline { font-size: 2.6rem; }
  /* ── How-cards: horizontal swipe ── */
  .how-section { padding: 48px 0; }
  .how-section .section-header { padding: 0 24px; }
  .how-cards {
    flex-direction: row;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 0;
    padding: 4px 24px 20px;
    align-items: stretch;
  }
  .how-cards::-webkit-scrollbar { display: none; }
  .how-card {
    flex: 0 0 78vw;
    max-width: 300px;
    scroll-snap-align: start;
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }
  .how-connector { flex-shrink: 0; transform: none; margin: auto 0; padding: 0 6px; }
  .how-cards::after { content: ''; flex: 0 0 10px; }
  .how-card-img { height: 140px; }
  .hm-panel { grid-template-columns: 1fr; max-height: 92vh; }
  .hm-img { min-height: 200px; }
  .hm-body { padding: 24px 20px; }
  .trust-strip { padding: 20px 0; }
  .trust-inner { flex-wrap: wrap; padding: 0 24px; }
  .trust-item { min-width: 160px; padding: 16px; }
  .trust-div { display: none; }
  .section-header h2 { font-size: 1.9rem; }
  .final-cta { padding: 64px 0; }
  .final-cta-inner { padding: 0 24px; }
  .final-cta-inner h2 { font-size: 1.9rem; }
}

@media (max-width: 540px) {
  .proof-card-grid { grid-template-columns: 1fr; }
  .cin-hero-h1 { font-size: 2.1rem; }
  .btn-hero-p, .btn-hero-s { width: 100%; display: block; text-align: center; }
  .cin-hero-acts { flex-direction: column; }
  .story-plain-wrap { padding: 28px 16px 36px; }
  .story-plain-split { flex-direction: column; gap: 20px; }
  .story-plain-h { font-size: 1.8rem; }
  .how-step-body { padding: 28px 20px; }
}
</style>

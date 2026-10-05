import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ABOUT,
  CREDENTIALS,
  EXPERIENCE,
  LINKS,
  PROJECTS,
} from './content'
import {
  gsap,
  ScrollTrigger,
  SplitText,
  prefersReducedMotion,
} from './lib/motion'
import { createDrawable, stagger } from 'animejs'
import { useScrollAnime } from './lib/scrollAnime'
import { BorderBeam } from './BorderBeam'
import { LollipopCarousel, type LollipopItem } from './LollipopCarousel'
import { AnimatePresence, motion } from 'framer-motion'
import { CertificateCoverflow, type CoverflowItem } from './CertificateCoverflow'
import { GooeyDropdown } from './GooeyDropdown'
import { ParticleButton } from './ParticleButton'
import { DossierFile } from './DossierFile'
import { SkillOrbit } from './SkillOrbit'
import { ThreadTimeline, type ThreadNode } from './ThreadTimeline'
import { ContactOrbit } from './ContactOrbit'

// Sections sit over the fixed avatar video (rendered in App). A consistent
// translucent scrim + light frost keeps the video visible everywhere while
// text stays legible — the same treatment top to bottom, so no seam.
export const SECTION_BG = 'rgba(8,8,13,0.46)'
const PROSE_SHADOW = '0 1px 20px rgba(0,0,0,0.6)'
const PROJECT_ACCENTS: Record<string, string> = {
  '01': '#f87171',
  '02': '#f59e0b',
  '03': '#34d399',
  '04': '#a78bfa',
  '05': '#38bdf8',
  '06': '#fb7185',
}

const ISSUER_ACCENTS: Record<string, string> = {
  Microsoft: '#f87171',
  IBM: '#38bdf8',
  Coursera: '#a78bfa',
  Udemy: '#f59e0b',
  CipherSchools: '#34d399',
  'Infosys Springboard': '#fb7185',
  Google: '#fbbf24',
}

const PROJECT_DOMAINS: Record<string, string[]> = {
  genai: ['01', '05', '06'],
  nlp: ['02'],
  ml: ['03', '04'],
}

const WORK_FILTERS = [
  { label: 'All projects', value: 'all' },
  { label: 'GenAI & Agents', value: 'genai' },
  { label: 'NLP', value: 'nlp' },
  { label: 'ML & Data', value: 'ml' },
]

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  )
}

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Projects without a reachable demo screenshot get generated art in the same
// language the rest of the site uses: accent wash on near-black, index numeral
// and title (the capsules show the art at rest, so it carries the name).
function projectArt(index: string, title: string, accent: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
<defs><radialGradient id="g" cx="0.25" cy="0.2" r="1"><stop offset="0" stop-color="${accent}" stop-opacity="0.55"/><stop offset="0.6" stop-color="#0c0508"/></radialGradient></defs>
<rect width="1200" height="800" fill="#0b0508"/><rect width="1200" height="800" fill="url(#g)"/>
<text x="1160" y="360" text-anchor="end" font-family="Helvetica Neue, Arial, sans-serif" font-size="420" font-weight="700" fill="#ffffff" fill-opacity="0.08">${index}</text>
<text x="70" y="660" font-family="Menlo, Consolas, monospace" font-size="30" fill="#ffffff" fill-opacity="0.55">${index}</text>
<text x="70" y="730" font-family="Helvetica Neue, Arial, sans-serif" font-size="58" font-weight="600" fill="#ffffff">${escapeXml(title)}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const certSlug = (href: string) => href.split('/').pop()?.replace(/\.(pdf|png)$/i, '') ?? ''


export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const rulePath = el.querySelector<SVGPathElement>('.rule-path')

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 })
      if (rulePath) gsap.set(rulePath, { strokeDashoffset: 0 })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        delay: delay / 1000,
      })
      tl.fromTo(
        el,
        { opacity: 0, y: 28, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' },
      )
      if (rulePath) {
        tl.fromTo(
          rulePath,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' },
          '-=0.4',
        )
      }
    })

    return () => ctx.revert()
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Scrubbed with scroll (anime.js): a huge outlined index numeral drifts in
// behind the title, the title's letters flip up one after another, and the
// wavy rule draws itself — all reversible by scrolling back up.
export function SectionHeader({
  index,
  title,
}: {
  index: string
  title: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useScrollAnime(
    ref,
    (tl, el) => {
      tl.add(el.querySelector('.sh-ghost')!, { translateX: ['22%', '0%'], opacity: [0, 1], duration: 1000, ease: 'outQuad' }, 0)
        .add(el.querySelector('.sh-index')!, { opacity: [0, 1], translateY: [14, 0], duration: 300 }, 0)
        .add(
          el.querySelectorAll('.sh-char'),
          { opacity: [0, 1], rotateX: [-100, 0], translateY: ['35%', '0%'], duration: 420, ease: 'outBack(1.4)', delay: stagger(35) },
          120,
        )
        .add(createDrawable(el.querySelector('.rule-path')!), { draw: ['0 0', '0 1'], duration: 650, ease: 'inOutQuad' }, 350)
    },
    { start: 'top 95%', end: 'top 50%' },
  )

  return (
    <div ref={ref} className="relative">
      <span
        aria-hidden
        className="sh-ghost pointer-events-none absolute -top-[0.42em] right-0 select-none text-transparent"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(120px, 19vw, 280px)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          WebkitTextStroke: '1px rgba(255,255,255,0.13)',
        }}
      >
        {index}
      </span>
      <div className="relative mb-3 flex items-baseline gap-4">
        <span className="sh-index font-mono text-[13px] text-white/50">{index}</span>
        <h2
          aria-label={title}
          className="text-[28px] text-white sm:text-[42px]"
          style={{
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            textShadow: PROSE_SHADOW,
            perspective: 400,
          }}
        >
          {title.split(' ').map((word, w) => (
            <Fragment key={w}>
              {w > 0 && ' '}
              <span aria-hidden className="inline-block whitespace-nowrap">
                {word.split('').map((ch, i) => (
                  <span key={i} className="sh-char inline-block" style={{ transformOrigin: '50% 100%' }}>
                    {ch}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </h2>
      </div>
      <svg
        className="relative mb-10 h-2 w-full sm:mb-14"
        viewBox="0 0 400 10"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,5 L400,5"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="rule-path"
          d="M0,5 Q10,2 20,5 T40,5 T60,5 T80,5 T100,5 T120,5 T140,5 T160,5 T180,5 T200,5 T220,5 T240,5 T260,5 T280,5 T300,5 T320,5 T340,5 T360,5 T380,5 T400,5"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  )
}

// Every section rises and settles into place as it enters, then sinks back a
// little as it leaves, so scrolling reads as layers passing rather than one
// flat page. The <section> itself is the scroll trigger and never moves (it
// also carries the scrim, so there are no seams); only its inner wrappers do.
export function Section({ id, children, fadeTop = false }: { id: string; children: ReactNode; fadeTop?: boolean }) {
  const ref = useRef<HTMLElement>(null)

  useScrollAnime(
    ref,
    (tl, el) => {
      tl.add(el.querySelector('.section-in')!, { translateY: [70, 0], scale: [0.96, 1], opacity: [0.25, 1], duration: 1000, ease: 'outQuad' })
    },
    { start: 'top bottom', end: 'top 25%' },
  )
  useScrollAnime(
    ref,
    (tl, el) => {
      tl.add(el.querySelector('.section-out')!, { translateY: [0, -50], scale: [1, 0.97], opacity: [1, 0.35], duration: 1000, ease: 'inQuad' })
    },
    { start: 'bottom 35%', end: 'bottom top' },
  )

  return (
    <section
      ref={ref}
      id={id}
      className="relative w-full overflow-x-clip px-5 py-20 sm:px-8 sm:py-28 md:px-10"
      style={{
        // The first section after the hero (`fadeTop`) fades its scrim in, so
        // there's no hard horizontal seam where the unscrimmed hero ends.
        background: fadeTop ? `linear-gradient(180deg, rgba(8,8,13,0) 0px, ${SECTION_BG} 240px)` : SECTION_BG,
      }}
    >
      <div className="section-out w-full" style={{ transformOrigin: '50% 100%' }}>
        <div className="section-in w-full" style={{ transformOrigin: '50% 0%' }}>
          {children}
        </div>
      </div>
    </section>
  )
}

// Blurb lights up word by word as it scrolls through the viewport (scrubbed,
// so it dims again scrolling back); the phrases that say what Ayush does are
// picked out in amber.
const BLURB_KEYWORDS = /^(machine|learning,|NLP|Generative|AI|multi-agent|legal|document|intelligence\.|explainable,|measured,)$/

function AboutBlurb({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useScrollAnime(
    ref,
    (tl, el) => {
      tl.add(el.querySelectorAll('.blurb-word'), { opacity: [0.14, 1], duration: 300, delay: stagger(45) })
    },
    { start: 'top 80%', end: 'bottom 45%' },
  )

  return (
    <p
      ref={ref}
      className="max-w-xl text-[21px] leading-snug text-white sm:text-[27px]"
      style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em', textShadow: PROSE_SHADOW }}
    >
      {text.split(' ').map((word, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="blurb-word" style={BLURB_KEYWORDS.test(word) ? { color: '#fdba74' } : undefined}>
            {word}
          </span>
        </Fragment>
      ))}
    </p>
  )
}

// Counts up from 0 to the stat's numeric value once it scrolls into view,
// preserving any non-numeric suffix (e.g. the "+" in "6+") and decimal
// precision (e.g. "8.08").
function StatCounter({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const match = value.match(/^([\d.]+)(.*)$/)
    if (!el || !match) return

    const [, numStr, suffix] = match
    const target = parseFloat(numStr)
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0

    if (prefersReducedMotion()) {
      el.textContent = value
      return
    }

    el.textContent = (0).toFixed(decimals) + suffix
    const counter = { n: 0 }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          n: target,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = counter.n.toFixed(decimals) + suffix
          },
        })
      },
    })
    return () => st.kill()
  }, [value])

  return (
    <div
      ref={ref}
      className="text-[34px] text-white sm:text-[40px]"
      style={{
        fontFamily: 'var(--font-heading)',
        letterSpacing: '-0.02em',
        textShadow: PROSE_SHADOW,
      }}
    >
      {value}
    </div>
  )
}

// Stat tiles rise out of the grid from the centre outwards as you scroll,
// each wrapped in a glass card with a Lightswind border beam running round it.
function StatTiles() {
  const ref = useRef<HTMLDivElement>(null)

  useScrollAnime(
    ref,
    (tl, el) => {
      tl.add(el.querySelectorAll('.stat-tile'), {
        translateY: [80, 0],
        scale: [0.82, 1],
        rotate: (_?: unknown, i = 0) => [i % 2 ? 6 : -6, 0],
        opacity: [0, 1],
        duration: 600,
        ease: 'outBack(1.2)',
        delay: stagger(130, { from: 'center' }),
      })
    },
    { start: 'top 95%', end: 'top 55%' },
  )

  return (
    <div ref={ref} className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
      {ABOUT.stats.map((s, i) => (
        <div
          key={s.label}
          className="stat-tile relative overflow-hidden rounded-2xl px-4 py-4"
          style={{ background: 'rgba(12,12,18,0.55)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
        >
          <StatCounter value={s.value} />
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/55">
            {s.label}
          </div>
          <BorderBeam delay={i * 1.8} />
        </div>
      ))}
    </div>
  )
}

export function About() {
  return (
    <Section id="about">
      <SectionHeader index="01" title="About" />

      <div className="grid items-center gap-14 md:grid-cols-[1fr_1.1fr]">
        <div>
          <AboutBlurb text={ABOUT.blurb} />

          <StatTiles />

          <Reveal delay={120}>
            <div className="mt-10 font-mono text-[12px] leading-relaxed text-white/55">
              {ABOUT.education}
              <br />
              Based in {ABOUT.based}
            </div>
          </Reveal>
        </div>

        <div className="relative">
          <p className="mb-2 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
            Stack in orbit
          </p>
          <SkillOrbit>
            <DossierFile />
          </SkillOrbit>
        </div>
      </div>
    </Section>
  )
}

// Work: the Lollipop strip drifts across the page; hovering a capsule lifts
// it into a focus card with the project's blurb, stack and a link to its case
// study. A gooey dropdown filters the strip by domain.
const REAL_PREVIEWS: Record<string, string> = {
  '01': '/projects/ai-research-assistant.png',
  '02': '/project-previews/02.jpg',
  '03': '/project-previews/03.jpg',
  '06': '/project-previews/06.jpg',
}

export function Work() {
  const [domain, setDomain] = useState('all')
  const stageRef = useRef<HTMLDivElement>(null)

  // The strip opens out of a rounded window as it scrolls into view.
  useScrollAnime(
    stageRef,
    (tl, el) => {
      tl.add(el.firstElementChild!, {
        clipPath: ['inset(16% 18% 16% 18% round 48px)', 'inset(0% 0% 0% 0% round 0px)'],
        duration: 1000,
        ease: 'outQuad',
      })
    },
    { start: 'top 95%', end: 'top 45%' },
  )

  const items = useMemo<LollipopItem[]>(
    () =>
      PROJECTS.filter((p) => domain === 'all' || PROJECT_DOMAINS[domain]?.includes(p.id)).map((p) => {
        const accent = PROJECT_ACCENTS[p.id] ?? '#f87171'
        return {
          key: p.id,
          image: REAL_PREVIEWS[p.id] ?? projectArt(p.index, p.title, accent),
          title: p.title,
          description: p.blurb,
          tags: p.tech.slice(0, 4),
          link: `#/case-studies/${p.id}`,
          action: <ParticleButton label="Read case study →" href={`#/case-studies/${p.id}`} size="sm" />,
        }
      }),
    [domain],
  )

  return (
    <Section id="work">
      <SectionHeader index="02" title="Selected work" />
      {/* z-20: the Reveal transform makes a stacking context; lift it so the
          open dropdown panel sits above the carousel below and gets clicks. */}
      <Reveal className="relative z-20">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-md font-mono text-[12px] uppercase tracking-wider text-white/45">
            Hover or tap a project · drag to browse
          </p>
          <GooeyDropdown label="Filter projects" icon={<FilterIcon />} options={WORK_FILTERS} value={domain} onChange={setDomain} align="right" />
        </div>
      </Reveal>
      <div ref={stageRef}>
        <div
          className="relative -mx-5 h-[230px] sm:-mx-8 md:-mx-10 md:h-[clamp(420px,62vh,600px)]"
          style={{
            maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
          }}
        >
          {/* Filtering crossfades the strips — the new one slides in while the
              old one fades out over it — instead of swapping in one frame. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={domain}
              className="absolute inset-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, x: -40, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
            >
              <LollipopCarousel items={items} itemHeight={150} hoverScale={2.6} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Reveal delay={120}>
        <div className="mt-6">
          <ParticleButton label="All repositories on GitHub ↗" href={LINKS.github} newTab variant="glass" size="sm" />
        </div>
      </Reveal>
    </Section>
  )
}

function educationArt() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<defs><radialGradient id="g" cx="0.3" cy="0.25" r="1"><stop offset="0" stop-color="#f87171" stop-opacity="0.75"/><stop offset="0.7" stop-color="#0c0c12"/></radialGradient></defs>
<rect width="800" height="600" fill="#07070f"/><rect width="800" height="600" fill="url(#g)"/>
<g stroke="#ffffff" stroke-width="10" stroke-linecap="round" transform="translate(400 250)"><line x1="0" y1="-70" x2="0" y2="70"/><line x1="-70" y1="0" x2="70" y2="0"/><line x1="-50" y1="-50" x2="50" y2="50"/><line x1="50" y1="-50" x2="-50" y2="50"/></g>
<text x="400" y="440" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="54" font-weight="600" fill="#ffffff">B.Tech · CSE</text>
<text x="400" y="500" text-anchor="middle" font-family="Menlo, Consolas, monospace" font-size="26" fill="#ffffff" fill-opacity="0.6">Lovely Professional University</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const certThumb = (href: string) => `/certificates/thumbs/${certSlug(href)}.webp`

const TIMELINE: ThreadNode[] = [
  {
    key: 'btech',
    title: 'B.Tech, Computer Science & Engineering',
    org: 'Lovely Professional University',
    description: `${ABOUT.focus}.`,
    caption: 'Where it started',
    image: educationArt(),
  },
  ...[...EXPERIENCE].reverse().map((e) => ({
    key: e.role,
    period: e.period,
    title: e.role,
    org: e.org,
    suborg: e.suborg,
    description: e.description,
    caption: e.role.includes('Android') ? 'Shipping on Android' : 'First client sites',
    image: certThumb(e.certificate),
    href: e.certificate,
  })),
  {
    key: 'next',
    title: 'The journey continues',
    description: 'Building explainable ML, NLP and generative AI systems — open to what comes next.',
    caption: 'The journey continues',
    image: '/project-previews/06.jpg',
  },
]

export function ExperienceSection() {
  return (
    <Section id="experience">
      <SectionHeader index="03" title="Experience" />
      <ThreadTimeline nodes={TIMELINE} />
    </Section>
  )
}

const ISSUERS = ['all', ...Array.from(new Set(CREDENTIALS.map((c) => c.issuer)))]

export function Certificates() {
  const [issuer, setIssuer] = useState('all')
  const stageRef = useRef<HTMLDivElement>(null)

  // The coverflow swings up from a backward tilt, like a deck being raised.
  useScrollAnime(
    stageRef,
    (tl, el) => {
      tl.add(el.firstElementChild!, {
        rotateX: [32, 0],
        translateY: [90, 0],
        scale: [0.86, 1],
        opacity: [0.15, 1],
        duration: 1000,
        ease: 'outQuad',
      })
    },
    { start: 'top 95%', end: 'top 40%' },
  )

  const items = useMemo<CoverflowItem[]>(
    () =>
      CREDENTIALS.filter((c) => issuer === 'all' || c.issuer === issuer).map((c) => ({
        key: `${c.issuer}-${c.title}`,
        issuer: c.issuer,
        title: c.title,
        href: c.href,
        thumb: `/certificates/thumbs/${certSlug(c.href)}.webp`,
        accent: ISSUER_ACCENTS[c.issuer] ?? '#f87171',
      })),
    [issuer],
  )

  const options = ISSUERS.map((value) => ({
    value,
    label: value === 'all' ? 'All issuers' : value,
    hint: String(value === 'all' ? CREDENTIALS.length : CREDENTIALS.filter((c) => c.issuer === value).length),
  }))

  return (
    <Section id="credentials">
      <SectionHeader index="04" title="Credentials" />
      <Reveal className="relative z-20">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[12px] uppercase tracking-wider text-white/45">
            Drag, swipe or use ← → · click the centre card to open
          </p>
          <GooeyDropdown label="Filter by issuer" icon={<FilterIcon />} options={options} value={issuer} onChange={setIssuer} align="right" />
        </div>
      </Reveal>
      <div ref={stageRef} style={{ perspective: 1400 }}>
        <div style={{ transformOrigin: '50% 100%' }}>
          <CertificateCoverflow items={items} />
        </div>
      </div>
    </Section>
  )
}

// Two rough sparkle outlines with the same point count so MorphSVGPlugin can
// interpolate cleanly between them in an infinite yoyo pulse.
const MARK_STAR = 'M12 2C12 2 13.5 9 19 12C13.5 15 12 22 12 22C12 22 10.5 15 5 12C10.5 9 12 2 12 2Z'
const MARK_BLOB = 'M12 4C16 4 20 8 20 12C20 16 16 20 12 20C8 20 4 16 4 12C4 8 8 4 12 4Z'

function FooterMark() {
  const pathRef = useRef<SVGPathElement>(null)

  useLayoutEffect(() => {
    const el = pathRef.current
    if (!el || prefersReducedMotion()) return
    const tween = gsap.to(el, {
      morphSVG: MARK_BLOB,
      duration: 2.4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })
    return () => {
      tween.kill()
    }
  }, [])

  return (
    <svg viewBox="0 0 24 24" width="26" height="26" className="text-[#f87171]" aria-hidden>
      <path ref={pathRef} d={MARK_STAR} fill="currentColor" />
    </svg>
  )
}

// Hand-drawn underline beneath the heading, drawn in via DrawSVGPlugin once
// it scrolls into view.
function DrawUnderline() {
  const ref = useRef<SVGPathElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) {
      gsap.set(el, { drawSVG: '100%' })
      return
    }
    const tween = gsap.fromTo(
      el,
      { drawSVG: '0%' },
      {
        drawSVG: '100%',
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <svg className="mb-8 h-3 w-[220px] sm:w-[300px]" viewBox="0 0 300 12" aria-hidden>
      <path
        ref={ref}
        d="M2,8 Q40,2 80,8 T160,8 T240,8 T300,8"
        stroke="#f87171"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  )
}

function useIstClock() {
  const format = () =>
    new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' })
  const [time, setTime] = useState(format)
  useEffect(() => {
    const id = window.setInterval(() => setTime(format()), 15_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

// Contact opens with a giant marquee that runs on its own and answers the
// scroll: scrolling faster (either way) speeds it up and leans it into the
// motion, and both ease back once the page settles.
function VelocityMarquee() {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const track = ref.current
    if (!track || prefersReducedMotion()) return
    const loop = gsap.to(track, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 })
    const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3.out' })
    let speed = 1
    let skew = 0
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const v = self.getVelocity()
        speed = Math.max(speed, Math.min(7, 1 + Math.abs(v) / 250))
        skew = gsap.utils.clamp(-14, 14, -v / 200)
      },
    })
    const settle = () => {
      speed += (1 - speed) * 0.04
      skew *= 0.88
      loop.timeScale(speed)
      skewTo(skew)
    }
    gsap.ticker.add(settle)
    return () => {
      gsap.ticker.remove(settle)
      st.kill()
      loop.kill()
    }
  }, [])

  const phrase = (
    <span className="flex items-center gap-[0.35em] pr-[0.35em]">
      <span className="text-white">Open to work</span>
      <span style={{ color: '#f59e0b' }}>✦</span>
      <span className="text-transparent" style={{ WebkitTextStroke: '1.5px rgba(253,186,116,0.8)' }}>
        Let&apos;s build something rare
      </span>
      <span style={{ color: '#f87171' }}>✦</span>
    </span>
  )

  return (
    <div aria-hidden className="-mx-5 mb-16 overflow-hidden sm:-mx-8 md:-mx-10">
      <div
        ref={ref}
        className="flex w-max whitespace-nowrap text-[15vw] leading-[1.05] sm:text-[10vw]"
        style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.035em' }}
      >
        {phrase}
        {phrase}
        {phrase}
        {phrase}
      </div>
    </div>
  )
}

// Heading reveal: chars rise out of a mask once the footer scrolls in.
function ContactHeading() {
  const ref = useRef<HTMLHeadingElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const split = new SplitText(el, { type: 'chars', mask: 'chars' })
    const tween = gsap.from(split.chars, {
      yPercent: 110,
      duration: 0.8,
      ease: 'power4.out',
      stagger: 0.025,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      split.revert()
    }
  }, [])
  return (
    <h2
      ref={ref}
      className="mb-3 text-[40px] text-white sm:text-[64px]"
      style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', lineHeight: 1.02, textShadow: PROSE_SHADOW }}
    >
      something rare.
    </h2>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  multiline,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  multiline?: boolean
}) {
  const common = {
    id,
    value,
    placeholder: ' ',
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
    className:
      'peer w-full resize-none rounded-2xl bg-[rgba(12,12,18,0.72)] px-4 pb-2.5 pt-6 text-[15px] text-white outline-none transition-shadow duration-300 placeholder-transparent focus:shadow-[0_0_0_1px_rgba(248,113,113,0.7),0_0_24px_-6px_rgba(248,113,113,0.6)]',
    style: { boxShadow: error ? '0 0 0 1px rgba(251,113,133,0.7)' : 'inset 0 0 0 1px rgba(255,255,255,0.12)' },
  }
  return (
    <div className="relative">
      {multiline ? (
        <textarea {...common} rows={4} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...common} type="text" autoComplete="name" onChange={(e) => onChange(e.target.value)} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-[13px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-[#fdba74]"
      >
        {label}
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 font-mono text-[11px] text-[#fb7185]">
          {error}
        </p>
      )}
    </div>
  )
}

function MessageComposer() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({})

  const send = () => {
    const next = {
      name: name.trim() ? undefined : 'Tell me who you are',
      message: message.trim() ? undefined : 'Add a short message',
    }
    setErrors(next)
    if (next.name || next.message) return
    const subject = encodeURIComponent(`Portfolio enquiry from ${name.trim()}`)
    const body = encodeURIComponent(message.trim())
    window.location.href = `mailto:${LINKS.email}?subject=${subject}&body=${body}`
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        send()
      }}
      className="mt-10 flex max-w-lg flex-col gap-3"
      aria-label="Write to Ayush"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Quick message</p>
      <Field id="contact-name" label="Your name" value={name} onChange={setName} error={errors.name} />
      <Field id="contact-message" label="What are you building?" value={message} onChange={setMessage} error={errors.message} multiline />
      <div className="flex items-center gap-3">
        <ParticleButton label="Send via email →" onClick={send} />
        <span className="font-mono text-[11px] text-white/40">Opens your mail app</span>
      </div>
    </form>
  )
}

export function Footer() {
  const time = useIstClock()
  const copiedRef = useRef<HTMLSpanElement>(null)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email)
    } catch {
      return
    }
    const el = copiedRef.current
    if (!el) return
    if (prefersReducedMotion()) {
      el.textContent = 'Copied ✓'
      window.setTimeout(() => (el.textContent = 'Copy'), 1600)
      return
    }
    gsap.to(el, { duration: 0.35, text: 'Copied ✓', ease: 'none' })
    gsap.delayedCall(1.6, () => gsap.to(el, { duration: 0.3, text: 'Copy', ease: 'none' }))
  }

  return (
    <footer
      id="contact"
      className="relative w-full overflow-hidden px-5 py-20 sm:px-8 sm:py-28 md:px-10"
      style={{ background: SECTION_BG }}
    >
      <VelocityMarquee />
      <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Reveal>
            <div className="mb-2 flex items-center gap-3">
              <FooterMark />
              <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-white/60">Let&apos;s build</p>
            </div>
          </Reveal>
          <ContactHeading />
          <DrawUnderline />

          <Reveal delay={80}>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${LINKS.email}`}
                className="text-[19px] text-white underline decoration-white/30 underline-offset-[6px] transition-colors hover:decoration-[#f87171] sm:text-[24px]"
              >
                {LINKS.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                aria-label={`Copy ${LINKS.email}`}
                className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#fdba74] transition-colors hover:bg-white/10"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(253,186,116,0.35)' }}
              >
                <span ref={copiedRef} aria-live="polite">
                  Copy
                </span>
              </button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <ParticleButton label="Download résumé ↓" href={LINKS.resume} newTab />
              <span className="inline-flex items-center gap-2 font-mono text-[12px] text-white/60">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#f59e0b]" style={{ boxShadow: '0 0 10px rgba(245,158,11,0.8)' }} />
                Open to work · replies within 24–48h
              </span>
              <span className="font-mono text-[12px] tabular-nums text-white/45">{time} IST · {ABOUT.based}</span>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <MessageComposer />
          </Reveal>
        </div>

        <div>
          <p className="mb-2 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
            Find me elsewhere
          </p>
          <ContactOrbit />
        </div>
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
        <div className="flex flex-wrap gap-x-7 gap-y-2 font-mono text-[12px] uppercase tracking-wider">
          {[
            ['GitHub', LINKS.github],
            ['LinkedIn', LINKS.linkedin],
            ['Portfolio', LINKS.portfolio],
          ].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="text-white/50 transition-colors hover:text-white">
              {label} ↗
            </a>
          ))}
        </div>
        <p className="font-mono text-[12px] text-white/40">© 2026 Ayush Das</p>
      </div>
    </footer>
  )
}

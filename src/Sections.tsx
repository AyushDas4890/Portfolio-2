import { useLayoutEffect, useRef, type ReactNode } from 'react'
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
  MotionPathPlugin,
  Draggable,
  SplitText,
  prefersReducedMotion,
} from './lib/motion'
import { useTiltGlow } from './useTiltGlow'
import { CardFrame } from './CardFrame'
import { type DepthCardItem } from './DepthCard'
import { ProjectSlider } from './ProjectSlider'
import { LetterSwap } from './LetterSwap'

// Sections sit over the fixed avatar video (rendered in App). A consistent
// translucent scrim + light frost keeps the video visible everywhere while
// text stays legible — the same treatment top to bottom, so no seam.
export const SECTION_BG = 'rgba(8,8,13,0.46)'
const CARD_BORDER = 'rgba(255,255,255,0.12)'
const CARD_BG = 'rgba(12,12,18,0.72)'
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const PROSE_SHADOW = '0 1px 20px rgba(0,0,0,0.6)'
const PROJECT_ACCENTS: Record<string, string> = {
  '01': '#60a5fa',
  '02': '#f59e0b',
  '03': '#34d399',
  '04': '#a78bfa',
  '05': '#38bdf8',
  '06': '#fb7185',
}

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
        { opacity: 0, y: 28, scale: 0.97, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.out',
        },
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

export function SectionHeader({
  index,
  title,
}: {
  index: string
  title: string
}) {
  return (
    <Reveal>
      <div className="mb-3 flex items-baseline gap-4">
        <span className="font-mono text-[13px] text-white/50">{index}</span>
        <h2
          className="text-[28px] text-white sm:text-[42px]"
          style={{
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            textShadow: PROSE_SHADOW,
          }}
        >
          <LetterSwap text={title} />
        </h2>
      </div>
      <svg
        className="mb-10 h-2 w-full sm:mb-14"
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
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1}
        />
      </svg>
    </Reveal>
  )
}

function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section
      id={id}
      className="relative w-full px-5 py-20 backdrop-blur-[2px] sm:px-8 sm:py-28 md:px-10"
      style={{ background: SECTION_BG }}
    >
      <div className="w-full">{children}</div>
    </section>
  )
}

// Blurb reveals line-by-line via SplitText's built-in line-masking (each line
// gets an overflow-hidden wrapper for free via `mask: 'lines'`), instead of
// fading in as one block.
function AboutBlurb({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 })
      return
    }

    const split = new SplitText(el, { type: 'lines', mask: 'lines' })
    gsap.set(el, { opacity: 1 })
    const tween = gsap.fromTo(
      split.lines,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      split.revert()
    }
  }, [text])

  return (
    <p
      ref={ref}
      className="max-w-xl text-[17px] leading-relaxed text-white/85 sm:text-[19px]"
      style={{ textShadow: PROSE_SHADOW, opacity: 0 }}
    >
      {text}
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

export function About() {
  return (
    <Section id="about">
      <SectionHeader index="01" title="About" />

      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <AboutBlurb text={ABOUT.blurb} />

          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
            {ABOUT.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 70}>
                <div>
                  <StatCounter value={s.value} />
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/55">
                    {s.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {ABOUT.competencies.map((c, i) => (
            <Reveal key={c.title} delay={i * 70}>
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: CARD_BORDER, background: CARD_BG }}
              >
                <div className="text-[15px] text-white">{c.title}</div>
                <div className="mt-1 font-mono text-[12px] text-white/55">
                  {c.detail}
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={120}>
            <div className="mt-2 font-mono text-[12px] leading-relaxed text-white/55">
              {ABOUT.education}
              <br />
              Based in {ABOUT.based}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}

// Work is shown entirely through an infinite auto-scrolling slider of cards
// (screenshot/gradient + title + tagline, full detail lives on the
// case-study page each one links to) — no separate detailed grid duplicating
// the same set of projects.
export function Work() {
  const items: DepthCardItem[] = PROJECTS.map((p) => ({
    id: p.id,
    index: p.index,
    title: p.title,
    tagline: p.tagline,
    // Screenshots only exist for demos that were actually reachable when
    // captured — the others (asleep Streamlit app, erroring HF Space,
    // crashed serverless function) fall back to the gradient + index-numeral
    // treatment instead of shipping a broken loading/error screenshot.
    image: ['02', '03', '06'].includes(p.id) ? `/project-previews/${p.id}.jpg` : undefined,
    accent: PROJECT_ACCENTS[p.id] ?? '#60a5fa',
  }))

  return (
    <Section id="work">
      <SectionHeader index="02" title="Selected work" />
      <ProjectSlider items={items} />
      <Reveal delay={120}>
        <div className="mt-10">
          <a
            href={LINKS.github}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[13px] uppercase tracking-wider text-white/70 transition-colors hover:text-white"
          >
            All repositories on GitHub ↗
          </a>
        </div>
      </Reveal>
    </Section>
  )
}

function ExperienceCard({ e }: { e: (typeof EXPERIENCE)[number] }) {
  const tiltRef = useTiltGlow<HTMLDivElement>()
  return (
    <div
      ref={tiltRef}
      className="relative flex h-full flex-col overflow-hidden rounded-2xl p-6 sm:p-8"
      style={{ background: CARD_BG, willChange: 'transform' }}
    >
      <div className="card-glow" aria-hidden />
      <CardFrame accent="#f59e0b" />
      <div className="mb-3 font-mono text-[12px] uppercase tracking-wider text-white/50">
        {e.period}
      </div>
      <h3
        className="mb-1 text-[19px] text-white sm:text-[21px]"
        style={{ fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}
      >
        {e.role}
      </h3>
      <div className="mb-4 text-[14px] text-white/70">
        {e.org}
        {e.suborg ? <span className="text-white/45"> · {e.suborg}</span> : null}
      </div>
      <p className="mb-6 flex-1 text-[15px] leading-relaxed text-white/70">
        {e.description}
      </p>
      <a
        href={e.certificate}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1 font-mono text-[12px] uppercase tracking-wider text-white transition-opacity hover:opacity-70"
      >
        View certificate ↗
      </a>
    </div>
  )
}

// Wavy vertical spine (fixed viewBox, stretched non-uniformly to the track's
// actual height) that a glowing dot travels down as the section scrolls, via
// GSAP's MotionPathPlugin. Node markers are placed on the same path at each
// card's progress (i / (n - 1)) using MotionPathPlugin's path-sampling utils,
// so they stay correct regardless of how the curve is stretched.
const SPINE_PATH_D =
  'M12,0 C20,60 4,90 12,150 C20,210 4,240 12,300 C20,360 4,390 12,450 C20,510 4,540 12,600 C20,660 4,690 12,750 C20,810 4,840 12,900 C20,960 4,980 12,1000'

function ExperienceSpine({ count }: { count: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)
  const nodesRef = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const path = pathRef.current
    const dot = dotRef.current
    const track = trackRef.current
    if (!path || !dot || !track) return

    const rawPath = MotionPathPlugin.getRawPath(path)
    const nodes = nodesRef.current?.querySelectorAll<SVGCircleElement>('.spine-node')
    nodes?.forEach((node, i) => {
      const progress = count > 1 ? i / (count - 1) : 0
      const { x, y } = MotionPathPlugin.getPositionOnPath(rawPath, progress)
      node.setAttribute('cx', String(x))
      node.setAttribute('cy', String(y))
    })

    if (prefersReducedMotion()) {
      gsap.set(dot, { opacity: 0 })
      return
    }

    const tween = gsap.to(dot, {
      motionPath: {
        path,
        align: path,
        alignOrigin: [0.5, 0.5],
      },
      ease: 'none',
      scrollTrigger: {
        trigger: track,
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 0.6,
      },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [count])

  return (
    <div
      ref={trackRef}
      className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-6 -translate-x-1/2 md:block"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 24 1000"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          ref={pathRef}
          d={SPINE_PATH_D}
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1.5"
          fill="none"
        />
        <g ref={nodesRef}>
          {Array.from({ length: count }, (_, i) => (
            <circle key={i} className="spine-node" r="4" fill="rgba(255,255,255,0.4)" />
          ))}
        </g>
        <circle ref={dotRef} r="6" fill="#60a5fa" style={{ filter: 'drop-shadow(0 0 6px #60a5fa)' }} />
      </svg>
    </div>
  )
}

export function ExperienceSection() {
  return (
    <Section id="experience">
      <SectionHeader index="03" title="Experience" />
      <div className="relative">
        <ExperienceSpine count={EXPERIENCE.length} />
        <div className="flex flex-col gap-8 sm:gap-10">
          {EXPERIENCE.map((e, i) => (
            <Reveal key={e.role} delay={i * 90}>
              <div className={`md:flex ${i % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
                <div className="md:w-[46%]">
                  <ExperienceCard e={e} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}


function CredentialCard({ c }: { c: (typeof CREDENTIALS)[number] }) {
  const tiltRef = useTiltGlow<HTMLAnchorElement>(6)
  const checkRef = useRef<SVGPathElement>(null)

  useLayoutEffect(() => {
    if (checkRef.current) gsap.set(checkRef.current, { drawSVG: '0%' })
  }, [])

  return (
    <a
      ref={tiltRef}
      href={c.href}
      target="_blank"
      rel="noreferrer"
      draggable={false}
      className="group relative flex h-full w-[260px] shrink-0 flex-col overflow-hidden rounded-xl p-5 sm:w-[280px]"
      style={{
        background: CARD_BG,
        transition: `box-shadow 0.45s ${EASE}`,
        willChange: 'transform',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 50px -22px rgba(0,0,0,0.8)'
        const viewLabel = e.currentTarget.querySelector('.view-label')
        if (!prefersReducedMotion() && viewLabel) {
          gsap.to(viewLabel, {
            duration: 0.5,
            scrambleText: { text: 'View ↗', chars: 'upperCase', speed: 0.6 },
            ease: 'none',
          })
        }
        if (checkRef.current) {
          gsap.to(checkRef.current, { drawSVG: '100%', duration: 0.5, ease: 'power2.out' })
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        if (checkRef.current) {
          gsap.to(checkRef.current, { drawSVG: '0%', duration: 0.35, ease: 'power2.in' })
        }
      }}
    >
      <div className="card-glow" aria-hidden />
      <CardFrame accent="#a78bfa" />
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/80">
          {c.issuer}
        </span>
        <span className="view-label font-mono text-[11px] text-white/40 transition-colors group-hover:text-white/70">
          View ↗
        </span>
      </div>
      <p className="mb-4 flex-1 text-[15px] leading-snug text-white/85">{c.title}</p>
      <svg width="20" height="20" viewBox="0 0 20 20" className="text-[#60a5fa]" aria-hidden>
        <path
          ref={checkRef}
          d="M4 10.5 L8 14.5 L16 5.5"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  )
}

// Horizontal drag-to-browse carousel (Draggable + inertia) instead of a
// static grid — `bounds: viewport` has GSAP recompute the min/max scroll
// range from the two elements' sizes on every drag press, so it stays
// correct across breakpoints without a manual bounds function.
export function Certificates() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track || prefersReducedMotion()) return

    const instances = Draggable.create(track, {
      type: 'x',
      inertia: true,
      cursor: 'grab',
      activeCursor: 'grabbing',
      edgeResistance: 0.8,
      bounds: viewport,
    })
    return () => instances.forEach((d) => d.kill())
  }, [])

  return (
    <Section id="credentials">
      <SectionHeader index="04" title="Credentials" />
      <div ref={viewportRef} className="overflow-hidden">
        <div ref={trackRef} className="flex gap-4 pb-2" style={{ cursor: 'grab' }}>
          {CREDENTIALS.map((c, i) => (
            <Reveal key={c.issuer + c.title} delay={i * 40} className="shrink-0">
              <CredentialCard c={c} />
            </Reveal>
          ))}
        </div>
      </div>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-white/35">
        Drag to browse →
      </p>
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
    <svg viewBox="0 0 24 24" width="26" height="26" className="text-[#60a5fa]" aria-hidden>
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
        stroke="#60a5fa"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  )
}

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative w-full px-5 py-20 backdrop-blur-[2px] sm:px-8 sm:py-28 md:px-10"
      style={{ background: SECTION_BG }}
    >
      <div className="w-full">
        <Reveal>
          <div className="mb-2 flex items-center gap-3">
            <FooterMark />
            <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-white/60">
              Let&apos;s build
            </p>
          </div>
          <h2
            className="mb-3 text-[34px] text-white sm:text-[56px]"
            style={{
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              textShadow: PROSE_SHADOW,
            }}
          >
            something rare.
          </h2>
          <DrawUnderline />

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${LINKS.email}`}
              className="inline-block text-[18px] text-white underline underline-offset-4 transition-opacity hover:opacity-60 sm:text-[22px]"
            >
              {LINKS.email}
            </a>
            <a
              href={LINKS.resume}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-5 py-2 text-[14px] text-black transition-all duration-200 hover:bg-transparent hover:text-white active:scale-[0.97]"
            >
              Download résumé ↓
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[13px] uppercase tracking-wider">
            <a
              href={LINKS.github}
              target="_blank"
              rel="noreferrer"
              className="text-white/55 transition-colors hover:text-white"
            >
              GitHub ↗
            </a>
            <a
              href={LINKS.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-white/55 transition-colors hover:text-white"
            >
              LinkedIn ↗
            </a>
            <a
              href={LINKS.portfolio}
              target="_blank"
              rel="noreferrer"
              className="text-white/55 transition-colors hover:text-white"
            >
              Portfolio ↗
            </a>
          </div>

          <p className="mt-16 font-mono text-[12px] text-white/40">
            © 2026 Ayush Das
          </p>
        </Reveal>
      </div>
    </footer>
  )
}

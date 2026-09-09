import { useLayoutEffect, useRef, type ReactNode } from 'react'
import {
  ABOUT,
  CREDENTIALS,
  EXPERIENCE,
  LINKS,
  PROJECTS,
} from './content'
import { gsap, MotionPathPlugin, prefersReducedMotion } from './lib/motion'
import { useTiltGlow } from './useTiltGlow'

// Sections sit over the fixed avatar video (rendered in App). A consistent
// translucent scrim + light frost keeps the video visible everywhere while
// text stays legible — the same treatment top to bottom, so no seam.
export const SECTION_BG = 'rgba(8,8,13,0.46)'
const CARD_BORDER = 'rgba(255,255,255,0.12)'
const CARD_BG = 'rgba(12,12,18,0.72)'
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const PROSE_SHADOW = '0 1px 20px rgba(0,0,0,0.6)'

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
          {title}
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
      className="relative px-5 py-20 backdrop-blur-[2px] sm:px-8 sm:py-28 md:px-10"
      style={{ background: SECTION_BG }}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  )
}

export function About() {
  return (
    <Section id="about">
      <SectionHeader index="01" title="About" />

      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Reveal>
            <p
              className="max-w-xl text-[17px] leading-relaxed text-white/85 sm:text-[19px]"
              style={{ textShadow: PROSE_SHADOW }}
            >
              {ABOUT.blurb}
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
            {ABOUT.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 70}>
                <div>
                  <div
                    className="text-[34px] text-white sm:text-[40px]"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      letterSpacing: '-0.02em',
                      textShadow: PROSE_SHADOW,
                    }}
                  >
                    {s.value}
                  </div>
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

function ProjectCard({ project }: { project: (typeof PROJECTS)[number] }) {
  const tiltRef = useTiltGlow<HTMLElement>()
  return (
    <article
      ref={tiltRef}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 hover:border-white/30 sm:p-8"
      style={{
        borderColor: CARD_BORDER,
        background: CARD_BG,
        transition: `border-color 0.45s ${EASE}, box-shadow 0.45s ${EASE}`,
        willChange: 'transform',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 30px 70px -24px rgba(0,0,0,0.85)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="card-glow" aria-hidden />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-6 select-none text-[110px] leading-none text-white/[0.04] transition-transform duration-500 group-hover:-translate-y-1"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {project.index}
      </span>

      <div className="relative mb-4 flex items-center justify-between">
        <span className="font-mono text-[13px] text-white/50">
          {project.index}
        </span>
        <div className="flex gap-4 font-mono text-[12px] uppercase tracking-wider">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="text-white/55 transition-colors hover:text-white"
          >
            GitHub ↗
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="text-white transition-opacity hover:opacity-60"
            >
              Live ↗
            </a>
          )}
        </div>
      </div>

      <h3
        className="relative mb-3 text-[20px] text-white sm:text-[24px]"
        style={{
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
        }}
      >
        {project.title}
      </h3>

      <p className="relative mb-6 flex-1 text-[15px] leading-relaxed text-white/70">
        {project.blurb}
      </p>

      <div className="relative mb-5 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] text-white/70 transition-colors duration-300 group-hover:border-white/30"
          >
            {t}
          </span>
        ))}
      </div>

      <a
        href={`#/case-studies/${project.id}`}
        className="relative inline-flex w-fit items-center gap-1 font-mono text-[12px] uppercase tracking-wider text-white transition-opacity hover:opacity-70"
      >
        View case study →
      </a>
    </article>
  )
}

export function Work() {
  return (
    <Section id="work">
      <SectionHeader index="02" title="Selected work" />
      <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.id} delay={i * 90}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>
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
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 sm:p-8"
      style={{ borderColor: CARD_BORDER, background: CARD_BG, willChange: 'transform' }}
    >
      <div className="card-glow" aria-hidden />
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
  return (
    <a
      ref={tiltRef}
      href={c.href}
      target="_blank"
      rel="noreferrer"
      className="group relative block h-full overflow-hidden rounded-xl border p-5 hover:border-white/30"
      style={{
        borderColor: CARD_BORDER,
        background: CARD_BG,
        transition: `border-color 0.45s ${EASE}, box-shadow 0.45s ${EASE}`,
        willChange: 'transform',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 50px -22px rgba(0,0,0,0.8)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="card-glow" aria-hidden />
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/80">
          {c.issuer}
        </span>
        <span className="font-mono text-[11px] text-white/40 transition-colors group-hover:text-white/70">
          View ↗
        </span>
      </div>
      <p className="text-[15px] leading-snug text-white/85">{c.title}</p>
    </a>
  )
}

export function Certificates() {
  return (
    <Section id="credentials">
      <SectionHeader index="04" title="Credentials" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CREDENTIALS.map((c, i) => (
          <Reveal
            key={c.issuer + c.title}
            delay={(i % 3) * 80 + Math.floor(i / 3) * 40}
          >
            <CredentialCard c={c} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative px-5 py-20 backdrop-blur-[2px] sm:px-8 sm:py-28 md:px-10"
      style={{ background: SECTION_BG }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-2 font-mono text-[13px] uppercase tracking-[0.2em] text-white/60">
            Let&apos;s build
          </p>
          <h2
            className="mb-8 text-[34px] text-white sm:text-[56px]"
            style={{
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              textShadow: PROSE_SHADOW,
            }}
          >
            something rare.
          </h2>

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

import type { ReactNode } from 'react'
import {
  ABOUT,
  CREDENTIALS,
  EXPERIENCE,
  LINKS,
  PROJECTS,
} from './content'
import { useInView } from './useInView'

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
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal${inView ? ' in' : ''}${className ? ` ${className}` : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
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
      <div
        className="rule mb-10 h-px w-full sm:mb-14"
        style={{ background: 'rgba(255,255,255,0.14)' }}
      />
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
  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 hover:-translate-y-1.5 hover:border-white/30 sm:p-8"
      style={{
        borderColor: CARD_BORDER,
        background: CARD_BG,
        transition: `transform 0.45s ${EASE}, border-color 0.45s ${EASE}, box-shadow 0.45s ${EASE}`,
        willChange: 'transform',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 30px 70px -24px rgba(0,0,0,0.85)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
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

export function ExperienceSection() {
  return (
    <Section id="experience">
      <SectionHeader index="03" title="Experience" />
      <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
        {EXPERIENCE.map((e, i) => (
          <Reveal key={e.role} delay={i * 90}>
            <div
              className="flex h-full flex-col rounded-2xl border p-6 sm:p-8"
              style={{ borderColor: CARD_BORDER, background: CARD_BG }}
            >
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
                {e.suborg ? (
                  <span className="text-white/45"> · {e.suborg}</span>
                ) : null}
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
          </Reveal>
        ))}
      </div>
    </Section>
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
            <a
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="group block h-full rounded-xl border p-5 hover:-translate-y-1 hover:border-white/30"
              style={{
                borderColor: CARD_BORDER,
                background: CARD_BG,
                transition: `transform 0.45s ${EASE}, border-color 0.45s ${EASE}, box-shadow 0.45s ${EASE}`,
                willChange: 'transform',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 20px 50px -22px rgba(0,0,0,0.8)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
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

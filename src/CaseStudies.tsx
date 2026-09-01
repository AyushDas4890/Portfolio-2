import { useEffect } from 'react'
import { LINKS, PROJECTS } from './content'
import { Reveal, SECTION_BG } from './Sections'

const CARD_BORDER = 'rgba(255,255,255,0.12)'
const CARD_BG = 'rgba(12,12,18,0.72)'
const PROSE_SHADOW = '0 1px 20px rgba(0,0,0,0.6)'

// In-app case studies page (hash route #/case-studies[/:id]). Same theme,
// over the same fixed avatar video — no redirect off-site.
export function CaseStudies({ targetId }: { targetId?: string }) {
  useEffect(() => {
    if (targetId) {
      const el = document.getElementById(`case-${targetId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [targetId])

  return (
    <main
      className="relative z-[1] min-h-screen backdrop-blur-[2px]"
      style={{ background: SECTION_BG }}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <a href="#home" className="flex items-center gap-3">
          <span
            className="text-[21px] tracking-tight text-white sm:text-[26px]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ayush Das
          </span>
          <span
            className="select-none text-[25px] text-white sm:text-[30px]"
            style={{ letterSpacing: '-0.02em' }}
          >
            &#10035;&#xFE0E;
          </span>
        </a>
        <a
          href="#home"
          className="font-mono text-[13px] uppercase tracking-wider text-white/70 transition-colors hover:text-white"
        >
          ← Back
        </a>
      </div>

      <div className="mx-auto max-w-4xl px-5 pb-28 pt-10 sm:px-8">
        <Reveal>
          <p className="mb-2 font-mono text-[13px] uppercase tracking-[0.2em] text-white/60">
            Selected work
          </p>
          <h1
            className="mb-4 text-[40px] text-white sm:text-[64px]"
            style={{
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              textShadow: PROSE_SHADOW,
            }}
          >
            Case studies
          </h1>
          <p
            className="mb-16 max-w-2xl text-[17px] leading-relaxed text-white/80"
            style={{ textShadow: PROSE_SHADOW }}
          >
            The problem each system solves, how it&apos;s built, and the
            decisions that make it more than a demo.
          </p>
        </Reveal>

        <div className="flex flex-col gap-6">
          {PROJECTS.map((p) => (
            <Reveal key={p.id}>
              <article
                id={`case-${p.id}`}
                className="scroll-mt-24 rounded-2xl border p-6 sm:p-10"
                style={{ borderColor: CARD_BORDER, background: CARD_BG }}
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 font-mono text-[13px] text-white/50">
                      {p.index}
                    </div>
                    <h2
                      className="text-[24px] text-white sm:text-[32px]"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                      }}
                    >
                      {p.title}
                    </h2>
                    <p className="mt-1 text-[15px] text-white/60">{p.tagline}</p>
                  </div>
                  <div className="flex shrink-0 gap-4 font-mono text-[12px] uppercase tracking-wider">
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/60 transition-colors hover:text-white"
                    >
                      GitHub ↗
                    </a>
                    {p.demo && (
                      <a
                        href={p.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white transition-opacity hover:opacity-60"
                      >
                        Live ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white/45">
                      The problem
                    </div>
                    <p className="text-[15px] leading-relaxed text-white/75">
                      {p.caseStudy.problem}
                    </p>
                  </div>
                  <div>
                    <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white/45">
                      The approach
                    </div>
                    <p className="text-[15px] leading-relaxed text-white/75">
                      {p.caseStudy.approach}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-white/45">
                    What makes it work
                  </div>
                  <ul className="flex flex-col gap-2">
                    {p.caseStudy.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex gap-3 text-[15px] leading-relaxed text-white/80"
                      >
                        <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-white/60" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] text-white/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-4">
          <a
            href="#home"
            className="font-mono text-[13px] uppercase tracking-wider text-white/70 transition-colors hover:text-white"
          >
            ← Back to home
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
      </div>
    </main>
  )
}

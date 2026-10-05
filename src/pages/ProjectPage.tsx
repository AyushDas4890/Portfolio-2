import { useRef } from 'react'
import { Footer } from '../components/Footer'
import { ArrowLeft, ArrowRight, ArrowUpRight } from '../components/Icons'
import { ProjectMedia } from '../components/ProjectMedia'
import { PROJECTS } from '../content'
import { useReveal } from '../lib/reveal'
import { projectHref } from '../lib/router'

const pad = (n: number) => String(n).padStart(2, '0')

export function ProjectPage({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref)

  const index = PROJECTS.findIndex((p) => p.id === id)
  const project = PROJECTS[index]

  if (!project) {
    return (
      <div ref={ref} className="shell flex min-h-[80vh] flex-col items-start justify-center gap-6 pt-[var(--nav-h)]">
        <p className="eyebrow text-amber">Not found</p>
        <h1 className="display text-[clamp(48px,8vw,120px)]">No such project.</h1>
        <a href="#work" className="link-line text-[17px] text-fg">
          ← See all work
        </a>
      </div>
    )
  }

  const next = PROJECTS[(index + 1) % PROJECTS.length]
  const { problem, approach, highlights } = project.caseStudy

  return (
    <div ref={ref}>
      <article className="shell pt-[calc(var(--nav-h)+clamp(40px,7vw,96px))]">
        <a href="#work" className="eyebrow inline-flex items-center gap-2 text-muted transition-colors hover:text-fg">
          <ArrowLeft size={14} /> All work
        </a>

        <p data-reveal className="eyebrow mt-10 flex items-center gap-3 text-muted">
          <span className="h-2 w-2 bg-amber" aria-hidden />
          <span>Case study</span>
          <span className="h-px w-8 bg-current opacity-40" aria-hidden />
          <span>
            {project.index} / {pad(PROJECTS.length)}
          </span>
        </p>
        <h1 data-split className="display mt-6 max-w-[15ch] text-[clamp(48px,7.4vw,120px)]">
          {project.title}
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-white/10 pt-8 lg:grid-cols-12">
          <p data-reveal className="heading text-[clamp(21px,2vw,28px)] leading-snug text-fg lg:col-span-6">
            {project.tagline}.
          </p>
          <dl data-reveal className="grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:col-start-8">
            <div>
              <dt className="eyebrow text-dim">Stack</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-muted">{project.tech.join(', ')}</dd>
            </div>
            <div>
              <dt className="eyebrow text-dim">Links</dt>
              <dd className="mt-2 flex flex-col items-start gap-1.5 text-[15px]">
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noreferrer" className="link-line inline-flex items-center gap-1 text-fg">
                    Live demo <ArrowUpRight size={13} />
                  </a>
                )}
                <a href={project.github} target="_blank" rel="noreferrer" className="link-line inline-flex items-center gap-1 text-fg">
                  Source on GitHub <ArrowUpRight size={13} />
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <figure data-reveal className="mt-[clamp(40px,6vw,80px)]">
          <ProjectMedia project={project} fit="natural" eager className="rounded-[24px]" />
        </figure>

        <section className="mt-[clamp(64px,9vw,128px)] grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
          <h2 data-reveal className="eyebrow text-amber lg:col-span-3 lg:pt-3">
            Overview
          </h2>
          <p data-reveal className="heading text-[clamp(23px,2.5vw,36px)] leading-[1.28] text-fg lg:col-span-9">
            {project.blurb}
          </p>
        </section>

        <section className="mt-[clamp(56px,8vw,112px)] grid grid-cols-1 gap-10 border-t border-white/10 pt-12 lg:grid-cols-12 lg:gap-10">
          <div data-reveal className="lg:col-span-6">
            <h2 className="eyebrow text-dim">The problem</h2>
            <p className="mt-4 text-[17px] leading-[1.7] text-muted">{problem}</p>
          </div>
          <div data-reveal className="lg:col-span-6">
            <h2 className="eyebrow text-dim">The approach</h2>
            <p className="mt-4 text-[17px] leading-[1.7] text-muted">{approach}</p>
          </div>
        </section>

        <section className="mt-[clamp(56px,8vw,112px)]">
          <h2 data-reveal className="eyebrow text-dim">
            What makes it work
          </h2>
          <ol className="mt-6 border-t border-white/10">
            {highlights.map((h, i) => (
              <li key={h} data-reveal className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-white/10 py-6 sm:gap-8">
                <span className="eyebrow pt-2 text-amber">{pad(i + 1)}</span>
                <p className="heading text-[clamp(19px,1.8vw,26px)] leading-snug text-fg">{h}</p>
              </li>
            ))}
          </ol>
        </section>
      </article>

      <a href={projectHref(next.id)} className="group mt-[clamp(80px,10vw,140px)] block border-t border-white/10">
        <div className="shell flex items-end justify-between gap-8 py-[clamp(48px,7vw,96px)]">
          <div className="min-w-0">
            <p className="eyebrow text-muted">Next project — {next.index}</p>
            <p className="display mt-4 text-[clamp(40px,6.2vw,100px)] transition-colors duration-500 group-hover:text-amber">
              {next.title}
            </p>
          </div>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-amber text-ink transition-transform duration-500 ease-out-expo group-hover:-rotate-45 sm:h-16 sm:w-16">
            <ArrowRight size={20} />
          </span>
        </div>
      </a>

      <Footer />
    </div>
  )
}

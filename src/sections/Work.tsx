import { useRef } from 'react'
import { ArrowUpRight } from '../components/Icons'
import { ProjectMedia } from '../components/ProjectMedia'
import { SectionHeading } from '../components/SectionHeading'
import { LINKS, PROJECTS, type Project } from '../content'
import { useReveal } from '../lib/reveal'
import { projectHref } from '../lib/router'

// Leaving for a case study: park the URL on #work first, so Back returns here.
const rememberWork = () => window.history.replaceState(null, '', '#work')

function ProjectCard({ project, staggered }: { project: Project; staggered: boolean }) {
  const href = projectHref(project.id)
  return (
    <article data-reveal className={`group relative min-w-0 ${staggered ? 'md:mt-32' : ''}`}>
      <a href={href} onClick={rememberWork} tabIndex={-1} aria-hidden="true" className="block">
        <ProjectMedia project={project} className="aspect-video rounded-[20px]" />
      </a>

      <div className="mt-6 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="eyebrow text-amber">{project.index}</p>
          <h3 className="heading mt-2 text-[clamp(24px,2.3vw,34px)] text-fg">
            <a href={href} onClick={rememberWork} className="link-line">
              {project.title}
            </a>
          </h3>
          <p className="mt-2 text-[16px] leading-snug text-muted">{project.tagline}</p>
        </div>
        <span
          aria-hidden
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-fg ring-1 ring-inset ring-white/15 transition-[transform,background-color,color] duration-500 ease-out-expo group-hover:rotate-45 group-hover:bg-amber group-hover:text-ink group-hover:ring-0"
        >
          <ArrowUpRight size={16} />
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-4">
        <p className="eyebrow min-w-0 truncate text-dim">{project.tech.slice(0, 4).join(' · ')}</p>
        <div className="flex gap-5 text-[14px]">
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer" className="link-line text-fg">
              Live demo ↗
            </a>
          )}
          <a href={project.github} target="_blank" rel="noreferrer" className="link-line text-muted transition-colors hover:text-fg">
            Code ↗
          </a>
        </div>
      </div>
    </article>
  )
}

export function Work() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section ref={ref} id="work" className="relative py-[clamp(96px,12vw,180px)]">
      <div className="shell">
        <SectionHeading
          index="03"
          label="Selected work"
          title={
            <>
              Selected
              <br />
              work.
            </>
          }
          aside={
            <>
              Six systems — research agents, legal NLP, clinical RAG, carbon accounting — each with a live demo and its source on
              GitHub.{' '}
              <a href={LINKS.github} target="_blank" rel="noreferrer" className="link-line text-fg">
                All repositories ↗
              </a>
            </>
          }
        />

        <div className="mt-[clamp(56px,7vw,104px)] grid grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-2 lg:gap-x-10">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} project={p} staggered={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

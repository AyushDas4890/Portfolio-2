import { useMemo } from 'react'
import type { Project } from '../content'

/**
 * Generated art for projects without a screenshot: the reel's dot matrix,
 * lifted into swells (ORCA is a marine project). Dots near a crest go amber.
 */
function DotSwell({ seed }: { seed: number }) {
  const dots = useMemo(() => {
    const cols = 48
    const rows = 24
    const out: { x: number; y: number; r: number; amber: boolean; o: number }[] = []
    for (let c = 0; c < cols; c++) {
      const x = 40 + c * (1520 / (cols - 1))
      const crest =
        430 +
        Math.sin(c * 0.21 + seed) * 120 +
        Math.sin(c * 0.53 + seed * 2) * 38 +
        Math.cos(c * 0.08 + seed) * 40
      for (let r = 0; r < rows; r++) {
        const y = 60 + r * (680 / (rows - 1))
        const d = y - crest
        if (d < -16) continue
        const amber = d < 46
        out.push({ x, y, r: amber ? 4.2 : 3, amber, o: amber ? 1 : Math.max(0.18, 0.7 - d / 520) })
      }
    }
    return out
  }, [seed])

  return (
    <svg viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.amber ? '#f59e0b' : '#bcbbbe'} opacity={d.o} />
      ))}
    </svg>
  )
}

/**
 * A project's demo screenshot on a dark stage, or generated art when there is
 * none. `fit="cover"` crops to the container (cards); `fit="natural"` shows the
 * whole image at its own aspect (case-study hero).
 */
export function ProjectMedia({
  project,
  fit = 'cover',
  eager = false,
  className = '',
}: {
  project: Project
  fit?: 'cover' | 'natural'
  eager?: boolean
  className?: string
}) {
  const frame = `relative overflow-hidden bg-raise ring-1 ring-inset ring-white/[0.08] ${className}`

  if (!project.image) {
    return (
      <div className={`${frame} ${fit === 'natural' ? 'aspect-[2/1]' : ''}`}>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_100%,rgba(245,158,11,0.14),transparent_70%)]" />
        <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]">
          <DotSwell seed={Number(project.id)} />
        </div>
        <p className="eyebrow absolute left-5 top-5 text-muted sm:left-6 sm:top-6">{project.title}</p>
      </div>
    )
  }

  return (
    <div className={frame}>
      <img
        src={project.image}
        alt={`${project.title} — screenshot of the live demo`}
        width={1600}
        height={800}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={
          fit === 'cover'
            ? 'absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]'
            : 'h-auto w-full'
        }
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(8,7,14,0.35),transparent_45%)] opacity-60 transition-opacity duration-700 group-hover:opacity-0"
      />
    </div>
  )
}

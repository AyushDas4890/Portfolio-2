import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { featuredProjects, moreWork, projects } from '../data.js'
import { gsap, ScrollTrigger, reducedMotion, isTouch } from '../lib/motion.js'

// Geometric logo marks (demo-style abstract periwinkle glyphs), one per project.
const MARKS = {
  'ai-research-assistant': (
    // concentric arcs — agents orbiting a core
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
      <path d="M14 50 A26 26 0 0 1 14 14" opacity=".45" />
      <path d="M24 46 A18 18 0 0 1 24 18" opacity=".7" />
      <path d="M34 42 A10 10 0 0 1 34 22" />
      <circle cx="40" cy="32" r="3.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  'legal-conflict-resolver': (
    // two offset bars — clause vs clause
    <svg viewBox="0 0 64 64" fill="currentColor">
      <path d="M10 26h30l8-10H18z" />
      <path d="M16 48h30l8-10H24z" opacity=".65" />
    </svg>
  ),
  'rag-medical-assistant': (
    // ring + grounded dot — retrieval anchored to source
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="6">
      <circle cx="30" cy="26" r="13" />
      <rect x="22" y="46" width="16" height="9" rx="4.5" fill="currentColor" stroke="none" />
      <circle cx="47" cy="15" r="4" fill="currentColor" stroke="none" />
    </svg>
  ),
  'cancer-tf-dashboard': (
    // interlocked blocks — factors binding
    <svg viewBox="0 0 64 64" fill="currentColor">
      <path d="M18 14h20v12H30v12H18z" />
      <path d="M46 50H26V38h8V26h12z" opacity=".7" />
    </svg>
  ),
}

function WorkCard({ p }) {
  const ref = useRef(null)
  const handlers =
    isTouch || reducedMotion
      ? {}
      : {
          onMouseMove: (e) => {
            const r = ref.current.getBoundingClientRect()
            const px = (e.clientX - r.left) / r.width - 0.5
            const py = (e.clientY - r.top) / r.height - 0.5
            gsap.to(ref.current, {
              rotateY: px * 6,
              rotateX: -py * 6,
              y: -8,
              duration: 0.5,
              ease: 'power2.out',
              transformPerspective: 800,
            })
          },
          onMouseLeave: () => {
            gsap.to(ref.current, { rotateX: 0, rotateY: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.55)' })
          },
        }
  return (
    <Link
      to={`/work/${p.slug}`}
      className="work-card"
      ref={ref}
      style={{ '--pa': p.palette.a }}
      aria-label={`${p.title} — view case study`}
      {...handlers}
    >
      <img
        className="art"
        src={p.artwork}
        alt=""
        loading="lazy"
        onError={(e) => { e.currentTarget.classList.add('missing') }}
      />
      <span className="tri" aria-hidden="true" />
      <span className="mark" aria-hidden="true">{MARKS[p.slug] || <span className="mono">{p.monogram}</span>}</span>
      <span className="dot" aria-hidden="true" />
      <span className="meta">
        <span className="t">{p.title}</span>
        <span className="i">{p.index}</span>
      </span>
      <span className="base" aria-hidden="true" />
      <span className="sweep" aria-hidden="true" />
    </Link>
  )
}

export default function Work() {
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!wrapRef.current) return
    const cards = wrapRef.current.querySelectorAll('.work-card')
    if (isTouch) {
      wrapRef.current.classList.add('revealed')
      cards.forEach((c) => c.classList.add('revealed'))
    }
    if (reducedMotion) return
    gsap.fromTo(
      cards,
      { y: 70, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: wrapRef.current, start: 'top 75%', once: true },
      },
    )
    return () => ScrollTrigger.getAll().forEach((t) => t.trigger === wrapRef.current && t.kill())
  }, [])

  const rest = projects.filter((p) => !p.featured)

  return (
    <section id="work" className="act act-solid">
      <div className="act-head">
        <span className="idx">03</span>
        <h2>Projects</h2>
      </div>
      <div className="work-wrap" ref={wrapRef}>
        <div className="work-backdrop" aria-hidden="true" />
        <div className="work-grid">
          {featuredProjects.map((p) => <WorkCard key={p.slug} p={p} />)}
        </div>
      </div>
      <div className="more-work">
        {rest.map((p) => (
          <Link key={p.slug} to={`/work/${p.slug}`} className="more-row">
            <span className="n">{p.title}</span>
            <span className="d">{p.tagline}</span>
            <span className="a">→</span>
          </Link>
        ))}
        {moreWork.map((w) => (
          <a key={w.url} href={w.url} target="_blank" rel="noreferrer" className="more-row">
            <span className="n">{w.name}</span>
            <span className="d">{w.description}</span>
            <span className="a">↗</span>
          </a>
        ))}
      </div>
    </section>
  )
}

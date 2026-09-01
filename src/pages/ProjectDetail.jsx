import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { projects } from '../data.js'

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)
  const [artFailed, setArtFailed] = useState(false)

  useEffect(() => { window.scrollTo(0, 0); setArtFailed(false) }, [slug])

  if (!project) return <Navigate to="/" replace />

  const i = projects.indexOf(project)
  const next = projects[(i + 1) % projects.length]

  return (
    <div className="detail" style={{ '--pal-a': project.palette.a }}>
      <div className="detail-banner">
        {artFailed
          ? <div className="banner-fallback" aria-hidden="true" />
          : <img src={project.artwork} alt="" onError={() => setArtFailed(true)} />}
        <div className="banner-copy">
          <Link to="/" className="caps">← Back to index</Link>
          <p className="caps" style={{ marginTop: '2.2rem' }}>{project.label}</p>
          <h1>{project.title}</h1>
        </div>
      </div>
      <div className="detail-body">
        <div className="detail-meta">
          {project.stack.map((s) => <span className="chip" key={s}>{s}</span>)}
          <a className="gh" href={project.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          {project.demo && (
            <a className="gh" href={project.demo} target="_blank" rel="noreferrer">Live demo ↗</a>
          )}
        </div>
        <div className="detail-cols">
          <div>
            <h2>Problem</h2>
            <p>{project.problem}</p>
          </div>
          <div>
            <h2>Approach</h2>
            <p>{project.approach}</p>
          </div>
        </div>
        {project.screenshots.map((src) => (
          <img key={src} className="detail-shot" src={src} alt={`${project.title} screenshot`} loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none' }} />
        ))}
      </div>
      <Link to={`/work/${next.slug}`} className="next-project">
        <span className="caps">Next project</span>
        <div className="n">{next.title}</div>
      </Link>
    </div>
  )
}

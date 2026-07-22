import { useEffect, useRef } from 'react'
import { profile, education } from '../data.js'
import { maskReveal } from '../lib/motion.js'

const coreSkills = [
  { icon: '⚡', label: 'LangGraph & Multi-Agent', desc: 'Autonomous agent orchestration' },
  { icon: '🧠', label: 'NLP & Transformers', desc: 'DeBERTa, BERT, fine-tuning' },
  { icon: '🔍', label: 'RAG Systems', desc: 'ChromaDB, vector retrieval' },
  { icon: '🚀', label: 'Full-Stack ML', desc: 'FastAPI, React, deployment' },
]

const stats = [
  { value: '6+', label: 'Projects Shipped' },
  { value: '8.08', label: 'CGPA' },
  { value: '2', label: 'Internships' },
  { value: '9', label: 'Certifications' },
]

export default function About() {
  const ref = useRef(null)
  useEffect(() => { maskReveal(ref.current) }, [])

  return (
    <section id="about" className="act about" ref={ref}>
      <div className="act-head">
        <span className="idx">02</span>
        <h2>About me</h2>
      </div>

      {/* Main intro */}
      <div className="about-intro">
        <p className="about-lead serif-display">{profile.summary}</p>
        <div className="about-accent-line" aria-hidden="true" />
      </div>

      {/* Stats row */}
      <div className="about-stats">
        {stats.map((s) => (
          <div className="stat-cell" key={s.label}>
            <span className="stat-val serif-display">{s.value}</span>
            <span className="stat-label caps">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Core skills */}
      <div className="about-skills">
        <h3 className="caps about-section-title">Core Competencies</h3>
        <div className="skill-grid">
          {coreSkills.map((s) => (
            <div className="skill-card" key={s.label}>
              <span className="skill-icon">{s.icon}</span>
              <div className="skill-text">
                <span className="skill-name">{s.label}</span>
                <span className="skill-desc">{s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meta details */}
      <div className="about-meta">
        <div className="cell">
          <span className="caps k">EDUCATION</span>
          <span className="v">{education.degree}</span>
          <span className="s">{education.school} · {education.detail}</span>
        </div>
        <div className="cell">
          <span className="caps k">FOCUS</span>
          <span className="v">{profile.tagline}</span>
          <span className="s">Multi-agent systems · RAG · Explainable NLP</span>
        </div>
        <div className="cell">
          <span className="caps k">BASED IN</span>
          <span className="v">{profile.location}</span>
          <span className="s">{education.period}</span>
        </div>
      </div>
    </section>
  )
}

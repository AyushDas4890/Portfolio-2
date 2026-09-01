import { useEffect, useState } from 'react'
import { sections } from '../data.js'
import { stage, scrollToSection } from '../lib/motion.js'

export default function Nav() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const i = els.indexOf(e.target)
          if (i >= 0) { setCurrent(i); stage.section = i }
        })
      },
      { threshold: 0.45 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <header className="nav">
        <a href="#hero" className="mark" aria-label="Ayush Das — home" onClick={(e) => { e.preventDefault(); scrollToSection('hero') }}>
          ad.
        </a>
      </header>
      <div className="hud-counter" aria-hidden="true">
        <span className="num">{sections[current].num}</span>
        <span className="dash" />
      </div>
      <nav className="hud-dots" aria-label="Sections">
        {sections.map((s, i) => (
          <button
            key={s.id}
            className={i === current ? 'active' : ''}
            aria-label={`Go to ${s.name.toLowerCase()}`}
            onClick={() => scrollToSection(s.id)}
          />
        ))}
      </nav>
    </>
  )
}

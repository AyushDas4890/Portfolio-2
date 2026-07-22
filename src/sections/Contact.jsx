import { useEffect, useRef } from 'react'
import { profile, socials } from '../data.js'
import { maskReveal } from '../lib/motion.js'

export default function Contact() {
  const ref = useRef(null)
  useEffect(() => { maskReveal(ref.current) }, [])

  return (
    <section id="contact" className="act act-solid contact" ref={ref}>
      <h2 className="serif-display">
        <span className="mask-line"><span>LET&rsquo;S BUILD</span></span>
        <span className="mask-line"><span className="accent">something rare</span></span>
      </h2>
      <div>
        <a className="email" href={`mailto:${profile.email}`}>{profile.email}</a>
      </div>
      <div className="links">
        {socials.map((s) => (
          <a key={s.label} href={s.url} target={s.url.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer">
            {s.label}
          </a>
        ))}
      </div>
      <div>
        <a className="resume-btn" href={profile.resume} target="_blank" rel="noreferrer">
          Download resume
        </a>
      </div>
      <p className="footer-line caps">© 2026 AYUSH DAS · DESIGNED &amp; BUILT FROM SCRATCH</p>
    </section>
  )
}

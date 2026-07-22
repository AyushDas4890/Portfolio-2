import { useState, useEffect } from 'react'
import { experience, education } from '../data.js'

export default function Experience() {
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  return (
    <section id="experience" className="act act-solid">
      <div className="act-head">
        <span className="idx">05</span>
        <h2>Experience</h2>
      </div>
      <div className="xp-list">
        {experience.map((x) => (
          <article className="xp-item" key={x.index}>
            <span className="i">{x.index}</span>
            <div>
              <h3>{x.role}</h3>
              <p className="org">
                {x.company}
                <small>{x.org}</small>
              </p>
              <p>{x.summary}</p>
              {x.cert && (
                <div className="xp-cert-wrap">
                  <button
                    className="xp-cert-thumb"
                    onClick={() => setLightbox(x.cert)}
                    aria-label={`View ${x.role} certificate`}
                  >
                    <img src={x.cert} alt={`${x.role} certificate`} loading="lazy" />
                    <span className="xp-cert-overlay">
                      <span className="xp-cert-zoom">⊕</span>
                      <span className="caps">View Certificate</span>
                    </span>
                  </button>
                </div>
              )}
            </div>
            <span className="period">{x.period}</span>
          </article>
        ))}
        <article className="xp-item">
          <span className="i">03</span>
          <div>
            <h3>{education.degree}</h3>
            <p className="org">
              {education.school}
              <small>{education.location} · {education.detail}</small>
            </p>
          </div>
          <span className="period">{education.period}</span>
        </article>
      </div>

      {/* Fullscreen lightbox */}
      {lightbox && (
        <div
          className="cert-lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-label="Certificate preview"
        >
          <button
            className="cert-lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="Close certificate preview"
          >
            ✕
          </button>
          <img
            src={lightbox}
            alt="Certificate"
            className="cert-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}

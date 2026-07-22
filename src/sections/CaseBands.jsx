import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { caseBandProjects } from '../data.js'
import { gsap, reducedMotion, maskReveal } from '../lib/motion.js'

const TOPO = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none" stroke="#8f9fe8" stroke-width="1"><path d="M0 80 Q150 20 300 90 T600 60"/><path d="M0 160 Q160 110 320 170 T600 150"/><path d="M0 240 Q140 200 300 250 T600 230"/><path d="M0 320 Q170 270 330 330 T600 310"/><path d="M0 400 Q150 360 310 410 T600 390"/><path d="M0 480 Q160 430 320 490 T600 470"/><path d="M0 560 Q140 520 300 570 T600 550"/><circle cx="430" cy="180" r="60"/><circle cx="430" cy="180" r="110"/><circle cx="430" cy="180" r="170"/></svg>',
)

function CaseBand({ p }) {
  const bandRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    maskReveal(bandRef.current, { stagger: 0.12 })
    if (reducedMotion || !imgRef.current) return
    const tween = gsap.fromTo(
      imgRef.current,
      { yPercent: -10 },
      {
        yPercent: 0,
        ease: 'none',
        scrollTrigger: { trigger: bandRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    )
    return () => tween.scrollTrigger?.kill()
  }, [])

  return (
    <div className="case-band" ref={bandRef} style={{ '--pal-a': p.palette.a }}>
      <div
        className="topo"
        aria-hidden="true"
        style={{ backgroundImage: `url("data:image/svg+xml,${TOPO}")`, backgroundSize: '600px' }}
      />
      <div className="case-frame">
        <div className="frame-inner">
          <img
            ref={imgRef}
            src={p.artwork}
            alt={`${p.title} artwork`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement.style.background =
                `radial-gradient(80% 120% at 30% 20%, ${p.palette.a} 0%, #0b1229 75%)`
            }}
          />
        </div>
      </div>
      <div className="case-copy">
        <div className="orb" aria-hidden="true" />
        <h3>
          {p.caseTitle.map((line) => (
            <span className="mask-line" key={line}><span className="l">{line}</span></span>
          ))}
        </h3>
        <span className="caps case-label">{p.caseLabel}</span>
        <br />
        <Link to={`/work/${p.slug}`} className="case-link">View case study →</Link>
      </div>
    </div>
  )
}

export default function CaseBands() {
  return (
    <section id="case">
      {caseBandProjects.map((p) => <CaseBand key={p.slug} p={p} />)}
    </section>
  )
}

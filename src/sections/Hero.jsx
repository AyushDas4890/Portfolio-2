import { useEffect, useRef } from 'react'
import { profile } from '../data.js'
import { gsap, stage, reducedMotion } from '../lib/motion.js'

export default function Hero() {
  const ref = useRef(null)

  useEffect(() => {
    const lines = ref.current.querySelectorAll('.mask-line > span')
    if (reducedMotion) return
    gsap.set(lines, { yPercent: 115 })

    // Entrance choreography, synced to the ring's scale-in (runIntro):
    // ring leads 0.55s → role kicker → name → discipline.
    const play = () => {
      gsap.to(lines, {
        yPercent: 0,
        duration: 1.25,
        ease: 'power4.out',
        stagger: 0.18,
        delay: 0.55,
      })
    }
    if (stage.introDone) play()
    else window.addEventListener('site:intro', play, { once: true })
    return () => window.removeEventListener('site:intro', play)
  }, [])

  return (
    <section id="hero" className="hero" ref={ref}>
      <div className="hero-inner">
        <p className="caps kicker mask-line"><span>{profile.role}</span></p>
        <h1 className="serif-display name mask-line">
          <span>{profile.firstName} {profile.lastName}</span>
        </h1>
        <p className="caps sub mask-line"><span>{profile.discipline}</span></p>
        <div className="scroll-cue" aria-hidden="true" />
      </div>
    </section>
  )
}

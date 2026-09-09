import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from './lib/motion'

const SIZE = 26
const STROKE = 2
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Small ring in the nav that fills as the page scrolls, via stroke-dashoffset
// driven by a full-document ScrollTrigger.
export function ScrollProgressRing() {
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const circle = circleRef.current
    if (!circle || prefersReducedMotion()) return

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.to(circle, {
          strokeDashoffset: CIRCUMFERENCE * (1 - self.progress),
          duration: 0.25,
          ease: 'power2.out',
          overwrite: true,
        })
      },
    })
    return () => st.kill()
  }, [])

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0" aria-hidden>
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={STROKE}
        fill="none"
      />
      <circle
        ref={circleRef}
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        stroke="#60a5fa"
        strokeWidth={STROKE}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
      />
    </svg>
  )
}

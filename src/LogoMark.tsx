import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from './lib/motion'

// Replaces the old ✳︎ text glyph with a real SVG so GSAP can drive it: a slow
// continuous spin at rest that spins up sharply on hover.
export function LogoMark({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    tweenRef.current = gsap.to(el, {
      rotate: 360,
      duration: 9,
      repeat: -1,
      ease: 'none',
      transformOrigin: '50% 50%',
    })
    return () => {
      tweenRef.current?.kill()
    }
  }, [])

  return (
    <svg
      ref={ref}
      onPointerEnter={() => tweenRef.current?.timeScale(6)}
      onPointerLeave={() => tweenRef.current?.timeScale(1)}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="5" y1="5" x2="19" y2="19" />
        <line x1="19" y1="5" x2="5" y2="19" />
      </g>
    </svg>
  )
}

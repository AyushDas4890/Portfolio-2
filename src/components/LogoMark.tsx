import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

// The reel's eight-spoke asterisk. Turns slowly at rest and spins up while
// hovered.
export function LogoMark({ className, spin = true }: { className?: string; spin?: boolean }) {
  const ref = useRef<SVGSVGElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !spin || prefersReducedMotion()) return
    tweenRef.current = gsap.to(el, {
      rotate: 360,
      duration: 14,
      repeat: -1,
      ease: 'none',
      transformOrigin: '50% 50%',
    })
    return () => {
      tweenRef.current?.kill()
      tweenRef.current = null
    }
  }, [spin])

  return (
    <svg
      ref={ref}
      onPointerEnter={() => tweenRef.current?.timeScale(8)}
      onPointerLeave={() => tweenRef.current?.timeScale(1)}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <line x1="12" y1="2.5" x2="12" y2="21.5" />
        <line x1="2.5" y1="12" x2="21.5" y2="12" />
        <line x1="5.3" y1="5.3" x2="18.7" y2="18.7" />
        <line x1="18.7" y1="5.3" x2="5.3" y2="18.7" />
      </g>
    </svg>
  )
}

import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from './lib/motion'

// Cursor-tracked tilt + glow for hover-capable cards. Attaches to `ref`;
// expects the card to position a `.card-glow` child (radial gradient overlay
// reading --mx/--my as percentages) for the light-follows-cursor effect.
export function useTiltGlow<T extends HTMLElement>(maxTilt = 8) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !window.matchMedia('(hover: hover)').matches) {
      return
    }

    const setRotateX = gsap.quickTo(el, 'rotateX', { duration: 0.5, ease: 'power3.out' })
    const setRotateY = gsap.quickTo(el, 'rotateY', { duration: 0.5, ease: 'power3.out' })
    const setLift = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
    const glow = el.querySelector<HTMLElement>('.card-glow')
    const setGlowOpacity = glow
      ? gsap.quickTo(glow, 'opacity', { duration: 0.35, ease: 'power2.out' })
      : null

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height

      setRotateY((px - 0.5) * maxTilt * 2)
      setRotateX((0.5 - py) * maxTilt * 2)
      setLift(-6)
      setGlowOpacity?.(1)
      glow?.style.setProperty('--mx', `${px * 100}%`)
      glow?.style.setProperty('--my', `${py * 100}%`)
    }

    const onLeave = () => {
      setRotateX(0)
      setRotateY(0)
      setLift(0)
      setGlowOpacity?.(0)
    }

    el.style.transformStyle = 'preserve-3d'
    el.style.perspective = '800px'
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [maxTilt])

  return ref
}

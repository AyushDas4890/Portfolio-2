import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from './lib/motion'

const ASCII_CHARS = '01{}<>/\\+=#*·'.split('')

// Two cursor treatments sharing one pointer listener: inside the hero the
// cursor leaves a fading trail of ASCII/code glyphs (nods to the "AI/ML
// engineer" identity); everywhere else it's a frosted glass orb with
// backdrop blur that lags gently behind the real pointer. Off on touch
// devices and under prefers-reduced-motion — the native cursor stays put.
export function CursorFX() {
  const glassRef = useRef<HTMLDivElement>(null)
  const trailLayerRef = useRef<HTMLDivElement>(null)
  const lastSpawnRef = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return
    }

    const glass = glassRef.current
    const trailLayer = trailLayerRef.current
    if (!glass || !trailLayer) return

    document.documentElement.classList.add('cursor-fx-active')
    gsap.set(glass, { xPercent: -50, yPercent: -50 })

    const setGlassX = gsap.quickTo(glass, 'x', { duration: 0.5, ease: 'power3.out' })
    const setGlassY = gsap.quickTo(glass, 'y', { duration: 0.5, ease: 'power3.out' })

    const onMove = (e: MouseEvent) => {
      setGlassX(e.clientX)
      setGlassY(e.clientY)

      const overHero = (e.target as HTMLElement | null)?.closest('#home')
      gsap.to(glass, { opacity: overHero ? 0 : 1, duration: 0.25, overwrite: 'auto' })

      if (!overHero) return
      const now = performance.now()
      if (now - lastSpawnRef.current < 45) return
      lastSpawnRef.current = now

      const glyph = document.createElement('span')
      glyph.textContent = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)]
      glyph.className = 'cursor-ascii-glyph'
      glyph.style.left = `${e.clientX}px`
      glyph.style.top = `${e.clientY}px`
      trailLayer.appendChild(glyph)

      gsap.fromTo(
        glyph,
        { opacity: 1, scale: 1, y: 0 },
        {
          opacity: 0,
          scale: 0.6,
          y: -18 - Math.random() * 14,
          x: (Math.random() - 0.5) * 24,
          duration: 0.7,
          ease: 'power2.out',
          onComplete: () => glyph.remove(),
        },
      )
    }

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.classList.remove('cursor-fx-active')
      trailLayer.replaceChildren()
    }
  }, [])

  return (
    <>
      <div ref={trailLayerRef} className="pointer-events-none fixed inset-0 z-[60]" aria-hidden />
      <div ref={glassRef} className="cursor-glass pointer-events-none fixed left-0 top-0 z-[60]" aria-hidden />
    </>
  )
}

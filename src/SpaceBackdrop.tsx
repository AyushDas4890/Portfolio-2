import { useLayoutEffect } from 'react'
import { gsap, prefersReducedMotion } from './lib/motion'

// Near-black maroon with a red → amber glow at the centre.
const BACKDROP =
  'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.16) 0%, rgba(239,68,68,0.22) 12%, rgba(127,29,29,0.28) 30%, rgba(20,6,10,0) 62%), #0b0508'
// Faint light streaks radiating from the centre, masked clear in the middle.
const RAYS = 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(253,186,116,0.09) 0deg 0.5deg, transparent 0.5deg 6deg)'
const RAYS_MASK = 'radial-gradient(circle at 50% 50%, transparent 8%, #000 45%)'

/**
 * Below the hero the avatar steps back: a warm dark space fades in
 * over the video as About arrives and stays for the rest of the page, its
 * light streaks turning slowly with scroll. Fixed like the video (so it lives
 * outside SmoothScroll); the fade is driven from About via useSpaceBackdrop,
 * since that is the first place the trigger element exists.
 */
export function SpaceBackdrop() {
  return (
    <div id="space-bg" aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: BACKDROP, opacity: 0 }}>
      <div className="absolute -inset-1/2" style={{ willChange: 'transform', background: RAYS, maskImage: RAYS_MASK, WebkitMaskImage: RAYS_MASK }} />
    </div>
  )
}

export function useSpaceBackdrop(triggerId: string) {
  useLayoutEffect(() => {
    const el = document.getElementById('space-bg')
    const trigger = document.getElementById(triggerId)
    // Reduced motion keeps the avatar video everywhere, as before.
    if (!el || !trigger || prefersReducedMotion()) return
    const fade = gsap.fromTo(el, { opacity: 0 }, {
      opacity: 1,
      ease: 'none',
      scrollTrigger: { trigger, start: 'top bottom', end: 'top 30%', scrub: true },
    })
    const spin = gsap.fromTo(el.firstElementChild, { rotate: 0 }, {
      rotate: 90,
      ease: 'none',
      scrollTrigger: { trigger, start: 'top bottom', end: 'max', scrub: true },
    })
    return () => {
      fade.scrollTrigger?.kill()
      fade.kill()
      spin.scrollTrigger?.kill()
      spin.kill()
    }
  }, [triggerId])
}

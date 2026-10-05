import { useLayoutEffect } from 'react'
import { BACKDROP, RAYS, RAYS_MASK } from './DepthTunnel'
import { gsap, prefersReducedMotion } from './lib/motion'

/**
 * Below the hero the avatar steps back: the depth tunnel's warm space fades in
 * over the video as the showreel arrives (so the reel doesn't play over a
 * second, moving avatar) and stays for the rest of the page, its light streaks
 * turning slowly with scroll. Fixed like the video (so it lives outside
 * SmoothScroll); the fade is driven from Showreel via useSpaceBackdrop, since
 * that is the first place the trigger element exists.
 */
export function SpaceBackdrop() {
  return (
    <div id="space-bg" aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: BACKDROP, opacity: 0 }}>
      <div className="absolute -inset-1/2" style={{ background: RAYS, maskImage: RAYS_MASK, WebkitMaskImage: RAYS_MASK }} />
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

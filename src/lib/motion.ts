import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Mobile URL bars resize the viewport mid-scroll; re-measuring every trigger
// then is what makes scrubbed sections jump on phones.
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger, SplitText }

export const EASE = 'expo.out'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

let lenis: Lenis | null = null

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger scrubs and
 * Lenis share one clock. Skipped on touch (native momentum is better there)
 * and for reduced motion. Returns a disposer.
 */
export function startSmoothScroll(): () => void {
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches
  if (prefersReducedMotion() || touch) return () => {}

  const instance = new Lenis({ lerp: 0.11, anchors: false })
  lenis = instance
  instance.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

// Lenis caches the page height; a route change can grow the page in the same
// frame as the jump, so re-measure before every programmatic scroll.
export function scrollToTop(immediate = false) {
  if (lenis) {
    lenis.resize()
    lenis.scrollTo(0, { immediate, force: true })
  } else {
    window.scrollTo({ top: 0, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
  }
}

/** Scrolls to a section id; returns false if it isn't on the page. */
export function scrollToId(id: string, immediate = false): boolean {
  const target = document.getElementById(id)
  if (!target) return false
  if (lenis) {
    lenis.resize()
    lenis.scrollTo(target, { immediate, force: true, duration: 1.4 })
  } else {
    target.scrollIntoView({ behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }
  return true
}

/** Resolves once web fonts are in, or after `timeout` ms, whichever is first. */
export function fontsReady(timeout = 700): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve()
  return Promise.race([
    document.fonts.ready.then(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeout)),
  ])
}

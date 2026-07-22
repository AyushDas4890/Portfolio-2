import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

// Shared mutable state read by the ring scene every frame.
// Written by ScrollTrigger + pointermove; avoids React re-renders at 60fps.
export const stage = { progress: 0, section: 0, mx: 0, my: 0, intro: reducedMotion ? 1 : 0, introDone: reducedMotion }

// Fired by the preloader when it finishes; ring + hero entrance sync to this.
export function runIntro() {
  if (stage.introDone) return
  stage.introDone = true
  if (reducedMotion) { stage.intro = 1; return }
  gsap.to(stage, { intro: 1, duration: 1.7, ease: 'power3.out' })
  window.dispatchEvent(new Event('site:intro'))
}

let lenis = null

export function initMotion() {
  const onMove = (e) => {
    stage.mx = (e.clientX / window.innerWidth) * 2 - 1
    stage.my = (e.clientY / window.innerHeight) * 2 - 1
  }
  if (!isTouch) window.addEventListener('pointermove', onMove, { passive: true })

  const st = ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    onUpdate: (self) => { stage.progress = self.progress },
  })

  if (reducedMotion) {
    return () => {
      window.removeEventListener('pointermove', onMove)
      st.kill()
    }
  }

  lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.95, touchMultiplier: 1.3 })
  lenis.on('scroll', ScrollTrigger.update)
  const raf = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return () => {
    window.removeEventListener('pointermove', onMove)
    st.kill()
    gsap.ticker.remove(raf)
    lenis?.destroy()
    lenis = null
    ScrollTrigger.getAll().forEach((t) => t.kill())
  }
}

export function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 })
  else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
}

// Mask reveal: children .mask-line > span rise from below when scrolled into view.
export function maskReveal(rootEl, { stagger = 0.09, delay = 0 } = {}) {
  if (!rootEl) return
  const lines = rootEl.querySelectorAll('.mask-line > span')
  if (!lines.length) return
  if (reducedMotion) return
  gsap.fromTo(
    lines,
    { yPercent: 115 },
    {
      yPercent: 0,
      duration: 1.1,
      ease: 'power4.out',
      stagger,
      delay,
      scrollTrigger: { trigger: rootEl, start: 'top 78%', once: true },
    },
  )
}

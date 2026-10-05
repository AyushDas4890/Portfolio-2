import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from './lib/motion'

/**
 * Scroll zoom reveal (port of the Framer "scroll-zoom-reveal" component).
 *
 * The page opens on an empty obsidian ground with a small rounded window in
 * the middle and the name split either side of it. Scrolling scrubs the
 * window open until it fills the screen. The window is not a separate image:
 * it's a clip-path on the fixed avatar video (#bg-video), so when the reveal
 * finishes the hero is already sitting on exactly the background it uses —
 * there's no swap, cut or cross-fade to hide.
 */
export function IntroReveal() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLSpanElement>(null)
  const rightRef = useRef<HTMLSpanElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const video = document.getElementById('bg-video')
    if (!section || !video) return

    // Every load starts at the reveal, rather than restoring a mid-page scroll
    // position with the window already half open.
    ScrollTrigger.clearScrollMemory('manual')
    window.scrollTo(0, 0)

    if (prefersReducedMotion()) return

    const chrome = document.querySelectorAll('[data-chrome]')

    // Closed window: a capsule sized like the original's 15vw × 5vh, but tall
    // enough on small screens that the face inside actually reads.
    const windowSize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const pw = Math.min(Math.max(w * 0.16, 150), 300)
      const ph = Math.min(Math.max(h * 0.1, 70), 130)
      return { w, h, pw, ph }
    }
    const closedClip = () => {
      const { w, h, pw, ph } = windowSize()
      return `inset(${(h - ph) / 2}px ${(w - pw) / 2}px ${(h - ph) / 2}px ${(w - pw) / 2}px round ${ph / 2}px)`
    }
    const sideOffset = () => {
      const { w, pw } = windowSize()
      return w / 2 - pw / 2
    }
    const verticalOffset = () => {
      const { h, ph } = windowSize()
      return h / 2 - ph / 2
    }
    const narrow = () => window.innerWidth < 640

    const ctx = gsap.context(() => {
      gsap.set(video, { clipPath: closedClip() })
      gsap.set(chrome, { autoAlpha: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(
        video,
        { clipPath: closedClip },
        // Fully open just before the pin releases, so the hero arrives over a
        // full-screen video (no dark margin).
        { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.55, ease: 'power2.inOut' },
        0,
      )
        // The labels ride the window's edges outward (sideways on wide screens,
        // up/down when stacked on narrow ones), then dissolve.
        .to(leftRef.current, { x: () => (narrow() ? 0 : -sideOffset()), y: () => (narrow() ? -verticalOffset() : 0), duration: 0.55, ease: 'power2.inOut' }, 0)
        .to(rightRef.current, { x: () => (narrow() ? 0 : sideOffset()), y: () => (narrow() ? verticalOffset() : 0), duration: 0.55, ease: 'power2.inOut' }, 0)
        .to([leftRef.current, rightRef.current], { opacity: 0, filter: 'blur(10px)', duration: 0.25 }, 0.25)
        .to([hintRef.current, eyebrowRef.current], { opacity: 0, y: -12, duration: 0.2 }, 0)
        .to(chrome, { autoAlpha: 1, duration: 0.15 }, 0.45)

      // Idle nudge until the visitor first scrolls.
      gsap.to(hintRef.current?.querySelector('.intro-arrow') ?? [], {
        y: 6,
        duration: 0.9,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      // Entrance: window and name settle in once on load.
      const enter = gsap.timeline({ delay: 0.15 })
      enter
        .from(video, { opacity: 0, scale: 0.92, duration: 1.1, ease: 'power3.out', clearProps: 'scale' })
        // Entrance animates the wrappers, never the elements the scrub timeline
        // owns — otherwise the scrub records opacity 0 as its start value and the
        // labels stay invisible.
        .from(
          [leftRef.current?.parentElement, rightRef.current?.parentElement],
          { opacity: 0, filter: 'blur(8px)', duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'filter' },
          0.2,
        )
        .from([eyebrowRef.current?.parentElement, hintRef.current?.parentElement], { opacity: 0, y: 10, duration: 0.7, ease: 'power2.out', stagger: 0.1 }, 0.6)
    }, section)

    return () => {
      ctx.revert()
      gsap.set(video, { clearProps: 'clipPath,opacity,scale' })
      gsap.set(chrome, { clearProps: 'opacity,visibility' })
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="intro"
      aria-label="Intro"
      className="relative z-[1] h-screen w-full overflow-hidden"
    >
      <div className="absolute inset-x-0 top-[18%] flex justify-center">
        <p
          ref={eyebrowRef}
          className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.3em] text-white/45"
        >
          AI / ML Engineer
        </p>
      </div>

      <div className="absolute inset-0">
        <h1 className="sr-only">Ayush Das — Portfolio</h1>
        {/* Wide: labels sit either side of the window. Narrow: above and below it. */}
        <div className="absolute inset-x-0 bottom-[calc(50%+min(max(10vh,70px),130px)/2+14px)] flex justify-center sm:inset-x-auto sm:bottom-auto sm:right-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:pr-[calc(min(max(16vw,150px),300px)/2+22px)]">
          <span ref={leftRef} aria-hidden className="intro-label block whitespace-nowrap text-white">
            Ayush Das
          </span>
        </div>
        <div className="absolute inset-x-0 top-[calc(50%+min(max(10vh,70px),130px)/2+14px)] flex justify-center sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:pl-[calc(min(max(16vw,150px),300px)/2+22px)]">
          <span ref={rightRef} aria-hidden className="intro-label block whitespace-nowrap text-white/70">
            Portfolio
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[12%] flex justify-center">
        <div
          ref={hintRef}
          className="flex flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50"
        >
          Scroll to enter
          <svg className="intro-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  )
}

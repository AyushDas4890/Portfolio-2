import { useLayoutEffect, useRef } from 'react'
import { Button } from '../components/Button'
import { LogoMark } from '../components/LogoMark'
import { LINKS } from '../content'
import { useIstClock } from '../lib/hooks'
import { EASE, fontsReady, gsap, prefersReducedMotion, scrollToId } from '../lib/motion'

// Each word sits in its own clipping box so it can rise into view; the
// padding keeps the "y" descender inside the clip.
const WORD_MASK = 'overflow-hidden pb-[0.12em] -mb-[0.12em] pr-[0.02em] align-top'

/**
 * Opens on the reel's closing card — the name, a rule, the role in amber —
 * so the reel underneath reads as its continuation.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const time = useIstClock()

  useLayoutEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    let cancelled = false
    const ctx = gsap.context(() => {
      gsap.set('[data-hero="word"]', { yPercent: 112 })
      gsap.set('[data-hero="mark"]', { scale: 0, rotate: -140 })
      gsap.set('[data-hero="rule"]', { scaleX: 0 })
      gsap.set('[data-hero="fade"]', { autoAlpha: 0, y: 26 })
    }, root)

    fontsReady().then(() => {
      if (cancelled) return
      ctx.add(() => {
        gsap
          .timeline({ defaults: { ease: EASE } })
          .to('[data-hero="word"]', { yPercent: 0, duration: 1.5, stagger: 0.12 }, 0.1)
          .to('[data-hero="mark"]', { scale: 1, rotate: 0, duration: 1.7 }, 0.45)
          .to('[data-hero="rule"]', { scaleX: 1, duration: 1.5, ease: 'expo.inOut' }, 0.35)
          .to('[data-hero="fade"]', { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.09 }, 0.7)
      })
    })

    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [])

  return (
    <section ref={ref} id="home" className="relative overflow-hidden pt-[calc(var(--nav-h)+clamp(36px,8vh,104px))]">
      <div
        aria-hidden
        className="dot-grid pointer-events-none absolute inset-0 opacity-80 [mask-image:radial-gradient(ellipse_75%_70%_at_80%_0%,black,transparent)]"
      />

      <div className="shell relative">
        <div data-hero="fade" className="eyebrow flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-muted">
          <span className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
            </span>
            Open to work
          </span>
          <span>
            Punjab, India — <span className="tabular-nums">{time}</span> IST
          </span>
        </div>

        <h1
          aria-label="Ayush Das"
          className="display mt-[clamp(20px,4vh,44px)] text-[clamp(76px,27vw,128px)] text-fg sm:text-[clamp(96px,15.6vw,250px)]"
        >
          <span aria-hidden className={`${WORD_MASK} block sm:inline-block`}>
            <span data-hero="word" className="inline-block">
              Ayush
            </span>
          </span>{' '}
          <span aria-hidden className={`${WORD_MASK} inline-block`}>
            <span data-hero="word" className="inline-block">
              Das
            </span>
            <span data-hero="mark" className="ml-[0.05em] inline-block h-[0.4em] w-[0.4em] translate-y-[0.14em] align-top">
              <LogoMark className="h-full w-full" />
            </span>
          </span>
        </h1>

        <div data-hero="rule" className="mt-[clamp(18px,3vh,34px)] h-px origin-left bg-white/15" />

        <div className="mt-[clamp(24px,4vh,44px)] grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-12">
          <p data-hero="fade" className="heading text-[clamp(30px,3.6vw,54px)] text-amber lg:col-span-5">
            AI / ML Engineer
          </p>
          <div className="lg:col-span-6 lg:col-start-7">
            <p data-hero="fade" className="max-w-[46ch] text-[17px] leading-[1.6] text-muted sm:text-[19px]">
              I build end-to-end <span className="text-fg">ML, NLP and Generative AI systems</span> — multi-agent research
              pipelines, legal document intelligence, models that ship.
            </p>
            <div data-hero="fade" className="mt-8 flex flex-wrap gap-3">
              <Button
                href="#work"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToId('work')
                }}
              >
                View selected work
              </Button>
              <Button href={LINKS.resume} external variant="ghost" icon="external">
                Résumé
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

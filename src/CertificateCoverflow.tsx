import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, Draggable, prefersReducedMotion } from './lib/motion'
import { ParticleButton } from './ParticleButton'

export interface CoverflowItem {
  key: string
  issuer: string
  title: string
  href: string
  thumb: string
  accent: string
}

const ASPECT = 900 / 660

/**
 * 3D coverflow for certificates. A single continuous `progress` value drives
 * every card: the centred one sits flat and forward, neighbours swing back on
 * rotateY and recede in z. Dragging maps pointer travel straight onto
 * progress, and GSAP InertiaPlugin throws it with a snap to whole cards.
 */
export function CertificateCoverflow({ items }: { items: CoverflowItem[] }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const proxyRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
  const shadeRefs = useRef<(HTMLSpanElement | null)[]>([])
  const glowRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLParagraphElement>(null)
  const progress = useRef({ p: 0 })
  const spacingRef = useRef(260)
  const [active, setActive] = useState(0)
  const [cardWidth, setCardWidth] = useState(360)
  const reduced = prefersReducedMotion()

  const render = useCallback(() => {
    const p = progress.current.p
    const spacing = spacingRef.current
    cardRefs.current.forEach((card, i) => {
      if (!card) return
      const offset = i - p
      const abs = Math.abs(offset)
      const sign = Math.sign(offset)
      const x = abs <= 1 ? offset * spacing : sign * (spacing + (abs - 1) * spacing * 0.42)
      gsap.set(card, {
        x,
        z: -Math.min(abs, 4) * 150,
        rotateY: -Math.max(-1, Math.min(1, offset)) * 48,
        scale: 1 - Math.min(abs, 3) * 0.05,
        autoAlpha: abs > 3.6 ? 0 : 1 - Math.max(0, abs - 2.6),
        zIndex: 100 - Math.round(abs * 10),
      })
      const shade = shadeRefs.current[i]
      if (shade) gsap.set(shade, { opacity: Math.min(abs, 2) * 0.3 })
    })
    const nearest = Math.max(0, Math.min(items.length - 1, Math.round(p)))
    setActive((prev) => (prev === nearest ? prev : nearest))
  }, [items.length])

  const goTo = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(items.length - 1, index))
      if (proxyRef.current) gsap.set(proxyRef.current, { x: -target * spacingRef.current })
      gsap.to(progress.current, {
        p: target,
        duration: reduced ? 0 : 0.75,
        ease: 'power3.out',
        overwrite: true,
        onUpdate: render,
      })
    },
    [items.length, reduced, render],
  )

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      const width = Math.min(380, Math.max(230, stage.clientWidth * 0.3))
      setCardWidth(width)
      spacingRef.current = width * 0.62
      render()
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [render])

  // New filter result: restart at the first card and deal the cards back in.
  useLayoutEffect(() => {
    progress.current.p = 0
    if (proxyRef.current) gsap.set(proxyRef.current, { x: 0 })
    render()
    if (reduced) return
    const cards = cardRefs.current.filter(Boolean)
    gsap.fromTo(cards, { y: 40, filter: 'blur(8px)' }, { y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.04, clearProps: 'filter' })
  }, [items, render, reduced])

  useEffect(() => {
    const stage = stageRef.current
    const proxy = proxyRef.current
    if (!stage || !proxy) return

    const [draggable] = Draggable.create(proxy, {
      type: 'x',
      trigger: stage,
      inertia: !reduced,
      dragResistance: 0,
      edgeResistance: 0.75,
      bounds: { minX: -(items.length - 1) * spacingRef.current, maxX: 0 },
      snap: (value: number) => Math.round(value / spacingRef.current) * spacingRef.current,
      onPress() {
        gsap.killTweensOf(progress.current)
        this.update()
      },
      onDrag() {
        progress.current.p = -this.x / spacingRef.current
        render()
      },
      onThrowUpdate() {
        progress.current.p = -this.x / spacingRef.current
        render()
      },
      onRelease() {
        if (reduced || !this.isThrowing) goTo(Math.round(-this.x / spacingRef.current))
      },
      onClick(event: PointerEvent) {
        const card = (event.target as Element).closest<HTMLElement>('[data-cover-index]')
        if (!card) return
        const index = Number(card.dataset.coverIndex)
        if (index === Math.round(progress.current.p)) window.open(items[index].href, '_blank', 'noopener,noreferrer')
        else goTo(index)
      },
    })

    const syncBounds = () => draggable.applyBounds({ minX: -(items.length - 1) * spacingRef.current, maxX: 0 })
    const observer = new ResizeObserver(syncBounds)
    observer.observe(stage)

    let travel = 0
    let steppedAt = 0
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      const now = performance.now()
      if (now - steppedAt < 280) return
      travel += event.deltaX
      if (Math.abs(travel) < 40) return
      steppedAt = now
      goTo(Math.round(progress.current.p) + (travel > 0 ? 1 : -1))
      travel = 0
    }
    stage.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      draggable.kill()
      observer.disconnect()
      stage.removeEventListener('wheel', onWheel)
    }
  }, [items, goTo, render, reduced])

  const current = items[active]

  useEffect(() => {
    if (!current) return
    if (glowRef.current) gsap.to(glowRef.current, { '--glow': current.accent, duration: 0.6, ease: 'power2.out' })
    const title = titleRef.current
    if (!title || reduced) return
    gsap.to(title, { duration: 0.6, scrambleText: { text: current.title, chars: 'lowerCase', speed: 0.7 }, ease: 'none', overwrite: true })
  }, [current, reduced])

  if (!current) return null

  const cardHeight = cardWidth / ASPECT

  return (
    <div className="relative">
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label="Certificates"
        aria-activedescendant={`cover-${current.key}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            goTo(active + 1)
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault()
            goTo(active - 1)
          } else if (e.key === 'Enter') {
            window.open(current.href, '_blank', 'noopener,noreferrer')
          }
        }}
        className="relative w-full select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#f87171]/60"
        style={{
          height: cardHeight + 96,
          perspective: 1400,
          cursor: 'grab',
          touchAction: 'pan-y',
          maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        }}
      >
        <div ref={proxyRef} className="pointer-events-none absolute h-px w-px opacity-0" aria-hidden />
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={
            {
              '--glow': current.accent,
              width: cardWidth * 1.9,
              height: cardHeight * 1.5,
              background: 'radial-gradient(closest-side, color-mix(in srgb, var(--glow) 32%, transparent), transparent)',
              filter: 'blur(20px)',
            } as React.CSSProperties
          }
        />
        <div className="absolute left-1/2 top-1/2" style={{ transformStyle: 'preserve-3d' }}>
          {items.map((item, i) => (
            <button
              key={item.key}
              id={`cover-${item.key}`}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              type="button"
              role="option"
              aria-selected={i === active}
              tabIndex={-1}
              data-cover-index={i}
              aria-label={`${item.issuer} — ${item.title}`}
              className="absolute overflow-hidden rounded-2xl"
              style={{
                width: cardWidth,
                height: cardHeight,
                left: -cardWidth / 2,
                top: -cardHeight / 2,
                background: '#0c0c12',
                boxShadow: '0 30px 60px -28px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.1)',
                WebkitBoxReflect: 'below 10px linear-gradient(transparent 72%, rgba(255,255,255,0.14))',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
              } as React.CSSProperties}
            >
              <img src={item.thumb} alt="" draggable={false} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1), transparent 30%)' }}
              />
              <span
                ref={(el) => {
                  shadeRefs.current[i] = el
                }}
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[#07070f]"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto -mt-2 flex max-w-xl flex-col items-center px-4 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: current.accent }}>
          {current.issuer}
          <span className="ml-3 text-white/35">
            {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
        </p>
        <p
          ref={titleRef}
          aria-live="polite"
          className="mt-2 min-h-[1.3em] text-[22px] leading-tight text-white sm:text-[26px]"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em', textShadow: '0 1px 20px rgba(0,0,0,0.6)' }}
        >
          {current.title}
        </p>
        <div className="mt-5 flex items-center gap-3">
          <ArrowButton direction="prev" disabled={active === 0} onClick={() => goTo(active - 1)} />
          <ParticleButton label="Open certificate ↗" href={current.href} newTab size="sm" />
          <ArrowButton direction="next" disabled={active === items.length - 1} onClick={() => goTo(active + 1)} />
        </div>
      </div>
    </div>
  )
}

function ArrowButton({ direction, disabled, onClick }: { direction: 'prev' | 'next'; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={direction === 'prev' ? 'Previous certificate' : 'Next certificate'}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-white/10 active:scale-95 disabled:opacity-30"
      style={{
        background: 'rgba(10,10,15,0.55)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d={direction === 'prev' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

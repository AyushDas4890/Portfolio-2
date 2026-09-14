import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from './lib/motion'
import { ParticleButton } from './ParticleButton'

export interface ThreadNode {
  key: string
  period?: string
  title: string
  org?: string
  suborg?: string
  description?: string
  caption: string
  image: string
  href?: string
}

// The path is built in real pixels for the thread layer's current size (no
// non-uniform viewBox stretching), so DrawSVG measures it correctly and the
// stroke keeps a constant width.
function buildPath(count: number, width: number, height: number) {
  const cx = width / 2
  const bulge = Math.min(190, width * 0.36)
  const pinY = Array.from({ length: count }, (_, i) => ((i + 0.5) / count) * height)
  const q0 = pinY[0] * 0.45
  // Lead-in approaches the first pin from the side opposite the first swing,
  // so the curve passes through every pin with a continuous tangent.
  const segments: string[] = [`M${cx},0`, `C${cx},${q0} ${cx - bulge},${pinY[0] - q0} ${cx},${pinY[0]}`]
  for (let i = 1; i < count; i++) {
    const y0 = pinY[i - 1]
    const y1 = pinY[i]
    const side = i % 2 === 1 ? 1 : -1
    const q = (y1 - y0) * 0.32
    segments.push(`C${cx + side * bulge},${y0 + q} ${cx + side * bulge},${y1 - q} ${cx},${y1}`)
  }
  return { d: segments.join(' '), segments, pinY: pinY.map((y) => y / height) }
}

function Pin({ lit }: { lit?: boolean }) {
  return (
    <span className="relative block h-[46px] w-[26px]" aria-hidden>
      <span
        className="absolute left-1/2 top-[20px] h-[24px] w-[2px] -translate-x-1/2 rounded-full"
        style={{ background: 'linear-gradient(180deg, #d6d3cc, #6b6760)' }}
      />
      <span
        className="absolute left-0 top-0 h-[26px] w-[26px] rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #fff3c4 0%, #fbbf24 22%, #d97706 60%, #7c2d12 100%)',
          boxShadow: lit
            ? '0 0 18px 4px rgba(245,158,11,0.55), 0 6px 10px -2px rgba(0,0,0,0.7)'
            : '0 6px 10px -2px rgba(0,0,0,0.7)',
        }}
      />
    </span>
  )
}

/**
 * Experience as a pinned thread (rebuilt from the reference timeline video).
 * A glowing amber thread draws itself down the section as you scroll, over a
 * faint dashed guide. Push pins mark each milestone; taped polaroids hang
 * beside them and stay grey until the lit tip reaches their pin, then warm up
 * to full colour. Everything is one scrubbed timeline, so scrolling back up
 * dims them again.
 */
export function ThreadTimeline({ nodes }: { nodes: ThreadNode[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<SVGPathElement>(null)
  const litRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGPathElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  const pinRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const detailRefs = useRef<(HTMLDivElement | null)[]>([])
  const tiltRefs = useRef<(HTMLDivElement | null)[]>([])
  const layerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  // Memoised: the scrub timeline effect depends on these and must not rebuild every render.
  const { d, segments, pinY } = useMemo(() => buildPath(nodes.length, size.w || 1, size.h || 1), [nodes.length, size.w, size.h])

  useLayoutEffect(() => {
    const el = layerRef.current
    if (!el) return
    const measure = () => {
      const w = Math.round(el.clientWidth)
      const h = Math.round(el.clientHeight)
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const track = trackRef.current
    const lit = litRef.current
    const tip = tipRef.current
    if (!track || !lit || !tip || !size.w) return

    // Arc length at which the lit tip reaches each pin, as a fraction of the
    // whole thread, measured from prefix paths so the reveal lands exactly.
    const svg = lit.ownerSVGElement
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    probe.setAttribute('fill', 'none')
    svg?.appendChild(probe)
    const total = lit.getTotalLength()
    const reach = pinY.map((_, i) => {
      probe.setAttribute('d', segments.slice(0, i + 2).join(' '))
      return probe.getTotalLength() / total
    })
    probe.remove()

    const pins = pinRefs.current.filter(Boolean)
    const cards = cardRefs.current.filter(Boolean)
    const details = detailRefs.current.filter(Boolean)
    // Opacity/transform only while scrubbing (compositor-cheap). The grey look
    // comes from a pre-filtered duplicate photo that fades out on top.
    const greys = track.querySelectorAll('[data-grey]')
    const dim = { opacity: 0.55, scale: 0.96 }
    const bright = { opacity: 1, scale: 1 }

    if (prefersReducedMotion()) {
      gsap.set([lit, glowRef.current], { drawSVG: '100%' })
      gsap.set(tip, { autoAlpha: 0 })
      gsap.set([...cards, ...details], bright)
      gsap.set(greys, { opacity: 0 })
      gsap.set(pins, { autoAlpha: 1, y: 0 })
      return
    }

    const placeTip = (progress: number) => {
      const point = lit.getPointAtLength(progress * total)
      gsap.set(tip, { left: point.x, top: point.y, autoAlpha: progress > 0.002 && progress < 0.998 ? 1 : 0 })
    }

    const ctx = gsap.context(() => {
      gsap.set([lit, glowRef.current], { drawSVG: '0%' })
      gsap.set([...cards, ...details], dim)
      gsap.set(greys, { opacity: 1 })
      gsap.set(pins, { autoAlpha: 0, y: -26, scale: 0.6 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: track,
          start: 'top 62%',
          end: 'bottom 62%',
          scrub: 0.8,
        },
        onUpdate() {
          placeTip(tl.progress())
        },
      })
      tl.to([lit, glowRef.current], { drawSVG: '100%', duration: 1 }, 0)
      reach.forEach((t, i) => {
        const at = Math.max(0, t - 0.03)
        tl.to(pins[i], { autoAlpha: 1, y: 0, scale: 1, duration: 0.05, ease: 'back.out(2.2)' }, at)
        tl.to(cards[i], { ...bright, duration: 0.07, ease: 'power2.out' }, at + 0.01)
        tl.to(greys[i], { opacity: 0, duration: 0.08, ease: 'power1.out' }, at + 0.01)
        tl.to(details[i], { ...bright, duration: 0.07, ease: 'power2.out' }, at + 0.02)
      })
    }, track)

    // Hover: the polaroid swings a little toward the pointer.
    const cleanups = tiltRefs.current.map((el, i) => {
      if (!el) return () => {}
      const base = i % 2 === 0 ? -3.5 : 3.5
      gsap.set(el, { rotate: base })
      const rotate = gsap.quickTo(el, 'rotate', { duration: 0.6, ease: 'power3.out' })
      const lift = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
      const move = (e: PointerEvent) => {
        const box = el.getBoundingClientRect()
        rotate(base + ((e.clientX - box.left) / box.width - 0.5) * 6)
        lift(-6)
      }
      const leave = () => {
        rotate(base)
        lift(0)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    })

    return () => {
      ctx.revert()
      cleanups.forEach((fn) => fn())
    }
  }, [nodes, segments, pinY, size.w])

  return (
    <div ref={trackRef} className="relative" style={{ height: `max(${nodes.length * 62}vh, ${nodes.length * 460}px)` }}>
      {/* Thread layer: full width on desktop, a narrow gutter on mobile. */}
      <div ref={layerRef} className="pointer-events-none absolute inset-y-0 left-0 w-14 md:inset-x-0 md:w-full" aria-hidden>
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}>
          <defs>
            <linearGradient id="thread-lit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fbbf24" />
              <stop offset="0.55" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#fb923c" />
            </linearGradient>
          </defs>
          <path
            ref={guideRef}
            d={d}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
            strokeDasharray="5 9"
          />
          {/* soft glow as a wide faint stroke instead of a per-frame drop-shadow filter */}
          <path
            ref={glowRef}
            d={d}
            fill="none"
            stroke="rgba(245,158,11,0.28)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            ref={litRef}
            d={d}
            fill="none"
            stroke="url(#thread-lit)"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
        </svg>
        <span
          ref={tipRef}
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff3c4]"
          style={{ boxShadow: '0 0 14px 5px rgba(245,158,11,0.75)', opacity: 0 }}
        />
        {nodes.map((node, i) => (
          <div
            key={node.key}
            ref={(el) => {
              pinRefs.current[i] = el
            }}
            className="absolute left-1/2 z-[3] -ml-[13px]"
            style={{ top: `calc(${pinY[i] * 100}% - 44px)` }}
          >
            <Pin lit />
          </div>
        ))}
      </div>

      {nodes.map((node, i) => {
        const left = i % 2 === 0
        return (
          <div
            key={node.key}
            className="absolute inset-x-0 flex -translate-y-1/2 flex-col gap-5 pl-[72px] md:flex-row md:items-center md:gap-0 md:pl-0"
            style={{ top: `${pinY[i] * 100}%`, contain: 'layout' }}
          >
            {/* polaroid */}
            <div
              className={`md:w-1/2 ${left ? 'md:order-1 md:flex md:justify-end md:pr-[72px]' : 'md:order-2 md:flex md:justify-start md:pl-[72px]'}`}
            >
              <div
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                style={{ willChange: 'opacity, transform' }}
              >
                <div
                  ref={(el) => {
                    tiltRefs.current[i] = el
                  }}
                  className="relative w-[200px] rounded-[4px] p-[10px] pb-[38px] sm:w-[250px]"
                  style={{
                    background: 'linear-gradient(180deg, #f5f1e8, #ebe5d8)',
                    boxShadow: '0 28px 50px -22px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.25)',
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute -top-3 left-1/2 h-[22px] w-[74px] -translate-x-1/2"
                    style={{
                      background:
                        i % 2 === 0
                          ? 'repeating-linear-gradient(90deg, rgba(96,165,250,0.45) 0 6px, rgba(147,197,253,0.38) 6px 12px)'
                          : 'repeating-linear-gradient(90deg, rgba(245,158,11,0.45) 0 6px, rgba(251,191,36,0.36) 6px 12px)',
                      transform: `translateX(-50%) rotate(${i % 2 === 0 ? -5 : 4}deg)`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                    }}
                  />
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1a22]">
                    <img src={node.image} alt="" loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover" />
                    <img
                      data-grey
                      src={node.image}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ filter: 'grayscale(1) brightness(0.6)' }}
                    />
                  </div>
                  <p
                    className="absolute inset-x-0 bottom-[10px] text-center text-[14px] italic text-[#3a3630]"
                    style={{ fontFamily: '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive' }}
                  >
                    {node.caption}
                  </p>
                </div>
              </div>
            </div>

            {/* details */}
            <div
              ref={(el) => {
                detailRefs.current[i] = el
              }}
              className={`max-w-[440px] md:w-1/2 ${left ? 'md:order-2 md:pl-[72px]' : 'md:order-1 md:ml-auto md:pr-[72px] md:text-right'}`}
              style={{ willChange: 'opacity, transform' }}
            >
              {node.period && (
                <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[#f59e0b]">{node.period}</p>
              )}
              <h3
                className="text-[21px] leading-tight text-white sm:text-[26px]"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em', textShadow: '0 1px 20px rgba(0,0,0,0.6)' }}
              >
                {node.title}
              </h3>
              {node.org && (
                <p className="mt-1 text-[14px] text-white/70">
                  {node.org}
                  {node.suborg && <span className="text-white/45"> · {node.suborg}</span>}
                </p>
              )}
              {node.description && (
                <p className="mt-3 text-[15px] leading-relaxed text-white/65" style={{ textShadow: '0 1px 16px rgba(0,0,0,0.7)' }}>
                  {node.description}
                </p>
              )}
              {node.href && (
                <div className={`mt-4 flex ${left ? '' : 'md:justify-end'}`}>
                  <ParticleButton label="View certificate ↗" href={node.href} newTab variant="glass" size="sm" />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

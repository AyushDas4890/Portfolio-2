import { useLayoutEffect, useMemo, useRef } from 'react'
import { createAnimatable, createSeededRandom } from 'animejs'
import { useScrollAnime } from './lib/scrollAnime'
import { prefersReducedMotion } from './lib/motion'

// Depth between stages (px along the camera axis) and how far the tunnel
// twists per stage. Each stage is counter-rotated by the same amount so its
// word reads upright at the moment the camera reaches it.
const GAP = 1400
const TWIST = 10
// Warm grade taken from the avatar video (deep maroon → red) with the site's
// amber accent, so the flight reads as the same shot as the hero.
const VIGNETTE = 'radial-gradient(ellipse at 50% 50%, rgba(24,6,12,0.35) 0%, rgba(14,4,8,0.78) 60%, rgba(7,3,6,0.94) 100%)'
const AMBER = '#f59e0b'
// The tunnel's own space (the avatar video is covered while flying): near-black
// maroon with a red → amber glow at the vanishing point.
export const BACKDROP =
  'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.16) 0%, rgba(239,68,68,0.22) 12%, rgba(127,29,29,0.28) 30%, rgba(20,6,10,0) 62%), #0b0508'
// Faint light streaks radiating from the centre, masked clear in the middle;
// they turn and stretch with the flight to sell the speed.
export const RAYS = 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(253,186,116,0.09) 0deg 0.5deg, transparent 0.5deg 6deg)'
export const RAYS_MASK = 'radial-gradient(circle at 50% 50%, transparent 8%, #000 45%)'

const STAGES = [
  {
    word: 'Data',
    caption: 'Exploration, features, honest baselines',
    tiles: ['/project-previews/03.jpg', '/certificates/thumbs/data-science-cipherschools.webp'],
  },
  {
    word: 'Language',
    caption: 'NLP & transformers — DeBERTa, BERT, fine-tuning',
    tiles: ['/project-previews/02.jpg', '/projects/library-book-classifier.png'],
  },
  {
    word: 'Agents',
    caption: 'LangGraph multi-agent pipelines · RAG over ChromaDB',
    tiles: ['/projects/ai-research-assistant.png', '/project-previews/06.jpg'],
  },
  {
    word: 'Products',
    caption: 'FastAPI + React — shipped where people use them',
    tiles: [],
  },
]

const DARK_LOGOS = ['langchain', 'langgraph', 'huggingface']
const ORBIT = ['python', 'pytorch', 'tensorflow', 'huggingface', 'langchain', 'langgraph', 'fastapi', 'react']

// Where a stage's two tiles float, mirrored on alternate stages.
const TILE_SPOTS = [
  { x: -31, y: -15 },
  { x: 30, y: 17 },
]

/**
 * A pinned 3D flight between the intro reveal and the hero. Scrolling drives the camera
 * forward through a twisting tunnel: each stage (Data → Language → Agents →
 * Products) sits at its own depth with a glowing ring, its word and project
 * shots, and fades out just before it passes the lens. Dust at random depths
 * sells the speed; the pointer tilts the whole space slightly.
 *
 * anime.js animates the camera (the .tunnel-world transform) and stage
 * opacity; ScrollTrigger only pins the section and supplies progress.
 */
export function DepthTunnel() {
  const ref = useRef<HTMLElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)

  const dust = useMemo(() => {
    const rand = createSeededRandom(11)
    return Array.from({ length: 70 }, () => ({
      x: rand(-60, 60),
      y: rand(-45, 45),
      z: -rand(0, (STAGES.length + 1.5) * GAP),
      size: rand(1, 3, 1),
    }))
  }, [])

  useScrollAnime(
    ref,
    (tl, el) => {
      const travel = STAGES.length * GAP
      tl.add(el.querySelector('.tunnel-world')!, { translateZ: [0, travel], rotateZ: [0, -TWIST * STAGES.length], duration: travel, ease: 'inOutSine' }, 0)
        .add(el.querySelector('.tunnel-bar')!, { scaleX: [0, 1], duration: travel }, 0)
        // Starts and ends fully transparent over the avatar video: the tunnel's
        // own backdrop, vignette and HUD come up as the intro window finishes
        // opening, and clear again once the camera flies through the last
        // stage, so the hero rises over the same untouched video.
        .add(el.querySelector('.tunnel-backdrop')!, { opacity: [0, 1], duration: 0.6 * GAP, ease: 'inOutQuad' }, 0)
        .add(el.querySelector('.tunnel-rays')!, { rotate: [0, 50], scale: [1, 1.7], duration: travel, ease: 'inOutSine' }, 0)
        .add(el.querySelector('.tunnel-backdrop')!, { opacity: [1, 0], duration: 0.7 * GAP, ease: 'inOutQuad' }, travel + 0.05 * GAP)
        .add(el.querySelector('.tunnel-vignette')!, { opacity: [0, 1], duration: 0.7 * GAP, ease: 'inOutQuad' }, 0)
        .add(el.querySelector('.tunnel-hud')!, { opacity: [0, 1], duration: 0.4 * GAP }, 0.3 * GAP)
        .add(el.querySelector('.tunnel-vignette')!, { opacity: [1, 0], duration: 0.8 * GAP, ease: 'inOutQuad' }, travel - 0.1 * GAP)
        .add(el.querySelector('.tunnel-hud')!, { opacity: [1, 0], duration: 0.3 * GAP }, travel)
      el.querySelectorAll('.tunnel-stage').forEach((stage, i) => {
        const arrive = (i + 1) * GAP
        if (i === 0) {
          tl.add(stage, { opacity: [0, 1], duration: 0.6 * GAP, ease: 'inOutQuad' }, 0.15 * GAP)
        } else {
          // Crossfades with the previous stage as that one passes the lens, so
          // only one word is ever legible at a time.
          tl.add(stage, { opacity: [0, 1], duration: 0.4 * GAP, ease: 'inOutQuad' }, arrive - 0.75 * GAP)
        }
        tl.add(stage, { opacity: [1, 0], duration: 450 }, arrive + 250)
      })
      // Clear tail: the last ~20% of the pin is where
      // the hero (pulled up by -100vh) rises in.
      tl.add({ duration: 1.1 * GAP }, travel)
    },
    { start: 'top top', end: `+=${STAGES.length * 125}%`, pin: true },
  )

  // Pointer tilts the space a few degrees; anime's animatable eases it.
  useLayoutEffect(() => {
    const el = tiltRef.current
    if (!el || prefersReducedMotion() || !window.matchMedia('(hover: hover)').matches) return
    const tilt = createAnimatable(el, { rotateX: 900, rotateY: 900, ease: 'out(3)' })
    const move = (e: PointerEvent) => {
      tilt.rotateY((e.clientX / window.innerWidth - 0.5) * 10)
      tilt.rotateX((0.5 - e.clientY / window.innerHeight) * 8)
    }
    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      tilt.revert()
    }
  }, [])

  // Without motion there is no flight to take; About carries the same content.
  if (prefersReducedMotion()) return null

  return (
    // Pulled up over the end of the pinned intro: its content is invisible
    // until the pin starts, so the flight begins in the same shot as the
    // opened window. Takes no pointer events (the hero overlaps its tail).
    <div className="pointer-events-none" style={{ marginTop: '-100vh' }}>
    <section ref={ref} id="depth" aria-label="What I build" className="relative h-screen">
      <div className="absolute inset-0 overflow-hidden" style={{ perspective: '900px' }}>
        <div aria-hidden className="tunnel-backdrop absolute inset-0 overflow-hidden" style={{ background: BACKDROP }}>
          <div
            className="tunnel-rays absolute -inset-1/2"
            style={{ background: RAYS, maskImage: RAYS_MASK, WebkitMaskImage: RAYS_MASK }}
          />
        </div>
        <div aria-hidden className="tunnel-vignette absolute inset-0" style={{ background: VIGNETTE }} />
        <div ref={tiltRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          <div className="tunnel-world absolute left-1/2 top-1/2" style={{ transformStyle: 'preserve-3d' }}>
            {dust.map((d, i) => (
              <span
                key={i}
                aria-hidden
                className="absolute left-0 top-0 rounded-full bg-[#fdba74]"
                style={{ width: d.size, height: d.size, opacity: 0.55, transform: `translate3d(${d.x}vw, ${d.y}vh, ${d.z}px)` }}
              />
            ))}

            {STAGES.map((stage, i) => (
              <div
                key={stage.word}
                className="tunnel-stage absolute left-0 top-0"
                style={{ transform: `translate3d(0, 0, ${-(i + 1) * GAP}px) rotateZ(${TWIST * (i + 1)}deg)` }}
              >
                <div
                  aria-hidden
                  className="absolute left-0 top-0 h-[86vmin] w-[86vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(253,186,116,0.28), 0 0 80px -12px rgba(239,68,68,0.45), inset 0 0 80px -20px rgba(245,158,11,0.3)' }}
                />

                {stage.tiles.map((src, t) => {
                  const spot = TILE_SPOTS[(t + i) % 2]
                  return (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute left-0 top-0 w-[38vw] max-w-[340px] rounded-xl sm:w-[24vw]"
                      style={{
                        transform: `translate(-50%, -50%) translate(${spot.x}vw, ${spot.y}vh) rotate(${spot.x > 0 ? 4 : -4}deg)`,
                        boxShadow: '0 20px 60px -15px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
                      }}
                    />
                  )
                })}

                {i === STAGES.length - 1 &&
                  ORBIT.map((name, k) => {
                    const a = (k / ORBIT.length) * Math.PI * 2
                    return (
                      <span
                        key={name}
                        className="glass-tile absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{ transform: `translate(-50%, -50%) translate(${Math.cos(a) * 46}vmin, ${Math.sin(a) * 36}vmin)` }}
                      >
                        <img
                          src={`/tech/${name}.svg`}
                          alt=""
                          className="h-7 w-7"
                          // Black-ink logos vanish on the dark tiles; render them light.
                          style={DARK_LOGOS.includes(name) ? { filter: 'brightness(0) invert(0.92)' } : undefined}
                        />
                      </span>
                    )
                  })}

                <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center">
                  <p className="mb-3 font-mono text-[12px] tracking-[0.3em]" style={{ color: AMBER }}>
                    {String(i + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}
                  </p>
                  <h3
                    className="text-white"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(64px, 12vw, 200px)',
                      letterSpacing: '-0.04em',
                      lineHeight: 0.95,
                      textShadow: '0 0 50px rgba(239,68,68,0.45), 0 4px 30px rgba(0,0,0,0.7)',
                    }}
                  >
                    {stage.word}
                  </h3>
                  <p className="mt-4 text-[15px] text-white/70 sm:text-[18px]">{stage.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tunnel-hud absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
          <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">Scroll to fly through</span>
          <span className="block h-px w-40 bg-white/15">
            <span className="tunnel-bar block h-full w-full origin-left" style={{ background: AMBER }} />
          </span>
        </div>
      </div>
    </section>
    </div>
  )
}

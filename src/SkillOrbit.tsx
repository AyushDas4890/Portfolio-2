import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { gsap, prefersReducedMotion } from './lib/motion'

interface Tech {
  name: string
  // 'color': full-colour logo drawn as-is. 'mask': single-colour logo tinted
  // via CSS mask so dark glyphs stay visible on glass. 'mono': text monogram
  // for tools without an official icon.
  kind: 'color' | 'mask' | 'mono'
  icon?: string
  tint?: string
  label?: string
}

const RING_A: Tech[] = [
  { name: 'Python', kind: 'color', icon: '/tech/python.svg' },
  { name: 'PyTorch', kind: 'color', icon: '/tech/pytorch.svg' },
  { name: 'TensorFlow', kind: 'color', icon: '/tech/tensorflow.svg' },
  { name: 'scikit-learn', kind: 'color', icon: '/tech/scikitlearn.svg' },
  { name: 'Hugging Face', kind: 'mask', icon: '/tech/huggingface.svg', tint: '#ffd21e' },
  { name: 'LangChain', kind: 'mask', icon: '/tech/langchain.svg', tint: '#7fd1b9' },
  { name: 'LangGraph', kind: 'mask', icon: '/tech/langgraph.svg', tint: '#ffffff' },
  { name: 'OpenAI', kind: 'mask', icon: '/tech/openai.svg', tint: '#ffffff' },
  { name: 'XGBoost', kind: 'mono', label: 'XG', tint: '#fb7185' },
]

const RING_B: Tech[] = [
  { name: 'ChromaDB', kind: 'mono', label: 'Ch', tint: '#f59e0b' },
  { name: 'FastAPI', kind: 'color', icon: '/tech/fastapi.svg' },
  { name: 'Django', kind: 'mask', icon: '/tech/django.svg', tint: '#44b78b' },
  { name: 'React', kind: 'color', icon: '/tech/react.svg' },
  { name: 'Next.js', kind: 'mask', icon: '/tech/nextjs.svg', tint: '#ffffff' },
  { name: 'Three.js', kind: 'mask', icon: '/tech/threejs.svg', tint: '#ffffff' },
  { name: 'Docker', kind: 'color', icon: '/tech/docker.svg' },
  { name: 'spaCy', kind: 'mask', icon: '/tech/spacy.svg', tint: '#09a3d5' },
  { name: 'Tailwind', kind: 'color', icon: '/tech/tailwind.svg' },
]

// Ellipse radii are for an 560px-wide stage and scale with it.
const RINGS = [
  { items: RING_A, rx: 250, ry: 64, tilt: -10, lap: 38, direction: 1, phase: 0 },
  { items: RING_B, rx: 205, ry: 176, tilt: 22, lap: 52, direction: -1, phase: 0.35 },
]
const BASE_WIDTH = 560

function Logo({ tech }: { tech: Tech }) {
  if (tech.kind === 'mono') {
    return (
      <span className="font-mono text-[14px] font-semibold" style={{ color: tech.tint }}>
        {tech.label}
      </span>
    )
  }
  if (tech.kind === 'mask') {
    return (
      <span
        aria-hidden
        className="block h-[24px] w-[24px]"
        style={{
          background: tech.tint,
          WebkitMask: `url(${tech.icon}) center / contain no-repeat`,
          mask: `url(${tech.icon}) center / contain no-repeat`,
        }}
      />
    )
  }
  return <img src={tech.icon} alt="" draggable={false} className="h-[26px] w-[26px] object-contain" />
}

/**
 * Tech stack as small 3D glass tiles orbiting whatever sits in the middle.
 * Two tilted elliptical rings run in opposite directions; each tile's depth
 * comes from its angle, so it scales and fades as it swings round, and flips
 * above or below the centre element (z-index 2) to pass in front or behind.
 */
export function SkillOrbit({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const [hovered, setHovered] = useState<string | null>(null)
  const speed = useRef({ value: 1 })
  // While the pointer is on the centre piece (the dossier), tiles drop behind
  // it and fade so they never cover the opened sheet.
  const centreActive = useRef(false)
  const centreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const reduced = prefersReducedMotion()
    const placement = RINGS.flatMap((ring) =>
      ring.items.map((_, i) => ({ ring, offset: i / ring.items.length + ring.phase })),
    )

    let elapsed = 0
    let visible = true

    const place = () => {
      const scale = Math.min(1.15, Math.max(0.7, stage.clientWidth / BASE_WIDTH))
      placement.forEach(({ ring, offset }, i) => {
        const tile = tileRefs.current[i]
        if (!tile) return
        const angle = (offset + (ring.direction * elapsed) / ring.lap) * Math.PI * 2
        const ex = Math.cos(angle) * ring.rx * scale
        const ey = Math.sin(angle) * ring.ry * scale
        const tilt = (ring.tilt * Math.PI) / 180
        const x = ex * Math.cos(tilt) - ey * Math.sin(tilt)
        const y = ex * Math.sin(tilt) + ey * Math.cos(tilt)
        const depth = (Math.sin(angle) + 1) / 2
        // Also while the centre piece is open (a tap on touch has no lasting hover).
        const behind = centreActive.current || !!centreRef.current?.querySelector('[aria-expanded="true"]')
        gsap.set(tile, {
          x,
          y,
          scale: 0.7 + depth * 0.38,
          opacity: (0.42 + depth * 0.58) * (behind ? 0.4 : 1),
          zIndex: behind || depth <= 0.5 ? 1 : 3,
        })
      })
    }

    place()
    if (reduced) {
      const onResize = () => place()
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    const tick = (_time: number, deltaMs: number) => {
      if (!visible) return
      elapsed += (Math.min(deltaMs, 64) / 1000) * speed.current.value
      place()
    }
    gsap.ticker.add(tick)

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
    })
    observer.observe(stage)

    return () => {
      gsap.ticker.remove(tick)
      observer.disconnect()
    }
  }, [])

  // Ease the rings to a stop while a tile is hovered, and back up after.
  useEffect(() => {
    gsap.to(speed.current, { value: hovered ? 0 : 1, duration: 0.6, ease: 'power2.out', overwrite: true })
  }, [hovered])

  let index = 0
  return (
    <div ref={stageRef} className="relative mx-auto flex aspect-[56/52] w-full max-w-[600px] items-center justify-center">
      <div
        ref={centreRef}
        className="relative"
        style={{ zIndex: 2 }}
        onPointerEnter={() => {
          centreActive.current = true
          setHovered('__centre')
        }}
        onPointerLeave={() => {
          centreActive.current = false
          setHovered(null)
        }}
      >
        {children}
      </div>
      {RINGS.flatMap((ring) =>
        ring.items.map((tech) => {
          const i = index++
          const isHovered = hovered === tech.name
          return (
            <div
              key={tech.name}
              ref={(el) => {
                tileRefs.current[i] = el
              }}
              className="absolute left-1/2 top-1/2"
              style={{ marginLeft: -24, marginTop: -24, willChange: 'transform, opacity' }}
            >
              <div
                tabIndex={0}
                role="img"
                aria-label={tech.name}
                onPointerEnter={() => setHovered(tech.name)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(tech.name)}
                onBlur={() => setHovered(null)}
                className="glass-tile relative flex h-12 w-12 items-center justify-center rounded-[14px] outline-none transition-transform duration-300"
                style={{ transform: isHovered ? 'translateY(-6px) scale(1.12)' : undefined } as CSSProperties}
              >
                <Logo tech={tech} />
                <span
                  className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white transition-all duration-200"
                  style={{
                    background: 'rgba(12,12,18,0.85)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                    opacity: isHovered ? 1 : 0,
                    transform: `translate(-50%, ${isHovered ? 0 : -4}px)`,
                  }}
                >
                  {tech.name}
                </span>
              </div>
            </div>
          )
        }),
      )}
    </div>
  )
}

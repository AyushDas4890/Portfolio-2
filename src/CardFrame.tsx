import { useLayoutEffect, useRef } from 'react'
import { gsap, Draggable, prefersReducedMotion } from './lib/motion'

let uid = 0

// Three organic blob outlines with matching point counts so MorphSVGPlugin
// interpolates cleanly between any pair of them.
const BLOB_SHAPES = [
  'M42 4C58 4 76 18 78 38C80 58 64 78 42 80C20 82 4 64 4 42C4 20 26 4 42 4Z',
  'M40 6C60 10 82 20 80 42C78 64 56 80 36 78C16 76 2 58 4 38C6 18 20 2 40 6Z',
  'M44 2C62 6 80 22 78 44C76 66 58 82 38 78C18 74 2 54 6 34C10 14 26 -2 44 2Z',
]

// Replaces the flat CSS border + solid background on project/experience/
// credential cards with: a hand-drawn rounded border that draws in on reveal
// (DrawSVGPlugin), a liquid corner blob that morphs shape on a loop
// (MorphSVGPlugin) and idly drifts on a tiny closed loop (MotionPathPlugin),
// and can be grabbed and flung — it's bounded to the card and springs back
// with inertia (Draggable + InertiaPlugin).
export function CardFrame({ accent = '#60a5fa' }: { accent?: string }) {
  const clipId = useRef(`card-frame-clip-${uid++}`).current
  const hostRef = useRef<SVGSVGElement>(null)
  const borderRef = useRef<SVGRectElement>(null)
  const blobRef = useRef<SVGPathElement>(null)
  const blobGroupRef = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const svg = hostRef.current
    const border = borderRef.current
    const blob = blobRef.current
    const blobGroup = blobGroupRef.current
    const card = svg?.parentElement
    if (!svg || !border || !blob || !blobGroup || !card) return

    const rect = card.getBoundingClientRect()
    const home = { x: rect.width - 62, y: rect.height - 62 }
    gsap.set(blobGroup, { x: home.x, y: home.y })

    if (prefersReducedMotion()) {
      gsap.set(border, { drawSVG: '100%' })
      return
    }

    const drawTween = gsap.fromTo(
      border,
      { drawSVG: '0%' },
      {
        drawSVG: '100%',
        duration: 1.1,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: card, start: 'top 90%', once: true },
      },
    )

    const morphTween = gsap.to(blob, {
      morphSVG: BLOB_SHAPES[1],
      duration: 5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })

    let driftTween: gsap.core.Tween | null = null
    const startDrift = () => {
      driftTween = gsap.to(blobGroup, {
        motionPath: {
          path: [
            { x: home.x, y: home.y },
            { x: home.x + 9, y: home.y - 12 },
            { x: home.x - 7, y: home.y + 7 },
            { x: home.x, y: home.y },
          ],
          curviness: 1.5,
        },
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
      })
    }
    startDrift()

    const draggable = Draggable.create(blobGroup, {
      type: 'x,y',
      inertia: true,
      bounds: { minX: 30, maxX: rect.width - 30, minY: 30, maxY: rect.height - 30 },
      edgeResistance: 0.65,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onPress() {
        driftTween?.kill()
        gsap.to(blob, { scale: 1.15, duration: 0.2, transformOrigin: '50% 50%' })
      },
      onDragEnd() {
        gsap.to(blob, { scale: 1, duration: 0.3 })
        gsap.to(this.target, {
          x: home.x,
          y: home.y,
          duration: 1.2,
          delay: 0.5,
          ease: 'elastic.out(1, 0.55)',
          onComplete: startDrift,
        })
      },
    })

    return () => {
      drawTween.scrollTrigger?.kill()
      drawTween.kill()
      morphTween.kill()
      driftTween?.kill()
      draggable.forEach((d) => d.kill())
    }
  }, [])

  return (
    <svg
      ref={hostRef}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="100%" height="100%" rx="16" />
        </clipPath>
      </defs>
      <rect
        ref={borderRef}
        x="1"
        y="1"
        width="99%"
        height="99%"
        rx="16"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
      />
      <g clipPath={`url(#${clipId})`}>
        <g ref={blobGroupRef} className="pointer-events-auto" style={{ cursor: 'grab' }}>
          <path
            ref={blobRef}
            d={BLOB_SHAPES[0]}
            transform="translate(-42,-42)"
            fill={accent}
            opacity={0.22}
            style={{ filter: 'blur(6px)' }}
          />
        </g>
      </g>
    </svg>
  )
}

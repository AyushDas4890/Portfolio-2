import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { gsap, ScrollTrigger, prefersReducedMotion } from './lib/motion'
import { LINKS } from './content'

interface OrbitItem {
  key: string
  label: string
  color: string
  depth: number
  href?: string
  icon: ReactNode
  action?: 'copy'
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const ITEMS: OrbitItem[] = [
  {
    key: 'github',
    label: 'GitHub',
    color: '#e5e7eb',
    depth: 1,
    href: LINKS.github,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    color: '#0a66c2',
    depth: 0.75,
    href: LINKS.linkedin,
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452z" />
      </svg>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    color: '#f87171',
    depth: 0.5,
    href: `mailto:${LINKS.email}`,
    icon: (
      <svg viewBox="0 0 24 24" width="21" height="21" {...stroke} aria-hidden>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    key: 'resume',
    label: 'Résumé',
    color: '#f59e0b',
    depth: 0.9,
    href: LINKS.resume,
    icon: (
      <svg viewBox="0 0 24 24" width="21" height="21" {...stroke} aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
      </svg>
    ),
  },
  {
    key: 'copy',
    label: 'Copy email',
    color: '#a78bfa',
    depth: 0.6,
    action: 'copy',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" {...stroke} aria-hidden>
        <rect width="14" height="14" x="8" y="8" rx="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
    ),
  },
  {
    key: 'cases',
    label: 'Case studies',
    color: '#34d399',
    depth: 0.4,
    href: '#/case-studies',
    icon: (
      <svg viewBox="0 0 24 24" width="21" height="21" {...stroke} aria-hidden>
        <path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      </svg>
    ),
  },
]

const SPRING = { type: 'spring', stiffness: 350, damping: 24 } as const
const ITEM_SIZE = 58

function OrbitButton({
  item,
  index,
  total,
  spread,
  mouseX,
  mouseY,
  copied,
  dimmed,
  onHover,
  onCopy,
}: {
  item: OrbitItem
  index: number
  total: number
  spread: number
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  copied: boolean
  dimmed: boolean
  onHover: (key: string | null) => void
  onCopy: () => void
}) {
  const angle = (-90 + (360 / total) * index) * (Math.PI / 180)
  const x = Math.cos(angle) * spread
  const y = Math.sin(angle) * spread
  // Attraction parallax from the original: each button leans toward the
  // pointer from its orbit slot, more the "closer" (deeper) it is.
  const px = useTransform(mouseX, (mx) => (mx - x) * item.depth * 0.06)
  const py = useTransform(mouseY, (my) => (my - y) * item.depth * 0.06)
  const glow = copied ? '#22c55e' : item.color
  const external = item.href?.startsWith('http')

  const button = (
    <motion.span
      whileHover={{ scale: 1.14 }}
      whileTap={{ scale: 0.9 }}
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        color: copied ? '#22c55e' : item.color,
        background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22), rgba(18,18,26,0.82) 60%)',
        boxShadow: `inset 0 1px 1px rgba(255,255,255,0.4), inset 0 0 0 1px rgba(255,255,255,0.12), 0 ${Math.round(item.depth * 14)}px ${10 + item.depth * 22}px rgba(0,0,0,${0.3 + item.depth * 0.3}), 0 0 ${Math.round(item.depth * 22)}px ${glow}55`,
      }}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" width="22" height="22" {...stroke} strokeWidth={2.6} aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        item.icon
      )}
    </motion.span>
  )

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ marginLeft: -ITEM_SIZE / 2, marginTop: -ITEM_SIZE / 2, zIndex: Math.round(item.depth * 10) + 2, transformStyle: 'preserve-3d' }}
      initial={{ x: 0, y: 0, z: 0, scale: 0, opacity: 0 }}
      animate={{ x, y, z: item.depth * 80, scale: 0.88 + item.depth * 0.12, opacity: 1, transition: { ...SPRING, delay: index * 0.07 } }}
      exit={{ x: 0, y: 0, z: 0, scale: 0, opacity: 0, transition: { ...SPRING, delay: (total - 1 - index) * 0.04 } }}
    >
      <motion.div
        style={{ x: px, y: py }}
        animate={{ filter: dimmed ? 'blur(1.5px) brightness(0.55)' : 'blur(0px) brightness(1)', opacity: dimmed ? 0.65 : 1 }}
        transition={{ duration: 0.18 }}
        className="group relative"
        onPointerEnter={() => onHover(item.key)}
        onPointerLeave={() => onHover(null)}
      >
        {/* counter-rotates the ring's idle spin so icons stay upright */}
        <span className="relative block" style={{ transform: 'rotate(calc(-1 * var(--spin, 0deg)))' }}>
        <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ background: 'rgba(12,12,18,0.9)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }}>
          {item.action === 'copy' && copied ? 'Copied!' : item.label}
        </span>
        {item.action === 'copy' ? (
          <button type="button" aria-label={copied ? 'Email copied' : `Copy ${LINKS.email}`} onClick={onCopy} className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#f87171]">
            {button}
          </button>
        ) : (
          <a
            href={item.href}
            aria-label={item.label}
            {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#f87171]"
          >
            {button}
          </a>
        )}
        </span>
      </motion.div>
    </motion.div>
  )
}

/**
 * 3D contact orbit (port of Framer "Social Sharing" FAB, made spatial).
 * A glass orb sits in a tilted 3D plane that leans toward the cursor. It opens
 * into a full ring of contact buttons on springs; each button floats at its own
 * depth (translateZ + scale + shadow), leans toward the pointer by that depth,
 * and hovering one blurs the rest. The ring idles in a slow rotation.
 */
export function ContactOrbit() {
  const stageRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [spread, setSpread] = useState(150)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const mouseX = useSpring(rawX, { stiffness: 90, damping: 26 })
  const mouseY = useSpring(rawY, { stiffness: 90, damping: 26 })
  const ringTween = useRef<ReturnType<typeof gsap.fromTo> | null>(null)

  useEffect(() => {
    const onResize = () => setSpread(window.innerWidth < 640 ? 112 : 150)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    const plane = planeRef.current
    const ring = ringRef.current
    if (!stage || !plane || !ring) return

    const reduced = prefersReducedMotion()
    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top 70%',
      once: true,
      onEnter: () => setOpen(true),
    })
    if (reduced) return () => trigger.kill()

    gsap.set(plane, { rotateX: 18, rotateY: 0.01 })
    const rotX = gsap.quickTo(plane, 'rotateX', { duration: 0.8, ease: 'power3.out' })
    const rotY = gsap.quickTo(plane, 'rotateY', { duration: 0.8, ease: 'power3.out' })
    const float = gsap.to(plane, { y: -10, duration: 3.2, ease: 'sine.inOut', repeat: -1, yoyo: true })
    ringTween.current = gsap.fromTo(ring, { '--spin': '0deg' }, { '--spin': '360deg', duration: 60, ease: 'none', repeat: -1 })

    const onMove = (e: PointerEvent) => {
      const box = stage.getBoundingClientRect()
      const dx = e.clientX - (box.left + box.width / 2)
      const dy = e.clientY - (box.top + box.height / 2)
      // Lean toward the pointer only when it's near the stage.
      const near = Math.abs(dx) < box.width && Math.abs(dy) < box.height
      rawX.set(near ? dx : 0)
      rawY.set(near ? dy : 0)
      const nx = Math.max(-1, Math.min(1, dx / (box.width / 2)))
      const ny = Math.max(-1, Math.min(1, dy / (box.height / 2)))
      rotY(nx * 12)
      rotX(18 - ny * 10)
    }
    const onLeave = () => {
      rawX.set(0)
      rawY.set(0)
      rotX(18)
      rotY(0)
    }

    const visibility = ScrollTrigger.create({
      trigger: stage,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        float.paused(!self.isActive)
        ringTween.current?.paused(!self.isActive)
      },
    })

    window.addEventListener('pointermove', onMove, { passive: true })
    stage.addEventListener('pointerleave', onLeave)
    return () => {
      trigger.kill()
      visibility.kill()
      float.kill()
      ringTween.current?.kill()
      window.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
    }
  }, [rawX, rawY])

  // Stop idle rotation while a button is hovered so it's easy to hit.
  useEffect(() => {
    const tween = ringTween.current
    if (tween) gsap.to(tween, { timeScale: hovered ? 0 : 1, duration: 0.5, overwrite: true })
  }, [hovered])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email)
    } catch {
      /* clipboard blocked; the Email button still works */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={stageRef}
        className="relative mx-auto flex aspect-square w-full max-w-[460px] items-center justify-center"
        style={{ perspective: 1200, contain: 'layout' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[12%] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(248,113,113,0.22), transparent)', filter: 'blur(10px)' }}
        />
        <div ref={planeRef} className="relative h-full w-full" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
          {/* orbit guides */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: spread * 2,
              height: spread * 2,
              marginLeft: -spread,
              marginTop: -spread,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              opacity: open ? 1 : 0,
              transition: 'opacity .6s',
            }}
          />
          <div ref={ringRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: 'rotate(var(--spin, 0deg))', willChange: 'transform' }}>
            <AnimatePresence>
              {open &&
                ITEMS.map((item, i) => (
                  <OrbitButton
                    key={item.key}
                    item={item}
                    index={i}
                    total={ITEMS.length}
                    spread={spread}
                    mouseX={mouseX}
                    mouseY={mouseY}
                    copied={copied && item.action === 'copy'}
                    dimmed={hovered !== null && hovered !== item.key}
                    onHover={setHovered}
                    onCopy={copyEmail}
                  />
                ))}
            </AnimatePresence>
          </div>

          {/* FAB */}
          <div className="absolute left-1/2 top-1/2 -ml-11 -mt-11" style={{ transform: 'translateZ(40px)' }}>
            {!open && (
              <>
                {[0, 1].map((ring) => (
                  <motion.span
                    key={ring}
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: '0 0 0 1px rgba(248,113,113,0.6)' }}
                    animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: ring * 1.1 }}
                  />
                ))}
              </>
            )}
            <motion.button
              type="button"
              aria-expanded={open}
              aria-label={open ? 'Close contact options' : 'Open contact options'}
              onClick={() => setOpen((o) => !o)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-[#f87171]"
              style={{
                background: 'radial-gradient(circle at 32% 26%, #bfdbfe 0%, #f87171 28%, #1e3a8a 100%)',
                boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.5), inset 0 -10px 20px rgba(0,0,0,0.35), 0 20px 40px -12px rgba(0,0,0,0.8), 0 0 36px rgba(248,113,113,0.45)',
              }}
            >
              <motion.svg
                viewBox="0 0 24 24"
                width="34"
                height="34"
                {...stroke}
                strokeWidth={2.2}
                animate={{ rotate: open ? 135 : 0 }}
                transition={SPRING}
                aria-hidden
              >
                <path d="M5 12h14M12 5v14" />
              </motion.svg>
            </motion.button>
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}

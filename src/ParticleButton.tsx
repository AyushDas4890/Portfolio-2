import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { prefersReducedMotion } from './lib/motion'

/**
 * Particle-disintegration button, adapted from the "Particle Effects for
 * Buttons" technique by Luis Manuel / Codrops.
 * https://tympanus.net/codrops/2018/04/25/particle-effects-for-buttons/
 *
 * On trigger the label sweeps away behind a clip edge while canvas particles
 * spray off that edge, then it reassembles. Everything is drawn on a local
 * canvas sized to the button plus a padding halo, so it never paints over the
 * fixed avatar video behind the page.
 */

type Shape = 'circle' | 'rectangle' | 'triangle'
type DrawStyle = 'fill' | 'stroke'
type Direction = 'left' | 'right' | 'top' | 'bottom'
type Easing =
  | 'easeInOutCubic'
  | 'easeOutQuart'
  | 'easeOutQuad'
  | 'easeInExpo'
  | 'easeInCubic'
  | 'easeOutSine'
  | 'codropsBezier'

interface ParticleSettings {
  shape: Shape
  drawStyle: DrawStyle
  duration: number
  easing: Easing
  size: number
  speed: number
  randomSpeed: boolean
  amount: number
  oscillation: number
  direction: Direction
  colors: string[]
}

interface Particle {
  startX: number
  startY: number
  angle: number
  born: number
  life: number
  speed: number
  size: number
  color: string
}

interface Geometry {
  width: number
  height: number
  padding: number
  buttonWidth: number
  buttonHeight: number
}

const BASE = {
  shape: 'circle' as Shape,
  drawStyle: 'fill' as DrawStyle,
  duration: 1000,
  easing: 'easeInOutCubic' as Easing,
  size: 3,
  speed: 4,
  randomSpeed: true,
  amount: 3,
  oscillation: 20,
}

type PresetName = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12'

const PRESETS: Record<PresetName, Omit<ParticleSettings, 'direction' | 'colors'>> = {
  '01': { ...BASE },
  '02': { ...BASE, shape: 'triangle', easing: 'easeOutQuart', size: 6, amount: 4, oscillation: 2 },
  '03': { ...BASE, shape: 'rectangle', duration: 500, easing: 'easeOutQuad', size: 8 },
  '04': { ...BASE, size: 4, speed: 1, randomSpeed: false, amount: 1.5, oscillation: 1 },
  '05': { ...BASE, duration: 1300, easing: 'easeInExpo', speed: 1, randomSpeed: false, amount: 10, oscillation: 1 },
  '06': { ...BASE, easing: 'easeInExpo' },
  '07': { ...BASE, shape: 'rectangle', drawStyle: 'stroke', duration: 600, easing: 'codropsBezier', size: 15, amount: 2, oscillation: 5 },
  '08': { ...BASE, shape: 'triangle', drawStyle: 'stroke', duration: 1400, size: 5, speed: 1.5, randomSpeed: false, oscillation: 15 },
  '09': { ...BASE, duration: 500, easing: 'easeOutQuad', speed: 0.1, randomSpeed: false, amount: 10, oscillation: 80 },
  '10': { ...BASE, duration: 1200, easing: 'easeInCubic', size: 4, speed: 0.4, randomSpeed: false, amount: 8, oscillation: 1 },
  '11': { ...BASE, drawStyle: 'stroke', duration: 1200, easing: 'easeOutSine', speed: 0.7, randomSpeed: false, oscillation: 5 },
  '12': { ...BASE, shape: 'triangle', duration: 800, easing: 'easeOutSine', speed: 3, randomSpeed: false, amount: 7, oscillation: 1 },
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

function bezierCoordinate(t: number, p1: number, p2: number) {
  const inverse = 1 - t
  return 3 * inverse * inverse * t * p1 + 3 * inverse * t * t * p2 + t * t * t
}

function cubicBezierAt(progress: number, x1: number, y1: number, x2: number, y2: number) {
  let low = 0
  let high = 1
  let parameter = progress
  for (let i = 0; i < 12; i++) {
    if (bezierCoordinate(parameter, x1, x2) < progress) low = parameter
    else high = parameter
    parameter = (low + high) / 2
  }
  return bezierCoordinate(parameter, y1, y2)
}

function ease(name: Easing, progress: number) {
  const t = clamp01(progress)
  switch (name) {
    case 'easeOutQuart':
      return 1 - Math.pow(1 - t, 4)
    case 'easeOutQuad':
      return 1 - (1 - t) * (1 - t)
    case 'easeInExpo':
      return t === 0 ? 0 : Math.pow(2, 10 * t - 10)
    case 'easeInCubic':
      return t * t * t
    case 'easeOutSine':
      return Math.sin((t * Math.PI) / 2)
    case 'codropsBezier':
      return cubicBezierAt(t, 0.2, 1, 0.7, 1)
    default:
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
}

function drawParticle(
  context: CanvasRenderingContext2D,
  particle: Particle,
  settings: ParticleSettings,
  now: number,
) {
  const age = now - particle.born
  const lifeProgress = clamp01(age / particle.life)
  const frameDistance = age / (1000 / 60)
  const travel = particle.speed * frameDistance
  const wave = settings.oscillation * Math.sin(frameDistance * ((Math.PI * 2) / 100))
  const cosine = Math.cos(particle.angle)
  const sine = Math.sin(particle.angle)
  const size = particle.size

  context.save()
  context.globalAlpha = 1 - lifeProgress
  context.translate(particle.startX + cosine * travel - sine * wave, particle.startY + sine * travel + cosine * wave)
  context.rotate(particle.angle)
  context.fillStyle = particle.color
  context.strokeStyle = particle.color
  context.lineWidth = Math.max(1, size * 0.18)
  context.beginPath()
  if (settings.shape === 'circle') {
    context.arc(0, 0, size, 0, Math.PI * 2)
  } else if (settings.shape === 'triangle') {
    context.moveTo(-size, size)
    context.lineTo(size, size)
    context.lineTo(size, -size)
    context.closePath()
  } else {
    context.rect(-size / 2, -size / 2, size, size)
  }
  if (settings.drawStyle === 'stroke') context.stroke()
  else context.fill()
  context.restore()
}

export interface ParticleButtonProps {
  label: string
  href?: string
  newTab?: boolean
  onClick?: () => void
  preset?: PresetName
  direction?: Direction
  trigger?: 'click' | 'hover'
  variant?: 'solid' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  particleColor?: string
  background?: string
  textColor?: string
  border?: string
  radius?: number
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}

const SIZES = {
  sm: { padding: '8px 16px', fontSize: 13 },
  md: { padding: '10px 20px', fontSize: 15 },
  lg: { padding: '14px 28px', fontSize: 17 },
}

export function ParticleButton({
  label,
  href,
  newTab = false,
  onClick,
  preset = '01',
  direction = 'left',
  trigger = 'click',
  variant = 'solid',
  size = 'md',
  particleColor,
  background,
  textColor,
  border,
  radius = 9999,
  ariaLabel,
  className = '',
  style,
}: ParticleButtonProps) {
  const glass = variant === 'glass'
  background ??= glass ? 'rgba(10,10,15,0.55)' : '#ffffff'
  textColor ??= glass ? '#ffffff' : '#000000'
  border ??= glass ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.2)'
  particleColor ??= glass ? '#fdba74' : '#f87171'
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const clipRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const geometryRef = useRef<Geometry | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number | null>(null)
  const restoreRef = useRef<number | null>(null)
  const tokenRef = useRef(0)
  const runningRef = useRef(false)
  const pendingRef = useRef<(() => void) | null>(null)
  const [focused, setFocused] = useState(false)

  const settings = useMemo<ParticleSettings>(
    () => ({ ...PRESETS[preset], direction, colors: [particleColor as string] }),
    [preset, direction, particleColor],
  )

  const measure = useCallback(() => {
    const root = rootRef.current
    const clip = clipRef.current
    const canvas = canvasRef.current
    if (!root || !clip || !canvas) return null

    const rootBox = root.getBoundingClientRect()
    const buttonBox = clip.getBoundingClientRect()
    const padding = 120
    const width = Math.max(1, buttonBox.width + padding * 2)
    const height = Math.max(1, buttonBox.height + padding * 2)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.style.left = `${buttonBox.left - rootBox.left + buttonBox.width / 2}px`
    canvas.style.top = `${buttonBox.top - rootBox.top + buttonBox.height / 2}px`

    const pixelWidth = Math.round(width * dpr)
    const pixelHeight = Math.round(height * dpr)
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth
      canvas.height = pixelHeight
    }
    canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)

    const geometry: Geometry = {
      width,
      height,
      padding,
      buttonWidth: buttonBox.width,
      buttonHeight: buttonBox.height,
    }
    geometryRef.current = geometry
    return geometry
  }, [])

  useLayoutEffect(() => {
    measure()
    const root = rootRef.current
    if (!root) return
    const observer = new ResizeObserver(() => measure())
    observer.observe(root)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  useEffect(
    () => () => {
      // Unmounted before the disintegration finished (e.g. its card closed):
      // still honour the click instead of silently dropping it.
      const pending = pendingRef.current
      pendingRef.current = null
      pending?.()
      tokenRef.current += 1
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (restoreRef.current !== null) window.clearTimeout(restoreRef.current)
    },
    [],
  )

  const sweep = useCallback((progress: number) => {
    const clip = clipRef.current
    const text = labelRef.current
    if (!clip || !text) return
    const signed = progress * 101
    const positive = settings.direction === 'left' || settings.direction === 'top'
    const value = positive ? signed : -signed
    const axis = settings.direction === 'left' || settings.direction === 'right' ? 'X' : 'Y'
    clip.style.transform = `translate${axis}(${value}%)`
    text.style.transform = `translate${axis}(${-value}%)`
  }, [settings.direction])

  const spawn = useCallback(
    (progress: number, delta: number, now: number) => {
      const geometry = geometryRef.current
      if (!geometry || delta <= 0) return
      const horizontal = settings.direction === 'left' || settings.direction === 'right'
      let x = geometry.padding
      let y = geometry.padding
      if (horizontal) {
        x += settings.direction === 'left'
          ? geometry.buttonWidth * progress
          : geometry.buttonWidth * (1 - progress)
      } else {
        y += settings.direction === 'top'
          ? geometry.buttonHeight * progress
          : geometry.buttonHeight * (1 - progress)
      }

      const wanted = Math.max(1, Math.floor(settings.amount * (delta * 100 + 1)))
      const room = Math.max(0, 1200 - particlesRef.current.length)
      for (let i = 0; i < Math.min(wanted, room); i++) {
        particlesRef.current.push({
          startX: horizontal ? x : geometry.padding + Math.random() * geometry.buttonWidth,
          startY: horizontal ? geometry.padding + Math.random() * geometry.buttonHeight : y,
          angle: Math.random() * Math.PI * 2,
          born: now,
          life: settings.duration * randomBetween(0.65, 1.05),
          speed: settings.randomSpeed ? randomBetween(-settings.speed / 2, settings.speed / 2) : settings.speed,
          size: settings.randomSpeed ? randomBetween(1, Math.max(2, settings.size)) : settings.size,
          color: settings.colors[Math.floor(Math.random() * settings.colors.length)] ?? '#ffffff',
        })
      }
    },
    [settings],
  )

  const run = useCallback(
    (after?: () => void) => {
      if (runningRef.current) return false
      if (prefersReducedMotion()) {
        after?.()
        return true
      }
      const canvas = canvasRef.current
      const context = canvas?.getContext('2d')
      const clip = clipRef.current
      if (!canvas || !context || !clip) return false

      runningRef.current = true
      const token = ++tokenRef.current

      const phase = (out: boolean, config: ParticleSettings, done: () => void) => {
        const geometry = measure()
        if (!geometry || token !== tokenRef.current) return
        canvas.style.display = 'block'
        clip.style.opacity = '1'
        particlesRef.current = []

        const start = performance.now()
        let last = out ? 0 : 1
        let swept = false
        sweep(last)

        const frame = (now: number) => {
          if (token !== tokenRef.current) return
          const box = geometryRef.current ?? geometry
          const timeline = clamp01((now - start) / config.duration)
          const progress = out ? ease(config.easing, timeline) : 1 - ease(config.easing, timeline)

          if (!swept) {
            sweep(progress)
            spawn(progress, Math.abs(progress - last), now)
            last = progress
            if (timeline >= 1) {
              swept = true
              sweep(out ? 1 : 0)
              if (out) clip.style.opacity = '0'
            }
          }

          context.clearRect(0, 0, box.width, box.height)
          particlesRef.current = particlesRef.current.filter((p) => now - p.born < p.life)
          for (const particle of particlesRef.current) drawParticle(context, particle, config, now)

          if (!swept || particlesRef.current.length > 0) {
            rafRef.current = requestAnimationFrame(frame)
          } else {
            rafRef.current = null
            canvas.style.display = 'none'
            done()
          }
        }
        rafRef.current = requestAnimationFrame(frame)
      }

      pendingRef.current = after ?? null
      phase(true, settings, () => {
        pendingRef.current = null
        after?.()
        if (token !== tokenRef.current) {
          runningRef.current = false
          return
        }
        restoreRef.current = window.setTimeout(() => {
          restoreRef.current = null
          phase(false, { ...settings, duration: Math.min(800, settings.duration), easing: 'easeOutSine' }, () => {
            runningRef.current = false
            clip.style.opacity = '1'
            sweep(0)
          })
        }, 320)
      })
      return true
    },
    [measure, settings, spawn, sweep],
  )

  const navigate = useCallback(() => {
    onClick?.()
    if (!href) return
    if (newTab) window.open(href, '_blank', 'noopener,noreferrer')
    else if (href.startsWith('#')) window.location.hash = href
    else window.location.assign(href)
  }, [href, newTab, onClick])

  const handleClick = (event: ReactMouseEvent) => {
    if (trigger !== 'click') return
    event.preventDefault()
    // Fire navigation once the disintegration finishes so the effect is seen;
    // if the animation can't start, go immediately rather than swallowing the click.
    if (!run(navigate)) navigate()
  }

  const shared: CSSProperties = {
    fontFamily: 'var(--font-body)',
    borderRadius: radius,
    background,
    color: textColor,
    border,
    padding: SIZES[size].padding,
    fontSize: SIZES[size].fontSize,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(glass
      ? { backdropFilter: 'blur(14px) saturate(160%)', WebkitBackdropFilter: 'blur(14px) saturate(160%)' }
      : null),
  }

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex ${className}`}
      style={{ ...style, isolation: 'isolate' }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute hidden"
        style={{ transform: 'translate3d(-50%, -50%, 0)', zIndex: 1 }}
      />
      <button
        type="button"
        aria-label={ariaLabel ?? label}
        onClick={handleClick}
        onPointerEnter={() => {
          if (trigger === 'hover') run()
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="relative z-[2] min-h-[44px] touch-manipulation"
        style={{
          ...shared,
          background: 'transparent',
          color: 'transparent',
          border: 0,
          padding: 0,
          outline: 'none',
        }}
      >
        <span
          ref={clipRef}
          className="block overflow-hidden"
          style={{
            borderRadius: radius,
            willChange: 'transform, opacity',
            boxShadow: focused ? `0 0 0 3px rgba(248,113,113,0.55)` : 'none',
            transition: 'box-shadow 0.2s ease',
          }}
        >
          <span ref={labelRef} className="inline-flex items-center justify-center" style={shared}>
            {label}
          </span>
        </span>
      </button>
    </div>
  )
}

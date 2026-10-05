import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { gsap, prefersReducedMotion } from './lib/motion'

export interface GooeyOption {
  label: string
  value: string
  href?: string
  hint?: string
}

interface GooeyDropdownProps {
  label: string
  options: GooeyOption[]
  value?: string
  onChange?: (value: string) => void
  // 'select' keeps a current value (filters); 'menu' is a list of links.
  mode?: 'select' | 'menu'
  icon?: ReactNode
  align?: 'left' | 'right'
  panelWidth?: number
  className?: string
}

const FILL = '#121218'
const TRIGGER_H = 48
const GAP = 10

const isSafari = () =>
  typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Gooey dropdown (rebuild of the Framer "Gooey Dropdown"). Solid blobs — the
 * trigger, a drip and the panel — sit in a layer run through an SVG goo filter
 * (blur + alpha threshold), so while they move they fuse like liquid. Text and
 * controls live in a separate unfiltered layer on top, so they stay crisp.
 */
export function GooeyDropdown({
  label,
  options,
  value,
  onChange,
  mode = 'select',
  icon,
  align = 'left',
  panelWidth = 240,
  className = '',
}: GooeyDropdownProps) {
  const uid = useId().replace(/:/g, '')
  const filterId = `goo-${uid}`
  const listId = `list-${uid}`

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const triggerBgRef = useRef<HTMLDivElement>(null)
  const dripRef = useRef<HTMLDivElement>(null)
  const panelBgRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const tlRef = useRef<ReturnType<typeof gsap.timeline> | null>(null)

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [gooey] = useState(() => !isSafari())

  const selected = options.find((o) => o.value === value)
  const triggerText = mode === 'select' && selected ? selected.label : label

  // Keep the trigger blob the same size as the visible trigger text.
  useLayoutEffect(() => {
    const trigger = triggerRef.current
    const bg = triggerBgRef.current
    if (!trigger || !bg) return
    gsap.set(bg, { width: trigger.offsetWidth })
  }, [triggerText])

  useLayoutEffect(() => {
    const panel = panelRef.current
    const panelBg = panelBgRef.current
    const drip = dripRef.current
    const trigger = triggerRef.current
    if (!panel || !panelBg || !drip || !trigger) return

    const height = panel.scrollHeight
    const items = itemRefs.current.filter(Boolean)
    const tw = trigger.offsetWidth
    const origin = align === 'right' ? 'right top' : 'left top'
    // The SVG filter region is the layer's own box, so it must enclose the
    // panel blob or the panel gets clipped.
    gsap.set(layerRef.current, { height: TRIGGER_H + GAP + height + 24, width: Math.max(panelWidth, tw) + 24 })

    gsap.set(panelBg, { height, width: panelWidth, scaleX: Math.min(1, tw / panelWidth), scaleY: 0, transformOrigin: origin })
    gsap.set(drip, { scale: 0, y: 0 })
    gsap.set(panel, { autoAlpha: 0 })
    gsap.set(items, { autoAlpha: 0, y: 8 })

    if (prefersReducedMotion()) {
      tlRef.current = gsap
        .timeline({ paused: true })
        .set(panelBg, { scaleX: 1, scaleY: 1 })
        .set(panel, { autoAlpha: 1 })
        .set(items, { autoAlpha: 1, y: 0 })
      return
    }

    const tl = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } })
    tl.to(drip, { scale: 1, y: GAP + 6, duration: 0.22, ease: 'power2.out' }, 0)
      .to(panelBg, { scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.75)' }, 0.1)
      .to(panelBg, { scaleX: 1, duration: 0.45, ease: 'power3.out' }, 0.14)
      .to(drip, { scale: 0.2, duration: 0.3, ease: 'power2.in' }, 0.3)
      .to(panel, { autoAlpha: 1, duration: 0.01 }, 0.26)
      .to(items, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.035, ease: 'power2.out' }, 0.28)
    tlRef.current = tl
    return () => {
      tl.kill()
    }
  }, [options, panelWidth, align])

  useEffect(() => {
    const tl = tlRef.current
    if (!tl) return
    if (open) tl.timeScale(1).play()
    else tl.timeScale(1.8).reverse()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [open])

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus({ preventScroll: true })
  }, [open, active])

  const choose = (option: GooeyOption) => {
    if (mode === 'select') onChange?.(option.value)
    setOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
  }

  const onTriggerKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const current = options.findIndex((o) => o.value === value)
      setActive(current >= 0 ? current : 0)
      setOpen(true)
    }
  }

  const onListKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus({ preventScroll: true })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + options.length) % options.length)
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  const side = align === 'right' ? { right: 0 } : { left: 0 }

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`} style={{ zIndex: open ? 30 : 5 }}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Filtered liquid layer */}
      <div
        ref={layerRef}
        aria-hidden
        className="pointer-events-none absolute top-0"
        style={{ ...side, width: panelWidth, height: TRIGGER_H, filter: gooey ? `url(#${filterId})` : undefined }}
      >
        <div
          ref={triggerBgRef}
          className="absolute top-0"
          style={{ ...side, height: TRIGGER_H, borderRadius: TRIGGER_H / 2, background: FILL }}
        />
        <div
          ref={dripRef}
          className="absolute"
          style={{
            ...(align === 'right' ? { right: 16 } : { left: 16 }),
            top: TRIGGER_H - 22,
            width: 22,
            height: 22,
            borderRadius: 11,
            background: FILL,
          }}
        />
        <div
          ref={panelBgRef}
          className="absolute"
          style={{ ...side, top: TRIGGER_H + GAP, borderRadius: 22, background: FILL }}
        />
      </div>

      {/* Crisp content layer */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup={mode === 'select' ? 'listbox' : 'menu'}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={mode === 'select' && selected ? `${label}: ${selected.label}` : label}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKey}
        className="relative flex items-center gap-2 whitespace-nowrap px-4 text-[14px] text-white transition-transform duration-200 active:scale-[0.96]"
        style={{ height: TRIGGER_H, borderRadius: TRIGGER_H / 2, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}
      >
        {icon && <span className="flex h-5 w-5 items-center justify-center text-[#fdba74]">{icon}</span>}
        <span>{triggerText}</span>
        <span className="text-white/55 transition-transform duration-300" style={{ transform: open ? 'rotate(180deg)' : undefined }}>
          <ChevronIcon />
        </span>
      </button>

      <div
        ref={panelRef}
        id={listId}
        role={mode === 'select' ? 'listbox' : 'menu'}
        aria-label={label}
        onKeyDown={onListKey}
        className="absolute p-2"
        style={{
          ...side,
          top: TRIGGER_H + GAP,
          width: panelWidth,
          borderRadius: 22,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 24px 60px -24px rgba(0,0,0,0.9)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {options.map((option, i) => {
          const isSelected = mode === 'select' && option.value === value
          const common = {
            ref: (el: HTMLElement | null) => {
              itemRefs.current[i] = el
            },
            tabIndex: open && i === active ? 0 : -1,
            onMouseEnter: () => setActive(i),
            className: `flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-left text-[14px] outline-none transition-colors ${
              i === active ? 'bg-white/[0.07] text-white' : 'text-white/75'
            }`,
          }
          const inner = (
            <>
              <span className="flex items-center gap-2.5">
                <span
                  className="h-1.5 w-1.5 rounded-full transition-colors"
                  style={{ background: isSelected ? '#f59e0b' : 'rgba(255,255,255,0.18)' }}
                />
                {option.label}
              </span>
              {option.hint && <span className="font-mono text-[11px] text-white/40">{option.hint}</span>}
            </>
          )
          return option.href ? (
            <a
              key={option.value}
              {...common}
              role="menuitem"
              href={option.href}
              {...(option.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
              onClick={() => setOpen(false)}
            >
              {inner}
            </a>
          ) : (
            <button
              key={option.value}
              {...common}
              type="button"
              role={mode === 'select' ? 'option' : 'menuitem'}
              aria-selected={mode === 'select' ? isSelected : undefined}
              onClick={() => choose(option)}
            >
              {inner}
            </button>
          )
        })}
      </div>
    </div>
  )
}

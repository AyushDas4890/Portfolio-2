import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Lollipop Carousel — port of the Framer component of the same name.
 *
 * An ambient strip of capsule-shaped media drifts sideways on its own.
 * Hovering a capsule lifts it out of the strip into a fixed focus layer: the
 * card grows (FLIP, transform-only, on critically-damped CSS springs), its
 * neighbours part and dim, and a caption opens underneath. Touch devices and
 * narrow windows get a modal presentation instead: tap to open over a sheet,
 * swipe or tap dots to step, tap outside or ✕ to close.
 *
 * Differences from the original: images only (no video / GIF looping), dark
 * theme tokens baked in, and the caption can carry an action node.
 */

export interface LollipopItem {
  key: string
  image: string
  title: string
  description?: string
  tags?: string[]
  link?: string
  action?: ReactNode
}

interface Props {
  items: LollipopItem[]
  itemHeight?: number
  hoverScale?: number
  gap?: number
  speed?: number
  expandedRadius?: number
  dim?: number
  captionGap?: number
  captionSpace?: number
  className?: string
  style?: CSSProperties
}

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

interface Rendered extends LollipopItem {
  flat: number
}

interface Card extends Rendered {
  rest: Rect
  open: Rect
  state: 'open' | 'closing'
  seq: number
}

const COPIES = 3
const EDGE_MARGIN = 24
const MODAL_MAX_WIDTH = 700
const MODAL_MARGIN = 16
const MODAL_TOP = 72
const MODAL_BOTTOM = 196
const MODAL_DOTS_ROOM = 56
const SHADOW_ROOM = 24
const DRAG_SLOP = 4
const TOUCH_SLOP = 10
const MIN_FLING_SPEED = 120
const MAX_FLING_SPEED = 4000
const FLING_FLOOR = 60
const OPEN_MS = 750
const CLOSE_MS = 600
const WHEEL_STEP = 50
const WHEEL_COOLDOWN_MS = 260
const WHEEL_IDLE_MS = 200
const TOUCH_IDLE_MS = 220
const SWIPE_STEP = 48
const EXIT_GRACE_MS = 120
const CAPTION_MIN_WIDTH = 320
const CAPTION_MAX_WIDTH = 480
const SKELETON_RATIOS = [1.6, 0.62, 1.33, 1, 0.8, 1.78, 1, 1.33]

// Critically damped springs baked into CSS linear() (from the original).
const OPEN_SPRING =
  'linear(0, 0.0074, 0.0272, 0.0563, 0.0922, 0.133, 0.1769, 0.2227, 0.2692, 0.3156, 0.3614, 0.4059, 0.4489, 0.4901, 0.5292, 0.5663, 0.6012, 0.634, 0.6646, 0.6931, 0.7195, 0.744, 0.7667, 0.7876, 0.8068, 0.8244, 0.8406, 0.8554, 0.869, 0.8814, 0.8926, 0.9029, 0.9123, 0.9208, 0.9285, 0.9355, 0.9418, 0.9476, 0.9528, 0.9575, 0.9618, 0.9656, 0.9691, 0.9722, 0.975, 0.9776, 0.9799, 0.9819, 0.9838, 0.9855, 0.987, 0.9883, 0.9895, 0.9906, 0.9916, 0.9925, 0.9933, 0.994, 0.9946, 1, 1, 1, 1)'
const CLOSE_SPRING =
  'linear(0, 0.0105, 0.0381, 0.0777, 0.1254, 0.1781, 0.2333, 0.2894, 0.345, 0.3991, 0.451, 0.5003, 0.5466, 0.5898, 0.6298, 0.6668, 0.7007, 0.7317, 0.7599, 0.7855, 0.8086, 0.8295, 0.8484, 0.8653, 0.8804, 0.894, 0.9061, 0.9169, 0.9266, 0.9351, 0.9428, 0.9495, 0.9555, 0.9608, 0.9655, 0.9697, 0.9733, 0.9766, 0.9794, 0.9819, 0.9842, 0.9861, 0.9878, 0.9893, 0.9907, 0.9918, 0.9928, 0.9937, 0.9945, 1)'
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

// Dark theme, tuned to sit on the avatar video: no strokes on capsules, a deep
// soft pool of shadow, and glass rather than a solid sheet.
const TINT = '#0c0c12'
const SHEET = 'rgba(7,7,15,0.9)'
const SHADOW = '0 14px 30px -12px rgba(0,0,0,0.75)'
const CARD_SHADOW = '0 40px 80px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)'

const clock = {
  '--lollipop-open-dur': `${OPEN_MS}ms`,
  '--lollipop-close-dur': `${CLOSE_MS}ms`,
  '--lollipop-radius-dur': '240ms',
  '--lollipop-open-ease': OPEN_SPRING,
  '--lollipop-close-ease': CLOSE_SPRING,
  '--lollipop-ease-fb': EASE,
} as CSSProperties

function invert(rest: Rect, open: Rect) {
  const scale = open.width > 0 ? rest.width / open.width : 1
  return `translate(${rest.left - open.left}px, ${rest.top - open.top}px) scale(${scale})`
}

function writeRect(el: HTMLElement, rect: Rect) {
  el.style.left = `${rect.left}px`
  el.style.top = `${rect.top}px`
  el.style.width = `${rect.width}px`
  el.style.height = `${rect.height}px`
}

const captionInsetFor = (radius: number) => Math.max(0, Math.min(Math.round((radius * 5) / 6), 64))

function positionCaption(el: HTMLElement | undefined, card: Rect, gap: number, inset: number, modal: boolean) {
  if (!el) return
  const vw = window.innerWidth
  const vh = window.innerHeight
  const margin = modal ? MODAL_MARGIN : EDGE_MARGIN
  const floor = vh - (modal ? MODAL_DOTS_ROOM : EDGE_MARGIN)
  const room = Math.max(0, vw - margin * 2)
  const target = modal
    ? card.width - inset * 2
    : Math.min(Math.max(card.width - inset * 2, CAPTION_MIN_WIDTH), CAPTION_MAX_WIDTH)
  const width = Math.max(0, Math.min(target, room))
  el.style.width = `${width}px`
  const height = el.offsetHeight
  let left = Math.min(Math.max(card.left + inset, margin), Math.max(margin, vw - margin - width))
  let top = card.top + card.height + gap
  if (top + height > floor) {
    // No room below. Beside the card beats above it: above, the caption lands
    // on whatever heading sits over the strip.
    const sideGap = gap * 1.5
    const rightRoom = vw - margin - (card.left + card.width + sideGap)
    const leftRoom = card.left - sideGap - margin
    if (!modal && (rightRoom >= width || leftRoom >= width)) {
      left = rightRoom >= width ? card.left + card.width + sideGap : card.left - sideGap - width
      top = Math.min(Math.max(card.top + card.height - height, margin), floor - height)
    } else {
      const above = card.top - gap - height
      top = above >= margin ? above : floor - height
    }
  }
  el.style.left = `${left}px`
  el.style.top = `${top}px`
}

const normaliseWheel = (delta: number, mode: number) => (mode === 1 ? delta * 16 : mode === 2 ? delta * 400 : delta)

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function within(event: Event, selector: string, layer: HTMLElement | null) {
  if (!layer || !(event.target instanceof Element)) return false
  const hit = event.target.closest(selector)
  return Boolean(hit && layer.contains(hit))
}

function useTouchLayout() {
  const [touch, setTouch] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(hover: none)')
    const sync = () => setTouch(query.matches || window.innerWidth <= MODAL_MAX_WIDTH)
    sync()
    window.addEventListener('resize', sync)
    query.addEventListener('change', sync)
    return () => {
      window.removeEventListener('resize', sync)
      query.removeEventListener('change', sync)
    }
  }, [])
  return touch
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  return reduced
}

export function LollipopCarousel({
  items,
  itemHeight: itemHeightProp = 150,
  hoverScale = 2.6,
  gap = 14,
  speed = 40,
  expandedRadius = 36,
  dim = 65,
  captionGap = 20,
  captionSpace = 170,
  className,
  style,
}: Props) {
  const modal = useTouchLayout()
  const reducedMotion = useReducedMotion()
  const dimOpacity = Math.max(0, Math.min(1, 1 - dim / 100))
  const captionInset = captionInsetFor(expandedRadius)

  /* ------------------------------------------------------------ geometry */
  const rootRef = useRef<HTMLDivElement>(null)
  const [rootHeight, setRootHeight] = useState(0)
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () => setRootHeight(el.clientHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const requestedReserve = modal ? 0 : captionSpace
  const growth = modal ? 1 : hoverScale
  const itemHeight = modal ? Math.min(itemHeightProp, 120) : itemHeightProp
  const band = itemHeight * growth + (modal ? SHADOW_ROOM * 2 : 0)
  const mediaCenterY = band / 2
  const reserve = rootHeight > 0 ? Math.max(0, Math.min(requestedReserve, rootHeight - band)) : requestedReserve
  const blockHeight = band + reserve

  /* ------------------------------------------------------- aspect ratios */
  const [aspects, setAspects] = useState<Record<string, number>>({})
  const [measured, setMeasured] = useState(false)
  useEffect(() => {
    let cancelled = false
    let pending = items.length
    if (pending === 0) {
      setMeasured(true)
      return
    }
    const record = (key: string, ratio: number) => {
      if (cancelled) return
      if (Number.isFinite(ratio) && ratio > 0) {
        setAspects((prev) => (prev[key] === ratio ? prev : { ...prev, [key]: ratio }))
      }
      pending -= 1
      if (pending === 0) setMeasured(true)
    }
    const timeout = window.setTimeout(() => !cancelled && setMeasured(true), 6000)
    for (const item of items) {
      const image = new Image()
      image.onload = () => record(item.key, image.naturalHeight ? image.naturalWidth / image.naturalHeight : 0)
      image.onerror = () => record(item.key, 0)
      image.src = item.image
    }
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [items])

  const widthOf = useCallback((key: string) => Math.round(itemHeight * (aspects[key] ?? 1)), [aspects, itemHeight])

  /* ------------------------------------------------------ infinite track */
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState(0)
  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const measure = () => setViewport(el.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measured])

  const unitWidth = useMemo(() => items.reduce((sum, item) => sum + widthOf(item.key) + gap, 0), [items, widthOf, gap])
  const repeats = useMemo(() => {
    if (!unitWidth || !viewport) return 1
    return Math.max(1, Math.min(12, Math.ceil((viewport * 1.25) / unitWidth)))
  }, [unitWidth, viewport])
  const copyWidth = unitWidth * repeats

  const rendered = useMemo(() => {
    const out: Rendered[] = []
    for (let copy = 0; copy < COPIES; copy++) {
      for (let rep = 0; rep < repeats; rep++) {
        for (const item of items) out.push({ ...item, flat: out.length })
      }
    }
    return out
  }, [items, repeats])

  const middleStart = repeats * items.length
  const middleEnd = middleStart + repeats * items.length

  /* ------------------------------------------------------- scroll engine */
  const posRef = useRef(0)
  const appliedRef = useRef(0)
  const copyWidthRef = useRef(0)
  const seededRef = useRef(false)
  const glideRef = useRef<number | null>(null)
  const flingRef = useRef<number | null>(null)
  const cardsAliveRef = useRef(false)
  const draggingRef = useRef(false)
  const touchingRef = useRef(false)
  const touchIdleRef = useRef<number | null>(null)
  const runningRef = useRef(false)
  const wrapRef = useRef<() => number>(() => 0)

  const effectiveScroll = useCallback(() => glideRef.current ?? scrollerRef.current?.scrollLeft ?? 0, [])

  const settleTouch = useCallback(() => {
    if (touchIdleRef.current !== null) window.clearTimeout(touchIdleRef.current)
    touchIdleRef.current = window.setTimeout(() => {
      touchIdleRef.current = null
      touchingRef.current = false
      const el = scrollerRef.current
      if (el) {
        posRef.current = el.scrollLeft
        appliedRef.current = el.scrollLeft
        wrapRef.current()
      }
    }, TOUCH_IDLE_MS)
  }, [])

  // Folds the offset back into the middle copy; returns how far it moved.
  const wrap = useCallback(() => {
    const el = scrollerRef.current
    const width = copyWidthRef.current
    if (!el || width <= 0 || touchingRef.current) return 0
    if (cardsAliveRef.current && !draggingRef.current && width > el.clientWidth) return 0
    const pos = posRef.current
    let delta = 0
    if (pos >= 2 * width) delta = -width
    else if (pos < width) delta = width
    else return 0
    posRef.current = pos + delta
    appliedRef.current = posRef.current
    el.scrollLeft = posRef.current
    if (glideRef.current !== null) glideRef.current += delta
    return delta
  }, [])
  wrapRef.current = wrap

  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el || copyWidth <= 0) return
    const previous = copyWidthRef.current
    copyWidthRef.current = copyWidth
    if (!seededRef.current) {
      seededRef.current = true
      posRef.current = copyWidth
    } else if (previous > 0) {
      posRef.current = copyWidth + ((posRef.current - previous) / previous) * copyWidth
    }
    appliedRef.current = posRef.current
    el.scrollLeft = posRef.current
  }, [copyWidth])

  const onScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    if (Math.abs(el.scrollLeft - appliedRef.current) > 1.5) {
      posRef.current = el.scrollLeft
      appliedRef.current = el.scrollLeft
      glideRef.current = null
    }
    if (touchingRef.current) {
      settleTouch()
      return
    }
    wrap()
  }, [wrap, settleTouch])

  /* ------------------------------------------------------------ hovering */
  const [active, setActive] = useState<number | null>(null)
  const activeRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  const setActiveIndex = useCallback((next: number | null) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    if (activeRef.current === next) return
    if (next === null && activeRef.current !== null) {
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null
        activeRef.current = null
        setActive(null)
      }, EXIT_GRACE_MS)
      return
    }
    activeRef.current = next
    setActive(next)
  }, [])

  const closeNow = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    if (activeRef.current === null) return
    activeRef.current = null
    setActive(null)
  }, [])

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  const indexAtPoint = useCallback((x: number, y: number) => {
    const hit = document.elementFromPoint(x, y)
    const capsule = hit?.closest('[data-lollipop-index]')
    if (!capsule || !scrollerRef.current?.contains(capsule)) return null
    const index = Number(capsule.getAttribute('data-lollipop-index'))
    return Number.isInteger(index) ? index : null
  }, [])

  const lastPointRef = useRef({ x: -1, y: -1 })
  const onStripPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== 'mouse' || draggingRef.current || modal) return
      // While a card is open the document-level handler owns hover (it knows
      // about the card + caption zone); acting here too switched cards when the
      // pointer crossed the gap on its way to the caption.
      if (cardsRef.current.some((c) => c.state === 'open')) return
      const last = lastPointRef.current
      if (last.x === event.clientX && last.y === event.clientY) return
      lastPointRef.current = { x: event.clientX, y: event.clientY }
      const hit = (event.target as Element).closest('[data-lollipop-index]')
      const index = hit ? Number(hit.getAttribute('data-lollipop-index')) : NaN
      setActiveIndex(Number.isInteger(index) ? index : null)
    },
    [setActiveIndex, modal],
  )

  const onStripPointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== 'mouse' || activeRef.current !== null) return
      setActiveIndex(null)
    },
    [setActiveIndex],
  )

  /* --------------------------------------------------------- focus cards */
  const [cards, setCards] = useState<Card[]>([])
  const seqRef = useRef(0)
  const focusIntentRef = useRef(false)
  const returnFocusRef = useRef<number | null>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const cardElements = useRef(new Map<number, HTMLElement>())
  const captionElements = useRef(new Map<number, HTMLElement>())
  const cardsRef = useRef(cards)
  cardsRef.current = cards
  cardsAliveRef.current = cards.length > 0

  const hiddenInStrip = useMemo(() => new Set(cards.filter((c) => c.state === 'open').map((c) => c.flat)), [cards])
  const returningInStrip = useMemo(() => new Set(cards.filter((c) => c.state === 'closing').map((c) => c.flat)), [cards])

  const spreadFor = useCallback(
    (flat: number | null) => {
      if (modal || flat === null) return 0
      const item = rendered[flat]
      return item ? (0.9 * (hoverScale - 1) * widthOf(item.key)) / 2 : 0
    },
    [rendered, widthOf, hoverScale, modal],
  )

  const columnOf = (flat: number) =>
    scrollerRef.current?.querySelector<HTMLElement>(`[data-lollipop-column="${flat}"]`) ?? null

  const settledRect = useCallback(
    (flat: number, activeFlat: number | null): Rect | null => {
      const scroller = scrollerRef.current
      const column = columnOf(flat)
      if (!scroller || !column) return null
      const frame = scroller.getBoundingClientRect()
      const shift = activeFlat === null || activeFlat === flat ? 0 : spreadFor(activeFlat) * (flat < activeFlat ? -1 : 1)
      return {
        left: frame.left - effectiveScroll() + column.offsetLeft + shift,
        top: frame.top + mediaCenterY - itemHeight / 2,
        width: column.offsetWidth,
        height: itemHeight,
      }
    },
    [spreadFor, mediaCenterY, itemHeight, effectiveScroll],
  )

  const buildCard = useCallback(
    (flat: number): Card | null => {
      const scroller = scrollerRef.current
      const item = rendered[flat]
      const column = columnOf(flat)
      if (!scroller || !item || !column) return null
      const capsule = column.querySelector<HTMLElement>('.lollipop-media')
      const live = capsule?.getBoundingClientRect()
      const rest = settledRect(flat, flat) ?? (live ? { left: live.left, top: live.top, width: live.width, height: live.height } : null)
      if (!rest) return null

      const frame = scroller.getBoundingClientRect()
      const centerX = frame.left - effectiveScroll() + column.offsetLeft + column.offsetWidth / 2
      const width = widthOf(item.key)
      const vw = window.innerWidth
      const vh = window.innerHeight
      const margin = modal ? MODAL_MARGIN : EDGE_MARGIN
      const chrome = modal ? MODAL_TOP + MODAL_BOTTOM : margin * 2
      const fitWidth = (vw - margin * 2) / width
      const fitHeight = (vh - chrome) / itemHeight
      const scale = Math.max(1, modal ? Math.min(fitWidth, fitHeight) : Math.min(hoverScale, fitWidth, fitHeight))
      const openWidth = width * scale
      const openHeight = itemHeight * scale
      const left = modal
        ? (vw - openWidth) / 2
        : Math.min(Math.max(centerX - openWidth / 2, margin), Math.max(margin, vw - margin - openWidth))
      let top = modal ? MODAL_TOP + (vh - chrome - openHeight) / 2 : frame.top + mediaCenterY - openHeight / 2
      if (!modal && openHeight < vh - margin * 2) top = Math.min(Math.max(top, margin), vh - margin - openHeight)
      seqRef.current += 1
      return { ...item, rest, open: { left, top, width: openWidth, height: openHeight }, state: 'open', seq: seqRef.current }
    },
    [rendered, widthOf, hoverScale, itemHeight, mediaCenterY, modal, settledRect, effectiveScroll],
  )

  const closeCard = useCallback(
    (card: Card, activeFlat: number | null): Card =>
      card.state === 'closing' ? card : { ...card, state: 'closing', rest: settledRect(card.flat, activeFlat) ?? card.rest },
    [settledRect],
  )

  useLayoutEffect(() => {
    if (active === null) {
      setCards((prev) => (prev.every((c) => c.state === 'closing') ? prev : prev.map((c) => closeCard(c, null))))
      return
    }
    setCards((prev) => {
      const current = prev.find((c) => c.flat === active)
      if (current && current.state === 'open') return prev
      const built = buildCard(active)
      if (!built) return prev
      const closing = prev.filter((c) => c.flat !== active).map((c) => closeCard(c, active)).slice(-1)
      return [...closing, built]
    })
  }, [active, buildCard, closeCard])

  // Geometry written imperatively so a re-render can't snap a card mid-flight.
  useLayoutEffect(() => {
    for (const card of cards) {
      const el = cardElements.current.get(card.flat)
      if (!el) continue
      const stamp = `${card.state}:${card.seq}`
      if (el.dataset.applied === stamp) continue
      const caption = captionElements.current.get(card.flat)
      const toRest = () => {
        writeRect(el, card.open)
        el.style.transform = invert(card.rest, card.open)
        el.style.borderRadius = `${card.open.height / 2}px`
      }
      if (card.state === 'open') {
        if (!el.dataset.applied) {
          toRest()
          void el.offsetWidth
        }
        el.style.transform = 'none'
        el.style.borderRadius = `${expandedRadius}px`
        el.dataset.open = 'true'
        positionCaption(caption, card.open, captionGap, captionInset, modal)
        if (caption) caption.dataset.open = 'true'
        if (focusIntentRef.current) {
          focusIntentRef.current = false
          returnFocusRef.current = card.flat
          el.focus({ preventScroll: true })
        }
      } else {
        toRest()
        el.dataset.open = 'false'
        if (caption) caption.dataset.open = 'false'
      }
      el.dataset.applied = stamp
    }
  }, [cards, expandedRadius, captionGap, captionInset, modal, viewport])

  useEffect(() => {
    if (active !== null || returnFocusRef.current === null) return
    const flat = returnFocusRef.current
    returnFocusRef.current = null
    scrollerRef.current?.querySelector<HTMLElement>(`.lollipop-media[data-lollipop-index="${flat}"]`)?.focus({ preventScroll: true })
  }, [active])

  useEffect(() => {
    if (!cards.some((c) => c.state === 'closing')) return
    const timer = window.setTimeout(() => setCards((prev) => prev.filter((c) => c.state !== 'closing')), CLOSE_MS + 120)
    return () => window.clearTimeout(timer)
  }, [cards])

  /* ------------------------------------------------------------ stepping */
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const rovingIndex = focusIndex !== null && focusIndex >= middleStart && focusIndex < middleEnd ? focusIndex : middleStart

  const centreOn = useCallback(
    (flat: number) => {
      const scroller = scrollerRef.current
      const column = columnOf(flat)
      if (!scroller || !column) return
      const track = copyWidthRef.current * COPIES
      const target = Math.min(
        Math.max(column.offsetLeft + column.offsetWidth / 2 - scroller.clientWidth / 2, 0),
        Math.max(0, track - scroller.clientWidth),
      )
      if (!runningRef.current) {
        posRef.current = target
        appliedRef.current = target
        scroller.scrollLeft = target
        glideRef.current = null
        wrap()
        return
      }
      glideRef.current = target
    },
    [wrap],
  )

  // Shift the whole interaction one copy along, invisibly.
  const rebase = useCallback(
    (copies: number) => {
      const el = scrollerRef.current
      const width = copyWidthRef.current
      const span = middleEnd - middleStart
      if (!el || width <= 0 || span <= 0 || copies === 0) return
      const delta = -copies * width
      posRef.current += delta
      appliedRef.current = posRef.current
      el.scrollLeft = posRef.current
      if (glideRef.current !== null) glideRef.current += delta
      const shift = -copies * span
      setCards((prev) => (prev.length === 0 ? prev : prev.map((c) => ({ ...c, flat: c.flat + shift }))))
      if (activeRef.current !== null) {
        activeRef.current += shift
        setActive(activeRef.current)
      }
    },
    [middleStart, middleEnd],
  )

  const stepFrom = useCallback(
    (from: number, delta: number) => {
      const span = middleEnd - middleStart
      if (span <= 0) return null
      const raw = from + delta
      const copies =
        raw >= middleEnd ? Math.floor((raw - middleStart) / span) : raw < middleStart ? -Math.ceil((middleStart - raw) / span) : 0
      if (copies !== 0) rebase(copies)
      const next = raw - copies * span
      setFocusIndex(next)
      centreOn(next)
      if (activeRef.current !== null) setActiveIndex(next)
      return next
    },
    [middleStart, middleEnd, rebase, centreOn, setActiveIndex],
  )

  const stepActive = useCallback(
    (delta: number) => {
      if (activeRef.current !== null) stepFrom(activeRef.current, delta)
    },
    [stepFrom],
  )

  const stepToSource = useCallback(
    (source: number) => {
      const from = activeRef.current
      const count = items.length
      if (from === null || count === 0) return
      const forward = (((source - (from % count)) % count) + count) % count
      const delta = forward > count / 2 ? forward - count : forward
      if (delta !== 0) stepFrom(from, delta)
    },
    [items.length, stepFrom],
  )

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const flat = Number((event.target as Element).getAttribute?.('data-lollipop-index'))
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        const next = stepFrom(rovingIndex, event.key === 'ArrowRight' ? 1 : -1)
        if (next !== null) {
          scrollerRef.current?.querySelector<HTMLElement>(`.lollipop-media[data-lollipop-index="${next}"]`)?.focus({ preventScroll: true })
        }
      } else if ((event.key === 'Enter' || event.key === ' ') && Number.isInteger(flat) && !(event.target instanceof HTMLAnchorElement && event.key === 'Enter' && activeRef.current === flat)) {
        event.preventDefault()
        if (activeRef.current === flat) setActiveIndex(null)
        else {
          focusIntentRef.current = true
          setActiveIndex(flat)
        }
      } else if (event.key === 'Escape') {
        setActiveIndex(null)
      }
    },
    [rovingIndex, stepFrom, setActiveIndex],
  )

  // While a card is open the document owns hover, keys, taps and wheel.
  useEffect(() => {
    if (cards.length === 0) return
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || draggingRef.current || modal) return
      const last = lastPointRef.current
      if (last.x === event.clientX && last.y === event.clientY) return
      lastPointRef.current = { x: event.clientX, y: event.clientY }
      const open = cardsRef.current.find((c) => c.state === 'open')
      if (open && within(event, `[data-lollipop-card="${open.flat}"]`, layerRef.current)) return
      // Also hold it while crossing the gap between the card and its caption,
      // or reaching for the caption's button closes the card under the pointer.
      if (open) {
        const card = cardElements.current.get(open.flat)?.getBoundingClientRect()
        const caption = captionElements.current.get(open.flat)?.getBoundingClientRect()
        if (card && caption) {
          const left = Math.min(card.left, caption.left)
          const right = Math.max(card.right, caption.right)
          const top = Math.min(card.top, caption.top)
          const bottom = Math.max(card.bottom, caption.bottom)
          if (event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom) return
        }
      }
      setActiveIndex(indexAtPoint(event.clientX, event.clientY))
    }
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && !modal) return
      if (activeRef.current !== null && within(event, `[data-lollipop-card="${activeRef.current}"]`, layerRef.current)) return
      if (within(event, '[data-lollipop-chrome]', layerRef.current)) return
      closeNow()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return closeNow()
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (!cardsRef.current.some((c) => c.state === 'open') || isTyping(event.target)) return
      event.preventDefault()
      stepActive(event.key === 'ArrowRight' ? 1 : -1)
    }
    let travel = 0
    let steppedAt = 0
    let movedAt = 0
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      const dx = normaliseWheel(event.deltaX, event.deltaMode)
      const dy = normaliseWheel(event.deltaY, event.deltaMode)
      if (Math.abs(dx) <= Math.abs(dy)) return
      const target = event.target as Node
      if (!layerRef.current?.contains(target) && !scrollerRef.current?.contains(target)) return
      event.preventDefault()
      const now = performance.now()
      if (now - steppedAt < WHEEL_COOLDOWN_MS) return
      if (now - movedAt > WHEEL_IDLE_MS) travel = 0
      if (travel !== 0 && Math.sign(dx) !== Math.sign(travel)) travel = 0
      movedAt = now
      travel += dx
      if (Math.abs(travel) < WHEEL_STEP) return
      steppedAt = now
      stepActive(travel > 0 ? 1 : -1)
      travel = 0
    }
    // The card is fixed; if the page scrolls (smoothly, for a while) the strip
    // moves out from under it, so let it go rather than float detached.
    const onPageScroll = () => {
      if (!modal) closeNow()
    }
    window.addEventListener('scroll', onPageScroll, { passive: true })
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    document.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('scroll', onPageScroll)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('wheel', onWheel)
    }
  }, [cards.length, modal, indexAtPoint, setActiveIndex, closeNow, stepActive])

  /* ---------------------------------------------------------------- modal */
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const modalOpen = modal && cards.length > 0
  useEffect(() => {
    if (!modalOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = previous
    }
  }, [modalOpen])

  /* ---------------------------------------------------------- drag to pan */
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    let down = false
    let startX = 0
    let startScroll = 0
    let travelled = 0
    let pointerId = -1
    let tapIndex: number | null = null
    let tapType = 'mouse'
    let throwSpeed = 0
    let lastX = 0
    let lastAt = 0

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      down = true
      travelled = 0
      startX = event.clientX
      startScroll = el.scrollLeft
      pointerId = event.pointerId
      tapType = event.pointerType
      throwSpeed = 0
      lastX = event.clientX
      lastAt = performance.now()
      tapIndex = indexAtPoint(event.clientX, event.clientY)
      glideRef.current = null
      flingRef.current = null
      if (event.pointerType !== 'mouse') {
        touchingRef.current = true
        return
      }
      draggingRef.current = true
      try {
        el.setPointerCapture(pointerId)
      } catch {
        /* pointer already released */
      }
      el.style.cursor = 'grabbing'
    }
    const onMove = (event: PointerEvent) => {
      if (!down || tapType !== 'mouse') return
      const dx = event.clientX - startX
      travelled = Math.max(travelled, Math.abs(dx))
      posRef.current = startScroll - dx
      appliedRef.current = posRef.current
      el.scrollLeft = posRef.current
      startScroll += wrap()
      if (travelled > DRAG_SLOP) setActiveIndex(null)
      const now = performance.now()
      const elapsed = now - lastAt
      if (elapsed > 0) {
        const sample = (-(event.clientX - lastX) / elapsed) * 1000
        throwSpeed = throwSpeed === 0 ? sample : throwSpeed * 0.7 + sample * 0.3
        lastX = event.clientX
        lastAt = now
      }
    }
    const onUp = (event: PointerEvent) => {
      if (!down) return
      down = false
      if (tapType !== 'mouse') {
        const moved = Math.abs(event.clientX - startX) > TOUCH_SLOP
        const scrolled = Math.abs(el.scrollLeft - startScroll) > TOUCH_SLOP
        if (!moved && !scrolled) setActiveIndex(tapIndex !== null && activeRef.current !== tapIndex ? tapIndex : null)
        settleTouch()
        return
      }
      draggingRef.current = false
      try {
        el.releasePointerCapture(pointerId)
      } catch {
        /* already released */
      }
      el.style.cursor = ''
      if (travelled > DRAG_SLOP && Math.abs(throwSpeed) > MIN_FLING_SPEED) {
        flingRef.current = Math.max(-MAX_FLING_SPEED, Math.min(MAX_FLING_SPEED, throwSpeed))
      }
    }
    const onClick = (event: MouseEvent) => {
      if (travelled > DRAG_SLOP) {
        event.preventDefault()
        event.stopPropagation()
        travelled = 0
      } else if (modal) {
        // Modal opens on tap; a capsule link shouldn't navigate underneath.
        event.preventDefault()
      }
    }
    const onCancel = () => {
      if (!down) return
      down = false
      if (tapType !== 'mouse') return settleTouch()
      draggingRef.current = false
      el.style.cursor = ''
    }
    const onDragStart = (event: DragEvent) => event.preventDefault()
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onCancel)
    el.addEventListener('click', onClick, true)
    el.addEventListener('dragstart', onDragStart)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onCancel)
      el.removeEventListener('click', onClick, true)
      el.removeEventListener('dragstart', onDragStart)
    }
  }, [setActiveIndex, measured, wrap, indexAtPoint, settleTouch, modal])

  /* --------------------------------------------------------- auto-scroll */
  const [documentHidden, setDocumentHidden] = useState(false)
  const [onScreen, setOnScreen] = useState(true)
  useEffect(() => {
    const sync = () => setDocumentHidden(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(Boolean(entry?.isIntersecting)), { rootMargin: '100px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const settling = cards.some((c) => c.state === 'closing')
  const paused = documentHidden || active !== null || settling
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const hardStopRef = useRef(false)
  useEffect(() => {
    if (active !== null) hardStopRef.current = true
  }, [active])

  const running = measured && !reducedMotion && copyWidth > 0 && onScreen
  runningRef.current = running

  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    let velocity = 0
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000
      last = now
      const el = scrollerRef.current
      if (el && touchingRef.current) {
        velocity = 0
      } else if (el) {
        if (hardStopRef.current) {
          velocity = 0
          hardStopRef.current = false
        }
        if (flingRef.current !== null) {
          velocity = flingRef.current
          flingRef.current = null
        }
        const goal = pausedRef.current ? 0 : speed
        const coasting = Math.abs(velocity) > Math.abs(goal) * 1.5 + FLING_FLOOR
        velocity += (goal - velocity) * (1 - Math.exp(-dt / (coasting ? 0.45 : 0.12)))
        let moved = false
        if (glideRef.current !== null) {
          const remaining = glideRef.current - posRef.current
          if (Math.abs(remaining) < 0.5) {
            posRef.current = glideRef.current
            glideRef.current = null
          } else {
            posRef.current += remaining * (1 - Math.exp(-dt / 0.14))
          }
          moved = true
        } else if (Math.abs(velocity) > 0.01) {
          posRef.current += velocity * dt
          moved = true
        }
        if (moved) {
          appliedRef.current = posRef.current
          el.scrollLeft = posRef.current
          wrap()
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, wrap, speed])

  /* -------------------------------------------------------------- render */
  const spread = spreadFor(active)
  const activeSource = active === null || items.length === 0 ? null : ((active % items.length) + items.length) % items.length

  const renderCaption = (item: Rendered) => (
    <>
      <div className="text-[20px] leading-tight text-white sm:text-[22px]" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}>
        {item.title}
      </div>
      {item.description && (
        <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-white/70" style={{ textShadow: '0 1px 16px rgba(0,0,0,0.7)' }}>
          {item.description}
        </p>
      )}
      {item.tags && item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[11px] text-[#93c5fd]"
              style={{ background: 'rgba(96,165,250,0.12)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {item.action && <div className="mt-4">{item.action}</div>}
    </>
  )

  const swipeRef = useRef<{ id: number; x: number; y: number } | null>(null)

  const focusLayer =
    cards.length === 0
      ? null
      : createPortal(
          <div className="lollipop-layer" ref={layerRef} data-modal={modal} role={modal ? 'dialog' : undefined} aria-modal={modal || undefined} aria-label={modal ? rendered[active ?? -1]?.title ?? 'Project' : undefined} style={clock}>
            {modal && <div className="lollipop-sheet" data-open={cards.some((c) => c.state === 'open')} style={{ background: SHEET }} onPointerDown={closeNow} />}
            {cards.map((card) => {
              const MediaTag = card.link && !modal ? 'a' : 'div'
              return (
                <div
                  key={card.seq}
                  data-lollipop-card={card.flat}
                  onPointerDown={(event) => {
                    if (modal && event.pointerType !== 'mouse') swipeRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
                  }}
                  onPointerUp={(event) => {
                    const start = swipeRef.current
                    swipeRef.current = null
                    if (!start || start.id !== event.pointerId) return
                    const dx = event.clientX - start.x
                    const dy = event.clientY - start.y
                    if (Math.abs(dx) < SWIPE_STEP || Math.abs(dx) <= Math.abs(dy)) return
                    stepActive(dx < 0 ? 1 : -1)
                  }}
                >
                  <MediaTag
                    ref={(el: HTMLElement | null) => {
                      if (el) cardElements.current.set(card.flat, el)
                      else cardElements.current.delete(card.flat)
                    }}
                    className="lollipop-focus-card"
                    data-lollipop-index={card.flat}
                    {...(MediaTag === 'a' ? { href: card.link } : { tabIndex: -1, role: 'group' })}
                    aria-label={card.title}
                    aria-describedby={`lollipop-caption-${card.flat}`}
                    style={{ boxShadow: CARD_SHADOW, background: TINT }}
                  >
                    <img src={card.image} alt="" draggable={false} decoding="async" className="lollipop-img" />
                  </MediaTag>
                  <div
                    className="lollipop-caption"
                    id={`lollipop-caption-${card.flat}`}
                    ref={(el) => {
                      if (el) captionElements.current.set(card.flat, el)
                      else captionElements.current.delete(card.flat)
                    }}
                  >
                    {renderCaption(card)}
                  </div>
                </div>
              )
            })}
            {modal && (
              <div className="lollipop-chrome" data-lollipop-chrome data-open={cards.some((c) => c.state === 'open')}>
                <button ref={closeButtonRef} type="button" className="lollipop-close text-white" aria-label="Close" onClick={closeNow}>
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                    <path d="M3 3 L15 15 M15 3 L3 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  </svg>
                </button>
                {items.length > 1 && (
                  <div className="lollipop-dots" role="group" aria-label="Choose a project">
                    {items.map((item, index) => (
                      <button
                        key={item.key}
                        type="button"
                        className="lollipop-dot text-white"
                        data-on={index === activeSource}
                        aria-label={item.title}
                        aria-current={index === activeSource}
                        onClick={() => stepToSource(index)}
                      >
                        <span aria-hidden />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>,
          document.body,
        )

  return (
    <div ref={rootRef} className={className} style={{ ...style, width: '100%', height: '100%', display: 'flex', alignItems: 'center', position: 'relative' }}>
      <style>{STYLES}</style>
      <div style={{ width: '100%', height: blockHeight }}>
        <div
          ref={scrollerRef}
          className="lollipop-scroller"
          data-focus={cards.length > 0}
          role="region"
          aria-label="Projects carousel"
          aria-roledescription="carousel"
          style={{ ...clock, height: band, cursor: 'grab' }}
          onScroll={onScroll}
          onPointerMove={onStripPointerMove}
          onPointerLeave={onStripPointerLeave}
          onKeyDown={onKeyDown}
        >
          {!measured
            ? SKELETON_RATIOS.map((ratio, i) => (
                <div key={`skeleton-${i}`} className="lollipop-column" aria-hidden style={{ width: Math.round(itemHeight * ratio), height: band, marginRight: gap }}>
                  <div
                    className="lollipop-media lollipop-skeleton"
                    style={{ top: mediaCenterY - itemHeight / 2, left: 0, width: Math.round(itemHeight * ratio), height: itemHeight, borderRadius: 999, background: TINT }}
                  />
                </div>
              ))
            : rendered.map((item) => {
                const isActive = item.flat === active
                const width = widthOf(item.key)
                const focusable = item.flat >= middleStart && item.flat < middleEnd
                const shift = active === null || isActive ? 0 : item.flat < active ? -spread : spread
                const state = hiddenInStrip.has(item.flat) ? 'hidden' : returningInStrip.has(item.flat) ? 'returning' : active !== null ? 'dim' : 'lit'
                const capsuleStyle: CSSProperties = {
                  top: mediaCenterY - itemHeight / 2,
                  left: 0,
                  width,
                  height: itemHeight,
                  borderRadius: 999,
                  boxShadow: SHADOW,
                  background: TINT,
                  opacity: state === 'hidden' ? 0 : active !== null ? dimOpacity : 1,
                  pointerEvents: hiddenInStrip.has(item.flat) ? 'none' : 'auto',
                }
                const shared = {
                  className: 'lollipop-media',
                  'data-lollipop-index': item.flat,
                  'data-state': state,
                  'aria-hidden': !focusable,
                  'aria-label': focusable ? item.title : undefined,
                  tabIndex: focusable && item.flat === rovingIndex ? 0 : -1,
                  onFocus: focusable ? () => setFocusIndex(item.flat) : undefined,
                  style: capsuleStyle,
                }
                const image = <img src={item.image} alt="" draggable={false} decoding="async" className="lollipop-img" />
                return (
                  <div
                    key={item.flat}
                    className="lollipop-column"
                    data-lollipop-column={item.flat}
                    data-parting={active !== null}
                    style={{ width, height: band, marginRight: gap, transform: `translate3d(${shift}px, 0, 0)` }}
                  >
                    {item.link ? (
                      <a {...shared} href={item.link}>
                        {image}
                      </a>
                    ) : (
                      <div {...shared} role={focusable ? 'button' : undefined} aria-expanded={focusable ? isActive : undefined}>
                        {image}
                      </div>
                    )}
                  </div>
                )
              })}
        </div>
      </div>
      <div className="sr-only" aria-live="polite">
        {active !== null && rendered[active]?.title ? `${rendered[active].title}, expanded` : ''}
      </div>
      {focusLayer}
    </div>
  )
}

const STYLES = `
.lollipop-scroller::-webkit-scrollbar { display: none; }
.lollipop-scroller {
  scrollbar-width: none; width: 100%; position: relative; display: flex; align-items: flex-start;
  overflow-x: auto; overflow-y: hidden; scroll-behavior: auto; overscroll-behavior-x: contain;
  will-change: scroll-position; transform: translateZ(0); user-select: none; touch-action: pan-x pan-y; outline: none;
}
.lollipop-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; user-select: none; }
.lollipop-column {
  position: relative; flex: 0 0 auto; pointer-events: none; user-select: none;
  transition: transform var(--lollipop-close-dur) var(--lollipop-close-ease);
}
.lollipop-column[data-parting="true"] { transition: transform var(--lollipop-open-dur) var(--lollipop-open-ease); }
.lollipop-scroller[data-focus="true"] .lollipop-column { will-change: transform; }
.lollipop-media {
  position: absolute; overflow: hidden; pointer-events: auto; display: block; text-decoration: none; backface-visibility: hidden;
  transition: top .26s ${EASE}, width .26s ${EASE}, height .26s ${EASE}, opacity var(--lollipop-close-dur) ${EASE};
}
.lollipop-media[data-state="dim"] { transition: top .26s ${EASE}, width .26s ${EASE}, height .26s ${EASE}, opacity .3s ${EASE}; }
.lollipop-media[data-state="hidden"] { transition: top .26s ${EASE}, width .26s ${EASE}, height .26s ${EASE}, opacity 90ms linear; }
.lollipop-media[data-state="returning"] { transition: top .26s ${EASE}, width .26s ${EASE}, height .26s ${EASE}, opacity 110ms linear var(--lollipop-close-dur); }
.lollipop-media:focus-visible, .lollipop-focus-card:focus-visible { outline: 2px solid #60a5fa; outline-offset: 3px; }
.lollipop-skeleton { animation: lollipop-pulse 1.6s ease-in-out infinite; }
@keyframes lollipop-pulse { 50% { opacity: .55; } }
.lollipop-layer { position: fixed; inset: 0; z-index: 45; pointer-events: none; }
.lollipop-focus-card {
  position: fixed; overflow: hidden; display: block; text-decoration: none; pointer-events: auto;
  transform-origin: 0 0; will-change: transform; contain: layout paint;
}
.lollipop-focus-card[data-open="true"] {
  transition: transform var(--lollipop-open-dur) var(--lollipop-open-ease), border-radius var(--lollipop-radius-dur) ${EASE};
}
.lollipop-focus-card[data-open="false"] {
  pointer-events: none;
  transition: transform var(--lollipop-close-dur) var(--lollipop-close-ease), border-radius var(--lollipop-radius-dur) ${EASE};
}
.lollipop-sheet { position: fixed; inset: 0; opacity: 0; pointer-events: none; transition: opacity var(--lollipop-close-dur) ${EASE}; }
.lollipop-sheet[data-open="true"] { opacity: 1; pointer-events: auto; transition: opacity var(--lollipop-open-dur) var(--lollipop-open-ease); }
.lollipop-chrome { position: fixed; inset: 0; pointer-events: none; opacity: 0; transition: opacity var(--lollipop-close-dur) ${EASE}; }
.lollipop-chrome[data-open="true"] { opacity: 1; transition: opacity .24s .12s ${EASE}; }
.lollipop-close {
  position: absolute; top: calc(env(safe-area-inset-top, 0px) + 8px); right: calc(env(safe-area-inset-right, 0px) + 8px);
  width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 0; background: none; cursor: pointer; pointer-events: auto;
}
.lollipop-dots {
  position: absolute; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 6px);
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap; pointer-events: none;
}
.lollipop-dot { width: 28px; height: 44px; display: flex; align-items: center; justify-content: center; border: 0; background: none; cursor: pointer; pointer-events: auto; }
.lollipop-dot > span { width: 7px; height: 7px; border-radius: 999px; background: currentColor; opacity: .45; transition: opacity .24s ${EASE}, transform .24s ${EASE}; }
.lollipop-dot[data-on="true"] > span { opacity: 1; transform: scale(1.15); background: #f59e0b; }
.lollipop-layer[data-modal="true"] .lollipop-focus-card { touch-action: none; }
.lollipop-caption {
  position: fixed; display: flex; flex-direction: column; align-items: flex-start; pointer-events: none;
  opacity: 0; transform: translateY(10px); transition: opacity .18s ${EASE}, transform .18s ${EASE};
}
.lollipop-caption[data-open="true"] {
  opacity: 1; transform: translateY(0); pointer-events: auto;
  transition: opacity .26s .12s ${EASE}, transform var(--lollipop-open-dur) .12s var(--lollipop-open-ease);
}
@supports not (transition-timing-function: linear(0, 1)) {
  .lollipop-layer, .lollipop-scroller { --lollipop-open-ease: var(--lollipop-ease-fb); --lollipop-close-ease: var(--lollipop-ease-fb); }
}
@media (prefers-reduced-motion: reduce) {
  .lollipop-column, .lollipop-media, .lollipop-focus-card, .lollipop-sheet, .lollipop-chrome, .lollipop-dot > span, .lollipop-caption {
    transition-duration: .01ms; transition-delay: 0s;
  }
}
`

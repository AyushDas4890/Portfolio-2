import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from './lib/motion'
import { LogoMark } from './LogoMark'
import { ABOUT } from './content'

/**
 * "Personnel file" — the About section's centrepiece, rebuilt from the
 * confidential-folder interaction in the reference recording.
 *
 * At rest a blue glass folder sits angled in 3D with a sheet peeking from its
 * right edge ("DO NOT OPEN"). Hovering slides the sheet further out. Opening
 * swings the sheet out past the edge and back round in front of the cover,
 * tilted, with its contents staggering in. Leaving, Esc or a second click
 * plays the same timeline in reverse and the folder settles flat again.
 */
export function DossierFile() {
  const rootRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const tabRef = useRef<HTMLSpanElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null)
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)

  useLayoutEffect(() => {
    const file = fileRef.current
    const sheet = sheetRef.current
    const cover = coverRef.current
    const content = contentRef.current
    if (!file || !sheet || !cover || !content) return
    const rows = content.querySelectorAll('[data-row]')
    const reduced = prefersReducedMotion()

    gsap.set(file, { rotateY: reduced ? 0 : -14, transformPerspective: 1200 })
    gsap.set(sheet, { xPercent: 16, rotate: 3, zIndex: 1 })
    gsap.set(cover, { zIndex: 2 })
    gsap.set(rows, { autoAlpha: 0, y: 10 })

    const tl = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } })
    if (reduced) {
      tl.set(sheet, { xPercent: 0, rotate: -4, zIndex: 3 }).set(rows, { autoAlpha: 1, y: 0 }).set(tabRef.current, { autoAlpha: 0 })
    } else {
      tl.to(sheet, { xPercent: 74, rotate: 9, duration: 0.38, ease: 'power2.out' }, 0)
        .to(file, { rotateY: 0, duration: 0.7, ease: 'power3.inOut' }, 0)
        .to(tabRef.current, { autoAlpha: 0, duration: 0.2 }, 0.2)
        .set(sheet, { zIndex: 3 }, 0.38)
        .to(sheet, { xPercent: 2, yPercent: -3, rotate: -5, scale: 1.05, duration: 0.6, ease: 'power3.out' }, 0.38)
        .to(cover, { scale: 0.97, filter: 'brightness(0.8)', duration: 0.5, ease: 'power2.out' }, 0.38)
        .to(rows, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }, 0.62)
    }
    timelineRef.current = tl
    return () => {
      tl.kill()
    }
  }, [])

  useEffect(() => {
    openRef.current = open
    const tl = timelineRef.current
    if (!tl) return
    if (open) tl.timeScale(1).play()
    else tl.timeScale(1.35).reverse()
  }, [open])

  // Hover peek + pointer tilt, only while the file is closed.
  useEffect(() => {
    const root = rootRef.current
    const tilt = tiltRef.current
    const sheet = sheetRef.current
    const file = fileRef.current
    if (!root || !tilt || !sheet || !file || prefersReducedMotion()) return

    gsap.set(tilt, { rotateX: 0.01, rotateY: 0.01 })
    const rotX = gsap.quickTo(tilt, 'rotateX', { duration: 0.6, ease: 'power3.out' })
    const rotY = gsap.quickTo(tilt, 'rotateY', { duration: 0.6, ease: 'power3.out' })

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || openRef.current) return
      gsap.to(sheet, { xPercent: 32, rotate: 5, duration: 0.45, ease: 'power3.out' })
      gsap.to(file, { rotateY: -20, duration: 0.6, ease: 'power3.out' })
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const box = root.getBoundingClientRect()
      const px = (e.clientX - box.left) / box.width - 0.5
      const py = (e.clientY - box.top) / box.height - 0.5
      rotY(px * 12)
      rotX(-py * 12)
    }
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      rotX(0)
      rotY(0)
      if (openRef.current) {
        setOpen(false)
        return
      }
      gsap.to(sheet, { xPercent: 16, rotate: 3, duration: 0.5, ease: 'power3.out' })
      gsap.to(file, { rotateY: -14, duration: 0.6, ease: 'power3.out' })
    }

    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    return () => {
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // Touch / keyboard: close on outside tap or Esc.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    const hint = hintRef.current
    if (!hint) return
    gsap.to(hint, { autoAlpha: open ? 0 : 1, duration: 0.3 })
  }, [open])

  return (
    <div ref={rootRef} className="relative" style={{ perspective: 1200 }}>
      <div ref={tiltRef} style={{ transformStyle: 'preserve-3d' }}>
        <div
          ref={fileRef}
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-label={open ? 'Close personnel file' : 'Open personnel file'}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpen((o) => !o)
            }
          }}
          className="relative h-[250px] w-[190px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]/60 sm:h-[370px] sm:w-[280px]"
          style={{ transformStyle: 'preserve-3d', borderRadius: 24 }}
        >
          {/* back cover — visible sliver behind the front */}
          <div
            aria-hidden
            className="absolute inset-0 translate-x-[10px] rounded-[24px]"
            style={{
              background: 'linear-gradient(160deg, #3b6fd6, #172a66)',
              boxShadow: '0 30px 60px -30px rgba(0,0,0,0.9)',
            }}
          />

          {/* the sheet */}
          <div
            ref={sheetRef}
            className="absolute left-[4%] top-[5%] h-[90%] w-[92%] overflow-hidden rounded-[18px] p-3.5 text-left sm:p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(20,20,30,0.9), rgba(12,12,20,0.9))',
              backdropFilter: 'blur(14px) saturate(140%)',
              WebkitBackdropFilter: 'blur(14px) saturate(140%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12), 0 24px 50px -22px rgba(0,0,0,0.9)',
              transformOrigin: '50% 60%',
            }}
          >
            <span
              ref={tabRef}
              aria-hidden
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-[0.35em] text-[#f59e0b]"
              style={{ writingMode: 'vertical-rl' }}
            >
              Do not open
            </span>

            <div ref={contentRef} className="flex h-full flex-col">
              <p data-row className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#f59e0b]">
                Classified · Personnel
              </p>
              <p data-row className="mt-3 hidden text-[13px] leading-snug text-white/80 sm:block">
                {ABOUT.focus}
              </p>
              <ul className="mt-3 flex flex-col gap-2 sm:mt-4 sm:gap-2.5">
                {ABOUT.competencies.map((c) => (
                  <li data-row key={c.title} className="border-l border-[#60a5fa]/50 pl-2.5">
                    <p className="text-[12px] leading-tight text-white sm:text-[13px]" style={{ fontFamily: 'var(--font-heading)' }}>
                      {c.title}
                    </p>
                    <p className="hidden font-mono text-[10px] text-white/50 sm:block">{c.detail}</p>
                  </li>
                ))}
              </ul>
              <p data-row className="mt-auto hidden pt-3 font-mono text-[10px] leading-relaxed text-white/45 sm:block">
                {ABOUT.education}
              </p>
              <p data-row className="mt-auto pt-2 text-[11px] italic text-white/60 sm:mt-2 sm:pt-0 sm:text-[12px]">
                You really don&apos;t follow instructions, do you?
              </p>
            </div>
          </div>

          {/* front cover */}
          <div
            ref={coverRef}
            aria-hidden
            className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[24px] p-5 sm:p-6"
            style={{
              background: 'linear-gradient(160deg, #60a5fa 0%, #3b6fd6 42%, #1e3a8a 100%)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.45), inset 0 0 0 1px rgba(255,255,255,0.12), 0 30px 60px -28px rgba(0,0,0,0.9)',
            }}
          >
            <span
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(120% 70% at 20% 0%, rgba(255,255,255,0.28), transparent 60%)' }}
            />
            <LogoMark className="relative h-7 w-7 text-white" />
            <div className="relative">
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-white">Personnel file</p>
              <p className="mt-1 text-[13px] text-white/75">Ayush Das · AI / ML</p>
            </div>
          </div>
        </div>
      </div>

      <span
        ref={hintRef}
        className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.25em] text-white/40"
      >
        Hover · click to open
      </span>
    </div>
  )
}

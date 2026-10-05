import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { REEL } from '../content'
import { gsap } from '../lib/motion'
import { useFinePointer, useMediaQuery, useReducedMotion } from '../lib/hooks'
import { Expand, Pause, Play, SoundOff, SoundOn } from './Icons'

// Phones held upright get the 9:16 cut; everything wider gets the 16:9 one.
const PORTRAIT_QUERY = '(max-aspect-ratio: 2/3)'

type ReelVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

const CHAPTERS = REEL.chapters
const chapterEnd = (i: number) => CHAPTERS[i + 1]?.start ?? REEL.duration
const pad = (n: number) => String(n).padStart(2, '0')

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${pad(s % 60)}`
}

/**
 * The showreel, fitted to the viewport: 16:9 on landscape screens (it grows
 * from the hero's column width to full-bleed as it scrolls up), 9:16 on
 * phones. Plays muted while on screen; sound, pause, chapters and fullscreen
 * are one click away. Reduced motion never autoplays — it shows the end card
 * with a play button instead.
 */
export function Showreel() {
  const portrait = useMediaQuery(PORTRAIT_QUERY)
  const reduced = useReducedMotion()
  const finePointer = useFinePointer()
  const cut = portrait ? REEL.portrait : REEL.landscape

  const sectionRef = useRef<HTMLElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<ReelVideo>(null)
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([])
  const timeRef = useRef<HTMLSpanElement>(null)
  const userPaused = useRef(false)
  const heardSound = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [chapter, setChapter] = useState(0)
  const [needsGesture, setNeedsGesture] = useState(reduced)
  const [hovering, setHovering] = useState(false)

  const play = useCallback((video: HTMLVideoElement) => {
    video.play().catch((err: DOMException) => {
      // AbortError: a pause() (e.g. scrolled away) interrupted this play() — expected.
      if (err.name === 'AbortError') return
      // NotAllowedError: autoplay blocked (low-power mode, browser policy).
      if (err.name === 'NotAllowedError') {
        setNeedsGesture(true)
        return
      }
      console.warn('Showreel playback failed', err)
    })
  }, [])

  // Progress, time and chapter are painted straight to the DOM each frame
  // while playing; React only hears about chapter changes.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // React sets `muted` as a property only; mirror it to the attribute,
    // which some mobile autoplay checks read.
    video.defaultMuted = video.muted
    let raf = 0
    const paint = () => {
      const t = video.currentTime
      let current = 0
      CHAPTERS.forEach((c, i) => {
        if (t >= c.start) current = i
        const fill = fillRefs.current[i]
        if (fill) {
          const p = Math.min(1, Math.max(0, (t - c.start) / (chapterEnd(i) - c.start)))
          fill.style.transform = `scaleX(${p})`
        }
      })
      if (timeRef.current) timeRef.current.textContent = formatTime(t)
      setChapter(current)
    }
    const loop = () => {
      paint()
      raf = requestAnimationFrame(loop)
    }
    const onPlay = () => {
      setPlaying(true)
      setNeedsGesture(false)
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    }
    const onPause = () => {
      setPlaying(false)
      cancelAnimationFrame(raf)
      paint()
    }
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('seeked', paint)
    return () => {
      cancelAnimationFrame(raf)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('seeked', paint)
    }
  }, [cut.mp4])

  // Autoplay (muted) only while at least a fifth of the frame is visible.
  useEffect(() => {
    const video = videoRef.current
    const frame = frameRef.current
    if (!video || !frame || reduced) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userPaused.current) play(video)
        } else if (!video.paused) {
          video.pause()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(frame)
    return () => observer.disconnect()
  }, [cut.mp4, reduced, play])

  // Scroll-driven growth: starts at the hero's column width with rounded
  // corners and finishes edge to edge.
  useLayoutEffect(() => {
    const frame = frameRef.current
    const caption = captionRef.current
    if (!frame || !caption || reduced) return
    const ctx = gsap.context(() => {
      const startScale = () => {
        if (portrait) return 0.92
        const gutter = parseFloat(getComputedStyle(caption).paddingLeft) || 0
        const column = caption.clientWidth - gutter * 2
        return Math.min(1, column / frame.offsetWidth)
      }
      const fullBleed = () => frame.offsetWidth >= window.innerWidth - 24
      gsap.fromTo(
        frame,
        { scale: startScale, borderRadius: () => 28 / startScale(), transformOrigin: '50% 0%' },
        {
          scale: 1,
          borderRadius: () => (fullBleed() ? 0 : 24),
          ease: 'none',
          scrollTrigger: {
            trigger: frame,
            start: 'top bottom',
            end: portrait ? 'top 30%' : 'top 12%',
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        },
      )
    }, frame)
    return () => ctx.revert()
  }, [portrait, reduced])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      userPaused.current = false
      play(video)
    } else {
      userPaused.current = true
      video.pause()
    }
  }

  const toggleSound = () => {
    const video = videoRef.current
    if (!video) return
    if (!video.muted) {
      video.muted = true
      setMuted(true)
      return
    }
    // The first time sound comes on, start the reel from the top.
    if (!heardSound.current) {
      heardSound.current = true
      video.currentTime = 0
    }
    video.muted = false
    setMuted(false)
    userPaused.current = false
    if (video.paused) play(video)
  }

  const startWithSound = () => {
    const video = videoRef.current
    if (!video) return
    heardSound.current = true
    userPaused.current = false
    video.muted = false
    setMuted(false)
    video.currentTime = 0
    play(video)
  }

  const seek = (i: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = CHAPTERS[i].start + 0.02
    if (video.paused) {
      userPaused.current = false
      play(video)
    }
  }

  const toggleFullscreen = () => {
    const frame = frameRef.current
    const video = videoRef.current
    if (!frame || !video) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.warn('Exiting fullscreen failed', err))
    } else if (typeof frame.requestFullscreen === 'function') {
      frame.requestFullscreen().catch((err) => console.warn('Fullscreen request failed', err))
    } else {
      // iPhone Safari only allows the <video> element itself to go fullscreen.
      video.webkitEnterFullscreen?.()
    }
  }

  // Cursor pill (desktop): follows the pointer over the video and names the
  // click action. Coordinates are divided by the current scroll scale.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 380, damping: 32, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 380, damping: 32, mass: 0.6 })
  const lastPointer = useRef({ x: 0, y: 0 })
  const placePill = useCallback(
    (jump = false) => {
      const frame = frameRef.current
      if (!frame) return
      const rect = frame.getBoundingClientRect()
      const k = frame.offsetWidth / rect.width
      const x = (lastPointer.current.x - rect.left) * k
      const y = (lastPointer.current.y - rect.top) * k
      if (jump) {
        px.jump(x)
        py.jump(y)
        sx.jump(x)
        sy.jump(y)
      } else {
        px.set(x)
        py.set(y)
      }
    },
    [px, py, sx, sy],
  )
  const trackPointer = (e: PointerEvent, jump = false) => {
    lastPointer.current = { x: e.clientX, y: e.clientY }
    placePill(jump)
  }

  // The page can scroll under a resting cursor; keep the pill under it.
  useEffect(() => {
    if (!hovering) return
    const onScroll = () => placePill()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hovering, placePill])

  const frameWidth = portrait
    ? 'min(calc(100% - 2 * var(--gutter)), calc(82svh * 9 / 16))'
    : reduced
      ? 'calc(min(100%, 1440px) - 2 * var(--gutter))'
      : 'min(100%, calc(100svh * 16 / 9))'

  return (
    <section ref={sectionRef} id="reel" aria-label="Showreel" className="relative pb-[clamp(72px,10vw,150px)] pt-[clamp(40px,6vw,88px)]">
      <div ref={captionRef} className="shell flex items-end justify-between gap-6 pb-5">
        <p className="eyebrow flex items-center gap-2.5 text-muted">
          <span className="h-2 w-2 bg-amber" aria-hidden />
          Showreel — 2026
        </p>
        <p className="eyebrow text-dim">
          {formatTime(REEL.duration)}
          <span className="hidden sm:inline"> · {finePointer ? 'Click for sound' : 'Tap the speaker for sound'}</span>
        </p>
      </div>

      <div
        ref={frameRef}
        className="reel-frame relative mx-auto overflow-hidden rounded-[24px] bg-raise shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
        style={{ width: frameWidth, aspectRatio: portrait ? '9 / 16' : '16 / 9' }}
      >
        <video
          key={cut.mp4}
          ref={videoRef}
          poster={needsGesture ? cut.endPoster : cut.poster}
          muted={muted}
          loop
          playsInline
          preload={reduced ? 'metadata' : 'auto'}
          aria-label="Showreel: data, language, agents, products, models that ship, the stack — Ayush Das, AI engineer."
          className={`absolute inset-0 h-full w-full object-cover ${finePointer ? 'cursor-none' : ''}`}
          onClick={toggleSound}
          onPointerEnter={(e) => {
            trackPointer(e, true)
            setHovering(true)
          }}
          onPointerMove={(e) => trackPointer(e)}
          onPointerLeave={() => setHovering(false)}
        >
          <source src={cut.mp4} type="video/mp4" />
          <source src={cut.webm} type="video/webm" />
        </video>

        {/* Hairline edge: the reel's ground is the page's, so without it the
            frame dissolves into the page while it is still a card. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] ring-1 ring-inset ring-white/[0.08]" />

        {finePointer && !needsGesture && (
          <motion.div aria-hidden className="pointer-events-none absolute left-0 top-0 z-20" style={{ x: sx, y: sy }}>
            <motion.span
              className="eyebrow flex h-[92px] w-[92px] items-center justify-center rounded-full bg-amber text-center !tracking-[0.12em] text-ink shadow-[0_10px_40px_-10px_rgba(245,158,11,0.6)]"
              style={{ x: '-50%', y: '-50%' }}
              initial={false}
              animate={{ scale: hovering ? 1 : 0.2, opacity: hovering ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            >
              {muted ? 'Play sound' : 'Mute'}
            </motion.span>
          </motion.div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-3 sm:p-5">
          <div className="frost pointer-events-auto flex items-center gap-1 rounded-full bg-black/45 p-1 pr-3.5 ring-1 ring-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause showreel' : 'Play showreel'}
              className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <span className="font-mono text-[11px] tabular-nums tracking-[0.08em] text-white/80">
              <span ref={timeRef}>0:00</span> / {formatTime(REEL.duration)}
            </span>
          </div>
          <div className="frost pointer-events-auto flex items-center gap-1 rounded-full bg-black/45 p-1 ring-1 ring-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              aria-label={muted ? 'Turn sound on' : 'Mute sound'}
              className="flex h-9 items-center gap-2 rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/10"
            >
              {muted ? <SoundOff size={15} /> : <SoundOn size={15} />}
              <span className="hidden sm:inline">{muted ? 'Sound off' : 'Sound on'}</span>
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Watch fullscreen"
              className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <Expand size={15} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {needsGesture && (
            <motion.button
              type="button"
              key="gesture"
              onClick={startWithSound}
              aria-label="Play showreel with sound"
              className="absolute inset-0 z-30 grid place-items-center bg-black/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="flex items-center gap-3 rounded-full bg-amber px-6 py-3.5 text-[15px] font-medium text-ink shadow-[0_20px_60px_-20px_rgba(245,158,11,0.7)]">
                <Play size={14} /> Play showreel
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="shell mt-6">
        <div
          className="grid gap-2 sm:gap-3"
          style={{ gridTemplateColumns: CHAPTERS.map((c, i) => `${(chapterEnd(i) - c.start).toFixed(2)}fr`).join(' ') }}
        >
          {CHAPTERS.map((c, i) => (
            <button
              key={c.label}
              type="button"
              onClick={() => seek(i)}
              aria-label={`Jump to chapter ${i + 1}: ${c.label}`}
              className="group min-w-0 py-2 text-left"
            >
              <span className="relative block h-[2px] overflow-hidden rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                <span
                  ref={(el) => {
                    fillRefs.current[i] = el
                  }}
                  className="absolute inset-0 origin-left scale-x-0 bg-amber"
                />
              </span>
              <span
                className={`eyebrow mt-3 hidden items-baseline gap-2 transition-colors md:flex ${
                  i === chapter ? 'text-fg' : 'text-dim group-hover:text-muted'
                }`}
              >
                <span>{pad(i + 1)}</span>
                <span className="truncate">{c.label}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="eyebrow mt-2 text-muted md:hidden" aria-live="off">
          {pad(chapter + 1)} / {pad(CHAPTERS.length)} — {CHAPTERS[chapter].label}
        </p>
      </div>
    </section>
  )
}

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Section, SectionHeader } from './Sections'
import { ParticleButton } from './ParticleButton'
import { useSpaceBackdrop } from './SpaceBackdrop'

// Phones held upright get the 9:16 cut of the reel; everything wider gets 16:9.
const PORTRAIT_QUERY = '(max-aspect-ratio: 2/3)'
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

// H.264 MP4 first (Safari/iOS and most browsers); VP9 WebM for Chromium
// builds that ship without proprietary codecs.
const CUTS = {
  landscape: {
    mp4: '/reel/showreel-16x9.mp4',
    webm: '/reel/showreel-16x9.webm',
    poster: '/reel/showreel-16x9.webp',
    endPoster: '/reel/showreel-16x9-end.webp',
  },
  portrait: {
    mp4: '/reel/showreel-9x16.mp4',
    webm: '/reel/showreel-9x16.webm',
    poster: '/reel/showreel-9x16.webp',
    endPoster: '/reel/showreel-9x16-end.webp',
  },
}

const DURATION = 15
// Both cuts share one timeline; chapter starts (seconds) were read off the
// rendered frames.
const CHAPTERS = [
  { start: 0, label: 'Data' },
  { start: 3.7, label: 'Language' },
  { start: 5.75, label: 'Agents' },
  { start: 7.5, label: 'Products' },
  { start: 9, label: 'Models that ship' },
  { start: 11.25, label: 'Stack' },
  { start: 12.75, label: 'Ayush Das' },
]
const chapterEnd = (i: number) => CHAPTERS[i + 1]?.start ?? DURATION
const pad = (n: number) => String(n).padStart(2, '0')

// Same frosted surface as the nav (MinimalNav).
const GLASS = {
  background: 'rgba(15,15,17,0.72)',
  backdropFilter: 'blur(18px) saturate(160%)',
  WebkitBackdropFilter: 'blur(18px) saturate(160%)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
}

type ReelVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${pad(s % 60)}`
}

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.4-7.2a.8.8 0 0 0 0-1.4L8.2 4.1a.8.8 0 0 0-1.2.7Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="4.5" width="4" height="15" rx="1" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" />
    </svg>
  )
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" stroke="none" />
      {on ? <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /> : <path d="m16 9.5 5 5M21 9.5l-5 5" />}
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  )
}

/**
 * The 15 s showreel, sized so the whole frame fits on screen: the 16:9 cut on
 * landscape screens, the 9:16 cut on phones held upright. Plays muted while
 * in view and pauses when scrolled away; clicking the picture turns sound on
 * (restarting from the top the first time). Controls sit in a bar under the
 * frame so nothing covers the reel itself. Reduced motion never autoplays.
 */
export function Showreel() {
  useSpaceBackdrop('showreel')
  const portrait = useMediaQuery(PORTRAIT_QUERY)
  const reduced = useMediaQuery(REDUCED_QUERY)
  const cut = portrait ? CUTS.portrait : CUTS.landscape

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

  const play = useCallback((video: HTMLVideoElement) => {
    video.play().catch((err: DOMException) => {
      // AbortError: a pause() (scrolled away) interrupted this play() — expected.
      if (err.name === 'AbortError') return
      // NotAllowedError: autoplay blocked (low-power mode, browser policy).
      if (err.name === 'NotAllowedError') {
        setNeedsGesture(true)
        return
      }
      console.warn('Showreel playback failed', err)
    })
  }, [])

  // Progress fills and the clock are painted straight to the DOM each frame
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
      // iPhone Safari only lets the <video> element itself go fullscreen.
      video.webkitEnterFullscreen?.()
    }
  }

  // Sized from the viewport height so the whole frame, plus the control bar
  // under it, fits on screen at once.
  const frameWidth = portrait
    ? 'min(100%, calc((100svh - 210px) * 9 / 16))'
    : 'min(100%, calc((100svh - 190px) * 16 / 9))'

  return (
    <Section id="showreel" fadeTop>
      <SectionHeader index="00" title="Showreel" />
      <p className="-mt-4 mb-6 font-mono text-[12px] uppercase tracking-wider text-white/45 sm:-mt-6">
        15 seconds · click the reel for sound
      </p>

      <div
        ref={frameRef}
        className="reel-frame relative mx-auto overflow-hidden rounded-2xl"
        style={{
          width: frameWidth,
          aspectRatio: portrait ? '9 / 16' : '16 / 9',
          background: '#08070e',
          boxShadow: '0 30px 80px -30px rgba(0,0,0,0.9)',
        }}
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
          className="absolute inset-0 h-full w-full object-cover"
          onClick={toggleSound}
        >
          <source src={cut.mp4} type="video/mp4" />
          <source src={cut.webm} type="video/webm" />
        </video>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }}
        />
        {needsGesture && (
          <div className="absolute inset-0 grid place-items-center" style={{ background: 'rgba(7,7,15,0.35)' }}>
            <ParticleButton label="Play showreel ▶" ariaLabel="Play showreel with sound" onClick={startWithSound} />
          </div>
        )}
      </div>

      <div className="mx-auto mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[18px] p-1.5" style={{ width: frameWidth, ...GLASS }}>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause showreel' : 'Play showreel'}
          className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <span className="font-mono text-[12px] tabular-nums text-white/70">
          <span ref={timeRef}>0:00</span> / {formatTime(DURATION)}
          <span className="text-white/45 sm:hidden"> · {CHAPTERS[chapter].label}</span>
        </span>

        <div
          className="order-first grid w-full gap-1.5 px-2 pt-1.5 sm:order-none sm:w-auto sm:flex-1 sm:gap-2 sm:px-3 sm:pt-0"
          style={{ gridTemplateColumns: CHAPTERS.map((c, i) => `${(chapterEnd(i) - c.start).toFixed(2)}fr`).join(' ') }}
        >
          {CHAPTERS.map((c, i) => (
            <button
              key={c.label}
              type="button"
              onClick={() => seek(i)}
              aria-label={`Jump to chapter ${i + 1}: ${c.label}`}
              className="group min-w-0 py-1.5 text-left sm:pb-1 sm:pt-2"
            >
              <span className="relative block h-[2px] overflow-hidden rounded-full bg-white/15 transition-colors group-hover:bg-white/25">
                <span
                  ref={(el) => {
                    fillRefs.current[i] = el
                  }}
                  className="absolute inset-0 origin-left scale-x-0 bg-[#f59e0b]"
                />
              </span>
              <span
                className={`mt-1.5 hidden truncate font-mono text-[10px] uppercase tracking-[0.12em] transition-colors md:block ${
                  i === chapter ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                }`}
              >
                {c.label}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={muted ? 'Turn sound on' : 'Mute sound'}
          className="ml-auto flex h-9 items-center gap-2 rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/10 sm:ml-0"
        >
          {muted && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f59e0b]" aria-hidden />
          )}
          <SoundIcon on={!muted} />
          <span className="hidden lg:inline">{muted ? 'Sound off' : 'Sound on'}</span>
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Watch fullscreen"
          className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
        >
          <ExpandIcon />
        </button>
      </div>
    </Section>
  )
}

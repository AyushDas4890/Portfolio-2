import { useEffect, useRef, useState } from 'react'
import { useTypewriter } from './useTypewriter'
import {
  About,
  Certificates,
  ExperienceSection,
  Footer,
  Work,
} from './Sections'
import { CaseStudies } from './CaseStudies'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4'

const BRAND = 'Ayush Das'
const EMAIL = 'das.ayush4890@gmail.com'
const LINKEDIN = 'https://linkedin.com/in/ayushdas4890'
const RESUME =
  'https://portfolio-website-zeta-topaz-84.vercel.app/Ayush_Das_ML_Resume.pdf'

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'contact', label: 'Contact' },
]
const SECTION_IDS = SECTIONS.map((s) => s.id)

const PILLS = [
  { label: 'See the work', href: '#work', external: false },
  { label: 'Case studies', href: '#/case-studies', external: false },
  { label: 'Résumé', href: RESUME, external: true },
  { label: 'Connect on LinkedIn', href: LINKEDIN, external: true },
]

const TYPEWRITER_TEXT =
  'I build end-to-end ML, NLP and Generative AI systems — multi-agent research pipelines, legal document intelligence, models that ship.'

function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTime = useRef(0)
  const seeking = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Map cursor position across the timeline: cursor left/top → early frames,
    // right/bottom → late frames. The clip is the head turning, so the avatar
    // "looks toward" the cursor. onSeeked chases a moved target to avoid
    // flooding the decoder with seeks on every mousemove.
    const seek = () => {
      if (!video.duration) return
      if (Math.abs(video.currentTime - targetTime.current) < 0.005) {
        seeking.current = false
        return
      }
      seeking.current = true
      video.currentTime = targetTime.current
    }

    const center = () => {
      if (!video.duration) return
      targetTime.current = video.duration / 2
      video.currentTime = video.duration / 2
    }

    const onMove = (e: MouseEvent) => {
      if (!video.duration) return
      // Blend horizontal (primary) and vertical cursor position into the timeline.
      const fx = e.clientX / window.innerWidth
      const fy = e.clientY / window.innerHeight
      const frac = Math.max(0, Math.min(1, fx * 0.7 + fy * 0.3))
      targetTime.current = frac * video.duration
      if (!seeking.current) seek()
    }

    const onSeeked = () => seek()

    video.addEventListener('loadedmetadata', center)
    if (video.readyState >= 1) center()
    window.addEventListener('mousemove', onMove)
    video.addEventListener('seeked', onSeeked)
    return () => {
      video.removeEventListener('loadedmetadata', center)
      window.removeEventListener('mousemove', onMove)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [])

  return (
    <>
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 z-0 h-full w-full"
        style={{ objectFit: 'cover', objectPosition: '70% center' }}
      />
      {/* Light, mostly-even scrim so the avatar stays visible across the whole
          page, with a touch more darkness on the left for hero legibility. */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(7,7,15,0.7) 0%, rgba(7,7,15,0.35) 45%, rgba(7,7,15,0.15) 100%)',
        }}
      />
    </>
  )
}

// Highlights the nav item for whichever section is crossing the viewport middle.
function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids])

  return active
}

function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  const bar = 'block w-6 h-[2px] bg-white transition-all duration-300'
  return (
    <button
      type="button"
      aria-label="Toggle menu"
      onClick={onClick}
      className="flex flex-col md:hidden"
      style={{ gap: '5px' }}
    >
      <span
        className={bar}
        style={open ? { transform: 'translateY(7px) rotate(45deg)' } : undefined}
      />
      <span className={bar} style={open ? { opacity: 0 } : undefined} />
      <span
        className={bar}
        style={
          open ? { transform: 'translateY(-7px) rotate(-45deg)' } : undefined
        }
      />
    </button>
  )
}

// Floating segmented pill nav — the active section reads as a white pill that
// slides between items (a shared moving highlight, not a per-item toggle).
function PillNav({ active }: { active: string }) {
  return (
    <div
      className="hidden items-center gap-1 rounded-full border p-1.5 md:flex"
      style={{
        borderColor: 'rgba(255,255,255,0.12)',
        background: 'rgba(10,10,15,0.55)',
        backdropFilter: 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
      }}
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="relative rounded-full px-4 py-1.5 text-[14px] transition-colors duration-300"
            style={{
              color: isActive ? '#000' : 'rgba(255,255,255,0.7)',
              background: isActive ? '#fff' : 'transparent',
            }}
          >
            {s.label}
          </a>
        )
      })}
    </div>
  )
}

function Navbar({
  onToggleMenu,
  menuOpen,
  active,
}: {
  onToggleMenu: () => void
  menuOpen: boolean
  active: string
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 z-10 flex w-full items-center justify-between px-5 py-4 sm:px-8 sm:py-5"
      style={{
        background: scrolled ? 'rgba(10,10,15,0.45)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'background 0.4s ease, backdrop-filter 0.4s ease',
      }}
    >
      <a href="#home" className="flex items-center gap-3">
        <span
          className="text-[21px] tracking-tight text-white sm:text-[26px]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {BRAND}
        </span>
        <span
          className="select-none text-[25px] text-white sm:text-[30px]"
          style={{ letterSpacing: '-0.02em' }}
        >
          &#10035;&#xFE0E;
        </span>
      </a>

      {/* Centered floating pill nav */}
      <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        <PillNav active={active} />
      </div>

      <a
        href={`mailto:${EMAIL}`}
        className="hidden text-[16px] text-white underline underline-offset-2 transition-opacity hover:opacity-60 md:inline"
      >
        Get in touch
      </a>

      <Hamburger open={menuOpen} onClick={onToggleMenu} />
    </nav>
  )
}

function MobileOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9] flex flex-col justify-center gap-8 bg-black/90 px-8 backdrop-blur-md transition-opacity duration-300 md:hidden"
      style={{
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={onClose}
          className="text-[32px] font-medium text-white"
        >
          {s.label}
        </a>
      ))}
      <a
        href={`mailto:${EMAIL}`}
        onClick={onClose}
        className="text-[32px] font-medium text-white underline underline-offset-2"
      >
        Get in touch
      </a>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" />
      <rect x="1.5" y="1.5" width="7" height="7" rx="1" stroke="currentColor" />
    </svg>
  )
}

function ActionPills({ visible }: { visible: boolean }) {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Clipboard write failed', err)
    }
  }

  const base =
    'inline-flex items-center justify-center rounded-full text-[13px] sm:text-[15px] min-h-[44px] px-4 sm:px-5 py-2 mx-1 mb-2 whitespace-nowrap touch-manipulation'

  return (
    <div
      className="flex flex-wrap gap-2 sm:gap-3"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      {PILLS.map((pill) => (
        <a
          key={pill.label}
          href={pill.href}
          {...(pill.external ? { target: '_blank', rel: 'noreferrer' } : {})}
          className={`${base} border border-white/20 bg-white text-black transition-all duration-200 hover:bg-[#60a5fa] hover:text-black hover:border-[#60a5fa] active:scale-[0.96] shadow-sm`}
        >
          {pill.label}
        </a>
      ))}

      <button
        type="button"
        onClick={copyEmail}
        className={`${base} gap-2 border border-white/40 bg-black/40 backdrop-blur-md text-white transition-all duration-200 hover:bg-white hover:text-black active:scale-[0.96] sm:gap-3`}
      >
        <span>
          Reach me:{' '}
          <span className="underline underline-offset-2 text-[#93c5fd]">{EMAIL}</span>
        </span>
        <CopyIcon />
        {copied ? <span className="text-[11px] font-mono text-[#f59e0b]">Copied!</span> : null}
      </button>
    </div>
  )
}

function Hero() {
  const { displayed, done } = useTypewriter(TYPEWRITER_TEXT)
  const [pillsVisible, setPillsVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPillsVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      id="home"
      className="relative z-[1] flex min-h-screen flex-col justify-end overflow-hidden px-5 pb-12 pt-24 sm:px-8 md:justify-center md:px-10 md:py-0"
    >
      <div className="relative z-10 max-w-xl">
        <div className="mb-3 select-none font-mono text-[11px] uppercase tracking-[0.25em] text-[#93c5fd] sm:mb-4 sm:text-[13px]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b] mr-2 animate-pulse" />
          AI / ML Engineer · Generative Intelligence
        </div>

        <p
          className="mb-6 text-white fluid-hero"
          style={{
            fontWeight: 400,
            minHeight: '60px',
            textShadow: '0 2px 20px rgba(0,0,0,0.85)',
          }}
        >
          {displayed}
          {!done && (
            <span
              className="ml-[2px] inline-block h-[1.1em] w-[2px] bg-[#60a5fa] align-middle"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
          )}
        </p>

        <ActionPills visible={pillsVisible} />
      </div>
    </section>
  )
}

// Minimal hash router — no dependency. '#/case-studies' or '#/case-studies/:id'
// shows the case studies page; anything else is the main page.
function useHashRoute() {
  const [hash, setHash] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash : '',
  )
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const active = useScrollSpy(SECTION_IDS)
  const hash = useHashRoute()

  const onCaseStudies = hash.startsWith('#/case-studies')
  const caseTarget = onCaseStudies
    ? hash.replace('#/case-studies', '').replace('/', '') || undefined
    : undefined

  return (
    <>
      <BackgroundVideo />
      {onCaseStudies ? (
        <CaseStudies targetId={caseTarget} />
      ) : (
        <>
          <Navbar
            menuOpen={menuOpen}
            onToggleMenu={() => setMenuOpen((o) => !o)}
            active={active}
          />
          <MobileOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
          <main className="relative z-[1]">
            <Hero />
            <About />
            <Work />
            <ExperienceSection />
            <Certificates />
            <Footer />
          </main>
        </>
      )}
    </>
  )
}

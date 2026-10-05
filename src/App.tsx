import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  About,
  Certificates,
  ExperienceSection,
  Footer,
  Work,
} from './Sections'
import { CaseStudies } from './CaseStudies'
import {
  gsap,
  ScrollTrigger,
  SplitText,
  prefersReducedMotion,
  scrollToSection,
} from './lib/motion'
import { LogoMark } from './LogoMark'
import { MinimalNav } from './MinimalNav'
import { IntroReveal } from './IntroReveal'
import { SmoothScroll } from './SmoothScroll'
import { CursorFX } from './CursorFX'
import { ParticleButton } from './ParticleButton'
import { DynamicInfo } from './DynamicInfo'
import { DepthTunnel } from './DepthTunnel'
import { SpaceBackdrop } from './SpaceBackdrop'
import { LINKS } from './content'

// H.264, every frame a keyframe: plays in every browser (the original HEVC
// encode failed in Firefox and many Chrome setups) and seeks instantly, which
// keeps the cursor-driven head turn smooth.
const VIDEO_SRC = '/avatar-head.mp4'

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
const SECTION_IDS = ['intro', ...SECTIONS.map((s) => s.id)]

const PILLS = [
  { label: 'See the work', href: '#work', external: false },
  { label: 'Case studies', href: '#/case-studies', external: false },
  { label: 'Résumé', href: RESUME, external: true },
  { label: 'Connect on LinkedIn', href: LINKEDIN, external: true },
]

const HERO_TEXT =
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
    <div id="bg-video" className="pointer-events-none fixed inset-0 z-0" style={{ willChange: 'clip-path' }}>
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full"
        style={{ objectFit: 'cover', objectPosition: '70% center' }}
      />
      {/* Light, mostly-even scrim so the avatar stays visible across the whole
          page, with a touch more darkness on the left for hero legibility. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(7,7,15,0.7) 0%, rgba(7,7,15,0.35) 45%, rgba(7,7,15,0.15) 100%)',
        }}
      />
    </div>
  )
}

// Highlights the nav item for whichever section is crossing the viewport middle.
// Highlights the nav item for whichever section has crossed the upper-middle of
// the viewport. Polled on the GSAP ticker (a few times a second) rather than via
// scroll events or IntersectionObserver: ScrollSmoother keeps easing content
// after the last native scroll event, and sections mount after this hook runs.
function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState('home')

  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = (frame + 1) % 6
      if (frame) return
      const line = window.innerHeight * 0.45
      let current = 'home'
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id === 'intro' ? 'home' : id
      }
      setActive(current)
    }
    gsap.ticker.add(check)
    return () => gsap.ticker.remove(check)
  }, [ids])

  return active
}

function Brand() {
  return (
    <a
      href="#home"
      data-chrome
      onClick={(e) => {
        e.preventDefault()
        scrollToSection('home')
      }}
      className="fixed left-5 top-5 z-50 hidden items-center gap-3 sm:left-8 sm:top-6 md:flex"
    >
      <span
        className="text-[21px] tracking-tight text-white sm:text-[24px]"
        style={{ fontFamily: 'var(--font-heading)', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}
      >
        {BRAND}
      </span>
      <LogoMark className="h-[20px] w-[20px] text-white" />
    </a>
  )
}

function ActionPills({ visible }: { visible: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const copiedRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || !visible) return
    const items = container.querySelectorAll('.pill-item')

    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0, scale: 1 })
      return
    }
    gsap.fromTo(
      items,
      { opacity: 0, y: 14, scale: 0.92 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: 'back.out(1.6)',
        stagger: 0.08,
      },
    )
  }, [visible])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      const el = copiedRef.current
      if (!el) return
      if (prefersReducedMotion()) {
        el.textContent = 'Copied!'
        setTimeout(() => {
          el.textContent = ''
        }, 1500)
        return
      }
      gsap.to(el, { duration: 0.4, text: 'Copied!', ease: 'none' })
      gsap.delayedCall(1.6, () => gsap.to(el, { duration: 0.3, text: '', ease: 'none' }))
    } catch (err) {
      console.error('Clipboard write failed', err)
    }
  }

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2 sm:gap-3">
      {PILLS.map((pill) => {
        const inPage = !pill.external && pill.href.startsWith('#') && !pill.href.startsWith('#/')
        return (
          <div
            key={pill.label}
            className="pill-item mx-1 mb-2"
            style={{ opacity: visible ? undefined : 0 }}
          >
            <ParticleButton
              label={pill.label}
              href={inPage ? undefined : pill.href}
              newTab={pill.external}
              onClick={inPage ? () => scrollToSection(pill.href.slice(1)) : undefined}
              particleColor="#f87171"
            />
          </div>
        )
      })}

      <div className="pill-item mx-1 mb-2 flex items-center gap-2" style={{ opacity: visible ? undefined : 0 }}>
        <ParticleButton
          label={`Reach me: ${EMAIL}`}
          ariaLabel={`Copy email address ${EMAIL}`}
          variant="glass"
          onClick={copyEmail}
        />
        <span ref={copiedRef} aria-live="polite" className="font-mono text-[11px] text-[#f59e0b]" />
      </div>
    </div>
  )
}

function Hero() {
  const [pillsVisible, setPillsVisible] = useState(false)
  const badgeRef = useRef<HTMLDivElement>(null)
  const badgeTextRef = useRef<HTMLSpanElement>(null)
  const promptRef = useRef<HTMLParagraphElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // As the page scrolls on to About, the hero copy drifts toward the camera
  // and dissolves rather than scrolling off as a block.
  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content || prefersReducedMotion()) return
    const tween = gsap.to(content, {
      scale: 1.18,
      yPercent: -18,
      opacity: 0,
      ease: 'none',
      transformOrigin: '0% 100%',
      scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'top -45%', scrub: true },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  useEffect(() => {
    const prompt = promptRef.current
    if (!prompt) return

    if (prefersReducedMotion()) {
      gsap.set(prompt, { opacity: 1 })
      setPillsVisible(true)
      return
    }

    // Chars start invisible via inline CSS below; SplitText only needs to
    // read structure, not hide anything itself.
    const split = new SplitText(prompt, { type: 'words,chars' })
    gsap.set(prompt, { opacity: 1 })

    gsap.set(badgeRef.current, { opacity: 0 })
    gsap.set(split.chars, { opacity: 0 })
    // Plays as the hero rises out of the intro reveal, not on mount — on first
    // load the hero is ~2 screens below the pinned intro.
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => setPillsVisible(true),
    })
    tl.fromTo(
      badgeRef.current,
      { opacity: 0, y: -14 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
    )
      .to(
        badgeTextRef.current,
        {
          duration: 1,
          scrambleText: {
            text: 'AI / ML Engineer · Generative Intelligence',
            chars: 'upperCase',
            speed: 0.5,
          },
          ease: 'none',
        },
        '-=0.2',
      )
      .fromTo(
        split.chars,
        { opacity: 0, yPercent: 70 },
        { opacity: 1, yPercent: 0, duration: 0.5, stagger: 0.012, ease: 'power2.out' },
        '-=0.4',
      )

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 70%',
      once: true,
      onEnter: () => tl.play(),
    })

    return () => {
      trigger.kill()
      tl.kill()
      split.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative z-[1] flex min-h-screen flex-col justify-end overflow-hidden px-5 pb-12 pt-24 sm:px-8 md:justify-center md:px-10 md:py-0"
      // Pulled up over the end of the pinned depth tunnel so the hero rises in
      // as the flight clears, instead of after a blank screen.
      style={prefersReducedMotion() ? undefined : { marginTop: '-100vh' }}
    >
      <div ref={contentRef} className="relative z-10 max-w-xl">
        <div
          ref={badgeRef}
          className="mb-3 select-none font-mono text-[11px] uppercase tracking-[0.25em] text-[#fdba74] sm:mb-4 sm:text-[13px]"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b] mr-2 animate-pulse" />
          <span ref={badgeTextRef}>AI / ML Engineer · Generative Intelligence</span>
        </div>

        <p
          ref={promptRef}
          className="mb-6 text-white fluid-hero"
          style={{
            fontWeight: 400,
            minHeight: '60px',
            textShadow: '0 2px 20px rgba(0,0,0,0.85)',
            opacity: 0,
          }}
        >
          {HERO_TEXT}
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
  const active = useScrollSpy(SECTION_IDS)
  const hash = useHashRoute()

  const onCaseStudies = hash.startsWith('#/case-studies')
  const caseTarget = onCaseStudies
    ? hash.replace('#/case-studies', '').replace('/', '') || undefined
    : undefined

  return (
    <>
      <BackgroundVideo />
      <SpaceBackdrop />
      <CursorFX />
      {onCaseStudies ? (
        <CaseStudies targetId={caseTarget} />
      ) : (
        <>
          <Brand />
          <MinimalNav sections={SECTIONS} active={active} />
          <DynamicInfo
            name={BRAND}
            role="AI / ML Engineer"
            initials="AD"
            image="/avatar.jpg"
            github={LINKS.github}
            linkedin={LINKS.linkedin}
            email={LINKS.email}
          />
          <SmoothScroll>
          <main className="relative z-[1]">
            <IntroReveal />
            <DepthTunnel />
            <Hero />
            <About />
            <Work />
            <ExperienceSection />
            <Certificates />
            <Footer />
          </main>
          </SmoothScroll>
        </>
      )}
    </>
  )
}

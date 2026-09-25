import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { gsap } from './lib/motion'

const SPRING = { type: 'spring', bounce: 0.35, duration: 0.7 } as const

function formatIST() {
  return new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.27 2.38 4.27 5.47v6.27ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

export interface DynamicInfoProps {
  name: string
  role: string
  initials: string
  image?: string
  available?: boolean
  github: string
  linkedin: string
  email: string
}

/**
 * Floating profile card (adapted from the "Dynamic Info" Framer component).
 * Collapsed: initials avatar, name, role and Ayush's local time. Click to
 * expand the social links + availability badge. Only shown while the hero is
 * on screen so it never sits on top of section content further down.
 */
export function DynamicInfo({
  name,
  role,
  initials,
  image,
  available = true,
  github,
  linkedin,
  email,
}: DynamicInfoProps) {
  const [open, setOpen] = useState(false)
  const [time, setTime] = useState(formatIST)
  const [inHero, setInHero] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    const tick = window.setInterval(() => setTime(formatIST()), 15_000)
    return () => window.clearInterval(tick)
  }, [])

  useEffect(() => {
    // Polled on the GSAP ticker: with ScrollSmoother the page keeps moving after
    // the last scroll event, so a scroll listener leaves this stale.
    let frame = 0
    let last: boolean | null = null
    const check = () => {
      frame = (frame + 1) % 6
      if (frame) return
      // Only while the hero itself is on screen (the intro reveal sits above it).
      const box = document.getElementById('home')?.getBoundingClientRect()
      const visible = !!box && box.top < window.innerHeight * 0.5 && box.bottom > window.innerHeight * 0.45
      if (visible === last) return
      last = visible
      setInHero(visible)
      if (!visible) setOpen(false)
    }
    gsap.ticker.add(check)
    return () => gsap.ticker.remove(check)
  }, [])

  const socials = [
    { label: 'GitHub', href: github, icon: <GitHubIcon />, external: true },
    { label: 'LinkedIn', href: linkedin, icon: <LinkedInIcon />, external: true },
    { label: 'Email', href: `mailto:${email}`, icon: <MailIcon />, external: false },
  ]

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {inHero && (
          <motion.div
            key="dynamic-info"
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-40 hidden md:block"
          >
            <motion.div
              layout
              transition={SPRING}
              onMouseLeave={() => setOpen(false)}
              className="overflow-hidden border"
              style={{
                width: open ? 300 : 248,
                borderRadius: open ? 26 : 20,
                borderColor: 'rgba(255,255,255,0.12)',
                background: 'rgba(12,12,18,0.84)',
                backdropFilter: 'blur(18px) saturate(120%)',
                WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                boxShadow: '0 18px 50px -20px rgba(0,0,0,0.8)',
              }}
            >
              <motion.button
                layout="position"
                type="button"
                aria-expanded={open}
                aria-label={open ? 'Collapse profile card' : 'Expand profile card'}
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center gap-3 p-2.5 text-left"
              >
                <span
                  className="flex h-[36px] w-[36px] shrink-0 items-center justify-center overflow-hidden rounded-full text-[13px] text-white"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    background: 'linear-gradient(135deg, #f87171, #1e3a8a)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.35)',
                  }}
                >
                  {image && !imageFailed ? (
                    <img
                      src={image}
                      alt=""
                      onError={() => setImageFailed(true)}
                      className="h-full w-full scale-110 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[14px] text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                    {name}
                  </span>
                  <span className="block truncate text-[12px] text-white/55">{role}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-white/70">
                  {time}
                  <span className="ml-1 text-white/35">IST</span>
                </span>
              </motion.button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        {socials.map((social, i) => (
                          <motion.a
                            key={social.label}
                            href={social.href}
                            aria-label={social.label}
                            {...(social.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i, duration: 0.25 }}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            {social.icon}
                          </motion.a>
                        ))}
                      </div>

                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]"
                        style={{
                          color: available ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                          background: available ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${available ? 'animate-pulse bg-[#f59e0b]' : 'bg-white/40'}`}
                        />
                        {available ? 'Open to work' : 'Unavailable'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}

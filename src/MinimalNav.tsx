import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { ScrollProgressRing } from './ScrollProgressRing'
import { scrollToSection } from './lib/motion'
import { LINKS } from './content'

export interface NavSection {
  id: string
  label: string
}

const EASE = [0.22, 1, 0.36, 1] as const
const TEXT_EASE = [0.22, 0.61, 0.36, 1] as const

function useIstTime() {
  const format = () =>
    new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false })
  const [time, setTime] = useState(format)
  useEffect(() => {
    const id = window.setInterval(() => setTime(format()), 15_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

// Per-character blur-in, the text effect the original nav uses on its toggle label.
function AppearText({ text }: { text: string }) {
  return (
    <motion.span
      key={text}
      className="inline-flex"
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={{ show: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
      aria-label={text}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden
          variants={{
            hidden: { opacity: 0, y: 10, filter: 'blur(6px)', scale: 0.98 },
            show: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, transition: { duration: 0.5, ease: TEXT_EASE } },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

function SocialIcon({ kind }: { kind: 'github' | 'linkedin' | 'email' }) {
  if (kind === 'github')
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    )
  if (kind === 'linkedin')
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.27 2.38 4.27 5.47v6.27ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45Z" />
      </svg>
    )
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

/**
 * Minimal floating nav (rebuild of Framer "Motion Minimal Navs", dark variant).
 * Closed it's a compact card: burger + "Menu" and, on the right, the scroll
 * progress ring and Ayush's local time. Open, the card widens and a panel
 * drops in with the section links, secondary links and socials.
 */
export function MinimalNav({ sections, active }: { sections: NavSection[]; active: string }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const time = useIstTime()

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

  const go = (id: string) => {
    setOpen(false)
    scrollToSection(id)
  }

  const item = (i: number) => ({
    initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: 0.12 + i * 0.04, duration: 0.45, ease: EASE } },
  })

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        data-chrome
        className="fixed left-1/2 top-3 z-50 -translate-x-1/2 sm:top-4"
      >
        <motion.nav
          aria-label="Primary"
          layout
          initial={false}
          animate={{ width: open ? 360 : 280, borderRadius: open ? 26 : 24 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-[calc(100vw-24px)] overflow-hidden p-2"
          style={{
            background: 'rgba(15,15,17,0.72)',
            backdropFilter: 'blur(18px) saturate(160%)',
            WebkitBackdropFilter: 'blur(18px) saturate(160%)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 20px 50px -24px rgba(0,0,0,0.85)',
          }}
        >
          <motion.div
            layout="position"
            className="flex items-center justify-between rounded-[18px] py-2 pl-4 pr-2"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <button
              type="button"
              aria-expanded={open}
              aria-controls="nav-panel"
              onClick={() => setOpen((o) => !o)}
              className="flex h-9 items-center gap-2.5 text-[15px] text-white"
            >
              <motion.span
                className="relative block h-5 w-5"
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                aria-hidden
              >
                <motion.span
                  className="absolute left-[1px] h-px w-[18px] rounded bg-white"
                  animate={{ top: open ? 9 : 6, rotate: open ? 45 : 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
                <motion.span
                  className="absolute left-[1px] h-px w-[18px] rounded bg-white"
                  animate={{ top: open ? 9 : 12, rotate: open ? -45 : 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </motion.span>
              <AnimatePresence mode="wait" initial={false}>
                <AppearText key={open ? 'close' : 'menu'} text={open ? 'Close' : 'Menu'} />
              </AnimatePresence>
            </button>

            <div className="flex items-center gap-2">
              <ScrollProgressRing />
              <span className="select-none px-1.5 font-mono text-[13px] tabular-nums text-white/55">
                {time}
              </span>
            </div>
          </motion.div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id="nav-panel"
                key="panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-5 px-[18px] pb-6 pt-8">
                  <div>
                    <motion.p {...item(0)} className="pb-1.5 text-[13px] text-white/40">
                      Menu
                    </motion.p>
                    <ul>
                      {sections.map((s, i) => {
                        const isActive = active === s.id
                        return (
                          <motion.li key={s.id} {...item(i + 1)}>
                            <a
                              href={`#${s.id}`}
                              aria-current={isActive ? 'true' : undefined}
                              onClick={(e) => {
                                e.preventDefault()
                                go(s.id)
                              }}
                              className="group flex h-10 items-center justify-between"
                            >
                              <span
                                className="text-[22px] transition-all duration-300 group-hover:translate-x-1.5"
                                style={{
                                  fontFamily: 'var(--font-heading)',
                                  letterSpacing: '-0.01em',
                                  color: isActive ? '#fff' : 'rgba(255,255,255,0.62)',
                                }}
                              >
                                {s.label}
                              </span>
                              <span
                                className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                                style={{
                                  background: isActive ? '#f59e0b' : 'transparent',
                                  boxShadow: isActive ? '0 0 10px rgba(245,158,11,0.7)' : 'none',
                                }}
                              />
                            </a>
                          </motion.li>
                        )
                      })}
                    </ul>
                  </div>

                  <motion.div {...item(sections.length + 1)} className="h-px w-full bg-white/[0.08]" />

                  <div>
                    <motion.p {...item(sections.length + 2)} className="pb-1 text-[13px] text-white/40">
                      Elsewhere
                    </motion.p>
                    <motion.a
                      {...item(sections.length + 3)}
                      href="#/case-studies"
                      onClick={() => setOpen(false)}
                      className="flex h-[30px] items-center text-[15px] text-white/70 transition-colors hover:text-white"
                    >
                      Case studies
                    </motion.a>
                    <motion.a
                      {...item(sections.length + 4)}
                      href={LINKS.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-[30px] items-center text-[15px] text-white/70 transition-colors hover:text-white"
                    >
                      Résumé ↗
                    </motion.a>
                  </div>

                  <div>
                    <motion.p {...item(sections.length + 5)} className="pb-2 text-[13px] text-white/40">
                      Social media
                    </motion.p>
                    <motion.div {...item(sections.length + 6)} className="flex items-center gap-1.5">
                      {(
                        [
                          ['github', LINKS.github, 'GitHub'],
                          ['linkedin', LINKS.linkedin, 'LinkedIn'],
                          ['email', `mailto:${LINKS.email}`, 'Email'],
                        ] as const
                      ).map(([kind, href, name]) => (
                        <a
                          key={kind}
                          href={href}
                          aria-label={name}
                          {...(kind === 'email' ? {} : { target: '_blank', rel: 'noreferrer' })}
                          className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                          style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }}
                        >
                          <SocialIcon kind={kind} />
                        </a>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </MotionConfig>
  )
}

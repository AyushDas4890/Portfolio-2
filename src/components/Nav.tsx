import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { LINKS } from '../content'
import { lockScroll, scrollToId, scrollToTop } from '../lib/motion'
import { ArrowUpRight, GitHub, LinkedIn, Mail } from './Icons'
import { LogoMark } from './LogoMark'

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'contact', label: 'Contact' },
]

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Fixed top bar: clear over the hero, frosted once the page moves, tucked away
 * while scrolling down and back on the way up. Below lg the links move into a
 * full-screen sheet.
 */
export function Nav({ active, onHome }: { active: string | null; onHome: boolean }) {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    setHidden(y > previous && y > 420)
  })

  useEffect(() => {
    if (!open) return
    lockScroll(true)
    firstLinkRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
    }
  }, [open])

  // On the home page, links scroll in place; elsewhere the hash change routes
  // home and App scrolls to the section.
  const go = (id: string) => (e: MouseEvent) => {
    const wasOpen = open
    setOpen(false)
    if (!onHome) return
    e.preventDefault()
    const run = () => (id === 'home' ? scrollToTop() : scrollToId(id))
    // Let the menu's scroll lock release first.
    if (wasOpen) requestAnimationFrame(run)
    else run()
  }

  const solid = scrolled || open || !onHome

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          solid ? 'frost bg-bg/75 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl' : 'bg-transparent'
        }`}
        initial={false}
        animate={{ y: hidden && !open ? '-100%' : '0%' }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <div className="shell flex h-[var(--nav-h)] items-center justify-between gap-6">
          <a
            href="#home"
            onClick={go('home')}
            className="flex items-center gap-2 text-[17px] font-medium tracking-[-0.02em] text-fg"
            aria-label="Ayush Das — home"
          >
            Ayush Das
            <LogoMark className="h-[15px] w-[15px] text-amber" />
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.id
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={go(item.id)}
                      aria-current={isActive ? 'location' : undefined}
                      className={`relative isolate block rounded-full px-3.5 py-2 text-[14px] transition-colors duration-300 ${
                        isActive ? 'text-fg' : 'text-muted hover:text-fg'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-white/[0.08]"
                          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        />
                      )}
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={LINKS.resume}
              target="_blank"
              rel="noreferrer"
              className="hidden h-10 items-center gap-1.5 rounded-full px-4 text-[14px] text-fg ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/[0.06] sm:inline-flex"
            >
              Résumé <ArrowUpRight size={14} />
            </a>
            <a
              href="#contact"
              onClick={go('contact')}
              className="hidden h-10 items-center rounded-full bg-amber px-4 text-[14px] font-medium text-ink transition-colors hover:bg-amber-soft lg:inline-flex"
            >
              Let&apos;s talk
            </a>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="flex h-10 items-center gap-3 rounded-full pl-4 pr-3 text-[14px] text-fg ring-1 ring-inset ring-white/15 lg:hidden"
            >
              {open ? 'Close' : 'Menu'}
              <span className="relative block h-3 w-4" aria-hidden>
                <motion.span
                  className="absolute left-0 h-px w-4 bg-current"
                  initial={false}
                  animate={open ? { top: 6, rotate: 45 } : { top: 2, rotate: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                />
                <motion.span
                  className="absolute left-0 h-px w-4 bg-current"
                  initial={false}
                  animate={open ? { top: 6, rotate: -45 } : { top: 10, rotate: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="menu"
            className="fixed inset-0 z-40 flex flex-col bg-bg pt-[var(--nav-h)] lg:hidden"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.7, ease: EASE_IN_OUT }}
          >
            <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black_70%)]" />
            <nav aria-label="Menu" className="shell relative flex flex-1 flex-col justify-between overflow-y-auto pb-10 pt-6">
              <ul>
                {NAV_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ y: 48, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.18 + i * 0.06, duration: 0.8, ease: EASE_OUT }}
                    className="border-b border-white/[0.08]"
                  >
                    <a
                      ref={i === 0 ? firstLinkRef : undefined}
                      href={`#${item.id}`}
                      onClick={go(item.id)}
                      className="heading flex items-baseline gap-4 py-4 text-[clamp(34px,10vw,52px)] text-fg"
                    >
                      <span className="eyebrow text-amber">{pad(i + 1)}</span>
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                className="mt-10 flex flex-col gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <a href={`mailto:${LINKS.email}`} className="text-[18px] text-fg">
                  {LINKS.email}
                </a>
                <div className="flex items-center gap-2">
                  {[
                    { href: LINKS.github, label: 'GitHub', Icon: GitHub },
                    { href: LINKS.linkedin, label: 'LinkedIn', Icon: LinkedIn },
                    { href: `mailto:${LINKS.email}`, label: 'Email', Icon: Mail },
                  ].map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      {...(href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noreferrer' })}
                      className="grid h-11 w-11 place-items-center rounded-full text-fg ring-1 ring-inset ring-white/15"
                    >
                      <Icon size={17} />
                    </a>
                  ))}
                  <a
                    href={LINKS.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex h-11 items-center gap-1.5 rounded-full bg-amber px-5 text-[15px] font-medium text-ink"
                  >
                    Résumé <ArrowUpRight size={14} />
                  </a>
                </div>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../components/Button'
import { Footer } from '../components/Footer'
import { Check, Copy } from '../components/Icons'
import { LogoMark } from '../components/LogoMark'
import { ABOUT, LINKS } from '../content'
import { useIstClock } from '../lib/hooks'
import { useReveal } from '../lib/reveal'

export function Contact() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const time = useIstClock()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(id)
  }, [copied])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email)
      setCopied(true)
    } catch (err) {
      // No clipboard access (permissions, insecure context): open the mail app instead.
      console.warn('Clipboard write failed, falling back to mailto', err)
      window.location.href = `mailto:${LINKS.email}`
    }
  }

  return (
    <section ref={ref} id="contact" className="relative overflow-hidden pt-[clamp(96px,12vw,180px)]">
      <div
        aria-hidden
        className="dot-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_80%_60%_at_15%_100%,black,transparent)]"
      />

      <div className="shell relative">
        <p data-reveal className="eyebrow flex items-center gap-3 text-muted">
          <LogoMark className="h-3.5 w-3.5 text-amber" />
          <span>06 / 06</span>
          <span className="h-px w-8 bg-current opacity-40" aria-hidden />
          <span>Contact</span>
        </p>
        {/* No React-managed children in here beyond static text: the split
            reveal re-parses the heading's HTML when it finishes. */}
        <h2 data-split className="display mt-6 text-[clamp(60px,11.4vw,184px)]">
          Let&apos;s build
          <br />
          something rare<span className="text-amber">.</span>
        </h2>

        <div className="mt-[clamp(40px,6vw,88px)] grid grid-cols-1 gap-10 border-t border-white/10 pt-10 lg:grid-cols-12 lg:items-end">
          <div data-reveal className="lg:col-span-7">
            <p className="eyebrow text-dim">Write to me</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <a href={`mailto:${LINKS.email}`} className="link-line heading text-[clamp(24px,3.2vw,46px)] text-fg">
                {LINKS.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] text-fg ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/[0.06]"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copied ? 'copied' : 'copy'}
                    className="inline-flex items-center gap-2"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {copied ? <Check size={14} className="text-amber" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </motion.span>
                </AnimatePresence>
              </button>
              <span className="sr-only" aria-live="polite">
                {copied ? 'Email address copied' : ''}
              </span>
            </div>
          </div>
          <div data-reveal className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Button href={LINKS.resume} external icon="external">
              Résumé (PDF)
            </Button>
            <Button href={LINKS.linkedin} external variant="ghost" icon="external">
              LinkedIn
            </Button>
            <Button href={LINKS.github} external variant="ghost" icon="external">
              GitHub
            </Button>
          </div>
        </div>

        <div data-reveal className="eyebrow mt-12 flex flex-wrap items-center justify-between gap-4 pb-[clamp(56px,8vw,112px)] text-muted">
          <span className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-amber shadow-[0_0_12px_rgba(245,158,11,0.8)]" aria-hidden />
            Open to work · replies within 24–48h
          </span>
          <span>
            <span className="tabular-nums">{time}</span> IST · {ABOUT.based}
          </span>
        </div>
      </div>

      <Footer />
    </section>
  )
}

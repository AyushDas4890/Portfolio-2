import { useRef, useState, type PointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight } from '../components/Icons'
import { SectionHeading } from '../components/SectionHeading'
import { CREDENTIALS, certificateThumb } from '../content'
import { useFinePointer } from '../lib/hooks'
import { useReveal } from '../lib/reveal'

const pad = (n: number) => String(n).padStart(2, '0')

// An editorial list rather than a wall of white certificate images; on
// desktop the certificate itself floats beside the cursor while a row is
// hovered.
export function Credentials() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const finePointer = useFinePointer()
  const [preview, setPreview] = useState<string | null>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.7 })
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.7 })
  const track = (e: PointerEvent) => {
    x.set(e.clientX)
    y.set(e.clientY)
  }
  const enter = (e: PointerEvent, href: string) => {
    if (!preview) {
      x.jump(e.clientX)
      y.jump(e.clientY)
      sx.jump(e.clientX)
      sy.jump(e.clientY)
    }
    setPreview(href)
  }

  const issuers = [...new Set(CREDENTIALS.map((c) => c.issuer))]

  return (
    <div className="bg-cream">
      <section ref={ref} id="credentials" className="relative rounded-t-[clamp(28px,4vw,56px)] bg-bg">
        <div className="shell py-[clamp(96px,12vw,180px)]">
          <SectionHeading
            index="05"
            label="Credentials"
            title="Credentials"
            aside={`${CREDENTIALS.length} certifications in AI, machine learning, generative AI and Python — from Microsoft, IBM, Google and ${
              issuers.length - 3
            } other issuers. Each row opens the original certificate.`}
          />

          <ul
            className="mt-[clamp(48px,6vw,88px)] border-t border-white/10"
            onPointerMove={finePointer ? track : undefined}
            onPointerLeave={() => setPreview(null)}
          >
            {CREDENTIALS.map((c, i) => (
              <li key={c.href} data-reveal className="border-b border-white/10">
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  onPointerEnter={finePointer ? (e) => enter(e, c.href) : undefined}
                  className="group flex items-center gap-5 py-5 sm:gap-8 sm:py-6"
                >
                  <span className="eyebrow hidden w-8 shrink-0 text-dim sm:block">{pad(i + 1)}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-8">
                    <span className="eyebrow shrink-0 text-muted sm:w-52">{c.issuer}</span>
                    <span className="heading text-[clamp(19px,1.9vw,27px)] text-fg transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                      {c.title}
                    </span>
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted ring-1 ring-inset ring-white/10 transition-[transform,background-color,color] duration-500 ease-out-expo group-hover:rotate-45 group-hover:bg-amber group-hover:text-ink group-hover:ring-0">
                    <ArrowUpRight size={15} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {finePointer && (
          <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-30" style={{ x: sx, y: sy }}>
            <AnimatePresence>
              {preview && (
                <motion.img
                  key={preview}
                  src={certificateThumb(preview)}
                  alt=""
                  className="absolute left-8 top-0 w-[300px] max-w-none rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
                  style={{ y: '-50%' }}
                  initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  )
}

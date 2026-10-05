import { useLayoutEffect, useRef } from 'react'
import { AvatarPortrait } from '../components/AvatarPortrait'
import { SectionHeading } from '../components/SectionHeading'
import { ABOUT } from '../content'
import { ScrollTrigger, SplitText, gsap, prefersReducedMotion } from '../lib/motion'
import { useReveal } from '../lib/reveal'

// Words light up as the paragraph scrolls through the reading zone (and dim
// again on the way back up).
function Statement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const split = SplitText.create(el, { type: 'words' })
      gsap.fromTo(
        split.words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: true },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [text])

  return (
    <p ref={ref} className="heading text-[clamp(26px,2.75vw,42px)] leading-[1.18] text-fg">
      {text}
    </p>
  )
}

// Counts up to the stat once it enters view, keeping any suffix ("6+") and
// the decimal places ("8.08").
function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const match = value.match(/^([\d.]+)(.*)$/)
    if (!el || !match || prefersReducedMotion()) return
    const [, digits, suffix] = match
    const target = parseFloat(digits)
    const decimals = digits.includes('.') ? digits.split('.')[1].length : 0
    const state = { n: 0 }
    const render = () => {
      el.textContent = state.n.toFixed(decimals) + suffix
    }
    render()
    const tween = gsap.to(state, { n: target, duration: 1.9, ease: 'expo.out', paused: true, onUpdate: render })
    const trigger = ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => tween.play() })
    return () => {
      trigger.kill()
      tween.kill()
      el.textContent = value
    }
  }, [value])

  return (
    <span ref={ref} className="display block text-[clamp(52px,6.2vw,96px)] tabular-nums text-fg">
      {value}
    </span>
  )
}

export function About() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const [degree, school] = ABOUT.education.split(' · ')

  const facts = [
    { label: 'Education', value: `${degree} — ${school}` },
    { label: 'Focus', value: ABOUT.focus },
    { label: 'Based in', value: ABOUT.based },
  ]

  return (
    <section ref={ref} id="about" className="relative pb-[clamp(96px,12vw,180px)]">
      <div className="shell">
        <SectionHeading
          index="01"
          label="About"
          title={
            <>
              Explainable.
              <br />
              Measured. Shipped.
            </>
          }
        />

        <div className="mt-[clamp(48px,7vw,104px)] grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-10">
          <div data-reveal className="lg:col-span-5">
            <AvatarPortrait />
          </div>
          <div className="flex flex-col justify-between gap-12 lg:col-span-7 lg:pl-8">
            <Statement text={ABOUT.blurb} />
            <dl data-reveal className="border-t border-white/10">
              {facts.map((f) => (
                <div key={f.label} className="grid gap-1 border-b border-white/10 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <dt className="eyebrow pt-1 text-dim">{f.label}</dt>
                  <dd className="text-[16px] leading-relaxed text-muted">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <ul className="mt-[clamp(56px,8vw,112px)] grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ABOUT.stats.map((s) => (
            <li
              key={s.label}
              data-reveal
              className="amber-edge rounded-2xl border border-white/[0.08] bg-raise px-5 pb-5 pt-6 sm:px-7 sm:pb-7 sm:pt-8"
            >
              <Counter value={s.value} />
              <p className="eyebrow mt-3 text-muted">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

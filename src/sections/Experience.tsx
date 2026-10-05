import { useRef } from 'react'
import { ArrowUpRight } from '../components/Icons'
import { SectionHeading } from '../components/SectionHeading'
import { ABOUT, EXPERIENCE } from '../content'
import { useReveal } from '../lib/reveal'

// A cream sheet, like the reel's "Agents" frame, sliding up over the dark page.
export function Experience() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const [degree, school] = ABOUT.education.split(' · ')

  return (
    <section ref={ref} id="experience" className="relative rounded-t-[clamp(28px,4vw,56px)] bg-cream text-ink">
      <div className="shell py-[clamp(96px,12vw,180px)]">
        <SectionHeading
          tone="light"
          index="04"
          label="Experience"
          title="Experience"
          aside={`Two internships at VanillaKart — Android and web — alongside a ${degree.replace(',', ' in')}.`}
        />

        <ol className="mt-[clamp(48px,6vw,88px)] border-t border-ink/15">
          {EXPERIENCE.map((e) => (
            <li key={e.role} data-reveal className="grid grid-cols-1 gap-x-8 gap-y-4 border-b border-ink/15 py-9 sm:py-11 md:grid-cols-12">
              <p className="eyebrow flex items-start gap-3 text-ink-muted md:col-span-3 md:pt-3">
                <span className="mt-[3px] h-2 w-2 shrink-0 bg-amber" aria-hidden />
                {e.period}
              </p>
              <div className="md:col-span-7">
                <h3 className="heading text-[clamp(26px,2.6vw,38px)]">{e.role}</h3>
                <p className="mt-2 text-[15px] text-ink-muted">
                  {e.org}
                  {e.suborg && <> · {e.suborg}</>}
                </p>
                <p className="mt-4 max-w-[62ch] text-[16px] leading-[1.65] text-ink/80">{e.description}</p>
              </div>
              <div className="md:col-span-2 md:pt-3 md:text-right">
                <a
                  href={e.certificate}
                  target="_blank"
                  rel="noreferrer"
                  className="link-line inline-flex items-center gap-1.5 text-[14px] font-medium"
                >
                  Certificate <ArrowUpRight size={14} />
                </a>
              </div>
            </li>
          ))}

          <li data-reveal className="grid grid-cols-1 gap-x-8 gap-y-4 border-b border-ink/15 py-9 sm:py-11 md:grid-cols-12">
            <p className="eyebrow flex items-start gap-3 text-ink-muted md:col-span-3 md:pt-3">
              <span className="mt-[3px] h-2 w-2 shrink-0 bg-ink" aria-hidden />
              Education
            </p>
            <div className="md:col-span-7">
              <h3 className="heading text-[clamp(26px,2.6vw,38px)]">{degree}</h3>
              <p className="mt-2 text-[15px] text-ink-muted">{school}</p>
              <p className="mt-4 max-w-[62ch] text-[16px] leading-[1.65] text-ink/80">Focus: {ABOUT.focus}.</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  )
}

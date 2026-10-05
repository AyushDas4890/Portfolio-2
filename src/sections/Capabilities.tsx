import { useRef } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { CAPABILITIES } from '../content'
import { useReveal } from '../lib/reveal'

const pad = (n: number) => String(n).padStart(2, '0')

// The reel's four chapters as an index. Hovering a row floods it amber from
// the bottom, like the reel's stack frame turning over.
export function Capabilities() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section ref={ref} id="capabilities" className="relative pb-[clamp(96px,12vw,180px)]">
      <div className="shell">
        <SectionHeading
          index="02"
          label="What I do"
          title={
            <>
              From data
              <br />
              to product.
            </>
          }
          aside="The four chapters the showreel moves through — each one backed by shipped work further down the page."
        />

        <ol className="mt-[clamp(48px,6vw,88px)] border-t border-white/10">
          {CAPABILITIES.map((c, i) => (
            <li key={c.word} data-reveal className="group relative overflow-hidden border-b border-white/10">
              <div
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-amber transition-transform duration-700 ease-out-expo group-hover:scale-y-100"
              />
              <div className="relative grid items-center gap-x-8 gap-y-3 py-7 sm:py-9 md:grid-cols-12">
                <span className="eyebrow text-amber transition-colors duration-500 group-hover:text-ink md:col-span-2">
                  {pad(i + 1)} / {pad(CAPABILITIES.length)}
                </span>
                <h3 className="display text-[clamp(56px,8.2vw,132px)] text-fg transition-[color,transform] duration-700 ease-out-expo group-hover:translate-x-3 group-hover:text-ink md:col-span-6">
                  {c.word}
                </h3>
                <div className="md:col-span-4">
                  <p className="text-[17px] leading-snug text-muted transition-colors duration-500 group-hover:text-ink sm:text-[19px]">
                    {c.caption}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {c.tools.map((t) => (
                      <li
                        key={t}
                        className="eyebrow rounded-full px-3 py-1.5 text-muted ring-1 ring-inset ring-white/15 transition-colors duration-500 group-hover:text-ink group-hover:ring-ink/25"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

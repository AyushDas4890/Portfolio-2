import { useRef, type CSSProperties } from 'react'
import { STACK } from '../content'
import { useReveal } from '../lib/reveal'

const pad = (n: number) => String(n).padStart(2, '0')

// Full-bleed amber band: the reel's "stack in orbit" grid, same eight tools in
// the same order, black marks on amber.
export function Stack() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section ref={ref} id="stack" aria-labelledby="stack-title" className="relative bg-amber text-ink">
      <div className="shell grid grid-cols-1 gap-12 py-[clamp(72px,9vw,128px)] lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-4">
          <p data-reveal className="eyebrow flex items-center gap-3">
            <span className="h-2 w-2 bg-ink" aria-hidden />
            Stack in orbit
          </p>
          <h2 id="stack-title" data-split className="display mt-6 text-[clamp(48px,5.6vw,88px)]">
            Tools of
            <br />
            the trade.
          </h2>
        </div>

        <ul className="grid grid-cols-2 border-l border-t border-ink/15 sm:grid-cols-4 lg:col-span-8">
          {STACK.map((tool, i) => (
            <li
              key={tool.name}
              data-reveal
              className="group flex aspect-[5/4] flex-col justify-between border-b border-r border-ink/15 p-4 transition-colors duration-500 hover:bg-ink hover:text-amber sm:aspect-square sm:p-5"
            >
              <div className="flex items-start justify-between">
                <span
                  role="img"
                  aria-label={tool.name}
                  className="icon-mask h-8 w-8 transition-transform duration-700 ease-out-expo group-hover:scale-110 sm:h-9 sm:w-9"
                  style={{ '--icon': `url(/tech/mono/${tool.icon}.svg)` } as CSSProperties}
                />
                <span className="font-mono text-[11px] opacity-60">{pad(i + 1)}</span>
              </div>
              <span className="eyebrow" aria-hidden>
                {tool.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

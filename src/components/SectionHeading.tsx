import type { ReactNode } from 'react'

const TOTAL = '06'

/**
 * "■ 03 / 06 — Work" label (the reel's chapter counter) above a display
 * heading that rises in line by line (see useReveal).
 */
export function SectionHeading({
  index,
  label,
  title,
  aside,
  tone = 'dark',
  className = '',
}: {
  index: string
  label: string
  title: ReactNode
  aside?: ReactNode
  tone?: 'dark' | 'light'
  className?: string
}) {
  const muted = tone === 'dark' ? 'text-muted' : 'text-ink-muted'
  return (
    <header className={`grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-12 lg:items-end ${className}`}>
      <div className="lg:col-span-8">
        <p data-reveal className={`eyebrow flex items-center gap-3 ${muted}`}>
          <span className="h-2 w-2 bg-amber" aria-hidden />
          <span>
            {index} / {TOTAL}
          </span>
          <span className="h-px w-8 bg-current opacity-40" aria-hidden />
          <span>{label}</span>
        </p>
        <h2 data-split className="display mt-6 text-[clamp(52px,8.4vw,132px)]">
          {title}
        </h2>
      </div>
      {aside && (
        <div data-reveal className={`text-[16px] leading-[1.6] sm:text-[17px] lg:col-span-4 lg:pb-3 ${muted}`}>
          {aside}
        </div>
      )}
    </header>
  )
}

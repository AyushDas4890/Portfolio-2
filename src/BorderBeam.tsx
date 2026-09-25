import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

// Lightswind UI "border-beam" (npx lightswind add border-beam), trimmed to the
// props this site uses. A short gradient comet runs along the parent's
// rounded border; the parent needs `position: relative` and a border-radius.
export function BorderBeam({
  size = 70,
  duration = 7,
  delay = 0,
  colorFrom = '#f87171',
  colorTo = '#f59e0b',
}: {
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
}) {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className="absolute aspect-square bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent"
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            '--color-from': colorFrom,
            '--color-to': colorTo,
          } as CSSProperties
        }
        initial={{ offsetDistance: '0%' }}
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration, delay: -delay }}
      />
    </div>
  )
}

import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { gsap, prefersReducedMotion } from './lib/motion'

// Staggered 3D letter swap: each character starts flipped back on its
// baseline (rotateX -100deg) and swings up into place, staggered left to
// right. Needs `perspective` on the wrapper for the flip to read as 3D
// rather than a flat scale.
export function LetterSwap({
  text,
  className,
  style,
}: {
  text: string
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const chars = el.children

    if (prefersReducedMotion()) {
      gsap.set(chars, { opacity: 1, rotateX: 0 })
      return
    }

    const tween = gsap.fromTo(
      chars,
      { opacity: 0, rotateX: -100 },
      {
        opacity: 1,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.035,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [text])

  const NBSP = ' '

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-block', perspective: 400, ...style }}
    >
      {text.split('').map((ch, i) => (
        <span
          key={i}
          style={{ display: 'inline-block', transformOrigin: '50% 100%' }}
        >
          {ch === ' ' ? NBSP : ch}
        </span>
      ))}
    </span>
  )
}

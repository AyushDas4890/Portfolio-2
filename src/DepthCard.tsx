import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from './lib/motion'

export interface DepthCardItem {
  id: string
  index: string
  title: string
  tagline: string
  image?: string
  accent: string
}

// Project card: a clip-path "curtain" wipes the image in left-to-right as it
// scrolls into view, then a slow Ken-Burns drift + hover zoom on the image,
// with the caption sliding up under it. Landscape aspect ratio matches real
// screenshots instead of cropping them into a portrait frame.
export function DepthCard({ item }: { item: DepthCardItem }) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return

    if (prefersReducedMotion()) {
      gsap.set(card, { clipPath: 'inset(0 0% 0 0)' })
      return
    }

    const tween = gsap.fromTo(
      card,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.9,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  useEffect(() => {
    const card = cardRef.current
    const image = imageRef.current
    const caption = captionRef.current
    if (!card || !image || !caption || prefersReducedMotion()) return

    const setScale = gsap.quickTo(image, 'scale', { duration: 0.6, ease: 'power3.out' })
    const setCaptionY = gsap.quickTo(caption, 'y', { duration: 0.5, ease: 'power3.out' })

    const onEnter = () => {
      setScale(1.08)
      setCaptionY(-6)
    }
    const onLeave = () => {
      setScale(1)
      setCaptionY(0)
    }

    card.addEventListener('pointerenter', onEnter)
    card.addEventListener('pointerleave', onLeave)
    return () => {
      card.removeEventListener('pointerenter', onEnter)
      card.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <a
      ref={cardRef}
      href={`#/case-studies/${item.id}`}
      className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10"
    >
      <div
        ref={imageRef}
        className="absolute inset-0"
        style={{
          background: item.image
            ? `#000 center/cover no-repeat url(${item.image})`
            : `linear-gradient(160deg, ${item.accent}40, #0a0a10)`,
          willChange: 'transform',
        }}
      >
        {!item.image && (
          <span
            aria-hidden
            className="absolute -right-3 -top-6 select-none text-[130px] font-bold leading-none text-white/10"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {item.index}
          </span>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

      <div
        aria-hidden
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${item.accent}80` }}
      />

      <div ref={captionRef} className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-white/55">
              {item.index}
            </p>
            <h3
              className="mb-1 text-[19px] leading-tight text-white sm:text-[22px]"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}
            >
              {item.title}
            </h3>
            <p className="text-[13px] leading-snug text-white/70">{item.tagline}</p>
          </div>
          <span
            aria-hidden
            className="mb-1 shrink-0 font-mono text-[18px] text-white/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
          >
            →
          </span>
        </div>
      </div>
    </a>
  )
}

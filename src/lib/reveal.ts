import { useLayoutEffect, type RefObject } from 'react'
import { EASE, ScrollTrigger, SplitText, fontsReady, gsap, prefersReducedMotion } from './motion'

/**
 * Scroll-in reveals for everything inside `root`:
 *  - `[data-reveal]` rises and fades in; neighbours that enter together are
 *    staggered (ScrollTrigger.batch).
 *  - `[data-split]` headings rise line by line out of a mask. The split is
 *    made on enter (so line breaks match the real layout) and reverted when
 *    the animation ends, leaving plain text behind.
 * Reduced motion leaves everything in its natural, visible state.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return

    let cancelled = false
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', el)
      if (items.length) {
        gsap.set(items, { autoAlpha: 0, y: 36 })
        ScrollTrigger.batch(items, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.08, overwrite: true }),
        })
      }
      gsap.set(gsap.utils.toArray<HTMLElement>('[data-split]', el), { autoAlpha: 0 })
    }, el)

    // Line splitting needs final metrics, so wait for the web fonts.
    fontsReady().then(() => {
      if (cancelled) return
      ctx.add(() => {
        gsap.utils.toArray<HTMLElement>('[data-split]', el).forEach((heading) => {
          ScrollTrigger.create({
            trigger: heading,
            start: 'top 90%',
            once: true,
            // ctx.add so an unmount mid-animation also reverts the split.
            onEnter: () =>
              ctx.add(() => {
                const split = SplitText.create(heading, { type: 'lines', mask: 'lines', linesClass: 'split-line' })
                gsap.set(heading, { autoAlpha: 1 })
                gsap.from(split.lines, {
                  yPercent: 110,
                  duration: 1.25,
                  ease: EASE,
                  stagger: 0.09,
                  onComplete: () => split.revert(),
                })
              }),
          })
        })
      })
      ScrollTrigger.refresh()
    })

    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [root])
}

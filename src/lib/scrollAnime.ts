import { useLayoutEffect, type RefObject } from 'react'
import { createTimeline, type Timeline } from 'animejs'
import { gsap, ScrollTrigger, ScrollSmoother, prefersReducedMotion } from './motion'

type Options = { start?: string; end?: string; pin?: boolean }

/**
 * Scroll-scrubbed anime.js timeline. anime draws the motion; ScrollTrigger is
 * only the clock, because ScrollSmoother moves the page with a transform and
 * anime's own onScroll would read the un-smoothed native position.
 *
 * `build` adds tweens to a paused timeline whose length is arbitrary — it is
 * mapped onto the trigger's start→end range. Reduced motion skips it entirely,
 * so elements keep their natural, fully visible state.
 */
export function useScrollAnime<T extends HTMLElement>(
  ref: RefObject<T | null>,
  build: (tl: Timeline, el: T) => void | (() => void),
  { start = 'top 90%', end = 'top 40%', pin = false }: Options = {},
) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const tl = createTimeline({ autoplay: false, defaults: { ease: 'linear' } })
    const cleanup = build(tl, el)
    // Paint the start state now, before the first frame (seeking to the end
    // first makes every tween resolve its from-values).
    tl.seek(tl.duration).seek(0)

    // With ScrollSmoother the scroll position is already eased; without it
    // (touch, where it is off) ease progress here so scrubbing never steps.
    const eased = !ScrollSmoother.get()
    let target = 0
    let current = 0
    const follow = () => {
      current += (target - current) * 0.14
      if (Math.abs(target - current) < 0.0005) current = target
      tl.progress = current
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      pin,
      anticipatePin: pin ? 1 : 0,
      onUpdate: (self) => {
        target = self.progress
        if (!eased) tl.progress = target
      },
    })
    target = current = st.progress
    tl.progress = current
    if (eased) gsap.ticker.add(follow)

    return () => {
      if (eased) gsap.ticker.remove(follow)
      st.kill()
      tl.revert()
      cleanup?.()
    }
    // build is inline at every call site; the element and range are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, start, end, pin])
}

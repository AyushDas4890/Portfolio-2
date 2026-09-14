import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ScrollSmoother, ScrollTrigger, prefersReducedMotion } from './lib/motion'

/**
 * Wraps the page in GSAP ScrollSmoother. Children render only once the
 * smoother exists, because ScrollTriggers created before it (the intro pin,
 * the timeline scrub) would measure against the un-smoothed page.
 *
 * Anything position: fixed must live outside this wrapper — the content
 * element is transformed, which would otherwise make it the containing block.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const touch = window.matchMedia('(hover: none)').matches
    if (prefersReducedMotion() || touch || !wrapperRef.current || !contentRef.current) {
      setReady(true)
      return
    }
    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 1.1,
      smoothTouch: false,
      effects: false,
    })
    // Focus changes, find-in-page and scrollIntoView scroll the overflow-hidden
    // wrapper itself rather than the page, which desyncs everything. Fold any
    // such offset back into the smoother's own scroll position.
    const wrapper = wrapperRef.current
    const onWrapperScroll = () => {
      const offset = wrapper.scrollTop
      if (!offset) return
      wrapper.scrollTop = 0
      smoother.scrollTop(smoother.scrollTop() + offset)
    }
    wrapper.addEventListener('scroll', onWrapperScroll)
    setReady(true)
    return () => {
      wrapper.removeEventListener('scroll', onWrapperScroll)
      smoother.kill()
      ScrollTrigger.refresh()
    }
  }, [])

  // Children just mounted: re-measure so pins and scrubs see the real height.
  useEffect(() => {
    if (!ready) return
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [ready])

  return (
    <div ref={wrapperRef} id="smooth-wrapper">
      <div ref={contentRef} id="smooth-content">
        {ready ? children : null}
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'

// Fires once when the element scrolls into view. Used to drive entrance reveals
// that start from opacity/transform and settle with a critically-damped ease.
export function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px', ...options },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { ref, inView }
}

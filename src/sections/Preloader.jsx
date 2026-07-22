import { useEffect, useRef, useState } from 'react'
import { gsap, reducedMotion } from '../lib/motion.js'

export default function Preloader({ onDone }) {
  const seen = typeof window !== 'undefined' && sessionStorage.getItem('pl-seen')
  const [active, setActive] = useState(!seen && !reducedMotion)
  const rootRef = useRef(null)
  const countRef = useRef(null)

  useEffect(() => {
    if (!active) { onDone?.(); return }
    sessionStorage.setItem('pl-seen', '1')

    const state = { n: 1 }
    const tl = gsap.timeline({
      onComplete: () => { setActive(false); onDone?.() },
    })
    tl.to(state, {
      n: 100,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.round(state.n)).padStart(2, '0')
      },
    })
    tl.to(rootRef.current, { autoAlpha: 0, duration: 0.7, ease: 'power2.inOut' }, '+=0.15')

    const skip = () => tl.progress(1)
    window.addEventListener('click', skip)
    window.addEventListener('keydown', skip)
    return () => {
      window.removeEventListener('click', skip)
      window.removeEventListener('keydown', skip)
      tl.kill()
    }
  }, [active, onDone])

  if (!active) return null
  return (
    <div className="preloader" ref={rootRef} role="status" aria-label="Loading">
      <span className="count" ref={countRef}>01</span>
      <span className="caps">AYUSH DAS — PORTFOLIO</span>
    </div>
  )
}

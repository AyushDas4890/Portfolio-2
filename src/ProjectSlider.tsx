import { useLayoutEffect, useRef } from 'react'
import { gsap, Draggable, prefersReducedMotion } from './lib/motion'
import { DepthCard, type DepthCardItem } from './DepthCard'

const SPEED_PX_PER_SEC = 55

// Infinite auto-scrolling slider: the item list is rendered twice back to
// back, and the track animates by exactly one set's pixel width with a
// wrapping modifier — so the loop point is invisible regardless of where a
// drag or the constant-speed tween leaves it. Pauses on hover; Draggable +
// InertiaPlugin let you grab and fling it, wrapped the same way mid-throw.
export function ProjectSlider({ items }: { items: DepthCardItem[] }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    const viewport = viewportRef.current
    if (!track || !viewport) return

    const half = track.children.length / 2
    const gap = parseFloat(getComputedStyle(track).columnGap || '0')
    let loopWidth = gap * half
    for (let i = 0; i < half; i++) {
      loopWidth += (track.children[i] as HTMLElement).getBoundingClientRect().width
    }

    if (prefersReducedMotion() || loopWidth === 0) return

    const wrapX = gsap.utils.wrap(-loopWidth, 0)
    const auto = gsap.to(track, {
      x: `-=${loopWidth}`,
      duration: loopWidth / SPEED_PX_PER_SEC,
      ease: 'none',
      repeat: -1,
      modifiers: { x: gsap.utils.unitize(wrapX) },
    })

    const onEnter = () => auto.pause()
    const onLeave = () => auto.resume()
    viewport.addEventListener('pointerenter', onEnter)
    viewport.addEventListener('pointerleave', onLeave)

    const applyWrap = () => {
      gsap.set(track, { x: wrapX(Number(gsap.getProperty(track, 'x'))) })
    }

    const draggables = Draggable.create(track, {
      type: 'x',
      inertia: true,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onPress: () => auto.pause(),
      onDrag: applyWrap,
      onThrowUpdate: applyWrap,
      onRelease() {
        if (!this.isThrowing) auto.resume()
      },
      onThrowComplete: () => auto.resume(),
    })

    return () => {
      viewport.removeEventListener('pointerenter', onEnter)
      viewport.removeEventListener('pointerleave', onLeave)
      auto.kill()
      draggables.forEach((d) => d.kill())
    }
  }, [items])

  return (
    <div
      ref={viewportRef}
      className="relative -mx-5 overflow-hidden px-5 sm:-mx-8 sm:px-8 md:-mx-10 md:px-10"
    >
      <div ref={trackRef} className="flex gap-5 sm:gap-6" style={{ width: 'max-content' }}>
        {[...items, ...items].map((item, i) => (
          <div key={`${item.id}-${i}`} className="w-[300px] shrink-0 sm:w-[360px] lg:w-[400px]">
            <DepthCard item={item} />
          </div>
        ))}
      </div>
    </div>
  )
}

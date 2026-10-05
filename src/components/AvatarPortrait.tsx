import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger, prefersReducedMotion } from '../lib/motion'
import { useFinePointer } from '../lib/hooks'

const MP4 = '/about/avatar-portrait.mp4'
const WEBM = '/about/avatar-portrait.webm'
const POSTER = '/about/avatar-portrait.webp'

/**
 * The reel's red "Models that ship." frame, made interactive: the felt
 * avatar's head follows the cursor across the window (or turns with scroll on
 * touch). The clip is all-intra, so every seek lands on a keyframe.
 */
export function AvatarPortrait() {
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const finePointer = useFinePointer()
  const [nearby, setNearby] = useState(false)

  // Fetch the clip only when the card is about to scroll into view.
  useEffect(() => {
    const card = cardRef.current
    if (!card || prefersReducedMotion()) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNearby(true)
        observer.disconnect()
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const card = cardRef.current
    if (!nearby || !video || !card) return

    let target = 0
    let seeking = false
    // Chase the latest target from `seeked` instead of seeking on every
    // pointer event, which would flood the decoder.
    const seek = () => {
      if (!video.duration || Math.abs(video.currentTime - target) < 0.01) {
        seeking = false
        return
      }
      seeking = true
      video.currentTime = target
    }
    const aimAt = (fraction: number) => {
      if (!video.duration) return
      target = Math.min(1, Math.max(0, fraction)) * (video.duration - 0.05)
      if (!seeking) seek()
    }
    const centre = () => aimAt(0.5)

    video.addEventListener('seeked', seek)
    video.addEventListener('loadedmetadata', centre)
    if (video.readyState >= 1) centre()

    if (finePointer) {
      // Only decode frames while the card is actually on screen.
      let onScreen = false
      const visibility = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting
      })
      visibility.observe(card)
      const onMove = (e: MouseEvent) => {
        if (onScreen) aimAt(e.clientX / window.innerWidth)
      }
      window.addEventListener('mousemove', onMove)
      return () => {
        visibility.disconnect()
        window.removeEventListener('mousemove', onMove)
        video.removeEventListener('seeked', seek)
        video.removeEventListener('loadedmetadata', centre)
      }
    }

    const trigger = ScrollTrigger.create({
      trigger: card,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => aimAt(self.progress),
    })
    return () => {
      trigger.kill()
      video.removeEventListener('seeked', seek)
      video.removeEventListener('loadedmetadata', centre)
    }
  }, [nearby, finePointer])

  return (
    <div
      ref={cardRef}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-wine"
      style={{ background: 'radial-gradient(120% 90% at 78% 28%, #d4002a 0%, #ad001e 38%, #6f0010 100%)' }}
    >
      {nearby ? (
        <video
          ref={videoRef}
          poster={POSTER}
          muted
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={MP4} type="video/mp4" />
          <source src={WEBM} type="video/webm" />
        </video>
      ) : (
        <img src={POSTER} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      )}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#4a000b]/80 to-transparent" />
      <p className="eyebrow absolute left-5 top-5 text-white/85 sm:left-7 sm:top-7">AI / ML Engineer</p>
      <p className="display absolute bottom-5 left-5 text-[clamp(34px,4.2vw,58px)] text-white sm:bottom-7 sm:left-7">
        Models
        <br />
        that ship.
      </p>
    </div>
  )
}

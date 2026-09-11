import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { Flip } from 'gsap/Flip'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { Observer } from 'gsap/Observer'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(
  ScrollTrigger,
  MotionPathPlugin,
  Flip,
  Draggable,
  InertiaPlugin,
  Observer,
  SplitText,
  ScrambleTextPlugin,
  DrawSVGPlugin,
  MorphSVGPlugin,
  CustomEase,
  ScrollToPlugin,
  TextPlugin,
)

// Single signature ease used across every section for continuity.
export const SITE_EASE = CustomEase.create('siteEase', 'M0,0 C0.16,1 0.3,1 1,1')

export {
  gsap,
  ScrollTrigger,
  MotionPathPlugin,
  Flip,
  Draggable,
  Observer,
  SplitText,
  DrawSVGPlugin,
  MorphSVGPlugin,
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// Smooth-scrolls to a section id using ScrollToPlugin + the shared ease,
// replacing native anchor jumps everywhere in the nav.
export function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  if (prefersReducedMotion()) {
    target.scrollIntoView()
    return
  }
  gsap.to(window, {
    duration: 1,
    scrollTo: { y: target, offsetY: 64 },
    ease: SITE_EASE,
  })
}

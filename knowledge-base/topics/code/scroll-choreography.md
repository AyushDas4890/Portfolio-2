---
id: 20260712-scroll-choreography
title: Scroll choreography v4
tags: [code]
created: 2026-07-12
updated: 2026-10-05
related: [20261005-showreel, 20260712-architecture]
summary: Lenis + ScrollTrigger wiring, reveal hooks, scrubbed effects, reduced motion.
---

# Scroll choreography v4

> Summary: Lenis + ScrollTrigger wiring, reveal hooks, scrubbed effects, reduced motion.

## Core (`src/lib/motion.ts`)
- Lenis (lerp .11) on fine-pointer, motion-allowed devices only; driven by `gsap.ticker`, `lenis.on('scroll', ScrollTrigger.update)`. Touch keeps native momentum scroll.
- Programmatic scrolls go through `scrollToId` / `scrollToTop`, which call `lenis.resize()` first — after a route change the page height changes in the same frame and Lenis would otherwise clamp to the old height.
- `lockScroll` (mobile menu) stops Lenis and sets `overflow: hidden` on `<html>`; `scrollToId(..., force)` still works while stopped.
- `section[id]` has `scroll-margin-top: var(--nav-h)`; Lenis honours it.

## Reveals (`src/lib/reveal.ts` → `useReveal(sectionRef)`)
- `[data-reveal]`: hidden on mount (autoAlpha 0, y 36), revealed in staggered batches on enter (`ScrollTrigger.batch`, once).
- `[data-split]`: headings split into masked lines on enter (after `fontsReady()`), rise 110%→0, then `split.revert()` so plain text remains. Keep them static text only.

## Per-section effects
- Hero: load timeline — words rise out of clip boxes, asterisk spins in, rule draws, copy fades up.
- Showreel: frame `scale` from hero-column width → 1 and radius 28 → 0 (full-bleed) scrubbed over `top bottom → top 12%`; see showreel note.
- About: statement words scrub from 16% → 100% opacity; stats count up once (GSAP tween on a plain object).
- Avatar portrait: cursor x (desktop) or scroll progress (touch) seeks the all-intra clip; `seeked` chases the latest target.
- Capabilities rows / stack cells / cards: CSS transitions only (`ease-out-expo`).

## Reduced motion
`prefersReducedMotion()` short-circuits every GSAP effect (content stays visible), no Lenis, reel never autoplays (end-card poster + play button), avatar shows its poster, global CSS collapses transitions. framer-motion follows via `<MotionConfig reducedMotion="user">`.

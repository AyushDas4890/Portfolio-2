---
id: 20260712-scroll-choreography
title: Scroll choreography
tags: [code]
created: 2026-07-12
updated: 2026-07-12
related: [20260712-hero-ring, 20260712-architecture]
summary: Lenis + ScrollTrigger wiring, stage object, mask reveals, tilt/sweep/parallax, reduced-motion.
---

# Scroll choreography

> Summary: Lenis + ScrollTrigger wiring, stage object, mask reveals, tilt/sweep/parallax, reduced-motion.

## Core (`src/lib/motion.js`)
- `stage = { progress, section, mx, my, intro, introDone }` — mutable, written by ScrollTrigger/pointermove/Nav observer, read by ring each tick. Never mirror into React state.
- `initMotion()`: global ScrollTrigger writes `stage.progress`; Lenis (lerp .075, wheelMultiplier .95) drives gsap ticker; returns destroy fn (App unmount). Reduced motion → no Lenis, triggers still track progress.
- `runIntro()` (called by Preloader onDone): tweens `stage.intro` 0→1 (1.7s power3.out) + dispatches `site:intro` window event. Ring scales/rises with intro; Hero listens for `site:intro` and staggers its mask lines (delay .55, stagger .18) so ring leads, name follows. Reduced motion: intro starts at 1.
- `maskReveal(rootEl, {stagger, delay})`: tweens `.mask-line > span` yPercent 115→0, once, start 'top 78%'. Markup: `<span class="mask-line"><span>…</span></span>`.
- `scrollToSection(id)`: Lenis scrollTo or native fallback.

## Per-component effects
- Hero/Contact/CaseBands: maskReveal on mount.
- Work cards (demo-faithful, see reference video frames): geometric SVG `MARKS` per slug in Work.jsx; card children `.tri/.mark/.dot/.meta/.base/.sweep`; artwork top-wipe via `clip-path: inset(0 0 100% 0)` → 0 on hover; `--pa` (palette.a) inline var recolors index + glowing `.base` line + corner ticks; `.work-backdrop` hairline frame + topo SVG data-URI fades in on wrap hover; tilt ±6° + y −8. Touch gets `.revealed` on cards AND wrap.
- 7 sections since About added: hero, about, work, case, experience, credentials, contact — SECTION_PALETTES in RingScene must stay length-7 and index-aligned with data.js `sections`.
- Case band: artwork `yPercent −10→0` scrubbed across band viewport transit (parallax inside overflow-hidden gradient frame).
- Preloader: gsap counter 1→100 (1.8s) + fade; sessionStorage `pl-seen` gate; click/key skips; reduced-motion skips entirely.

## Fade-through-dark
Sections use `.act-solid` gradient background (transparent → solid → transparent) so the fixed ring canvas shows between acts — cheap "dissolve" without opacity scrubs.

## Gotchas
- `document.fonts.ready.then(() => ScrollTrigger.refresh())` in App — Fraunces shifts metrics.
- Lenis swallows anchor jumps: use `scrollToSection`, not `href="#id"`.
- Headless verification: anchors don't scroll; use puppeteer-core `window.scrollTo` (see cowork-sandbox-quirks).

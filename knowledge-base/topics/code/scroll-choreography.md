---
id: 20260712-scroll-choreography
title: Scroll choreography
tags: [code]
created: 2026-07-12
updated: 2026-09-24
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

## anime.js scrubbed sections (2026-09-24)
- Below-hero sections use `useScrollAnime(ref, build, {start, end})` in `src/lib/scrollAnime.ts`: anime.js v4 timeline (paused), progress driven by a ScrollTrigger. Don't switch to anime's `onScroll` — ScrollSmoother moves content by transform, so native scroll position leads the visuals.
- Rule: `ref` is the trigger and must not be animated by its own timeline; animate descendants (a trigger measured with its own transform drifts).
- `Section` in `Sections.tsx`: `.section-in` (entrance) inside `.section-out` (exit), two timelines on separate elements so their transforms don't fight.
- Never animate the same element's transform from both GSAP and anime.
- `src/BorderBeam.tsx` is Lightswind's border-beam, vendored (Lightswind's `add` CLI rewrites tsconfig/vite/tailwind configs — fetch in a scratch dir instead).
- `.npmrc` has `legacy-peer-deps=true`: lightswind peers framer-motion ≤12, project is on 13.
- `src/DepthTunnel.tsx` (between IntroReveal and Hero): pinned 3D flight, `useScrollAnime(..., { pin: true, end: '+=500%' })`. anime animates `.tunnel-world` translateZ/rotateZ (camera) and per-stage opacity; stages sit at `-(i+1)*GAP` px, counter-rotated by `TWIST*(i+1)` so each word is upright on arrival; consecutive stages crossfade. Stage containers get opacity, so they are flattened (no 3D inside a stage) by design. Returns null under reduced motion. Pointer tilt uses anime `createAnimatable` on a separate wrapper.
- Order/overlaps: IntroReveal pins `+=130%` (clip fully open at ~92% of it). Tunnel wrapper has `marginTop: -100vh`, so its pin starts as the intro pin ends; it is transparent at both ends; in between an opaque `.tunnel-backdrop` (near-black maroon, red→amber core glow, scroll-rotated conic light streaks) hides the avatar video, plus a warm vignette, and its last ~20% is a clear tail. Hero keeps `marginTop: -100vh`, so it rises in over that clear tail. About keeps its top scrim fade (follows the unscrimmed hero). Hero copy scale-fades (GSAP scrub) as it scrolls on to About.
- Palette is warm site-wide (2026-09-24): accents `#f87171` (red) / `#fdba74` (light amber) / `#f59e0b` (amber) replaced the old blues. Below the hero, `src/SpaceBackdrop.tsx` (fixed `#space-bg`, outside SmoothScroll) fades the tunnel's backdrop in over the avatar video; its fade/spin is started from About via `useSpaceBackdrop('about')` because that trigger only exists once SmoothScroll children mount.
- About blurb: word-by-word scrubbed opacity (anime stagger), keywords in amber. Work keeps the LollipopCarousel (a pinned 3D rail was tried and rejected by the user); the strip opens via an anime clip-path scrub, and filter changes crossfade two strips with framer-motion AnimatePresence (sync mode, both absolute). Contact: GSAP velocity marquee (timeScale + skewX from ScrollTrigger velocity, decays on the ticker).

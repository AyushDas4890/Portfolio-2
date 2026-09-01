---
id: 20260712-architecture
title: Code architecture v2
tags: [code]
created: 2026-07-12
updated: 2026-07-12
related: [20260712-content-model, 20260712-hero-ring, 20260712-scroll-choreography]
summary: Router, file map, data flow, artwork fallbacks.
---

# Code architecture v2

> Summary: Router, file map, data flow, artwork fallbacks.

## Routing (`src/main.jsx`)
BrowserRouter: `/` → `App` (six-act scroll), `/work/:slug` → `pages/ProjectDetail`, `*` → redirect `/`. Vercel serves SPA fallback; `vite.config.js` uses `base: '/'` (NOT './' — relative base breaks nested routes).

## File map
- `src/App.jsx` — home composition + `initMotion()` lifecycle.
- `src/data.js` — ALL content (see content-model note).
- `src/lib/motion.js` — gsap/ScrollTrigger/Lenis singletons, `stage` object, `maskReveal`, `scrollToSection`.
- `src/three/RingScene.js` + `RingCanvas.jsx` — hero ring (see hero-ring note).
- `src/sections/` — Preloader, Nav, Hero, Work, CaseBands, Experience, Credentials, Contact.
- `src/pages/ProjectDetail.jsx` — banner/problem/approach/screenshots/next.

## Data flow
data.js exports → components import directly (no context/store). Nav's IntersectionObserver writes `stage.section`; RingCanvas reads `stage` each tick. No React state at 60fps.

## Fallbacks
- Missing artwork (`/artwork/<slug>.jpg`): work card hides `<img>` onError (monogram card remains, frames-5 look); case band swaps to palette radial gradient; detail banner swaps to `.banner-fallback`.
- WebGL fail: `RingScene.failed` → `.ring-poster` static gradient div.
- Unknown slug: `<Navigate to="/">`.

## Chunks
manualChunks: `three`, `motion` (gsap+lenis), `router`. Initial JS ≈ 29 kB gz + chunks.

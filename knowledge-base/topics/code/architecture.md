---
id: 20260712-architecture
title: Code architecture v3
tags: [code]
created: 2026-07-12
updated: 2026-11-07
related: [20260712-content-model, 20260712-hero-ring, 20260712-scroll-choreography]
summary: React 19 + Vite 8 + TS SPA — entry, hash routing, section list, file map, motion libs, chunks.
---

# Code architecture v3

> Summary: React 19 + Vite 8 + TypeScript SPA. One entry chunk, hash routing for case studies, GSAP ScrollSmoother page, avatar-video hero.

## Entry & routing
`index.html` → `src/main.tsx` (StrictMode) → `src/App.tsx`. No router library: `useHashRoute()` reads `location.hash`; `#/case-studies[/<id>]` renders `CaseStudies`, anything else renders the home page. Section anchors are plain `#work` etc.

## Home composition (`App.tsx`)
Fixed layers outside the smoother: `BackgroundVideo` (`#bg-video`, see hero note), `SpaceBackdrop` (warm space that fades in over the video from About on), `Brand`, `MinimalNav`, `DynamicInfo`. Inside `SmoothScroll` (GSAP ScrollSmoother; skipped on touch / reduced motion): `IntroReveal` → `DepthTunnel` → `Hero` → `About` → `Work` → `ExperienceSection` → `Certificates` → `Footer` (contact).
`SECTIONS` (home/about/work/experience/credentials/contact) drives the nav; `useScrollSpy(['intro', ...ids])` polls on the GSAP ticker (not IntersectionObserver — ScrollSmoother eases content after scroll events).

## File map
- `src/content.ts` — all copy and links (`LINKS`, projects, experience, credentials). Résumé links point at the local `/Ayush_Das_ML_Resume.pdf`.
- `src/Sections.tsx` — section components; Work uses `LollipopCarousel` + `GooeyDropdown` filter; credentials use `CertificateCoverflow` / `ThreadTimeline`; contact uses `ContactOrbit`.
- `src/lib/motion.ts` — gsap + 14 registered plugins, `SITE_EASE`, `prefersReducedMotion`, `scrollToSection`.
- `src/lib/scrollAnime.ts` — `useScrollAnime`: anime.js timelines scrubbed by ScrollTrigger.
- `src/index.css` — tokens + Tailwind layers.

## Motion libraries (all three ship)
- gsap: everything scroll-driven (smoother, pins, SplitText).
- animejs — blocks dropping it: `Sections.tsx`, `DepthTunnel.tsx`, `lib/scrollAnime.ts`.
- framer-motion — blocks dropping it: `Sections.tsx`, `ContactOrbit.tsx`, `MinimalNav.tsx`, `DynamicInfo.tsx`, `BorderBeam.tsx`.

## Chunks
No manual chunking: one JS entry chunk ≈ 749 kB (256 kB gz), CSS ≈ 29 kB. Vite warns >500 kB; splitting is a known follow-up.

## v4 cleanup (2026-11-07)
Removed: `lightswind` dep, `CursorFX` (+ its CSS), root/public `CV.pdf`, unused project PNGs, `assets/`, `README.uncommitted-backup.md`. A Blender 3D hero (ring, then a generated avatar) was prototyped and dropped in favour of the existing video.

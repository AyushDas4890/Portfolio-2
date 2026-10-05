---
id: 20260712-architecture
title: Code architecture v4
tags: [code]
created: 2026-07-12
updated: 2026-10-05
related: [20260712-content-model, 20261005-showreel, 20260712-scroll-choreography]
summary: Hash router, file map, data flow, fallbacks.
---

# Code architecture v4

> Summary: Hash router, file map, data flow, fallbacks.

## Stack
React 19 + TypeScript + Vite 8 (rolldown) + Tailwind 3. Motion: GSAP (ScrollTrigger, SplitText), framer-motion, Lenis. Fonts self-hosted via @fontsource-variable (Inter opsz, JetBrains Mono).

## Routing (`src/lib/router.ts`, `src/App.tsx`)
Hash routes so a static host needs no rewrites:
- `#/work/:id` → `pages/ProjectPage` (case study). Legacy `#/case-studies/:id` maps to the same page; bare `#/case-studies` → home at `#work`.
- `#<section>` → `pages/Home`, which jumps to that section once on mount.
- Page swaps run through framer-motion `AnimatePresence mode="wait"`; `onExitComplete` scrolls to top and refreshes ScrollTrigger.
- Opening a case study first `replaceState`s the URL to `#work`, so Back lands on the Work section.

## File map
- `src/App.tsx` — router, Lenis lifecycle, skip link, Nav.
- `src/content.ts` — ALL copy and data (see content-model note).
- `src/lib/motion.ts` — GSAP plugin registration, Lenis (`startSmoothScroll`, `scrollToId`, `scrollToTop`, `lockScroll`), `fontsReady`.
- `src/lib/reveal.ts` — `useReveal(ref)`: `[data-reveal]` fade-ups (ScrollTrigger.batch) and `[data-split]` line-mask headings.
- `src/lib/hooks.ts` — `useMediaQuery` (useSyncExternalStore), `useReducedMotion`, `useFinePointer`, `useIstClock`, `useActiveSection`.
- `src/components/` — Nav, Showreel, AvatarPortrait, ProjectMedia, SectionHeading, Button, Footer, LogoMark, Icons.
- `src/sections/` — Hero, About, Capabilities, Stack, Work, Experience, Credentials, Contact.
- `src/pages/` — Home, ProjectPage.

## Data flow
Components import from `content.ts` directly. Home owns `useActiveSection` and reports the active nav id up to App (Nav lives in App). Per-frame values (reel progress, cursor pill, counters) are written to the DOM or motion values, never React state.

## Fallbacks
- Video: MP4 (H.264) first, WebM (VP9) second for Chromium builds without proprietary codecs. Autoplay blocked → end-card poster + "Play showreel" button.
- Project without `image` → generated `DotSwell` art in ProjectMedia.
- Unknown project id → "No such project" block linking to `#work`.
- Clipboard denied → mailto.

## Gotchas
- `[data-split]` headings are re-parsed by SplitText on revert: keep them to static text (no React components inside).
- Grids that collapse to one column use `grid-cols-1` (minmax(0,1fr)); an implicit `auto` track lets no-wrap content push the page wider than the phone.
- `pkill -f "vite preview"` from a shell kills that shell too; track the preview pid instead.

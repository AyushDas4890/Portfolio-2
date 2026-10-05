---
id: 20260702-build-deploy
title: Build & deploy
tags: [ops]
created: 2026-07-02
updated: 2026-10-05
related: [20260702-cowork-sandbox-quirks, 20261005-showreel]
summary: npm scripts, chunk splitting, deps, Vercel target, deploy policy.
---

# Build & deploy

> Summary: npm scripts, chunk splitting, deps, Vercel target, deploy policy.

## Scripts
`npm run dev` (vite) · `npm run build` (`tsc -b && vite build` → dist/) · `npm run lint` (oxlint) · `npm run preview`.

## Vite config
Default `base: '/'`. `build.rolldownOptions.output.codeSplitting.groups` splits `react` (react, react-dom, scheduler) and `motion` (gsap, framer-motion, motion-dom/utils, lenis) from the app chunk (~21 kB gz app, ~60 kB react, ~96 kB motion).

## Deps (v4)
react/react-dom 19, gsap 3.15 (ScrollTrigger, SplitText), framer-motion, lenis, @fontsource-variable/inter + jetbrains-mono. Removed in v4: animejs, lightswind, the onlinewebfonts Helvetica links.

## Targets
- Vercel: auto-deploys on push to `main` → portfolio-website-zeta-topaz-84.vercel.app (hash routing, so no rewrites needed).

## Policy
**Never commit, push, or deploy without the user's explicit OK.** Pushing main = production deploy via Vercel CI.

## Related
- [Cowork sandbox quirks](cowork-sandbox-quirks.md) — how to build from a Claude sandbox.
- [Showreel](../code/showreel.md) — video encoding commands.

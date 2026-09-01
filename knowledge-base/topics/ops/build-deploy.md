---
id: 20260702-build-deploy
title: Build & deploy
tags: [ops]
created: 2026-07-02
updated: 2026-07-02
related: [20260702-cowork-sandbox-quirks]
summary: npm scripts, chunk splitting, GitHub Pages + Vercel targets, deploy policy.
---

# Build & deploy

> Summary: npm scripts, chunk splitting, GitHub Pages + Vercel targets, deploy policy.

## Scripts
`npm run dev` (vite) · `npm run build` (→ dist/) · `npm run preview` · `npm run deploy` (gh-pages -d dist).

## Vite config
`base: './'` (works on both GH Pages subpath and Vercel root). Manual chunks: `three` (three + @react-three/fiber, ~800KB) and `motion` (gsap + lenis) split from the ~200KB app bundle.

## Deps (v2)
@react-three/fiber, three 0.160, gsap, lenis, react/react-dom 18. framer-motion/motion-dom/drei removed in v2 — do not reintroduce.

## Targets
- Vercel: auto-deploys on push to `main` → portfolio-website-zeta-topaz-84.vercel.app
- GitHub Pages: manual `npm run deploy` → AyushDas4890.github.io/Portfolio-2

## Policy
**Never commit, push, or deploy without the user's explicit OK.** Pushing main = production deploy via Vercel CI.

## Related
- [Cowork sandbox quirks](cowork-sandbox-quirks.md) — how to build from a Claude sandbox.

---
id: 20260712-hero-ring
title: Hero — avatar video (no 3D ring)
tags: [code]
created: 2026-07-12
updated: 2026-11-07
related: [20260712-architecture, 20260712-scroll-choreography]
summary: The hero is a cursor-scrubbed avatar video revealed by IntroReveal; there is no three.js ring in the code.
---

# Hero — avatar video (no 3D ring)

> Summary: The hero is a cursor-scrubbed avatar video revealed by IntroReveal; there is no three.js ring in the code. PRODUCT.md still describes a ring — that is design intent, not implementation.

## BackgroundVideo (`src/App.tsx`)
- `public/avatar-head.mp4`: 1920×1080, 24 fps, 97 frames, H.264 **all-intra** (`-g 1`, every frame a keyframe) so seeks are instant. Re-encode rule: keep `-g 1 -bf 0`; CRF 29 veryslow ≈ 2.2 MB (SSIM 0.991 vs the old 3.4 MB file).
- Cursor x (70%) + y (30%) maps to `currentTime`; `onSeeked` chases the latest target so the decoder isn't flooded. Loads centred at `duration/2`.
- `poster="/avatar-head-poster.webp"` (31 KB) = frame 48, the same middle frame, so first paint matches.
- Wrapper is `#bg-video` (fixed, z-0) with a left-weighted scrim.

## IntroReveal (`src/IntroReveal.tsx`)
Pinned section (`+=130%`, scrub). It animates a `clip-path` on `#bg-video` from a small rounded window to full-screen while the name labels slide apart, then hands off to `DepthTunnel`. Any replacement hero must keep the `#bg-video` id or IntroReveal breaks.

## Share image
`public/og-image.jpg` (1200×630, 44 KB): name + role on black, poster frame on the right. Referenced by `og:image` / `twitter:image` in `index.html` as a relative path — scrapers need an absolute URL, so set the production domain there once it's final.

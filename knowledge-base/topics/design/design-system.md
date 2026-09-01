---
id: 20260712-design-system
title: Design system v3 — Apple-style
tags: [design]
created: 2026-07-12
updated: 2026-08-26
related: [20260712-architecture, 20260712-hero-ring]
summary: Apple-style dark material tokens, Inter/Inter Tight type, six-act structure, apple-design skill motion rules.
---

# Design system v3 — Apple-style

> Summary: Apple-style dark material tokens, Inter/Inter Tight type, six-act structure, apple-design skill motion rules.

## Reference
Redesigned 2026-08-26 per the `apple-design` skill (WWDC "Designing Fluid Interfaces" translated to web): true-black stage, cool space-gray glossy ring whose inner glow shifts hue per act (blue → sky → violet → green → orange → indigo → blue, echoing macOS app-icon colors on a neutral chrome shell), translucent frosted materials (nav, cards, lightbox), tight-tracked bold display type, instant press feedback, reduced-motion/-transparency/-contrast fallbacks. `frames.zip` is now historical (v2 navy/warm reference) — do not restore its palette.

## Tokens (all in `src/index.css` `:root`)
- Backgrounds: `--bg #000000`, `--bg2 #060608`, cards `--ink #111113` / `--ink2 #1c1c1e`
- Hairlines: `--line rgba(255,255,255,.14)`, softer `--line-soft rgba(255,255,255,.08)`
- Accents: `--peri #2997ff` (system blue — links/monograms), `--orange #bf5af2` (system purple — index labels), `--gold #ff9f0a` (system orange — CTA/cert hover, used sparingly)
- Text: `--text #f5f5f7`, `--muted #98989d`
- Easing: `--ease cubic-bezier(.16,1,.3,1)` (expo-out, spring-adjacent); `--ease-spring cubic-bezier(.34,1.56,.64,1)` for momentum/bounce moments only
- Materials: nav/cards/lightbox use `backdrop-filter: blur()` + translucent `rgba(255,255,255,.04-.06)` fills; never stack two translucent layers

## Type
- Display: `.serif-display` now points to `'Inter Tight'` (NOT a literal serif) — weight 650, letter-spacing -0.03em (negative tracking on large type per apple-design), line-height ~1.02–1.05.
- Labels: `'Inter'`, `.caps` = 0.7–0.74rem, letter-spacing .14em (down from .42em — Apple's small-caps tracking is tight, not maximal), uppercase, weight 600.
- Loaded via Google Fonts in `index.html` (`Inter` + `Inter Tight`); Fraunces/Archivo removed.
- Press feedback: `a:active, button:active` scale to .975 instantly (respond on pointer-down, not release).

## Six acts (ids drive nav + ring)
`hero` 01 → `work` 02 (5 featured cards + more-list) → `case` 03 (2 bands) → `experience` 04 → `credentials` 05 (9 certs) → `contact` 06. Registered in `sections` export of `src/data.js`.

## Hard rules
- Glow rare and warm; no neon, no purple-gradient hero, no icon card grids (see PRODUCT.md anti-references).
- `.act-solid` sections sit on gradient-to-solid dark so the fixed ring shows between acts (fade-through-dark).
- Case band accent line: `.case-copy h3 .mask-line:last-child .l` gets `--pal-a` (per-project palette).

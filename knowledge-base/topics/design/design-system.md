---
id: 20260712-design-system
title: Design system v2
tags: [design]
created: 2026-07-12
updated: 2026-07-12
related: [20260712-architecture, 20260712-hero-ring]
summary: Tokens, Fraunces/Archivo type, six-act structure, frames reference.
---

# Design system v2

> Summary: Tokens, Fraunces/Archivo type, six-act structure, frames reference.

## Reference
`frames.zip` (repo root) = 16 frames of the target look. Treat as the design source of truth: navy stage, glossy twisted ring with warm interior, serif display name, dark monogram cards revealing artwork, gradient-framed case bands, topo texture.

## Tokens (all in `src/index.css` `:root`)
- Backgrounds: `--bg #050a1e`, `--bg2 #0a1633`, cards `--ink #0b1229`
- Hairlines: `--line rgba(140,160,220,.14)`, softer `--line-soft`
- Accents: `--peri #8f9fe8` (monograms/links), `--orange #e8a35c` (indexes/labels), `--gold #d9b98a` (CTA italic, cert links)
- Text: `--text #e8ecf8`, `--muted #8b94b8`
- Easing: `--ease cubic-bezier(.22,1,.36,1)`

## Type
- Display: Fraunces (variable opsz; `.serif-display` sets opsz 144). Hero name clamp 3.2–8.5rem.
- Labels: Archivo, `.caps` = 0.7rem, letter-spacing .42em, uppercase.
- Loaded via Google Fonts in `index.html`.

## Six acts (ids drive nav + ring)
`hero` 01 → `work` 02 (5 featured cards + more-list) → `case` 03 (2 bands) → `experience` 04 → `credentials` 05 (9 certs) → `contact` 06. Registered in `sections` export of `src/data.js`.

## Hard rules
- Glow rare and warm; no neon, no purple-gradient hero, no icon card grids (see PRODUCT.md anti-references).
- `.act-solid` sections sit on gradient-to-solid dark so the fixed ring shows between acts (fade-through-dark).
- Case band accent line: `.case-copy h3 .mask-line:last-child .l` gets `--pal-a` (per-project palette).

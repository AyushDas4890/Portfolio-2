---
id: 20260712-design-system
title: Design system v4 — showreel-matched
tags: [design]
created: 2026-07-12
updated: 2026-10-05
related: [20260712-architecture, 20261005-showreel]
summary: Tokens sampled from the showreel, Inter/JetBrains Mono type, section order and colour grounds, motion rules.
---

# Design system v4 — showreel-matched

> Summary: Tokens sampled from the showreel, Inter/JetBrains Mono type, section order and colour grounds, motion rules.

## Reference
Redesigned 2026-10-05 around Ayush's 15 s showreel (`public/reel/`). The site is styled *as the reel's continuation*: same ground, same single amber accent, same Helvetica-style display type and mono chapter labels. The hero is the reel's closing card ("Ayush Das✳ / AI / ML Engineer"); the reel plays directly below it. v3 (Apple-style glossy ring) and v2 (`frames.zip`, navy/serif) are superseded — don't restore them.

## Tokens (tailwind.config.js `theme.extend.colors`, mirrored as CSS vars in `src/index.css`)
- Ground `bg #08070e` (exact reel background, so the full-bleed reel blends into the page); cards `raise #0e0d15`, `raise-2 #15141d`.
- Text `fg #f4f3ef`, `muted #a1a0a5` (7.7:1), `dim #7d7c83` (4.9:1, the floor for small labels); hairlines `white/10`.
- Accent `amber #f59e0b` (hover `amber-soft #fbbf24`) — the only accent. Used for: role line, chapter counters, primary buttons, progress fill, the stack band ground.
- Section grounds borrowed from reel frames: `cream #ebe9e3` + `ink #0a0a0f` / `ink-muted #5c5b61` (Experience sheet), `wine #ad001e → deep #6f0010` (avatar card).
- Easing: `ease-out-expo` = cubic-bezier(.16,1,.3,1) everywhere (GSAP uses `expo.out`).

## Type
- `Inter Variable` (opsz axis, self-hosted via @fontsource-variable) for everything; optical sizing switches to the Display cut at large sizes. Helvetica Now (the reel's face) is commercial, so Inter Display stands in.
- `.display`: weight 500, tracking -0.045em, line-height .92 — hero name, section titles.
- `.heading`: weight 500, tracking -0.03em, line-height 1.04 — card titles, statements.
- `.eyebrow`: JetBrains Mono 11px caps, tracking .18em — the reel's "01 / 04" labels.
- Section label pattern: `■ 03 / 06 —— Selected work` (amber square, as in the reel's Agents frame).

## Section order (ids drive the nav)
`home` hero → `reel` → `about` 01 → `capabilities` 02 → `stack` (amber band) → `work` 03 → `experience` 04 (cream sheet, rounded top) → `credentials` 05 (dark sheet over cream) → `contact` 06 + footer. Nav items: About, Work, Experience, Credentials, Contact (capabilities/stack light up About).

## Hard rules
- One accent (amber). No glows, gradients-as-decoration, or extra accent hues.
- Colour grounds only where the reel uses them (cream, amber, wine) and only as whole sections/cards.
- Nothing overlays the reel's picture except the bottom control pills — the reel carries its own typography.
- Hover effects only under `(hover: hover)` (Tailwind `future.hoverOnlyWhenSupported`).
- Reduced motion: no autoplay, no smooth scroll, no scrubs; everything visible.

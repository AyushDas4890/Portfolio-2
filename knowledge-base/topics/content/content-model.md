---
id: 20260712-content-model
title: Content model v2
tags: [content]
created: 2026-07-12
updated: 2026-07-12
related: [20260712-architecture]
summary: data.js schema — projects/experience/certificates, artwork pipeline.
---

# Content model v2

> Summary: data.js schema — projects/experience/certificates, artwork pipeline.

## Single source
Everything user-visible lives in `src/data.js`. Edit there; components render blindly.

## projects[6]
Keys: `slug` (route + artwork filename), `index` '01'–'06', `featured` (5 true → work-card row), `caseBand` (2 true → 03 bands), `title`, `caseTitle` [3 lines], `monogram` (single letter), `label` / `caseLabel` (caps strings), `palette {a,b}` (accent hexes), `artwork` `/artwork/<slug>.jpg`, `tagline`, `problem`, `approach`, `stack[]`, `screenshots[]` (`/projects/*.png`), `github`, `demo`.
Derived exports: `featuredProjects`, `caseBandProjects`. `moreWork[]` = extra GitHub repos for the list under the cards.

## experience[2]
VanillaKart internships (Android hybrid Nov 2025–Jan 2026; Web dev Sep–Nov 2025), `cert` → `/certificates/vanillakart-*.png`. NOTE: the two PNGs must be dropped into `public/certificates/` manually (came as chat images); links 404 gracefully until then. Education appended as third timeline row from `education` export.

## certificates[9]
`{index, title, issuer, file}` → PDFs in `public/certificates/` (kebab-case, copied from user's originals).

## Artwork pipeline
`public/artwork/PROMPTS.md` holds one generation prompt per project (3:4 portrait, fluid/marble abstract, per-project palette). Generated images saved as `public/artwork/<slug>.jpg`. Until present, UI falls back: cards keep monogram, bands/banners use palette gradients.

## sections[6]
`{id, num, name}` — drives Nav dots/counter, IntersectionObserver targets, ring `setSection`.

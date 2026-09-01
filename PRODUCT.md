# Product

## Register

brand

## Users
Recruiters, hiring managers, and fellow engineers evaluating Ayush Das (AI/ML engineer, B.Tech CSE) in under 2 minutes. Desktop-first review sessions, often from a resume link. Job to be done: judge technical depth and craft fast, then reach the proof (projects, GitHub, CV, certificates).

## Product Purpose
Personal portfolio (v2, "glossy ring" rebuild) that demonstrates engineering skill by being the demonstration — a scroll-driven cinematic site anchored by an interactive glossy 3D ring. Success: visitor remembers the site, opens a repo, the CV, or a certificate.

## Reference
v3 (2026-08-26, Apple-design redesign): true-black stage, cool space-gray glossy ring whose inner glow shifts hue per act (blue/violet/green/orange/indigo — echoing macOS app-icon tinting on a neutral shell), bold tight-tracked display type (Inter Tight, no serif), translucent frosted-glass materials on nav/cards/lightbox, instant press feedback and spring-adjacent easing per the `apple-design` skill. `frames.zip` is the historical v2 reference (navy/warm/serif) — superseded, kept for provenance only.

## Brand Personality
Gallery-grade restraint carried into an Apple-keynote register: quiet, confident, materially rich. Cinematic but controlled; color is used the way Apple uses it — one neutral chrome language plus a rotating single accent hue per section, never several accents competing at once. Bold sans display (Inter Tight) against tightly-tracked caps (Inter).

## Anti-references
- Generic dev-portfolio template: card-grid-with-icons, purple gradient hero, typing-cursor tagline.
- Corporate SaaS landing: hero-metric blocks, feature-card grids.
- Neon cyberpunk overload: Matrix green, synthwave gradients.
- Flat opaque UI chrome: any nav/card/sheet without translucency or blur where Apple materials call for it.

## Design Principles
1. Show, don't tell — the ring and motion ARE the skill evidence.
2. One dominant idea per fold; six acts, deliberate pacing (01 INTRO → 06 CONTACT).
3. The ring narrates: its palette and position shift per act.
4. Quiet power — navy `#050a1e`, ink cards, periwinkle + orange accents, big serif type.
5. Content is canonical in `src/data.js`; design never blocks reading it.

## Accessibility & Inclusion
Best effort: readable contrast, keyboard-reachable cards/links, `prefers-reduced-motion` fallback (static ring pose, no smooth-scroll, instant reveals), WebGL-fail poster fallback. No hard WCAG audit gate.

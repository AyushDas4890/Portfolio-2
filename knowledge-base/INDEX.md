# Portfolio Website — Knowledge Base Index

## How to use this KB (for agents)
1. Read this index first. Pick notes by their descriptions; open only those (1–3 notes beats scanning the repo).
2. This KB describes the v2 "glossy ring" React 18 + Vite 5 portfolio SPA. Content lives in `src/data.js`; design contract in `PRODUCT.md`; reference look in `frames.zip`.
3. Cite the note `id` when you use information from it.

## How to update this KB (for agents)
- New idea → new atomic note. Same idea changed → edit in place, bump `updated`.
- Any create/rename/delete MUST update this registry in the same change.
- Use only tags from the controlled vocabulary; extend the list here first.

## Controlled tags
`design`, `code`, `content`, `ops`, `agent-env`

## Registry

### design
- `20260712-design-system` — **Design system v2** — `topics/design/design-system.md` — Tokens, Fraunces/Archivo type, six-act structure, frames reference.

### code
- `20260712-architecture` — **Code architecture v2** — `topics/code/architecture.md` — Router, file map, data flow, artwork fallbacks.
- `20260712-hero-ring` — **Hero 3D ring** — `topics/code/hero-ring.md` — Twisted-torus geometry, physical material, per-section palette API, perf caps.
- `20260712-scroll-choreography` — **Scroll choreography** — `topics/code/scroll-choreography.md` — Lenis + ScrollTrigger wiring, stage object, mask reveals, tilt/sweep/parallax, reduced-motion.

### content
- `20260712-content-model` — **Content model v2** — `topics/content/content-model.md` — data.js schema: projects/experience/certificates, artwork pipeline.

### ops
- `20260702-build-deploy` — **Build & deploy** — `topics/ops/build-deploy.md` — npm scripts, chunk splitting, Vercel target, deploy policy.
- `20260702-cowork-sandbox-quirks` — **Cowork sandbox quirks** — `topics/ops/cowork-sandbox-quirks.md` — Mount sync bugs and the /tmp build workaround for Claude agents.

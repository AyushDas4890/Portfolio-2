# Portfolio Website — Knowledge Base Index

## How to use this KB (for agents)
1. Read this index first. Pick notes by their descriptions; open only those (1–3 notes beats scanning the repo).
2. This KB describes the v4 showreel-matched React 19 + Vite 8 + TypeScript portfolio SPA. Content lives in `src/content.ts`; tokens in `tailwind.config.js` + `src/index.css`; design contract in `PRODUCT.md` / `DESIGN.md`; the showreel in `public/reel/` is the visual reference.
3. Cite the note `id` when you use information from it.

## How to update this KB (for agents)
- New idea → new atomic note. Same idea changed → edit in place, bump `updated`.
- Any create/rename/delete MUST update this registry in the same change.
- Use only tags from the controlled vocabulary; extend the list here first.

## Controlled tags
`design`, `code`, `content`, `ops`, `agent-env`

## Registry

### design
- `20260712-design-system` — **Design system v4 — showreel-matched** — `topics/design/design-system.md` — Tokens sampled from the reel, Inter/JetBrains Mono type, section order and colour grounds, hard rules.

### code
- `20260712-architecture` — **Code architecture v4** — `topics/code/architecture.md` — Hash router, file map, data flow, fallbacks, gotchas.
- `20261005-showreel` — **Showreel player & media pipeline** — `topics/code/showreel.md` — 16:9/9:16 cut selection, playback/sound/chapters/fullscreen, encoding commands, avatar clip.
- `20260712-scroll-choreography` — **Scroll choreography v4** — `topics/code/scroll-choreography.md` — Lenis + ScrollTrigger wiring, reveal hooks, scrubbed effects, reduced motion.

### content
- `20260712-content-model` — **Content model v4** — `topics/content/content-model.md` — content.ts schema: links, reel chapters, projects, experience, credentials, capabilities, stack.

### ops
- `20260702-build-deploy` — **Build & deploy** — `topics/ops/build-deploy.md` — npm scripts, chunk splitting, deps, Vercel target, deploy policy.
- `20260702-cowork-sandbox-quirks` — **Cowork sandbox quirks** — `topics/ops/cowork-sandbox-quirks.md` — Mount sync bugs and the /tmp build workaround for Claude agents.

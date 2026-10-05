# Portfolio Website — agent entry point

Before exploring this repo, read `knowledge-base/INDEX.md` and open only the 1–3 notes relevant to your task. It maps the whole project (architecture, design tokens, showreel player, scroll motion, content model, build quirks) in a handful of short notes — far cheaper than scanning source.

Quick facts:
- React 19 + TypeScript + Vite 8 + Tailwind 3 SPA, hash-routed. Content: `src/content.ts`. Tokens: `tailwind.config.js` (mirrored in `src/index.css`). Design contract: `PRODUCT.md` / `DESIGN.md`.
- The site is designed around the showreel in `public/reel/` — match its look (near-black ground, one amber accent, mono chapter labels) when adding anything.
- Building from a Cowork/Claude sandbox? Read `knowledge-base/topics/ops/cowork-sandbox-quirks.md` FIRST — naive `vite build` on the mount bus-errors.
- Never commit, push, or deploy without the user's explicit OK (push to main auto-deploys via Vercel).

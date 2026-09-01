# Portfolio Website — agent entry point

Before exploring this repo, read `knowledge-base/INDEX.md` and open only the 1–3 notes relevant to your task. It maps the whole project (architecture, design tokens, scroll/3D systems, content model, build quirks) in ~7 short notes — far cheaper than scanning source.

Quick facts:
- React 18 + Vite 5 SPA. Content: `src/data.js`. All styles/tokens: `src/index.css`. Design contract: `PRODUCT.md`.
- Building from a Cowork/Claude sandbox? Read `knowledge-base/topics/ops/cowork-sandbox-quirks.md` FIRST — naive `vite build` on the mount bus-errors.
- Never commit, push, or deploy without the user's explicit OK (push to main auto-deploys via Vercel).

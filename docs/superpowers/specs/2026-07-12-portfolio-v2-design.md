# Portfolio v2 — Design Spec

Date: 2026-07-12. Status: approved direction, pre-plan.
Reference: `frames.zip` (16 frames of target look). Approach C: real Three.js hero + user-generated abstract artwork per project.

## Goal
Replace the current site entirely with a cinematic, scroll-driven portfolio matching the demo frames: deep-navy stage, glossy interactive 3D ring hero, dark project cards that reveal artwork, framed case-study bands, serif display type. Hybrid structure: one main scroll + per-project detail pages.

## Users & success
Recruiters/engineers evaluating Ayush Das (AI/ML engineer) in under 2 minutes. Success: visitor remembers the site, opens a repo, the CV, or a certificate.

## Stack
- React 18 + Vite 5 (unchanged), React Router (new dep — detail pages).
- Three.js for hero ring. GSAP ScrollTrigger + Lenis for choreography.
- All previous `src/sections/*` and `src/three/*` deleted and rebuilt. `src/data.js` remains the single content source, extended.

## Structure

### Main scroll — six acts
1. **01 Hero.** Glossy twisted ring: TorusGeometry + vertex twist deformation, MeshPhysicalMaterial (clearcoat + transmission), procedural HDRI environment. Serif display name "AYUSH DAS", spaced-caps sub-label "AI / ML ENGINEER". Ring rotation scrubbed by scroll; tilt follows mouse. Left section counter (`01`), right progress dots.
2. **02 Work.** Row of 4 featured project cards (frames 5–10 style): periwinkle monogram, spaced-caps name, orange index. On scroll-into-view and hover the card lifts and its abstract artwork crossfades in. Click → `/work/:slug`. Below: compact "all work" links for remaining projects/repos.
3. **03 Case highlights.** Full-bleed bands (frames 11–14 style): gradient-framed artwork left, big serif title right, small-caps label ("PERSONAL PROJECT" / domain), topographic line texture in background. 2–3 bands for top projects.
4. **04 Experience.** VanillaKart internships as a timeline: Web Development (8 Sep – 8 Nov 2025, WordPress + client sites) and Skill Training + Android Hybrid App (11 Nov 2025 – 12 Jan 2026). Each entry links to its certificate image.
5. **05 Credentials.** 9 course certificates as a minimal logo-strip grid (frames 6 style): issuer + title, click opens PDF. Items: ChatGPT Essentials, ChatGPT Prompt Engineering, GenAI Apps with No-Code Tools, Coursera Python, Data Science (CipherSchools), Intro to RAG, Master Gen-AI, Microsoft AI/ML Fundamentals, Python for Data Science (IBM).
6. **06 Contact.** Big serif CTA, email, GitHub, LinkedIn, resume download (`public/Ayush_Das_ML_Resume.pdf`).

### Project detail page `/work/:slug`
Artwork banner → problem / approach / stack → screenshots (existing `public/projects/*.png` as proof) → GitHub link → next-project footer. Content from `src/data.js`.

## Design language
- Background range `#050A1E` → `#0A1633`; ink-blue card fills; hairline borders.
- Accents: periwinkle (monograms), warm orange (indexes, labels), rare glow.
- Type: serif display (Fraunces or Playfair Display class) for names/titles; spaced all-caps sans for labels.
- Topographic contour texture on case bands only.
- Anti-references unchanged from PRODUCT.md: no template card-grids-with-icons, no purple-gradient hero, no neon overload.

## Motion system
- Lenis smooth scroll; GSAP ScrollTrigger drives all scrubs.
- Hero ring: scroll-scrubbed rotation + position; **section-reactive material** — color/emissive shifts per act (navy-pink hero → teal experience → amber contact).
- **Intro preloader**: ~2 s counter 01→100, ring scales in from dark; skippable (click/keypress), plays once per session.
- Cards: staggered lift + artwork crossfade; **hover tilt 4–6° toward cursor + specular light sweep**.
- **Serif mask reveals**: names/case titles rise from a clipped baseline on scroll.
- **Framed-artwork parallax**: case-band image drifts slower than its frame.
- Section transitions fade-through-dark (frames 5–7).
- `prefers-reduced-motion`: static poses, no scrub, no preloader animation, instant reveals.

## Assets (user-generated, prompts supplied during build)
- 6 abstract artworks, portrait 3:4, ≥1200 px tall: fluid/marble style matching each project's domain palette (as in frames' "Linea Vol.1" art). Delivered to `public/artwork/<slug>.jpg`.
- Certificates: 2 VanillaKart PNGs + 9 PDFs copied into `public/certificates/`.
- No video assets. HDRI is procedural.

## Performance & mobile
- Renderer DPR capped at 2; ring paused when off-screen; geometry segment count reduced on mobile.
- Artwork and screenshots lazy-loaded. Route-level code splitting for detail pages.
- Mobile: cards stack vertically, ring scaled down, tilt/mouse effects disabled on touch.

## Error handling
- Missing artwork file → card falls back to monogram-only (frames 5 look), no broken image.
- Unknown `/work/:slug` → redirect to home work section.
- WebGL unavailable → static hero poster image, rest of site unaffected.

## Testing / verification
- `npm run build` via /tmp workaround (see KB `cowork-sandbox-quirks`), preview server smoke test.
- Manual pass: all 6 acts render, routes resolve, links/certificates open, reduced-motion path works, mobile viewport layout.

## Knowledge base
Rewrite `knowledge-base/` for v2, same atomic-note format + INDEX registry: design-system, hero-3d-ring, scroll-choreography, routes-and-content, build-deploy, cowork-sandbox-quirks (kept). PRODUCT.md updated to v2 language. CLAUDE.md pointer unchanged.

## Constraints
- Never commit/push/deploy without explicit user OK (push to main auto-deploys via Vercel).
- No new dependencies beyond `react-router-dom` without asking.

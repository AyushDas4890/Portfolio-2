# Portfolio v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current site with a cinematic scroll-driven portfolio matching `frames.zip`: glossy interactive 3D ring hero, dark project cards revealing artwork, framed case bands, serif type, hybrid routing.

**Architecture:** React 18 + Vite 5 SPA, React Router (`/` main scroll, `/work/:slug` detail). One Three.js canvas (fixed, behind content) hosts the twisted glossy ring; GSAP ScrollTrigger + Lenis choreograph six acts. `src/data.js` stays the single content source.

**Tech Stack:** react, react-dom, react-router-dom (new), three (raw, drop @react-three/fiber), gsap, lenis, vite.

**Sandbox rule:** All builds run in `/tmp/pw` per KB `cowork-sandbox-quirks` — never `vite build` on the mount. After Write/Edit, verify mount file size; reconstruct in /tmp if stale.

---

## File structure

| File | Responsibility |
|---|---|
| `index.html` | fonts (Fraunces + Archivo), meta, root div |
| `src/main.jsx` | Router: `/` → Home, `/work/:slug` → ProjectDetail, `*` → redirect |
| `src/App.jsx` | Home: Preloader → Nav → Hero → Work → CaseBands → Experience → Credentials → Contact; owns Lenis + ScrollTrigger init |
| `src/data.js` | profile, projects (slug/title/monogram/palette/case copy/screenshots/github), experience[2], certificates[9], socials |
| `src/index.css` | all tokens + all component styles (single stylesheet, keep convention) |
| `src/lib/motion.js` | Lenis + gsap registration, reduced-motion flag, helpers |
| `src/three/RingScene.js` | plain-three scene class: twisted ring, physical material, env, per-section color lerp, scroll/pointer API, DPR cap, visibility pause, WebGL-fail → null |
| `src/three/RingCanvas.jsx` | React wrapper mounting RingScene to fixed canvas |
| `src/sections/Preloader.jsx` | 01→100 counter, once per session, skippable |
| `src/sections/Nav.jsx` | logo mark, section counter, progress dots |
| `src/sections/Hero.jsx` | serif name mask-reveal, sub-caps label |
| `src/sections/Work.jsx` | 4 featured cards (tilt + sweep + artwork crossfade) + all-work list |
| `src/sections/CaseBands.jsx` | framed artwork left / serif title right, topo texture, parallax |
| `src/sections/Experience.jsx` | VanillaKart timeline, cert links |
| `src/sections/Credentials.jsx` | 9-cert grid → PDFs |
| `src/sections/Contact.jsx` | serif CTA, links, resume |
| `src/pages/ProjectDetail.jsx` | banner, copy, screenshots, github, next-project |
| `public/certificates/` | 2 PNG + 9 PDF copied from uploads |
| `public/artwork/` | 6 generated artworks (fallback: monogram card) |
| `knowledge-base/` | rewritten for v2 |
| `PRODUCT.md` | v2 design contract |

Deleted: `src/sections/{About,Journey,Skills}.jsx`, `src/three/SceneCanvas.jsx`, dep `@react-three/fiber`.

---

### Task 1: Assets + data model
- [ ] Copy uploaded certificates → `public/certificates/` (kebab-case names)
- [ ] Rewrite `src/data.js`: projects with `slug, index, title, monogram, label, palette {a,b}, artwork, tagline, problem, approach, stack[], screenshots[], github`, `featured` flag (4 featured: ai-research-assistant, legal-conflict-resolver, rag-medical-assistant, cancer-tf-dashboard); `experience` (VanillaKart ×2 with cert paths + dates from certificates); `certificates` (9: title, issuer, file); `profile`, `socials`
- [ ] Verify: `node --input-type=module -e "import('./src/data.js').then(m=>console.log(m.projects.length, m.certificates.length))"` in /tmp copy → `6 9` (plus extra repos list retained)

### Task 2: Shell — fonts, tokens, router
- [ ] `index.html`: Google fonts Fraunces (opsz, 300–600) + Archivo (400/500), dark bg, title/meta
- [ ] `src/index.css`: tokens `--bg:#050a1e --bg2:#0a1633 --ink:#0b1229 --line:rgba(140,160,220,.14) --peri:#8f9fe8 --orange:#e8a35c --text:#e8ecf8 --muted:#8b94b8`; type scale (serif display clamp 3–7rem); base layout, reduced-motion media rules
- [ ] `src/main.jsx`: BrowserRouter (Vercel) with routes; `src/App.jsx` skeleton rendering section placeholders
- [ ] Add dep: `react-router-dom@6`; remove `@react-three/fiber`
- [ ] Verify: /tmp build passes, page renders placeholders

### Task 3: Motion core
- [ ] `src/lib/motion.js`: export `prefersReduced`, `initSmoothScroll()` (Lenis + gsap ticker wiring, returns destroy), ScrollTrigger registration
- [ ] `App.jsx` uses it in effect; cleanup on unmount
- [ ] Verify: build passes; scroll works in headless screenshot pass

### Task 4: Ring scene
- [ ] `src/three/RingScene.js`: TorusGeometry(1.15,.45,220,64) twisted (rotate cross-section by angle ∝ tube angle, sculpt scale for the frames' asymmetric lip), MeshPhysicalMaterial (clearcoat 1, roughness .18, transmission .25, envMapIntensity 1.4), inner glow disc (additive gradient sprite), RoomEnvironment PMREM; API: `setScroll(p)`, `setSection(i)` (lerp palette navy-pink → periwinkle → teal → amber), `setPointer(x,y)`, `resize()`, `dispose()`; DPR ≤2, IntersectionObserver pause, try/catch WebGL → `null` + `.failed`
- [ ] `src/three/RingCanvas.jsx`: fixed full-viewport canvas z-0, mounts scene, binds scroll progress via ScrollTrigger onUpdate, pointermove (desktop only), fail → static radial-gradient poster div
- [ ] Verify: headless screenshot shows glossy ring on navy

### Task 5: Preloader + Nav + Hero
- [ ] `Preloader.jsx`: sessionStorage gate, counter tween 1→100 (~1.8s), fade-out, skip on click/key, reduced-motion skips
- [ ] `Nav.jsx`: monogram top-center, left counter `0N —`, right dots (IntersectionObserver on sections)
- [ ] `Hero.jsx`: `ILLUSTRATION`-style caps label → `AI / ML ENGINEER`, serif `AYUSH DAS` mask-reveal (overflow hidden line, yPercent 110→0), small gold caps `GENERATIVE INTELLIGENCE` sub
- [ ] Verify: screenshot ≈ frame_002 composition

### Task 6: Work cards
- [ ] `Work.jsx`: 4 cards row (grid, stack <900px): monogram SVG letter, caps title, orange index; artwork `<img loading="lazy">` opacity 0→1 on hover/in-view (stagger via ScrollTrigger batch); tilt (pointermove → rotateX/Y ≤6°, spring back) + specular sweep (::after translating gradient); missing artwork → `onError` hide img (monogram card remains); click → navigate
- [ ] All-work list rows beneath (remaining projects + top repos): name — one-liner — arrow
- [ ] Verify: screenshot ≈ frames 5–10; keyboard focusable cards

### Task 7: Case bands
- [ ] `CaseBands.jsx`: for 2 projects (ai-research-assistant, rag-medical-assistant): gradient-border frame (padding trick) with artwork img (parallax: yPercent scrub ±8 inside overflow-hidden frame), right column serif 3-line title mask-reveal + circle motif + caps label `PERSONAL PROJECT`, topo SVG texture bg (inline data-URI contour paths, opacity .05)
- [ ] Verify: screenshot ≈ frames 11–14

### Task 8: Experience + Credentials + Contact
- [ ] `Experience.jsx`: vertical hairline timeline, 2 entries (title, org line, dates, 2-line summary, `View certificate ↗` → `/certificates/*.png` new tab)
- [ ] `Credentials.jsx`: grid of 9 hairline cells (frames-6 look): issuer caps, serif title, orange index; anchor → PDF
- [ ] `Contact.jsx`: serif `LET'S BUILD` CTA, mailto, GitHub, LinkedIn, resume button; footer line
- [ ] Verify: build + all links resolve (check dist file presence for hrefs)

### Task 9: Project detail page
- [ ] `pages/ProjectDetail.jsx`: useParams → project or `<Navigate to="/">`; artwork banner (fallback palette gradient), serif title, meta row (stack chips, github btn), problem/approach prose, screenshots stacked lazy, next-project footer link; scroll reset on mount
- [ ] Verify: `/work/ai-research-assistant` renders in preview; bad slug redirects

### Task 10: Section-reactive ring + choreography polish
- [ ] Wire `setSection` from Nav's observer; fade-through-dark between acts (section opacity/y scrub); ring position path across sections (x drift, scale down at work, hide behind case bands via z/opacity, return at contact)
- [ ] Reduced-motion: static ring pose, reveals instant
- [ ] Verify: screenshots at 6 scroll depths; reduced-motion pass via CDP emulation

### Task 11: Build, headless verification, mobile pass
- [ ] Full /tmp build; chunk-split three/gsap in `vite.config.js` manualChunks
- [ ] Headless chrome: screenshots desktop 1440×900 at 6 depths + mobile 390×844; check console errors empty
- [ ] Copy `dist/` back to mount
- [ ] Verify: no console errors, LCP asset < 300KB initial JS gz (three chunk lazy where possible)

### Task 12: KB rewrite + PRODUCT.md + docs
- [ ] Rewrite `PRODUCT.md` (v2 language, frames reference, same anti-refs)
- [ ] KB notes: `design-system` (new tokens/type), `hero-3d-ring` (geometry/material/API), `scroll-choreography` (acts, triggers, reduced-motion), `routes-and-content` (router, data.js schema, artwork fallback), keep `build-deploy` + `cowork-sandbox-quirks` (update if learned new quirks); update `INDEX.md` registry
- [ ] Delete stale notes (`webgl-scene`, `scroll-system`, `architecture`, `content-model` → replaced)
- [ ] Artwork prompts: write `public/artwork/PROMPTS.md` with 6 generation prompts (3:4, fluid/marble, per-project palette) and expected filenames
- [ ] Verify: INDEX registry matches files on disk

### Task 13: Commit
- [ ] `git add -A && git commit` (message: `feat: portfolio v2 — cinematic ring rebuild`) — local commit only, NO push (push auto-deploys)

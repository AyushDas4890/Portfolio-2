# Product

## Register

brand

## Users
Recruiters, hiring managers, and fellow engineers evaluating Ayush Das (AI/ML engineer, B.Tech CSE) in under 2 minutes. Desktop-first review sessions, often from a resume link, plus a growing share on phones from LinkedIn. Job to be done: judge technical depth and craft fast, then reach the proof (projects, GitHub, CV, certificates).

## Product Purpose
Personal portfolio (v4, "showreel" rebuild) built around a 15-second motion showreel. The site opens on the reel's closing card — name, rule, role in amber — and the reel plays right beneath it, fitted to the screen (16:9 on desktop, 9:16 on phones). Everything after the reel speaks the reel's visual language so the two read as one piece. Success: visitor watches the reel, opens a case study or repo, the CV, or a certificate.

## Reference
v4 (2026-10-05): the showreel itself (`public/reel/`). Near-black ground `#08070e`, one amber accent, Helvetica-style display type (Inter Display on the web), JetBrains Mono chapter labels ("■ 03 / 06"), and the reel's own colour frames reused as section grounds — cream for Experience, amber for the stack band, wine-red for the avatar card. v3 (Apple-style glossy ring) and v2 (`frames.zip`, navy/serif) are historical only.

## Brand Personality
Editorial, confident, quiet. A motion-design reel's restraint carried into a web page: big tight type, generous black space, one accent used with intent, motion that reveals rather than performs. The felt-avatar character adds warmth without becoming a mascot.

## Anti-references
- Generic dev-portfolio template: card-grid-with-icons, purple gradient hero, typing-cursor tagline.
- Corporate SaaS landing: hero-metric blocks, feature-card grids.
- Neon cyberpunk overload: Matrix green, synthwave gradients.
- Gimmick overload: custom cursors everywhere, 3D carousels, orbiting icons, scroll-jacked tunnels — the v3.5 site had these and they fought the reel.

## Design Principles
1. The reel is the hero's second half — size it to the screen, never cover it with UI.
2. One accent (amber), one display face, one label face.
3. Colour grounds only where the reel uses them, and only as whole sections.
4. Show the proof fast: Work is one click from the hero; every project links to a live demo, the source, and a case study.
5. Content is canonical in `src/content.ts`; design never blocks reading it.

## Accessibility & Inclusion
Readable contrast (muted text ≈ 7.7:1 and dim labels ≈ 4.9:1 on the ground, ink-muted ≈ 5.5:1 on cream), keyboard-reachable everything, skip link, labelled video controls, `prefers-reduced-motion` honoured (no autoplay, no smooth scroll, no scrubs, content always visible), hover effects only where hover exists. No hard WCAG audit gate.

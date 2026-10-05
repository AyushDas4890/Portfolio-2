# Ayush Das — portfolio

Personal portfolio of Ayush Das (AI / ML engineer), built around a 15-second showreel. React 19 + TypeScript + Vite 8 + Tailwind CSS, with GSAP (ScrollTrigger, SplitText), Framer Motion and Lenis for motion.

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # typecheck + production build
npm run lint     # oxlint
npm run preview  # serve built output
```

## What's here

- `src/content.ts` — every piece of copy and data: links, showreel chapters, projects and case studies, experience, credentials, capabilities, stack.
- `src/components/Showreel.tsx` — the reel player: 16:9 on landscape screens, 9:16 on phones, muted autoplay in view, sound / pause / fullscreen, clickable chapters, grows to full-bleed on scroll.
- `src/sections/` — Hero, About, Capabilities, Stack, Work, Experience, Credentials, Contact.
- `src/pages/` — Home and the case-study page (`#/work/:id`).
- `src/lib/` — motion setup (GSAP + Lenis), reveal hooks, media-query/clock hooks, hash router.
- `public/reel/` — showreel cuts (MP4 + WebM fallback) and posters. Encoding commands are in `knowledge-base/topics/code/showreel.md`.

Design tokens live in `tailwind.config.js` (mirrored in `src/index.css`); the design contract is `DESIGN.md` / `PRODUCT.md`.

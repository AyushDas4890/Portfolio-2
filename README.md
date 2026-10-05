# Ayush Das — hero landing page

Full-screen personal hero for Ayush Das (AI & Machine Learning Engineer). React + TypeScript + Vite + Tailwind CSS.

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # typecheck + production build
npm run preview  # serve built output
```

## What's here

- `src/App.tsx` — all UI: mouse-scrub background video, obsidian wash overlay, fixed navbar with mobile overlay, hero (blurred intro, typewriter positioning line, action pills).
- `src/useTypewriter.ts` — typewriter hook (`text`, `speed=38ms`, `startDelay=600ms`) → `{ displayed, done }`.
- `src/index.css` — Tailwind layers, font vars, profile palette vars (`--ground` / `--identity` / `--signal`), `blink` keyframe.
- `index.html` — Helvetica Now Display font links.

## Customization points

All content lives in the constants at the top of `src/App.tsx`:

- `BRAND`, `EMAIL`, `GITHUB`, `PORTFOLIO`, `LINKEDIN`
- `NAV_LINKS` — navbar / mobile menu links
- `PILLS` — the four action pills (label + href)
- `TYPEWRITER_TEXT` — the animated positioning line
- Blurred intro copy is in the `Hero` component.

Palette follows the profile `DESIGN.md`: obsidian `#07070F`, blue `#60A5FA` (identity), amber `#F59E0B` (signal — cursor + copy confirmation).

## Notes

- Background video does not autoplay; it scrubs on horizontal mouse movement (`SENSITIVITY = 0.8`). A `seeked` handler chases the target to avoid seek-flooding.
- Action pills fade in 400ms after load, independent of the typewriter.
- The "Reach me" pill copies the email via `navigator.clipboard`.

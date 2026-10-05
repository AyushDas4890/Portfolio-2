# Design System: Ayush Das Portfolio

## Overview

**Creative North Star: "The reel, continued"**

The site is designed as the showreel's continuation. It opens on the reel's closing card ("Ayush Das✳ / AI / ML Engineer"), the reel plays beneath it, and every section after it reuses the reel's ground, accent, type and frames. Nothing on the page competes with the reel's picture.

**Key Characteristics:**
- Near-black ground identical to the reel's, so the full-bleed reel dissolves into the page
- One amber accent; cream, amber and wine-red appear only as whole-section grounds, as in the reel
- Big, tightly tracked display type against small mono caps labels
- Motion that reveals content (masked line rises, scrubbed growth) rather than decorating it

## Colors

### Accent
- **Amber** (#f59e0b, hover #fbbf24): role line, chapter counters, primary buttons, progress fills, focus ring, the stack band ground.

### Grounds (from reel frames)
- **Ground** (#08070e): page background — sampled from the reel.
- **Raise** (#0e0d15) / **Raise 2** (#15141d): cards, stat tiles, media stages.
- **Cream** (#ebe9e3) with **Ink** (#0a0a0f) / **Ink muted** (#5c5b61): the Experience sheet (reel "Agents" frame).
- **Wine** (#ad001e → #6f0010): the avatar portrait card (reel "Models that ship." frame).

### Text
- **Foreground** (#f4f3ef), **Muted** (#a1a0a5), **Dim** (#7d7c83 — lowest contrast allowed for small labels, ≈4.9:1); hairlines white at 8–15%.

### Named Rules
**The One Accent Rule.** Amber is the only accent. No glows, no second hue, no gradient decoration.

## Typography

**Display / body:** Inter Variable with optical sizing (Display cut at large sizes) — stands in for the reel's Helvetica Now Display.
**Labels:** JetBrains Mono Variable, 11px caps, tracking 0.18em.

### Hierarchy
- **Display** (500, up to 250px, line-height .92, tracking -0.045em): hero name, section titles, case-study titles.
- **Heading** (500, line-height 1.04, tracking -0.03em): card titles, statements, highlights.
- **Body** (400, 16–19px, line-height 1.6): descriptions, problem/approach copy.
- **Eyebrow** (mono caps): chapter counters, metadata, tool chips.

### Named Rules
**The Counter Rule.** Every section opens with `■ NN / 06 —— Label`, the reel's chapter counter.

## Layout

Max width 1440px, gutters `clamp(20px, 4vw, 56px)`, 12-column grid on desktop collapsing to one column (`grid-cols-1`). Sections breathe with `clamp(96px, 12vw, 180px)` vertical padding. Section order: Hero → Showreel → About → What I do → Stack band → Work → Experience (cream sheet) → Credentials → Contact.

## Elevation & Depth

Flat. Depth comes from ground changes (cream and dark sheets with rounded top corners sliding over each other), hairlines and the frosted nav. Shadows only on the reel frame, the cursor pill and the floating certificate preview.

## Shapes

Rounded but restrained: 20–24px on media and cards, 16px on stat tiles, full pills on buttons and chips, square amber markers on labels.

## Components

### Showreel
16:9 frame on landscape screens (grows from column width to full-bleed on scroll), 9:16 on phones. Muted autoplay in view; click for sound (restarts from 0 the first time), pause, fullscreen, and a clickable chapter rail (Data, Language, Agents, Products, Models that ship, Stack, Ayush Das).

### Buttons
Pill, 48px tall. Primary amber with ink text; ghost with hairline ring. The icon slides out and a copy slides in on hover.

### Capability rows
Full-width index rows (counter, giant word, caption + tool chips). Hover floods the row amber from the bottom and turns everything ink.

### Project cards
16:9 screenshot stage, index, title, tagline, tool line, Live demo / Code links; whole card opens the case study. Projects without a screenshot get generated dot-swell art.

### Navigation
Fixed bar, transparent over the hero, frosted after scrolling, hides on scroll-down. Mobile: full-screen sheet with numbered links.

## Do's and Don'ts

### Do:
- **Do** keep the reel uncovered apart from its bottom control pills.
- **Do** use the mono counter label to open every section.
- **Do** keep motion one-shot (reveals) or scroll-tied (scrubs); respect reduced motion everywhere.

### Don't:
- **Don't** add a second accent colour or decorative gradients.
- **Don't** bring back cursor trails, 3D carousels, orbiting icons or pinned tunnels.
- **Don't** put React components inside `[data-split]` headings (SplitText re-parses them).

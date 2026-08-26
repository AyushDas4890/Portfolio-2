---
name: Ayush Das Portfolio
description: An Apple-keynote-register engineering portfolio built around a glossy 3D ring.
colors:
  bg: "#000000"
  bg2: "#060608"
  ink: "#111113"
  ink2: "#1c1c1e"
  line: "rgba(255,255,255,0.14)"
  line-soft: "rgba(255,255,255,0.08)"
  peri: "#2997ff"
  orange: "#bf5af2"
  gold: "#ff9f0a"
  text: "#f5f5f7"
  muted: "#98989d"
typography:
  display:
    fontFamily: "'Inter Tight', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "clamp(3rem, 10.5vw, 8rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  xs: "8px"
  sm: "14px"
  md: "18px"
  lg: "22px"
  xl: "24px"
  pill: "999px"
spacing:
  xs: "0.6rem"
  sm: "1.2rem"
  md: "2rem"
  lg: "4rem"
  xl: "9vh"
components:
  button-primary:
    backgroundColor: "rgba(255,255,255,0.04)"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "1rem 2.6rem"
  button-primary-hover:
    backgroundColor: "rgba(41,151,255,0.12)"
    textColor: "{colors.text}"
  work-card:
    backgroundColor: "rgba(255,255,255,0.04)"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "1.6rem"
  nav-bar:
    backgroundColor: "rgba(10,10,12,0.55)"
    textColor: "{colors.text}"
    padding: "1.1rem 0"
---

# Design System: Ayush Das Portfolio

## Overview

**Creative North Star: "The Keynote Stage"**

A dark, materially rich engineering portfolio staged the way Apple stages a product: one confident chrome language, a single glowing accent per act, everything else standing back. A twisted glossy 3D ring anchors the scroll — it is not decoration, it is the exhibit, changing color as the visitor moves through six acts (intro, about, work, case studies, experience, credentials, contact). The interface behaves like glass and metal on a stage, not like a document.

Confirmed rejections: no generic dev-portfolio card grid, no purple-gradient hero, no neon/synthwave, no flat opaque chrome where a floating surface should read as material.

**Key Characteristics:**
- True-black stage with cool space-gray hardware and a rotating single-hue glow per section
- Translucent frosted glass on every floating surface (nav, cards, lightbox) — never two stacked
- Bold, tightly-tracked sans display type; no serif anywhere
- Instant, physical press feedback on every interactive element

## Colors

Neutral chrome dominates; color exists only as a single accent glow that rotates meaning per section — never competing accents on the same screen.

### Primary
- **System Blue** (#2997ff): links, monograms, the hero/contact ring glow, primary focus states.

### Secondary
- **System Purple** (#bf5af2): index numerals, section labels, the "work" act's ring glow.

### Tertiary
- **System Orange** (#ff9f0a): CTA hover warmth, certificate accents — used sparingly, never as a base color.

### Neutral
- **True Black** (#000000): page stage, body background.
- **Near Black** (#060608): the ring-poster fallback gradient base.
- **Ink** (#111113) / **Ink 2** (#1c1c1e): card and frame surfaces.
- **Off-White Text** (#f5f5f7): primary reading color, Apple's own off-white rather than pure white.
- **Warm Gray Muted** (#98989d): secondary text, captions, metadata.
- **Hairline** (rgba(255,255,255,0.14)) / **Hairline Soft** (rgba(255,255,255,0.08)): borders and dividers on black.

### Named Rules
**The One Glow Rule.** Exactly one accent hue is active per section (carried by the ring and mirrored in that section's labels). Two accent hues never appear as equals in the same viewport.

## Typography

**Display Font:** the OS system font (-apple-system/SF Pro on Apple platforms, Segoe UI Variable on Windows, Roboto on Android) — no webfont is loaded.
**Body Font:** the OS system font, same stack as Display.
**Label Font:** the OS system font, uppercase, tightly tracked.

**Character:** The real platform system font carries the whole system at different weights and tracking — bold and tight at display size, comfortable and neutral in body copy, small and confident in caps labels. No serif, no webfont load, no second display face — true to the OS the visitor is actually using.

### Hierarchy
- **Display** (650, clamp(3rem, 10.5vw, 8rem), line-height 1.02, letter-spacing -0.03em): hero name, contact headline, case-band titles.
- **Headline** (650, clamp(1.6rem, 3.4vw, 2.6rem), letter-spacing -0.02em): act headings ("Projects", "Experience").
- **Title** (600, ~1.2–1.5rem, letter-spacing -0.01em to -0.02em): card titles, xp roles, credential titles.
- **Body** (400, 0.82–0.95rem, line-height 1.5–1.85): descriptions, problem/approach copy, max ~56–75ch.
- **Label** (600, 0.62–0.74rem, letter-spacing 0.14em, uppercase): kickers, index numerals, nav counter, chips.

### Named Rules
**The Negative Tracking Rule.** Tracking tightens as size grows (-0.03em at display scale) and loosens toward neutral at body scale; caps labels get positive tracking (0.14em) instead of the old 0.42em maximalist spacing.

## Layout

Six full-height "acts" stacked vertically (`min-height: 100vh` each), the fixed 3D ring rendered behind them via a z-indexed canvas. Sections fade through a solid dark gradient (`.act-solid`) so the ring reads as showing "between" scenes rather than being covered. Content is edge-padded with `clamp()` (`clamp(1.2rem, 6vw, 6rem)` typical), so density adapts continuously rather than jumping between fixed breakpoints. Grids collapse from 4→2→1 columns at 1100px/560px for cards, 3→2→1 for credentials. Case bands split 44%/56% on desktop and stack on mobile (<880px).

## Elevation & Depth

Hybrid: flat black stage, translucent glass surfaces float above it. Depth comes from `backdrop-filter: blur()` + a faint white fill (rgba(255,255,255,0.04–0.06)) + a 1px hairline border, not from drop shadows — the one exception is the certificate lightbox and hover states, which add a soft directional shadow to read as physically lifted.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 4px 24px rgba(0,0,0,0.6)`): certificate thumbnail hover.
- **Lightbox pop** (`box-shadow: 0 8px 60px rgba(0,0,0,0.7)`): fullscreen certificate image.
- **Accent glow** (`box-shadow: 0 0 12px 1px var(--pa)`): the work-card baseline, tied to that project's accent.

### Named Rules
**The Glass-Not-Shadow Rule.** Nav, cards, and the lightbox get their depth from blur + translucency, not shadows. Shadows are reserved for the few elements meant to feel physically lifted off the glass (cert thumbnails, the lightbox image).

## Shapes

Consistently rounded, never sharp: 22–24px on cards and frames, 18px on smaller glass surfaces, 14px on thumbnails, full pill (999px) on buttons and dot indicators. Corner "ticks" (small L-shaped hairline brackets) mark the work cards' corners as a signature geometric detail, echoing camera-viewfinder framing.

## Components

### Buttons
- **Shape:** full pill (999px radius).
- **Primary (resume-btn):** translucent white fill (rgba(255,255,255,0.04)) + blur(16px), 1px hairline border, uppercase label type, padding 1rem 2.6rem.
- **Hover/Focus:** border shifts to system blue, fill warms to rgba(41,151,255,0.12); all interactive elements scale to 0.975 on `:active` for instant press feedback.

### Cards / Containers (work-card, skill-card, cred-cell)
- **Corner Style:** 18–22px radius, plus hairline corner ticks on work cards.
- **Background:** rgba(255,255,255,0.035–0.06), `backdrop-filter: blur(20–24px)`.
- **Shadow Strategy:** none at rest; accent-colored glow only as a hover/reveal signal (work-card baseline).
- **Border:** 1px hairline, brightens to the section's accent color on hover/focus.

### Navigation
- Fixed, full-width translucent bar (`rgba(10,10,12,0.55)` + `blur(20px) saturate(180%)`), 1px hairline bottom border. Wordmark centered; a left-edge act counter and right-edge dot rail (blue-glow active dot) provide wayfinding without a traditional link row, matching the single-screen scroll-story structure.

### Signature Component: The Ring
A 3D twisted-torus (three.js) with a neutral space-gray shell and a warm-to-cool inner glow that re-tints per act — the site's one recurring, load-bearing piece of "brand," carried nowhere else as an image or logo.

## Do's and Don'ts

### Do:
- **Do** keep exactly one accent hue live per section, mirrored between the ring glow and that section's labels.
- **Do** build every floating surface (nav, card, lightbox) as translucent glass — `backdrop-filter` + hairline border, never a flat opaque fill.
- **Do** give every clickable element instant `:active` press feedback (scale 0.975) — no waiting for release to show response.
- **Do** tighten letter-spacing as type size grows; loosen (small positive tracking) only on caps labels.

### Don't:
- **Don't** introduce a second display typeface or bring back a serif — Inter/Inter Tight carries the whole system.
- **Don't** stack two translucent surfaces on top of each other — legibility collapses.
- **Don't** let more than one accent color read as dominant in the same viewport.
- **Don't** add drop shadows to glass surfaces as a substitute for blur — depth comes from material, not shadow, except on the two named lifted elements.

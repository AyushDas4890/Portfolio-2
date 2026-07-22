---
id: 20260712-hero-ring
title: Hero 3D ring
tags: [code]
created: 2026-07-12
updated: 2026-07-12
related: [20260712-scroll-choreography, 20260712-design-system]
summary: Twisted-torus geometry, physical material, per-section palette API, perf caps.
---

# Hero 3D ring

> Summary: Twisted-torus geometry, physical material, per-section palette API, perf caps.

## Files
`src/three/RingScene.js` (plain three.js class), `src/three/RingCanvas.jsx` (React mount, ticker binding).

## Geometry
`buildRingGeometry(radial=200, tubular=64)`: TorusGeometry R=1.18, tube .46, then per-vertex sculpt — tube thickness breathes around the ring (`0.36 + 0.88·cos(θ−0.7)` factor) and cross-sections twist (`1.15·sin(θ+0.9)`), producing the frames' asymmetric open lip. Mobile (<768px): 110×40 segments.

## Materials
- Shell: MeshPhysicalMaterial, clearcoat 1 / clearcoatRoughness .06, roughness .2, metalness .18, envMapIntensity 1.7, iridescence .35 (IOR 1.6).
- Core: smaller torus (.98/.3) squashed z=.55, warm color + emissive — the interior glow.
- Glass lip (desktop only): torus 1.04/.335 z=.66, transmission .92, ior 1.45 — sits between shell and core, counter-rotates. Skipped on mobile (transmission is expensive).
- Env: PMREM RoomEnvironment. Tone mapping ACES, exposure 1.15.

## Per-section palettes
`SECTION_PALETTES[7]` = [shell, core, emissive] per act (hero, about, work, case, experience, credentials, contact); `setSection(i)` sets targets; render() lerps at .035/frame. Section index comes from `stage.section` (written by Nav's IntersectionObserver). MUST stay index-aligned with data.js `sections`.

## Motion (render loop)
- rotation.y = −.35 + progress·2.2π + idle sine; x/z add pointer tilt (±.12/.1).
- Position drifts right + down with progress; scale 1 → ~.45 (drift term `sin(p·π)`).
- Intro: `setIntro(v)` (stage.intro, 0→1 via runIntro after preloader): scale ×(.5+.5·intro), y −1.1·(1−intro), +1.4·(1−intro) on rotation.y — ring rises/settles in, then Hero text reveals.
- Base pose rotation (0.72, −0.35, −0.3), pos y .62, camera z 7.6 — tuned against frames; don't eyeball-change without screenshots.

## Perf / fallback
DPR ≤ 2; render skipped when `document.hidden`; touch devices get no pointer tilt. Constructor try/catch → `failed=true` → RingCanvas renders `.ring-poster` div. `dispose()` frees geometry/materials/renderer.

## Reduced motion
RingCanvas renders one static pose (progress .08) + a settle re-render at 300ms; no ticker.

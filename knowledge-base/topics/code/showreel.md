---
id: 20261005-showreel
title: Showreel player & media pipeline
tags: [code, ops]
created: 2026-10-05
updated: 2026-10-05
related: [20260712-design-system, 20260712-scroll-choreography, 20260702-build-deploy]
summary: How the 16:9/9:16 reel is chosen, played, scrubbed and encoded; avatar portrait clip.
---

# Showreel player & media pipeline

> Summary: How the 16:9/9:16 reel is chosen, played, scrubbed and encoded; avatar portrait clip.

## Choosing the cut (`src/components/Showreel.tsx`)
`(max-aspect-ratio: 2/3)` → 9:16 cut (phones held upright), else 16:9. The `<video>` is keyed by the MP4 path, so rotating a phone remounts it with the other cut. Frame width: landscape `min(100%, 100svh·16/9)` (full-bleed, capped so it never exceeds the viewport height); portrait `min(100% − gutters, 82svh·9/16)`; reduced motion keeps the landscape frame inside the gutters.

## Playback
- Muted autoplay only while ≥20% visible (IntersectionObserver); scrolling away pauses. A user pause sticks (`userPaused`).
- Clicking the picture (or the speaker pill) toggles sound; the first unmute restarts from 0.
- Chapter rail under the frame: proportional columns per chapter, fills painted per frame via refs, click seeks.
- Desktop cursor pill ("Play sound"/"Mute") follows the pointer via framer-motion springs; coordinates are divided by the current scroll scale and re-placed on scroll.
- Fullscreen: `frame.requestFullscreen()`; iPhone falls back to `video.webkitEnterFullscreen()`. `.reel-frame:fullscreen` CSS drops the scroll transform and letterboxes.
- `play()` rejections: AbortError ignored (pause interrupted it), NotAllowedError → end-card poster + "Play showreel" overlay.

## Files (`public/reel/`, `public/about/`)
- `showreel-16x9.mp4|webm`, `showreel-9x16.mp4|webm` (15 s, 60 fps, AAC/Opus audio), posters `*.webp` (first frame) and `*-end.webp` (name card, used when autoplay can't run). `public/og-image.jpg` is the 16:9 end card at 1200×630.
- `about/avatar-portrait.mp4|webm` + `.webp`: 4:5-ish crop of `public/avatar-head.mp4`, every frame a keyframe so cursor seeking is instant.

## Encoding (from the uploaded masters)
```
# H.264, faststart, keyframe every 2 s
ffmpeg -i master.mp4 -c:v libx264 -preset slow -crf 22 -profile:v high -pix_fmt yuv420p -g 120 -c:a aac -b:a 128k -movflags +faststart showreel-16x9.mp4
# VP9 fallback
ffmpeg -i master.mp4 -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 -deadline good -cpu-used 2 -g 120 -pix_fmt yuv420p -c:a libopus -b:a 112k showreel-16x9.webm
# avatar portrait (all-intra)
ffmpeg -i public/avatar-head.mp4 -vf "crop=960:1080:860:0,scale=800:900" -an -c:v libx264 -preset slow -crf 26 -g 1 -pix_fmt yuv420p -movflags +faststart avatar-portrait.mp4
```
CRF 22 halves the master size at SSIM ≈ 0.998. Playwright's bundled Chromium has no H.264 — it plays the WebM, which is also why the fallback exists.

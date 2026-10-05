---
id: 20261005-showreel
title: Showreel section
tags: [code, ops]
created: 2026-10-05
updated: 2026-10-05
related: [20260712-architecture, 20260702-build-deploy]
summary: The 15 s reel section after the hero — cut selection, playback, backdrop hand-off, encoding commands.
---

# Showreel section

> Summary: The 15 s reel section after the hero — cut selection, playback, backdrop hand-off, encoding commands.

## Where
`src/Showreel.tsx`, mounted in `App.tsx` between `<Hero />` and `<About />`; nav item "Showreel". Uses the shared `Section` (exported from `Sections.tsx`, with `fadeTop` because it is the first section after the unscrimmed hero) and `SectionHeader index="00"`.

## Behaviour
- `(max-aspect-ratio: 2/3)` → 9:16 cut, else 16:9. Frame width is derived from the viewport height so the frame plus its control bar fit on screen.
- Muted autoplay while ≥20% visible, paused when scrolled away; clicking the picture toggles sound (first unmute restarts from 0). Controls (play/pause, time, chapter rail, sound, fullscreen) sit in a glass bar *under* the frame.
- Reduced motion or blocked autoplay: end-card poster + ParticleButton "Play showreel".
- `useSpaceBackdrop('showreel')`: the dark backdrop now fades in over the avatar video as the reel arrives (it used to start at About), so the reel never plays over a second, moving avatar.

## Files (`public/reel/`) and encoding
MP4 (H.264) first, WebM (VP9) fallback for Chromium builds without H.264; posters are the first frame and the end card.
```
ffmpeg -i master.mp4 -c:v libx264 -preset slow -crf 22 -profile:v high -pix_fmt yuv420p -g 120 -c:a aac -b:a 128k -movflags +faststart showreel-16x9.mp4
ffmpeg -i master.mp4 -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 -deadline good -cpu-used 2 -g 120 -pix_fmt yuv420p -c:a libopus -b:a 112k showreel-16x9.webm
```
Chapter starts (Data 0, Language 3.7, Agents 5.75, Products 7.5, Models that ship 9, Stack 11.25, Ayush Das 12.75) are shared by both cuts; update `CHAPTERS` if the reel is re-cut.

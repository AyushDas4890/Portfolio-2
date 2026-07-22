---
id: 20260702-cowork-sandbox-quirks
title: Cowork sandbox quirks
tags: [ops, agent-env]
created: 2026-07-02
updated: 2026-07-02
related: [20260702-build-deploy]
summary: Mount sync bugs and the /tmp build workaround for Claude agents.
---

# Cowork sandbox quirks

> Summary: Mount sync bugs and the /tmp build workaround for Claude agents.

## Context
Applies only to AI agents working on this repo through the Cowork Linux sandbox mount. Human devs on Windows are unaffected.

## Symptoms
- `vite build` directly on the mounted folder → **Bus error** (native esbuild/rollup binaries can't mmap on the mount; node_modules may hold win32 binaries).
- Files read off the mount can carry trailing NUL bytes.
- Files OVERWRITTEN via agent Write/Edit tools may appear frozen/truncated on the mount indefinitely (old byte size, cut mid-line) while the Windows-side file is correct.

## Workaround
1. Copy `src public index.html package.json vite.config.js` to `/tmp/pw`; run `tr -d '\0'` over every text file.
2. After any Write/Edit, verify mount byte-size/tail; if stale, reconstruct the file in `/tmp/pw` via heredoc from context — don't wait for sync.
3. `npm install` + `npx vite build` in `/tmp/pw`; copy `dist/` back to the mount.
4. Headless verification: chrome-headless-shell in `/tmp/chrome` (`@puppeteer/browsers install chrome-headless-shell@stable`), `LD_LIBRARY_PATH=/tmp/libs/usr/lib/x86_64-linux-gnu` (libXdamage extracted from a .deb), flags `--no-sandbox --enable-unsafe-swiftshader`. Run preview server + screenshots in ONE bash call (background processes die between calls).

## Related
- [Build & deploy](build-deploy.md) — normal build pipeline.

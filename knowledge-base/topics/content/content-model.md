---
id: 20260712-content-model
title: Content model v4
tags: [content]
created: 2026-07-12
updated: 2026-10-05
related: [20260712-architecture]
summary: content.ts schema — links, reel, projects, experience, credentials, capabilities, stack.
---

# Content model v4

> Summary: content.ts schema — links, reel, projects, experience, credentials, capabilities, stack.

## Single source
Everything user-visible lives in `src/content.ts` ("no facts invented" — copy comes from the live portfolio, GitHub and the showreel). Local files are linked by path (`/certificates/...`, `/Ayush_Das_ML_Resume.pdf`) so preview deployments serve their own copies.

## Exports
- `LINKS` — email, github, linkedin, portfolio (production URL), resume.
- `REEL` — `landscape` / `portrait` cuts `{mp4, webm, poster, endPoster}`, `duration` 15, `chapters[7]` `{start, label}` (Data 0, Language 3.7, Agents 5.75, Products 7.5, Models that ship 9, Stack 11.25, Ayush Das 12.75 — read off rendered frames; both cuts share the timeline).
- `EXPERIENCE[2]` — VanillaKart internships, newest first, `certificate` → `/certificates/vanillakart-*.png`.
- `PROJECTS[6]` — `id`/`index` '01'–'06', title, tagline, blurb, tech[], github, demo, `image?` (`/projects/<slug>.webp`; ORCA Marine has none → generated art), `caseStudy {problem, approach, highlights[]}`.
- `ABOUT` — blurb, `stats[4]` (value strings like "6+", "8.08" — Counter keeps suffix/decimals), competencies, education ("degree · school"), focus, based.
- `CREDENTIALS[9]` — `{issuer, title, href}` → PDFs; `certificateThumb(href)` → `/certificates/thumbs/<slug>.webp`.
- `CAPABILITIES[4]` — the reel's chapters (word, reel caption, tools drawn from project stacks).
- `STACK[8]` — the reel's stack grid, same order; icons `/tech/mono/<icon>.svg` (Simple Icons, CC0).

## Adding a project
Append to `PROJECTS` with the next `id`; drop a ~1600px-wide screenshot as `public/projects/<slug>.png`, convert to WebP (`ffmpeg -i x.png -vf scale=1600:-1 -c:v libwebp -quality 80 x.webp`) and set `image`. Case-study route `#/work/<id>` appears automatically.

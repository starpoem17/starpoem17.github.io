# Architecture

Single static page built with Vite + Svelte 5 + GSAP ([ADR 0001](../adr/0001-vite-svelte-gsap.md)). `npm run dev` serves it locally; `npm run build` writes static files to `dist/`.

## Areas and Modules

| Area / Module | Responsibility | Source | Detail |
|---|---|---|---|
| Page entry | Loads the Knewave font and global CSS (`--u`), mounts `App` | `index.html`, `src/main.js`, `src/app.css`, `src/App.svelte` | this page |
| S tier data | Tier letter, title, background image path, card foil and foil mask, 5 card entries (name, image); the user's original images | `src/data/s-tier.json`, `public/images/slam-dunk/`, `images/s_tier/slamdunk/` | [s-tier-section.md](s-tier-section.md#data) |
| S tier section | Pinned, scroll-scrubbed sequence of Figma frames 1–9; card row; enlarged-card backdrop | `src/lib/STierSection.svelte` | [s-tier-section.md](s-tier-section.md) |
| Holo card | Pointer tilt, glare, foil effect (`rainbow`, `v` or `rainbow-rare`, optionally limited by a foil mask), click-to-enlarge for one card | `src/lib/HoloCard.svelte` | [holo-card.md](holo-card.md) |

Tiers A–F are planned but have no code (out of scope as of 2026-11-12).

## Deployment

GitHub Pages user site `https://starpoem17.github.io/`, repository `starpoem17/starpoem17.github.io` ([ADR 0002](../adr/0002-github-pages.md)). `.github/workflows/deploy.yml` runs on every push to `main`: `npm ci`, `npm run build`, then deploys `dist/`. The page is the S tier section only; the planned CV main page and menu have no code.

Verification: 2026-11-15, a fresh clone of this repository with the workflow added passed `npm ci` and `npm run build` (local Node 24; the workflow uses Node 22), and `vite preview` returned 200 for `/`, the JS and CSS bundles, `background.jpg`, `card-3.webp`, `foil-mask.svg` and `glitter.png`. Commit 6a7d3b1 was then deployed by GitHub Actions run 43690071364 (build and deploy succeeded); `https://starpoem17.github.io/` served the new `index.html`, whose bundles and the four image paths above returned 200, and a headless Chrome screenshot at 1920×1080 showed Figma frame 1 ("Tier List" in Knewave on black): `tmp/20261115_162900_pages-deploy-check/live-top.png`. The scroll sequence was not checked on the live site.

## Open questions

- CV main page: design not decided by the user; until then the main page starts the tier page directly and there is no menu. See [ADR 0002](../adr/0002-github-pages.md).
- `rainbow-rare` foil look on the S tier card borders: the user chose it from screenshots and set the rainbow to 60%; not yet reviewed in a browser. See [holo-card.md](holo-card.md#effect-layers).
- Card entrance animation in frame 9 is not specified in Figma; the agent chose a staggered rise and fade-in. See [s-tier-section.md](s-tier-section.md#timeline).
- Frames 5–6 interpretation: " Tier" is wiped out right → left and "S" stays white; Figma frame 5 shows a white → black gradient over "S Tier". See [s-tier-section.md](s-tier-section.md#timeline).
- Phone-gyroscope tilt (offered by poke-holo) is not implemented; it needs an iOS permission prompt. Ask the user whether it is wanted.
- Portrait/mobile layout: the 1920×1080 design is scaled to fit, so cards are small on phones.
- Design for tiers A–F and whether they share one scrolling page or use separate pages.

## History

- 2026-11-15: the planned deployment target changed from nginx on the user's Ubuntu server or a Render Static Site (never performed) to GitHub Pages. See [ADR 0002](../adr/0002-github-pages.md).
- 2026-11-15: the open question on the `v` foil look became moot: the user replaced the `v` foil on the S tier borders with `rainbow-rare` (rainbow + glitter) to make the red border less flat. See [holo-card.md](holo-card.md#effect-layers).
- 2026-11-14: the open question on the rainbow shine strength (`opacity × 0.55`, not reviewed) became moot for the S tier: the user replaced the rainbow foil on these cards with the `v` foil because it hid the manga and left the red border flat. See [holo-card.md](holo-card.md#effect-layers).
- 2026-11-14: the open question "frames 1–2 'Tier List' position" (page 33px and 18px lower than Figma, Figma moving it 15px between frames 1 and 2) was settled by the user's Figma edit, which put frames 1, 2, 4 and 5 on the title line; frames 1–2 now match the page. The page's frames 4–5 were changed to the new position the same day. See [s-tier-section.md](s-tier-section.md#history).
- 2026-11-14: the open question on card image resolution was settled: the user supplied the original images (`images/s_tier/slamdunk/`), and the cards are now 4x Figma renders of them. See [s-tier-section.md](s-tier-section.md#data).
- 2026-11-14: the open question on card names was settled by the user's Figma revision, which names the card groups (채치수, 정대만, 강백호, 송태섭, 서태웅). See [s-tier-section.md](s-tier-section.md#data).
- 2026-11-12: the open question "whether the red card border is part of every character card or marks the selected card" was settled by the user's Figma revision: all 5 cards have a 10px white outside border. See [holo-card.md](holo-card.md#effect-layers).
- 2026-11-12: the Figma revision replaced the gray placeholder slots and the single Kang Baekho card with 5 manga-panel cards, changed frame 4 from "S" to "S Tier", added a frame between the old frames 5 and 6 (frames are now 1–9), and moved the final title 61px down. Placeholder slot support was removed from the code. See [s-tier-section.md](s-tier-section.md#design-source).

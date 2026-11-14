# Tier

Project timezone: Asia/Seoul (KST, UTC+9). All `YYYYMMDD_HHMMSS` directory names use it.

## Current state

- **Goal**: a personal, non-commercial web page that presents the user's manga tier list with scroll-driven animation (reference: Apple product pages) and interactive holographic cards (reference: poke-holo.simey.me). No deadline. See [Purpose](#purpose-and-success-criteria).
- **Scope now**: only the S tier section (SLAM DUNK, 5 cards) is in scope. Tiers A–F exist in the plan but are out of scope until the user asks. See [architecture](architecture/README.md).
- **Implementation**: S tier section implemented with Vite + Svelte + GSAP under `src/` (run `npm run dev`), following the user's Figma design of 2026-11-14 with all 5 cards; verified in headless Chrome, not yet reviewed by the user, not deployed. Card images are 4x Figma renders of the user's originals in `images/s_tier/slamdunk/`; the cards use a Pokemon Rainbow Rare style foil (rainbow and glitter) on the red border and bars only, with a soft glare on the manga ([holo-card.md](architecture/holo-card.md)). Status and evidence are owned by [architecture/s-tier-section.md](architecture/s-tier-section.md) and [architecture/holo-card.md](architecture/holo-card.md).
- **Design source**: the user's Figma file `tier` (9 frames of the S tier flow, last revised by the user on 2026-11-14; read with the Figma REST API, token in `.env`). Frame-by-frame values are recorded in [architecture/s-tier-section.md](architecture/s-tier-section.md#design-source).
- **Decisions**: stack chosen in [ADR 0001](adr/0001-vite-svelte-gsap.md); data is a bundled JSON file and the site is deployed as static files (nginx on the user's Ubuntu server or a Render Static Site), see [ADR 0001](adr/0001-vite-svelte-gsap.md).
- **Repository**: Git repository since 2026-11-15 (user request). `tmp/` (verification screenshots referenced by the architecture documents) and `.env` (Figma REST API token) are excluded from Git and exist only locally; `images/` (the user's original images) is committed.
- **Open questions**: listed in [architecture/README.md](architecture/README.md#open-questions).
- **History**: decisions in [adr/](adr/README.md); no experiments are run in this project.

## Purpose and success criteria

Purpose: the user reads manga and ranks them in tiers as a hobby. This site shows that ranking with presentation effects.

Confirmed requirements (from the user, 2026-11-12):

- Tiers: S, A, B, C, D, E, F.
- S tier contains only SLAM DUNK. Its cards are **character** cards. Its intro follows the Figma flow: "Tier List" title → black → "S" → "S" moves left and "LAM DUNK" follows it to form "SLAM DUNK" → background and title reveal → title moves up and cards appear.
- A–F tiers: one page/section per tier listing several works, one **work** card per work. Not designed yet.
- Scroll animation: the screen is pinned and animation progress follows the scroll amount (scrubbed), like the Apple reference.
- Cards: tilt toward the pointer, moving light, holographic shine, and click-to-enlarge, like the poke-holo reference.
- Card rollout: the center card (Kang Baekho) first; the other 4 after the user approves it.

Changed by the user's Figma revision (2026-11-12): the intro shows "S Tier", and "S" moves left while " Tier" disappears; the 5 cards are manga panels of SLAM DUNK with white borders, all placed at once (replacing the Kang Baekho card and the rollout above). The user chose to use the Figma images first and decide on higher resolution after seeing them. Details: [architecture/s-tier-section.md](architecture/s-tier-section.md#design-source).

Changed by the user's Figma revision (2026-11-14): a new background image; each card is a collage of several SLAM DUNK panels with a red border, red corner bars and a "SHOHKU" + jersey number label, named after a character (채치수, 정대만, 강백호, 송태섭, 서태웅). The user supplied the original images and stated that the images outside the frames will not be used. Details: [architecture/s-tier-section.md](architecture/s-tier-section.md#design-source).
- Images are supplied by the user; copyright is not a concern for this private hobby site.

Constraints: static hosting; keep code minimal (see `AGENTS.md`).

## Documents

| Path | Contents |
|---|---|
| [CONTEXT.md](CONTEXT.md) | Glossary |
| [architecture/README.md](architecture/README.md) | Areas, Modules, source locations, open questions |
| [architecture/s-tier-section.md](architecture/s-tier-section.md) | S tier scroll sequence: design values, timeline, verification |
| [architecture/holo-card.md](architecture/holo-card.md) | Holographic card Module: Interface, effect layers, verification |
| [adr/README.md](adr/README.md) | Architecture decision records index |

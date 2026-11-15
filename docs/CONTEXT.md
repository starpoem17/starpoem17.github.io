# Glossary

| Term | Definition |
|---|---|
| CV main page | The planned main page of `starpoem17.github.io`: the user's CV with a Notion link and a small menu button that opens the tier page. Not designed yet. |
| Tier page | The manga tier list page (currently the S tier section only). Until the CV main page exists, it is the main page. |
| Tier | A rank level. The project uses S, A, B, C, D, E, F (S highest). |
| S tier section | The pinned, scroll-scrubbed sequence for the S tier (SLAM DUNK). Built from Figma frames 1–9. |
| Work | One manga title. A–F tiers list several works per tier. |
| S tier card | One of the 5 cards in the S tier row, each named after a SLAM DUNK character (채치수, 정대만, 강백호, 송태섭, 서태웅). Design details: [architecture/s-tier-section.md](architecture/s-tier-section.md#design-source). |
| Work card | A card showing one work. Used by A–F tiers (not implemented). |
| Foil | The moving holographic layer of a holo card. Three kinds: `rainbow`, `v` (Pokemon V style) and `rainbow-rare` (Pokemon Rainbow Rare style, with glitter). Details: [architecture/holo-card.md](architecture/holo-card.md#effect-layers). |
| Foil mask | An image whose opaque area limits a card's foil; the S tier cards use `public/images/slam-dunk/foil-mask.svg` (border and red bars). |
| Soft glare | The faint light spot drawn outside the foil mask (on the manga panels). |
| Holo card | The interactive card Module (`src/lib/HoloCard.svelte`): pointer tilt, glare, holographic shine, click-to-enlarge. |
| Scrub | Animation whose progress is tied to scroll position, so scrolling back reverses it. |
| Pin | Keeping a section fixed on screen while the user scrolls through its animation. |
| Design unit (`--u`) | CSS length equal to 1 Figma pixel of the 1920×1080 frame, scaled to fit the viewport: `min(100vw / 1920, 100vh / 1080)`. |
| Figma frame N | Frame N (1–9, top to bottom; numbering since the 2026-11-12 revision) of page "Page 1" in the user's Figma file `tier`. Node IDs are in [architecture/s-tier-section.md](architecture/s-tier-section.md#design-source). |

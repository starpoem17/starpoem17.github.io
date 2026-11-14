# Holo card

Source: `src/lib/HoloCard.svelte`. Effect principles follow poke-holo.simey.me; no code was copied (its source is GPL), see [ADR 0001](../adr/0001-vite-svelte-gsap.md).

## Implementation status

Implemented with three foil effects, `rainbow`, `v` and `rainbow-rare`; last verified in headless Chrome on 2026-11-15 (see [Verification](#verification)). The 5 S tier cards use `rainbow-rare` with a foil mask (user choice, 2026-11-15, from screenshots); `rainbow` and `v` are kept for later cards and are used by no card as of 2026-11-15. The user has not yet looked at `rainbow-rare` in a browser.

## Interface

- Props: `image` (URL), `name` (alt text and button label), `active` (enlarged or not), `ontoggle` (called on click or Enter/Space; the parent decides the new `active`), `foil` (`'rainbow'`, the default, `'v'` or `'rainbow-rare'`), `foilMask` (optional image URL).
- `foilMask`: the foil and its glare are drawn only where the mask image is opaque (CSS `mask-image`, stretched to the card); elsewhere the card gets only the soft glare. Without it, the foil covers the whole card and there is no soft glare. Each blended layer carries the mask itself, because a masked wrapper would isolate the layers from the art.
- The prop is named `foil`, not `effect`: in Svelte 5 a variable named `effect` makes `$effect` read as a store subscription and throws `store_invalid_shape`.
- Fills its parent box; the parent sets the size.
- When `active` becomes true, the card measures its resting rect and springs to the viewport center, scaled to 85% of the viewport's limiting dimension. The parent must render the backdrop and raise the card's container above it (done in [s-tier-section.md](s-tier-section.md)).

## Effect layers

- Pointer position → springs (`svelte/motion` `Spring`) → CSS variables. Spring settings: interaction stiffness 0.066 / damping 0.25; snap-back after leaving (500 ms delay) 0.01 / 0.06; enlarge 0.033 / 0.45.
- Tilt: `rotateY(-(x-50)/3.5 deg) rotateX((y-50)/2 deg)` with 600px perspective; the side nearest the pointer comes toward the viewer.
- No `will-change: transform` on the moving elements (removed 2026-11-15). The enlarged card is a `scale()` of the resting card, up to about 2.9x (user's window 1197×953, device pixel ratio 2: 206×281 → 594×810 CSS px); with `will-change`, Chrome may keep the bitmap drawn at the resting size and stretch it, and the user saw the enlarged card blurred. The card image (1320×1800) has more pixels than that enlarged card needs (1188×1620 device px), so a larger image would not help there. Not reproduced in headless Chrome (same sharpness with and without `will-change`); the user confirmed on 2026-11-15 that the enlarged card looks sharper in their browser after the change. If blur returns, the next option is to enlarge by layout size instead of `scale()`.
- Art: `object-fit: cover; object-position: top`. The image includes the card border (since 2026-11-14 the S tier card images are Figma renders with the red border), so the component draws no border; the tilted element has `border-radius: 10u` and `overflow: hidden`, which clips the shadow, shine and glare to the border's rounded outer corners. From 2026-11-12 to 2026-11-14 the component drew a 10u white border outside the image (`.frame`); before that, a 10u `#d02222` border centered on the edge of the only card.
- `rainbow` foil: shine = rainbow gradient + diagonal foil bands, `background-blend-mode: overlay`, `mix-blend-mode: color-dodge`, position follows the pointer; strength `opacity × 0.55`, brightness rises with distance from center (agent-chosen: `0.7` looked too strong, `tmp/20261112_213422_s-tier-verification/card-dev-opacity-0.7.png`). Glare: radial light at the pointer, `mix-blend-mode: overlay`. On the black-and-white manga cards it tinted and washed out the panels, and it could not change the pure red border (see below), which is why the user asked for a different effect.
- `v` foil (Pokemon V style, after poke-holo's "V" cards; written from scratch): horizontal pastel rainbow bands (`hue` blend) on diagonal 130° foil lines (dark navy with light gray-cyan lines, `hard-light`) over a radial shadow away from the pointer; a second copy with mirrored positions is mixed in with `soft-light`. The layer is composited with `mix-blend-mode: screen` (user choice for the S tier cards, 2026-11-14; replaced on those cards by `rainbow-rare` on 2026-11-15) instead of poke-holo's `color-dodge`: color-dodge, soft-light and overlay cannot change a channel that is 0 or 255, so they leave the pure red (#FF0000) border unchanged; screen keeps dark lines neutral like color-dodge but adds light to red. Compared alternatives: `hard-light` turned the border almost black, `color` turned it gray (`tmp/20261114_232000_v-foil-effect/compare-blend-labeled.png`). Glare: white-to-dark radial at the pointer, `hard-light`, `opacity × 0.5`.
- `rainbow-rare` foil (Pokemon Rainbow Rare style, after poke-holo's "Rainbow Rare" cards; written from scratch): two broad rainbow gradients at -30° and -60° (7 saturated hues, repeated 3 times, `soft-light` between them) moving in opposite directions with the pointer, composited with `screen` at `opacity × 0.8`; plus a glitter layer (`.sparkle`, rendered only for this foil): the tiling texture `public/images/foil/glitter.png` (256×256, colored dots and 4-point stars on black, generated by `tmp/20261115_002000_rainbow-rare-foil/make_glitter.py`, not downloaded) shown at 160u per tile, multiplied by a radial light at the pointer, shifted by 30% of the shine position, `screen`. Glare: the same as the `v` glare. Strength chosen by the user from screenshots (`tmp/20261115_002000_rainbow-rare-foil/compare-labeled.png`, `compare-labeled-2.png`): 80% over 40% rainbow, rainbow with color blend at 50%, glitter only and rainbow only.
- Soft glare (only with `foilMask`, whole card under the foil): faint white radial at the pointer, `overlay`, `opacity × 0.35`. Overlay leaves white unchanged and only lightens gray tones; on the pure red border it has no effect.
- On touch screens, dragging scrolls the page unless the card is enlarged (`touch-action: none` only while active).
- No focus indicator (user decision, 2026-11-12): the card is a button and keeps focus after a click, and pressing Escape makes Chrome treat the focus as keyboard focus (`:focus-visible`), so the former 2px white outline appeared around the closed card. Keyboard users can still Tab to a card and open it with Enter or Space, but cannot see which card is focused.
- Closing the enlarged card schedules the snap-back, because a shrinking card can leave the pointer outside without a `pointerleave` event.

## Verification

2026-11-15, `rainbow-rare` foil with the S tier foil mask, production build, headless Chrome 1920×1080, same view as the `v` measurement below. Evidence: `tmp/20261115_002000_rainbow-rare-foil/` (`steps-measure.json`, `measure/`, `measure/diff-heat.png`, `prod/`).

- Inside the red bars: mean change 58.3/255, 49.6% of pixels changed by more than 20/255.
- Manga panel area: mean change 8.3/255, 8.4% of pixels (the `v` run below measured 4.7/255 and 3.3%). The difference map shows the panel changes only where the soft glare lightens gray tones near the pointer; the soft glare CSS did not change, and why the value is higher than in the `v` run was not investigated.
- Hover tilt, enlarge, Escape and backdrop close pass (`prod/`); scroll frames 1–9 are pixel-identical to the run before this change.
- The dev server served the new foil (computed `screen` blend and 5 `.sparkle` layers) before the user was asked to look.
- Not checked: the user's browser, frame rate with the extra layer, Safari.

2026-11-15, after removing `will-change`: dev server at the user's window size (1197×953 CSS px, device pixel ratio 2), headless Chrome. Both moving elements report `will-change: auto`; hover tilt, enlarge, tilt while enlarged and Escape close work (`tmp/20261114_235800_card-resolution/after/`). Sharpness before the change at 1440×900, ratio 2: the enlarged card had about 80% of the edge detail of the card image resampled directly to its size, identical with and without `will-change` (`tmp/20261114_235800_card-resolution/`). The user confirmed the sharper enlarged card in their browser (Chrome, macOS). Not checked: frame rate while tilting.

2026-11-14, `v` foil with the S tier foil mask, headless Chrome 1920×1080, production build. Evidence: `tmp/20261114_232000_v-foil-effect/` (`steps-measure.json`, `measure/`, `prod/`, `cards-interaction.png`, `compare-blend-labeled.png`).

- Enlarged card 3 with the pointer near its top-left, compared with the same view with all effect layers hidden. Manga panel area: mean change 4.7/255, 3.3% of pixels changed by more than 20/255 (the `rainbow` foil on the same view: 15.1/255 and 30.6%). Inside the red bars: mean change 38.7/255, 48.8% of pixels (rainbow: 4.0/255, 6.8%).
- The tilt, enlarge, Escape and backdrop checks below passed again with the `v` foil (`prod/`, `cards-interaction.png`); scroll frames 1–9 are pixel-identical to the run before this change.
- The `rainbow` foil was shown by swapping the layer classes in the browser (`measure/rainbow.png`); its CSS did not change.
- Dev server: the user saw the border turn black where the light lines did not reach. The running dev server (port 5174) had missed the last edit and still served the hard-light version (it misses the second of two edits made within seconds; seen again on 2026-11-15 and cleared by re-saving the file); after a restart it serves `screen` and card 2 renders like the production build (`repro-after-restart/c2-stale-vs-fixed.png`: stale, fixed, fixed with the pointer at the center). The code was not changed for this.
- Not checked: the user's browser after the restart, Safari (unprefixed `mask-image`), touch input.

2026-11-14, `rainbow` foil, with the 4x card renders (border in the image). Evidence: `tmp/20261114_220800_s-tier-redesign/` (`steps-prod.json`, `cards-interaction.png`, `prod/`).

- Pointer over card 1 tilts it toward the pointer; shine and glare move and stay inside the rounded border.
- Clicking card 5 enlarges it to the center above a dimmed backdrop; the enlarged card is sharp; tilt works while enlarged; Escape closes it and the card returns to rest.
- Clicking card 3 enlarges it; clicking the backdrop closes it (no card left `aria-pressed=true`).
- Not checked: real mouse feel and frame rate on the user's machine, touch input, close on scroll.

2026-11-12 (white CSS border, previous card images; superseded above): the same checks passed on the dev server and production build, and after removing the focus outline, closing with a real Escape key event drew no outline (`tmp/20261112_231900_s-tier-figma-update/`, `focus-fix/esc-before-vs-after.png`). The focus check was not repeated on 2026-11-14; the focus styles did not change.

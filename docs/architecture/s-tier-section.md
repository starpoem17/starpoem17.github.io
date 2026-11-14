# S tier section

Source: `src/lib/STierSection.svelte`. Data: `src/data/s-tier.json`.

## Implementation status

Updated to the user's 2026-11-14 Figma revision (new background, 5 collage cards with red borders; all intro text on the title line, which the user confirmed as intended) and verified in headless Chrome on 2026-11-14 (see [Verification](#verification)). Not yet reviewed by the user.

## Responsibilities and Interface

- Prop `data`: `{ tier, title, background, cards: [{ name, image }] }`. `title` must start with `tier`; otherwise the component throws, because the intro turns the tier letter into the title's first letter.
- Renders the background, a black shade layer, the "Tier List" intro, the two-layer title, the card row, and a backdrop for the enlarged card.
- Owns which card is enlarged (`openCard`); closes it on backdrop click, Escape, or any scroll (the scrubbed card positions would otherwise move under the enlarged card).
- Caller constraint: the section is the page's only pinned ScrollTrigger; the timeline is built after `document.fonts.ready` because it measures text.

## Data

`cards` holds 5 entries in screen order; each renders a [holo card](holo-card.md). `cardFoil` (`"v"`) and `cardFoilMask` (`/images/slam-dunk/foil-mask.svg`) apply to all 5 cards. `name` is the accessible label, taken from the Figma group names ("채치수 카드", "정대만 카드", "강백호 카드", "송태섭 카드", "서태웅 카드").

The user's original image files are in `images/s_tier/slamdunk/` (16 files: 15 screenshots of 3420×2224 px, 1 JPEG of 1472×980 px). On 2026-11-14 every image used in Figma frames 1–9 matched one of these files by SHA-1 (Figma's image hash), and every file is used. Evidence: `tmp/20261114_215500_figma-rest-image-check/` (`file.json`, `local.sha1`).

Images served from `public/images/slam-dunk/`:

- `background.jpg`: an unchanged copy of the original `41c0c75766b7d35d8c27e4de6fa71e68.jpeg` (1472×980 px). Figma shows its top 1472×828 (16:9) stretched to 1920×1080; the page gets the same region with `object-fit: cover; object-position: top`.
- `card-1.webp` … `card-5.webp` (left to right): Figma REST API renders of the 5 card groups at scale 4 (1320×1800 px = 330×450 design px, including the border, corner bars and labels; transparent outside the rounded corners), converted to WebP at quality 88 (370–520 KB each). Figma renders the image fills from the same original files: a sample area of the 송태섭 card differs from a direct crop of its original by a mean of 2/255 per pixel, with similar edge detail. Built by `tmp/20261114_220800_s-tier-redesign/fetch_figma.sh` and `make_images.py`; the Figma renders are in `figma/` there.

- `foil-mask.svg`: the foil area of the card renders (viewBox 330×450): the 10px border ring with 10px rounded outer corners and the two red corner bars (33×178 at (5,5) and (293,267), rounded 5). Checked against the 5 renders: 0.003% of red pixels lie outside the mask; 8% of the mask is not red (the labels and antialiasing). Check results: `tmp/20261114_232000_v-foil-effect/mask-check.txt`.

| File | Figma group (node) |
|---|---|
| card-1 | 채치수 카드 (18:64) |
| card-2 | 정대만 카드 (18:52) |
| card-3 | 강백호 카드 (20:76) |
| card-4 | 송태섭 카드 (18:58) |
| card-5 | 서태웅 카드 (20:88) |

The cards are renders rather than compositions built from the originals in code, because the labels use the Nabla font: Figma draws it as black glyphs with a yellow outline, while browsers draw Nabla's color glyphs, and rendering it locally would need a font download. A Figma change to a card needs a new render (`fetch_figma.sh`, Figma REST API token `FIGMA_REST_API` in `.env`, no Figma MCP call).

## Design source

Figma file `tier` (key `LQjBwybEtUUXvz4aOoARJf`), page "Page 1", frames 1920×1080, numbered top to bottom. Read on 2026-11-14 with the Figma REST API (file version `2421692829640837787`, last modified 2026-11-14 14:04 UTC; frames 1, 2, 4, 5 were re-read after the user's edit, the other frames are unchanged from version `2421677814444476909`):

| Frame | Node | Content |
|---|---|---|
| 1 | 3:25 | Black; "Tier List", Knewave 200px, white; text box 761×355 at (579, 362), the same line as the title |
| 2 | 3:26 | "Tier List" at the same place; fill gradient black (left) → white (right) |
| 3 | 3:27 | Black |
| 4 | 3:28 | "S Tier" white, text box 761×355 at (579, 362): centered at x=959.5, on the title line |
| 5 | 3:36 | "S Tier" 171px left of frame 4 (box x=408), same line; fill gradient white (left) → black (right) |
| 6 | 7:183 | Black; only "S" visible, at its place in "SLAM DUNK" (rest black on black) |
| 7 | 3:29 | Background image (top 84.5% of the 1472×980 JPEG, stretched to the frame); shade gradient black 50% (left) → 100% (right); "SLAM DUNK" fill white (left) → black (right), 10px black outside stroke |
| 8 | 3:30 | Image without shade; title white with 10px stroke |
| 9 | 3:40 | Shade black 50%; title box center at y=158; 5 card groups, cards 310×430 at y=325, x = 68, 438, 806, 1174, 1543 (gaps 58–60px). Each card: a collage of 3–6 cropped manga panels from the screenshots, a 10px red (#FF0000) outside stroke with round joins, two red bars 22×168 (10px centered red stroke) at the top-left and bottom-right inner corners, and on each bar a vertical label "SHOHKU" + jersey number (4, 14, 10, 7, 11) in Nabla 15px, black with a 1px yellow (#EEFF00) outside stroke. The 서태웅 card also has a white 310×210 rectangle behind one panel. Gray 310×430 rectangles from the earlier design lie under the cards and are hidden by them |

The page places the 330×450 card renders (card + border) at y=315 with 39px gaps, centered: x = 57, 426, 795, 1164, 1533, within 2px of Figma (58, 428, 796, 1164, 1533).

Eight further images lie outside the frames on the canvas (the 6 card images of the 2026-11-12 design and 2 screenshots). The user stated on 2026-11-14 that none of them will be used; they have no original files in `images/`.

## How it works

- Sizes use the design unit `--u` (see [glossary](../CONTEXT.md)), so the 1920×1080 frame fits the viewport.
- Title = two stacked layers: a black layer with a 20u stroke drawn behind the fill (`paint-order: stroke fill`, giving the 10px outside stroke) and a white layer on top. The white layer's tier letter is always visible; its remaining letters have a moving mask. Black text on the black shade is invisible, which is how "LAM DUNK" stays hidden until the reveal.
- " Tier" is an absolutely positioned child of the white layer's tier letter, so it moves with the letter and never shifts the title. Its start offset is measured once from the rendered text so that "S Tier" is centered at x=959.5 (Figma frame 4). Svelte trims whitespace at the start of an element, so the space is written as an expression and kept with `white-space: pre`.
- Masked text (`.rest`, `.suffix`) has `padding-inline: 0.1em` with an equal negative margin. Knewave glyphs slant past their advance width (measured in Chrome at 200px: "LAM DUNK" ink 12px past the right end and 5px past the left, " Tier" 10px past the right), and a mask clips to the element box, so without the padding the ends of "K" and "r" were cut off and the black title layer showed through. The " Tier" width used for centering excludes this padding.
- All moves are CSS variables in design units (`--dx`, `--dy`, `--ty`, `--rise`, mask stops, shade alphas). No tween depends on the viewport size, so the timeline does not use `invalidateOnRefresh`.
- Every tween is a `fromTo` with explicit start values. An earlier version used `.to()` with `invalidateOnRefresh`; on refresh GSAP recorded later frames' values as start values, and the early frames showed the wrong state.
- `.cards` must not get a transform: the fixed backdrop inside it would then cover only the row.

## Timeline

One GSAP timeline, pinned for 700% of the viewport height, `scrub: 1` (1 s catch-up). Units are timeline seconds (total 9.1):

| Time | Step | Figma frame |
|---|---|---|
| 0–0.5 | hold | 1 |
| 0.5–2.5 | "Tier List" mask sweeps out left → right | 2 at 1.5, 3 at 2.5 |
| 2.8–3.4 | "S Tier" fades in | 4 |
| 3.7–4.7 | "S" moves 250u left (horizontal only) to its place in the title; " Tier" is wiped out right → left by a mask | 5 (in between), 6 at 4.7 |
| 4.7–6.7 | "LAM DUNK" mask and shade sweep left → right | 7 at 5.7, 8 at 6.7 |
| 7.1–8.3 | title moves up 382u, shade to 50% | 9 |
| 7.4–8.6 | cards rise 120u and fade in, 0.1 s stagger (agent choice) | 9 |
| 8.6–9.1 | hold | 9 |

Agent interpretations of frames 5–6, not confirmed by the user: frame 5's white → black gradient is drawn as a right-to-left wipe of " Tier" (the same mask technique as "Tier List"), so "S" stays white rather than light gray. At frame 5's scroll position the page has moved "S" 189u of 250u; Figma frame 5 shows 171u.

## Verification

2026-11-14, working tree without Git (no revision), Chrome headless 1920×1080 driven over the DevTools protocol, production build (`vite preview`), compared with Figma REST renders at 1x (frames 1, 2, 4, 5 from the 14:04 UTC version in `recheck/`, the others in `figma/`). Run after the glyph-clipping fix: `prod3/`, `prod3-result.json`, close-ups `k-fix/f8-K-figma-before-after.png` and `k-fix/f4-r-figma-before-after.png` (Figma, before, after). Run after the frame 4–5 code change and before the fix: `prod2/`, `prod2-result.json`. Earlier run of the same day before that change: `prod/`, `prod-result.json`, `figma-vs-page.png`, `f9-cards-figma-vs-page.png`. All in `tmp/20261114_220800_s-tier-redesign/`, steps in `steps-prod.json`.

- `npm run build`: passed without warnings.
- Frame 9: the cards match the Figma render (`f9-cards-figma-vs-page.png`); measured slot rects are 330×450 at y=315, x = 57, 426, 795, 1164, 1533. Mean absolute pixel difference from the Figma frame: 6–7/255.
- Frames 1–4 and 6–8: mean difference 0–3.5/255. Glyph boxes: "Tier List" (frame 1) top 453 in both, left 599 vs 598; "S Tier" (frame 4) top 462 vs 461, left 697 vs 696, right end 1225 vs 1224 (1216 before the glyph-clipping fix); "S" (frame 6) within 1px.
- Frame 5: vertical position matches (glyph top 463 vs 462); horizontal position differs as described in [Timeline](#timeline) (agent interpretation).
- Scrolling back to frames 6, 5, 4, 2, 1 gives screenshots identical to the forward ones.
- No console errors.
- Not checked: the dev server, window resize after load, other browsers (Safari, Firefox), touch devices, viewports other than 1920×1080, the user's own browser.

## History

- 2026-11-14: the user found the end of "K" drawn black on the dev server (frame 8). Cause: the white title layer's mask clipped glyph ink outside the element box; the same clipping cut the end of "r" in "S Tier" (frame 4 was 8px shorter than Figma, earlier attributed to a narrower space). Fixed with mask-box padding; see [How it works](#how-it-works).
- 2026-11-14: the user's Figma edit of 14:04 UTC put the intro text of frames 1, 2, 4 and 5 on the title line (y=362); the user confirmed this was intended. Before it, frame 1 had "Tier List" at y=329 and frame 2 at y=344 (the page drew both 33px and 18px lower), and frames 4–5 had "S Tier" 18px above the title line, centered at x=953.5, with "S" moving 244u left and 18u down. The code now starts "S Tier" on the title line, centered at x=959.5.
- 2026-11-14: the user's Figma revision replaced the background (now an original JPEG, no longer rotated) and the 5 single-panel cards with white borders by collage cards with red borders, corner bars and "SHOHKU" labels, and named the cards. Card images changed from crops of Figma downloads (310–466 px wide, card 5 and the card 4 inset from a 1x screenshot) to 4x Figma renders of the user's originals. Previous card files: `tmp/20261114_220800_s-tier-redesign/old-public/`.
- 2026-11-12 verification (superseded by the 2026-11-14 one): dev server and production build matched Figma frames 1–9 of that revision; "S Tier" started at x=690 as in Figma; frames 1–2 were not measured. Evidence: `tmp/20261112_231900_s-tier-figma-update/`.

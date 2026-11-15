# ADR 0001: Vite + Svelte + GSAP, static deployment, bundled JSON data

Status: Accepted (2026-11-12). Deployment part replaced by [ADR 0002](0002-github-pages.md) on 2026-11-15.

## Context

The user wants Apple-style pinned, scroll-scrubbed animation and poke-holo-style interactive cards. Only the S tier is implemented now; tiers A–F will follow and will repeat work cards generated from data. The site is a private hobby site to be served from the user's Ubuntu server or Render.

## Decision

- **GSAP ScrollTrigger** for pinning and scrubbing. Agent choice: CSS scroll-driven animations have uneven browser support; GSAP is free and handles pin + scrub + reversible timelines.
- **Svelte 5 on Vite** for page structure and the card Module. The agent first proposed plain JavaScript for an S-only scope; the **user** chose Svelte now so the card Module and the Svelte + GSAP integration are verified before A–F. Spring motion uses `svelte/motion`.
- **No SvelteKit** for now: one page only. Revisit if A–F need separate routes.
- **Data**: a JSON file under `src/data/` bundled at build time; images under `public/images/`. No backend or database. Agent recommendation accepted by the user; revisit if browser-based editing is wanted.
- **Deployment** (replaced by [ADR 0002](0002-github-pages.md) on 2026-11-15): `npm run build` produces static files in `dist/`, served by nginx or a Render Static Site.
- **Card effect code**: written from scratch on the same principles as poke-holo (pointer → CSS variables, springs, blend-mode layers). poke-holo's source is GPL-licensed and is not copied.

## Consequences

- Every data change needs a rebuild and redeploy.
- Svelte component lifecycles must clean up ScrollTrigger instances (done in `onMount` return).

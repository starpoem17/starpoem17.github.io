# ADR 0002: Deploy to GitHub Pages as the user site starpoem17.github.io

Status: Accepted (2026-11-15). Replaces the deployment part of [ADR 0001](0001-vite-svelte-gsap.md).

## Context

Until 2026-11-15, `starpoem17.github.io` was the user's CV page, built with Quartz from Obsidian notes in a separate local repository (`~/projects/quartz`). The user decided to stop publishing Obsidian notes (a Notion link will replace them) and judged that most of the Quartz code existed only to render those notes. The user therefore chose to discard the Quartz site and rebuild `starpoem17.github.io` from this project (user decision, 2026-11-15).

Target page structure (user requirement): the main page shows the user's CV, and a small menu button opens the manga tier page. The CV design is not decided yet, so for now the main page starts the tier page directly.

ADR 0001 had chosen nginx on the user's Ubuntu server or a Render Static Site, for a private site. The site is now public; the user stated that publishing the manga images is acceptable because the site is non-commercial (2026-11-15).

## Decision

- **Repository**: this repository is pushed to `starpoem17/starpoem17.github.io` and replaces its `main` by force push (user approval, 2026-11-15). The domain is tied to that repository name, so keeping the repository keeps the domain and its Pages setting (source: GitHub Actions). Agent recommendation, accepted by the user, over renaming the old repository and creating a new one, which would need the Pages setting redone and the old repository's Pages turned off.
- **No archive of the Quartz history** on GitHub (user decision). The user chose 5 items of the old CV page to keep locally only, not pushed: profile photo, email address, LinkedIn link, GitHub link and CV file. They are in `tmp/20261115_162615_old-cv-assets/`. The Obsidian files are backed up elsewhere by the user.
- **Build and deploy**: `.github/workflows/deploy.yml` runs on every push to `main`: `npm ci`, `npm run build`, then uploads `dist/` with `actions/upload-pages-artifact` and deploys it with `actions/deploy-pages` (Node 22, the same structure as the former Quartz workflow). As a user site it is served at the root path, so the Vite `base` stays `/` and the absolute `/images/...` paths work.
- The Quartz repository's Dependabot branches were deleted from GitHub (user approval), since they updated Quartz dependencies only.

## Consequences

- Every push to `main` redeploys the public site.
- The repository is public: everything committed, including `images/` (the user's original images), is publicly visible. `.env` (Figma token) and `tmp/` stay Git-excluded.

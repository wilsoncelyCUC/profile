# Repository Guidelines

## Project Structure & Module Organization
This repository is an Astro static site for a profile/landing page.

- `src/pages/`: route entry points (`value.astro`, `preview.astro`).
- `src/layouts/`: shared page shells (for example `ValueLayout.astro`).
- `src/components/`: reusable UI and page sections (`layout/`, `sections/`, `ui/`).
- `src/content/`: Markdown/MDX content collections (`services/`, `case-studies/`).
- `src/data/`: typed configuration (`site-config.ts`).
- `src/styles/`: global styles and design tokens (`global.css`).
- `public/`: static assets (images, legacy HTML/CSS).
- `dist/`: build output (generated; do not edit manually).
- `.github/workflows/`: CI workflows (Pages deploy + PR review automation).

## Build, Test, and Development Commands
- `npm install`: install dependencies locally.
- `npm run dev` (or `npm start`): run Astro dev server.
- `npm run build`: create production build in `dist/`.
- `npm run preview`: preview the built site locally.
- `npm run astro -- check`: optional Astro project checks.

CI (GitHub Pages) runs `npm ci` and `npm run build` on pushes to `master` and `layout`.

## Coding Style & Naming Conventions
- Use 2-space indentation across Astro, TS, CSS, and YAML files.
- Keep components in PascalCase (for example `ContactCTA.astro`, `Modal.astro`).
- Keep content filenames in kebab-case (`ai-value-realization.md`).
- Prefer path alias imports via `@/*` for `src/*` when practical.
- Keep Tailwind utility usage consistent with tokens defined in `src/styles/global.css` and `tailwind.config.mjs`.

## Testing Guidelines
There is currently no dedicated automated test suite in this repository.

- Minimum contribution check: run `npm run build` before opening a PR.
- For UI changes, validate in `npm run dev` and `npm run preview`.
- If adding tests, place them under `tests/` and use `*.spec.ts` naming.

## Commit & Pull Request Guidelines
Git history favors short, imperative commit messages (for example: `Add customers section...`, `Remove Proof section...`).

- Write focused commits with clear action-oriented subjects.
- Open PRs with a concise summary, linked issue (if any), and scope of changes.
- Include screenshots/GIFs for visual updates to pages/components.
- Ensure build passes and avoid committing generated/local artifacts (except intentional `dist/` updates).

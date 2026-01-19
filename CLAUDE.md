# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Wilson Cely with:
- Original profile page (vanilla HTML/CSS at `/`)
- Value Proposition landing page (Astro at `/value`)

## Tech Stack

- Astro 5.x (framework)
- Tailwind CSS (styling)
- Alpine.js (light interactivity)
- Markdown/MDX (content)
- Google Fonts (Roboto, Space Mono)

## File Structure

```
profile/
├── public/                    # Static assets (served as-is)
│   ├── index.html            # Original profile page
│   ├── style.css             # Original styles
│   ├── images/               # Profile images
│   └── .nojekyll
├── src/
│   ├── components/
│   │   ├── layout/           # BaseHead, Header
│   │   ├── sections/         # Hero, Pillars, Services, etc.
│   │   └── ui/               # ServiceCard, CaseStudyCard
│   ├── content/
│   │   ├── services/         # Service markdown files
│   │   └── case-studies/     # Case study markdown files
│   ├── data/
│   │   └── site-config.ts    # Editable copy (hero, pillars, CTAs)
│   ├── layouts/
│   │   └── ValueLayout.astro
│   ├── pages/
│   │   └── value.astro       # Value Proposition page
│   └── styles/
│       └── global.css        # Tailwind imports
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## Development

```bash
npm run dev      # Start dev server at localhost:4321
npm run build    # Build for production
npm run preview  # Preview production build
```

Access the value page at: `http://localhost:4321/profile/value`

## Content Editing

Edit content without touching components:

1. **Hero, pillars, CTAs:** `src/data/site-config.ts`
2. **Services:** `src/content/services/*.md`
3. **Case studies:** `src/content/case-studies/*.md`

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on push to `master` or `layout`.

## Architecture Notes

- Color scheme: Blue-gray (#575F7D), green accent (#0abf53), light background (#F7F9FC)
- Alpine.js handles scroll reveal animations and mobile menu
- Content collections use Zod schemas for type safety

## Documentation Reference

Use Context7 MCP server to check up-to-date documentation when:
- Implementing new libraries or frameworks
- Adding features using existing dependencies
- Verifying correct API usage and best practices

## Git Branches

- `layout` - Development branch
- `master` - Main branch

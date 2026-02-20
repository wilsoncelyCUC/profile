# Newsletter RSS Panel. Design Document

Date: 2026-02-19
Branch: main

## Objective

Enhance the existing newsletter section by adding a second panel that shows the 10 latest Beehiiv articles from RSS in a compact, scrollable UI.

The existing static newsletter card remains. The new feed panel appears next to it on desktop and stacked below it on mobile.

## Confirmed Product Decisions

- Feed source: `https://rss.beehiiv.com/feeds/1QQU1QTjnm.xml`
- Refresh model: build-time only (updates on site redeploy)
- Desktop layout: new panel next to existing card
- Mobile layout: panel stacked below existing card
- Item content: title + one-line excerpt
- Link behavior: open article in new tab

## Architecture

Use a shared data utility at build time.

- Create `src/lib/newsletter-feed.ts` to fetch and parse RSS XML.
- Normalize entries to:
  - `title: string`
  - `excerpt: string`
  - `link: string`
- Limit to top 10 entries.
- Import the utility in `src/components/sections/Newsletter.astro` and render the returned list.

This keeps feed logic reusable and keeps the section component focused on presentation.

## Components and Layout

### Existing card (left/top)

Keep the current newsletter marketing card and CTA unchanged.

### New feed panel (right/bottom)

Add a second `surface-card` panel:

- Header: "Latest from the newsletter"
- Body: fixed-height, scrollable list of 10 article cards
- Article card:
  - title (clamped)
  - one-line excerpt (clamped)
  - hover/focus style for clear click affordance
  - entire card is a link

### Responsive behavior

- Mobile (`< lg`): one column, feed panel below the existing card
- Desktop (`>= lg`): two columns with balanced spacing

## Data Flow

1. `astro build` runs
2. `Newsletter.astro` calls `getNewsletterFeed()` from `src/lib/newsletter-feed.ts`
3. Utility fetches RSS XML and parses `<item>` nodes
4. Utility returns max 10 normalized article objects
5. Section renders scrollable feed sub-cards

No client-side fetch is required.

## Error Handling

If RSS fetch or parse fails:

- Do not break page rendering
- Render fallback state inside the feed panel:
  - short message that latest posts are temporarily unavailable
  - keep/read CTA to newsletter homepage
- Log concise server/build error for debugging

This avoids deploy failure from temporary upstream feed issues.

## Testing and Verification

Given current project tooling, minimum verification for this feature:

- Run `npm run build` and confirm success
- Run `npm run dev` and validate:
  - desktop side-by-side layout
  - mobile stacked layout
  - scroll behavior of feed panel
  - links open in new tab
  - fallback behavior when feed cannot be read (simulated)

Optional future hardening:

- Add parser-focused tests for `src/lib/newsletter-feed.ts` with sample RSS fixtures.

## Files Expected to Change

- Create: `src/lib/newsletter-feed.ts`
- Modify: `src/components/sections/Newsletter.astro`
- Possibly modify: `src/styles/global.css` (only if small helper styles are needed)

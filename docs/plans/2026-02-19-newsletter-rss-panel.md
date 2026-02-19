# Newsletter RSS Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a build-time RSS-powered "latest articles" panel to the newsletter section while preserving the existing static card.

**Architecture:** Introduce a shared feed utility (`src/lib/newsletter-feed.ts`) that fetches and parses the Beehiiv RSS during Astro build. `Newsletter.astro` renders a 2-panel layout: existing card + scrollable latest-post list. Feed errors degrade gracefully without breaking build output.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS

---

## Task 1: Add RSS Feed Utility

**Files:**
- Create: `src/lib/newsletter-feed.ts`

**Step 1: Create data model and constants**

Add a `NewsletterArticle` type and constants for feed URL and max items (10).

**Step 2: Add XML-safe helpers**

Implement helpers for:
- stripping CDATA wrappers
- decoding common HTML entities
- stripping HTML tags for excerpt text
- trimming whitespace

**Step 3: Parse `<item>` blocks**

Implement a parser that extracts `title`, `link`, and `description` from each RSS item.

**Step 4: Add public fetch function**

Implement `getNewsletterFeed()` that:
- fetches RSS URL
- handles non-OK responses
- parses items
- returns top 10 valid entries
- catches errors and returns `[]`

**Step 5: Commit**

```bash
git add src/lib/newsletter-feed.ts
git commit -m "feat: add build-time newsletter RSS feed utility"
```

---

## Task 2: Render Feed Panel in Newsletter Section

**Files:**
- Modify: `src/components/sections/Newsletter.astro`

**Step 1: Import feed utility and fetch at build time**

Use top-level `await getNewsletterFeed()` in frontmatter.

**Step 2: Replace single-card container with responsive 2-panel layout**

- Keep existing card content unchanged.
- Add second panel titled "Latest from the newsletter".
- Desktop: 2 columns.
- Mobile: stacked.

**Step 3: Render scrollable article list**

For each article:
- full-card anchor
- title
- one-line excerpt
- open in new tab (`target="_blank" rel="noopener noreferrer"`)

**Step 4: Add fallback state**

If feed array is empty:
- show unavailable message
- include CTA link to newsletter homepage

**Step 5: Commit**

```bash
git add src/components/sections/Newsletter.astro
git commit -m "feat: add newsletter latest-articles panel"
```

---

## Task 3: Verify Build and Responsiveness

**Files:**
- No new files required

**Step 1: Build verification**

Run:
```bash
npm run build
```

Expected:
- Astro build succeeds
- no runtime errors in newsletter section

**Step 2: Manual responsive check**

Run:
```bash
npm run dev
```

Validate:
- desktop side-by-side panels
- mobile stacked panels
- feed panel scrolls internally
- cards open article links in new tab

**Step 3: Optional fallback simulation**

Temporarily set invalid RSS URL in utility and confirm fallback UI renders, then revert.

**Step 4: Final commit (if any verification-only adjustments)**

```bash
git add <changed-files>
git commit -m "chore: polish newsletter RSS panel behavior"
```

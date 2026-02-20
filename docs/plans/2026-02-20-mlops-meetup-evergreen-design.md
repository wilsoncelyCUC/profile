# MLOps Meetup Card — Evergreen Design

**Date:** 2026-02-20
**Status:** Approved

## Problem

The community event card in `site-config.ts` had a hardcoded `date: 'Jan 28, 2026'` (past) and `spotsLeft: '4 spots left'` with urgency text "Seats Filling Fast" — misleading for a past event and requiring manual updates each month.

## Decision

Remove `date` and `spotsLeft` fields. Make the card evergreen by changing `urgencyText` to `'Monthly Meetup'`.

## Changes

### `src/data/site-config.ts`
- Remove `date` field from `community.event`
- Remove `spotsLeft` field from `community.event`
- Change `urgencyText` from `'Seats Filling Fast'` to `'Monthly Meetup'`

### `src/components/sections/Community.astro`
- Remove the `<p>` rendering `community.event.date`
- Remove the `<span>` rendering `community.event.spotsLeft`
- Simplify the button row div (no more space-between flex needed)

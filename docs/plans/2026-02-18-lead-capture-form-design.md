# Lead Capture Form — Design Document

**Date:** 2026-02-18
**Branch:** `formulaire`
**Author:** Wilson Cely

---

## Problem

The landing page currently sends visitors directly to cal.com with no intermediate capture. If someone clicks "Book a Discovery Call" and abandons the booking, there is no record of the lead. There is also no mechanism to pre-qualify or contextualize a call before it happens.

## Goal

Add a modern multi-step lead capture form that:
1. Collects structured context from the visitor before they book
2. Persists the lead to Supabase regardless of whether they complete the booking
3. Sends a real-time Telegram notification when a lead is captured
4. Lets the visitor book a slot inline via cal.com as the final step

---

## User Flow

```
[Book a Discovery Call] clicked (Hero or ContactCTA)
        ↓
Full-screen overlay opens (dark backdrop, Escape to close)
        ↓
Step 1  "What's your name?"
        ↓
Step 2  "What's your email?"
        ↓
Step 3  "Your company and role"
        (two inputs: company name + title/role)
        ↓
Step 4  "Company website"
        (optional, skip allowed)
        ↓
Step 5  "What do you need from me?"
        (free-text textarea)
        CTA: "Book a Call →"
        ← Supabase INSERT fires here. Telegram notification triggers here.
        ↓
Step 6  Embedded cal.com calendar (lazy-loaded)
        User picks slot → cal.com sends confirmation email
        ↓
Brief "You're booked" confirmation state in modal
```

**PM rationale on save timing:** The lead is saved at step 5→6 transition, not on booking completion. This captures leads who get interrupted or abandon the calendar step.

---

## Component Architecture

### New files

| File | Purpose |
|------|---------|
| `src/components/ui/LeadCaptureModal.astro` | Full-screen overlay with Alpine.js step state, form fields, Supabase call, cal.com embed |
| `supabase/functions/notify-telegram/index.ts` | Deno Edge Function — receives DB webhook, sends Telegram message |

### Modified files

| File | Change |
|------|--------|
| `src/components/sections/Hero_2.astro` | Primary CTA: `<a href>` → modal trigger button |
| `src/components/sections/ContactCTA_2.astro` | "Book a Discovery Call" → modal trigger button |
| `src/components/pages/LandingPage_2.astro` | Add `<LeadCaptureModal />` once at page level |

### Not reusing Modal.astro

The existing `Modal.astro` caps at `max-w-2xl` and has a fixed header/body/footer structure. The typeform experience requires full viewport height, centered single-field layout per step, and a custom progress bar. A new dedicated component avoids fighting the existing structure.

---

## Data Model

**Supabase table:** `leads`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `name` | `text` | NOT NULL |
| `email` | `text` | NOT NULL |
| `company_name` | `text` | nullable |
| `role` | `text` | nullable |
| `company_website` | `text` | nullable |
| `description` | `text` | nullable |
| `created_at` | `timestamptz` | DEFAULT `now()` |

**Row Level Security policy:**
- Anon key: INSERT only (public-facing form can write, cannot read)
- Authenticated: full access (for Wilson to review leads)

---

## Backend Flow

```
Browser (Alpine.js + @supabase/supabase-js)
  └─ INSERT into leads table (using PUBLIC anon key)
        ↓
Supabase Database Webhook
  trigger: INSERT on public.leads
  target: Edge Function URL
        ↓
Edge Function: notify-telegram
  reads new row from webhook payload
  calls Telegram Bot API
        ↓
Telegram message:

  🔔 New Lead
  👤 {name}
  📧 {email}
  🏢 {company_name} — {role}
  🌐 {company_website}
  💬 "{description}"
```

**Credentials:**
- `PUBLIC_SUPABASE_URL` — in `.env`, safe in browser
- `PUBLIC_SUPABASE_ANON_KEY` — in `.env`, safe in browser (insert-only RLS)
- `TELEGRAM_BOT_TOKEN` — Supabase Edge Function secret only, never in browser or repo
- `TELEGRAM_CHAT_ID` — Supabase Edge Function secret only

---

## Cal.com Integration

- Uses cal.com's official inline embed (`Cal("inline", {...})`)
- Script lazy-loaded when Alpine.js enters step 6 (avoids loading on page init)
- Brand color set to `#0abf53` (site green accent) via cal.com UI config
- Booking link: `wilsoncely/discovery-call` (existing)

---

## UX Details

- **Progress indicator:** thin bar at the top of the overlay, fills 1/6 per step
- **Keyboard navigation:** Enter advances step, Escape closes modal
- **Validation:** per-step before advancing (name non-empty, email format, etc.)
- **Optional field:** company website shows "Skip →" alongside "Next →"
- **Loading state:** brief spinner between step 5 submit and step 6 cal.com load
- **Error state:** if Supabase insert fails, user sees a non-blocking warning but cal.com still loads (lead capture failure does not block booking)

---

## Out of Scope

- Email confirmation to the visitor (cal.com handles this)
- CRM sync beyond Supabase
- Lead scoring or conditional routing
- Admin dashboard to view leads (Supabase dashboard serves this for now)

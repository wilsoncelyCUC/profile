# Community Host Modal. Design Document

Date: 2026-02-19
Branch: form2_community2

## Objective

Add a "Community Host" modal form to the landing page. The form captures sponsor or co-host interest, stores the record in Supabase, and fires a Telegram notification with a direct link to the record in the Supabase Dashboard.

## Tech Stack

- Frontend: Astro, Tailwind CSS, Alpine.js
- Backend: Supabase (Database + Edge Functions)
- Notifications: Telegram via a new Edge Function
- Testing: Playwright

---

## Architecture

```
Community section
  . "Become a Sponsor" button
        . dispatches CustomEvent('open-community-host-modal')
              . CommunityHostModal.astro (Alpine.js)
                    . Step 1: full_name (required)
                    . Step 2: email (required)
                    . Step 3: phone_number (optional)
                    . Submit
                          . supabase.from('community_hosts').insert(record)
                          . [Database Webhook fires automatically]
                                . notify-telegram-on-community-host (Edge Function)
                                      . Telegram message with deep link to record
```

---

## Data Contract

### Supabase Table: `community_hosts`

| Column         | Type        | Constraints                    |
|----------------|-------------|--------------------------------|
| id             | uuid        | PK, default gen_random_uuid()  |
| created_at     | timestamptz | default now()                  |
| full_name      | text        | NOT NULL                       |
| email          | text        | NOT NULL                       |
| phone_number   | text        | nullable                       |

### RLS Policies

Matching the `leads` table pattern:

- INSERT: allowed for the `anon` role (frontend submits with anon key)
- No SELECT, UPDATE, or DELETE policies via client. Read via Dashboard only.

### Edge Function Payload

Supabase Database Webhook sends on INSERT:

```json
{
  "type": "INSERT",
  "table": "community_hosts",
  "record": {
    "id": "uuid",
    "created_at": "2026-02-19T10:00:00Z",
    "full_name": "Jane Smith",
    "email": "jane@company.com",
    "phone_number": "+49123456789"
  }
}
```

### Telegram Message Format

```
New Community Host Application
Jane Smith
jane@company.com
+49123456789
https://supabase.com/dashboard/project/ebfvxfegegmqevmelcil/editor?filter=id%3Aeq%3A{id}
```

Phone line is omitted if `phone_number` is null.

---

## Edge Function

File: `supabase/functions/notify-telegram-on-community-host/index.ts`

- New function, independent from `notify-telegram` (no shared code, no regression risk)
- Reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from Deno env (same secrets as existing function)
- Reads `payload.record` from the Webhook POST body
- Constructs the message lines, omitting phone if absent
- Appends the Supabase Dashboard deep link using the hardcoded project ID
- Returns `{ ok: true }` on success, `{ ok: false, error }` on failure
- Wrapped in try/catch matching the existing function pattern

---

## Component Behavior

File: `src/components/ui/CommunityHostModal.astro`

### Trigger

The "Start a conversation" button in `Community.astro` dispatches:

```js
window.dispatchEvent(new CustomEvent('open-community-host-modal'))
```

### Modal Steps

| Step | Field        | Required | Notes                        |
|------|--------------|----------|------------------------------|
| 1    | full_name    | Yes      | Enter to advance             |
| 2    | email        | Yes      | Validated with regex         |
| 3    | phone_number | No       | "Skip" button visible        |

### States

- Default: closed
- Open: step 1 visible, progress bar at 33%
- Loading: spinner on submit button, insert in flight
- Success: checkmark, "We'll be in touch" message, close button
- Error: non-blocking amber warning below the form (same pattern as LeadCaptureModal)

### UX Details

- Dark navy background with cyan accent. Matches LeadCaptureModal exactly.
- JetBrains Mono for the step counter
- Progress bar advances on each step
- Back button visible from step 2 onward
- Escape key and backdrop click close the modal
- Body scroll locked while modal is open
- Input auto-focused on each step transition

### Error Handling

- Supabase client missing (env vars absent): insert skipped silently, success state still shown
- Supabase insert error: amber warning shown, success state still shown (user submitted in good faith)
- No explicit fetch timeout beyond browser defaults, consistent with LeadCaptureModal

---

## Files Changed

| Action | File |
|--------|------|
| New    | `supabase/functions/notify-telegram-on-community-host/index.ts` |
| New    | `src/components/ui/CommunityHostModal.astro` |
| New    | `tests/community_host.spec.ts` |
| Edit   | `src/components/sections/Community.astro` (swap button onclick) |
| Edit   | `src/components/pages/LandingPage.astro` (mount modal component) |

---

## Playwright Test Contract

File: `tests/community_host.spec.ts`

Four scenarios, all using mocked Supabase responses:

1. Modal opens when `open-community-host-modal` event is dispatched
2. Submit is blocked when `full_name` is empty (required field validation)
3. Submit is blocked when `email` is empty or invalid
4. Submit succeeds and success state is visible when `phone_number` is empty (optional field)

---

## Out of Scope

- Email confirmation to the submitter
- Admin dashboard or CRM integration
- Rate limiting on the Edge Function
- Analytics events on step transitions (noted as a future TODO in LeadCaptureModal)

# Community Host Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a 3-step lead capture modal for community host/sponsor interest that saves to a `community_hosts` Supabase table and fires a Telegram notification via a new Edge Function.

**Architecture:** Frontend-only modal (Alpine.js) inserts a row via the Supabase anon client. A Supabase Database Webhook fires `notify-telegram-on-community-host` automatically on INSERT. The Edge Function formats the Telegram message and includes a dashboard deep link. No changes to the existing `notify-telegram` or `LeadCaptureModal`.

**Tech Stack:** Astro, Tailwind CSS, Alpine.js, Supabase JS v2, Deno Edge Functions, Playwright (@playwright/test)

---

## Task 1: Bootstrap Playwright

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/community_host.spec.ts` (empty placeholder)

**Step 1: Install @playwright/test**

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

Expected: exits 0, `node_modules/@playwright/test` exists.

**Step 2: Create `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
```

**Step 3: Add test script to `package.json`**

In `package.json`, add to `"scripts"`:
```json
"test": "playwright test"
```

**Step 4: Create empty placeholder test file**

```bash
mkdir -p tests && touch tests/community_host.spec.ts
```

**Step 5: Commit**

```bash
git add playwright.config.ts package.json package-lock.json tests/
git commit -m "chore: bootstrap Playwright test setup"
```

---

## Task 2: Write Failing Playwright Tests (TDD)

**Files:**
- Write: `tests/community_host.spec.ts`

**Step 1: Write all 4 tests**

Replace `tests/community_host.spec.ts` with:

```typescript
import { test, expect } from '@playwright/test';

const SUPABASE_REST_PATTERN = '**/rest/v1/community_hosts**';

test.describe('Community Host Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the Supabase insert so no real DB calls happen
    await page.route(SUPABASE_REST_PATTERN, async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'mock-uuid-1234',
          full_name: 'Jane Smith',
          email: 'jane@company.com',
          phone_number: null,
          created_at: new Date().toISOString(),
        }]),
      });
    });

    await page.goto('/profile/');
  });

  test('modal opens when open-community-host-modal event is dispatched', async ({ page }) => {
    const modal = page.getByTestId('community-host-modal');

    // Should not be visible before event
    await expect(modal).not.toBeVisible();

    // Fire the event
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('open-community-host-modal'));
    });

    // Should now be visible
    await expect(modal).toBeVisible();
  });

  test('blocks submit when full_name is empty', async ({ page }) => {
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('open-community-host-modal'));
    });

    await expect(page.getByTestId('community-host-modal')).toBeVisible();

    // Click Next without typing anything
    await page.getByRole('button', { name: /Next/i }).click();

    await expect(page.getByText('Please enter your name.')).toBeVisible();
  });

  test('blocks submit when email is invalid', async ({ page }) => {
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('open-community-host-modal'));
    });

    // Step 1: valid name
    await page.getByPlaceholder('Your full name').fill('Jane Smith');
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 2: bad email
    await page.getByPlaceholder('you@company.com').fill('not-an-email');
    await page.getByRole('button', { name: /Next/i }).click();

    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
  });

  test('succeeds with phone_number empty (optional field)', async ({ page }) => {
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('open-community-host-modal'));
    });

    // Step 1: name
    await page.getByPlaceholder('Your full name').fill('Jane Smith');
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 2: email
    await page.getByPlaceholder('you@company.com').fill('jane@company.com');
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 3: skip phone
    await page.getByRole('button', { name: /Skip/i }).click();

    // Success state
    await expect(page.getByTestId('community-host-success')).toBeVisible();
  });
});
```

**Step 2: Run tests to confirm they FAIL**

```bash
npm test
```

Expected: 4 failures. Errors like "locator not found" and "getByTestId returned 0 elements". This is correct. Do not fix yet.

**Step 3: Commit the failing tests**

```bash
git add tests/community_host.spec.ts
git commit -m "test: add failing Playwright tests for CommunityHostModal (TDD)"
```

---

## Task 3: Create the Supabase Table (SQL)

**Files:**
- Create: `supabase/migrations/20260219000000_create_community_hosts.sql`

**Step 1: Write the SQL migration**

```sql
-- Create community_hosts table
create table if not exists public.community_hosts (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null    default now(),
  full_name     text        not null,
  email         text        not null,
  phone_number  text
);

-- Enable Row Level Security
alter table public.community_hosts enable row level security;

-- Allow anonymous inserts (frontend uses anon key)
create policy "anon can insert community_hosts"
  on public.community_hosts
  for insert
  to anon
  with check (true);

-- No SELECT/UPDATE/DELETE policies. Read only via Dashboard.
```

**Step 2: Apply to Supabase Dashboard**

Open https://supabase.com/dashboard/project/ebfvxfegegmqevmelcil/sql/new, paste the SQL above, and click Run.

Verify: navigate to Table Editor. The `community_hosts` table should appear with 0 rows.

**Step 3: Commit the migration file**

```bash
git add supabase/migrations/
git commit -m "db: add community_hosts table with RLS"
```

---

## Task 4: Write the Edge Function

**Files:**
- Create: `supabase/functions/notify-telegram-on-community-host/index.ts`

**Step 1: Write the function**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;
const SUPABASE_PROJECT_ID = "ebfvxfegegmqevmelcil";

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    const dashboardUrl =
      `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}` +
      `/editor?filter=id%3Aeq%3A${record.id}`;

    const lines = [
      "New Community Host Application",
      `${record.full_name}`,
      `${record.email}`,
    ];

    if (record.phone_number) {
      lines.push(`${record.phone_number}`);
    }

    lines.push(dashboardUrl);

    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: lines.join("\n"),
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram API error:", err);
      return new Response(JSON.stringify({ ok: false, error: err }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Edge Function error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

**Step 2: Deploy the function**

```bash
npx supabase functions deploy notify-telegram-on-community-host
```

If Supabase CLI is not installed:
```bash
npm install --save-dev supabase
npx supabase login
npx supabase link --project-ref ebfvxfegegmqevmelcil
npx supabase functions deploy notify-telegram-on-community-host
```

Expected: `Function notify-telegram-on-community-host deployed.`

Note: The function reuses the existing `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` secrets already set in the Dashboard for `notify-telegram`. Verify they are also set for this new function: Dashboard > Edge Functions > notify-telegram-on-community-host > Secrets.

**Step 3: Commit**

```bash
git add supabase/functions/notify-telegram-on-community-host/
git commit -m "feat: add notify-telegram-on-community-host Edge Function"
```

---

## Task 5: Configure the Database Webhook (Manual — Dashboard only)

No code files. Dashboard configuration only.

**Step 1: Open the Webhooks page**

Navigate to: https://supabase.com/dashboard/project/ebfvxfegegmqevmelcil/database/hooks

**Step 2: Create the webhook**

Click "Create a new hook" and fill in:

| Field | Value |
|---|---|
| Name | `on_community_host_insert` |
| Table | `community_hosts` |
| Events | INSERT |
| Type | Supabase Edge Functions |
| Edge Function | `notify-telegram-on-community-host` |

Click Save.

**Step 3: Smoke test**

In the Table Editor, manually insert one row into `community_hosts`:
```sql
insert into public.community_hosts (full_name, email, phone_number)
values ('Test User', 'test@example.com', null);
```

Check your Telegram channel. A message should arrive within a few seconds.

---

## Task 6: Build CommunityHostModal Component

**Files:**
- Create: `src/components/ui/CommunityHostModal.astro`

**Step 1: Write the component**

```astro
---
import { createClient } from '@supabase/supabase-js';
---

<div x-data="communityHostForm()" @keydown.escape.window="close()">

  <!-- Full-screen backdrop -->
  <div
    x-show="isOpen"
    x-cloak
    data-testid="community-host-modal"
    x-transition:enter="transition ease-out duration-200"
    x-transition:enter-start="opacity-0"
    x-transition:enter-end="opacity-100"
    x-transition:leave="transition ease-in duration-150"
    x-transition:leave-start="opacity-100"
    x-transition:leave-end="opacity-0"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background: rgba(7, 11, 20, 0.88); backdrop-filter: blur(8px);"
    @click.self="close()"
  >

    <!-- Modal panel -->
    <div
      x-show="isOpen"
      x-transition:enter="transition ease-out duration-300"
      x-transition:enter-start="opacity-0 scale-95 translate-y-2"
      x-transition:enter-end="opacity-100 scale-100 translate-y-0"
      x-transition:leave="transition ease-in duration-200"
      x-transition:leave-start="opacity-100 scale-100 translate-y-0"
      x-transition:leave-end="opacity-0 scale-95 translate-y-2"
      class="relative w-full max-w-lg rounded-2xl overflow-hidden"
      style="background: #0d1526; border: 1px solid rgba(132, 153, 184, 0.18);"
      @click.stop
    >

      <!-- Progress bar -->
      <div class="h-0.5" style="background: rgba(132,153,184,0.15);">
        <div
          class="h-full transition-all duration-500 ease-out"
          style="background: #38bdf8;"
          :style="`width: ${(step / 3) * 100}%`"
        ></div>
      </div>

      <!-- Close button -->
      <button
        @click="close()"
        class="absolute top-4 right-4 z-10 p-2 rounded-lg transition-colors"
        style="color: #64748b;"
        aria-label="Close"
        onmouseover="this.style.color='#f4f7fb'; this.style.background='rgba(255,255,255,0.06)'"
        onmouseout="this.style.color='#64748b'; this.style.background='transparent'"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Steps 1-3 -->
      <div x-show="!submitted" class="px-8 pt-8 pb-8">

        <!-- Step counter -->
        <p
          class="text-xs tracking-widest uppercase mb-6"
          style="color: rgba(56,189,248,0.6); font-family: 'JetBrains Mono', monospace;"
          x-text="`Step ${step} of 3`"
        ></p>

        <!-- Step 1: Full name -->
        <template x-if="step === 1">
          <div class="space-y-6">
            <h2 class="text-2xl font-bold" style="color: #f4f7fb;">What's your name?</h2>
            <input
              type="text"
              x-model="form.full_name"
              @keydown.enter="nextStep()"
              placeholder="Your full name"
              class="w-full bg-transparent outline-none text-xl pb-2 transition-colors"
              style="border-bottom: 2px solid rgba(132,153,184,0.35); color: #f4f7fb;"
              onfocus="this.style.borderBottomColor='#38bdf8'"
              onblur="this.style.borderBottomColor='rgba(132,153,184,0.35)'"
            />
            <p x-show="errors.full_name" style="color: #f87171; font-size: 0.875rem;" x-text="errors.full_name"></p>
          </div>
        </template>

        <!-- Step 2: Email -->
        <template x-if="step === 2">
          <div class="space-y-6">
            <h2 class="text-2xl font-bold" style="color: #f4f7fb;">What's your email?</h2>
            <input
              type="email"
              x-model="form.email"
              @keydown.enter="nextStep()"
              placeholder="you@company.com"
              class="w-full bg-transparent outline-none text-xl pb-2 transition-colors"
              style="border-bottom: 2px solid rgba(132,153,184,0.35); color: #f4f7fb;"
              onfocus="this.style.borderBottomColor='#38bdf8'"
              onblur="this.style.borderBottomColor='rgba(132,153,184,0.35)'"
            />
            <p x-show="errors.email" style="color: #f87171; font-size: 0.875rem;" x-text="errors.email"></p>
          </div>
        </template>

        <!-- Step 3: Phone -->
        <template x-if="step === 3">
          <div class="space-y-6">
            <div>
              <h2 class="text-2xl font-bold" style="color: #f4f7fb;">Phone number</h2>
              <p class="mt-1 text-sm" style="color: #9fb0c9;">Optional. We'll only use it to coordinate.</p>
            </div>
            <input
              type="tel"
              x-model="form.phone_number"
              @keydown.enter="nextStep()"
              placeholder="+49 123 456 7890"
              class="w-full bg-transparent outline-none text-xl pb-2 transition-colors"
              style="border-bottom: 2px solid rgba(132,153,184,0.35); color: #f4f7fb;"
              onfocus="this.style.borderBottomColor='#38bdf8'"
              onblur="this.style.borderBottomColor='rgba(132,153,184,0.35)'"
            />
          </div>
        </template>

        <!-- Navigation -->
        <div class="flex items-center justify-between mt-8">
          <button
            x-show="step > 1"
            @click="prevStep()"
            class="text-sm transition-colors"
            style="color: #9fb0c9;"
            onmouseover="this.style.color='#f4f7fb'"
            onmouseout="this.style.color='#9fb0c9'"
          >
            Back
          </button>

          <div class="ml-auto flex items-center gap-3">
            <!-- Skip only on step 3 (phone optional) -->
            <button
              x-show="step === 3"
              @click="submit(true)"
              class="text-sm transition-colors"
              style="color: #9fb0c9;"
              onmouseover="this.style.color='#f4f7fb'"
              onmouseout="this.style.color='#9fb0c9'"
            >
              Skip
            </button>

            <button
              @click="nextStep()"
              :disabled="loading"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-opacity"
              style="background: #38bdf8; color: #070b14;"
              :class="loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'"
            >
              <span x-show="!loading" x-text="step === 3 ? 'Submit' : 'Next'"></span>
              <span x-show="loading" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Saving...
              </span>
            </button>
          </div>
        </div>

        <!-- Non-blocking save error -->
        <p
          x-show="saveError"
          class="mt-3 text-xs"
          style="color: #fbbf24;"
          x-text="saveError"
        ></p>

      </div>

      <!-- Success state -->
      <div
        x-show="submitted"
        data-testid="community-host-success"
        class="px-8 pt-8 pb-8 text-center"
      >
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full mb-6" style="background: rgba(56,189,248,0.12);">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#38bdf8" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold mb-2" style="color: #f4f7fb;">We'll be in touch</h2>
        <p class="text-sm mb-8" style="color: #9fb0c9;">
          Thanks for your interest in the Munich MLOps community. We'll reach out shortly.
        </p>
        <button
          @click="close()"
          class="px-5 py-2.5 rounded-lg font-semibold text-sm"
          style="background: rgba(56,189,248,0.12); color: #38bdf8;"
          onmouseover="this.style.background='rgba(56,189,248,0.2)'"
          onmouseout="this.style.background='rgba(56,189,248,0.12)'"
        >
          Close
        </button>
      </div>

    </div>
  </div>
</div>

<script>
  import { createClient } from '@supabase/supabase-js';

  const _supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const _supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const supabase = _supabaseUrl && _supabaseKey
    ? createClient(_supabaseUrl, _supabaseKey)
    : null;

  document.addEventListener('alpine:init', () => {
    Alpine.data('communityHostForm', () => ({
      isOpen: false,
      step: 1,
      loading: false,
      submitted: false,
      saveError: null,
      form: {
        full_name: '',
        email: '',
        phone_number: '',
      },
      errors: {},

      init() {
        window.addEventListener('open-community-host-modal', () => this.open());
      },

      open() {
        this.isOpen = true;
        this.step = 1;
        this.submitted = false;
        this.loading = false;
        this.saveError = null;
        this.form = { full_name: '', email: '', phone_number: '' };
        this.errors = {};
        document.body.style.overflow = 'hidden';
        this.$nextTick(() => {
          const el = this.$el.querySelector('input');
          if (el) el.focus();
        });
      },

      close() {
        this.isOpen = false;
        document.body.style.overflow = '';
      },

      validate() {
        this.errors = {};
        if (this.step === 1 && !this.form.full_name.trim()) {
          this.errors.full_name = 'Please enter your name.';
          return false;
        }
        if (this.step === 2) {
          if (!this.form.email.trim()) {
            this.errors.email = 'Please enter your email.';
            return false;
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
            this.errors.email = 'Please enter a valid email address.';
            return false;
          }
        }
        return true;
      },

      prevStep() {
        if (this.step > 1) {
          this.step--;
          this.$nextTick(() => {
            const el = this.$el.querySelector('input');
            if (el) el.focus();
          });
        }
      },

      nextStep() {
        if (!this.validate()) return;
        if (this.step < 3) {
          this.step++;
          this.$nextTick(() => {
            const el = this.$el.querySelector('input');
            if (el) el.focus();
          });
        } else {
          this.submit(false);
        }
      },

      async submit(skipPhone = false) {
        this.loading = true;
        this.saveError = null;
        try {
          if (supabase) {
            const { error } = await supabase.from('community_hosts').insert([{
              full_name: this.form.full_name,
              email: this.form.email,
              phone_number: skipPhone ? null : (this.form.phone_number.trim() || null),
            }]);
            if (error) throw error;
          }
        } catch (e) {
          this.saveError = 'Your details could not be saved, but we got your interest.';
        } finally {
          this.loading = false;
          this.submitted = true;
        }
      },
    }));
  });
</script>
```

**Step 2: Commit the component**

```bash
git add src/components/ui/CommunityHostModal.astro
git commit -m "feat: add CommunityHostModal component (Alpine.js, 3-step)"
```

---

## Task 7: Wire Up the Modal

**Files:**
- Modify: `src/layouts/ValueLayout.astro:32`
- Modify: `src/components/sections/Community.astro:37`

**Step 1: Mount the modal in `ValueLayout.astro`**

After line 32 (`<LeadCaptureModal />`), add:

```astro
import CommunityHostModal from '../components/ui/CommunityHostModal.astro';
```

(add this import in the frontmatter, alongside the existing `LeadCaptureModal` import)

And in the body, after `<LeadCaptureModal />`:

```astro
<CommunityHostModal />
```

**Step 2: Update the button in `Community.astro`**

On line 37, change:
```html
<button onclick="window.dispatchEvent(new CustomEvent('open-lead-modal'))" class="btn-secondary">
```

To:
```html
<button onclick="window.dispatchEvent(new CustomEvent('open-community-host-modal'))" class="btn-secondary">
```

**Step 3: Verify the dev server runs without errors**

```bash
npm run dev
```

Open http://localhost:4321/profile/ in a browser. Click "Start a conversation" in the Community section. The new 3-step modal should open. Verify all 3 steps and the success state work manually.

**Step 4: Commit the wire-up**

```bash
git add src/layouts/ValueLayout.astro src/components/sections/Community.astro
git commit -m "feat: wire CommunityHostModal to Community section button"
```

---

## Task 8: Run Tests and Make Them Pass

**Step 1: Run the Playwright suite**

```bash
npm test
```

Expected: 4 tests pass. If any fail, check:

- The `data-testid="community-host-modal"` attribute is on the backdrop `div` with `x-show="isOpen"` (not behind `x-cloak` in a way Playwright can't see it).
- The `data-testid="community-host-success"` attribute is on the success `div`.
- The placeholder text matches exactly: `"Your full name"` and `"you@company.com"`.
- The button text matches `/Next/i` and `/Skip/i`.

**Step 2: Commit passing tests**

```bash
git commit --allow-empty -m "test: all 4 CommunityHostModal Playwright tests pass"
```

---

## Task 9: Final Commit and Branch Summary

**Step 1: Review all changes**

```bash
git log --oneline origin/master..HEAD
```

Expected output (roughly):
```
test: all 4 CommunityHostModal Playwright tests pass
feat: wire CommunityHostModal to Community section button
feat: add CommunityHostModal component (Alpine.js, 3-step)
feat: add notify-telegram-on-community-host Edge Function
db: add community_hosts table with RLS
test: add failing Playwright tests for CommunityHostModal (TDD)
chore: bootstrap Playwright test setup
docs: add community host modal design document
```

**Step 2: Verify the build is clean**

```bash
npm run build
```

Expected: exits 0, no TypeScript or Astro errors.

---

## Manual Steps Checklist (not automated)

These require Supabase Dashboard access and cannot be scripted:

- [ ] Run the SQL migration in Dashboard > SQL Editor
- [ ] Configure the Database Webhook (`on_community_host_insert` on `community_hosts` INSERT > `notify-telegram-on-community-host`)
- [ ] Confirm `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` secrets are set for the new Edge Function
- [ ] Smoke test: insert a row manually, confirm Telegram message arrives with deep link

---

## Out of Scope

- Email confirmation to the submitter
- Rate limiting on the Edge Function
- Analytics events on step transitions
- Admin dashboard or CRM integration

# Lead Capture Form — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a full-screen multi-step lead capture modal (typeform-style) that saves leads to Supabase, triggers a Telegram notification via an Edge Function, and embeds cal.com as the final booking step.

**Architecture:** Alpine.js manages a 6-step form in a full-screen modal overlay. On step 5→6, the Supabase JS client inserts the lead using the public anon key (INSERT-only RLS). A Supabase Database Webhook fires an Edge Function that calls the Telegram Bot API — keeping the bot token server-side only.

**Tech Stack:** Astro 5, Alpine.js 3, Tailwind CSS, `@supabase/supabase-js`, Supabase Edge Functions (Deno), cal.com inline embed, Supabase Database Webhook.

---

## Pre-Flight Checklist (manual, do before any code)

You need four values before starting. Collect them now:

1. **Supabase Project URL** — from Project Settings → API → Project URL
2. **Supabase Anon Key** — from Project Settings → API → `anon public`
3. **Telegram Bot Token** — from @BotFather → your bot → token
4. **Telegram Chat ID** — send a message to your bot, then call `https://api.telegram.org/bot<TOKEN>/getUpdates`, find `"chat":{"id":...}` in the response

---

## Task 1: Supabase Database Setup

**Files:**
- Manual SQL in Supabase SQL Editor (Project → SQL Editor → New query)

**Step 1: Run the table creation SQL**

Paste and run this in Supabase SQL Editor:

```sql
CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  company_name text,
  role text,
  company_website text,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon insert only"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

**Step 2: Verify the table exists**

In Supabase Table Editor, you should see `leads` with 8 columns. The RLS badge should show "Enabled".

**Step 3: No commit needed** — this is a database change, not a file change.

---

## Task 2: Install Supabase JS + Configure Environment

**Files:**
- Create: `.env` (at repo root, same level as `package.json`)
- Modify: `.gitignore` (verify `.env` is listed)

**Step 1: Install the Supabase JS client**

```bash
npm install @supabase/supabase-js
```

Expected: `@supabase/supabase-js` appears in `package.json` dependencies.

**Step 2: Create `.env`**

Create `/Users/wilsoncely/code/WilsonCELY_Github_page/profile/.env`:

```
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace both values with your actual credentials.

**Step 3: Verify `.gitignore` covers `.env`**

```bash
grep -n "\.env" .gitignore
```

Expected: at least one line matching `.env`. If not found, add `.env` to `.gitignore`.

**Step 4: Verify Astro can see the env vars**

```bash
npm run dev
```

Open `http://localhost:4321/profile/value` — page should load with no errors.

**Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "feat: install @supabase/supabase-js"
```

---

## Task 3: Create LeadCaptureModal.astro

**Files:**
- Create: `src/components/ui/LeadCaptureModal.astro`

**Step 1: Create the file with this exact content**

```astro
---
// LeadCaptureModal.astro
// Full-screen typeform-style lead capture modal.
// Opens via: window.dispatchEvent(new CustomEvent('open-lead-modal'))
// Saves lead to Supabase on step 5→6 transition.
// Embeds cal.com inline as step 6.
---

<div x-data="leadForm()" @keydown.escape.window="close()">

  <!-- Full-screen backdrop -->
  <div
    x-show="isOpen"
    x-cloak
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
      :class="step === 6 ? 'max-w-3xl' : 'max-w-lg'"
      class="relative w-full rounded-2xl overflow-hidden"
      style="background: #0d1526; border: 1px solid rgba(132, 153, 184, 0.18);"
      @click.stop
    >

      <!-- Progress bar -->
      <div class="h-0.5" style="background: rgba(132,153,184,0.15);">
        <div
          class="h-full transition-all duration-500 ease-out"
          style="background: #38bdf8;"
          :style="`width: ${(step / 6) * 100}%`"
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

      <!-- Steps 1–5 -->
      <div x-show="step < 6" class="px-8 pt-8 pb-8">

        <!-- Step counter -->
        <p
          class="text-xs tracking-widest uppercase mb-6"
          style="color: rgba(56,189,248,0.6); font-family: 'JetBrains Mono', monospace;"
          x-text="`Step ${step} of 5`"
        ></p>

        <!-- Step 1: Name -->
        <template x-if="step === 1">
          <div class="space-y-6">
            <h2 class="text-2xl font-bold" style="color: #f4f7fb;">What's your name?</h2>
            <input
              type="text"
              x-model="form.name"
              @keydown.enter="nextStep()"
              placeholder="Your full name"
              class="w-full bg-transparent outline-none text-xl pb-2 transition-colors"
              style="border-bottom: 2px solid rgba(132,153,184,0.35); color: #f4f7fb;"
              onfocus="this.style.borderBottomColor='#38bdf8'"
              onblur="this.style.borderBottomColor='rgba(132,153,184,0.35)'"
              x-ref="nameInput"
              autofocus
            />
            <p x-show="errors.name" style="color: #f87171; font-size: 0.875rem;" x-text="errors.name"></p>
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
              x-ref="emailInput"
            />
            <p x-show="errors.email" style="color: #f87171; font-size: 0.875rem;" x-text="errors.email"></p>
          </div>
        </template>

        <!-- Step 3: Company + Role -->
        <template x-if="step === 3">
          <div class="space-y-6">
            <h2 class="text-2xl font-bold" style="color: #f4f7fb;">Your company and role</h2>
            <div class="space-y-5">
              <input
                type="text"
                x-model="form.company_name"
                @keydown.enter="$refs.roleInput && $refs.roleInput.focus()"
                placeholder="Company name"
                class="w-full bg-transparent outline-none text-xl pb-2 transition-colors"
                style="border-bottom: 2px solid rgba(132,153,184,0.35); color: #f4f7fb;"
                onfocus="this.style.borderBottomColor='#38bdf8'"
                onblur="this.style.borderBottomColor='rgba(132,153,184,0.35)'"
                x-ref="companyInput"
              />
              <input
                type="text"
                x-model="form.role"
                @keydown.enter="nextStep()"
                placeholder="Your title or role"
                class="w-full bg-transparent outline-none text-xl pb-2 transition-colors"
                style="border-bottom: 2px solid rgba(132,153,184,0.35); color: #f4f7fb;"
                onfocus="this.style.borderBottomColor='#38bdf8'"
                onblur="this.style.borderBottomColor='rgba(132,153,184,0.35)'"
                x-ref="roleInput"
              />
            </div>
            <p x-show="errors.company_name" style="color: #f87171; font-size: 0.875rem;" x-text="errors.company_name"></p>
          </div>
        </template>

        <!-- Step 4: Website (optional) -->
        <template x-if="step === 4">
          <div class="space-y-6">
            <div>
              <h2 class="text-2xl font-bold" style="color: #f4f7fb;">Company website</h2>
              <p class="mt-1 text-sm" style="color: #9fb0c9;">Optional — helps me research before the call</p>
            </div>
            <input
              type="url"
              x-model="form.company_website"
              @keydown.enter="nextStep()"
              placeholder="https://company.com"
              class="w-full bg-transparent outline-none text-xl pb-2 transition-colors"
              style="border-bottom: 2px solid rgba(132,153,184,0.35); color: #f4f7fb;"
              onfocus="this.style.borderBottomColor='#38bdf8'"
              onblur="this.style.borderBottomColor='rgba(132,153,184,0.35)'"
            />
          </div>
        </template>

        <!-- Step 5: Description -->
        <template x-if="step === 5">
          <div class="space-y-6">
            <h2 class="text-2xl font-bold" style="color: #f4f7fb;">What do you need from me?</h2>
            <textarea
              x-model="form.description"
              placeholder="Describe your situation, the challenge you're facing, or the outcome you want to reach..."
              rows="4"
              class="w-full bg-transparent outline-none text-base p-3 rounded-lg transition-colors resize-none"
              style="border: 1.5px solid rgba(132,153,184,0.35); color: #f4f7fb;"
              onfocus="this.style.borderColor='#38bdf8'"
              onblur="this.style.borderColor='rgba(132,153,184,0.35)'"
            ></textarea>
            <p x-show="errors.description" style="color: #f87171; font-size: 0.875rem;" x-text="errors.description"></p>
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
            ← Back
          </button>

          <div class="ml-auto flex items-center gap-3">
            <!-- Skip only on step 4 -->
            <button
              x-show="step === 4"
              @click="nextStep(true)"
              class="text-sm transition-colors"
              style="color: #9fb0c9;"
              onmouseover="this.style.color='#f4f7fb'"
              onmouseout="this.style.color='#9fb0c9'"
            >
              Skip →
            </button>

            <button
              @click="nextStep()"
              :disabled="loading"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-opacity"
              style="background: #38bdf8; color: #070b14;"
              :class="loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'"
            >
              <span x-show="!loading" x-text="step === 5 ? 'Book a Call →' : 'Next →'"></span>
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

      <!-- Step 6: cal.com embed -->
      <div x-show="step === 6" class="px-8 pt-8 pb-8">
        <h2 class="text-xl font-bold mb-1" style="color: #f4f7fb;">Pick a time</h2>
        <p class="text-sm mb-6" style="color: #9fb0c9;">Choose a slot that works for you — you'll get a confirmation email.</p>
        <div id="cal-inline-container" style="width:100%;height:600px;overflow:scroll;"></div>
      </div>

    </div>
  </div>
</div>

<script>
  import { createClient } from '@supabase/supabase-js';

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );

  document.addEventListener('alpine:init', () => {
    Alpine.data('leadForm', () => ({
      isOpen: false,
      step: 1,
      loading: false,
      saveError: null,
      form: {
        name: '',
        email: '',
        company_name: '',
        role: '',
        company_website: '',
        description: '',
      },
      errors: {},

      init() {
        window.addEventListener('open-lead-modal', () => this.open());
      },

      open() {
        this.isOpen = true;
        this.step = 1;
        this.form = { name: '', email: '', company_name: '', role: '', company_website: '', description: '' };
        this.errors = {};
        this.saveError = null;
        document.body.style.overflow = 'hidden';
        this.$nextTick(() => {
          const first = document.querySelector('[x-ref="nameInput"]');
          if (first) first.focus();
        });
      },

      close() {
        this.isOpen = false;
        document.body.style.overflow = '';
      },

      validate(skip = false) {
        this.errors = {};
        if (skip) return true;
        if (this.step === 1 && !this.form.name.trim()) {
          this.errors.name = 'Please enter your name.';
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
        if (this.step === 3 && !this.form.company_name.trim()) {
          this.errors.company_name = 'Please enter your company name.';
          return false;
        }
        if (this.step === 5 && !this.form.description.trim()) {
          this.errors.description = 'Please describe what you need.';
          return false;
        }
        return true;
      },

      async nextStep(skip = false) {
        if (!this.validate(skip)) return;
        if (this.step === 5) {
          await this.saveLead();
        }
        this.step++;
        if (this.step === 6) {
          this.$nextTick(() => this.initCal());
        }
      },

      prevStep() {
        if (this.step > 1) this.step--;
      },

      async saveLead() {
        this.loading = true;
        this.saveError = null;
        try {
          const { error } = await supabase.from('leads').insert([{
            name: this.form.name,
            email: this.form.email,
            company_name: this.form.company_name || null,
            role: this.form.role || null,
            company_website: this.form.company_website || null,
            description: this.form.description || null,
          }]);
          if (error) throw error;
        } catch (e) {
          this.saveError = 'Your details could not be saved, but you can still book a call below.';
        } finally {
          this.loading = false;
        }
      },

      initCal() {
        if (window.Cal) {
          this.setupCal();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://app.cal.com/embed/embed.js';
        script.onload = () => this.setupCal();
        document.head.appendChild(script);
      },

      setupCal() {
        Cal('init', { origin: 'https://app.cal.com' });
        Cal('inline', {
          elementOrSelector: '#cal-inline-container',
          calLink: 'wilsoncely/discovery-call',
          config: {
            name: this.form.name,
            email: this.form.email,
          },
        });
        Cal('ui', {
          styles: { branding: { brandColor: '#38bdf8' } },
          hideEventTypeDetails: false,
          layout: 'month_view',
        });
      },
    }));
  });
</script>
```

**Step 2: Verify build compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors, build completes. (Modal is not yet wired up — that's fine.)

**Step 3: Commit**

```bash
git add src/components/ui/LeadCaptureModal.astro
git commit -m "feat: add LeadCaptureModal component (steps 1-6 with cal.com embed)"
```

---

## Task 4: Wire Modal Into the Page

**Files:**
- Modify: `src/components/pages/LandingPage_2.astro`
- Modify: `src/components/sections/Hero_2.astro`
- Modify: `src/components/sections/ContactCTA_2.astro`

**Step 1: Add modal to LandingPage_2.astro**

Open `src/components/pages/LandingPage_2.astro`. Add the import and component:

Find the existing imports at the top (inside `---`):
```astro
import ContactCTA_2 from '../sections/ContactCTA_2.astro';
```

Add after it:
```astro
import LeadCaptureModal from '../ui/LeadCaptureModal.astro';
```

Find the last line in the template (currently `{/* <Proof /> */}`):
```astro
{/* <Proof /> */}
```

Add after it:
```astro
<LeadCaptureModal />
```

**Step 2: Update Hero_2.astro primary CTA**

Open `src/components/sections/Hero_2.astro`.

Find:
```astro
<a href={primaryHref} target="_blank" rel="noopener noreferrer" class="v2-btn-primary">
  {hero.primaryCta.text}
</a>
```

Replace with:
```astro
<button
  @click="window.dispatchEvent(new CustomEvent('open-lead-modal'))"
  class="v2-btn-primary"
>
  {hero.primaryCta.text}
</button>
```

**Step 3: Update ContactCTA_2.astro primary CTA**

Open `src/components/sections/ContactCTA_2.astro`.

Find:
```astro
<a href={bookingUrl} target="_blank" rel="noopener noreferrer" class="v2-btn-primary">
  {contact.primaryCtaText}
</a>
```

Replace with:
```astro
<button
  @click="window.dispatchEvent(new CustomEvent('open-lead-modal'))"
  class="v2-btn-primary"
>
  {contact.primaryCtaText}
</button>
```

**Step 4: Start dev server and manually test**

```bash
npm run dev
```

Open `http://localhost:4321/profile/value`.

Check:
- [ ] "Book a Discovery Call" button in Hero section is clickable
- [ ] Clicking it opens the modal with a dark overlay
- [ ] Step 1 shows "What's your name?" with an autofocused input
- [ ] Progress bar shows ~17% (1/6)
- [ ] Pressing Enter or clicking "Next →" advances to step 2
- [ ] "← Back" appears from step 2 onward
- [ ] Step 4 shows "Skip →" alongside "Next →"
- [ ] Pressing Escape closes the modal
- [ ] Clicking outside the card closes the modal
- [ ] The ContactCTA "Book a Discovery Call" button also opens the modal

**Step 5: Commit**

```bash
git add src/components/pages/LandingPage_2.astro \
        src/components/sections/Hero_2.astro \
        src/components/sections/ContactCTA_2.astro
git commit -m "feat: wire LeadCaptureModal to Hero and ContactCTA triggers"
```

---

## Task 5: Supabase Integration — Live Test

> **Goal:** Verify the Supabase insert actually works before building the Edge Function.

**Step 1: Complete the form manually in the browser**

With `npm run dev` running, open the modal and fill out all 5 steps with test data:
- Name: `Test Lead`
- Email: `test@example.com`
- Company: `Test Corp`, Role: `CTO`
- Website: `https://test.com`
- Description: `Testing the form`

Click "Book a Call →" — you should see a brief loading state, then the cal.com calendar loads.

**Step 2: Verify the row exists in Supabase**

Go to Supabase → Table Editor → `leads`. You should see one row with your test data and a `created_at` timestamp.

If no row appears, open browser DevTools → Console and look for errors. Common issues:
- Missing `.env` values → error: `supabaseUrl is required`
- Wrong anon key → error: `Invalid API key`
- RLS misconfigured → error: `new row violates row-level security policy`

Fix any errors before continuing.

**Step 3: No commit needed** — this is a verification step only.

---

## Task 6: Supabase Edge Function — Telegram Notification

**Files:**
- Create: `supabase/functions/notify-telegram/index.ts`

**Step 1: Install Supabase CLI (if not installed)**

```bash
brew install supabase/tap/supabase
supabase --version
```

Expected: prints a version like `1.x.x`.

**Step 2: Initialize Supabase in the project**

```bash
supabase init
```

This creates a `supabase/` directory. If it asks about existing config, accept defaults.

**Step 3: Create the Edge Function**

```bash
supabase functions new notify-telegram
```

This creates `supabase/functions/notify-telegram/index.ts`.

**Step 4: Replace the generated file with this exact content**

Open `supabase/functions/notify-telegram/index.ts` and replace everything with:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    const lines = [
      "🔔 New Lead",
      `👤 ${record.name}`,
      `📧 ${record.email}`,
      `🏢 ${record.company_name || "—"} — ${record.role || "—"}`,
      `🌐 ${record.company_website || "—"}`,
      `💬 "${record.description || "No description provided"}"`,
    ];

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

**Step 5: Set secrets in Supabase**

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=your_actual_token --project-ref YOUR_PROJECT_REF
supabase secrets set TELEGRAM_CHAT_ID=your_actual_chat_id --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with the value from your Supabase Project Settings → General → Reference ID (looks like `abcdefghijklmnop`).

**Step 6: Deploy the Edge Function**

```bash
supabase functions deploy notify-telegram --project-ref YOUR_PROJECT_REF
```

Expected output ends with: `Deployed Function notify-telegram`

The function URL will be:
`https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-telegram`

**Step 7: Commit**

```bash
git add supabase/
git commit -m "feat: add notify-telegram Supabase Edge Function"
```

---

## Task 7: Configure Database Webhook (Manual — Supabase Dashboard)

This step is done entirely in the Supabase dashboard. No code changes.

**Step 1: Open Database Webhooks**

Go to: Supabase Dashboard → Database → Webhooks → Create a new hook.

**Step 2: Configure the webhook**

| Field | Value |
|-------|-------|
| Name | `notify-telegram-on-lead` |
| Table | `public.leads` |
| Events | ✅ Insert only |
| Type | Supabase Edge Functions |
| Function | `notify-telegram` |

Click **Create webhook**.

**Step 3: Test end-to-end**

Submit the form again in the browser (use a fresh name/email so it's distinguishable).

Check:
- [ ] Row appears in Supabase `leads` table
- [ ] Telegram message arrives in your chat within ~5 seconds

If Telegram message does not arrive:
1. Go to Supabase → Edge Functions → `notify-telegram` → Logs — look for errors
2. Common issue: wrong `TELEGRAM_CHAT_ID` (must be a number, not a username)
3. Common issue: bot is not started — send `/start` to your bot first, then retry

---

## Task 8: Build Verification + Deploy

**Step 1: Full production build**

```bash
npm run build 2>&1 | tail -30
```

Expected: no errors. Dist output shown.

**Step 2: Preview production build**

```bash
npm run preview
```

Open `http://localhost:4321/profile/value`. Repeat the manual checklist from Task 4 Step 4.

Additional checks for production build:
- [ ] Modal opens and closes cleanly
- [ ] All 5 steps advance correctly with validation
- [ ] Step 5 → step 6 transition inserts to Supabase and shows cal.com
- [ ] cal.com calendar renders with sky-blue brand color
- [ ] Telegram notification received

**Step 3: Final commit and push**

```bash
git add .
git commit -m "feat: lead capture form complete — modal, Supabase, cal.com, Telegram"
git push origin formulaire
```

---

## Environment Variable Reference

| Variable | Where | Used by |
|----------|-------|---------|
| `PUBLIC_SUPABASE_URL` | `.env` | Browser (Supabase JS client) |
| `PUBLIC_SUPABASE_ANON_KEY` | `.env` | Browser (Supabase JS client) |
| `TELEGRAM_BOT_TOKEN` | Supabase secrets | Edge Function only |
| `TELEGRAM_CHAT_ID` | Supabase secrets | Edge Function only |

The `.env` file is **never committed**. `PUBLIC_` prefixed variables are safe to expose in browser bundles — Supabase anon keys are designed for this (RLS enforces insert-only access).

---

## Troubleshooting Index

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Modal doesn't open | Alpine.js not loaded, or event not dispatching | Check browser console for Alpine errors |
| `supabaseUrl is required` | `.env` missing or wrong prefix | Verify `PUBLIC_SUPABASE_URL` in `.env` |
| RLS error on insert | Policy missing | Re-run the SQL from Task 1 |
| cal.com doesn't load | Script blocked by CSP | None needed — GitHub Pages has no CSP by default |
| Telegram message missing | Wrong chat ID or bot not started | Send `/start` to bot; check Edge Function logs |
| Build fails | Missing `@supabase/supabase-js` | Run `npm install @supabase/supabase-js` |

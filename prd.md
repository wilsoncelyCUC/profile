## PRD. Value Proposition Page (GitHub Pages)

### 1) Context

Wilson’s current site is a bootcamp-era GitHub Pages site and does not communicate a clear market position or offer. The new page must function as a high-conversion landing page for freelance advisory work.

**Hosting constraint:** GitHub Pages is static hosting. It serves HTML, CSS, and JavaScript from a repo. It does not run server-side code (no Python, Ruby, PHP). Any “dynamic” behavior must be client-side JavaScript or a build-time step. ([GitHub Docs][1])

**Operational constraints:** Published site size, bandwidth, and build limits exist (1 GB published size. 100 GB per month soft bandwidth. 10 builds per hour soft limit. 10-minute deployment timeout). ([GitHub Docs][2])

---

### 2) Objective

Create a single “Value Proposition” page that makes it instantly obvious:

1. **Positioning:** Wilson sits at the intersection of **Tech, Business, Delivery**.
2. **Offer:** Three services with clear outcomes, best-fit scenarios, and deliverables.
3. **Proof:** Case studies and artifacts that validate credibility.
4. **Conversion:** Clear CTA to contact or book a call.

---

### 3) Target users

* **Buyer persona A:** Head of Data/AI, Product leader, Transformation lead. Needs AI initiatives delivered and defended with business outcomes.
* **Buyer persona B:** CFO-adjacent exec sponsor. Needs a value narrative and measurement plan.
* **Buyer persona C:** Hiring manager for “value acceleration / technical business consultant” roles. Needs fast signal of fit.

---

### 4) Page information architecture

Single page URL: `/value` (or `/services` if you want this to be the main entry).

**Sections in order**

1. Sticky nav
2. Hero (positioning + CTAs)
3. The 3-pillar bridge (Tech. Business. Delivery)
4. Services (3 cards)
5. Proof (case studies + artifacts)
6. How we start (simple 3-step)
7. Contact CTA (form or email)

---

### 5) Messaging requirements (copy, final intent)

**Hero headline (choose one for build, keep editable in content file):**

* “Turn AI and data initiatives into shipped outcomes with measurable business value.”
* “Bridge Tech, Business, and Delivery. From AI idea to ROI proof.”

**Hero subline**
“I translate technical constraints into executive decisions, build the value case, and run delivery to production.”

**Primary CTA:** “Work with me”
**Secondary CTA:** “See case studies”

**3 pillars (microcopy)**

* **Tech:** Architecture, data and AI literacy, integration realism.
* **Business:** TCO, ROI logic, value drivers, exec narrative.
* **Delivery:** Production-ready execution, cross-functional leadership, operationalization.

---

### 6) Services (final definition)

Each service card must include: “Best for”. “Outcome”. “What you get”. “Typical engagement format”.

#### Service 1. AI Delivery Lead (Fractional PM)

**Best for:** You already picked an AI initiative. You need execution to production.
**Outcome:** Delivery that sticks. Clear scope, cadence, risks managed, launch readiness.
**What you get:** Milestone plan, backlog and governance, risk register, stakeholder alignment, production readiness checklist, rollout plan.
**Format:** Fractional engagement (days per week configurable).

#### Service 2. AI Innovation and Use Case Prioritization Sprint

**Best for:** Many AI ideas. No alignment on what is worth doing first.
**Outcome:** Shortlist of use cases ranked by value and feasibility. Exec-ready narrative.
**What you get:** Workshops, feasibility screen (data, integration, risk, effort), value driver mapping (cost, revenue, risk), prioritized roadmap with decision gates.
**Format:** Sprint engagement.

#### Service 3. AI Value Realization System (KPI and ROI Proof)

**Best for:** You launched or piloted AI. Leadership asks “what did we get”.
**Outcome:** Measurable value reporting that protects budget and enables expansion.
**What you get:** KPI tree linking technical metrics to business outcomes, baseline and measurement plan (definitions, sources, owners), first value realization report (projected vs actual), QBR template focused on outcomes.
**Format:** Setup phase plus optional monthly cadence.

---

### 7) Functional requirements

**FR1. Sticky nav**

* Anchors to sections: Value, Services, Proof, Contact.
* CTA button always visible.

**FR2. Pillar section**

* Triangle visual (SVG) or three cards with a center “You are here”.
* Hover or click reveals 2–3 bullet proofs per pillar.

**FR3. Services section**

* Three cards as above.
* Each card has “Request scope” button that scrolls to contact and pre-fills a hidden field or query param (service=delivery, service=prioritization, service=value-realization).

**FR4. Proof section**

* Case study teasers (2–3 cards). Each card links to `/work/<slug>` or an external PDF.
* Artifacts strip (tiles) linking to public assets (PDF templates, screenshots, repo demos).

**FR5. Contact**
Because GitHub Pages is static, choose one of these approaches:

* MVP: `mailto:` link with prefilled subject and body.
* Preferred: third-party form endpoint (Formspree-style) or serverless endpoint. No backend on Pages. ([GitHub Docs][3])
  PRD decision: implement MVP now, keep the form endpoint pluggable via env/config.

**FR6. “Dynamic” feel**

* Subtle animations (scroll reveal, card hover).
* Optional lightweight widgets (client-side only):

  * “ROI levers” mini calculator. Input sliders. Output payback and 3-year ROI.
  * Case study filter by tags.

---

### 8) Non-goals

* No user accounts.
* No server-side rendering.
* No complex CMS.
* No heavy animations that harm performance.

---

### 9) Design requirements

* Visual language: premium, modern, confident.
* Layout: generous whitespace, strong typography hierarchy.
* Use icons sparingly. Prefer simple diagrams and numbers.
* Must work well on mobile first, then desktop.

---

### 10) Technical requirements (GitHub Pages deployment)

**TR1. Deployment**

* Repo deploys to GitHub Pages.
* Use GitHub Actions workflow to build and deploy if using a framework (Astro, Next static export, Vite). GitHub explicitly supports Pages deployments through Actions workflows. ([GitHub Docs][4])
* If the output uses paths that conflict with Jekyll processing, include a `.nojekyll` file in the published root. ([GitHub Docs][4])

**TR2. Recommended stack (pick one)**

* Option A (preferred): Astro + Markdown/MDX content. Fast, easy content edits, supports interactive islands.
* Option B: Vite + React. Static build output deployed to Pages.
* Option C: Plain HTML/CSS/JS for simplest maintenance.

**TR3. Performance**

* Target Lighthouse 90+ on mobile for Performance, Accessibility, Best Practices, SEO.
* Optimize images. Use modern formats where possible.

**TR4. SEO**

* Title, meta description, Open Graph tags.
* Structured data for “Person” and “Service” if easy.

---

### 11) Content model (so Wilson can edit without dev work)

Create a `content/` folder with one file per section, or a single `value.md` with frontmatter.

Minimum editable fields:

* hero_headline, hero_subheadline
* pillar bullets
* services list (title, best_for, outcome, deliverables, format)
* case studies list (title, context, outcome, link)
* contact CTA text

---

### 12) Analytics (optional but useful)

Track only:

* CTA clicks (Work with me, Request scope)
* Case study clicks
* Contact submits

Keep analytics lightweight. No heavy trackers.

---

### 13) Acceptance criteria

* Page deployed on GitHub Pages and loads over HTTPS. ([GitHub Docs][1])
* In 5 seconds, a new visitor can answer: “Who is this for” and “What are the 3 services”.
* All CTAs work on mobile and desktop.
* No broken links. No layout shifts on load.
* Page remains within GitHub Pages limits (site size, deployment time). ([GitHub Docs][2])
* Content is editable via Markdown or a simple config file without touching components.

---

### 14) Deliverables for the dev team

1. Implement the page using chosen stack.
2. Create the content model and populate with initial copy.
3. Set up Pages deployment workflow (Actions if needed). ([GitHub Docs][4])
4. Add `.nojekyll` in published root if applicable. ([GitHub Docs][4])
5. Basic QA checklist (mobile, nav anchors, CTA flows, page speed).

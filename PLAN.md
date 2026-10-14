# ETF Landing Page – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. One task = one commit.

**Goal:** Ship the lead-generation landing page described in README.md so an ad campaign could run on it tomorrow.

**Architecture:** Single Nuxt page. Static ETF data in `/data/etfs.json` is the one source of truth for every figure on the page and in the e-mail. A pure calculator function in `shared/` turns (monthly amount, years, fund TER) into CZK and is used by both the page and the server-side e-mail. One server route upserts the lead into Supabase and sends the full comparison with Resend. PostHog client plugin fires the six funnel events. URL `?v=` picks the headline.

**Tech Stack:** Nuxt 4.0.1 (`app/` + `shared/` + `server/` layout), Vue 3, TypeScript, pnpm, Vitest, zod, `@supabase/supabase-js` (server only), `resend` (server only), `posthog-js`, plain CSS with custom properties, Vercel.

**Spec:** [README.md](./README.md) sections 2–11 (decisions, final) and [assignment.md](./assignment.md) task B (requirements). Checked against each other 2026-10-14: README covers every point of task B. Two things from the assignment that no README section states outright: **deadline 16. 10. 2026** and the page **must not look like a default Claude output** (design and copy are judged, see Task 6). Deliverables beyond the page: public GitHub repo, live URL, both ad versions in `/ads`, `/ai-log` exports via `/export`, commit history per step.

## Decisions taken (2026-10-14)

| # | Decision |
|---|----------|
| 1 | Nuxt 4, no downgrade. |
| 2 | Analytics: PostHog. |
| 3 | Funds: SPY, VOO, IVV, SPLG, each with its UCITS equivalent (ticker + ISIN). Page shows SPY, VOO, IVV. E-mail and thank-you show all four. |
| 4 | E-mail: Resend from a Nuxt server route (Task 5). Thank-you screen shows the comparison and says it was also sent by e-mail. |
| 5 | Calculator: slider 500–20 000 CZK, years 5/10/20/30, initial 3 000 / 20, **result hidden until first input change**; `calc_result` fires then. README §10 hypothesis 3 tests "result visible on load" as the variant. |
| 6 | Leads: `unique(email)`; repeat submit upserts (updates monthly, years, variant). Always show thank-you. `form_submit` fires on every submit. |

## Global Constraints

- Mobile first, design at **380 px** viewport, no horizontal scroll at 380 px.
- **All visible text in Czech**, including the e-mail. Czech strings live in one file `shared/content/cs.ts` (shared so the server e-mail template uses the same strings).
- **No invented figures.** Every number in `/data/etfs.json` has `source` (URL on the issuer's domain) and `checked` (ISO date). The implementer never types a value from memory: open the issuer page, copy the value as shown, record URL and date. `pnpm check:data` fails on any missing value, source or date and runs in `prebuild`, so a deploy with missing data fails (README §7).
- The assumed yearly return and the fee formula are **owner decisions** (README §7, §11): `TODO(human)` in Task 2.
- Headline default without `?v=` is version A (README §4).
- Form has one field: e-mail. Amount, years and ad version come from page state (README §3).
- Event names exactly as README §8: `page_view`, `calc_change`, `calc_result`, `form_focus`, `form_submit`, `thankyou_view`.
- Leads table `leads`: e-mail, amount, years, ad version, created_at (README §8), plus `updated_at` for the upsert.

## Review Focus

Inputs the README implies but no task's tests cover unless added. Each has a test in the owning task.

1. Slider at bounds (500, 20 000) and years 5/30: result renders, no NaN, CZK number does not overflow at 380 px. → Task 2 test, Task 6 visual check.
2. E-mail with uppercase or surrounding spaces (`" Jan@Example.CZ "`): accepted, stored normalised, so the unique constraint catches the same person twice. → Task 3 test.
3. Form submitted before the calculator was touched (user scrolled to the bottom form): amount/years are the current slider values (3 000 / 20), not `null`. → Task 3 test.
4. `?v=X`, `?v=` or `?v[]=b`: falls back to `a`, headline not empty, `page_view` reports `a`. → Task 7 test.
5. Resend down or key missing: lead must still be saved and thank-you still shown; the page must not claim the e-mail went out. → Task 5 test + manual check.

## File structure

```
data/etfs.json                     all figures + source + checked date
scripts/check-data.mjs             fails if any value/source/date missing or URL not on issuer domain
shared/types/etf.ts                Etf, EtfValue types (app + server + script)
shared/utils/feeCalc.ts            pure calc, used by page and e-mail
shared/utils/feeCalc.test.ts
shared/utils/variant.ts            normalizeVariant(q) → 'a'|'b'
shared/utils/variant.test.ts
shared/content/cs.ts               every Czech string (page + e-mail)
app/app.vue                        shell: <NuxtPage/>
app/pages/index.vue                the one page, sections in README §5 order
app/assets/css/main.css            tokens + base, mobile first
app/composables/useEtfs.ts         typed access to etfs.json (pageFunds / allFunds / dataCheckedDate)
app/composables/useVariant.ts      normalizeVariant(useRoute().query.v)
app/composables/useTrack.ts        wrapper over posthog.capture, no-op without key
app/composables/useCalculator.ts   reactive state: monthly, years, touched, results
app/components/Calculator.vue      section 1 inputs
app/components/CalcResult.vue      section 2
app/components/LeadForm.vue        sections 3 and 6, prop placement 'top'|'bottom'
app/components/CompareTable.vue    section 4 (3 funds) and thank-you (4 funds), prop funds
app/components/HowToBuy.vue        section 5
app/components/ThankYou.vue        Task 8
app/components/SiteFooter.vue      section 7
app/plugins/posthog.client.ts      Task 4
server/api/lead.post.ts            validate → upsert → send e-mail → respond
server/utils/lead.ts               zod schema, parseLead
server/utils/supabase.ts           service-role client
server/utils/leadEmail.ts          buildLeadEmail(lead) → { subject, html, text } (Task 5)
server/utils/leadEmail.test.ts
server/utils/lead.test.ts
server/utils/resend.ts             Resend client (Task 5)
supabase/leads.sql                 table DDL
ads/a.md, ads/b.md                 ad texts from README §4
.env.example
```

---

### Task 1: ETF data file with sources and dates

**Files:**
- Create: `data/etfs.json`, `shared/types/etf.ts`, `scripts/check-data.mjs`
- Modify: `package.json` (scripts `check:data`, `prebuild`)

**Interfaces (produces):**
- `EtfValue<T> = { value: T; source: string; checked: string /* YYYY-MM-DD */ }`
- `Etf = { ticker: string; name: string; issuer: string; issuerUrl: string; showOnPage: boolean; exchange: EtfValue<string>; terPct: EtfValue<number>; aumUsd: EtfValue<number>; dividendYieldPct: EtfValue<number>; ucits: { ticker: string; name: string; isin: EtfValue<string>; terPct: EtfValue<number>; issuerUrl: string } }`
- `data/etfs.json = { funds: Etf[] }`, order SPY, VOO, IVV, SPLG.

- [ ] **Step 1: Write `shared/types/etf.ts`** with the types above. No values.
- [ ] **Step 2: Write `data/etfs.json` skeleton** with the 4 funds, `showOnPage: true` for SPY/VOO/IVV, `false` for SPLG, every `value: null`, every `checked: null`, every `source` prefilled with the issuer page. Issuer pages verified reachable 2026-10-14:
  - SPY: https://www.ssga.com/us/en/intermediary/etfs/spdr-sp-500-etf-trust-spy
  - VOO: https://investor.vanguard.com/investment-products/etfs/profile/voo
  - IVV: https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf
  - SPLG → the SSGA page redirects to **SPYM** (https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym, listing date Nov 08 2005 = the former SPLG). The issuer renamed the ticker; the data file uses `SPYM` as the page shows it.
  - UCITS equivalents (owner confirms the pairing on each page): SPY→SPY5 https://www.ssga.com/uk/en_gb/intermediary/etfs/spdr-sp-500-ucits-etf-spy5-gy, VOO→VUAA https://www.vanguard.co.uk/professional/product/etf/equity/9694/sp-500-ucits-etf-usd-accumulating (id 9503 is the Distributing class VUSA despite its slug), IVV→CSPX https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund, SPYM→SPYL https://www.ssga.com/uk/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy
- [ ] **Step 3: Write `scripts/check-data.mjs`** (plain Node, no deps): loads the JSON, walks every object with `source`/`checked`, exits 1 with the path of the first field where `value` is null/NaN/empty, `source` is not `https://` on the same host as the fund's `issuerUrl` (or `ucits.issuerUrl`), or `checked` is not a valid `YYYY-MM-DD`. Exit 0 and print a one-line table (ticker, TER, UCITS ticker, checked) otherwise.
- [ ] **Step 4: Add scripts** to `package.json`: `"check:data": "node scripts/check-data.mjs"`, `"prebuild": "pnpm check:data"`.
- [ ] **Step 5: Run `pnpm check:data`** → must FAIL naming `funds[0].exchange.value`.
- [ ] **Step 6: Fill values by hand.** Open each issuer URL, copy TER, fund size (USD, plain number), dividend yield (30 Day SEC Yield for US funds, noted in `note`), exchange, ISIN exactly as shown, set `checked` to today's date. Do not round beyond what the page shows. Note: investor.vanguard.com blocks headless browsers, so VOO can only be read in a normal browser.
- [ ] **Step 7: Run `pnpm check:data`** → PASS, table printed.
- [ ] **Step 8: Commit** `feat: add ETF data with sources and check script`

**Verify:** `pnpm check:data` prints the table. Open two random `source` URLs from the file and see the same figure on the issuer page. Set one `checked` to `null`, confirm `pnpm build` fails before Nuxt starts, revert.

---

### Task 2: Fee calculator (page sections 1 and 2)

**Files:**
- Create: `shared/utils/feeCalc.ts`, `shared/utils/feeCalc.test.ts`, `shared/content/cs.ts` (calculator strings only for now), `app/composables/useEtfs.ts`, `app/composables/useCalculator.ts`, `app/components/Calculator.vue`, `app/components/CalcResult.vue`, `app/pages/index.vue`, `vitest.config.ts`
- Modify: `app/app.vue` (replace `NuxtWelcome` with `<NuxtPage />`), `package.json` (`"test": "vitest run"`, devDep `vitest`)

**Interfaces:**
- Consumes: `Etf` from Task 1.
- Produces (all in `shared/utils/feeCalc.ts`, no Vue imports, importable from server):
  - `CALC_ASSUMPTIONS = { annualReturnPct: number }` – **TODO(human)**: owner sets the value; shown next to the result and in the e-mail (README §11).
  - `endValue(input: { monthly: number; years: number; annualReturnPct: number; terPct: number }): number` – **TODO(human)** ≤30 lines: owner decides monthly vs yearly compounding and whether TER lowers the rate or is taken from the balance. Implementer writes signature, JSDoc with both options, tests; owner writes the body.
  - `compareFunds(monthly: number, years: number, funds: Etf[]): { rows: { ticker: string; endValue: number; feesPaid: number }[]; feeGap: number }` – rows sorted by `endValue` desc, `feeGap = max − min`. Implementer writes; only calls `endValue`.
  - `formatCzk(n: number): string` – `cs-CZ`, no decimals, NBSP before `Kč`.
  - `YEARS = [5, 10, 20, 30] as const`, `MONTHLY = { min: 500, max: 20000, step: 500, initial: 3000 }`, `YEARS_INITIAL = 20`.
- `useCalculator()` → `{ monthly: Ref<number>; years: Ref<5|10|20|30>; touched: Ref<boolean>; result: ComputedRef<ReturnType<typeof compareFunds> | null> }`. `result` is `null` until `touched` (Decision 5).

- [ ] **Step 1: Install** `pnpm add -D vitest`, write `vitest.config.ts` (environment `node`, include `shared/**/*.test.ts`, `server/**/*.test.ts`).
- [ ] **Step 2: Write failing tests** in `feeCalc.test.ts` that hold for any sane formula:
  - TER 0 and return 0 → `endValue === monthly * years * 12`.
  - Higher TER → strictly lower `endValue`, same other inputs.
  - 0 years → 0.
  - `compareFunds` rows sorted desc, `feeGap >= 0`, `feeGap === 0` when all TERs equal.
  - Bounds: monthly 500 / 20 000, years 5 / 30 → finite number > 0 (Review Focus 1).
  - `formatCzk(1234567)` → `"1 234 567 Kč"` with NBSP.
  - `test.todo('matches owner spreadsheet row 1')` – owner fills expected value from their spreadsheet (README §12).
- [ ] **Step 3: Run `pnpm test`** → FAIL (module missing).
- [ ] **Step 4: Write `feeCalc.ts`** constants, `compareFunds`, `formatCzk`; `endValue` body throws `Error('TODO(human)')`.
- [ ] **Step 5: Owner writes `endValue` and sets `annualReturnPct`.** Implementer reviews as code review.
- [ ] **Step 6: Run `pnpm test`** → PASS. Owner fills the spreadsheet test, run again → PASS.
- [ ] **Step 7: Write `useEtfs.ts`** (imports `~~/data/etfs.json`, exposes `pageFunds` = `showOnPage`, `allFunds`, `dataCheckedDate` = max `checked`).
- [ ] **Step 8: Write `useCalculator.ts`, `Calculator.vue`, `CalcResult.vue`, `pages/index.vue`**. Labels from `cs.ts`. `CalcResult` renders nothing while `result` is null; after that: end value per page fund, fee-gap sentence, assumed-return line. Unstyled is fine; Task 6 styles.
- [ ] **Step 9: Run `pnpm dev`**: no result on load; move slider → result appears and updates instantly; switch years → updates.
- [ ] **Step 10: Commit** `feat: fee calculator with pure calc and tests`

**Verify:** `pnpm test` green. Browser: 3 000 CZK / 20 years, the three end values equal the owner's spreadsheet to the crown. Slider at 500 and 20 000 shows no NaN. Result is hidden on first load.

---

### Task 3: E-mail form and lead storage

**Files:**
- Create: `server/api/lead.post.ts`, `server/utils/lead.ts`, `server/utils/lead.test.ts`, `server/utils/supabase.ts`, `supabase/leads.sql`, `shared/utils/variant.ts`, `app/composables/useVariant.ts`, `app/components/LeadForm.vue`, `.env.example`
- Modify: `nuxt.config.ts` (runtimeConfig `supabaseUrl`, `supabaseServiceKey`), `app/pages/index.vue` (form under result), `shared/content/cs.ts` (form strings), `package.json` (`zod`, `@supabase/supabase-js`)

**Interfaces:**
- Consumes: `useCalculator()` from Task 2.
- Produces:
  - `POST /api/lead` body `{ email: string; monthly: number; years: number; variant: 'a'|'b'; website?: string }` (`website` = honeypot; non-empty → `201 { ok: true, emailed: false }` with no DB write). Responses: `201 { ok: true, emailed: boolean }` (`emailed` always `false` until Task 5), `400 { ok: false, error: 'invalid_email' | 'invalid_input' }`, `500 { ok: false, error: 'storage' }`.
  - `parseLead(body: unknown): Lead` in `server/utils/lead.ts`; `Lead = { email: string; monthly: number; years: 5|10|20|30; variant: 'a'|'b' }`. Trims + lowercases e-mail.
  - `upsertLead(lead: Lead): Promise<void>` in `server/utils/supabase.ts` – `upsert(..., { onConflict: 'email' })`, sets `updated_at = now()`.
  - `normalizeVariant(q: unknown): 'a' | 'b'` in `shared/utils/variant.ts` – only the string `'b'` gives `'b'`.
  - `useVariant(): 'a' | 'b'` – `normalizeVariant(useRoute().query.v)`, read during setup (SSR-safe).
  - `LeadForm.vue` props `{ placement: 'top' | 'bottom' }`, emits `submitted(payload: { emailed: boolean })`.
  - SQL: `leads(id uuid pk default gen_random_uuid(), email text not null unique, monthly int not null, years int not null, variant text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now())`, RLS enabled, no anon policy.

- [ ] **Step 1: Write `supabase/leads.sql`**, run it in the Supabase SQL editor.
- [ ] **Step 2: Write `.env.example`**: `SUPABASE_URL=`, `SUPABASE_SERVICE_KEY=`, `NUXT_PUBLIC_POSTHOG_KEY=`, `NUXT_PUBLIC_POSTHOG_HOST=`, `RESEND_API_KEY=`, `MAIL_FROM=`. Create local `.env` (git-ignored).
- [ ] **Step 3: Write failing tests** `server/utils/lead.test.ts`: `" Jan@Example.CZ "` → `jan@example.cz` (Review Focus 2); no `@` → throws `invalid_email`; monthly 400 or 25 000 → `invalid_input`; years 15 → `invalid_input`; variant `'x'` → `'a'`.
- [ ] **Step 4: Run `pnpm test`** → FAIL.
- [ ] **Step 5: Write `lead.ts`** (zod schema, `parseLead`), `supabase.ts` (`upsertLead`), `lead.post.ts` (honeypot → 201 without write; parse → 400; upsert → 201). **TODO(human)** ≤30 lines in `lead.post.ts`: what the client gets when Supabase throws (500 `storage` vs. still 201 and log) – owner decides and writes the catch.
- [ ] **Step 6: Run `pnpm test`** → PASS.
- [ ] **Step 7: Write `variant.ts`, `useVariant.ts`, `LeadForm.vue`** (e-mail input `type=email` `autocomplete=email` `inputmode=email`, submit button, consent line under the button per README §11, inline Czech error, disabled while sending). Form sends `monthly`/`years` from `useCalculator` even if `touched` is false (Review Focus 3). Mount under `CalcResult` with `placement="top"`.
- [ ] **Step 8: Manual:** `pnpm dev`, submit your address → row in Supabase. Submit the same address with other slider values → still one row, `monthly`/`years`/`updated_at` changed (Decision 6). Submit `foo` → Czech error, no row. Honeypot: `curl -X POST localhost:3000/api/lead -H 'content-type: application/json' -d '{"email":"x@y.cz","monthly":3000,"years":20,"variant":"a","website":"spam"}'` → 201, no row.
- [ ] **Step 9: Unset `SUPABASE_URL`, reload** → page and calculator work; submit behaves as the owner decided in Step 5. Restore.
- [ ] **Step 10: Commit** `feat: lead form with Supabase upsert`

**Verify:** One row in Supabase after two submits of the same e-mail, with the second submit's values. Honeypot curl creates no row.

---

### Task 4: Analytics events (README §8)

**Files:**
- Create: `app/plugins/posthog.client.ts`, `app/composables/useTrack.ts`
- Modify: `nuxt.config.ts` (runtimeConfig.public `posthogKey`, `posthogHost`), `useCalculator.ts`, `CalcResult.vue`, `LeadForm.vue`, `pages/index.vue`, `package.json` (`posthog-js`)

**Interfaces:**
- Produces: `useTrack()` → `(event: EventName, props?: Record<string, string | number | boolean>) => void`; `EventName = 'page_view'|'calc_change'|'calc_result'|'form_focus'|'form_submit'|'thankyou_view'`. No-op + `console.debug` when key missing.

- [ ] **Step 1: Install `posthog-js`**, write plugin: `capture_pageview: false`, `autocapture: false`, `persistence: 'memory'` (no cookie until the GDPR note in README §11 is settled), skip init when `navigator.doNotTrack === '1'`.
- [ ] **Step 2: Write `useTrack.ts`** with the union type; TypeScript enforces the names, no test needed.
- [ ] **Step 3: Wire events:**
  - `page_view { variant }` – `index.vue` `onMounted`.
  - `calc_change { field: 'monthly'|'years' }` – once per page load, on the first change in `useCalculator`.
  - `calc_result { monthly, years, feeGap }` – once, when `touched` becomes true (Decision 5).
  - `form_focus { placement }` – first focus of the e-mail input, once per form instance.
  - `form_submit { placement, variant, emailed }` – after every `201` from `/api/lead` (Decision 6: every submit, repeats included).
  - `thankyou_view` – Task 8; type already in the union.
- [ ] **Step 4: Manual:** `pnpm dev`, PostHog → Activity: walk the funnel on the phone: one `page_view`, one `calc_change`, one `calc_result`, one `form_focus`, one `form_submit` with the right props. Move the slider five times → still one `calc_change`.
- [ ] **Step 5: Create the funnel insight** in PostHog (six steps) and screenshot it for README §8.
- [ ] **Step 6: Commit** `feat: PostHog funnel events`

**Verify:** PostHog live view shows the walk with `variant: a`. Without `NUXT_PUBLIC_POSTHOG_KEY` the console shows debug lines and no requests to PostHog.

---

### Task 5: Send the comparison by e-mail (Resend)

**Files:**
- Create: `server/utils/leadEmail.ts`, `server/utils/leadEmail.test.ts`, `server/utils/resend.ts`
- Modify: `server/api/lead.post.ts` (send after upsert), `nuxt.config.ts` (runtimeConfig `resendApiKey`, `mailFrom`), `shared/content/cs.ts` (e-mail strings), `package.json` (`resend`)

**Interfaces:**
- Consumes: `Lead` from Task 3, `compareFunds`, `formatCzk`, `CALC_ASSUMPTIONS` from Task 2, `data/etfs.json` (all 4 funds), `cs.ts`.
- Produces:
  - `buildLeadEmail(lead: Lead, funds: Etf[]): { subject: string; html: string; text: string }` – pure, testable. Content in Czech: the visitor's numbers (monthly, years), table of all four funds (TER, size, dividend yield, exchange, end value and fees paid for their inputs), UCITS equivalent per fund (ticker, ISIN, TER), one line with the assumed return, sources + checked date, "není investiční doporučení" line. Inline CSS only, single column, works at 380 px in Gmail.
  - `sendLeadEmail(lead: Lead): Promise<boolean>` in `server/utils/resend.ts` – `false` when key missing or Resend throws; never throws.
  - `lead.post.ts` now: honeypot → 201 `{ ok: true, emailed: false }`; parse → 400; `upsertLead`; `emailed = await sendLeadEmail(lead)`; 201 `{ ok: true, emailed }`.

- [ ] **Step 1: Resend setup:** create API key, verify a sending domain or use the Resend test sender for your own address during dev; put `RESEND_API_KEY` and `MAIL_FROM` in `.env`.
- [ ] **Step 2: Write failing tests** `leadEmail.test.ts`: html contains all four tickers and all four UCITS ISINs; html contains `formatCzk(monthly)`; text version has no `<`; subject is Czech string from `cs.ts`; every `source` URL from the data appears once.
- [ ] **Step 3: Run `pnpm test`** → FAIL.
- [ ] **Step 4: Write `leadEmail.ts`** (template literal, data from `etfs.json`, strings from `cs.ts`) and `resend.ts`.
- [ ] **Step 5: Run `pnpm test`** → PASS.
- [ ] **Step 6: Wire `lead.post.ts`**. **TODO(human)** ≤30 lines: retry once or not, and whether a send failure is logged to PostHog server-side or only to Vercel logs – owner decides and writes it.
- [ ] **Step 7: Manual:** submit your address → e-mail arrives, open on the phone: single column, Czech, four funds, numbers match the page for the same inputs. Resubmit with other slider values → second e-mail with the new numbers (Decision 6).
- [ ] **Step 8: Unset `RESEND_API_KEY`**, submit → 201 with `emailed: false`, row saved (Review Focus 5). Restore.
- [ ] **Step 9: Commit** `feat: send full comparison by e-mail via Resend`

**Verify:** E-mail in your inbox with four funds and your numbers; `pnpm test` green; without the key the lead still saves and the response says `emailed: false`.

---

### Task 6: Mobile-first design and Czech copy (page sections 4–7 included)

**Files:**
- Create: `app/assets/css/main.css`, `app/components/CompareTable.vue`, `app/components/HowToBuy.vue`, `app/components/SiteFooter.vue`
- Modify: `shared/content/cs.ts` (all page strings), every component, `pages/index.vue` (README §5 order: headline+calculator, result, form top, table, how to buy, form bottom, footer), `nuxt.config.ts` (`css`, `app.head`: `lang="cs"`, viewport, title, description), `app/app.vue`

**Interfaces:**
- `CompareTable.vue` props `{ funds: Etf[]; monthly?: number; years?: number }` – TER, size, dividend yield, exchange; when `monthly`/`years` given also end value per fund. Reused in Task 8 with `allFunds`.
- `HowToBuy.vue` – paragraph per README §11 (US-domiciled ETFs mostly not sold to EU retail, missing KID), then list NYSE ticker → UCITS ticker + ISIN from `etfs.json`. No broker recommended.
- `SiteFooter.vue` – unique `source` URLs, `dataCheckedDate`, "není investiční doporučení", consent/GDPR note.

- [ ] **Step 1: Write `main.css`**: tokens (`--space-*`, `--color-*`, `--radius`), base at 380 px, `max-width: 42rem` centred above 600 px, 44 px tap targets, `font-size: 16px` on inputs (no iOS zoom), styled `input[type=range]` thumb ≥ 28 px.
- [ ] **Step 2: Write all Czech copy in `cs.ts`**. Headline A from README §4: "Kolik vám poplatky seberou za 20 let?" under `headline.a` (`headline.b` in Task 7). Owner reads and rewrites stiff sentences (README §12).
- [ ] **Step 3: Build `CompareTable`, `HowToBuy`, `SiteFooter`**, mount in order. Second `LeadForm placement="bottom"` after `HowToBuy`.
- [ ] **Step 4: Style the fold:** at 380×700 headline, slider, years selector and the result (once visible) fit without scrolling (README §3).
- [ ] **Step 5: Checks:** Chrome DevTools at 380 px: `document.documentElement.scrollWidth === 380` before and after the result appears, slider at 20 000 and 30 years (Review Focus 1). Lighthouse mobile: Accessibility ≥ 95, Performance ≥ 90. Real phone over LAN (`pnpm dev --host`).
- [ ] **Step 6: Grep for English leaks:** `grep -rn ">[A-Za-z][^<{]*<" app/components app/pages` – every hit must be a `cs.` binding or markup, not a literal.
- [ ] **Step 7: Commit** `feat: mobile-first layout and Czech copy`

**Verify:** Screenshot at 380 px with the fold, no horizontal scroll, Lighthouse scores, owner's read-through of `cs.ts`.

---

### Task 7: Ad variants and `?v=a` / `?v=b` headline switch

**Files:**
- Create: `ads/a.md`, `ads/b.md`, `shared/utils/variant.test.ts`
- Modify: `shared/content/cs.ts` (`headline.b`, `sub.a`, `sub.b`), `pages/index.vue` (headline by `useVariant()`)

**Interfaces:**
- Consumes: `normalizeVariant`, `useVariant()` from Task 3.
- `ads/a.md`, `ads/b.md`: promise, headline, text from README §4, landing URL with `?v=a` / `?v=b`.

- [ ] **Step 1: Write `ads/a.md`, `ads/b.md`** verbatim from README §4.
- [ ] **Step 2: Write failing tests** `variant.test.ts`: `'b'`→`b`, `'a'`→`a`, `'X'`/`''`/`undefined`/`['b']`→`a` (Review Focus 4).
- [ ] **Step 3: Run `pnpm test`** → PASS if Task 3 implemented it right; fix otherwise.
- [ ] **Step 4: Add `headline.b`** "Který S&P 500 ETF? Spočítejte si rozdíl." and sublines to `cs.ts`; `index.vue` picks by variant during setup so SSR HTML already has the right headline (no flash).
- [ ] **Step 5: Manual:** `/`, `/?v=a`, `/?v=b`, `/?v=zz` → headline right; `page_view` in PostHog carries the same variant; lead row carries it.
- [ ] **Step 6: Commit** `feat: ad variants and headline switch`

**Verify:** `curl -s 'localhost:3000/?v=b' | grep -c "Který S&P"` → 1. Lead row for a `?v=b` submit has `variant = b`.

---

### Task 8: Thank-you screen

**Files:**
- Create: `app/components/ThankYou.vue`
- Modify: `pages/index.vue` (state `submitted`, `emailed`), `LeadForm.vue` (emit `submitted({ emailed })`), `shared/content/cs.ts` (thank-you copy, two variants of the e-mail line), `useTrack` wiring

**Interfaces:**
- Consumes: `CompareTable` with `allFunds` + `monthly`/`years`, `useCalculator`, `useTrack`, `emailed` from the API response.
- `ThankYou.vue` props `{ monthly: number; years: number; emailed: boolean }`: heading, one line restating their numbers, `CompareTable :funds="allFunds" :monthly :years`, UCITS equivalents, line "také jsme vám to poslali e-mailem" only when `emailed` is true, otherwise a line saying the comparison is below (Review Focus 5).

- [ ] **Step 1: Write thank-you copy** in `cs.ts` (both e-mail lines).
- [ ] **Step 2: Build `ThankYou.vue`**; when `submitted`, replace both `LeadForm` instances with it (one `ThankYou`, placed where the submitted form was), scroll into view, keep the rest of the page. Shown on every submit including repeats (Decision 6).
- [ ] **Step 3: Fire `thankyou_view { variant, placement, emailed }`** on mount.
- [ ] **Step 4: Manual:** submit from the top form and from the bottom form in two sessions; thank-you shows four funds + UCITS, numbers match the calculator inputs and the e-mail; PostHog `thankyou_view` once per session; the Task 4 funnel insight shows all six steps.
- [ ] **Step 5: Commit** `feat: thank-you screen with full comparison`

**Verify:** Full path on a real phone from `?v=b`: calculator → submit → thank-you with four funds; one Supabase row; e-mail received; six events in PostHog.

---

## After Task 8 (outside this plan, listed so nothing is forgotten)

- Deploy to Vercel with env vars from `.env.example`; `prebuild` data check runs there. Verify the sending domain in Resend for production.
- README TODOs you own: §7 table values and formula, §8 tool and verification, §11 return %, §12 prompts/AI mistakes, §13, §14 env vars.
- `/ai-log` exports after each session.
- Re-check this plan against `assignment.md` once it is in the repo.

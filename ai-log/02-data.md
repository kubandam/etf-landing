❯ <ide_selection>The user selected the lines 162 to 162 from
/Users/kubandam/Work/etf-landing/README.md:
TODO

This may or may not be related to the current task.</ide_selection>

❯ Read README.md and assignment.md. README contains my decisions
(target audience, offer, ads, page structure, measurement). Do not
change them.

Propose an implementation plan as a list of steps. Each step must be
one commit and must end with a way for me to verify it works. Order:

1. ETF data in /data/etfs.json with source URL and date per value
2. fee calculator (sections 1 and 2 of the page)
3. e-mail form + saving leads
4. analytics events from README section 8
5. mobile-first design and Czech copy
6. ad variants and ?v=a / ?v=b headline switch
7. thank-you screen

Constraints: Nuxt 3, mobile first (380 px), all visible text in Czech,
no figures invented by you – every number in the data file must come
from an issuer page I can open. Write the plan to PLAN.md. No code yet.

⏺ Using superpowers:writing-plans to shape PLAN.md.

⏺ Skill(superpowers:writing-plans)
⎿  Successfully loaded skill

⏺ Čítam README.md a assignment.md, potom napíšem PLAN.md.

Listed 1 directory, ran 2 shell commands (ctrl+o to expand)

⏺ Zistenia: assignment.md v repe nie je. Projekt beží na Nuxt 4 (nuxt ^4.6.1,
adresár app/), nie Nuxt 3. Overím URL emitentov a verzie.

Ran 1 shell command (ctrl+o to expand)

⏺ Všetky URL emitentov odpovedajú 200. Píšem PLAN.md.

⏺ Bash(cat > PLAN.md <<'EOF' # ETF Landing Page – Implementation Plan…)
⎿  Created PLAN.md (+266 -0)
1 +# ETF Landing Page – Implementation Plan
2 +
3 +> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers
+:executing-plans to implement this plan task-by-task. Steps us
+e checkbox (`- [ ]`) syntax for tracking. One task = one commi
+t.
4 +
5 +**Goal:** Ship the lead-generation landing page described in R
+EADME.md so an ad campaign could run on it tomorrow.
6 +
7 +**Architecture:** Single Nuxt page. Static ETF data in `/data/
          +etfs.json` is the one source of truth for every figure on the
+page. A pure calculator function turns (monthly amount, years, + fund TER) into CZK. One server route saves leads to Supabase. + PostHog client plugin fires the six funnel events. URL `?v=`
+picks the headline.
8 +
9 +**Tech Stack:** Nuxt 4.0.1 (already installed, `app/` director
+y layout), Vue 3, TypeScript, pnpm, Vitest, zod (body validati
+on), `@supabase/supabase-js` (server only), `posthog-js`, plai
+n CSS with custom properties (no UI framework), Vercel.
10 +
11 +**Spec:** [README.md](./README.md) sections 2–11. Decisions th
+ere are final; this plan only implements them. `assignment.md` + referenced in the brief is not in the repo.
12 +
13 +## Global Constraints
14 +
15 +- Mobile first, design at **380 px** viewport, no horizontal s
+croll at 380 px.
16 +- **All visible text in Czech.** Czech strings live in one fil
+e (`app/content/cs.ts`) so they can be reviewed in one place.
17 +- **No invented figures.** Every number in `/data/etfs.json` h
+as `source` (URL on the issuer's domain) and `checked` (ISO da
+te). The implementer never types a value from memory. Values a
+re read off the issuer page in the browser at implementation t
+ime and the URL + date recorded next to them. `pnpm check:data
          +` fails on any missing value, source or date, and runs before +`nuxt build`, so a deploy with missing data fails (README §7).
18 +- The assumed yearly return and the fee formula are **owner de
+cisions** (README §7, §11). They are `TODO(human)` in Task 2,
+not chosen by the implementer.
19 +- Headline default without `?v=` is version A (README §4).
20 +- Form has one field: e-mail. Amount, years and ad version com
+e from page state (README §3).
21 +- Events and names exactly as README §8: `page_view`, `calc_ch
          +ange`, `calc_result`, `form_focus`, `form_submit`, `thankyou_v
          +iew`.
22 +- Leads table: `leads` (e-mail, amount, years, ad version, cre
+ated_at) (README §8).
23 +
24 +## Open questions (answer before Task 1; plan assumes the firs
+t option)
25 +
26 +1. **Nuxt version.** Brief says Nuxt 3, repo has Nuxt 4.0.1 wi
+th `app/` layout. Plan assumes **stay on Nuxt 4** (paths below + use `app/…`). Downgrading means `rm -rf node_modules .nuxt`, +`pnpm add nuxt@^3`, move `app/app.vue` to root.
27 +2. **Analytics tool.** README §8 leaves PostHog / Plausible op
+en. Plan assumes **PostHog** (free tier, custom events and fun
+nels included; Plausible has no free tier and funnels are a pa
+id add-on).
28 +3. **"Full comparison" fund list.** README §3: page shows 3, e
+-mail/thank-you shows all. Which funds are "all"? Only four US
+-listed ETFs track the plain S&P 500: SPY, VOO, IVV, SPLG. Pla
+n assumes **SPLG is the 4th**, plus one UCITS equivalent per f
+und (README §11). You pick; the implementer adds no fund you d
+id not name.
29 +4. **E-mail sending.** README §3 promises the comparison "sent + by e-mail" and the thank-you says "it is in your inbox". No s
+tep in the brief sends e-mail. Plan assumes **no e-mail in thi
+s iteration**; thank-you copy must then not claim an inbox del
+ivery, or a Task 8 (Resend/Postmark from `server/api/lead.post
          +.ts`) is added. Decide before Task 7 copy is written.
30 +5. **Calculator initial state.** README §6 says slider 500–20
+000 CZK, a slider always has a value. README §10 hypothesis 3
+treats "defaults + result visible" as the variant, so the base
+line must hide the result until first interaction. Plan assume
+s: **slider starts at 3 000 CZK, years at 20, result hidden un
+til the first input change**. Confirm, because it decides when + `calc_result` fires.
31 +6. **Duplicate e-mail.** Second submit with same e-mail: inser
+t again, or unique constraint and treat as success? Marked `TO
          +DO(human)` in Task 3.
32 +
33 +## Review Focus
34 +
35 +Things the README implies but no task's tests cover unless add
+ed. Each gets a test in the owning task.
36 +
37 +1. Slider dragged to its bounds (500, 20 000) and years 5/30:
+result still renders, no NaN, no overflow of the CZK number on + 380 px. → Task 2 test, Task 5 visual check.
38 +2. E-mail with uppercase or surrounding spaces (`" Jan@Example
          +.CZ "`): should be accepted and stored normalised. → Task 3 te
+st.
39 +3. Form submitted before the calculator was touched (user scro
+lled straight to the second form): amount/years must be the cu
+rrent slider values, not `null`. → Task 3 test.
40 +4. `?v=X` or `?v=` with unknown value: must fall back to `a`,
+not render an empty headline, and `page_view` must report `a`. + → Task 6 test.
… 226 more lines (ctrl+o to expand)

⏺ Bash(sed -i '' 's#- Create: `server/api/lead.post.ts`,
`server/utils/supabase.ts`, `supabase/leads.sql`#- Create:
`server/api/lead.post.ts`, `server/utils/lead.ts`,…)
⎿  Updated PLAN.md (+1 -1)
142 ### Task 3: E-mail form and lead storage
143
144 **Files:**
145 -- Create: `server/api/lead.post.ts`, `server/utils/supabase.ts
          -`, `supabase/leads.sql`, `app/components/LeadForm.vue`, `app/c
          -omposables/useVariant.ts`, `.env.example`, `server/api/lead.te
          -st.ts`
145 +- Create: `server/api/lead.post.ts`, `server/utils/lead.ts`, `
          +server/utils/supabase.ts`, `supabase/leads.sql`, `app/componen
          +ts/LeadForm.vue`, `app/composables/useVariant.ts`, `.env.examp
          +le`, `server/api/lead.test.ts`
146 - Modify: `nuxt.config.ts` (runtimeConfig `supabaseUrl`, `supa
           baseServiceKey`), `app/pages/index.vue` (form under result), `
           package.json` (`zod`, `@supabase/supabase-js`)
147
148 **Interfaces:**

⏺ Plán je v PLAN.md. 7 krokov v tvojom poradí, každý = 1 commit + „Verify“ blok.
README nezmenené. Nič necommitnuté.

Čo v tvojom návrhu sedí: poradie hodnota → formulár, jedno pole, data file ako
jediný zdroj čísel, eventy pomenované dopredu.

Diery, ktoré som našiel. Odpovedz pred krokom 1:

1. Nuxt 3 vs. 4. Repo má nuxt ^4.0.1 a layout app/. Plán ráta s Nuxt 4.
   Downgrade chceš?
2. assignment.md v repe nie je. Plán ide len z README.
3. E-mail sa nikde neposiela. README §3 sľubuje PDF v inboxe, ale v tvojich 7
   krokoch nie je odoslanie. Thank-you text teda nesmie tvrdiť „máš to v
   mailu“, alebo pribudne krok 8 (Resend). Ktoré?
4. „Plné porovnanie“ = koľko fondov? Čistý S&P 500 na US burzách sledujú 4:
   SPY, VOO, IVV, SPLG. Plán predpokládá SPLG ako štvrtý + UCITS ekvivalent ku
   každému. Ty rozhodneš, ja žiadny nepridám.
5. Slider vs. „prázdny kalkulátor“. Slider má vždy hodnotu, takže baseline z
   §10 hypotézy 3 musí byť „výsledok skrytý do prvého dotyku“. Inak
   calc_result strieľa pri loade a lievik je bez informácie. Súhlasíš?
6. Analytika: PostHog (free, funnel, custom eventy). Plausible nemá free tier.
   OK?
7. Duplicitný e-mail: unique constraint, alebo každý submit nový riadok?

Čo ostáva na teba v kóde (TODO(human)): vzorec endValue a predpokladaný výnos
(krok 2), správanie pri chybe Supabase a duplicite (krok 3), SQL constraint.

Jedna vec k overeniu čísel: v kroku 1 je scripts/check-data.mjs, ktorý padne,
keď hodnota, URL alebo dátum chýba, a beží v prebuild. Hodnoty do JSON píšeš
ty z otvorenej stránky emitenta. Všetkých 6 URL som overil, vracajú 200.

Keď odpovieš, idem krok 1.

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/PLAN.md in the IDE. This may or may not be
related to the current task.</ide_opened_file>

❯ 1. Nuxt 4, no downgrade. My mistake in the prompt. 2. I added assignment.md, read it too. 3. Add step 8: send the comparison by e-mail with Resend (Nuxt server
route). Put it after step 4 (analytics), before design. Thank-you
screen shows the comparison and says it was also sent by e-mail. 4. Four funds: SPY, VOO, IVV, SPLG, each with its UCITS equivalent
(ticker + ISIN). Page shows SPY, VOO, IVV. E-mail has all four. 5. Agreed. Result hidden until first input change, calc_result fires
after that. Hypothesis 3 tests "result visible on load" as variant. 6. PostHog. 7. Unique constraint on e-mail, upsert on repeat submit (update amount,
years, ad version). Always show thank-you. form_submit event fires
on every submit.
Update PLAN.md with these decisions and rewrite steps if needed.

⏺ Čítam assignment.md, potom prepíšem PLAN.md.

Read 1 file, ran 1 shell command (ctrl+o to expand)

⏺ assignment.md v repe stále nie je (ani untracked). Prepisujem PLAN.md podľa
tvojich 7 odpovedí; assignment doplním, keď súbor uvidím.

⏺ Bash(cat > PLAN.md <<'EOF' # ETF Landing Page – Implementation Plan…)
⎿  1 file changed (binary, mode only or too large to show)

⏺ PLAN.md prepísaný podľa tvojich 7 rozhodnutí.

Zmeny:

- Poradie: 1 data, 2 kalkulátor, 3 formulár + upsert, 4 analytika, 5 Resend
  e-mail (nový), 6 design + copy, 7 ad varianty, 8 thank-you.
- Sekcia „Open questions“ nahradená tabuľkou „Decisions taken“.
- feeCalc.ts a cs.ts presunuté do shared/, lebo server ich potrebuje pre
  e-mail (rovnaké čísla a texty na stránke aj v maile).
- Leads: unique(email), upsert onConflict email, updated_at. form_submit pri
  každom odoslaní, s emailed v props.
- API vracia { ok, emailed }. Thank-you povie „poslali jsme e-mailem“ len keď
  emailed === true; keď Resend padne, lead sa uloží a stránka to netvrdí.
- SPLG + UCITS pre všetky 4 (SPY5, VUAA, CSPX, SPYL). Hodnoty a ISIN vypĺňaš
  ty zo stránky emitenta, check:data to vymáha.

TODO(human) v pláne (6): vzorec endValue + výnos, catch pri chybe Supabase,
retry/log pri chybe Resend.

Jedna vec: assignment.md v repe stále nie je (ani ako untracked). Skontroluj,
či si ho uložil do /Users/kubandam/Work/etf-landing/. Keď ho uvidím, prejdem
plán proti nemu.

Idem krok 1?

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/assignment.md in the IDE. This may or may
not be related to the current task.</ide_opened_file>

❯ uz je tam, zacni

⏺ Čítam assignment.md, porovnám s plánom, potom krok 1.

Read 1 file (ctrl+o to expand)

⏺ Assignment B zodpovedá README, plán ho pokrýva – doplním doň deadline 16. 10.
2026 a požiadavku, aby výstup nepôsobil ako štandardný od Claude (ovplyvní
krok 6). Teraz začínam krok 1 (typy, skeleton JSON, check script) a súbežne
overím cez curl, či sú hodnoty v HTML emitentov čitateľné. · summary

⏺ Bash(python3 - <<'EOF'
import re…)
⎿  Updated PLAN.md (+1 -1)
8
9 **Tech Stack:** Nuxt 4.0.1 (`app/` + `shared/` + `server/` layo
ut), Vue 3, TypeScript, pnpm, Vitest, zod, `@supabase/supabase-
          js` (server only), `resend` (server only), `posthog-js`, plain
CSS with custom properties, Vercel.
10
11 -**Spec:** [README.md](./README.md) sections 2–11. Decisions the
-re are final; this plan only implements them. `assignment.md` w
-as mentioned but is not in the repo at the time of writing; add - it and re-check this plan against it before Task 1.
11 +**Spec:** [README.md](./README.md) sections 2–11 (decisions, fi
+nal) and [assignment.md](./assignment.md) task B (requirements)
+. Checked against each other 2026-10-14: README covers every po
+int of task B. Two things from the assignment that no README se
+ction states outright: **deadline 16. 10. 2026** and the page * +*must not look like a default Claude output** (design and copy
+are judged, see Task 6). Deliverables beyond the page: public G
+itHub repo, live URL, both ad versions in `/ads`, `/ai-log` exp
+orts via `/export`, commit history per step.
12
13 ## Decisions taken (2026-10-14)
14
⎿  Created shared/types/etf.ts (+38 -0)
1 +/** One figure taken from an issuer page: the value, where it w
+as read and when. _/
2 +export interface EtfValue<T> {
3 + value: T
4 + /\*\* https URL on the issuer's domain where `value` can be rea
+d. _/
5 + source: string
6 + /** Date the value was read off `source`, YYYY-MM-DD. \*/
7 + checked: string
8 +}
9 +
10 +/** UCITS (EU-domiciled) equivalent of a US-listed fund, for th
+e "how to buy from CZ" section. _/
11 +export interface UcitsEquivalent {
12 + ticker: string
13 + name: string
14 + issuerUrl: string
15 + isin: EtfValue<string>
16 + terPct: EtfValue<number>
17 +}
18 +
19 +export interface Etf {
20 + ticker: string
21 + name: string
22 + issuer: string
23 + issuerUrl: string
24 + /\*\* true for the 3 funds shown on the page; all funds go to t
+he e-mail and thank-you. _/
25 + showOnPage: boolean
26 + exchange: EtfValue<string>
27 + /** Total expense ratio in percent per year, e.g. 0.03 means
+0.03 %. \*/
28 + terPct: EtfValue<number>
29 + /** Fund size in USD, plain number (no "bn"). _/
30 + aumUsd: EtfValue<number>
31 + /\*\* Trailing distribution / dividend yield in percent. _/
32 + dividendYieldPct: EtfValue<number>
33 + ucits: UcitsEquivalent
34 +}
35 +
36 +export interface EtfData {
37 + funds: Etf[]
38 +}

Ran 1 shell command (ctrl+o to expand)

⏺ Všetkých 8 stránok sa dá prečítať cez curl, no SSGA SPLG presmerovala na SPYM
a Vanguard UK URL 9503 patrí distribučnému VUSA, nie VUAA. Teraz hľadám
správnu VUAA stránku a popri tom píšem kontrolný skript. · summary

Ran 3 shell commands (ctrl+o to expand)

⏺ Bash(cd /Users/kubandam/Work/etf-landing && cat > scripts/check-data.mjs
<<'EOF'
#!/usr/bin/env node…)
⎿  Updated package.json (+3 -1)
7 "dev": "nuxt dev",
8 "generate": "nuxt generate",
9 "preview": "nuxt preview",
10 - "postinstall": "nuxt prepare"
10 + "postinstall": "nuxt prepare",
11 + "check:data": "node scripts/check-data.mjs",
12 + "prebuild": "pnpm check:data"
13 },
14 "dependencies": {
15 "nuxt": "^4.6.1",
⎿  Created scripts/check-data.mjs (+76 -0)
1 +#!/usr/bin/env node
2 +// Fails the build when any figure in data/etfs.json lacks a va
+lue, an issuer
3 +// source URL or the date it was checked. See PLAN.md Task 1 an
+d README §7.
4 +import { readFileSync } from 'node:fs'
5 +import { fileURLToPath } from 'node:url'
6 +import { dirname, resolve } from 'node:path'
7 +
8 +const here = dirname(fileURLToPath(import.meta.url))
9 +const file = resolve(here, '../data/etfs.json')
10 +const data = JSON.parse(readFileSync(file, 'utf8'))
11 +
12 +const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
      13 +const errors = []
      14 +
      15 +function host(url) {
      16 +  try {
      17 +    return new URL(url).host.replace(/^www\./, '')
      18 +  } catch {
      19 +    return null
      20 +  }
      21 +}
      22 +
      23 +function checkValue(path, v, issuerUrl) {
      24 +  if (v === null || typeof v !== 'object') return errors.push(`
         +${path}: not an object`)
      25 +  if (v.value === null || v.value === undefined || v.value ===
         +'' || (typeof v.value === 'number' && !Number.isFinite(v.value)
         +))
      26 +    errors.push(`${path}.value: missing`)
      27 +  if (typeof v.source !== 'string' || !v.source.startsWith('htt
         +ps://'))
      28 +    errors.push(`${path}.source: must be an https URL`)
      29 +  else if (host(v.source) !== host(issuerUrl))
      30 +    errors.push(`${path}.source: host ${host(v.source)} is not
         +the issuer host ${host(issuerUrl)}`)
      31 +  if (typeof v.checked !== 'string' || !ISO_DATE.test(v.checked
         +) || Number.isNaN(Date.parse(v.checked)))
      32 +    errors.push(`${path}.checked: missing or not YYYY-MM-DD`)
33 +}
34 +
35 +if (!Array.isArray(data.funds) || data.funds.length === 0) {
36 + console.error('data/etfs.json: funds must be a non-empty arra
+y')
37 + process.exit(1)
38 +}
39 +
40 +const FUND_VALUES = ['exchange', 'terPct', 'aumUsd', 'dividendY
+ieldPct']
… 36 more lines (ctrl+o to expand)

Ran 3 shell commands (ctrl+o to expand)
⏺ Mám hodnoty pre SPY, SPYM, SPY5, SPYL, CSPX, VUAA ISIN. Chýba: IVV čísla (sú v
JSON), VUAA OCF, VOO (stránka renderuje cez JS). Skúšam hlbšiu extrakciu a
Vanguard API.

Ran 1 shell command (ctrl+o to expand)

⏺ VOO stránka je čisto JS. Použijem Playwright na načítanie v prehliadači;
súbežne skúsim advisors stránku.

Listed 1 directory, called plugin:playwright:playwright 5 times, ran 1 shell command (ctrl+o to expand)

⏺ Vanguard blokuje botov, takže VOO zostane prázdne aj cez Playwright — budeš ho
musieť doplniť ručne z prehliadača. Zapisujem data/etfs.json s hodnotami zo 7
stránok, VOO nastavujem na null a checked ponechávam null všade na tvoje
overenie. · summary

Called plugin:playwright:playwright (ctrl+o to expand)

⏺ Bash(python3 - <<'EOF'
import re…)
⎿  Updated .gitignore (+3 -0)
22 .env
23 .env._
24 !.env.example
25 +
26 +# Playwright MCP session files
27 +.playwright-mcp
⎿  Created data/etfs.json (+188 -0)
1 +{
2 + "funds": [
3 + {
4 + "ticker": "SPY",
5 + "name": "State Street SPDR S&P 500 ETF Trust",
6 + "issuer": "State Street Global Advisors",
7 + "issuerUrl": "https://www.ssga.com/us/en/intermediary/et
+fs/spdr-sp-500-etf-trust-spy",
8 + "showOnPage": true,
9 + "exchange": {
10 + "value": "NYSE Arca",
11 + "source": "https://www.ssga.com/us/en/intermediary/etf
+s/spdr-sp-500-etf-trust-spy",
12 + "checked": null
13 + },
14 + "terPct": {
15 + "value": 0.0945,
16 + "source": "https://www.ssga.com/us/en/intermediary/etf
+s/spdr-sp-500-etf-trust-spy",
17 + "checked": null,
18 + "note": "Gross Expense Ratio"
19 + },
20 + "aumUsd": {
21 + "value": 823230730000,
22 + "source": "https://www.ssga.com/us/en/intermediary/etf
+s/spdr-sp-500-etf-trust-spy",
23 + "checked": null,
24 + "note": "Assets Under Management $823,230.73 M, page s
+ays as of Oct 13 2026"
25 + },
26 + "dividendYieldPct": {
27 + "value": 0.94,
28 + "source": "https://www.ssga.com/us/en/intermediary/etf
+s/spdr-sp-500-etf-trust-spy",
29 + "checked": null,
30 + "note": "30 Day SEC Yield"
31 + },
32 + "ucits": {
33 + "ticker": "SPY5",
34 + "name": "State Street SPDR S&P 500 UCITS ETF (Dist)",
35 + "issuerUrl": "https://www.ssga.com/uk/en_gb/intermedia
+ry/etfs/state-street-spdr-sp-500-ucits-etf-dist-spy5-gy",
36 + "isin": {
37 + "value": "IE00B6YX5C33",
38 + "source": "https://www.ssga.com/uk/en_gb/intermediar
+y/etfs/state-street-spdr-sp-500-ucits-etf-dist-spy5-gy",
39 + "checked": null
40 + },
… 148 more lines (ctrl+o to expand)
⎿  Updated shared/types/etf.ts (+2 -0)
5 source: string
6 /\*\* Date the value was read off `source`, YYYY-MM-DD. _/
7 checked: string
8 + /** Optional: which metric on the page this is (e.g. "30 Day
+SEC Yield"), or the page's own "as of" date. \*/
9 + note?: string
10 }
11
12 /** UCITS (EU-domiciled) equivalent of a US-listed fund, for th
e "how to buy from CZ" section. \*/

⏺ Bash((pnpm -s build >/dev/null 2>&1; echo "build exit $?") ; ls .output
2>/dev/null | head -1; python3 - <<'EOF'
p='PLAN.md'; s=open(p).read()…)
⎿  Updated PLAN.md (+3 -3)
98 - SPY: https://www.ssga.com/us/en/intermediary/etfs/spdr-sp-
500-etf-trust-spy
99 - VOO: https://investor.vanguard.com/investment-products/etf
s/profile/voo
100 - IVV: https://www.ishares.com/us/products/239726/ishares-co
re-sp-500-etf
101 - - SPLG: SSGA product page for SPDR Portfolio S&P 500 ETF (fi
-nd on ssga.com, record the URL you land on)
102 - - UCITS equivalents (owner confirms the pairing on each page
-): SPY→SPY5 https://www.ssga.com/uk/en_gb/intermediary/etfs/sp
-dr-sp-500-ucits-etf-spy5-gy, VOO→VUAA https://www.vanguard.co.
-uk/professional/product/etf/equity/9503/sp-500-ucits-etf-usd-a
-ccumulating, IVV→CSPX https://www.ishares.com/uk/individual/en
-/products/253743/ishares-sp-500-b-ucits-etf-acc-fund, SPLG→SPY
-L (SSGA UCITS page, record URL)
101 + - SPLG → the SSGA page redirects to **SPYM** (https://www.ss
+ga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-
+500-etf-spym, listing date Nov 08 2005 = the former SPLG). The + issuer renamed the ticker; the data file uses `SPYM` as the p
+age shows it.
102 + - UCITS equivalents (owner confirms the pairing on each page
+): SPY→SPY5 https://www.ssga.com/uk/en_gb/intermediary/etfs/sp
+dr-sp-500-ucits-etf-spy5-gy, VOO→VUAA https://www.vanguard.co.
+uk/professional/product/etf/equity/9694/sp-500-ucits-etf-usd-a
+ccumulating (id 9503 is the Distributing class VUSA despite it
+s slug), IVV→CSPX https://www.ishares.com/uk/individual/en/pro
+ducts/253743/ishares-sp-500-b-ucits-etf-acc-fund, SPYM→SPYL ht
+tps://www.ssga.com/uk/en_gb/intermediary/etfs/state-street-spd
+r-sp-500-ucits-etf-acc-spyl-gy
103 - [ ] **Step 3: Write `scripts/check-data.mjs`** (plain Node,
no deps): loads the JSON, walks every object with `source`/`ch
           ecked`, exits 1 with the path of the first field where `value`
is null/NaN/empty, `source` is not `https://` on the same hos
t as the fund's `issuerUrl` (or `ucits.issuerUrl`), or `checke
           d` is not a valid `YYYY-MM-DD`. Exit 0 and print a one-line ta
ble (ticker, TER, UCITS ticker, checked) otherwise.
104 - [ ] **Step 4: Add scripts** to `package.json`: `"check:data"
           : "node scripts/check-data.mjs"`, `"prebuild": "pnpm check:dat
           a"`.
105 - [ ] **Step 5: Run `pnpm check:data`** → must FAIL naming `fu
           nds[0].exchange.value`.
106 -- [ ] **Step 6: Fill values by hand.** Open each issuer URL, c
-opy TER, fund size (USD, plain number), dividend yield, exchan
-ge, ISIN exactly as shown, set `checked` to today's date. Do n
-ot round beyond what the page shows.
106 +- [ ] **Step 6: Fill values by hand.** Open each issuer URL, c
+opy TER, fund size (USD, plain number), dividend yield (30 Day + SEC Yield for US funds, noted in `note`), exchange, ISIN exac
+tly as shown, set `checked` to today's date. Do not round beyo
+nd what the page shows. Note: investor.vanguard.com blocks hea
+dless browsers, so VOO can only be read in a normal browser.
107 - [ ] **Step 7: Run `pnpm check:data`** → PASS, table printed.
108 - [ ] **Step 8: Commit** `feat: add ETF data with sources and
           check script`
109

⏺ Krok 1 hotový po stránke kódu, čaká na tvoje overenie dát.

Hotové:

- shared/types/etf.ts – typy EtfValue, Etf, UcitsEquivalent.
- scripts/check-data.mjs – padne na chýbajúcu hodnotu, nie-https alebo cudzí
  host v source, chýbajúci dátum, iný počet fondov na stránke než 3. pnpm
  check:data, beží aj v prebuild. Overené: pnpm build teraz padne pred štartom
  Nuxtu.
- data/etfs.json – 4 fondy + UCITS, predvyplnené z HTML stránok emitentov
  (stiahnuté dnes). checked všade null, kým to neoveríš ty.
- PLAN.md: doplnený assignment (deadline 16. 10., „nesmie vyzerať ako default
  Claude“), URL fix pre SPYM/VUAA.

Čo som prečítal zo stránok (over v prehliadači, potom nastav checked):

┌──────┬────────┬───────────┬────────────┬───────┬──────────────┬──────────┐
│ Fond │ TER % │ AUM USD │ 30d SEC │ UCITS │ ISIN │ UCITS │
│ │ │ │ yield % │ │ │ TER % │
├──────┼────────┼───────────┼────────────┼───────┼──────────────┼──────────┤
│ SPY │ 0.0945 │ 823 230 │ 0.94 │ SPY5 │ IE00B6YX5C33 │ 0.03 │
│ │ │ 730 000 │ │ │ │ │
├──────┼────────┼───────────┼────────────┼───────┼──────────────┼──────────┤
│ VOO │ – │ – │ – │ VUAA │ IE00BFMXXD54 │ 0.07 │
├──────┼────────┼───────────┼────────────┼───────┼──────────────┼──────────┤
│ IVV │ 0.03 │ 896 463 │ 0.95 │ CSPX │ IE00B5BMR087 │ 0.07 │
│ │ │ 527 326 │ │ │ │ │
├──────┼────────┼───────────┼────────────┼───────┼──────────────┼──────────┤
│ SPYM │ 0.02 │ 185 171 │ 1.02 │ SPYL │ IE000XZSV718 │ 0.03 │
│ │ │ 570 000 │ │ │ │ │
└──────┴────────┴───────────┴────────────┴───────┴──────────────┴──────────┘

Tri veci na teba:

1. SPLG už neexistuje pod tým tickerom. SSGA stránka presmeruje na SPYM,
   listing date Nov 08 2005 sedí na bývalý SPLG. Nechal som SPYM. Súhlasíš?
2. VOO vyplň ručne. investor.vanguard.com blokuje headless prehliadač (prázdny
   body aj v Playwrighte). Potrebuješ: expense ratio, total net assets, 30
   day SEC yield, exchange.
3. Over zvyšok a nastav checked: "2026-10-14" pri každej hodnote, ktorú si
   videl. Potom pnpm check:data → tabuľka.

Yield som zjednotil na 30 Day SEC Yield (SSGA aj iShares ho ukazujú; iShares
12m trailing je v note). Ak chceš radšej 12m trailing, povedz.

Po tvojom overení commit feat: add ETF data with sources and check script.
PLAN.md a assignment.md navrhujem commitnuť samostatne ako docs:
implementation plan pred ním. Mám?

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/data/etfs.json in the IDE. This may or may
not be related to the current task.</ide_opened_file>

❯ check-data.mjs rejects funds[1].exchange.source because the host is
www.nyse.com, not the issuer host. Vanguard's page does not state the
exchange, so I verified it on https://www.nyse.com/quote/ARCX:VOO.
Allow www.nyse.com as a source host for the "exchange" field only;
keep the issuer-host rule for every other field. Do not change
data/etfs.json.

⏺ Jednoriadková úprava v check scripte: pre exchange povolím aj nyse.com.

⏺ Bash(python3 - <<'EOF'
p='scripts/check-data.mjs'; s=open(p).read()…)
⎿  Updated scripts/check-data.mjs (+8 -5)
10 const data = JSON.parse(readFileSync(file, 'utf8'))
11
12 const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
      13 +// The exchange may be verified on the exchange's own site when
         + the issuer page does not state it.
      14 +const EXTRA_HOSTS = { exchange: ['nyse.com'] }
      15  const errors = []
      16
      17  function host(url) {
     ...
      22    }
      23  }
      24
      23 -function checkValue(path, v, issuerUrl) {
      25 +function checkValue(path, v, issuerUrl, field) {
      26    if (v === null || typeof v !== 'object') return errors.push(`
          ${path}: not an object`)
      27 +  const allowedHosts = [host(issuerUrl), ...(EXTRA_HOSTS[field]
         + ?? [])]
      28    if (v.value === null || v.value === undefined || v.value ===
          '' || (typeof v.value === 'number' && !Number.isFinite(v.value)
          ))
      29      errors.push(`${path}.value: missing`)
      30    if (typeof v.source !== 'string' || !v.source.startsWith('htt
          ps://'))
      31      errors.push(`${path}.source: must be an https URL`)
      29 -  else if (host(v.source) !== host(issuerUrl))
      30 -    errors.push(`${path}.source: host ${host(v.source)} is not
         -the issuer host ${host(issuerUrl)}`)
      32 +  else if (!allowedHosts.includes(host(v.source)))
      33 +    errors.push(`${path}.source: host ${host(v.source)} is not
         +one of ${allowedHosts.join(', ')}`)
      34    if (typeof v.checked !== 'string' || !ISO_DATE.test(v.checked
          ) || Number.isNaN(Date.parse(v.checked)))
      35      errors.push(`${path}.checked: missing or not YYYY-MM-DD`)
      36  }
     ...
      48    for (const k of ['ticker', 'name', 'issuer', 'issuerUrl'])
      49      if (typeof f[k] !== 'string' || !f[k]) errors.push(`${p}.${
k}: missing`)
      50    if (typeof f.showOnPage !== 'boolean') errors.push(`${p}.show
          OnPage: must be boolean`)
      48 -  for (const k of FUND_VALUES) checkValue(`${p}.${k}`, f[k], f.
         -issuerUrl)
      51 +  for (const k of FUND_VALUES) checkValue(`${p}.${k}`, f[k], f.
         +issuerUrl, k)
      52    if (!f.ucits || typeof f.ucits !== 'object') {
      53      errors.push(`${p}.ucits: missing`)
      54    } else {
      55      for (const k of ['ticker', 'name', 'issuerUrl'])
      56        if (typeof f.ucits[k] !== 'string' || !f.ucits[k]) errors
          .push(`${p}.ucits.${k}: missing`)
      54 -    for (const k of UCITS_VALUES) checkValue(`${p}.ucits.${k}`,
         - f.ucits[k], f.ucits.issuerUrl)
      57 +    for (const k of UCITS_VALUES) checkValue(`${p}.ucits.${k}`, + f.ucits[k], f.ucits.issuerUrl, k)
58 }
59 })
… 1 more lines (ctrl+o to expand)

⏺ Hotové. nyse.com prejde len pri poli exchange, ostatné polia stále len host
emitenta. Chyba na funds[1].exchange.source zmizla.

Ostáva 8 problémov, všetky ucits.\*.checked: null pri všetkých 4 fondoch. US
hodnoty máš overené, UCITS (ISIN + TER) ešte nie. Keď ich doplníš, pnpm
check:data vypíše tabuľku a krok 1 je na commit.

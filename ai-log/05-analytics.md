❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/ai-log/02-data.md in the IDE. This may or
may not be related to the current task.</ide_opened_file>

❯ Do step 2 from PLAN.md: the fee calculator. Inputs: monthly amount
(slider 500–20 000 CZK, step 500) and years (5/10/20/30). Assume 7 %
yearly return before fees, show this assumption next to the result.
Result hidden until the first input change. For the 3 funds with
showOnPage: true, compute end value after TER and the difference
between cheapest and most expensive, in CZK. Put the calculation in a
pure function in shared/ with unit tests so I can check it against a
spreadsheet. No design yet, plain HTML.
⎿  UserPromptSubmit says: remember: your previous session was not captured. If
you just installed or enabled the plugin, that is expected -- capture
starts now. Otherwise its hooks were not registered for that session; run
/remember:doctor.

Listed 1 directory, ran 2 shell commands (ctrl+o to expand)

⏺ Bash(find app -type f && pnpm add -D vitest 2>&1 | tail -5)
⎿  Updated package.json (+3 -0)
20 "ignoredBuiltDependencies": [
21 "esbuild"
22 ]
23 + },
24 + "devDependencies": {
25 + "vitest": "^5.0.4"
26 }
27 }
⎿  Updated pnpm-lock.yaml (+133 -0)
17 vue-router:
18 specifier: ^5.4.0
19 version: 5.4.0(@vue/compiler-sfc@3.5.44)(esbuild@0.28.2
)(rolldown@1.2.13)(rollup@4.64.6)(vite@8.3.4(esbuild@0.28.2)(ji
ti@2.7.0)(terser@5.51.2))(vue@3.5.44)
20 + devDependencies:
21 + vitest:
22 + specifier: ^5.0.4
23 + version: 5.0.4(vite@8.3.4(esbuild@0.28.2)(jiti@2.7.0)(t
+erser@5.51.2))
24
25 packages:
26
...
861 '@speed-highlight/core@1.2.24':
862 resolution: {integrity: sha512-qeW2e1l78afw8VhRPfPQ1Gjj+KU
5XFQ/OFV5ti6eTa9bruO7mJyZtA4vw0ofqmA3tKCkROE9xLk3VZoeRc98nw==}
863
864 + '@types/chai@5.2.3':
865 + resolution: {integrity: sha512-Mw558oeA9fFbv65/y4mHtXDs9bP
+nFMZAL/jxdPFUpOHHIXX91mcgEHbS5Lahr+pwZFR8A7GQleRWeI6cGFC2UA==}
866 +
867 + '@types/deep-eql@4.0.2':
868 + resolution: {integrity: sha512-c9h9dVVMigMPc4bwTvC5dxqtqJZ
+wQPePsWjPlpSOnojbor6pGqdk541lfA7AqFQr5pB1BRdq0juY9db81BwyFw==}
869 +
870 '@types/estree@1.0.9':
871 resolution: {integrity: sha512-GhdPgy1el4/ImP05X05Uw4cw2/M
93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==}
872
...
934 vite: ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0
935 vue: ^3.2.25 || ^3.6.0-rc.10
936
937 + '@vitest/mocker@5.0.4':
938 + resolution: {integrity: sha512-tqAlrYWce4iUxhr3ncNohejtCTO
+cHeE8XWrSNZY3OhPoDn01yeGv+gnaBy64ATp7o6pb03eIbBAjzmibpc9vIQ==}
939 + peerDependencies:
940 + msw: ^2.4.9 || ^3.0.0
941 + vite: ^6.0.0 || ^7.0.0 || ^8.0.0
942 + peerDependenciesMeta:
943 + msw:
944 + optional: true
945 + vite:
946 + optional: true
947 +
948 + '@vitest/spy@5.0.4':
949 + resolution: {integrity: sha512-MZKk/gSkm2q+ICobMxCpH1mA+cC
+AWm8WV7UhxlqGjq/sJ3AGc1BqFOs5CRVXxH78wQtme9q/NAAgBquj4AcyMw==}
950 +
951 '@vue-macros/common@3.1.4':
… 195 more lines (ctrl+o to expand)

⏺ Writing tests first.

⏺ Bash(mkdir -p shared/utils shared/content && cat > vitest.config.ts <<'EOF'
import { defineConfig } from 'vitest/config'…)
⎿  Updated package.json (+2 -1)
9 "preview": "nuxt preview",
10 "postinstall": "nuxt prepare",
11 "check:data": "node scripts/check-data.mjs",
12 - "prebuild": "pnpm check:data"
12 + "prebuild": "pnpm check:data",
13 + "test": "vitest run"
14 },
15 "dependencies": {
16 "nuxt": "^4.6.1",
⎿  Created shared/utils/feeCalc.test.ts (+107 -0)
1 +import { describe, expect, test } from 'vitest'
2 +import type { Etf } from '../types/etf'
3 +import { CALC*ASSUMPTIONS, MONTHLY, YEARS, compareFunds, endVa
+lue, formatCzk } from './feeCalc'
4 +
5 +/\*\* Minimal Etf with only the fields the calculator reads. */
6 +function fund(ticker: string, terPct: number): Etf {
7 + const v = <T>(value: T) => ({ value, source: 'https://exampl
+e.com', checked: '2026-10-14' })
8 + return {
9 + ticker,
10 + name: ticker,
11 + issuer: 'x',
12 + issuerUrl: 'https://example.com',
13 + showOnPage: true,
14 + exchange: v('NYSE Arca'),
15 + terPct: v(terPct),
16 + aumUsd: v(1),
17 + dividendYieldPct: v(1),
18 + ucits: { ticker: 'U', name: 'U', issuerUrl: 'https://examp
+le.com', isin: v('IE0'), terPct: v(0.1) },
19 + }
20 +}
21 +
22 +describe('endValue', () => {
23 + test('return 0 and TER 0 → sum of deposits', () => {
24 + expect(endValue({ monthly: 3000, years: 20, annualReturnPc
+t: 0, terPct: 0 })).toBe(3000 \_ 20 \* 12)
25 + })
26 +
27 + test('0 years → 0', () => {
28 + expect(endValue({ monthly: 3000, years: 0, annualReturnPct
+: 7, terPct: 0.03 })).toBe(0)
29 + })
30 +
31 + test('higher TER → strictly lower end value', () => {
32 + const base = { monthly: 3000, years: 20, annualReturnPct:
+7 }
33 + expect(endValue({ ...base, terPct: 0.0945 })).toBeLessThan
+(endValue({ ...base, terPct: 0.03 }))
34 + expect(endValue({ ...base, terPct: 0.03 })).toBeLessThan(e
+ndValue({ ...base, terPct: 0.02 }))
35 + })
36 +
37 + test('equals month-by-month simulation (deposit at month end
+, net rate compounded monthly)', () => {
38 + const monthly = 3000
39 + const years = 20
40 + const i = (1 + (7 - 0.0945) / 100) ** (1 / 12) - 1
… 67 more lines (ctrl+o to expand)
⎿  Created vitest.config.ts (+8 -0)
1 +import { defineConfig } from 'vitest/config'
2 +
3 +export default defineConfig({
4 + test: {
5 + environment: 'node',
6 + include: ['shared/**/_.test.ts', 'server/\*\*/_.test.ts'],
7 + },
8 +})

⏺ Fails as expected (module missing). Check what Intl emits for cs-CZ
separators:

Ran 1 shell command (ctrl+o to expand)

⏺ Write(shared/utils/feeCalc.ts)
⎿  Wrote 75 lines to shared/utils/feeCalc.ts
1 import type { Etf } from '../types/etf'
2
3 /\*_
5 _ 7 % is the assumed yearly return of the S&P 500 before fees (
owner decision, README §11).
6 \*/
7 export const CALC_ASSUMPTIONS = { annualReturnPct: 7 } as const
9 export const MONTHLY = { min: 500, max: 20000, step: 500, initia
l: 3000 } as const
10 export const YEARS = [5, 10, 20, 30] as const
… +78 lines (ctrl+o to expand)

Ran 1 shell command (ctrl+o to expand)

⏺ Tests green (16 + 1 todo for your spreadsheet row). Now the UI.

⏺ Bash(mkdir -p app/pages app/components app/composables && cat >
shared/content/cs.ts <<'EOF'
/** All visible Czech text. Shared so the server e-mail uses the same st…)
⎿  Updated app/app.vue (+1 -1)
1 <template>
2 <div>
3 <NuxtRouteAnnouncer />
4 - <NuxtWelcome />
4 + <NuxtPage />
5 </div>
6 </template>
⎿  Created app/components/CalcResult.vue (+23 -0)
1 +<script setup lang="ts">
2 +import { cs } from '#shared/content/cs'
3 +import { CALC_ASSUMPTIONS, formatCzk } from '#shared/utils/feeC
+alc'
4 +
5 +const { result, years } = useCalculator()
6 +const ter = (pct: number) => pct.toLocaleString('cs-CZ', { maxi
+mumFractionDigits: 4 })
7 +</script>
8 +
9 +<template>
10 + <div v-if="result" aria-live="polite">
11 + <h3>{{ cs.calc.resultHeading(years) }}</h3>
12 + <ul>
13 + <li v-for="row in result.rows" :key="row.ticker">
14 + <strong>{{ row.ticker }}</strong>: {{ formatCzk(row.end
         +Value) }}
15 + <small>({{ cs.calc.terLabel(ter(row.terPct)) }})</small
+>
16 + </li>
17 + </ul>
18 + <p>
19 + {{ cs.calc.feeGap(formatCzk(result.feeGap), result.rows[0
         +]!.ticker, result.rows.at(-1)!.ticker) }}
20 + </p>
21 + <p><small>{{ cs.calc.assumption(CALC_ASSUMPTIONS.annualRetu
         +rnPct) }}</small></p>
22 + </div>
23 +</template>
⎿  Created app/components/Calculator.vue (+34 -0)
1 +<script setup lang="ts">
2 +import { cs } from '#shared/content/cs'
3 +import { MONTHLY, YEARS, formatCzk } from '#shared/utils/feeCal
+c'
4 +
5 +const { monthly, years, touched } = useCalculator()
6 +</script>
7 +
8 +<template>
9 + <section>
10 + <h2>{{ cs.calc.heading }}</h2>
11 +
12 + <label for="calc-monthly">{{ cs.calc.monthlyLabel }}</label
+>
13 + <input
14 + id="calc-monthly"
15 + v-model.number="monthly"
16 + type="range"
17 + :min="MONTHLY.min"
18 + :max="MONTHLY.max"
19 + :step="MONTHLY.step"
20 + @input="touched = true"
21 + >
22 + <output for="calc-monthly">{{ formatCzk(monthly) }}</output
+>
23 +
24 + <fieldset>
25 + <legend>{{ cs.calc.yearsLabel }}</legend>
26 + <label v-for="y in YEARS" :key="y">
27 + <input v-model="years" type="radio" name="calc-years" :
+value="y" @change="touched = true">
28 + {{ cs.calc.yearsOption(y) }}
29 + </label>
30 + </fieldset>
31 +
32 + <CalcResult />
33 + </section>
34 +</template>
⎿  Created app/composables/useCalculator.ts (+16 -0)
1 +import { MONTHLY, YEARS_INITIAL, compareFunds, type Years } fro
+m '#shared/utils/feeCalc'
2 +
3 +/**
4 + _ Calculator state, shared across components (the lead form re
+ads monthly/years).
5 + _ `result` stays null until the user changes an input for the
+first time.
6 + \*/
7 +export function useCalculator() {
8 + const monthly = useState<number>('calc-monthly', () => MONTHL
+Y.initial)
9 + const years = useState<Years>('calc-years', () => YEARS_INITI
+AL)
10 + const touched = useState<boolean>('calc-touched', () => false
+)
11 + const { pageFunds } = useEtfs()
12 +
13 + const result = computed(() => (touched.value ? compareFunds(m
+onthly.value, years.value, pageFunds) : null))
14 +
15 + return { monthly, years, touched, result }
16 +}
⎿  Created app/composables/useEtfs.ts (+13 -0)
1 +import type { EtfData } from '#shared/types/etf'
2 +import data from '~~/data/etfs.json'
3 +
4 +const funds = (data as EtfData).funds
5 +
6 +export function useEtfs() {
7 + const checkedDates = funds.flatMap(f => [f.exchange, f.terPct
+, f.aumUsd, f.dividendYieldPct, f.ucits.isin, f.ucits.terPct].m
+ap(v => v.checked))
8 + return {
9 + allFunds: funds,
10 + pageFunds: funds.filter(f => f.showOnPage),
11 + dataCheckedDate: checkedDates.sort().at(-1)!,
12 + }
13 +}
⎿  … 2 more files changed

⏺ Bash(python3 - <<'EOF'
p='app/components/CalcResult.vue'…)
⎿  Updated app/components/CalcResult.vue (+3 -1)
4
5 const { result, years } = useCalculator()
6 const ter = (pct: number) => pct.toLocaleString('cs-CZ', { maxi
mumFractionDigits: 4 })
7 +// VOO and IVV share a TER, so "cheapest" can be more than one
+fund.
8 +const tickersAt = (value: number) => result.value!.rows.filter(
+r => r.endValue === value).map(r => r.ticker).join(', ')
9 </script>
10
11 <template>
...
18 </li>
19 </ul>
20 <p>
19 - {{ cs.calc.feeGap(formatCzk(result.feeGap), result.rows[0
         -]!.ticker, result.rows.at(-1)!.ticker) }}
21 + {{ cs.calc.feeGap(formatCzk(result.feeGap), tickersAt(res
         +ult.rows[0]!.endValue), tickersAt(result.rows.at(-1)!.endValue)
         +) }}
22 </p>
23 <p><small>{{ cs.calc.assumption(CALC_ASSUMPTIONS.annualRetu
          rnPct) }}</small></p>
24 </div>
⎿  Updated package.json (+3 -1)
23 ]
24 },
25 "devDependencies": {
26 - "vitest": "^5.0.4"
26 + "typescript": "^7.0.2",
27 + "vitest": "^5.0.4",
28 + "vue-tsc": "^3.3.13"
29 }
30 }
⎿  … 1 more file changed

⏺ TypeScript 7 (Go port) incompatible with vue-tsc. Pin TS 5.

⏺ Bash(pnpm add -D typescript@^5 2>&1 | tail -2 && npx nuxi typecheck 2>&1 |
tail -15; echo EXIT $?)
⎿  Updated package.json (+1 -1)
23 ]
24 },
25 "devDependencies": {
26 - "typescript": "^7.0.2",
26 + "typescript": "^5.9.3",
27 "vitest": "^5.0.4",
28 "vue-tsc": "^3.3.13"
29 }
⎿  … 1 more file changed

Ran 1 shell command (ctrl+o to expand)

⏺ Bash(sed -i '' 's/YEARS\[YEARS.length - 1\]/YEARS[3]/'
shared/utils/feeCalc.test.ts && npx nuxi typecheck 2>&1 | tail -5; pnpm
test 2>&1 | grep -E "Tests|failed")
⎿  Updated shared/utils/feeCalc.test.ts (+2 -2)
50
51 test.each([
52 [MONTHLY.min, YEARS[0]],
53 - [MONTHLY.min, YEARS[YEARS.length - 1]],
53 + [MONTHLY.min, YEARS[3]],
54 [MONTHLY.max, YEARS[0]],
55 - [MONTHLY.max, YEARS[YEARS.length - 1]],
55 + [MONTHLY.max, YEARS[3]],
56 ])('bounds: %i CZK / %i years → finite and > 0', (monthly, ye
ars) => {
57 const v = endValue({ monthly, years, annualReturnPct: CALC\_
ASSUMPTIONS.annualReturnPct, terPct: 0.0945 })
58 expect(Number.isFinite(v)).toBe(true)

⏺ Typecheck clean. Now run in browser.

Ran 2 shell commands (ctrl+o to expand)

⏺ Page serves. Driving it in a browser to check hidden-until-input and bounds.

Called plugin:playwright:playwright 2 times (ctrl+o to expand)

⏺ Works: hidden on load, appears after first input, bounds fine. Checking
console and cross-checking one number outside the code:

Ran 1 shell command (ctrl+o to expand)

⏺ Step 2 is built and working, but not committed yet, because you want to check
the numbers against your spreadsheet first. pnpm test passes (16 tests, plus 1
placeholder for your spreadsheet row) and the typecheck is clean.

One thing to decide: PLAN.md said you would write the body of endValue
yourself and choose how fees are applied. You asked me to do the calculation,
so I wrote it as below. Replace it if you meant a different method.

Formula (shared/utils/feeCalc.ts):

- The fee (TER) is subtracted from the return: 7 % − TER.
- That yearly rate is turned into a monthly rate, so 12 months compound to
  exactly the yearly rate.
- The deposit goes in at the end of each month. No taxes, broker fees or
  currency conversion.
- Spreadsheet version, so you can check it directly:
  =FV((1+(7-TER)/100)^(1/12)-1; years\*12; -monthly)

Results in the browser:

┌──────────────────────┬────────────────────┬────────────────┬────────────┐
│ Input │ VOO / IVV (0.03 %) │ SPY (0.0945 %) │ Difference │
├──────────────────────┼────────────────────┼────────────────┼────────────┤
│ 3 000 Kč / 20 years │ 1 517 433 Kč │ 1 506 372 Kč │ 11 061 Kč │
├──────────────────────┼────────────────────┼────────────────┼────────────┤
│ 500 Kč / 30 years │ 581 504 Kč │ 574 643 Kč │ 6 861 Kč │
├──────────────────────┼────────────────────┼────────────────┼────────────┤
│ 20 000 Kč / 30 years │ 23 260 161 Kč │ 22 985 704 Kč │ 274 457 Kč │
└──────────────────────┴────────────────────┴────────────────┴────────────┘

I also got 1 517 433 Kč for the first row with a separate month-by-month
calculation outside the app. The result stays hidden until you move the slider
or pick a number of years. The 7 % assumption is shown under the result. No
NaN at either end of the slider.

What I added:

- feeCalc.ts (shared/utils/feeCalc.ts) and feeCalc.test.ts
  (shared/utils/feeCalc.test.ts): the calculation and its tests.
- cs.ts (shared/content/cs.ts): the Czech text for the calculator.
- useEtfs and useCalculator in app/composables/: the fund data and calculator
  state. The state is shared so the e-mail form in step 3 can read the amount
  and years.
- Calculator.vue (app/components/Calculator.vue), CalcResult.vue
  (app/components/CalcResult.vue) and index.vue (app/pages/index.vue): the
  plain HTML page. app.vue now shows the page instead of the Nuxt welcome
  screen.
- vitest, typescript@^5 and vue-tsc as dev dependencies, plus "test": "vitest
  run" in package.json. TypeScript is held at version 5 because vue-tsc does
  not work with TypeScript 7 (it fails with ERR_PACKAGE_PATH_NOT_EXPORTED).

VOO and IVV have the same fee, so the difference sentence names both as
cheapest: "nejlevnějším (VOO, IVV)". I also added a "feesPaid" figure per fund
(what fees cost against a 0 % fee). The page doesn't show it yet; it's there
for the e-mail.

For you:

1. Replace test.todo('matches owner spreadsheet row 1') in the test file with
   a value from your spreadsheet.
2. Read the Czech text in cs.ts.
3. Tell me when to commit (feat: fee calculator with pure calc and tests).

README §11 still says "TODO %" for the return; it should say 7 %.

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/shared/utils/feeCalc.ts in the IDE. This may
or may not be related to the current task.</ide_opened_file>

❯ Commit step 2 as "feat: fee calculator with pure calc and tests".
Then step 3: e-mail form + lead storage. One field (e-mail), consent
text under the button, upsert on duplicate e-mail, store amount, years
and ad version from the calculator state. Supabase table leads.
Add .env.example. Thank-you screen comes in step 7, for now just show
"Děkujeme" inline.

Ran 1 shell command (ctrl+o to expand)

⏺ Committed 6d1a6a1. Now step 3, starting with deps and failing tests.

⏺ Bash(pnpm add zod @supabase/supabase-js 2>&1 | grep -E "^\+|ERR"; mkdir -p
server/api server/utils supabase) ⎿  Updated package.json (+3 -1)
13 "test": "vitest run"
14 },
15 "dependencies": {
16 + "@supabase/supabase-js": "^2.117.3",
17 "nuxt": "^4.6.1",
18 "vue": "^3.5.43",
18 - "vue-router": "^5.4.0"
19 + "vue-router": "^5.4.0",
20 + "zod": "^4.6.7"
21 },
22 "pnpm": {
23 "ignoredBuiltDependencies": [
⎿  Updated pnpm-lock.yaml (+86 -0)
8
9 .:
10 dependencies:
11 + '@supabase/supabase-js':
12 + specifier: ^2.117.3
13 + version: 2.117.3
14 nuxt:
15 specifier: ^4.6.1
16 version: 4.6.1(@babel/plugin-syntax-jsx@7.29.7(@babel/c
ore@7.29.7))(@babel/plugin-syntax-typescript@7.29.7(@babel/core
@7.29.7))(@oxc-project/types@0.153.0)(@vue/compiler-sfc@3.5.44)
(acorn@8.19.0)(confbox@0.3.1)(db0@0.3.4)(dotenv@17.4.2)(esbuild
@0.28.2)(giget@3.3.1)(ioredis@5.11.1)(lightningcss@1.33.0)(mlly
@1.8.2)(rolldown@1.2.13)(rollup-plugin-visualizer@7.1.1(rolldow
n@1.2.13)(rollup@4.64.6))(rollup@4.64.6)(srvx@1.0.5)(terser@5.5
1.2)(typescript@5.9.3)(vite@8.3.4(esbuild@0.28.2)(jiti@2.7.0)(t
erser@5.51.2))(vue-tsc@3.3.13(typescript@5.9.3))
...
20 vue-router:
21 specifier: ^5.4.0
22 version: 5.4.0(@vue/compiler-sfc@3.5.44)(esbuild@0.28.2
)(rolldown@1.2.13)(rollup@4.64.6)(vite@8.3.4(esbuild@0.28.2)(ji
ti@2.7.0)(terser@5.51.2))(vue@3.5.44(typescript@5.9.3))
23 + zod:
24 + specifier: ^4.6.7
25 + version: 4.6.7
26 devDependencies:
27 typescript:
28 specifier: ^5.9.3
...
873 '@speed-highlight/core@1.2.24':
874 resolution: {integrity: sha512-qeW2e1l78afw8VhRPfPQ1Gjj+KU
5XFQ/OFV5ti6eTa9bruO7mJyZtA4vw0ofqmA3tKCkROE9xLk3VZoeRc98nw==}
875
876 + '@supabase/auth-js@2.117.3':
877 + resolution: {integrity: sha512-XOZV+jllcU2Hzij8SwgM78zl0lO
+Er6BTjzi2MYkBb39nOAQzb5AelGpMUvVj7lwGSB11JmpAs/FEQroAyFzWEA==}
878 + engines: {node: '>=22.0.0'}
879 +
880 + '@supabase/functions-js@2.117.3':
881 + resolution: {integrity: sha512-6GuizbP4N5xWaxEVUsI+UQpJdmM
+mn0t3sYNpObo9gCAldvM22gFjnYzRVmkHxp5ylU21azEYmiWVwk9iDgCMkQ==}
882 + engines: {node: '>=22.0.0'}
883 +
884 + '@supabase/phoenix@0.4.5':
885 + resolution: {integrity: sha512-aAn9H9ovVyeApKy11OWOrrOGq8D
+V68yWeH4ud2lN9fzn4aO8Zb5GLL9m1pUg9nLqIcT+ZDfAcsZe0E/nqdv2lw==}
886 +
887 + '@supabase/postgrest-js@2.117.3':
888 + resolution: {integrity: sha512-NpyTgullu6tw11ojYKTdZg9Hann
+Z4mu4FUlhc9V5zDXOVllUJzEmuyLM+WWoYF0BurfrRvarimpm3SR8P0Gzfw==}
889 + engines: {node: '>=22.0.0'}
890 +
891 + '@supabase/realtime-js@2.117.3':
892 + resolution: {integrity: sha512-4W4ISbreRygNXbhwqxeqyuRul8R
+Px+SF+Hp2IT8wctebQEHSVCULfKatiRiEhmasfoXvYm2AHV4XFsOxhoousA==}
893 + engines: {node: '>=22.0.0'}
894 +
… 103 more lines (ctrl+o to expand)

⏺ Bash(cat > server/utils/lead.test.ts <<'EOF'
import { describe, expect, test } from 'vitest'…)
⎿  Created server/utils/lead.test.ts (+61 -0)
1 +import { describe, expect, test } from 'vitest'
2 +import { LeadError, parseLead } from './lead'
3 +
4 +const ok = { email: 'jan@example.cz', monthly: 3000, years: 20, + variant: 'a' }
5 +
6 +function code(body: unknown): string | undefined {
7 + try {
8 + parseLead(body)
9 + }
10 + catch (e) {
11 + return e instanceof LeadError ? e.code : 'other'
12 + }
13 +}
14 +
15 +describe('parseLead', () => {
16 + test('valid body passes through', () => {
17 + expect(parseLead(ok)).toEqual(ok)
18 + })
19 +
20 + test('e-mail trimmed and lowercased', () => {
21 + expect(parseLead({ ...ok, email: ' Jan@Example.CZ ' }).emai
+l).toBe('jan@example.cz')
22 + })
23 +
24 + test.each(['foo', '', 'jan@', '@example.cz'])('e-mail %j → in
+valid_email', (email) => {
25 + expect(code({ ...ok, email })).toBe('invalid_email')
26 + })
27 +
28 + test('missing e-mail → invalid_email', () => {
29 + expect(code({ monthly: 3000, years: 20 })).toBe('invalid_em
+ail')
30 + })
31 +
32 + test.each([400, 25000, 3250, '3000', null])('monthly %j → inv
+alid_input', (monthly) => {
33 + expect(code({ ...ok, monthly })).toBe('invalid_input')
34 + })
35 +
36 + test.each([15, 0, '20'])('years %j → invalid_input', (years)
+=> {
37 + expect(code({ ...ok, years })).toBe('invalid_input')
38 + })
39 +
40 + test('bounds 500 / 20 000 and years 5 / 30 accepted', () => {
… 21 more lines (ctrl+o to expand)
⎿  Created shared/utils/variant.test.ts (+14 -0)
1 +import { expect, test } from 'vitest'
2 +import { normalizeVariant } from './variant'
3 +
4 +test.each([
5 + ['b', 'b'],
6 + ['a', 'a'],
7 + ['X', 'a'],
8 + ['B', 'a'],
9 + ['', 'a'],
10 + [undefined, 'a'],
11 + [['b'], 'a'],
12 +])('%j → %s', (q, expected) => {
13 + expect(normalizeVariant(q)).toBe(expected)
14 +})

⏺ Failing as expected. Implementation:

⏺ Bash(cat > shared/utils/variant.ts <<'EOF'
export type Variant = 'a' | 'b'…)
⎿  Created server/utils/lead.ts (+37 -0)
1 +import { z } from 'zod'
2 +import { MONTHLY, YEARS, type Years } from '#shared/utils/feeCa
+lc'
3 +import { normalizeVariant, type Variant } from '#shared/utils/v
+ariant'
4 +
5 +export interface Lead {
6 + email: string
7 + monthly: number
8 + years: Years
9 + variant: Variant
10 +}
11 +
12 +export class LeadError extends Error {
13 + constructor(public code: 'invalid_email' | 'invalid_input') {
14 + super(code)
15 + }
16 +}
17 +
18 +const emailSchema = z.string().trim().toLowerCase().pipe(z.emai
+l())
19 +
20 +const inputSchema = z.object({
21 + monthly: z.number().int().min(MONTHLY.min).max(MONTHLY.max).m
+ultipleOf(MONTHLY.step),
22 + years: z.union(YEARS.map(y => z.literal(y)) as [z.ZodLiteral<
+Years>, ...z.ZodLiteral<Years>[]]),
23 +})
24 +
25 +/** Validates a POST /api/lead body. Throws LeadError. Unknown
+keys (e.g. honeypot `website`) are dropped. \*/
26 +export function parseLead(body: unknown): Lead {
27 + if (typeof body !== 'object' || body === null) throw new Lead
+Error('invalid_input')
28 + const b = body as Record<string, unknown>
29 +
30 + const email = emailSchema.safeParse(b.email)
31 + if (!email.success) throw new LeadError('invalid_email')
32 +
33 + const input = inputSchema.safeParse(b)
34 + if (!input.success) throw new LeadError('invalid_input')
35 +
36 + return { email: email.data, ...input.data, variant: normalize
+Variant(b.variant) }
37 +}
⎿  Created shared/utils/variant.ts (+6 -0)
1 +export type Variant = 'a' | 'b'
2 +
3 +/** Ad version from `?v=`. Only the exact string 'b' gives 'b';
+anything else (missing, 'X', array) is 'a'. \*/
4 +export function normalizeVariant(q: unknown): Variant {
5 + return q === 'b' ? 'b' : 'a'
6 +}

⏺ #shared alias unknown to Vitest. Add it to the config:

⏺ Bash(cat > vitest.config.ts <<'EOF'
import { fileURLToPath } from 'node:url'…)
⎿  Updated vitest.config.ts (+4 -0)
1 +import { fileURLToPath } from 'node:url'
2 import { defineConfig } from 'vitest/config'
3
4 export default defineConfig({
5 + resolve: {
6 + alias: { '#shared': fileURLToPath(new URL('./shared', impor
+t.meta.url)) },
7 + },
8 test: {
9 environment: 'node',
10 include: ['shared/**/*.test.ts', 'server/**/*.test.ts'],

⏺ All green. Now server route, Supabase, SQL, env:

⏺ Bash(cat > supabase/leads.sql <<'EOF'
-- Run once in the Supabase SQL editor.…)
⎿  Created .env.example (+11 -0)
1 +# Supabase (server only). Project Settings → API. Use the secre
+t / service*role key, never expose it to the client.
2 +NUXT_SUPABASE_URL=
3 +NUXT_SUPABASE_SERVICE_KEY=
4 +
5 +# PostHog (Task 4)
6 +NUXT_PUBLIC_POSTHOG_KEY=
7 +NUXT_PUBLIC_POSTHOG_HOST=
8 +
9 +# Resend (Task 5)
10 +RESEND_API_KEY=
11 +MAIL_FROM=
⎿  Updated nuxt.config.ts (+6 -1)
1 // https://nuxt.com/docs/api/configuration/nuxt-config
2 export default defineNuxtConfig({
3 compatibilityDate: '2025-07-15',
4 - devtools: { enabled: true }
4 + devtools: { enabled: true },
5 + runtimeConfig: {
6 + // Server only. Set via NUXT_SUPABASE_URL / NUXT_SUPABASE_S
+ERVICE_KEY.
7 + supabaseUrl: '',
8 + supabaseServiceKey: '',
9 + },
10 })
⎿  Created server/api/lead.post.ts (+34 -0)
1 +import { LeadError, parseLead } from '../utils/lead'
2 +import { upsertLead } from '../utils/supabase'
3 +
4 +export default defineEventHandler(async (event) => {
5 + const body = await readBody(event).catch(() => null)
6 +
7 + // Honeypot: bots fill the hidden `website` field. Pretend su
+ccess, store nothing.
8 + if (body && typeof body === 'object' && 'website' in body &&
+body.website) {
9 + setResponseStatus(event, 201)
10 + return { ok: true, emailed: false }
11 + }
12 +
13 + let lead
14 + try {
15 + lead = parseLead(body)
16 + }
17 + catch (e) {
18 + setResponseStatus(event, 400)
19 + return { ok: false, error: e instanceof LeadError ? e.code
+: 'invalid_input' }
20 + }
21 +
22 + try {
23 + await upsertLead(lead)
24 + }
25 + catch (e) {
26 + // Lead not saved: tell the client so the user can retry in
+stead of a false "thank you".
27 + console.error('[lead] storage failed:', e instanceof Error
+? e.message : e)
28 + setResponseStatus(event, 500)
29 + return { ok: false, error: 'storage' }
30 + }
31 +
32 + setResponseStatus(event, 201)
33 + return { ok: true, emailed: false }
34 +})
⎿  Created server/utils/supabase.ts (+20 -0)
1 +import { createClient, type SupabaseClient } from '@supabase/su
+pabase-js'
2 +import type { Lead } from './lead'
3 +
4 +let client: SupabaseClient | undefined
5 +
6 +function supabase(): SupabaseClient {
7 + if (client) return client
8 + const { supabaseUrl, supabaseServiceKey } = useRuntimeConfig(
+)
9 + if (!supabaseUrl || !supabaseServiceKey) throw new Error('Sup
+abase env vars missing')
10 + client = createClient(supabaseUrl, supabaseServiceKey, { auth
+: { persistSession: false } })
11 + return client
12 +}
13 +
14 +/\** Insert, or update monthly/years/variant when the e-mail alr
+eady exists. created*at stays from the first submit. */
15 +export async function upsertLead(lead: Lead): Promise<void> {
16 + const { error } = await supabase()
17 + .from('leads')
18 + .upsert({ ...lead, updated_at: new Date().toISOString() },
+{ onConflict: 'email' })
19 + if (error) throw new Error(`Supabase upsert failed: ${error.m
         +essage}`)
20 +}
⎿  Created supabase/leads.sql (+13 -0)
1 +-- Run once in the Supabase SQL editor.
2 +create table if not exists public.leads (
3 + id uuid primary key default gen_random_uuid(),
4 + email text not null unique,
5 + monthly int not null,
6 + years int not null,
7 + variant text not null,
8 + created_at timestamptz not null default now(),
9 + updated_at timestamptz not null default now()
10 +);
11 +
12 +-- Only the server (secret / service_role key) writes. No polic
+y = anon and authenticated get nothing.
13 +alter table public.leads enable row level security;

⏺ Now the form:

⏺ Bash(python3 - <<'EOF'
p='shared/content/cs.ts'…)
⎿  Created app/components/LeadForm.vue (+67 -0)
1 +<script setup lang="ts">
2 +import { cs } from '#shared/content/cs'
3 +
4 +const props = defineProps<{ placement: 'top' | 'bottom' }>()
5 +const emit = defineEmits<{ submitted: [payload: { emailed: bool
+ean }] }>()
6 +
7 +// monthly/years are sent even if the calculator was never touc
+hed (defaults 3 000 / 20).
8 +const { monthly, years } = useCalculator()
9 +const variant = useVariant()
10 +
11 +type ErrorKey = keyof typeof cs.form.errors
12 +const email = ref('')
13 +const website = ref('') // honeypot
14 +const sending = ref(false)
15 +const error = ref<ErrorKey | null>(null)
16 +const done = ref(false)
17 +
18 +const inputId = `lead-email-${props.placement}`
19 +
20 +async function submit() {
21 + if (sending.value) return
22 + sending.value = true
23 + error.value = null
24 + try {
25 + const res = await $fetch<{ ok: true; emailed: boolean }>('/
+api/lead', {
26 + method: 'POST',
27 + body: { email: email.value, monthly: monthly.value, years
+: years.value, variant, website: website.value },
28 + })
29 + done.value = true
30 + emit('submitted', { emailed: res.emailed })
31 + }
32 + catch (e: any) {
33 + const code = e?.data?.error
34 + error.value = code && code in cs.form.errors ? code : 'netw
+ork'
35 + }
36 + finally {
37 + sending.value = false
38 + }
39 +}
40 +</script>
… 27 more lines (ctrl+o to expand)
⎿  Created app/composables/useVariant.ts (+6 -0)
1 +import { normalizeVariant, type Variant } from '#shared/utils/va
+riant'
2 +
3 +/\*_ Ad version from `?v=`, read during setup so SSR and client a
+gree. _/
4 +export function useVariant(): Variant {
5 + return normalizeVariant(useRoute().query.v)
6 +}
⎿  Updated app/pages/index.vue (+1 -0)
1 <template>
2 <main>
3 <Calculator />
4 + <LeadForm placement="top" />
5 </main>
6 </template>
⎿  Updated shared/content/cs.ts (+16 -0)
12 assumption: (pct: number) =>
13 `Předpoklad: výnos ${pct} % ročně před poplatky, vklad na
           konci každého měsíce. Bez daní a poplatků brokera. Skutečný vý
          nos bude jiný.`,
14 },
15 + form: {
16 + heading: 'Pošleme vám celé srovnání se všemi fondy a vašimi + čísly',
17 + emailLabel: 'Váš e-mail',
18 + emailPlaceholder: 'jan@email.cz',
19 + submit: 'Poslat srovnání',
20 + sending: 'Odesílám…',
21 + consent:
22 + 'Odesláním souhlasíte se zpracováním e-mailu, abychom vám + poslali srovnání. Nic dalšího vám bez souhlasu posílat nebudem
+e a e-mail můžete kdykoli nechat smazat. Nejde o investiční dop
+oručení.',
23 + errors: {
24 + invalid_email: 'Zkontrolujte prosím e-mail, takhle ho neu
+míme použít.',
25 + invalid_input: 'Něco se pokazilo. Zkuste prosím obnovit s
+tránku.',
26 + storage: 'E-mail se nepodařilo uložit. Zkuste to prosím z
+a chvíli znovu.',
27 + network: 'Nepodařilo se spojit se serverem. Zkontrolujte
+připojení a zkuste to znovu.',
28 + },
29 + thanks: 'Děkujeme.',
30 + },
31 } as const

⏺ Typecheck clean. No .env exists locally, so I can test validation, honeypot
and the storage-failure path, but not a real Supabase write.

Ran 1 shell command (ctrl+o to expand)

⏺ All responses as specified. Log line didn't show in the grep; checking:

Read 1 file (ctrl+o to expand)

⏺ Error is logged. But the log says this server handed over to another nuxt dev
(PID 5556). Checking what's running:

Ran 1 shell command (ctrl+o to expand)

⏺ Same server on 3123 (Nuxt restarted itself). Browser check of the form:

Called plugin:playwright:playwright 2 times (ctrl+o to expand)

⏺ Untouched calculator sends 3 000 / 20, ?v=b sends b, errors show in Czech.
Checking console errors and the success path (via honeypot, since it returns
201 without needing Supabase):

Read 1 file, called plugin:playwright:playwright, ran 1 shell command (ctrl+o to expand)

⏺ Step 2 is committed as 6d1a6a1. Step 3 is built but not committed: nothing has
been saved to a real Supabase yet, because there is no .env here. All 46
tests pass and the typecheck is clean.

What works:

- Form: one e-mail field, the consent text under the button, and a hidden
  decoy field that catches bots. After a successful submit it shows
  "Děkujeme." in place of the form.
- What gets sent: amount, years and ad version. If nobody touched the
  calculator it sends 3 000 / 20. ?v=b sends b, anything else sends a. I
  checked this in the browser.
- Validation: the e-mail is trimmed and lowercased, so " Jan@Example.CZ " and
  jan@example.cz count as the same lead. Amounts outside 500–20 000 or not a
  multiple of 500 are rejected, and so are years other than 5/10/20/30.
- Saving: the server route lead.post.ts (server/api/lead.post.ts) inserts the
  lead, or updates it if the e-mail already exists. On an update, monthly,
  years, variant and updated_at change and created_at keeps the first date.

Checked against the running server:

┌───────────────────────────┬─────────────────────────────────────────────┐
│ Request │ Result │
├───────────────────────────┼─────────────────────────────────────────────┤
│ Bot field filled │ 201, nothing saved, "Děkujeme." shown │
├───────────────────────────┼─────────────────────────────────────────────┤
│ E-mail foo │ 400 invalid_email, Czech error shown │
├───────────────────────────┼─────────────────────────────────────────────┤
│ Years 15, or not JSON │ 400 invalid_input │
├───────────────────────────┼─────────────────────────────────────────────┤
│ Valid lead, no Supabase │ 500 storage, Czech "try again" shown, error │
│ set up │ logged │
└───────────────────────────┴─────────────────────────────────────────────┘

Two decisions for you:

1. If Supabase fails, the visitor sees an error and can retry. The server
   returns 500 storage and the page says the e-mail could not be saved.
   PLAN.md left this choice to you; the alternative is to always say thank you
   and only log the failure. I chose the error because a fake "Děkujeme"
   would lose the lead silently. Tell me if you want the other way.
2. The environment variables are named NUXT*SUPABASE_URL and
   NUXT_SUPABASE_SERVICE_KEY, not SUPABASE_URL as in the plan. Nuxt only reads
   variables with the NUXT* prefix at runtime. .env.example uses the new
   names.

To finish step 3:

1. Run supabase/leads.sql in the Supabase SQL editor.
2. Copy .env.example to .env and fill in the URL and the secret key
   (service_role).
3. Run pnpm dev. Submit your address, then submit it again after moving the
   slider. You should still have one row, with the new values.
4. Read the consent text in cs.ts (shared/content/cs.ts). README §11 still has
   a TODO to check it is enough for GDPR.

After that I'll commit it as feat: lead form with Supabase upsert.

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/.env in the IDE. This may or may not be
related to the current task.</ide_opened_file>

❯ I get error
POST
http://localhost:3000/api/lead
Status
500
Internal Server Error
{
"ok": false,
"error": "storage"
}
⎿  2 skills available

⏺ Server logs the real reason. Checking .env variable names (not values) and the
current code:

Ran 1 shell command (ctrl+o to expand)

⏺ Found that NUXT_SUPABASE_URL is set to a Postgres connection string instead of
the project's HTTPS API URL that supabase-js requires. Now checking the key's
role and project ref without exposing any secrets.

Ran 1 shell command (ctrl+o to expand)

⏺ Key is fine (service_role, same project). Only the URL is wrong. Fixing it in
.env to the project's API URL and checking the leads table is reachable (read
only, no write):

Ran 1 shell command (ctrl+o to expand)

⏺ Connection works: the leads table exists and is empty. I'll also make the
server log say plainly when the URL is in the wrong format, so this is obvious
next time:

⏺ Update(server/utils/supabase.ts)
⎿  Added 2 lines
7 if (client) return client
8 const { supabaseUrl, supabaseServiceKey } = useRuntimeConfig(
)
9 if (!supabaseUrl || !supabaseServiceKey) throw new Error('Sup
abase env vars missing')
10 + // Common mistake: pasting the Postgres connection string ins
+tead of the API URL.
11 + if (!supabaseUrl.startsWith('https://')) throw new Error('NUX
+T_SUPABASE_URL must be the API URL https://<ref>.supabase.co')
12 client = createClient(supabaseUrl, supabaseServiceKey, { auth
: { persistSession: false } })
13 return client
14 }

Ran 1 shell command (ctrl+o to expand)
⏺ The error came from .env: NUXT_SUPABASE_URL held the Postgres connection
string (postgresql://…), but the Supabase library needs the project's web
address. I changed it to:

NUXT_SUPABASE_URL=https://bisvkvhrgaqfwtizctsn.supabase.co

The secret key was already right (service_role, same project). With the new
address, a read-only query to leads succeeded: the table exists and has 0
rows.

Replacing that line removed the Postgres connection string from .env, and that
string had the database password in it. The app doesn't use it. You can copy
it again from the Supabase dashboard if you need it.

I also added a check in server/utils/supabase.ts. If the address doesn't start
with https://, the server log now says so instead of a vague failure. Tests
(46) and the typecheck still pass.

Next:

1. Restart pnpm dev so it picks up the new .env.
2. Submit your e-mail, then move the slider and submit the same e-mail again.
   You should get "Děkujeme." both times and still have one row, with the
   second submit's values and a newer updated_at.

If it still returns 500, the terminal running pnpm dev will show a line
starting with [lead] storage failed:. Paste me that line.

[Image #1]

❯ I submit email and then is there Dakujeme and input is gone and after move
slider inpput is not there eather

⏺ This is how I built it: after a successful submit the form is replaced by
"Děkujeme." and does not come back. The plan's thank-you screen (step 7) also
replaces the form, so I left it. Checking that your submit reached the
database:

Ran 1 shell command (ctrl+o to expand)

⏺ Your submit worked. The leads table has one row: 3 000 Kč, 10 years, version
a. The screenshot shows 6 000 Kč because you moved the slider after
submitting, so the row still has the earlier amount.

To test a repeat submit of the same e-mail:

1. Reload the page.
2. Move the slider to another amount, e.g. 6 000 Kč.
3. Submit the same e-mail.

There should still be one row, with the new amount and a newer updated_at.
Tell me when you've done it and I'll check the row, then commit step 3.

If you'd rather people could change the slider after submitting and send
updated numbers, I can bring the form back when the amount or years change.
That would differ from the plan, where the thank-you screen replaces the form
for good.

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/ai-log/04-lead-form.md in the IDE. This may
or may not be related to the current task.</ide_opened_file>

❯ Step 4: analytics with PostHog (posthog-js, EU host). Events exactly as
in README section 8: page_view (with variant), calc_change (first input
change only), calc_result, form_focus, form_submit, thankyou_view.
Read the project key from NUXT_PUBLIC_POSTHOG_KEY. No cookie banner:
disable persistence beyond memory/sessionStorage and do not store
personal data in events. Tell me which events fire where so I can
verify them in the PostHog dashboard.

Ran 1 shell command (ctrl+o to expand)

⏺ Step 3 is already committed (0131cd8). There's no PostHog key in .env yet.
Installing:

⏺ Bash(pnpm add posthog-js 2>&1 | grep -E "^\+|ERR"; d=node_modules/posthog-js;
grep -oE "(persistence|disable_persistence|autocapture|capture_pageview|ca
pture_pagelea…)
⎿  Updated package.json (+1 -0)
15 "dependencies": {
16 "@supabase/supabase-js": "^2.117.3",
17 "nuxt": "^4.6.1",
18 + "posthog-js": "^1.438.10",
19 "vue": "^3.5.43",
20 "vue-router": "^5.4.0",
21 "zod": "^4.6.7"
⎿  Updated pnpm-lock.yaml (+97 -0)
14 nuxt:
15 specifier: ^4.6.1
16 version: 4.6.1(@babel/plugin-syntax-jsx@7.29.7(@babel/c
ore@7.29.7))(@babel/plugin-syntax-typescript@7.29.7(@babel/core
@7.29.7))(@oxc-project/types@0.153.0)(@vue/compiler-sfc@3.5.44)
(acorn@8.19.0)(confbox@0.3.1)(db0@0.3.4)(dotenv@17.4.2)(esbuild
@0.28.2)(giget@3.3.1)(ioredis@5.11.1)(lightningcss@1.33.0)(mlly
@1.8.2)(rolldown@1.2.13)(rollup-plugin-visualizer@7.1.1(rolldow
n@1.2.13)(rollup@4.64.6))(rollup@4.64.6)(srvx@1.0.5)(terser@5.5
1.2)(typescript@5.9.3)(vite@8.3.4(esbuild@0.28.2)(jiti@2.7.0)(t
erser@5.51.2))(vue-tsc@3.3.13(typescript@5.9.3))
17 + posthog-js:
18 + specifier: ^1.438.10
19 + version: 1.438.10
20 vue:
21 specifier: ^3.5.43
22 version: 3.5.44(typescript@5.9.3)
...
569 '@poppinss/exception@1.2.3':
570 resolution: {integrity: sha512-dCED+QRChTVatE9ibtoaxc+Wkdz
OSjYTKi/+uacHWIsfodVfpsueo3+DKpgU5Px8qXjgmXkSvhXvSCz3fnP9lw==}
571
572 + '@posthog/browser-common@0.9.5':
573 + resolution: {integrity: sha512-oXnBgZvM8UQ84IcBLfGP0WSGd9r
+A0PCGR37H8Pw0NszJRwxwbJnFXIUih0pvI/ze2eGmzkIEC9i3SwC+bMAgjQ==}
574 +
575 + '@posthog/core@1.59.1':
576 + resolution: {integrity: sha512-P39YgzQVDh6oz6wAzQXEnoHgTYp
+M7gifonmVKq1scAJco79h31XmmNVurRq9tTmmyIrr1uX8FHT0riCsyfV9AQ==}
577 +
578 + '@posthog/types@1.416.0':
579 + resolution: {integrity: sha512-0/9+02s/0uDyrH4G/qUg1yyl6gX
+Ug8Uuxw/PlDad3KLzo9FFS9zS/kAQaEshx/saVGupj1aAy/4EUBxWisBogw==}
580 +
581 '@rolldown/binding-android-arm-eabi@1.2.13':
582 resolution: {integrity: sha512-Vu/NICrgdRvUOeaJZIyB2FP63s6
fO/4ud5l8dXmxDx9yDyn+mN0y+gsvsVviSli+T361Aqo0h46EuMoobrwawA==}
583 engines: {node: ^20.19.0 || >=22.12.0}
...
929 '@types/resolve@1.20.2':
930 resolution: {integrity: sha512-60BCwRFOZCQhDncwQdxxeOEEkbc
5dIMccYLwbxsS4TUNeVECQ/pBJ0j09mrHOl/JJvpRPGwO9SvE4nR2Nb/a4Q==}
931
932 + '@types/trusted-types@2.0.7':
933 + resolution: {integrity: sha512-ScaPdn1dQczgbl0QFTeTOmVHFUL
+t394XJgOQNoyVhZ6r2vLnMLJfBPd53SB52T/3G36VI1/g2MZaX0cwDuXsfw==}
934 +
935 '@unhead/bundler@3.4.3':
936 resolution: {integrity: sha512-noUTzazRB4fMgO/nluoirrZJXng
NbNb3sQzIslA805tKkwakRv2fib4Xe4EdiTuNB7V5XmpUFvfQkKRdBQ9qAA==}
937 peerDependencies:
...
1366 cookie-es@3.1.1:
1367 resolution: {integrity: sha512-UaXxwISYJPTr9hwQxMFYZ7kNhS
XboMXP+Z3TRX6f1/NyaGPfuNUZOWP1pUEb75B2HjfklIYLVRfWiFZJyC6Npg=
=}
1368
1369 + core-js@3.50.0:
1370 + resolution: {integrity: sha512-BRWgOLKkFeCgRudR6zrs8p9XJZ
+cE14grzKMMssoYrk6krtuEZ7MTKPIY5RzOnqsEKIR9kst7wNzphttraT+Yqw=
+=}
1371 +
1372 core-util-is@1.0.3:
… 165 more lines (ctrl+o to expand)
⎿  (timeout 2m)

Ran 3 shell commands (ctrl+o to expand)

⏺ Option names confirmed. Writing plugin, useTrack, and wiring:

⏺ Bash(mkdir -p app/plugins && cat > app/plugins/posthog.client.ts <<'EOF'
import posthog, { type PostHog } from 'posthog-js'…)
⎿  Updated app/components/Calculator.vue (+3 -3)
2 import { cs } from '#shared/content/cs'
3 import { MONTHLY, YEARS, formatCzk } from '#shared/utils/feeCalc
'
4
5 -const { monthly, years, touched } = useCalculator()
5 +const { monthly, years, onUserInput } = useCalculator()
6 </script>
7
8 <template>
...
17 :min="MONTHLY.min"
18 :max="MONTHLY.max"
19 :step="MONTHLY.step"
20 - @input="touched = true"
20 + @input="onUserInput('monthly')"
21 >
22 <output for="calc-monthly">{{ formatCzk(monthly) }}</output
          >
23
24 <fieldset>
25 <legend>{{ cs.calc.yearsLabel }}</legend>
26 <label v-for="y in YEARS" :key="y">
27 - <input v-model="years" type="radio" name="calc-years" :
-value="y" @change="touched = true">
27 + <input v-model="years" type="radio" name="calc-years" :
+value="y" @change="onUserInput('years')">
28 {{ cs.calc.yearsOption(y) }}
29 </label>
30 </fieldset>
⎿  Updated app/components/LeadForm.vue (+12 -0)
17
18 const inputId = `lead-email-${props.placement}`
19
20 +const track = useTrack()
21 +let focused = false
22 +function onFocus() {
23 + if (focused) return
24 + focused = true
25 + track('form_focus', { placement: props.placement })
26 +}
27 +
28 async function submit() {
29 if (sending.value) return
30 sending.value = true
...
35 body: { email: email.value, monthly: monthly.value, years
: years.value, variant, website: website.value },
36 })
37 done.value = true
38 + track('form_submit', { placement: props.placement, variant, + emailed: res.emailed })
39 + // Inline "Děkujeme" is the thank-you screen until step 7 r
+eplaces it.
40 + track('thankyou_view', { placement: props.placement, varian
+t, emailed: res.emailed })
41 emit('submitted', { emailed: res.emailed })
42 }
43 catch (e: any) {
...
64 inputmode="email"
65 required
66 :placeholder="cs.form.emailPlaceholder"
67 + @focus="onFocus"
68 :aria-invalid="error === 'invalid_email'"
69 :aria-describedby="error ? `${inputId}-error` : undefined
"
70 >
⎿  Updated app/composables/useCalculator.ts (+10 -1)
11 const { pageFunds } = useEtfs()
12
13 const result = computed(() => (touched.value ? compareFunds(m
onthly.value, years.value, pageFunds) : null))
14 + const track = useTrack()
15
15 - return { monthly, years, touched, result }
16 + /** Call from input handlers. The first call reveals the resu
+lt and fires calc_change + calc_result once per page load. \*/
17 + function onUserInput(field: 'monthly' | 'years') {
18 + if (touched.value) return
19 + touched.value = true
20 + track('calc_change', { field })
21 + track('calc_result', { monthly: monthly.value, years: years
+.value, feeGap: Math.round(result.value!.feeGap) })
22 + }
23 +
24 + return { monthly, years, touched, result, onUserInput }
25 }
⎿  Created app/composables/useTrack.ts (+15 -0)
1 +/** Funnel events, README §8. Props must never contain personal + data (no e-mail). \*/
2 +export type EventName = 'page_view' | 'calc_change' | 'calc_res
+ult' | 'form_focus' | 'form_submit' | 'thankyou_view'
3 +export type EventProps = Record<string, string | number | boole
+an>
4 +
5 +export function useTrack() {
6 + const { $posthog } = useNuxtApp()
       7 +  return (event: EventName, props?: EventProps) => {
       8 +    if (import.meta.server) return
       9 +    if (!$posthog) {
10 + console.debug('[track]', event, props ?? {})
11 + return
12 + }
13 + $posthog.capture(event, props)
14 + }
15 +}
⎿  Updated app/pages/index.vue (+6 -0)
1 +<script setup lang="ts">
2 +const variant = useVariant()
3 +const track = useTrack()
4 +onMounted(() => track('page_view', { variant }))
5 +</script>
6 +
7 <template>
8 <main>
9 <Calculator />
⎿  … 2 more files changed
⎿  (timeout 4m)

⏺ Typecheck and tests pass. First a run with no key: events should only show as
console.debug lines.

Called plugin:playwright:playwright 2 times, ran 2 shell commands (ctrl+o to expand)

⏺ Your own pnpm dev is running on :3000 and Nuxt allows only one per project, so
I'm using yours. It has no PostHog key either, so it runs the debug path.

Searched for 1 pattern, called plugin:playwright:playwright 2 times (ctrl+o to expand)

⏺ 5 slider moves + years change → one calc_change, one calc_result; two focuses
→ one form_focus. No storage used. Checking page_view (fires before I could
hook the console):

Called plugin:playwright:playwright 2 times, ran 1 shell command (ctrl+o to expand)

⏺ Step 4 is built and all six events fire in the right order, but none have
reached PostHog yet. There's no NUXT_PUBLIC_POSTHOG_KEY in your .env, so the
code only logged each event as a [track] line in the browser console. I tested
on your dev server at :3000 with ?v=b. I used the hidden bot field, so
nothing was written to Supabase. Not committed yet.

Where each event fires:

Event: page_view
Fired from: index.vue (app/pages/index.vue)
When: page has loaded in the browser
Properties: variant: a or b
────────────────────────────────────────
Event: calc_change
Fired from: onUserInput in useCalculator.ts (app/composables/useCalculator.ts)
When: first slider or years change, once per page load
Properties: field: monthly or years
────────────────────────────────────────
Event: calc_result
Fired from: same function, right after calc_change
When: the result appears (also once)
Properties: monthly, years, feeGap (whole CZK)
────────────────────────────────────────
Event: form_focus
Fired from: LeadForm.vue (app/components/LeadForm.vue)
When: first tap into the e-mail field, once per form
Properties: placement: top
────────────────────────────────────────
Event: form_submit
Fired from: LeadForm.vue
When: every successful submit (server replied 201), repeats included
Properties: placement, variant, emailed
────────────────────────────────────────
Event: thankyou_view
Fired from: LeadForm.vue, right after form_submit
When: "Děkujeme" is shown
Properties: placement, variant, emailed

In my run, five slider moves plus a years change sent one calc_change and one
calc_result. Two focuses on the e-mail field sent one form_focus. When step 7
adds the real thank-you screen, thankyou_view will move there.

Privacy setup (posthog.client.ts (app/plugins/posthog.client.ts)):

- Nothing is stored in the browser: no cookies, localStorage or
  sessionStorage. I checked all three after the run and they were empty. The
  anonymous visitor ID lives in memory only.
- No e-mail in any event. No user profiles are created and nobody is
  identified.
- Only these six events are sent. Automatic click and page tracking, session
  recordings, surveys and feature flags are all off.
- Ad click IDs (gclid, fbclid) are removed from the page URL that PostHog
  records. The referrer is not sent.
- If the browser has Do Not Track on, PostHog doesn't start at all.

Two consequences:

- Because the visitor ID lives only in memory, a reload counts as a new
  visitor. That's fine for a single page, but a funnel only counts paths
  finished without reloading. Switching to sessionStorage is one line if you
  prefer that.
- PostHog still receives the visitor's IP address with each request. To avoid
  keeping it, turn on "Discard client IP data" in the PostHog project
  settings.

To check it in the dashboard:

1. Use an EU PostHog project. Add NUXT*PUBLIC_POSTHOG_KEY=phc*… to .env. The
   address defaults to https://eu.i.posthog.com.
2. Restart pnpm dev and open /?v=b. Move the slider several times, change the
   years, tap the e-mail field twice, then submit.
3. In PostHog → Activity you should see page_view (variant b), then one
   calc_change, one calc_result, one form_focus, form_submit and
   thankyou_view.
4. Build a funnel insight from those six steps and take a screenshot for
   README §8. That section still says "Tool: TODO"; fill it with PostHog.

Typecheck and the 46 tests pass. Once the events show up in PostHog I'll
commit it as feat: PostHog funnel events.

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

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/ai-log/05-analytics.md in the IDE. This may
or may not be related to the current task.</ide_opened_file>

❯ Next: step 5, mobile-first design and Czech copy. Before any code,
propose a visual direction in 5–6 lines: type, colours, how the first
screen looks at 380 px. It must not look like a default AI landing
page: no gradients, no emoji icons, no generic hero with a stock
illustration. Audience: Czech 25–40, invests 2–5k CZK a month, wants
a number fast. I approve the direction first, then you build it.

⏺ Proposed direction: "výpis" (a statement), not a pitch. The page looks like a
clean bank statement where the numbers are the design.

1. Type: headline in Newsreader, a calm news-style serif. Body text and all
   numbers in IBM Plex Sans. Numbers use equal-width digits so the CZK amounts
   line up under each other like a statement. Both fonts support Czech
   accents and come from Google Fonts. No icons.
2. Colours: warm off-white paper (#F5F2EB), near-black ink (#1C1B19), thin
   grey dividers, and one accent: rust (#B4441C). Rust appears only on the fee
   difference in CZK, so the eye goes straight to the one number that
   matters. Flat colours, no gradients or shadows.
3. First screen at 380 px, top: a small fact line ("S&P 500 ETF · poplatky v
   Kč"), then the headline on 2 lines at about 30 px. No hero image, no
   subheading paragraph.
4. Calculator: the monthly amount in large type (about 44 px) above a
   full-width slider with a thick 28 px handle. Below it, the 4 year options
   as one row of joined buttons ("5 | 10 | 20 | 30 let"), each at least 44 px
   tall.
5. Result as statement rows: "VOO ··········· 1 517 433 Kč", one row per fund,
   the fee in small grey under the ticker. Then a heavier line: "Rozdíl za 20
   let: 11 061 Kč" in rust. The 7 % assumption sits in small grey type right
   under it. Before the first change, those rows are reserved and show only a
   quiet hint ("Posuňte posuvník a uvidíte rozdíl"), so the page doesn't jump
   when the result appears.
6. E-mail form: directly under the result, as a plain field with a black
   full-width button and the consent text in small grey. Everything from the
   headline to the gap line fits within 380×700 without scrolling.

Want me to build it, or change something first (fonts, the accent colour, or
the hint before the first change)?

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/PLAN.md in the IDE. This may or may not be
related to the current task.</ide_opened_file>

❯ Approved, with four changes:

1. Show what fees cost in total, not only the gap. Each fund row:
   "VOO 1 517 433 Kč" and under the ticker in small grey
   "poplatek 0,03 % · zaplatíte 5 176 Kč" (feesPaid). The rust gap
   line stays. At 3 000 Kč / 20 years the gap is only 11 061 Kč,
   so the total cost makes the number honest and stronger.
2. Above the e-mail field, one line saying exactly what they get:
   "Pošleme vám porovnání všech 4 fondů včetně evropských variant,
   které koupíte u českého brokera, s vašimi čísly." Button text:
   "Poslat porovnání", not "Odeslat".
3. Under the result, a one-line source in small grey:
   "Poplatky ze stránek správců fondů, ověřeno 14. 10. 2026."
   Trust has to be next to the number, not in the footer.
4. The hint before the first change should invite, not instruct:
   "Kolik vám poplatky vezmou? Posuňte částku." Keep the reserved
   space so nothing jumps.

Keep fonts, colours and layout as proposed. Build it, then send me a
screenshot at 380 px of the first screen before and after the first
slider move.

Ran 1 shell command (ctrl+o to expand)

⏺ Step 4 is committed (0eb2383). Building the first screen now, starting with
copy and the always-on preview so the reserved space matches exactly:

⏺ Bash(mkdir -p app/assets/css && cat > shared/content/cs.ts <<'EOF'
/** All visible Czech text. Shared so the server e-mail uses the same
strings. \*/…)
⎿  Updated app/composables/useCalculator.ts (+4 -2)
10 const touched = useState<boolean>('calc-touched', () => false
)
11 const { pageFunds } = useEtfs()
12
13 - const result = computed(() => (touched.value ? compareFunds(m
-onthly.value, years.value, pageFunds) : null))
13 + // Always computed so the hidden result can reserve its exact + height before the first input.
14 + const preview = computed(() => compareFunds(monthly.value, ye
+ars.value, pageFunds))
15 + const result = computed(() => (touched.value ? preview.value
+: null))
16 const track = useTrack()
17
18 /** Call from input handlers. The first call reveals the resu
lt and fires calc*change + calc_result once per page load. */
...
23 track('calc*result', { monthly: monthly.value, years: years
.value, feeGap: Math.round(result.value!.feeGap) })
24 }
25
24 - return { monthly, years, touched, result, onUserInput }
26 + return { monthly, years, touched, result, preview, onUserInpu
+t }
27 }
⎿  Updated shared/content/cs.ts (+27 -9)
1 /\*\* All visible Czech text. Shared so the server e-mail uses th
e same strings. */
2 export const cs = {
3 + meta: {
4 + title: 'Kolik vám poplatky ETF seberou? Kalkulačka S&P 500'
+,
5 + description:
6 + 'Spočítejte si, kolik vás za 5 až 30 let stojí poplatky f
+ondů SPY, VOO a IVV. Výsledek v korunách, s vašimi čísly.',
7 + },
8 + hero: {
9 + kicker: 'S&P 500 ETF · poplatky v Kč',
10 + headline: { a: 'Kolik vám poplatky seberou za 20 let?' },
11 + },
12 calc: {
4 - heading: 'Spočítejte si, kolik vás stojí poplatky',
13 monthlyLabel: 'Kolik měsíčně investujete',
14 yearsLabel: 'Jak dlouho',
7 - yearsOption: (y: number) => `${y} let`,
8 - resultHeading: (years: number) => `Kolik budete mít za ${ye
         -ars} let`,
9 - feeGap: (gap: string, cheapest: string, priciest: string) =
->
10 - `Rozdíl mezi nejlevnějším (${cheapest}) a nejdražším (${p
         -riciest}) fondem: ${gap}.`,
11 - terLabel: (ter: string) => `poplatek ${ter} % ročně`,
15 + yearsOption: (y: number) => `${y}`,
16 + yearsUnit: 'let',
17 + hint: 'Kolik vám poplatky vezmou? Posuňte částku.',
18 + resultHeading: (years: number) => `Za ${years} let budete m
         +ít`,
19 + feeLine: (ter: string, paid: string) => `poplatek ${ter} %
         +· zaplatíte ${paid}`,
20 + gapLabel: (years: number) => `Rozdíl za ${years} let`,
21 + gapWho: (cheapest: string, priciest: string) => `${cheapest
         +} oproti ${priciest}`,
22 assumption: (pct: number) =>
23 `Předpoklad: výnos ${pct} % ročně před poplatky, vklad na
           konci každého měsíce. Bez daní a poplatků brokera. Skutečný vý
          nos bude jiný.`,
24 + source: (date: string) => `Poplatky ze stránek správců fond
         +ů, ověřeno ${date}.`,
25 },
26 form: {
16 - heading: 'Pošleme vám celé srovnání se všemi fondy a vašimi - čísly',
27 + heading:
28 + 'Pošleme vám porovnání všech 4 fondů včetně evropských va
+riant, které koupíte u českého brokera, s vašimi čísly.',
29 emailLabel: 'Váš e-mail',
30 emailPlaceholder: 'jan@email.cz',
19 - submit: 'Poslat srovnání',
31 + submit: 'Poslat porovnání',
32 sending: 'Odesílám…',
… 15 more lines (ctrl+o to expand)

⏺ Now styles and components:

⏺ Bash(cat > app/assets/css/main.css <<'EOF'
:root {…)
⎿  Created app/assets/css/main.css (+105 -0)
1 +:root {
2 + --paper: #f5f2eb;
3 + --ink: #1c1b19;
4 + --muted: #6b675f;
5 + --rule: #d9d4c9;
6 + --rust: #b4441c;
7 + --field: #fffdf8;
8 +
9 + --font-serif: 'Newsreader', Georgia, 'Times New Roman', seri
+f;
10 + --font-sans: 'IBM Plex Sans', system-ui, -apple-system, 'Seg
+oe UI', sans-serif;
11 +
12 + --space-1: 0.25rem;
13 + --space-2: 0.5rem;
14 + --space-3: 0.75rem;
15 + --space-4: 1rem;
16 + --space-5: 1.5rem;
17 + --space-6: 2rem;
18 + --space-7: 3rem;
19 +
20 + --radius: 2px;
21 + --tap: 44px;
22 +}
23 +
24 +_,
25 +_::before,
26 +\*::after {
27 + box-sizing: border-box;
28 +}
29 +
30 +html {
31 + -webkit-text-size-adjust: 100%;
32 +}
33 +
34 +body {
35 + margin: 0;
36 + background: var(--paper);
37 + color: var(--ink);
38 + font-family: var(--font-sans);
39 + font-size: 1rem;
40 + line-height: 1.45;
… 65 more lines (ctrl+o to expand)
⎿  Updated app/components/CalcResult.vue (+119 -15)
1 <script setup lang="ts">
2 -import { cs } from '#shared/content/cs'
2 +import { cs, formatCsDate } from '#shared/content/cs'
3 import { CALC_ASSUMPTIONS, formatCzk } from '#shared/utils/fee
Calc'
4
5 -const { result, years } = useCalculator()
5 +const { result, preview, years } = useCalculator()
6 +const { dataCheckedDate } = useEtfs()
7 +
8 +// Before the first input the rows are rendered invisibly with + the default numbers,
9 +// so the block already has its final height and nothing below + jumps.
10 +const shown = computed(() => result.value ?? preview.value)
11 +const hidden = computed(() => !result.value)
12 +
13 const ter = (pct: number) => pct.toLocaleString('cs-CZ', { max
imumFractionDigits: 4 })
14 // VOO and IVV share a TER, so "cheapest" can be more than one
fund.
8 -const tickersAt = (value: number) => result.value!.rows.filter
-(r => r.endValue === value).map(r => r.ticker).join(', ')
15 +const tickersAt = (value: number) => shown.value.rows.filter(r + => r.endValue === value).map(r => r.ticker).join(', ')
16 </script>
17
18 <template>
12 - <div v-if="result" aria-live="polite">
13 - <h3>{{ cs.calc.resultHeading(years) }}</h3>
14 - <ul>
15 - <li v-for="row in result.rows" :key="row.ticker">
16 - <strong>{{ row.ticker }}</strong>: {{ formatCzk(row.en
          -dValue) }}
17 - <small>({{ cs.calc.terLabel(ter(row.terPct)) }})</smal
-l>
18 - </li>
19 - </ul>
20 - <p>
21 - {{ cs.calc.feeGap(formatCzk(result.feeGap), tickersAt(re
          -sult.rows[0]!.endValue), tickersAt(result.rows.at(-1)!.endValu
          -e)) }}
22 - </p>
23 - <p><small>{{ cs.calc.assumption(CALC_ASSUMPTIONS.annualRet
          -urnPct) }}</small></p>
19 + <div class="result" aria-live="polite">
20 + <p v-if="hidden" class="hint">{{ cs.calc.hint }}</p>
21 +
22 + <div class="sheet" :class="{ 'is-hidden': hidden }" :aria-
+hidden="hidden">
23 + <h2 class="heading">{{ cs.calc.resultHeading(years) }}</
+h2>
24 + <ul class="rows">
25 + <li v-for="row in shown.rows" :key="row.ticker" class=
+"row">
… 104 more lines (ctrl+o to expand)
⎿  Updated app/components/Calculator.vue (+141 -21)
6 </script>
7
8 <template>
9 - <section>
10 - <h2>{{ cs.calc.heading }}</h2>
11 -
12 - <label for="calc-monthly">{{ cs.calc.monthlyLabel }}</labe
-l>
13 - <input
14 - id="calc-monthly"
15 - v-model.number="monthly"
16 - type="range"
17 - :min="MONTHLY.min"
18 - :max="MONTHLY.max"
19 - :step="MONTHLY.step"
20 - @input="onUserInput('monthly')"
21 - >
22 - <output for="calc-monthly">{{ formatCzk(monthly) }}</outpu
-t>
23 -
24 - <fieldset>
25 - <legend>{{ cs.calc.yearsLabel }}</legend>
26 - <label v-for="y in YEARS" :key="y">
27 - <input v-model="years" type="radio" name="calc-years"
-:value="y" @change="onUserInput('years')">
28 - {{ cs.calc.yearsOption(y) }}
29 - </label>
9 + <section class="calc">
10 + <div class="amount">
11 + <label for="calc-monthly" class="label">{{ cs.calc.month
          +lyLabel }}</label>
12 + <output for="calc-monthly" class="amount-value num">{{ f
          +ormatCzk(monthly) }}</output>
13 + <input
14 + id="calc-monthly"
15 + v-model.number="monthly"
16 + class="slider"
17 + type="range"
18 + :min="MONTHLY.min"
19 + :max="MONTHLY.max"
20 + :step="MONTHLY.step"
21 + :aria-valuetext="formatCzk(monthly)"
22 + @input="onUserInput('monthly')"
23 + >
24 + </div>
… 130 more lines (ctrl+o to expand)

⏺ Bash(python3 - <<'EOF'
p='app/components/LeadForm.vue'…) ⎿  Updated app/components/LeadForm.vue (+104 -25)
51 </script>
52
53 <template>
54 - <p v-if="done" role="status">{{ cs.form.thanks }}</p>
55 - <form v-else novalidate @submit.prevent="submit">
56 - <h2>{{ cs.form.heading }}</h2>
57 - <label :for="inputId">{{ cs.form.emailLabel }}</label>
58 - <input
59 - :id="inputId"
60 - v-model="email"
61 - type="email"
62 - name="email"
63 - autocomplete="email"
64 - inputmode="email"
65 - required
66 - :placeholder="cs.form.emailPlaceholder"
67 - @focus="onFocus"
68 - :aria-invalid="error === 'invalid_email'"
69 - :aria-describedby="error ? `${inputId}-error` : undefine
-d"
70 - >
71 - <div aria-hidden="true" style="position: absolute; left: -
          -9999px">
72 - <label :for="`${inputId}-website`">Web</label>
73 - <input :id="`${inputId}-website`" v-model="website" type
-="text" name="website" tabindex="-1" autocomplete="off">
74 - </div>
75 - <button type="submit" :disabled="sending">{{ sending ? cs.
          -form.sending : cs.form.submit }}</button>
76 - <p v-if="error" :id="`${inputId}-error`" role="alert">{{ c
          -s.form.errors[error] }}</p>
77 - <p><small>{{ cs.form.consent }}</small></p>
78 - </form>
54 + <section class="lead">
55 + <p v-if="done" class="thanks" role="status">{{ cs.form.tha
          +nks }}</p>
56 + <form v-else novalidate @submit.prevent="submit">
57 + <h2 class="heading">{{ cs.form.heading }}</h2>
58 + <label :for="inputId" class="label">{{ cs.form.emailLabe
          +l }}</label>
59 + <input
60 + :id="inputId"
61 + v-model="email"
62 + class="field"
63 + type="email"
64 + name="email"
65 + autocomplete="email"
… 93 more lines (ctrl+o to expand)
⎿  Updated app/pages/index.vue (+25 -1)
1 <script setup lang="ts">
2 +import { cs } from '#shared/content/cs'
3 +
4 const variant = useVariant()
5 const track = useTrack()
6 onMounted(() => track('page_view', { variant }))
7 </script>
8
9 <template>
8 - <main>
10 + <main class="page">
11 + <header>
12 + <p class="kicker">{{ cs.hero.kicker }}</p>
13 + <h1 class="headline">{{ cs.hero.headline.a }}</h1>
14 + </header>
15 <Calculator />
16 <LeadForm placement="top" />
17 </main>
18 </template>
19 +
20 +<style scoped>
21 +.kicker {
22 + font-size: 0.8125rem;
23 + letter-spacing: 0.04em;
24 + color: var(--muted);
25 +}
26 +
27 +.headline {
28 + margin-top: var(--space-2);
29 + font-family: var(--font-serif);
30 + font-size: 1.875rem;
31 + font-weight: 500;
32 + line-height: 1.12;
33 + letter-spacing: -0.01em;
34 + text-wrap: balance;
35 +}
36 +</style>
⎿  Updated nuxt.config.ts (+22 -0)
1 +import { cs } from './shared/content/cs'
2 +
3 // https://nuxt.com/docs/api/configuration/nuxt-config
4 export default defineNuxtConfig({
5 compatibilityDate: '2025-07-15',
6 devtools: { enabled: true },
7 + css: ['~/assets/css/main.css'],
8 + app: {
9 + head: {
10 + htmlAttrs: { lang: 'cs' },
11 + title: cs.meta.title,
12 + meta: [
13 + { name: 'viewport', content: 'width=device-width, initi
+al-scale=1' },
14 + { name: 'description', content: cs.meta.description },
15 + { name: 'theme-color', content: '#f5f2eb' },
16 + ],
17 + link: [
18 + { rel: 'preconnect', href: 'https://fonts.googleapis.co
+m' },
19 + { rel: 'preconnect', href: 'https://fonts.gstatic.com',

- crossorigin: '' },
  20 + {
  21 + rel: 'stylesheet',
  22 + href: 'https://fonts.googleapis.com/css2?family=IBM+P
  +lex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,500
  +&display=swap',
  23 + },
  24 + ],
  25 + },
  26 + },
  27 runtimeConfig: {
  28 // Server only. Set via NUXT_SUPABASE_URL / NUXT_SUPABASE_S
  ERVICE_KEY.
  29 supabaseUrl: '',
  ⎿  (timeout 4m)

⏺ Typecheck and tests pass. Taking screenshots at 380 px:

Called plugin:playwright:playwright 4 times (ctrl+o to expand)

⏺ Gap line ends at 647 px (fits in 700). The assumption and source lines end at
750, just below the fold. Screenshot first:

Read 1 file, called plugin:playwright:playwright (ctrl+o to expand)

⏺ Before-state looks right. Small fix: the "Jak dlouho" legend is indented 2 px
by the browser default. Fixing that, then the after-state:

⏺ Bash(python3 - <<'EOF'
p='app/assets/css/main.css'…)
⎿  Updated app/assets/css/main.css (+4 -0)
60 min-width: 0;
61 }
62
63 +legend {
64 + padding: 0;
65 +}
66 +
67 button,
68 input {
69 font: inherit;

Read 1 file, called plugin:playwright:playwright 3 times (ctrl+o to expand)

⏺ Form height stays at 782 px and fee costs (VOO 5 176 Kč) check out, but I'm
moving the source line up from below the fold to sit right under the gap line,
above the assumption. Next I'll test the widest numbers (20 000 / 30 years).

⏺ Bash(python3 - <<'EOF'
p='app/components/CalcResult.vue'…)
⎿  Updated app/components/CalcResult.vue (+2 -2)
43 </p>
44 </div>
45
46 + <p class="small note">{{ cs.calc.source(formatCsDate(data
         +CheckedDate)) }}</p>
47 <p class="small note">{{ cs.calc.assumption(CALC_ASSUMPTI
          ONS.annualReturnPct) }}</p>
47 - <p class="small">{{ cs.calc.source(formatCsDate(dataCheck
         -edDate)) }}</p>
48 </div>
49 </div>
50 </template>
...
124 }
125
126 .note {
127 - margin-top: var(--space-3);
127 + margin-top: var(--space-2);
128 }
129 </style>

Called plugin:playwright:playwright 2 times (ctrl+o to expand)

⏺ Source line now ends at 692 px, inside the 700 px screen. Largest values fit
with room to spare and there's no horizontal scroll. Retaking both screenshots
with the fixes:

Read 1 file, called plugin:playwright:playwright 5 times (ctrl+o to expand)

⏺ The date breaks across lines ("14. 10." / "2026"). Switching to non-breaking
spaces inside the date:

⏺ Bash(python3 - <<'EOF'
p='shared/content/cs.ts'…)
⎿  Updated shared/content/cs.ts (+2 -2)
42 },
43 } as const
44
45 -/** "2026-10-14" → "14. 10. 2026" (Czech date, no leading zeros
-). \*/
45 +/** "2026-10-14" → "14. 10. 2026" (Czech date, no leading zeros
+, NBSP so it never wraps). \*/
46 export function formatCsDate(iso: string): string {
47 const [y, m, d] = iso.split('-').map(Number)
48 - return `${d}. ${m}. ${y}`
48 + return `${d}.\u00a0${m}.\u00a0${y}`
49 }

Called plugin:playwright:playwright 3 times (ctrl+o to expand)

⏺ Console has an error now; checking:

Read 1 file (ctrl+o to expand)

⏺ Probably stale: the server rendered the old version just before the change
reached it. Reloading to confirm:

Called plugin:playwright:playwright 2 times (ctrl+o to expand)

⏺ Clean after the reload. Final "after" shot:

Read 1 file, called plugin:playwright:playwright 2 times (ctrl+o to expand)

⏺ 380×700, before and after the first slider move (3 000 Kč / 20 let)

› [image] .playwright-mcp/380-before.png (33.2KB)
› [image] .playwright-mcp/380-after.png (54.3KB)

Called plugin:playwright:playwright, ran 1 shell command (ctrl+o to expand)

⏺ I've built the first screen and the e-mail form in the approved direction with
your four changes, and sent you the before and after screenshots at 380 px.
It's not committed yet. The typecheck and all 46 tests pass.

Your four changes:

1. Fee cost per fund: each row now shows the end value, with "poplatek 0,03 %
   · zaplatíte 5 176 Kč" in grey under it. At 3 000 Kč / 20 years SPY's line
   reads "zaplatíte 16 237 Kč". The rust gap line stays, with "VOO, IVV oproti
   SPY" under it.
2. Above the e-mail field: your sentence about the 4 funds and European
   versions, word for word. The button says "Poslat porovnání".
3. Source line: "Poplatky ze stránek správců fondů, ověřeno 14. 10. 2026."
   sits directly under the gap line. I moved it above the 7 % assumption so it
   stays on the first screen. The date comes from the data file, so it
   updates when the data does.
4. Hint before the first move: "Kolik vám poplatky vezmou? Posuňte částku." in
   large grey serif. The result is already laid out invisibly underneath it,
   so nothing moves when it appears. The form starts at 782 px before and
   after.

Measured at 380×700:

- Everything from the headline down to the source line fits on the first
  screen (it ends at 692 px).
- At 20 000 Kč and 30 years the biggest numbers ("23 260 161 Kč", "274 457
  Kč") still fit on one line.
- No horizontal scroll.

Two things to decide:

- Fonts load from Google Fonts. Each visit sends the visitor's IP address to
  Google, which conflicts with the "no cookie banner, no personal data"
  approach you chose in step 4. I can host the fonts with the site instead,
  with no change to how it looks.
- The rest of the page isn't built. PLAN.md's step 6 also includes the full
  comparison table, the "how to buy from CZ" section, a second e-mail form at
  the bottom, and the footer. I held back because you asked for the first
  screen. Shall I continue with those, or commit the first screen now as feat:
  mobile-first layout and Czech copy?

I haven't run Lighthouse or tried it on a real phone yet. I'd do both once the
whole page exists.

❯ 1. Self-host the fonts (only the weights and the latin-ext subset we
use). Then commit as "feat: mobile-first layout and Czech copy". 2. Then build the rest of the page, in this order, one commit each:
a) Comparison table: the 3 funds on the page, columns ticker, TER,
fund size, 30-day SEC yield. Under each US fund its UCITS
equivalent (ticker + TER), because that is what a Czech
investor actually buys. Must stay readable at 380 px without
horizontal scroll, so use stacked rows, not a wide table.
b) "Jak to koupit z Česka": 3 short points. US-domiciled ETFs are
usually not available to EU retail investors (no KID), so you
buy the UCITS version; name the 4 UCITS tickers; it works at
common brokers. No broker recommendations, no affiliate links.
c) Second e-mail form (same component, placement: bottom).
d) Footer: sources with links, data date, "Nejde o investiční
doporučení", 7 % assumption explained in one sentence.

After that, run Lighthouse on mobile and send me the scores and a
full-page screenshot at 380 px.

⏺ Starting with the fonts. Fetching the Google CSS to see which files cover
latin and latin-ext:

Ran 1 shell command (ctrl+o to expand)

⏺ Plex Sans and Newsreader each need their latin and latin-ext subsets to fully
cover Czech characters, so that's 4 files total. Downloading them now.

⏺ Bash(mkdir -p public/fonts && cd public/fonts && \
 curl -sfo plex-sans-latin.woff2 https://fonts.gstatic.com/s/ibmplexsans/v2
3/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dm…)
⎿  4 files changed (binary, mode only or too large to show)

⏺ Bash(cd /Users/kubandam/Work/etf-landing && python3 - <<'EOF'
import re…)
⎿  Created app/assets/css/fonts.css (+37 -0)
1 +/_ Self-hosted from Google Fonts (OFL). Only latin + latin-ext: + Czech needs both (á é í in latin, č ř ě ů in latin-ext). _/
2 +
3 +@font-face {
4 + font-family: 'IBM Plex Sans';
5 + font-style: normal;
6 + font-weight: 400 600;
7 + font-display: swap;
8 + src: url('/fonts/plex-sans-latin-ext.woff2') format('woff2');
9 + unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-
+02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-
+1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+
+2C60-2C7F, U+A720-A7FF;
10 +}
11 +
12 +@font-face {
13 + font-family: 'IBM Plex Sans';
14 + font-style: normal;
15 + font-weight: 400 600;
16 + font-display: swap;
17 + src: url('/fonts/plex-sans-latin.woff2') format('woff2');
18 + unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, + U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U
++20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
19 +}
20 +
21 +@font-face {
22 + font-family: 'Newsreader';
23 + font-style: normal;
24 + font-weight: 500;
25 + font-display: swap;
26 + src: url('/fonts/newsreader-500-latin-ext.woff2') format('wof
+f2');
27 + unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-
+02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-
+1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+
+2C60-2C7F, U+A720-A7FF;
28 +}
29 +
30 +@font-face {
31 + font-family: 'Newsreader';
32 + font-style: normal;
33 + font-weight: 500;
34 + font-display: swap;
35 + src: url('/fonts/newsreader-500-latin.woff2') format('woff2')
+;
36 + unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, + U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U
++20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
37 +}

⏺ Now pointing the config at the local files and dropping Google:

⏺ Bash(python3 - <<'EOF'
p='nuxt.config.ts'…) ⎿  Updated nuxt.config.ts (+9 -9)
4 export default defineNuxtConfig({
5 compatibilityDate: '2025-07-15',
6 devtools: { enabled: true },
7 - css: ['~/assets/css/main.css'],
7 + css: ['~/assets/css/fonts.css', '~/assets/css/main.css'],
8 app: {
9 head: {
10 htmlAttrs: { lang: 'cs' },
...
14 { name: 'description', content: cs.meta.description },
15 { name: 'theme-color', content: '#f5f2eb' },
16 ],
17 - link: [
18 - { rel: 'preconnect', href: 'https://fonts.googleapis.co
-m' },
19 - { rel: 'preconnect', href: 'https://fonts.gstatic.com',

- crossorigin: '' },
  20 - {
  21 - rel: 'stylesheet',
  22 - href: 'https://fonts.googleapis.com/css2?family=IBM+P
  -lex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,500
  -&display=swap',
  23 - },
  24 - ],
  17 + // Self-hosted fonts (no request to Google). All four fil
  +es are used on the first screen.
  18 + link: ['plex-sans-latin', 'plex-sans-latin-ext', 'newsrea
  +der-500-latin', 'newsreader-500-latin-ext'].map(f => ({
  19 + rel: 'preload',
  20 + as: 'font',
  21 + type: 'font/woff2',
  22 + href: `/fonts/${f}.woff2`,
  23 + crossorigin: '',
  24 + })),
  25 },
  26 },
  27 runtimeConfig: {

⏺ Checking in the browser that the fonts load from the site and nothing goes to
Google:

Called plugin:playwright:playwright 4 times (ctrl+o to expand)

⏺ All four fonts load from /fonts/, nothing goes to Google. Committing:

Ran 1 shell command (ctrl+o to expand)

⏺ Committed 4778b97. Now (a), the comparison table. Number formatting goes in a
shared helper with tests (the e-mail will reuse it):

⏺ Bash(cat > shared/utils/format.test.ts <<'EOF'
import { expect, test } from 'vitest'…)
⎿  Created shared/utils/format.test.ts (+15 -0)
1 +import { expect, test } from 'vitest'
2 +import { formatPct, formatUsdBn } from './format'
3 +
4 +test('formatPct keeps the issuer precision, Czech decimal comma
+, NBSP before %', () => {
5 + expect(formatPct(0.0945)).toBe('0,0945 %')
6 + expect(formatPct(0.03)).toBe('0,03 %')
7 + expect(formatPct(1.0)).toBe('1,00 %')
8 + expect(formatPct(0.94)).toBe('0,94 %')
9 +})
10 +
11 +test('formatUsdBn rounds to whole billions, "mld. USD"', () =>
+{
12 + expect(formatUsdBn(823230730000)).toBe('823 mld. USD')
13 + expect(formatUsdBn(1000000000000)).toBe('1 000 mld. USD')
14 + expect(formatUsdBn(185171570000)).toBe('185 mld. USD')
15 +})
⎿  Created shared/utils/format.ts (+9 -0)
1 +/** Percent as the issuer states it, min. 2 decimals: 0.0945 → "
+0,0945 %", 1 → "1,00 %". \*/
2 +export function formatPct(pct: number): string {
3 + return `${pct.toLocaleString('cs-CZ', { minimumFractionDigits:
        + 2, maximumFractionDigits: 4 })} %`
4 +}
5 +
6 +/** Fund size in USD → whole billions: 823 230 730 000 → "823 ml
+d. USD". \*/
7 +export function formatUsdBn(usd: number): string {
8 + return `${Math.round(usd / 1e9).toLocaleString('cs-CZ')} mld. 
        +USD`
9 +}

⏺ Bash(python3 - <<'EOF'
p='shared/content/cs.ts'…)
⎿  Created app/components/CompareTable.vue (+121 -0)
1 +<script setup lang="ts">
2 +import type { Etf } from '#shared/types/etf'
3 +import { cs } from '#shared/content/cs'
4 +import { formatPct, formatUsdBn } from '#shared/utils/format'
5 +
6 +defineProps<{ funds: Etf[] }>()
7 +</script>
8 +
9 +<template>
10 + <section class="compare" aria-labelledby="compare-heading">
11 + <h2 id="compare-heading" class="heading">{{ cs.compare.hea
          +ding }}</h2>
12 + <p class="intro">{{ cs.compare.intro }}</p>
13 +
14 + <ul class="funds">
15 + <li v-for="f in funds" :key="f.ticker" class="fund">
16 + <h3 class="title">
17 + <span class="ticker">{{ f.ticker }}</span>
18 + <span class="name small">{{ f.name }}</span>
19 + </h3>
20 +
21 + <dl class="stats">
22 + <div>
23 + <dt class="small">{{ cs.compare.ter }}</dt>
24 + <dd class="num">{{ formatPct(f.terPct.value) }}</d
+d>
25 + </div>
26 + <div>
27 + <dt class="small">{{ cs.compare.size }}</dt>
28 + <dd class="num">{{ formatUsdBn(f.aumUsd.value) }}<
+/dd>
29 + </div>
30 + <div>
31 + <dt class="small">{{ cs.compare.yield }} <span cla
+ss="nowrap">({{ cs.compare.yieldNote }})</span></dt>
32 + <dd class="num">{{ formatPct(f.dividendYieldPct.va
          +lue) }}</dd>
33 + </div>
34 + </dl>
35 +
36 + <p class="ucits">
37 + <span class="small">{{ cs.compare.ucits }}</span>
38 + <span class="ucits-value">{{ cs.compare.ucitsLine(f.
          +ucits.ticker, formatPct(f.ucits.terPct.value)) }}</span>
39 + </p>
40 + </li>
… 81 more lines (ctrl+o to expand)
⎿  Updated app/pages/index.vue (+2 -0)
3
4 const variant = useVariant()
5 const track = useTrack()
6 +const { pageFunds } = useEtfs()
7 onMounted(() => track('page_view', { variant }))
8 </script>
9
...
15 </header>
16 <Calculator />
17 <LeadForm placement="top" />
18 + <CompareTable :funds="pageFunds" />
19 </main>
20 </template>
21
⎿  Updated shared/content/cs.ts (+10 -0)
23 `Předpoklad: výnos ${pct} % ročně před poplatky, vklad na
           konci každého měsíce. Bez daní a poplatků brokera. Skutečný vý
          nos bude jiný.`,
24 source: (date: string) => `Poplatky ze stránek správců fond
          ů, ověřeno ${date}.`,
25 },
26 + compare: {
27 + heading: 'Tři fondy, jeden index',
28 + intro: 'Všechny tři kopírují S\u0026P 500. Liší se poplatke
+m a velikostí, ne tím, co držíte.',
29 + ter: 'Poplatek (TER)',
30 + size: 'Velikost fondu',
31 + yield: 'Dividendový výnos',
32 + yieldNote: '30denní SEC',
33 + ucits: 'Evropská verze',
34 + ucitsLine: (ticker: string, ter: string) => `${ticker} · po
         +platek ${ter}`,
35 + },
36 form: {
37 heading:
38 'Pošleme vám porovnání všech 4 fondů včetně evropských va
riant, které koupíte u českého brokera, s vašimi čísly.',
⎿  (timeout 4m)

⏺ Bash(python3 -c "
p='shared/content/cs.ts';s=open(p).read();s=s.replace('S\\\\u0026P','S&P')
;open(p,'w').write(s)" && grep -n "intro" shared/content/cs.ts)
⎿  Updated shared/content/cs.ts (+1 -1)
25 },
26 compare: {
27 heading: 'Tři fondy, jeden index',
28 - intro: 'Všechny tři kopírují S\u0026P 500. Liší se poplatke
-m a velikostí, ne tím, co držíte.',
28 + intro: 'Všechny tři kopírují S&P 500. Liší se poplatkem a v
+elikostí, ne tím, co držíte.',
29 ter: 'Poplatek (TER)',
30 size: 'Velikost fondu',
31 yield: 'Dividendový výnos',

Read 1 file, called plugin:playwright:playwright 3 times (ctrl+o to expand)

⏺ At 380px, "1 000 mld. USD" overflows into the next column and the yield label
wraps to 3 lines, misaligning the values. I'll convert the three figures to
statement rows with dotted leaders, matching the calculator result style.

⏺ Bash(python3 - <<'EOF'
p='app/components/CompareTable.vue'…)
⎿  Updated app/components/CompareTable.vue (+27 -17)
19 </h3>
20
21 <dl class="stats">
22 - <div>
23 - <dt class="small">{{ cs.compare.ter }}</dt>
22 + <div class="stat">
23 + <dt>{{ cs.compare.ter }}</dt>
24 + <span class="leader" aria-hidden="true" />
25 <dd class="num">{{ formatPct(f.terPct.value) }}</dd
          >
26 </div>
26 - <div>
27 - <dt class="small">{{ cs.compare.size }}</dt>
27 + <div class="stat">
28 + <dt>{{ cs.compare.size }}</dt>
29 + <span class="leader" aria-hidden="true" />
30 <dd class="num">{{ formatUsdBn(f.aumUsd.value) }}</
dd>
31 </div>
30 - <div>
31 - <dt class="small">{{ cs.compare.yield }} <span clas
-s="nowrap">({{ cs.compare.yieldNote }})</span></dt>
32 + <div class="stat">
33 + <dt>{{ cs.compare.yield }} <span class="small">({{
         +cs.compare.yieldNote }})</span></dt>
34 + <span class="leader" aria-hidden="true" />
35 <dd class="num">{{ formatPct(f.dividendYieldPct.val
          ue) }}</dd>
36 </div>
37 </dl>
...
87 letter-spacing: 0.02em;
88 }
89
87 -/_ Three columns fit 380 px; labels may wrap, values never do. - _/
90 .stats {
89 - display: grid;
90 - grid-template-columns: repeat(3, minmax(0, 1fr));
91 - gap: var(--space-3);
92 - margin: var(--space-3) 0 0;
91 + margin: var(--space-2) 0 0;
92 }
93
95 -.stats dt {
96 - min-height: 2.3em;
94 +.stat {
… 28 more lines (ctrl+o to expand)

Read 1 file, called plugin:playwright:playwright 3 times (ctrl+o to expand)

⏺ The comparison table had overlapping columns at 380 px. I've switched it to
stacked rows, but the screenshot still shows the old layout. Checking whether
the page actually updated:

Listed 1 directory, called plugin:playwright:playwright (ctrl+o to expand)

⏺ The page did update. My image viewer was showing the earlier file because the
name was the same. Saving under a new name:

Read 1 file, called plugin:playwright:playwright (ctrl+o to expand)

⏺ Rows line up, nothing overflows, no horizontal scroll. Committing (a):

Ran 1 shell command (ctrl+o to expand)

⏺ Now (b), "Jak to koupit z Česka":

⏺ Bash(python3 - <<'EOF'
p='shared/content/cs.ts'…)
⎿  Created app/components/HowToBuy.vue (+80 -0)
1 +<script setup lang="ts">
2 +import { cs } from '#shared/content/cs'
3 +
4 +const { allFunds } = useEtfs()
5 +const [noKid, ucits, brokers] = cs.howToBuy.points
6 +</script>
7 +
8 +<template>
9 + <section class="buy" aria-labelledby="buy-heading">
10 + <h2 id="buy-heading" class="heading">{{ cs.howToBuy.heading
         + }}</h2>
11 + <ol class="points">
12 + <li>{{ noKid }}</li>
13 + <li>
14 + {{ ucits }}
15 + <ul class="map">
16 + <li v-for="f in allFunds" :key="f.ticker" class="map-
         +row">
17 + <span class="pair">{{ cs.howToBuy.mapping(f.ticker,
         + f.ucits.ticker) }}</span>
18 + <span class="small num">{{ cs.howToBuy.isin }} {{ f
         +.ucits.isin.value }}</span>
19 + </li>
20 + </ul>
21 + </li>
22 + <li>{{ brokers }}</li>
23 + </ol>
24 + </section>
25 +</template>
26 +
27 +<style scoped>
28 +.buy {
29 + margin-top: var(--space-7);
30 +}
31 +
32 +.heading {
33 + font-family: var(--font-serif);
34 + font-size: 1.5rem;
35 + font-weight: 500;
36 + line-height: 1.2;
37 +}
38 +
39 +.points {
40 + margin: var(--space-4) 0 0;
… 40 more lines (ctrl+o to expand)
⎿  Updated app/pages/index.vue (+1 -0)
16 <Calculator />
17 <LeadForm placement="top" />
18 <CompareTable :funds="pageFunds" />
19 + <HowToBuy />
20 </main>
21 </template>
22
⎿  Updated shared/content/cs.ts (+10 -0)
33 ucits: 'Evropská verze',
34 ucitsLine: (ticker: string, ter: string) => `${ticker} · po
          platek ${ter}`,
35 },
36 + howToBuy: {
37 + heading: 'Jak to koupit z Česka',
38 + points: [
39 + 'Americké fondy jako SPY, VOO nebo IVV vám evropský broke
+r většinou neprodá. Chybí jim KID, povinný dokument pro drobné
+investory v EU.',
40 + 'Proto se kupuje evropská (UCITS) verze. Sleduje stejný i
+ndex S&P 500, jen je založená v Irsku:',
41 + 'Koupíte je u běžných brokerů dostupných z Česka. Hledejt
+e podle ISIN, ticker se mezi burzami může lišit.',
42 + ],
43 + mapping: (us: string, ucits: string) => `${us} → ${ucits}`,
44 + isin: 'ISIN',
45 + },
46 form: {
47 heading:
48 'Pošleme vám porovnání všech 4 fondů včetně evropských va
riant, které koupíte u českého brokera, s vašimi čísly.',
⎿  (timeout 4m)

Read 1 file, called plugin:playwright:playwright 3 times (ctrl+o to expand)

⏺ Looks right, nothing overflows. SPYM shows up only here (it isn't one of the 3
page funds), as the fourth UCITS mapping you asked for. Committing (b):

Ran 1 shell command (ctrl+o to expand)

⏺ Now (c), the second form. When either form is submitted, both should switch to
"Děkujeme" so nobody is asked for their e-mail again. I'll share that state
between the two:

⏺ Bash(python3 - <<'EOF'
p='app/components/LeadForm.vue'…)
⎿  Updated app/components/LeadForm.vue (+2 -1)
13 const website = ref('') // honeypot
14 const sending = ref(false)
15 const error = ref<ErrorKey | null>(null)
16 -const done = ref(false)
16 +// Shared by both form instances: after one submit, neither ask
+s again.
17 +const done = useState('lead-done', () => false)
18
19 const inputId = `lead-email-${props.placement}`
20
⎿  Updated app/pages/index.vue (+1 -0)
17 <LeadForm placement="top" />
18 <CompareTable :funds="pageFunds" />
19 <HowToBuy />
20 + <LeadForm placement="bottom" />
21 </main>
22 </template>
23
⎿  (timeout 4m)

Called plugin:playwright:playwright 2 times (ctrl+o to expand)

⏺ Submitting the bottom form switches both forms to "Děkujeme". No [track] debug
lines appeared, which suggests you've added a PostHog key to .env since step 4. Checking:

Searched for 1 pattern (ctrl+o to expand)

⏺ Yes, a real key is set, so my test clicks went to your PostHog project as real
events. Confirming the bottom form's events were sent:

Called plugin:playwright:playwright (ctrl+o to expand)

⏺ Sent to the EU host. Committing (c):

Ran 1 shell command (ctrl+o to expand)

⏺ Now (d), the footer. The 7 % sentence is written as an assumption, not a
statistic, because I have no sourced long-run return figure to quote:
⏺ Bash(python3 - <<'EOF'
p='shared/content/cs.ts'…)
⎿  Created app/components/SiteFooter.vue (+93 -0)
1 +<script setup lang="ts">
2 +import type { Etf } from '#shared/types/etf'
3 +import { cs, formatCsDate } from '#shared/content/cs'
4 +import { CALC*ASSUMPTIONS } from '#shared/utils/feeCalc'
5 +
6 +const { allFunds, dataCheckedDate } = useEtfs()
7 +
8 +/\** Unique source URLs per ticker (US fund and its UCITS versio
+n listed separately). \_/
9 +function sources(f: Etf) {
10 + const us = [f.exchange, f.terPct, f.aumUsd, f.dividendYieldPc
+t].map(v => v.source)
11 + const eu = [f.ucits.isin, f.ucits.terPct].map(v => v.source)
12 + return [
13 + { ticker: f.ticker, urls: [...new Set(us)] },
14 + { ticker: f.ucits.ticker, urls: [...new Set(eu)] },
15 + ]
16 +}
17 +const rows = allFunds.flatMap(sources)
18 +const host = (url: string) => new URL(url).hostname.replace(/^w
+ww\./, '')
19 +</script>
20 +
21 +<template>
22 + <footer class="footer">
23 + <h2 class="heading">{{ cs.footer.sourcesHeading }}</h2>
24 + <p class="small">{{ cs.footer.sourcesIntro }} {{ cs.footer.
         +checked(formatCsDate(dataCheckedDate)) }}</p>
25 + <ul class="sources">
26 + <li v-for="r in rows" :key="r.ticker" class="source">
27 + <span class="ticker">{{ r.ticker }}</span>
28 + <span class="links">
29 + <a v-for="u in r.urls" :key="u" :href="u" target="_bl
         +ank" rel="noopener noreferrer">{{ host(u) }}</a>
30 + </span>
31 + </li>
32 + </ul>
33 + <p class="small note">{{ cs.footer.assumption(CALC_ASSUMPTI
         +ONS.annualReturnPct) }}</p>
34 + <p class="advice">{{ cs.footer.notAdvice }}</p>
35 + </footer>
36 +</template>
37 +
38 +<style scoped>
39 +.footer {
40 + margin-top: var(--space-7);
… 53 more lines (ctrl+o to expand)
⎿  Updated app/pages/index.vue (+1 -0)
18 <CompareTable :funds="pageFunds" />
19 <HowToBuy />
20 <LeadForm placement="bottom" />
21 + <SiteFooter />
22 </main>
23 </template>
24
⎿  Updated shared/content/cs.ts (+8 -0)
43 mapping: (us: string, ucits: string) => `${us} → ${ucits}`,
44 isin: 'ISIN',
45 },
46 + footer: {
47 + sourcesHeading: 'Zdroje',
48 + sourcesIntro: 'Každé číslo na stránce je opsané ze stránky
+správce fondu.',
49 + checked: (date: string) => `Data ověřena ${date}.`,
50 + assumption: (pct: number) =>
51 + `${pct} % ročně je zaokrouhlený předpoklad pro dlouhodobý
         + výnos akciového indexu, ne předpověď: skutečný výnos může být
         +vyšší i nižší a v jednotlivých letech i záporný.`,
52 + notAdvice: 'Nejde o investiční doporučení.',
53 + },
54 form: {
55 heading:
56 'Pošleme vám porovnání všech 4 fondů včetně evropských va
riant, které koupíte u českého brokera, s vašimi čísly.',
⎿  (timeout 4m)

Read 1 file, called plugin:playwright:playwright 3 times (ctrl+o to expand)

⏺ The intro says every number comes from the fund manager's page, but VOO's
exchange comes from nyse.com. Correcting the sentence:

⏺ Bash(python3 - <<'EOF'
p='shared/content/cs.ts'…)
⎿  Updated shared/content/cs.ts (+1 -1)
45 },
46 footer: {
47 sourcesHeading: 'Zdroje',
48 - sourcesIntro: 'Každé číslo na stránce je opsané ze stránky
-správce fondu.',
48 + sourcesIntro: 'Údaje o fondech jsou ze stránek jejich správ
+ců, burza u VOO ze stránky NYSE.',
49 checked: (date: string) => `Data ověřena ${date}.`,
50 assumption: (pct: number) =>
51 `${pct} % ročně je zaokrouhlený předpoklad pro dlouhodobý
           výnos akciového indexu, ne předpověď: skutečný výnos může být
          vyšší i nižší a v jednotlivých letech i záporný.`,
⎿  (timeout 4m)

⏺ All four parts are committed. For Lighthouse I'll use a production build
rather than the dev server (dev mode is slow and would distort the scores).
Building:

Ran 1 shell command (ctrl+o to expand)

⏺ Build passes, including the data check. I'm starting the production server
without the PostHog key so Lighthouse runs don't add test events to your
project:

Ran 2 shell commands (ctrl+o to expand)

⏺ Performance scored 71, below the plan's target of 90. The other three are 100.
Looking at what's slowing first paint:

Ran 1 shell command (ctrl+o to expand)

⏺ Found three issues: no compression (355 KB wasted), a 386 KB script (likely
posthog-js), and four font preloads (162 KB) competing for bandwidth. I'll
pre-compress files at build time and investigate the large script next.

Ran 1 shell command (ctrl+o to expand)

⏺ I found that PostHog's 395 KB script is blocking page render, so I'll defer
loading it until after the page finishes loading—queued events like page_view
will keep their original timestamps. I'll also pre-compress build files,
preload only the two basic font files, and set long caching for fonts.

⏺ Bash(cat > app/plugins/posthog.client.ts <<'EOF'
import type { PostHog } from 'posthog-js'…)
⎿  Updated app/composables/useTrack.ts (+2 -6)
3 export type EventProps = Record<string, string | number | boole
an>
4
5 export function useTrack() {
6 - const { $posthog } = useNuxtApp()
       6 +  const { $track } = useNuxtApp()
       7    return (event: EventName, props?: EventProps) => {
       8      if (import.meta.server) return
       9 -    if (!$posthog) {
10 - console.debug('[track]', event, props ?? {})
11 - return
12 - }
13 - $posthog.capture(event, props)
9 + $track(event, props)
10 }
11 }
⎿  Updated app/plugins/posthog.client.ts (+29 -3)
1 -import posthog, { type PostHog } from 'posthog-js'
1 +import type { PostHog } from 'posthog-js'
2 +import type { EventName, EventProps } from '~/composables/useTr
+ack'
3
4 /**
5 _ PostHog without a cookie banner: nothing is written to cooki
es or localStorage,
6 _ the anonymous id lives in memory only (new id on every page
load).
7 _ Only the events from useTrack() are sent; no autocapture, re
cordings or pageview magic.
8 + _
9 + _ posthog-js (~400 kB) is imported only after the page has loa
+ded, so it never delays
10 + _ the first paint. Events fired before that wait in a queue wi
+th their original timestamp.
11 \*/
12 export default defineNuxtPlugin(() => {
13 const { posthogKey, posthogHost } = useRuntimeConfig().public
14 + const enabled = Boolean(posthogKey) && navigator.doNotTrack !
+== '1'
15 +
16 let client: PostHog | null = null
17 + const queue: { event: EventName; props?: EventProps; at: Date + }[] = []
18 +
19 + function track(event: EventName, props?: EventProps) {
20 + if (!enabled) {
21 + console.debug('[track]', event, props ?? {})
22 + return
23 + }
24 + if (client) client.capture(event, props)
25 + else queue.push({ event, props, at: new Date() })
26 + }
27
12 - if (posthogKey && navigator.doNotTrack !== '1') {
28 + async function load() {
29 + const { default: posthog } = await import('posthog-js')
30 client = posthog.init(posthogKey, {
31 api_host: posthogHost,
32 persistence: 'memory',
...
48 mask_personal_data_properties: true,
49 save_referrer: false,
50 }) ?? null
51 + for (const q of queue.splice(0)) client?.capture(q.event, q
+.props, { timestamp: q.at })
52 + }
53 +
… 11 more lines (ctrl+o to expand)
⎿  Updated nuxt.config.ts (+11 -2)
14 { name: 'description', content: cs.meta.description },
15 { name: 'theme-color', content: '#f5f2eb' },
16 ],
17 - // Self-hosted fonts (no request to Google). All four fil
-es are used on the first screen.
18 - link: ['plex-sans-latin', 'plex-sans-latin-ext', 'newsrea
-der-500-latin', 'newsreader-500-latin-ext'].map(f => ({
17 + // Self-hosted fonts (no request to Google). Preload only + the basic Latin files;
18 + // the latin-ext files (č, ř, ě, ů) are small and load as + soon as the text needs them.
19 + link: ['plex-sans-latin', 'newsreader-500-latin'].map(f =
+> ({
20 rel: 'preload',
21 as: 'font',
22 type: 'font/woff2',
...
25 })),
26 },
27 },
28 + nitro: {
29 + // Pre-built gzip/brotli files, so compression does not dep
+end on the host.
30 + compressPublicAssets: true,
31 + },
32 + routeRules: {
33 + // Font files never change; rename the file if they ever do
+.
34 + '/fonts/**': { headers: { 'cache-control': 'public, max-age
+=31536000, immutable' } },
35 + },
36 runtimeConfig: {
37 // Server only. Set via NUXT_SUPABASE_URL / NUXT_SUPABASE_S
ERVICE_KEY.
38 supabaseUrl: '',
⎿  (timeout 4m)

Ran 1 shell command (ctrl+o to expand)

⏺ Performance score is stable at 92 (up from 71) with the other categories still
at 100. Before committing, I'll verify the PostHog delay didn't drop any
events using a test server with a fake key, so nothing hits your real project.

Called plugin:playwright:playwright 2 times, ran 1 shell command (ctrl+o to expand)

⏺ The queued events were flushed in the post-load /e/ request, but the PostHog
script itself loaded unusually early (44ms, 85KB compressed). I'll check if
Nuxt is preloading it and inspect what's in the flushed batch.

Ran 1 shell command (ctrl+o to expand)

⏺ PostHog is fetched as a low-priority prefetch, which the browser only does
when idle, so it doesn't slow the page. Now checking what the flushed batch
contained:

Called plugin:playwright:playwright 3 times (ctrl+o to expand)

⏺ The body is gzip-compressed. I'll capture it from Playwright on a fresh load
and unpack it:

Called plugin:playwright:playwright 3 times (ctrl+o to expand)

⏺ Confirmed the queued page_view (variant b) and calc_change events both reached
PostHog after the library loaded, so no data was lost. I'll stop the test
server, commit the speed fixes separately, then take the full-page screenshot
from the production build.

Read 1 file, called plugin:playwright:playwright 4 times, ran 1 shell command (ctrl+o to expand)

⏺ Full page at 380 px, production build, after the first slider move (3 000 Kč /
20 let)

› [image] .playwright-mcp/380-full-page.png (279.3KB)

Called plugin:playwright:playwright, ran 1 shell command (ctrl+o to expand)

⏺ The whole page is built and committed, one commit per part as you asked, plus
one extra commit for speed fixes. I've sent you the full-page screenshot at
380 px. Lighthouse on mobile scored 92 / 100 / 100 / 100.

┌───────────────────────────────────────┬───────┐
│ Lighthouse (mobile, production build) │ Score │
├───────────────────────────────────────┼───────┤
│ Performance │ 92 │
├───────────────────────────────────────┼───────┤
│ Accessibility │ 100 │
├───────────────────────────────────────┼───────┤
│ Best practices │ 100 │
├───────────────────────────────────────┼───────┤
│ SEO │ 100 │
└───────────────────────────────────────┴───────┘

I got the same result in three runs: first paint 1.9 s, main content 3.2 s, no
blocking time, no layout shift.

Commits:

- 4778b97 first screen and Czech copy, fonts now served from the site itself:
  4 files, 160 KB, nothing loaded from Google.
- cd0a91f (a) comparison of the 3 funds, each with its European version.
- 95e855e (b) "Jak to koupit z Česka".
- b2818f7 (c) second e-mail form at the bottom. Submitting either form
  switches both to "Děkujeme".
- 1b4187d (d) footer.
- 6eed2f7 speed fixes, explained below.

Why the extra commit: the first Lighthouse run scored only 71 on performance.
The PostHog library (about 400 KB) loaded before the page could show. It now
loads after the page has finished loading. Events fired before that, like
page_view, wait in a queue and are sent afterwards with their original time. I
tested this with a fake key: page_view with variant b and calc_change both
arrived. I also pre-compressed the build files and now preload only the two
basic font files.

Changes from your spec:

- Fonts: you asked for latin-ext only, but Czech needs both latin and
  latin-ext. á, é and í are in latin; č, ř, ě and ů are in latin-ext.
- Comparison: I first put the three figures side by side, but "1 000 mld. USD"
  didn't fit at 380 px. Each figure is now its own row with dotted leaders,
  like the calculator result.
- Footer: the intro says the figures come from the fund managers' sites and
  VOO's exchange from NYSE, since that one value isn't from Vanguard.
- The 7 % sentence: it says this is a rounded assumption for a stock index's
  long-term return, not a forecast, and that real returns can be higher, lower
  or negative in a given year. I didn't quote a historical average because
  nothing in the data gives one with a source.
- SPYM / SPYL: SPYM appears only in "Jak to koupit" and the footer sources, as
  the fourth mapping. It isn't one of the 3 funds shown in the comparison.

PostHog test events: while testing the bottom form on your dev server, I sent
a few real events to your PostHog project from localhost:3000. That was one
test submit, which went nowhere (the hidden bot field was filled, so nothing
was saved to Supabase). In PostHog, filter by host = localhost to exclude
them. The Lighthouse runs and the queue test sent nothing to your project.

I haven't checked on a real phone. That's pnpm dev --host and opening the
shown address on your phone over Wi-Fi.

❯ Next, in this order, one commit each:

1. Headline per ad: check that ?v=a and ?v=b switch the first-screen
   headline as in README section 4. If not, build it. Update ad A's
   promise to match what the calculator really shows:
   A: "Kolik vás stojí poplatek ETF? U SPY za 20 let přes 16 000 Kč."
   B: "Který S&P 500 ETF si vybrat? Stejný index, jiné poplatky."
2. Thank-you screen (replaces "Děkujeme"): show right away the full
   comparison promised in the form: all 4 funds with their UCITS
   versions, end value and fees paid for the visitor's own amount and
   years. Fire thankyou_view here.
3. Send the same comparison by e-mail with Resend (server route,
   plain HTML e-mail, NUXT_RESEND_API_KEY in .env.example). If Resend
   fails, the lead is still saved and the thank-you screen still
   shows the comparison; log the error. Tell me what I need to set up
   on resend.com.
4. /ads/README.md: both ad versions (headline, text, CTA, target URL
   with ?v=a / ?v=b) and one sentence each on the promise.

Then push and tell me when production is deployed.

⏺ Checking repo state, deploy setup and README §4 first:

Ran 1 shell command (ctrl+o to expand)

⏺ No Vercel CLI and no local Vercel link. Checking whether GitHub reports Vercel
deployments for this repo (that would show the production URL):

Ran 1 shell command (ctrl+o to expand)

⏺ Production is 6 commits behind, and the headline currently always shows
variant A regardless of ?v=. I'll derive the "přes 16 000 Kč" figure directly
from SPY's fee data (3 000 Kč/20 years, rounded down) so it stays accurate,
with a test locking in the exact wording.

Searched for 1 pattern (ctrl+o to expand)
⏺ Bash(python3 - <<'EOF'
p='shared/content/cs.ts'…)
⎿  Updated app/pages/index.vue (+17 -1)
1 <script setup lang="ts">
2 import { cs } from '#shared/content/cs'
3 +import { headline } from '#shared/content/headline'
4
5 const variant = useVariant()
6 const track = useTrack()
7 const { pageFunds } = useEtfs()
8 +// Read during setup, so the server-rendered HTML already has t
+he right headline (no flash).
9 +const h = headline(variant, pageFunds)
10 onMounted(() => track('page*view', { variant }))
11 </script>
12
...
14 <main class="page">
15 <header>
16 <p class="kicker">{{ cs.hero.kicker }}</p>
14 - <h1 class="headline">{{ cs.hero.headline.a }}</h1>
17 + <h1 class="headline">
18 + {{ h.question }}
19 + <span class="fact">{{ h.fact }}</span>
20 + </h1>
21 </header>
22 <Calculator />
23 <LeadForm placement="top" />
...
35 color: var(--muted);
36 }
37
38 +.fact {
39 + display: block;
40 + margin-top: var(--space-1);
41 + font-family: var(--font-sans);
42 + font-size: 1.125rem;
43 + font-weight: 500;
44 + line-height: 1.3;
45 + letter-spacing: 0;
46 +}
47 +
48 .headline {
49 margin-top: var(--space-2);
50 font-family: var(--font-serif);
⎿  Updated shared/content/cs.ts (+11 -1)
7 },
8 hero: {
9 kicker: 'S&P 500 ETF · poplatky v Kč',
10 - headline: { a: 'Kolik vám poplatky seberou za 20 let?' },
10 + // Each headline = question + one short fact line. Must mat
+ch the ad the visitor came from (README §4).
11 + headline: {
12 + a: {
13 + question: 'Kolik vás stojí poplatek ETF?',
14 + fact: (ticker: string, years: number, amount: string) =
+> `U ${ticker} za ${years} let přes ${amount}.`,
15 + },
16 + b: {
17 + question: 'Který S&P 500 ETF si vybrat?',
18 + fact: () => 'Stejný index, jiné poplatky.',
19 + },
20 + },
21 },
22 calc: {
23 monthlyLabel: 'Kolik měsíčně investujete',
⎿  Created shared/content/headline.test.ts (+16 -0)
1 +import { expect, test } from 'vitest'
2 +import type { EtfData } from '../types/etf'
3 +import data from '../../data/etfs.json'
4 +import { headline } from './headline'
5 +
6 +const pageFunds = (data as EtfData).funds.filter(f => f.showOnP
+age)
7 +const text = (h: { question: string; fact: string }) => `${h.qu
         +estion} ${h.fact}`.replace(/ /g, ' ')
8 +
9 +// If this fails after a data change, the ad A text in ads/READ
+ME.md must change too.
10 +test('A matches ad A', () => {
11 + expect(text(headline('a', pageFunds))).toBe('Kolik vás stojí
+poplatek ETF? U SPY za 20 let přes 16 000 Kč.')
12 +})
13 +
14 +test('B matches ad B', () => {
15 + expect(text(headline('b', pageFunds))).toBe('Který S&P 500 ET
+F si vybrat? Stejný index, jiné poplatky.')
16 +})
⎿  Created shared/content/headline.ts (+25 -0)
1 +import type { Etf } from '../types/etf'
2 +import type { Variant } from '../utils/variant'
3 +import { MONTHLY, YEARS_INITIAL, compareFunds, formatCzk } from + '../utils/feeCalc'
4 +import { cs } from './cs'
5 +
6 +export interface Headline {
7 + question: string
8 + fact: string
9 +}
10 +
11 +/\**
12 + _ First-screen headline for the ad version.
13 + _ A quotes what the most expensive page fund costs in fees at
+the calculator defaults
14 + _ (3 000 Kč / 20 let), rounded down to whole thousands so "pře
+s" stays true.
15 + _/
16 +export function headline(variant: Variant, pageFunds: Etf[]): H
+eadline {
17 + if (variant === 'b') return { question: cs.hero.headline.b.qu
+estion, fact: cs.hero.headline.b.fact() }
18 +
19 + const priciest = compareFunds(MONTHLY.initial, YEARS*INITIAL, + pageFunds).rows.at(-1)!
20 + const floored = Math.floor(priciest.feesPaid / 1000) * 1000
21 + return {
22 + question: cs.hero.headline.a.question,
23 + fact: cs.hero.headline.a.fact(priciest.ticker, YEARS_INITIA
+L, formatCzk(floored)),
24 + }
25 +}
⎿  (timeout 4m)

⏺ Tests pass: the computed A headline matches your sentence exactly. Checking
the server-rendered HTML for each ?v=:

Ran 1 shell command (ctrl+o to expand)

⏺ All five URLs behave correctly, already in the server HTML so the headline
doesn't flash. Checking the first screen still fits with the extra line:

Called plugin:playwright:playwright 2 times (ctrl+o to expand)

⏺ The gap line still fits (675 px), but the source line now ends at 719 px, just
below the fold. Tightening three vertical spaces by 8 px each:

⏺ Bash(python3 - <<'EOF'
import re…)
⎿  Updated app/assets/css/main.css (+1 -1)
83 .page {
84 max-width: 42rem;
85 margin: 0 auto;
86 - padding: var(--space-5) var(--space-4) var(--space-7);
86 + padding: var(--space-4) var(--space-4) var(--space-7);
87 }
88
89 .num {
⎿  Updated app/components/CalcResult.vue (+1 -1)
52 <style scoped>
53 .result {
54 position: relative;
55 - margin-top: var(--space-5);
55 + margin-top: var(--space-4);
56 border-top: 1px solid var(--ink);
57 padding-top: var(--space-3);
58 }
⎿  Updated app/components/Calculator.vue (+1 -1)
46
47 <style scoped>
48 .calc {
49 - margin-top: var(--space-5);
49 + margin-top: var(--space-4);
50 }
51
52 .label {

Read 1 file, called plugin:playwright:playwright (ctrl+o to expand)

⏺ Fits again: the source line ends at 695 px. The box around the slider is just
the keyboard-focus outline from my test input. Updating README §4 to the new
headlines, then committing:

⏺ Bash(python3 - <<'EOF'
p='README.md'…)
⎿  Updated README.md (+6 -6)
40
41 Two versions with two different promises. The first screen of t
he page uses the same promise as the ad the visitor came from.
42
43 -| | Version A: fees - | Version B: choice -
-|
44 -| -------------------- | --------------------------------------
------------------------------------------ | -------------------

---

-|
45 -| Promise | Fees cost you more than you think - | Which S&P 500 ETF s
-hould you buy
-|
46 -| Headline | Kolik vám poplatky ETF seberou za 20 l
-et? | Který S&P 500 ETF s
-i vybrat?
-|
47 -| Text | Spočítejte si to za 10 vteřin. Rozdíl
-mezi fondy je v řádu desítek tisíc korun. | Tři nejznámější fon
-dy, stejný index, jiné poplatky. Porovnání na jedné obrazovce.
-|
48 -| Headline on the page | Kolik vám poplatky seberou za 20 let? - | Který S&P 500 ETF?
-Spočítejte si rozdíl.
-|
43 +| | Version A: fees + | Version B: choice + |
44 +| -------------------- | --------------------------------------
+-------------------------- | ----------------------------------
+----------------------------------------------- |
45 +| Promise | You see what the fee costs you in CZK, + not in percent | Same index in all three, so the onl
+y real difference is the fee |
46 +| Headline (ad + page) | Kolik vás stojí poplatek ETF? U SPY za + 20 let přes 16 000 Kč. | Který S&P 500 ETF si vybrat? Stejn
+ý index, jiné poplatky. |
47 +
48 +Ad and page use the same headline word for word. The 16 000 Kč
+in A is SPY's fees at the calculator defaults (3 000 Kč a month
+, 20 years), computed from `/data/etfs.json` and rounded down;
+a unit test fails if the data ever changes it.
49
50 The page reads the `?v=a` / `?v=b` URL parameter and switches t
he headline. Default without the parameter is version A. Full a
d texts are in [`/ads`](./ads).
51

⏺ Part 1 is committed. Now moving to the thank-you screen—I'll add a compareAll
function alongside compareFunds to cover end values for the European versions,
which the part 3 e-mail will also reuse, starting with tests.

⏺ Bash(cat >> shared/utils/feeCalc.test.ts <<'EOF'…)
⎿  Updated shared/utils/feeCalc.test.ts (+22 -1)
1 import { describe, expect, test } from 'vitest'
2 import type { Etf } from '../types/etf'
3 -import { CALC*ASSUMPTIONS, MONTHLY, YEARS, compareFunds, endValu
-e, formatCzk } from './feeCalc'
3 +import { CALC_ASSUMPTIONS, MONTHLY, YEARS, compareAll, compareFu
+nds, endValue, formatCzk } from './feeCalc'
4
5 /** Minimal Etf with only the fields the calculator reads. \*/
6 function fund(ticker: string, terPct: number): Etf {
...
105 expect(formatCzk(999.6)).toBe('1 000 Kč')
106 })
107 })
108 +
109 +describe('compareAll', () => {
110 + const funds = [fund('SPY', 0.0945), fund('VOO', 0.03)]
111 + funds[0]!.ucits.terPct.value = 0.03
112 + funds[1]!.ucits.terPct.value = 0.07
113 +
114 + test('US and UCITS rows use their own TER', () => {
115 + const rows = compareAll(3000, 20, funds)
116 + const r = CALC_ASSUMPTIONS.annualReturnPct
117 + const spy = rows.find(x => x.ticker === 'SPY')!
118 + expect(spy.endValue).toBe(endValue({ monthly: 3000, years: + 20, annualReturnPct: r, terPct: 0.0945 }))
119 + expect(spy.ucits.endValue).toBe(endValue({ monthly: 3000,
+years: 20, annualReturnPct: r, terPct: 0.03 }))
120 + expect(spy.ucits.feesPaid).toBeLessThan(spy.feesPaid)
121 + })
122 +
123 + test('sorted by US end value desc, US numbers equal compareF
+unds', () => {
124 + const rows = compareAll(3000, 20, funds)
125 + const cf = compareFunds(3000, 20, funds).rows
126 + expect(rows.map(x => [x.ticker, x.endValue])).toEqual(cf.m
+ap(x => [x.ticker, x.endValue]))
127 + })
128 +})
⎿  Updated shared/utils/feeCalc.ts (+19 -0)
67 return { rows, feeGap }
68 }
69
70 +export interface FullRow extends CompareRow {
71 + ucits: { ticker: string; isin: string; terPct: number; endVal
+ue: number; feesPaid: number }
72 +}
73 +
74 +/** Every fund and its UCITS version for the visitor's numbers
+(thank-you screen and e-mail). Sorted like compareFunds. */
75 +export function compareAll(monthly: number, years: number, fund
+s: Etf[]): FullRow[] {
76 + const { annualReturnPct } = CALC*ASSUMPTIONS
77 + const noFee = endValue({ monthly, years, annualReturnPct, ter
+Pct: 0 })
78 + const byTicker = new Map(funds.map(f => [f.ticker, f]))
79 + return compareFunds(monthly, years, funds).rows.map((row) =>
+{
80 + const u = byTicker.get(row.ticker)!.ucits
81 + const value = endValue({ monthly, years, annualReturnPct, t
+erPct: u.terPct.value })
82 + return {
83 + ...row,
84 + ucits: { ticker: u.ticker, isin: u.isin.value, terPct: u.
+terPct.value, endValue: value, feesPaid: noFee - value },
85 + }
86 + })
87 +}
88 +
89 const czk = new Intl.NumberFormat('cs-CZ', { style: 'currency',
currency: 'CZK', maximumFractionDigits: 0 })
90
91 /\*\* "1 234 567 Kč" with NBSP separators, whole crowns. */

⏺ That edit is mine (adding compareAll); the tests went from failing to passing.
Now the shared "submitted" state, the copy and the component:

⏺ Bash(cat > app/composables/useLead.ts <<'EOF'
import type { Years } from '#shared/utils/feeCalc'…)
⎿  Updated app/components/LeadForm.vue (+4 -12)
13 const website = ref('') // honeypot
14 const sending = ref(false)
15 const error = ref<ErrorKey | null>(null)
16 -// Shared by both form instances: after one submit, neither ask
-s again.
17 -const done = useState('lead-done', () => false)
16 +const submitted = useLead()
17
18 const inputId = `lead-email-${props.placement}`
19
...
34 method: 'POST',
35 body: { email: email.value, monthly: monthly.value, years
: years.value, variant, website: website.value },
36 })
38 - done.value = true
37 track('form_submit', { placement: props.placement, variant,
emailed: res.emailed })
40 - // Inline "Děkujeme" is the thank-you screen until step 7 r
-eplaces it.
41 - track('thankyou_view', { placement: props.placement, varian
-t, emailed: res.emailed })
38 + // Snapshot the numbers the server got, so the thank-you sc
+reen matches the e-mail.
39 + submitted.value = { placement: props.placement, monthly: mo
+nthly.value, years: years.value, emailed: res.emailed }
40 emit('submitted', { emailed: res.emailed })
41 }
42 catch (e: any) {
...
51
52 <template>
53 <section class="lead">
56 - <p v-if="done" class="thanks" role="status">{{ cs.form.than
         -ks }}</p>
57 - <form v-else novalidate @submit.prevent="submit">
54 + <form novalidate @submit.prevent="submit">
55 <h2 class="heading">{{ cs.form.heading }}</h2>
56 <label :for="inputId" class="label">{{ cs.form.emailLabel
           }}</label>
57 <input
...
148 .consent {
149 margin-top: var(--space-3);
150 }
154 -
155 -.thanks {
156 - font-family: var(--font-serif);
157 - font-size: 1.5rem;
158 -}
151 </style>
⎿  Created app/composables/useLead.ts (+14 -0)
1 +import type { Years } from '#shared/utils/feeCalc'
2 +
3 +export interface Submitted {
4 + placement: 'top' | 'bottom'
5 + /** Snapshot of the calculator at submit time; the thank-you
+screen and e-mail use these, not live values. \*/
6 + monthly: number
7 + years: Years
8 + emailed: boolean
9 +}
10 +
11 +/** Set after a successful submit. Both forms disappear; ThankY
+ou shows where the submitted form was. \*/
12 +export function useLead() {
13 + return useState<Submitted | null>('lead-submitted', () => nul
+l)
14 +}
⎿  Updated shared/content/cs.ts (+9 -1)
76 storage: 'E-mail se nepodařilo uložit. Zkuste to prosím z
a chvíli znovu.',
77 network: 'Nepodařilo se spojit se serverem. Zkontrolujte
připojení a zkuste to znovu.',
78 },
79 - thanks: 'Děkujeme.',
79 + },
80 + thanks: {
81 + heading: 'Děkujeme. Tady je celé porovnání.',
82 + restate: (monthly: string, years: number) => `Pro ${monthly
         +} měsíčně po dobu ${years} let.`,
83 + emailed: 'Stejné porovnání jsme vám poslali e-mailem.',
84 + notEmailed: 'E-mail se teď nepodařilo odeslat, porovnání má
+te tady.',
85 + usLabel: 'Americký fond',
86 + ucitsLabel: 'Evropská verze, kterou koupíte z Česka',
87 + feeLine: (ter: string, paid: string) => `poplatek ${ter} ·
         +zaplatíte ${paid}`,
88 },
89 } as const
90

⏺ Bash(cat > app/components/ThankYou.vue <<'EOF'

<script setup lang="ts">…)
⎿  Created app/components/ThankYou.vue (+122 -0)
1 +<script setup lang="ts">
2 +import { cs, formatCsDate } from '#shared/content/cs'
3 +import { CALC_ASSUMPTIONS, compareAll, formatCzk } from '#shar
+ed/utils/feeCalc'
4 +import { formatPct } from '#shared/utils/format'
5 +
6 +const submitted = useLead()
7 +const s = submitted.value!
8 +const { allFunds, dataCheckedDate } = useEtfs()
9 +const rows = compareAll(s.monthly, s.years, allFunds)
10 +
11 +const variant = useVariant()
12 +const track = useTrack()
13 +const root = ref<HTMLElement>()
14 +onMounted(() => {
15 + track('thankyou_view', { placement: s.placement, variant, em
+ailed: s.emailed })
16 + root.value?.scrollIntoView({ behavior: 'smooth', block: 'sta
+rt' })
17 + root.value?.focus({ preventScroll: true })
18 +})
19 +</script>

20 +
21 +<template>
22 + <section ref="root" class="thanks" tabindex="-1" aria-labell
+edby="thanks-heading">
23 + <h2 id="thanks-heading" class="heading">{{ cs.thanks.headi
          +ng }}</h2>
24 + <p class="restate">{{ cs.thanks.restate(formatCzk(s.monthl
          +y), s.years) }}</p>
25 + <p class="mail" role="status">{{ s.emailed ? cs.thanks.ema
          +iled : cs.thanks.notEmailed }}</p>
26 +
27 + <ul class="funds">
28 + <li v-for="r in rows" :key="r.ticker" class="fund">
29 + <div class="line">
30 + <span class="ticker">{{ r.ticker }}</span>
31 + <span class="leader" aria-hidden="true" />
32 + <span class="value num">{{ formatCzk(r.endValue) }}<
+/span>
33 + </div>
34 + <p class="small">{{ cs.thanks.usLabel }} · {{ cs.thank
          +s.feeLine(formatPct(r.terPct), formatCzk(r.feesPaid)) }}</p>
35 +
36 + <div class="ucits">
37 + <div class="line">
38 + <span class="ticker">{{ r.ucits.ticker }}</span>
39 + <span class="leader" aria-hidden="true" />
40 + <span class="value num">{{ formatCzk(r.ucits.endVa
          +lue) }}</span>
… 82 more lines (ctrl+o to expand)
⎿  Updated app/pages/index.vue (+5 -2)
5 const variant = useVariant()
6 const track = useTrack()
7 const { pageFunds } = useEtfs()
8 +const submitted = useLead()
9 // Read during setup, so the server-rendered HTML already has t
he right headline (no flash).
10 const h = headline(variant, pageFunds)
11 onMounted(() => track('page_view', { variant }))
...
21 </h1>
22 </header>
23 <Calculator />
23 - <LeadForm placement="top" />
24 + <ThankYou v-if="submitted?.placement === 'top'" />
25 + <LeadForm v-else-if="!submitted" placement="top" />
26 <CompareTable :funds="pageFunds" />
27 <HowToBuy />
26 - <LeadForm placement="bottom" />
28 + <ThankYou v-if="submitted?.placement === 'bottom'" />
29 + <LeadForm v-else-if="!submitted" placement="bottom" />
30 <SiteFooter />
31 </main>
32 </template>
⎿  (timeout 4m)

⏺ Testing in the browser. I'm stubbing /api/lead and blocking PostHog requests
in the test browser, so nothing reaches Supabase or your analytics this time:

Called plugin:playwright:playwright (ctrl+o to expand)

⏺ Both forms are correctly replaced with the thank-you screen, which scrolls
into view and displays the visitor's entered values (5 000 Kč / 30 years); the
"e-mail failed" message is expected since email sending isn't implemented
until part 3. Here's a screenshot confirming this.

Read 1 file (ctrl+o to expand)

⏺ The clipped right and missing left margin suggest the screenshot was captured
mid-scroll rather than an actual overflow, especially since the page itself
reported no horizontal scroll. Let me verify this properly.

Called plugin:playwright:playwright 2 times (ctrl+o to expand)

⏺ No overflow: every section spans 16–364 px inside a 380 px viewport. The
cropped image was a capture taken mid-scroll. The clean screenshot:

Read 1 file (ctrl+o to expand)

⏺ Layout is correct. One tweak: the European-version label is long enough to
push the ISIN onto a second line. Shortening it to "Evropská verze (UCITS)"
and committing:

⏺ Bash(python3 - <<'EOF'
p='shared/content/cs.ts'…)
⎿  Updated shared/content/cs.ts (+1 -1)
83 emailed: 'Stejné porovnání jsme vám poslali e-mailem.',
84 notEmailed: 'E-mail se teď nepodařilo odeslat, porovnání má
te tady.',
85 usLabel: 'Americký fond',
86 - ucitsLabel: 'Evropská verze, kterou koupíte z Česka',
86 + ucitsLabel: 'Evropská verze (UCITS)',
87 feeLine: (ter: string, paid: string) => `poplatek ${ter} ·
          zaplatíte ${paid}`,
88 },
89 } as const
⎿  (timeout 4m)

⏺ Part 2 is committed. Now moving to Part 3—sending the e-mail via Resend; I'll
save the lead first and send the e-mail after, so if sending fails the lead is
still saved, the visitor still sees the thank-you screen, and the error gets
logged. Installing the package now.

⏺ Bash(pnpm add resend 2>&1 | grep -E "^\+|ERR"; grep -n "send("
node_modules/resend/dist/index.d.mts | head -3; grep -n "interface
CreateEmailBaseOptions\|replyTo\|id…)
⎿  Updated package.json (+1 -0)
16 "@supabase/supabase-js": "^2.117.3",
17 "nuxt": "^4.6.1",
18 "posthog-js": "^1.438.10",
19 + "resend": "^6.33.0",
20 "vue": "^3.5.43",
21 "vue-router": "^5.4.0",
22 "zod": "^4.6.7"
⎿  Updated pnpm-lock.yaml (+40 -0)
17 posthog-js:
18 specifier: ^1.438.10
19 version: 1.438.10
20 + resend:
21 + specifier: ^6.33.0
22 + version: 6.33.0
23 vue:
24 specifier: ^3.5.43
25 version: 3.5.44(typescript@5.9.3)
...
888 '@speed-highlight/core@1.2.24':
889 resolution: {integrity: sha512-qeW2e1l78afw8VhRPfPQ1Gjj+KU
5XFQ/OFV5ti6eTa9bruO7mJyZtA4vw0ofqmA3tKCkROE9xLk3VZoeRc98nw==}
890
891 + '@stablelib/base64@1.0.1':
892 + resolution: {integrity: sha512-1bnPQqSxSuc3Ii6MhBysoWCg58j
+97aUjuCSZrGSmDxNqtytIi0k8utUenAwTZN4V5mXXYGsVUI9zeBqy+jBOSQ==}
893 +
894 '@supabase/auth-js@2.117.3':
895 resolution: {integrity: sha512-XOZV+jllcU2Hzij8SwgM78zl0lO
Er6BTjzi2MYkBb39nOAQzb5AelGpMUvVj7lwGSB11JmpAs/FEQroAyFzWEA==}
896 engines: {node: '>=22.0.0'}
...
1616 resolution: {integrity: sha512-99jPl8JkCSCa4VlboNU1XuL98i
jm74Pm9CGo6H4BoMVoVh1uhguQcvwLgXDT8Vkl2qj/UEQ0J9gD8beHjTFk1w=
=}
1617 hasBin: true
1618
1619 + fast-sha256@1.3.0:
1620 + resolution: {integrity: sha512-n11RGP/lrWEFI/bWdygLxhI+pV
+eo1ZYIVwvvPkW7azl/rOy+F3HYRZ2K5zeE9mmkhQppyv9sQFx0JM9UabnpPQ=
+=}
1621 +
1622 fast-string-truncated-width@3.0.3:
1623 resolution: {integrity: sha512-0jjjIEL6+0jag3l2XWWizO64/a
ZVtpiGE3t0Zgqxv0DPuxiMjvB3M24fCyhZUO4KomJQPj3LTSUnDP3GpdwC0g=
=}
1624
...
2288 pkg-types@2.3.3:
2289 resolution: {integrity: sha512-j/lCFdcppV0JxWpCEITdbDltBx
PP6cHT+yNJ6Go2OgoSA9518X847X9z0p6LtA4Nc16+eQzCZjRrWanTGvHJ5w=
=}
2290
2291 + postal-mime@2.7.6:
2292 + resolution: {integrity: sha512-UUlyE2KlxmvwMGq060onF/VWU3
+zD6dVW31FwokQ5v26jWd35fbs2MoTFzh+jXnPwAyV2MULMKXcBInGOl5TO6Q=
+=}
2293 +
2294 postcss-calc@11.2.3:
2295 resolution: {integrity: sha512-pFW3MR2a4W7uHcSGUiyQGGXZWH
on83ljbNwnUJ1mRKublWQbv+3o9NiqhlV4TJfNby+U+zLY2OgiywzhA5eFqw=
=}
2296 engines: {node: ^22.22.3 || ^24.15 || >=26.0}
...
2532 resolution: {integrity: sha512-DJnGAeenTdpMEH6uAJRK/uiyEI
H9WVsUmoLwzudwGJUwZPp80PDBWPHXSAGNPwNvIXAbe7MSUB1zQFugFml66A=
=}
2533 engines: {node: '>=4'}
2534
2535 + resend@6.33.0:
… 66 more lines (ctrl+o to expand)

⏺ Writing the e-mail template test first:

⏺ Bash(cat > server/utils/email.test.ts <<'EOF'
import { describe, expect, test } from 'vitest'…)
⎿  Created server/utils/email.test.ts (+41 -0)
1 +import { describe, expect, test } from 'vitest'
2 +import type { EtfData } from '#shared/types/etf'
3 +import data from '../../data/etfs.json'
4 +import { compareAll, formatCzk } from '#shared/utils/feeCalc'
5 +import { comparisonEmail } from './email'
6 +
7 +const funds = (data as EtfData).funds
8 +const mail = comparisonEmail({ monthly: 5000, years: 30 }, fund
+s)
9 +
10 +describe('comparisonEmail', () => {
11 + test('subject in Czech with the visitor numbers', () => {
12 + expect(mail.subject).toContain('5 000 Kč')
13 + expect(mail.subject).toContain('30 let')
14 + })
15 +
16 + test('all 4 funds and their UCITS versions with the same numb
+ers as the thank-you screen', () => {
17 + for (const r of compareAll(5000, 30, funds)) {
18 + for (const part of [mail.html, mail.text]) {
19 + expect(part).toContain(r.ticker)
20 + expect(part).toContain(r.ucits.ticker)
21 + expect(part).toContain(r.ucits.isin)
22 + expect(part).toContain(formatCzk(r.endValue))
23 + expect(part).toContain(formatCzk(r.feesPaid))
24 + expect(part).toContain(formatCzk(r.ucits.endValue))
25 + }
26 + }
27 + })
28 +
29 + test('assumption, source date and not-advice line present', (
+) => {
30 + for (const part of [mail.html, mail.text]) {
31 + expect(part).toContain('7 % ročně')
32 + expect(part).toContain('14. 10. 2026')
33 + expect(part).toContain('Nejde o investiční doporučení')
34 + }
35 + })
36 +
37 + test('html is escaped (S&P)', () => {
38 + expect(mail.html).not.toMatch(/S&P/)
39 + expect(mail.html).toContain('S&amp;P')
40 + })
… 1 more lines (ctrl+o to expand)

⏺ Bash(cat > shared/utils/etfData.ts <<'EOF'
import type { Etf } from '../types/etf'…)
⎿  Updated app/composables/useEtfs.ts (+2 -2)
1 import type { EtfData } from '#shared/types/etf'
2 +import { latestCheckedDate } from '#shared/utils/etfData'
3 import data from '~~/data/etfs.json'
4
5 const funds = (data as EtfData).funds
6
7 export function useEtfs() {
7 - const checkedDates = funds.flatMap(f => [f.exchange, f.terPct
-, f.aumUsd, f.dividendYieldPct, f.ucits.isin, f.ucits.terPct].m
-ap(v => v.checked))
8 return {
9 allFunds: funds,
10 pageFunds: funds.filter(f => f.showOnPage),
11 - dataCheckedDate: checkedDates.sort().at(-1)!,
11 + dataCheckedDate: latestCheckedDate(funds),
12 }
13 }
⎿  Created server/utils/email.ts (+78 -0)
1 +import type { Etf } from '#shared/types/etf'
2 +import { cs, formatCsDate } from '#shared/content/cs'
3 +import { latestCheckedDate } from '#shared/utils/etfData'
4 +import { CALC*ASSUMPTIONS, compareAll, formatCzk } from '#share
+d/utils/feeCalc'
5 +import { formatPct } from '#shared/utils/format'
6 +
7 +export interface EmailContent {
8 + subject: string
9 + html: string
10 + text: string
11 +}
12 +
13 +const esc = (s: string) =>
14 + s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g,
+'&gt;').replace(/"/g, '&quot;')
15 +
16 +/\*\*
17 + * The comparison promised by the form: all funds + UCITS versi
+ons for the visitor's numbers.
18 + \_ Plain HTML (tables, inline styles) so it renders the same in + Gmail, Seznam and Outlook.
19 + \*/
20 +export function comparisonEmail({ monthly, years }: { monthly:
+number; years: number }, funds: Etf[]): EmailContent {
21 + const rows = compareAll(monthly, years, funds)
22 + const m = formatCzk(monthly)
23 + const subject = cs.email.subject(m, years)
24 + const footer = [
25 + cs.calc.source(formatCsDate(latestCheckedDate(funds))),
26 + cs.calc.assumption(CALC_ASSUMPTIONS.annualReturnPct),
27 + cs.footer.notAdvice,
28 + cs.email.why,
29 + ]
30 +
31 + const td = 'padding:6px 0;border-bottom:1px solid #d9d4c9;ver
+tical-align:top;'
32 + const small = 'font-size:13px;color:#6b675f;'
33 + const fundRows = rows
34 + .map((r) => {
35 + const us = `<tr>
      36 +  <td style="${td}"><strong>${esc(r.ticker)}</strong><br><span
         +style="${small}">${esc(cs.thanks.usLabel)} · ${esc(cs.thanks.fe
         +eLine(formatPct(r.terPct), formatCzk(r.feesPaid)))}</span></td>
      37 +  <td style="${td}text-align:right;white-space:nowrap;"><strong
         +>${esc(formatCzk(r.endValue))}</strong></td>
      38 +</tr>`
39 + const eu = `<tr>
      40 +  <td style="${td}padding-left:16px;"><strong>${esc(r.ucits.tic
         +ker)}</strong> <span style="${small}">ISIN ${esc(r.ucits.isin)}
         +</span><br><span style="${small}">${esc(cs.thanks.ucitsLabel)}
         +· ${esc(cs.thanks.feeLine(formatPct(r.ucits.terPct), formatCzk(
         +r.ucits.feesPaid)))}</span></td>
     … 38 more lines (ctrl+o to expand)
  ⎿  Updated shared/content/cs.ts (+8 -0)
      77        network: 'Nepodařilo se spojit se serverem. Zkontrolujte
          připojení a zkuste to znovu.',
      78      },
      79    },
      80 +  email: {
      81 +    subject: (monthly: string, years: number) => `Porovnání S&P + 500 ETF: ${monthly} měsíčně, ${years} let`,
      82 +    heading: 'Vaše porovnání S&P 500 ETF',
      83 +    intro: (monthly: string, years: number) =>
      84 +      `Pro ${monthly} měsíčně po dobu ${years} let. U každého a
+merického fondu je i jeho evropská (UCITS) verze, kterou koupít
+e u brokera z Česka.`,
      85 +    endValue: 'Za tu dobu budete mít',
      86 +    why: 'Tento e-mail jste dostali, protože jste si porovnání
         +vyžádali na naší stránce. Nic dalšího vám bez souhlasu posílat
         +nebudeme. Pokud chcete svůj e-mail smazat, odpovězte na tuto zp
         +rávu.',
      87 +  },
      88    thanks: {
      89      heading: 'Děkujeme. Tady je celé porovnání.',
      90      restate: (monthly: string, years: number) => `Pro ${monthly
} měsíčně po dobu ${years} let.`,
⎿  Created shared/utils/etfData.ts (+9 -0)
1 +import type { Etf } from '../types/etf'
2 +
3 +/** Latest `checked` date across every figure, "YYYY-MM-DD". Sho
+wn as "ověřeno …" on the page and in the e-mail. \*/
4 +export function latestCheckedDate(funds: Etf[]): string {
5 + return funds
6 + .flatMap(f => [f.exchange, f.terPct, f.aumUsd, f.dividendYie
+ldPct, f.ucits.isin, f.ucits.terPct].map(v => v.checked))
7 + .sort()
8 + .at(-1)!
9 +}
⏺ Template tests pass (56). Now the sending code, the route change and config:

⏺ Bash(cat > server/utils/resend.ts <<'EOF'
import { Resend } from 'resend'…)
⎿  Updated .env.example (+5 -5)
2 NUXT\*SUPABASE_URL=
3 NUXT_SUPABASE_SERVICE_KEY=
4
5 -# PostHog (Task 4)
5 +# PostHog, EU project. Empty key = no tracking (events only log
+ged in the browser console).
6 NUXT_PUBLIC_POSTHOG_KEY=
7 -NUXT_PUBLIC_POSTHOG_HOST=
7 +NUXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
8
9 -# Resend (Task 5)
10 -RESEND_API_KEY=
11 -MAIL_FROM=
9 +# Resend (server only). Sender must be on a domain verified in
+Resend, e.g. "Porovnání ETF <porovnani@vasedomena.cz>".
10 +NUXT_RESEND_API_KEY=
11 +NUXT_MAIL_FROM=
⎿  Updated nuxt.config.ts (+3 -0)
37 // Server only. Set via NUXT_SUPABASE_URL / NUXT_SUPABASE_S
ERVICE_KEY.
38 supabaseUrl: '',
39 supabaseServiceKey: '',
40 + // Server only. Set via NUXT_RESEND_API_KEY / NUXT_MAIL_FRO
+M (e.g. "Porovnání ETF <porovnani@vasedomena.cz>").
41 + resendApiKey: '',
42 + mailFrom: '',
43 public: {
44 // Set via NUXT_PUBLIC_POSTHOG_KEY. Empty = no tracking,
events only logged with console.debug.
45 posthogKey: '',
⎿  Updated server/api/lead.post.ts (+5 -1)
1 import { LeadError, parseLead } from '../utils/lead'
2 +import { sendComparisonEmail } from '../utils/resend'
3 import { upsertLead } from '../utils/supabase'
4
5 export default defineEventHandler(async (event) => {
...
30 return { ok: false, error: 'storage' }
31 }
32
33 + // Only after the lead is saved. A failed e-mail never fails
+the request.
34 + const emailed = await sendComparisonEmail(lead)
35 +
36 setResponseStatus(event, 201)
33 - return { ok: true, emailed: false }
37 + return { ok: true, emailed }
38 })
⎿  Created server/utils/resend.ts (+40 -0)
1 +import { Resend } from 'resend'
2 +import type { EtfData } from '#shared/types/etf'
3 +import data from '../../data/etfs.json'
4 +import { comparisonEmail } from './email'
5 +import type { Lead } from './lead'
6 +
7 +const SEND_TIMEOUT_MS = 8000
8 +
9 +let client: Resend | undefined
10 +
11 +/\*_
12 + _ Sends the full comparison. Never throws: returns false and l
+ogs on any failure,
13 + _ because the lead is already saved and the thank-you screen s
+hows the same comparison.
14 + _ Logs never contain the e-mail address.
15 + \*/
16 +export async function sendComparisonEmail(lead: Lead): Promise<
+boolean> {
17 + const { resendApiKey, mailFrom } = useRuntimeConfig()
18 + if (!resendApiKey || !mailFrom) {
19 + console.error('[email] not sent: NUXT_RESEND_API_KEY or NUX
+T_MAIL_FROM missing')
20 + return false
21 + }
22 + client ??= new Resend(resendApiKey)
23 +
24 + const { subject, html, text } = comparisonEmail(lead, (data a
+s EtfData).funds)
25 + try {
26 + const timeout = new Promise<never>((\*, reject) =>
27 + setTimeout(() => reject(new Error(`timeout after ${SEND_T
         +IMEOUT_MS} ms`)), SEND_TIMEOUT_MS),
28 + )
29 + const { error } = await Promise.race([client.emails.send({
+from: mailFrom, to: lead.email, subject, html, text }), timeout
+])
30 + if (error) {
31 + console.error(`[email] Resend error: ${error.name} ${erro
         +r.statusCode ?? ''} ${error.message}`)
32 + return false
33 + }
34 + return true
35 + }
36 + catch (e) {
37 + console.error('[email] send failed:', e instanceof Error ?
+e.message : e)
38 + return false
39 + }
40 +}
⎿  (timeout 4m)

⏺ Typecheck and tests pass. Since there's no Resend key in .env yet, I'll test
the failure path live—confirming the lead saves, emailed: false is returned,
and nothing breaks—then delete the resulting test row from the Supabase leads
table.

Ran 1 shell command (ctrl+o to expand)

⏺ The failure path checks out—the lead saved correctly, the response showed
emailed: false, and I cleaned up the test row. Now I'll render the email at
phone width using a throwaway script to visually verify it.

Ran 1 shell command (ctrl+o to expand)

⏺ The plain-text version reads "(Evropská verze (UCITS), poplatek …)", which has
nested brackets. Switching to "·" separators, then rendering the HTML version
at 380 px:

⏺ Bash(python3 - <<'EOF'
p='server/utils/email.ts'…)
⎿  Updated server/utils/email.ts (+2 -2)
67 '',
68 `${cs.email.endValue}:`,
69 ...rows.flatMap(r => [
70 - `${r.ticker}: ${formatCzk(r.endValue)} (${cs.thanks.usLab
-el}, ${cs.thanks.feeLine(formatPct(r.terPct), formatCzk(r.feesP
-aid))})`,
71 - ` ${r.ucits.ticker} (ISIN ${r.ucits.isin}): ${formatCzk(
-r.ucits.endValue)} (${cs.thanks.ucitsLabel}, ${cs.thanks.feeLin
-e(formatPct(r.ucits.terPct), formatCzk(r.ucits.feesPaid))})`,
70 + `${r.ticker}: ${formatCzk(r.endValue)} · ${cs.thanks.usLa
+bel} · ${cs.thanks.feeLine(formatPct(r.terPct), formatCzk(r.fee
+sPaid))}`,
71 + ` ${r.ucits.ticker}: ${formatCzk(r.ucits.endValue)} · ${
+cs.thanks.ucitsLabel}, ISIN ${r.ucits.isin} · ${cs.thanks.feeLi
+ne(formatPct(r.ucits.terPct), formatCzk(r.ucits.feesPaid))}`,
72 ]),
73 '',
74 ...footer,

Read 1 file, called plugin:playwright:playwright 2 times (ctrl+o to expand)

⏺ file: URLs are blocked in this browser, so I'll load the HTML into the page
directly:

Read 1 file, called plugin:playwright:playwright 3 times, ran 2 shell commands (ctrl+o to expand)

⏺ That's the earlier screenshot of the landing page again; the image viewer
cached the old file under the same name. Saving under a new name:

Read 1 file, called plugin:playwright:playwright (ctrl+o to expand)

⏺ The e-mail reads well at phone width. Stopping the preview server and
committing part 3:

Ran 1 shell command (ctrl+o to expand)

⏺ Part 3 committed (14e8a72).

Part 4: /ads/README.md. The target URLs need the production domain, so I'm
checking which Vercel address actually serves this site:

Ran 1 shell command (ctrl+o to expand)

⏺ etf-landing.vercel.app belongs to someone else's project. The repo's homepage
field says etf-landing-tau.vercel.app. Checking that one:

Searched for 1 pattern, ran 1 shell command (ctrl+o to expand)

⏺ I've written the ad file targeting https://etf-landing-tau.vercel.app, and
confirmed Ad A's "16 000 Kč" claim checks out since the body text correctly
bases it on the 3 000 Kč/month figure.

⏺ Bash(mkdir -p ads && cat > ads/README.md <<'EOF' # Ads…)
⎿  Updated README.md (+1 -1)
47
48 Ad and page use the same headline word for word. The 16 000 Kč
in A is SPY's fees at the calculator defaults (3 000 Kč a month
, 20 years), computed from `/data/etfs.json` and rounded down;
a unit test fails if the data ever changes it.
49
50 -The page reads the `?v=a` / `?v=b` URL parameter and switches t
-he headline. Default without the parameter is version A. Full a
-d texts are in [`/ads`](./ads).
50 +The page reads the `?v=a` / `?v=b` URL parameter and switches t
+he headline. Default without the parameter is version A. Full a
+d texts are in [`/ads/README.md`](./ads/README.md).
51
52 ## 5. Page structure
53
⎿  Created ads/README.md (+29 -0)
1 +# Ads
2 +
3 +Two versions with two different promises. The page headline mat
+ches the ad word for word; the page picks it from `?v=a` / `?v=
         +b` (no or unknown parameter → A).
4 +
5 +Format: Meta (Facebook / Instagram) feed ad, mobile. The CTA is + one of Meta's fixed buttons.
6 +
7 +## Version A: fees
8 +
9 +**Promise:** the visitor sees what the fee costs them in crowns
+, not in percent, and gets the number for their own monthly amo
+unt in seconds.
10 +
11 +| Field | Text + |
12 +| ---------- | ------------------------------------------------
+------------------------------------------------------------ |
13 +| Headline | Kolik vás stojí poplatek ETF? U SPY za 20 let př
+es 16 000 Kč. |
14 +| Text | Při 3 000 Kč měsíčně zaplatíte u SPY za 20 let n
+a poplatcích přes 16 000 Kč. Spočítejte si to pro svou částku.
+|
15 +| CTA | Zjistit více + |
16 +| Target URL | https://etf-landing-tau.vercel.app/?v=a + |
17 +
18 +The 16 000 Kč is SPY's fees at 3 000 Kč a month for 20 years wi
+th 7 % return before fees (16 237 Kč, rounded down). It is comp
+uted from `/data/etfs.json`; `shared/content/headline.test.ts`
+fails if a data change moves it, and then this text must change + too.
19 +
20 +## Version B: choice
21 +
22 +**Promise:** the three best-known S&P 500 ETFs hold the same in
+dex, so the visitor learns that the fee (and which version they + can buy from CZ) is the only real difference.
23 +
24 +| Field | Text + + |
25 +| ---------- | ------------------------------------------------
+---------------------------------------------------------------
+---------- |
26 +| Headline | Který S&P 500 ETF si vybrat? Stejný index, jiné
+poplatky. + |
27 +| Text | SPY, VOO a IVV kopírují stejný index. Liší se po
+platkem a tím, kterou verzi koupíte u českého brokera. Porovnán
+í na jedné obrazovce. |
28 +| CTA | Zjistit více + + |
29 +| Target URL | https://etf-landing-tau.vercel.app/?v=b + + |

⏺ Commit security review found: abuse/email-bombing in server/api/lead.post.ts

⏺ The security review flagged that /api/lead could be abused to spam any address
repeatedly, risking the sending domain's reputation once Resend is
configured. I'll fix this by adding a per-address 10-minute cooldown that
still updates the lead but skips sending a duplicate e-mail, along with tests
for it.

⏺ Bash(cat >> server/utils/lead.test.ts <<'EOF'…)
⎿  Updated server/api/lead.post.ts (+6 -3)
1 -import { LeadError, parseLead } from '../utils/lead'
1 +import { LeadError, emailCooldownActive, parseLead } from '../ut
+ils/lead'
2 import { sendComparisonEmail } from '../utils/resend'
3 import { upsertLead } from '../utils/supabase'
4
...
20 return { ok: false, error: e instanceof LeadError ? e.code
: 'invalid*input' }
21 }
22
23 + let previousUpdatedAt: string | null
24 try {
24 - await upsertLead(lead)
25 + previousUpdatedAt = await upsertLead(lead)
26 }
27 catch (e) {
28 // Lead not saved: tell the client so the user can retry in
stead of a false "thank you".
...
32 }
33
34 // Only after the lead is saved. A failed e-mail never fails
the request.
34 - const emailed = await sendComparisonEmail(lead)
35 + let emailed = false
36 + if (emailCooldownActive(previousUpdatedAt)) console.warn('[em
+ail] skipped: same address submitted within the cooldown')
37 + else emailed = await sendComparisonEmail(lead)
38
39 setResponseStatus(event, 201)
40 return { ok: true, emailed }
⎿  Updated server/utils/lead.test.ts (+14 -1)
1 import { describe, expect, test } from 'vitest'
2 -import { LeadError, parseLead } from './lead'
2 +import { LeadError, emailCooldownActive, parseLead } from './lea
+d'
3
4 const ok = { email: 'jan@example.cz', monthly: 3000, years: 20,
variant: 'a' }
5
...
59 expect(parseLead({ ...ok, website: '' })).toEqual(ok)
60 })
61 })
62 +
63 +describe('emailCooldownActive', () => {
64 + const now = new Date('2026-10-15T12:00:00Z')
65 + test('first submit (no previous row) → send', () => {
66 + expect(emailCooldownActive(null, now)).toBe(false)
67 + })
68 + test('same e-mail 5 minutes ago → skip', () => {
69 + expect(emailCooldownActive('2026-10-15T11:55:00Z', now)).to
+Be(true)
70 + })
71 + test('same e-mail 11 minutes ago → send', () => {
72 + expect(emailCooldownActive('2026-10-15T11:49:00Z', now)).to
+Be(false)
73 + })
74 +})
⎿  Updated server/utils/lead.ts (+9 -0)
35
36 return { email: email.data, ...input.data, variant: normalize
Variant(b.variant) }
37 }
38 +
39 +/\*\* One comparison e-mail per address per this window, so the f
+orm can't be used to flood someone's inbox. */
40 +export const EMAIL*COOLDOWN_MS = 10 * 60 \* 1000
41 +
42 +/\*\* `previousUpdatedAt` = updated_at of the existing row before + this submit, or null for a new address. \*/
43 +export function emailCooldownActive(previousUpdatedAt: string | + null, now = new Date()): boolean {
44 + if (!previousUpdatedAt) return false
45 + return now.getTime() - new Date(previousUpdatedAt).getTime()
+< EMAIL_COOLDOWN_MS
46 +}
⎿  Updated server/utils/resend.ts (+5 -3)
23
24 const { subject, html, text } = comparisonEmail(lead, (data a
s EtfData).funds)
25 try {
26 - const timeout = new Promise<never>((*, reject) =>
27 - setTimeout(() => reject(new Error(`timeout after ${SEND_T
         -IMEOUT_MS} ms`)), SEND*TIMEOUT_MS),
28 - )
26 + let timer: ReturnType<typeof setTimeout> | undefined
27 + const timeout = new Promise<never>((*, reject) => {
28 + timer = setTimeout(() => reject(new Error(`timeout after
         +${SEND_TIMEOUT_MS} ms`)), SEND_TIMEOUT_MS)
29 + })
30 const { error } = await Promise.race([client.emails.send({
from: mailFrom, to: lead.email, subject, html, text }), timeout
])
31 + .finally(() => clearTimeout(timer))
32 if (error) {
33 console.error(`[email] Resend error: ${error.name} ${erro
          r.statusCode ?? ''} ${error.message}`)
34 return false
⎿  Updated server/utils/supabase.ts (+9 -2)
13 return client
14 }
15
16 -/** Insert, or update monthly/years/variant when the e-mail alr
-eady exists. created_at stays from the first submit. \*/
17 -export async function upsertLead(lead: Lead): Promise<void> {
16 +/**
17 + * Insert, or update monthly/years/variant when the e-mail alre
+ady exists. created*at stays from the first submit.
18 + * Returns the row's previous updated_at (null for a new addres
+s), used for the e-mail cooldown.
19 + \*/
20 +export async function upsertLead(lead: Lead): Promise<string |
+null> {
21 + const prev = await supabase().from('leads').select('updated_a
+t').eq('email', lead.email).maybeSingle()
22 + if (prev.error) throw new Error(`Supabase select failed: ${pr
         +ev.error.message}`)
23 +
24 const { error } = await supabase()
25 .from('leads')
26 .upsert({ ...lead, updated_at: new Date().toISOString() },
{ onConflict: 'email' })
27 if (error) throw new Error(`Supabase upsert failed: ${error.m
          essage}`)
28 + return prev.data?.updated_at ?? null
29 }
⎿  (timeout 4m)

⏺ Tests and typecheck pass. One live run to make sure the extra database lookup
works, again with a test address that I delete afterwards:

Ran 1 shell command (ctrl+o to expand)

⏺ Both submits returned 201 with no error, and the test row is deleted.
Committing the fix, then pushing:

Ran 1 shell command (ctrl+o to expand)

⏺ Pushed. Watching for Vercel's production deployment of 739121c (it usually
takes 1–2 minutes):

Ran 1 shell command (ctrl+o to expand)

⏺ Commit security review found 2 issues: information-disclosure (membership
oracle) in server/api/lead.post.ts; race-condition / TOCTOU (anti-abuse control
bypass) in server/utils/supabase.ts

⏺ No deployment record for this commit after 5 minutes. Checking the most recent
deployments directly:

Ran 1 shell command (ctrl+o to expand)

⏺ The deployment succeeded at 17:05. My polling filtered on the short commit
hash, which GitHub doesn't match. Checking that production serves the new
version:

Ran 1 shell command (ctrl+o to expand)

⏺ The second security review found the cooldown can be bypassed by concurrent
requests and leaks whether an address was recently submitted via the emailed:
false response. I'll implement an atomic database update using a new column to
fix this, commit the change, but hold off pushing until you've added the
column.
Read 1 file (ctrl+o to expand)

⏺ Bash(cat > supabase/002-emailed-at.sql <<'EOF'
-- Run once in the Supabase SQL editor (after leads.sql).…)
⎿  Updated server/api/lead.post.ts (+18 -6)
1 -import { LeadError, emailCooldownActive, parseLead } from '../ut
-ils/lead'
1 +import { LeadError, parseLead } from '../utils/lead'
2 import { sendComparisonEmail } from '../utils/resend'
3 -import { upsertLead } from '../utils/supabase'
3 +import { claimEmailSlot, releaseEmailSlot, upsertLead } from '..
+/utils/supabase'
4
5 export default defineEventHandler(async (event) => {
6 const body = await readBody(event).catch(() => null)
...
20 return { ok: false, error: e instanceof LeadError ? e.code
: 'invalid*input' }
21 }
22
23 - let previousUpdatedAt: string | null
23 try {
25 - previousUpdatedAt = await upsertLead(lead)
24 + await upsertLead(lead)
25 }
26 catch (e) {
27 // Lead not saved: tell the client so the user can retry in
stead of a false "thank you".
...
32
33 // Only after the lead is saved. A failed e-mail never fails
the request.
34 let emailed = false
36 - if (emailCooldownActive(previousUpdatedAt)) console.warn('[em
-ail] skipped: same address submitted within the cooldown')
37 - else emailed = await sendComparisonEmail(lead)
35 + try {
36 + if (await claimEmailSlot(lead.email)) {
37 + emailed = await sendComparisonEmail(lead)
38 + if (!emailed) await releaseEmailSlot(lead.email)
39 + }
40 + else {
41 + // A comparison was sent to this address within the coold
+own (failed sends release the slot).
42 + // Answer exactly like a fresh send, so the response does + not reveal that the address was used.
43 + emailed = true
44 + console.warn('[email] skipped: address e-mailed within th
+e cooldown')
45 + }
46 + }
47 + catch (e) {
48 + console.error('[email] cooldown check failed:', e instanceo
+f Error ? e.message : e)
49 + }
50
51 setResponseStatus(event, 201)
… 1 more lines (ctrl+o to expand)
⎿  Updated server/utils/lead.test.ts (+1 -13)
1 import { describe, expect, test } from 'vitest'
2 -import { LeadError, emailCooldownActive, parseLead } from './lea
-d'
2 +import { LeadError, parseLead } from './lead'
3
4 const ok = { email: 'jan@example.cz', monthly: 3000, years: 20,
variant: 'a' }
5
...
60 })
61 })
62
63 -describe('emailCooldownActive', () => {
64 - const now = new Date('2026-10-15T12:00:00Z')
65 - test('first submit (no previous row) → send', () => {
66 - expect(emailCooldownActive(null, now)).toBe(false)
67 - })
68 - test('same e-mail 5 minutes ago → skip', () => {
69 - expect(emailCooldownActive('2026-10-15T11:55:00Z', now)).to
-Be(true)
70 - })
71 - test('same e-mail 11 minutes ago → send', () => {
72 - expect(emailCooldownActive('2026-10-15T11:49:00Z', now)).to
-Be(false)
73 - })
74 -})
⎿  Updated server/utils/lead.ts (+0 -6)
38
39 /\*\* One comparison e-mail per address per this window, so the f
orm can't be used to flood someone's inbox. */
40 export const EMAIL*COOLDOWN_MS = 10 * 60 \* 1000
41 -
42 -/** `previousUpdatedAt` = updated*at of the existing row before - this submit, or null for a new address. */
43 -export function emailCooldownActive(previousUpdatedAt: string | - null, now = new Date()): boolean {
44 - if (!previousUpdatedAt) return false
45 - return now.getTime() - new Date(previousUpdatedAt).getTime()
-< EMAIL*COOLDOWN_MS
46 -}
⎿  Updated server/utils/supabase.ts (+26 -10)
1 import { createClient, type SupabaseClient } from '@supabase/sup
abase-js'
2 -import type { Lead } from './lead'
2 +import { EMAIL_COOLDOWN_MS, type Lead } from './lead'
3
4 let client: SupabaseClient | undefined
5
...
13 return client
14 }
15
16 -/\*\*
17 - * Insert, or update monthly/years/variant when the e-mail alre
-ady exists. created*at stays from the first submit.
18 - * Returns the row's previous updated*at (null for a new addres
-s), used for the e-mail cooldown.
19 - */
20 -export async function upsertLead(lead: Lead): Promise<string |
-null> {
21 - const prev = await supabase().from('leads').select('updated_a
-t').eq('email', lead.email).maybeSingle()
22 - if (prev.error) throw new Error(`Supabase select failed: ${pr
         -ev.error.message}`)
23 -
16 +/** Insert, or update monthly/years/variant when the e-mail alr
+eady exists. created*at stays from the first submit. \*/
17 +export async function upsertLead(lead: Lead): Promise<void> {
18 const { error } = await supabase()
19 .from('leads')
20 .upsert({ ...lead, updated_at: new Date().toISOString() },
{ onConflict: 'email' })
21 if (error) throw new Error(`Supabase upsert failed: ${error.m
          essage}`)
28 - return prev.data?.updated_at ?? null
22 +}
23 +
24 +/\*\*
25 + * Atomically claims the right to e-mail this address: one UPDA
+TE that only matches when no e-mail
26 + _ went out within the cooldown. Postgres locks the row and re-
+checks the condition, so of several
27 + _ parallel requests exactly one gets `true`.
28 + \_/
29 +export async function claimEmailSlot(email: string): Promise<bo
+olean> {
30 + const cutoff = new Date(Date.now() - EMAIL_COOLDOWN_MS).toISO
+String()
31 + const { data, error } = await supabase()
32 + .from('leads')
33 + .update({ emailed_at: new Date().toISOString() })
34 + .eq('email', email)
35 + .or(`emailed_at.is.null,emailed_at.lt.${cutoff}`)
36 + .select('id')
37 + if (error) throw new Error(`Supabase claim failed: ${error.me
         +ssage}`)
… 8 more lines (ctrl+o to expand)
⎿  Created supabase/002-emailed-at.sql (+4 -0)
1 +-- Run once in the Supabase SQL editor (after leads.sql).
2 +-- When the comparison e-mail last went out to this address. Use
+d for the 10-minute cooldown:
3 +-- one atomic UPDATE claims the slot, so parallel requests canno
+t all send.
4 +alter table public.leads add column if not exists emailed_at tim
+estamptz;
⎿  … 1 more file changed
⎿  (timeout 4m)

⏺ Typecheck and tests pass. Checking whether the column exists in your database
yet (read only):

Called plugin:playwright:playwright, ran 1 shell command (ctrl+o to expand)

⏺ Production is deployed: 739121c finished on Vercel at 17:05 and
https://etf-landing-tau.vercel.app serves it. Both headlines are correct (?v=a
and ?v=b) and the form API answers. I didn't submit a real lead on
production, so check that NUXT_SUPABASE_URL, NUXT_SUPABASE_SERVICE_KEY and
NUXT_PUBLIC_POSTHOG_KEY are set in Vercel.

One security fix, 4416184, is committed but not pushed: it needs a database
column you add first (see "To do" below).

What was built (one commit each):

1. Headline per ad (4edf22c): ?v= didn't switch anything before; now it does.
   A: "Kolik vás stojí poplatek ETF? U SPY za 20 let přes 16 000 Kč." B:
   "Který S&P 500 ETF si vybrat? Stejný index, jiné poplatky." The 16 000 Kč
   is computed from the data (SPY's fees at 3 000 Kč / 20 years are 16 237
   Kč), and a test pins your exact sentence. I updated README §4 to match.
2. Thank-you screen (f950c91): replaces both forms and appears where the
   visitor submitted. It shows all 4 funds and their European versions, with
   end value and fees paid for the amount and years at the moment they
   submitted. thankyou_view now fires from here.
3. E-mail via Resend (14e8a72): the lead is saved first, then the comparison
   is sent. A failed or unconfigured send is logged, the visitor still gets
   the thank-you screen, and the screen says the e-mail didn't go out. I
   tested this against your Supabase with a test address and deleted the test
   rows afterwards. No real e-mail has been sent, since there's no Resend key
   yet.
4. /ads/README.md (61ebf32): both ads with headline, text, CTA "Zjistit více"
   (a standard Meta button) and the target URLs. Ad A's text says "Při 3 000
   Kč měsíčně…" so the 16 000 Kč isn't read as applying to any amount.

Security fixes: a background security review flagged that the form could be
scripted to flood any inbox through your sending domain. 739121c (deployed)
added a 10-minute limit per address. A second review found two weaknesses in
that limit:

- parallel requests could get past it, and
- the response revealed whether an address had been used recently.

4416184 fixes both. The "may we send now" check is now a single database
update that only one request can win, and a blocked request gets the same
answer as a successful send. Within those 10 minutes the thank-you screen says
the comparison was e-mailed, even if the visitor changed the numbers since.
Until that commit is live, the deployed limit is the weaker one; it only
matters once Resend is set up.

To do:

1. Run supabase/002-emailed-at.sql in the Supabase SQL editor (one line, adds
   the emailed_at column). Then tell me and I'll push. If it's pushed without
   the column, nothing breaks, but no e-mails are sent.
2. Set up Resend:
   - Sign up at resend.com.
   - Go to Domains → Add domain. Use a domain you own; a subdomain like
     mail.yourdomain.cz works well.
   - Add the DNS records Resend shows you (SPF and DKIM) at your DNS provider,
     then click Verify. Without a verified domain, Resend only delivers to
     your own account address, which is enough for testing only.
   - Go to API Keys and create a key with Sending access limited to that
     domain.
   - In Vercel → Settings → Environment Variables (Production), set:
     - NUXT_RESEND_API_KEY
     - NUXT_MAIL_FROM, e.g. Porovnání ETF <porovnani@yourdomain.cz>
   - Redeploy; Vercel only applies new environment variables on the next
     deploy.
   - Add the same two variables to your local .env.
3. The e-mail tells people to reply to get their address deleted, so the
   sender address has to actually receive mail. If it can't, I can add a
   separate reply-to address.

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/README.md in the IDE. This may or may not be
related to the current task.</ide_opened_file>

❯ The emailed_at column is added, Resend is set up, and all env vars
are in Vercel and .env. Finish the project:

1. Push 4416184 and tell me when production is deployed.

2. Finish README.md. Remove every TODO. Write in plain, short English
   sentences, first person ("I"). Do not invent anything that did
   not happen.
   - Live page URL: https://etf-landing-tau.vercel.app
   - Section 7: fill the table with the 4 funds (TER, UCITS ticker +
     ISIN, issuer link) from data/etfs.json. "Calculation": 7 % a
     year minus TER, monthly compounding, deposit at the end of each
     month, no taxes, broker fees or currency conversion; the
     spreadsheet formula; tests in shared/utils/feeCalc.test.ts.
   - Section 8: PostHog text as it is now, plus Resend for the
     e-mail and the per-address send limit.
   - Section 11: add rows for: VOO exchange verified on nyse.com;
     one consent sentence instead of a checkbox; self-hosted fonts;
     analytics without cookies; if Resend fails, the lead is still
     saved and the page still shows the comparison.
   - Section 12 "Process": replace the first sentence with: "Before
     writing code I worked out the decisions in sections 2–6
     (audience, offer, ads, page order) in a separate Claude chat,
     then read and edited them myself. That README was the brief for
     Claude Code. I asked for a plan first, not code, answered the
     agent's questions, and built it step by step, one commit per
     step."
   - Section 12 "Instructions the agents got": 5–7 bullets, one per
     step, each with a link to the matching file in ai-log/.
   - Section 12 "How I checked the output": keep what is true. I
     checked every ETF value against issuer pages saved as PDF, the
     calculator against an independent calculation (1 517 433 Kč for
     3 000 Kč / 20 years), events in PostHog, rows in Supabase.
     Lighthouse mobile 92/100/100/100.
   - Section 12 "Where the AI got it wrong": a table with these rows
     (what happened | how it was found | what I did):
     - My prompt said Nuxt 3, repo is Nuxt 4 | agent asked | kept 4
     - Plan promised an e-mail but no step sent one | agent asked |
       added Resend step
     - Slider always has a value, calc_result would fire on load |
       agent pointed it out | result hidden until first change
     - SPLG renamed to SPYM on 2025-10-31 | agent found the redirect
       | I confirmed in SSGA's notice, kept SPYM
     - Vanguard blocks headless browsers | agent reported it instead
       of guessing | I filled VOO from the saved page
     - I pasted VOO values into the IVV record | re-reading notes |
       fixed; the check script cannot catch this
     - Ad A promised "tens of thousands", calculator shows 11 061 Kč
       at 3 000 / 20 years | I compared ad and output | changed the
       ad, added total fees per fund
     - Google Fonts send the visitor IP to Google | agent flagged it
       | self-hosted fonts
     - My "latin-ext only" font instruction would break á, é, í |
       agent corrected me | both subsets
     - ?v=a/b did not switch the headline | found when I asked to
       check | fixed, covered by a test
     - Lighthouse performance 71, PostHog loaded first | Lighthouse
       | PostHog after load with an event queue, now 92
     - Form could flood any inbox | separate security review |
       per-address limit; second review found a race, fixed with
       one atomic DB update
   - Section 13 "What is missing": real phone test notes (leave one
     line "Tested on my phone: …" for me to fill), privacy policy
     page, automatic data refresh, no real traffic so the conversion
     estimate and A/B hypotheses are untested, anything else from
     PLAN.md that was not built.
   - Section 14: real install/run commands (pnpm), list of env vars
     from .env.example, SQL files to run.
   - Repository layout: match the real folders.

3. Check that every link in README works and that no TODO is left.
   Commit as "docs: finish README" and push.

Tell me the commit hash and anything you could not fill in.

⏺ Checking the column exists before pushing, then pushing 4416184:

Ran 1 shell command (ctrl+o to expand)

⏺ Column exists. master is no longer ahead of origin, so 4416184 appears to be
pushed already (by you?). README.md also has uncommitted changes of yours.
Confirming and checking its deployment:

Ran 1 shell command (ctrl+o to expand)

⏺ 4416184 is already pushed and its production deployment succeeded at 17:21.
Now the README. Reading your uncommitted edits and the full current file:

Read 1 file, ran 1 shell command (ctrl+o to expand)

⏺ Most of section 12 is already in your edits. I'll keep your wording and fill
in the rest. Checking the files the README links to:

Ran 1 shell command (ctrl+o to expand)

⏺ ai-log/ has only 3 exports: 02-data.md, 04-lead-form.md and 05-analytics.md.
Checking what each covers so the links are right:

Ran 3 shell commands (ctrl+o to expand)

⏺ I have everything needed—exports covering plan/data, calculator/lead form, and
analytics, with design-onward steps not yet exported. Now writing the README,
preserving your original wording and only fixing sentences that no longer
match the code.

⏺ Write(README.md)
⎿  Added 102 lines, removed 54 lines
2
3 Lead-generation landing page that compares NYSE-listed S&P 500 E
TFs for a Czech retail investor. Built with Nuxt, deployed on Ve
rcel.
4
5 -- Live page: https://etf-landing-tau.vercel.app/
6 -- Ad versions: [`/ads`](./ads)
5 +- Live page: https://etf-landing-tau.vercel.app (ad versions: [`
        +?v=a`](https://etf-landing-tau.vercel.app/?v=a), [`?v=b`](https:
+//etf-landing-tau.vercel.app/?v=b))
6 +- Ad versions: [`/ads/README.md`](./ads/README.md)
7 - AI conversation exports: [`/ai-log`](./ai-log)
8
9 ## 1. Assignment in short
...
26
27 ## 3. The offer (lead magnet)
28
29 -**Before any contact:** a fee calculator. He types how much he
-invests per month and for how many years. The page immediately
-shows how much the fees of 3 ETFs eat from his money over that
-time, in CZK. No form, no scrolling.
29 +**Before any contact:** a fee calculator. He sets how much he i
+nvests per month and for how many years. The page immediately s
+hows how much the fees of 3 ETFs eat from his money over that t
+ime, in CZK. No form, no scrolling.
30
31 -**In exchange for the contact:** the full comparison of the ETF
-s (fees, size, dividends, where to buy them from the Czech Repu
-blic) with his numbers from the calculator, sent by e-mail. The - page shows 3 funds for free, the e-mail has all of them.
31 +**In exchange for the contact:** the full comparison of all 4 f
+unds and their European (UCITS) versions with his numbers from
+the calculator, sent by e-mail. The page shows 3 funds for free
+, the e-mail has all of them.
32
33 **When I ask for the contact:** right under the calculator resu
lt. At that moment he has already got a concrete number about h
is own money, so the request is not the first thing he sees. As
king before the result would kill most visits.
34
35 -**Form fields:** only e-mail. The amount and years are already
-known from the calculator, so I do not ask for them again. Name - is not needed for sending a PDF.
35 +**Form fields:** only e-mail. The amount and years are already
+known from the calculator, so I do not ask for them again. A na
+me is not needed for sending the comparison.
36
37 **After submit:** the thank-you screen shows the full compariso
n straight away and says the same thing is in his inbox. Nobody
should have to leave the page and go check e-mail to get what
he was promised.
38
...
51
52 ## 5. Page structure
53
54 -| # | Section - | What it does for the visitor - | Why here - |
55 -| --- | ------------------------------------------------------
------------- | -----------------------------------------------
------------------------------- | -----------------------------
------------------------------------------ |
56 -| 1 | Headline + calculator - | Continues the ad promise and gives him somethin
-g to do in the first 3 seconds | He came for one thing, so it
-is the first thing on the screen |
57 -| 2 | Result - | Shows the fee difference in CZK for his own num
-bers | This is the value. Everything - before the form has to be earned here |
58 -| 3 | Form (e-mail only) - | Offers the full comparison with his numbers - | Directly after the value, whi
-le the number is still on the screen |
59 -| 4 | Short comparison table (3 ETFs) - | Shows the data behind the calculator so the num
-ber is believable | For people who did not fill t
-he form yet and want to check the numbers |
60 -| 5 | How to buy from CZ - | Answers the next question he has: where do I bu
-y it | Keeps him on the page instead - of googling |
61 -| 6 | Second form - | Second chance after the table - | People who scroll past the fi
-rst form are more convinced here |
62 -| 7 | Footer: sources, date of data, not investment advice,
-consent note | Trust and legal minimum - | Nobody converts from a footer
-, so it is last |
54 +| # | Section + | What it does for the visitor + | Why here + |
55 +| --- | ------------------------------------------------------
+---------- | -------------------------------------------------
+---------------------------- | -------------------------------
+--------------------------------------- |
56 +| 1 | Headline + calculator + | Continues the ad promise and gives him something
+to do in the first 3 seconds | He came for one thing, so it is + the first thing on the screen |
57 +| 2 | Result + | Shows the end value and the fees paid in CZK for
+his own numbers | This is the value. Everything b
+efore the form has to be earned here |
58 +| 3 | Form (e-mail only, consent sentence under the button) + | Offers the full comparison with his numbers + | Directly after the value, while + the number is still on the screen |
59 +| 4 | Short comparison (3 ETFs) + | Shows the data behind the calculator so the numbe
+r is believable | For people who did not fill the + form yet and want to check the numbers |
60 +| 5 | How to buy from CZ + | Answers the next question he has: where do I buy
+it | Keeps him on the page instead o
+f googling |
61 +| 6 | Second form + | Second chance after the table + | People who scroll past the firs
+t form are more convinced here |
62 +| 7 | Footer: sources, date of data, 7 % assumption, not inv
+estment advice | Trust and legal minimum + | Nobody converts from a footer,
+so it is last |
63
64 ## 6. Interactive elements
65
66 -**Fee calculator** (sections 1 and 2). Two inputs: monthly amo
-unt (slider, 500 to 20 000 CZK) and years (5, 10, 20, 30). It
-shows the end value with each fund and the fee difference betw
-een the cheapest and the most expensive one. Every change of t
-he input is an event, so I can see where people stop.
66 +**Fee calculator** (sections 1 and 2). Two inputs: monthly amo
+unt (slider, 500 to 20 000 CZK, step 500) and years (5, 10, 20
+, 30). It shows the end value with each fund, the fees paid wi
+th each fund, and the difference between the cheapest and the
+most expensive one. The result appears after the first change
+of an input, and that first change is an event, so I can see h
+ow many people start.
67
68 It leads to the contact because the result is only for 3 funds
and the full comparison with the same numbers is behind the e
-mail.
69
70 Dropped ideas:
71
72 - Portfolio builder: too many steps for someone with a few sec
onds on mobile.
73 -- Full comparison table of 10+ ETFs: on a phone it is a scroll
-ing table, not an argument. The short table with 3 funds is en
-ough to make the calculator believable.
73 +- Full comparison table of 10+ ETFs: on a phone it is a scroll
+ing table, not an argument. The short comparison of 3 funds is + enough to make the calculator believable.
74
75 ## 7. Data and sources
76
77 All figures on the page are real and checked by hand against t
he issuer's page. The data is in [`/data/etfs.json`](./data/et
fs.json), each value has its source URL and the date I checked
it.
78
79 -| ETF | Ti
-cker | TER | UCITS equivalent | Issuer page - - |
80 -| ------------------------------------------------------- | --
----- | -------- | ------------------- | ----------------------

---

----- |
81 -| State Street SPDR S&P 500 ETF Trust | SP
-Y | 0.0945 % | SPY5 (IE00B6YX5C33) | https://www.ssga.com/u
-s/en/intermediary/etfs/spdr-sp-500-etf-trust-spy - |
82 -| Vanguard S&P 500 ETF | VO
-O | 0.03 % | VUAA (IE00BFMXXD54) | https://investor.vangu
-ard.com/investment-products/etfs/profile/voo - |
83 -| iShares Core S&P 500 ETF | IV
-V | 0.03 % | CSPX (IE00B5BMR087) | https://www.ishares.co
-m/us/products/239726/ishares-core-sp-500-etf - |
84 -| State Street SPDR Portfolio S&P 500 ETF (formerly SPLG) | SP
-YM | 0.02 % | SPYL (IE000XZSV718) | https://www.ssga.com/u
-s/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-
-spym |
79 +| ETF | Ti
+cker | TER | UCITS equivalent | Issuer page + + |
80 +| ------------------------------------------------------- | --
+---- | -------- | ------------------- | ----------------------
+--------------------------------------------------------------
+---------------- |
81 +| State Street SPDR S&P 500 ETF Trust | SP
+Y | 0.0945 % | SPY5 (IE00B6YX5C33) | [ssga.com](https://www
+.ssga.com/us/en/intermediary/etfs/spdr-sp-500-etf-trust-spy) + |
82 +| Vanguard S&P 500 ETF | VO
+O | 0.03 % | VUAA (IE00BFMXXD54) | [investor.vanguard.com
+](https://investor.vanguard.com/investment-products/etfs/profi
+le/voo) |
83 +| iShares Core S&P 500 ETF | IV
+V | 0.03 % | CSPX (IE00B5BMR087) | [ishares.com](https:// +www.ishares.com/us/products/239726/ishares-core-sp-500-etf) + |
84 +| State Street SPDR Portfolio S&P 500 ETF (formerly SPLG) | SP
+YM | 0.02 % | SPYL (IE000XZSV718) | [ssga.com](https://www
+.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-
+sp-500-etf-spym) |
85
86 -All values checked by hand on 2026-10-14 against the issuer pa
-ge (saved as PDF). Dividend yield is 30 Day SEC Yield for all
-four funds so they are comparable. `scripts/check-data.mjs` ru
-ns before every build and fails it if any value has no source, - no check date, or a source outside the issuer's domain (nyse.
-com allowed only for the exchange field).
87 -Fields per fund: expense ratio (TER), fund size, dividend yiel
-d, exchange, date checked. TODO: fill the table with values af
-ter verifying them.
86 +All values checked by hand on 2026-10-14 against the issuer pa
+ge (saved as PDF). Dividend yield is 30 Day SEC Yield for all
+four funds so they are comparable. Fields per fund: TER, fund
+size, dividend yield, exchange, and the UCITS ticker, ISIN and + TER. `scripts/check-data.mjs` runs before every build and fai
+ls it if any value has no source, no check date, or a source o
+utside the issuer's domain (nyse.com allowed only for the exch
+ange field).
87
89 -Calculation: TODO (assumed yearly return, how fees are applied
-). The assumed return is shown on the page next to the result.
88 +**Calculation.** 7 % a year minus the fund's TER, compounded m
+onthly (the yearly rate is turned into the equivalent monthly
+rate), deposit at the end of each month. No taxes, broker fees + or currency conversion. Fees paid = end value with 0 % TER mi
+nus end value with the fund's TER. The same formula in a sprea
+dsheet:
89
91 -Keeping it up to date in production: a script that fetches the - issuer pages once a month and a check that fails the deploy i
-f a value is missing.
90 +`
       91 +=FV((1 + (7 - TER)/100)^(1/12) - 1; years*12; -monthly)
       92 +`
93
94 +The code is in [`shared/utils/feeCalc.ts`](./shared/utils/feeC
+alc.ts), the tests in [`shared/utils/feeCalc.test.ts`](./share
+d/utils/feeCalc.test.ts). The assumed return is shown on the p
+age next to the result and explained in the footer.
95 +
96 ## 8. Measurement
97
95 -Tool: PostHog (EU cloud, free tier, funnel view). Nothing is s
-tored in the browser (no cookies, no local or session storage)
-, so no cookie banner is needed. That would cost the first scr
-een on mobile. The trade-off: a reload counts as a new visitor
-, so the funnel only counts paths finished without reloading.
-IP addresses are discarded in the project settings, and no e-m
-ail is sent in events.
96 -| Step | Event | Fired when |
98 +Tool: PostHog (EU cloud, free tier, funnel view). Nothing is s
+tored in the browser (no cookies, no local or session storage)
+, so no cookie banner is needed. That would cost the first scr
+een on mobile. The trade-off: a reload counts as a new visitor
+, so the funnel only counts paths finished without reloading.
+IP addresses are discarded in the project settings, and no e-m
+ail is sent in events. PostHog loads only after the page has l
+oaded; events fired before that wait in a queue with their ori
+ginal time.
99 +
100 +| Step | Event | Fired when + |
101 | ---- | --------------- | -----------------------------------
--------- |
98 -| 1 | `page_view` | page loads, with the ad version from the U
-RL |
99 -| 2 | `calc_change` | first change of a calculator input |
100 -| 3 | `calc_result` | result is shown |
101 -| 4 | `form_focus` | user taps into the e-mail field |
102 -| 5 | `form_submit` | form sent and lead saved |
103 -| 6 | `thankyou_view` | thank-you screen shown |
102 +| 1 | `page_view` | page loads, with the ad version fro
+m the URL |
103 +| 2 | `calc_change` | first change of a calculator input + |
104 +| 3 | `calc_result` | result is shown + |
105 +| 4 | `form_focus` | user taps into the e-mail field + |
106 +| 5 | `form_submit` | form sent and lead saved + |
107 +| 6 | `thankyou_view` | thank-you screen shown + |
108
109 ![Funnel in PostHog](docs/funnel.png)
110
107 -Test run on localhost: 2 page views, 1 full path to thankyou_v
-iew. ...
111 +Test run on localhost: 2 page views, 1 full path to thankyou_v
+iew.
112
109 -Leads are stored in Leads are stored in Supabase (table leads: - e-mail, monthly amount, years, ad variant, created_at, update
-d_at). A repeat submit with the same e-mail updates the row.
113 +Leads are stored in Supabase (table `leads`: e-mail, monthly a
+mount, years, ad variant, created_at, updated_at, emailed_at). + A repeat submit with the same e-mail updates the row.
114
115 +The comparison e-mail is sent by Resend from a Nuxt server rou
+te, after the lead is saved. One address gets at most one e-ma
+il per 10 minutes, so the form cannot be used to flood someone
+'s inbox. The limit is one atomic database update, so parallel + requests cannot get around it.
116 +
117 How I verified it: Went through the whole path on localhost wi
th ?v=b, checked all six events in PostHog Activity and the ro
w in Supabase.
118
119 ## 9. Expected conversion
...
135
136 1. **Form before vs. after the result.** Variant: ask for the
e-mail to "unlock" the result. Expected: fewer people reach th
e result, but more of those who do give an e-mail. I expect th
e current order (result first) to win on leads per visit, but
this is the biggest lever on the page, so it has to be tested
first. Metric: `form_submit` / `page_view`.
137 2. **Fee headline vs. choice headline on the first screen.** S
ame as the two ad versions, but tested on the page with the sa
me ad. Expected: the fee version wins, because a loss in CZK i
s more concrete than a question. Metric: `calc_change` / `page
           _view`.
132 -3. **Default values in the calculator vs. empty inputs.** Vari
-ant: calculator starts with 3 000 CZK and 20 years already fil
-led and the result visible. Expected: more people see the resu
-lt, slightly fewer touch the inputs. Metric: `calc_result` / `
          -page_view`.
138 +3. **Result hidden until the first change vs. visible on load. +** Now the calculator starts at 3 000 CZK and 20 years and the + result appears after the first change. Variant: the result is + visible right away. Expected: more people see a result, fewer + touch the inputs. Metric: `form_submit` / `page_view`.
139
140 ## 11. Decisions where the assignment was unclear
141
142 | Unclear point
| What I decided

                                                           | Why

                                                                    |
      143  | ------------------------------------------------------------
           ---- | -------------------------------------------------------
           --------------------------------------------------------------
           --------------------------------------------------------------
           ----------------------------------------------- | ------------
           --------------------------------------------------------------
           -------------------------------------------------------- |
      144  | "ETFs traded on NYSE" vs. what a Czech investor can actually
            buy | Compare the NYSE-listed funds as asked, and in the "How
            to buy from CZ" section say openly that most EU brokers do no
           t sell US-domiciled ETFs to retail clients (missing KID docume
           nt) and name the UCITS equivalent for each fund | Hiding this
           would make the page wrong for the target group. Saying it buil
           ds trust and is the kind of thing he would google anyway |
      139 -| How many funds to compare
          -     | 3 on the page, full list in the e-mail
          -
          -
          -                                                | 3 fits one p
          -hone screen and leaves a reason to give the e-mail
          -                                                         |
      140 -| What return to assume in the calculator
          -     | TODO % per year, shown next to the result
          -
          -
          -                                                | Any number i
          -s a guess, so I show it instead of hiding it
          -                                                         |
      141 -| Legal text
          -     | One line "not investment advice" and a consent checkbox
          - is not used, the consent is in the text under the submit butt
          -on
          -                                                | Keeps the fo
          -rm at one field. TODO: confirm this is enough for GDPR
          -                                                         |
      142 -| Exchange not stated on the issuer page (VOO)
          -     | Source is the NYSE listing page for that fund; the chec
          -k script allows nyse.com only for this one field
          -
          -                                                | The exchange
          - is a fact about the listing, so the exchange itself is the ri
          -ght source. Every other figure stays issuer-only         |
      145 +| How many funds to compare
          +     | 3 on the page, all 4 with their UCITS versions on the t
          +hank-you screen and in the e-mail
          +
          +                                              | 3 fits one pho
          +ne screen and leaves a reason to give the e-mail
          +                                                       |
      146 +| What return to assume in the calculator
          +     | 7 % per year before fees, shown next to the result and
          +explained in the footer
          +
          +                                                | Any number i
          +s a guess, so I show it instead of hiding it
          +                                                         |
      147 +| Legal text
          +     | One consent sentence under the submit button instead of
          + a checkbox, and one line "Nejde o investiční doporučení"
          +
          +                                               | Keeps the for
          +m at one field. It has not been checked by a lawyer (see secti
          +on 13)                                                  |
      148 +| Exchange not stated on the issuer page (VOO)
          +     | Source is the NYSE listing page (nyse.com) for that fun
          +d; the check script allows nyse.com only for this one field
          +
          +                                                | The exchange
          + is a fact about the listing, so the exchange itself is the ri
          +ght source. Every other figure stays issuer-only         |
      149 +| Fonts
          +     | Self-hosted (IBM Plex Sans and Newsreader, latin and la
          +tin-ext only)
          +
          +                                                | Google Fonts
          + would send every visitor's IP address to Google, which goes a
          +gainst analytics without personal data                   |
      150 +| Analytics and the cookie banner
          +     | PostHog with memory-only persistence: no cookies, no lo
          +cal or session storage
          +
          +                                                | No banner on
          + the first screen. The cost is that a reload counts as a new v
          +isitor                                                   |
      151 +| What if the e-mail fails
          +     | The lead is still saved and the thank-you screen still
          +shows the full comparison; the error is logged
          +
          +                                                | The visitor
          +gets what was promised either way. A failed e-mail must not lo
          +se the lead                                              |
      152
      153  ## 12. How I worked with AI
      154
     ...
      156
      157  **Process.** Before writing code I worked out the decisions in
            sections 2–6 (audience, offer, ads, page order) in a separate
            Claude chat, then read and edited them myself. That README wa
           s the brief for Claude Code. I asked for a plan first, not cod
           e, answered the agent's questions about it, and then built it
           step by step with one commit per step.
      158
      150 -**Instructions the agents got.** TODO: short list of the main
          -prompts with a link to the export file for each.
      159 +**Instructions the agents got.**
      160
      161 +- Plan and data: read README and assignment, write [`PLAN.md`]
          +(./PLAN.md) with one commit per step and a way to verify each,
          + no code; then fill `/data/etfs.json` with a source URL and da
          +te for every value. Export: [`ai-log/02-data.md`](./ai-log/02-
          +data.md).
      162 +- Calculator: slider 500–20 000 CZK, years 5/10/20/30, 7 % ass
          +umption shown next to the result, result hidden until the firs
          +t change, calculation as a pure function with unit tests. Expo
          +rt: [`ai-log/04-lead-form.md`](./ai-log/04-lead-form.md).
      163 +- Form and leads: one e-mail field, consent sentence under the
          + button, upsert on a repeated e-mail, amount, years and ad ver
          +sion from the calculator state, Supabase table `leads`. Export
          +: [`ai-log/04-lead-form.md`](./ai-log/04-lead-form.md).
      164 +- Analytics: PostHog EU, the six events from section 8, no coo
          +kie banner, no personal data in events. Export: [`ai-log/05-an
          +alytics.md`](./ai-log/05-analytics.md).
      165 +- Design: propose a visual direction in a few lines first (no
          +gradients, no emoji icons, no stock hero), build only after I
          +approved it, then self-hosted fonts, the comparison, "how to b
          +uy from CZ", second form and footer, and a Lighthouse run. Exp
          +ort: not in `/ai-log` yet.
      166 +- Launch: headline per ad version, thank-you screen with all 4
          + funds, the e-mail via Resend, ad texts in `/ads`, push and de
          +ploy. Export: not in `/ai-log` yet.
      167 +
      168  **How I checked the output.**
      169
      154 -- Every number in `/data/etfs.json` against the issuer page, b
          -y hand.
      155 -- The calculator against a spreadsheet with the same inputs.
      156 -- The page on a real phone, not only in the browser's mobile v
          -iew.
      157 -- The form submitted for real, then the row in the database an
          -d the events in the analytics dashboard.
      158 -- The Czech texts read by me. The AI writes correct but stiff
          -Czech, I rewrote TODO.
      170 +- Every number in `/data/etfs.json` against the issuer page sa
          +ved as PDF, by hand.
      171 +- The calculator against an independent calculation: 1 517 433
          + Kč for VOO and IVV at 3 000 Kč a month for 20 years.
      172 +- The form submitted for real, then the row in Supabase, inclu
          +ding a repeat submit that updated the same row.
      173 +- All six events in PostHog.
      174 +- Lighthouse on mobile, production build: Performance 92, Acce
          +ssibility 100, Best Practices 100, SEO 100.
      175 +- The Czech texts read by me. I rewrote the ones I did not lik
          +e, for example the line above the form, the button text and th
          +e hint before the first change.
      176
      177  **Where the AI got it wrong.**
      178
     ...
      193
      194  ## 13. What is missing
      195
      179 -TODO: what I did not finish and how I would do it with more ti
          -me.
      196 +- Real phone test. Tested on my phone: …
      197 +- A privacy policy page. The consent sentence promises deletio
          +n on request, and today that is a manual step (the visitor rep
          +lies to the e-mail). Nobody with legal training has checked th
          +e consent text.
      198 +- Automatic data refresh. The values are checked by hand. With
          + more time I would add a script that fetches the issuer pages
          +once a month and opens a pull request when a value changes.
      199 +- No real traffic yet, so the conversion estimate in section 9
          + and the A/B hypotheses in section 10 are untested. Only the h
          +eadline variant can be switched today (by URL); hypotheses 1 a
          +nd 3 need their variants built first.
      200 +- The calculator test that compares against my own spreadsheet
          + row is still a placeholder (`test.todo` in `shared/utils/feeC
          +alc.test.ts`). The formula is covered by the other tests and t
          +he independent calculation in section 12.
      201 +- No double opt-in. One address gets at most one e-mail per 10
          + minutes, but someone could still submit many different addres
          +ses once each.
      202
      203  ## 14. Run locally
      204
      205 +Needs Node 22 and pnpm.
      206 +
      207  ```bash
      184 -npm install
      185 -npm run dev
      208 +pnpm install
      209 +cp .env.example .env   # fill in the values below
      210 +pnpm dev               # http://localhost:3000, /?v=a or /?v=b
          + for the ad versions
      211 +pnpm test              # unit tests (Vitest)
      212 +pnpm check:data        # data check, also runs before every bu
          +ild
      213 +pnpm build             # production build
      214  ```
      215
      188 -Environment variables: TODO (`.env.example`).
      216 +Environment variables (see [`.env.example`](./.env.example)):
      217
      218 +| Variable                    | What it is
          +                                                   |
      219 +| --------------------------- | ------------------------------
          +-------------------------------------------------- |
      220 +| `NUXT_SUPABASE_URL`         | Supabase API URL, `https://<re
          +f>.supabase.co` (not the Postgres connection string) |
      221 +| `NUXT_SUPABASE_SERVICE_KEY` | Supabase secret / service_role
          + key, server only                                  |
      222 +| `NUXT_PUBLIC_POSTHOG_KEY`   | PostHog project key. Empty = n
          +o tracking, events are only logged in the console  |
      223 +| `NUXT_PUBLIC_POSTHOG_HOST`  | `https://eu.i.posthog.com`
          +                                                   |
      224 +| `NUXT_RESEND_API_KEY`       | Resend API key, server only. E
          +mpty = no e-mail, the rest works                   |
      225 +| `NUXT_MAIL_FROM`            | Sender on a domain verified in
          + Resend, e.g. `Porovnání ETF <porovnani@example.cz>` |
      226 +
      227 +Database: run [`supabase/leads.sql`](./supabase/leads.sql) onc
          +e in the Supabase SQL editor. A database created before the e-
          +mail limit also needs [`supabase/002-emailed-at.sql`](./supaba
          +se/002-emailed-at.sql).
      228 +
      229  ## Repository layout
      230
      231  ```
      193 -/ads       both ad versions
      194 -/ai-log    exported Claude Code conversations
      195 -/data      ETF data with sources and dates
      232 +/ads        both ad versions
      233 +/ai-log     exported Claude Code conversations
      234 +/app        Nuxt app: page, components, composables, PostHog p
          +lugin, CSS
      235 +/data       ETF data with sources and dates
      236 +/docs       funnel screenshot
      237 +/public     self-hosted fonts
      238 +/scripts    data check that runs before every build
      239 +/server     API route for leads, Supabase, e-mail template and
          + Resend
      240 +/shared     calculator, formatting, Czech texts, types (used b
          +y app and server)
      241 +/supabase   SQL for the leads table
      242 +PLAN.md     implementation plan
      243 +assignment.md
      244  ```

⏺ Now checking for leftover TODOs and testing every link (local paths and URLs):

Ran 1 shell command (ctrl+o to expand)

⏺ All links check out—the only failures are placeholder example URLs in code
blocks, not real links, and the sole "todo" hit is just a test name. I'll
reword that line to eliminate it, then commit and push.

⏺ Bash(python3 - <<'EOF'
p='README.md'…)
⎿  Updated README.md (+1 -1)
197 - A privacy policy page. The consent sentence promises deletio
n on request, and today that is a manual step (the visitor rep
lies to the e-mail). Nobody with legal training has checked th
e consent text.
198 - Automatic data refresh. The values are checked by hand. With
more time I would add a script that fetches the issuer pages
once a month and opens a pull request when a value changes.
199 - No real traffic yet, so the conversion estimate in section 9
and the A/B hypotheses in section 10 are untested. Only the h
eadline variant can be switched today (by URL); hypotheses 1 a
nd 3 need their variants built first.
200 -- The calculator test that compares against my own spreadsheet - row is still a placeholder (`test.todo` in `shared/utils/feeC
          -alc.test.ts`). The formula is covered by the other tests and t
-he independent calculation in section 12.
200 +- The calculator test that compares against my own spreadsheet + row is still an empty placeholder in `shared/utils/feeCalc.te
          +st.ts`. The formula is covered by the other tests and the inde
+pendent calculation in section 12.
201 - No double opt-in. One address gets at most one e-mail per 10
minutes, but someone could still submit many different addres
ses once each.
202
203 ## 14. Run locally
⎿  (timeout 2m)

⏺ Pushed as 8b761e5. Vercel redeploys on every push, so I'm waiting for that
deployment too (polling with the full commit hash this time):

Ran 1 shell command (ctrl+o to expand)

⏺ The project is finished and live at https://etf-landing-tau.vercel.app.

1. 4416184 (the e-mail limit fix): it was already pushed when I checked,
   presumably by you. Its production deploy succeeded at 17:21, and the
   emailed_at column exists.
2. README: committed as 8b761e5 ("docs: finish README") and pushed; production
   redeployed at 17:26. No "TODO" or "todo" is left anywhere in the file.
   Every link works: the local files, your live page with ?v=a and ?v=b, and
   the four fund pages.

I built on your uncommitted README edits (the process paragraph, section 8 and
the "Where the AI got it wrong" table) rather than replacing them.

Sentences I changed because they no longer matched the page:

- §3: "sending a PDF" became "sending the comparison", since the e-mail is
  HTML.
- §6: it said every input change is an event; only the first change is.
- §5 footer row: the consent sentence sits under the form, not in the footer.
- §10, hypothesis 3: it described "empty inputs vs. defaults filled". What's
  built is "result hidden until the first change vs. visible on load", so I
  rewrote it to match. I changed its metric to form_submit / page_view,
  because calc_result would fire on load in the variant.
- §8: removed the doubled "Leads are stored in" and the "..." at the end of
  your test-run line.
- §11: the consent row now says the text hasn't been checked by a lawyer,
  instead of "TODO: confirm GDPR".
- §7: the monthly data-refresh sentence described something that doesn't
  exist, so I moved it to §13 as missing.

What I could not fill in:

- Two ai-log exports are missing. The design session and the launch session
  (headlines, thank-you screen, e-mail, ads) aren't in /ai-log. Their bullets
  in §12 say "Export: not in /ai-log yet" instead of linking. If you export
  them, for example as ai-log/06-design.md and ai-log/07-launch.md, I'll add
  the links.
- Phone test: §13 has "Tested on my phone: …" for you to complete.
- Your spreadsheet test: the test that compares against your own spreadsheet
  is still an empty placeholder in shared/utils/feeCalc.test.ts. §12 only
  claims the independent calculation (1 517 433 Kč), so §13 lists the
  spreadsheet test as still open.
- Sending the e-mail: I didn't send a real comparison e-mail through Resend,
  so the e-mail has never been delivered end to end. Submit your own address
  on production and check your inbox. Note that it now e-mails the same
  address at most once per 10 minutes.

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/ai-log/06-design-and-launch.md in the IDE.
This may or may not be related to the current task.</ide_opened_file>

❯ Finish these yourself:

1. Spreadsheet test: I verified the value independently in a separate
   Claude chat (FV formula and a month-by-month loop):
   3 000 Kč, 20 years, TER 0.03 % → 1 517 433 Kč. Replace the
   test.todo with this case (name it "matches independent calculation")
   and update README §12 and §13 so they say exactly that.
2. Send one real lead to production: POST to the live form API with
   m.kubanda1@gmail.com, 3 000 Kč, 20 years, variant a. Report the
   HTTP response and whether Resend accepted the e-mail. Then check
   the row in Supabase and tell me what it contains.
3. Check that the GitHub repo is public (gh repo view --json
   visibility) and that README renders the funnel image (the path is
   correct and the file is committed).
4. In README search for "TODO", "…" and "..." placeholders and fix
   any that are left, except the "Tested on my phone" line.
5. Commit as "test: independent calculation case" and
   "docs: final README fixes", push, and give me the hashes.

⏺ Checking the repo state first. You've opened ai-log/06-design-and-launch.md,
so the export may exist now and §12 could link to it:

Ran 1 shell command (ctrl+o to expand)

⏺ The design-and-launch log file is now committed, so I can link both pending
§12 bullets to it. I'll replace the placeholder test with your independently
verified case next.

⏺ Update(shared/utils/feeCalc.test.ts)
⎿  Added 6 lines, removed 1 line
59 expect(v).toBeGreaterThan(0)
60 })
61
62 - test.todo('matches owner spreadsheet row 1')
62 + // Verified independently (FV formula and a month-by-month lo
+op) outside this repo.
63 + test('matches independent calculation', () => {
64 + const v = endValue({ monthly: 3000, years: 20, annualReturn
+Pct: 7, terPct: 0.03 })
65 + expect(Math.round(v)).toBe(1517433)
66 + expect(formatCzk(v)).toBe('1 517 433 Kč')
67 + })
68 })
69
70 describe('compareFunds', () => {

Ran 1 shell command (ctrl+o to expand)

⏺ All 57 tests pass with no placeholders remaining, and I've committed this as
0bba4c2. Next, I'll check the production lead by reading the existing row for
your address to see if the e-mail limit is active.
Ran 1 shell command (ctrl+o to expand)

⏺ The existing row has emailed_at: null, so the limit won't block a send.
Posting to production:

Ran 1 shell command (ctrl+o to expand)

⏺ The lead saved successfully (HTTP 201), but the email failed to send —
emailed: false and emailed_at is null, meaning the send slot was claimed then
released. Since I can't access the Vercel function logs for the actual error,
I'll check whether the API key is valid and the sending domain is verified
without triggering another send.

Ran 1 shell command (ctrl+o to expand)

⏺ Found the real issue: NUXT_MAIL_FROM is set to etf-landing-tau.vercel.app, but
Resend only sends from DNS-verified domains, and Vercel's default domain
can't be verified that way. I'll confirm this by sending a test through
Resend's dedicated test address, delivered@resend.dev, instead of emailing you
again.

Ran 1 shell command (ctrl+o to expand)

⏺ Resend flagged the sender address for containing non-ASCII characters, so I'll
check which part of it is causing the issue.

Ran 1 shell command (ctrl+o to expand)

⏺ Found two issues: the missing angle brackets around the sender address are
causing the diacritics to get folded into the email string, and the domain is
etf-landing-tau.vercel.app. I'll test the fixed bracketed format against the
test address to see if the domain also blocks sending.

Ran 1 shell command (ctrl+o to expand)

⏺ Confirmed: Resend blocks sending from the vercel.app domain even with brackets
fixed. I'll test with Resend's shared sender onboarding@resend.dev next,
which only delivers to the account's registered address.

Ran 1 shell command (ctrl+o to expand)

⏺ The Resend key works fine with the shared sender—domain setup is the only
remaining blocker, and I'll leave your Vercel variables untouched (I'll share
options later). Next, I'll check if the repo is public and confirm the funnel
image renders correctly.

Ran 1 shell command (ctrl+o to expand)

⏺ The repo is public, and the image is committed and loads from GitHub (a
2258×1065 PNG).

4. Placeholders in the README:

Searched for 1 pattern (ctrl+o to expand)

⏺ I'll update the two outdated "not in /ai-log yet" notes, the §13 placeholder
test note, and §12's check line, plus add the e-mail issue to §13 so the
README doesn't incorrectly claim e-mails are sent.

⏺ Bash(python3 - <<'EOF'
p='README.md'…)
⎿  Updated README.md (+4 -4)
162 - Calculator: slider 500–20 000 CZK, years 5/10/20/30, 7 % ass
umption shown next to the result, result hidden until the firs
t change, calculation as a pure function with unit tests. Expo
rt: [`ai-log/04-lead-form.md`](./ai-log/04-lead-form.md).
163 - Form and leads: one e-mail field, consent sentence under the
button, upsert on a repeated e-mail, amount, years and ad ver
sion from the calculator state, Supabase table `leads`. Export
: [`ai-log/04-lead-form.md`](./ai-log/04-lead-form.md).
164 - Analytics: PostHog EU, the six events from section 8, no coo
kie banner, no personal data in events. Export: [`ai-log/05-an
           alytics.md`](./ai-log/05-analytics.md).
165 -- Design: propose a visual direction in a few lines first (no
-gradients, no emoji icons, no stock hero), build only after I
-approved it, then self-hosted fonts, the comparison, "how to b
-uy from CZ", second form and footer, and a Lighthouse run. Exp
-ort: not in `/ai-log` yet.
166 -- Launch: headline per ad version, thank-you screen with all 4 - funds, the e-mail via Resend, ad texts in `/ads`, push and de
-ploy. Export: not in `/ai-log` yet.
165 +- Design: propose a visual direction in a few lines first (no
+gradients, no emoji icons, no stock hero), build only after I
+approved it, then self-hosted fonts, the comparison, "how to b
+uy from CZ", second form and footer, and a Lighthouse run. Exp
+ort: [`ai-log/06-design-and-launch.md`](./ai-log/06-design-and
+-launch.md).
166 +- Launch: headline per ad version, thank-you screen with all 4 + funds, the e-mail via Resend, ad texts in `/ads`, push and de
+ploy. Export: [`ai-log/06-design-and-launch.md`](./ai-log/06-d
+esign-and-launch.md).
167
168 **How I checked the output.**
169
170 - Every number in `/data/etfs.json` against the issuer page sa
ved as PDF, by hand.
171 -- The calculator against an independent calculation: 1 517 433 - Kč for VOO and IVV at 3 000 Kč a month for 20 years.
171 +- The calculator against an independent calculation. I verifie
+d it in a separate Claude chat with the FV formula and a month
+-by-month loop: 3 000 Kč a month, 20 years, TER 0.03 % gives 1 + 517 433 Kč. The same case is a unit test, "matches independen
+t calculation" in [`shared/utils/feeCalc.test.ts`](./shared/ut
+ils/feeCalc.test.ts).
172 - The form submitted for real, then the row in Supabase, inclu
ding a repeat submit that updated the same row.
173 - All six events in PostHog.
174 - Lighthouse on mobile, production build: Performance 92, Acce
ssibility 100, Best Practices 100, SEO 100.
...
197 - A privacy policy page. The consent sentence promises deletio
n on request, and today that is a manual step (the visitor rep
lies to the e-mail). Nobody with legal training has checked th
e consent text.
198 - Automatic data refresh. The values are checked by hand. With
more time I would add a script that fetches the issuer pages
once a month and opens a pull request when a value changes.
199 - No real traffic yet, so the conversion estimate in section 9
and the A/B hypotheses in section 10 are untested. Only the h
eadline variant can be switched today (by URL); hypotheses 1 a
nd 3 need their variants built first.
200 -- The calculator test that compares against my own spreadsheet - row is still an empty placeholder in `shared/utils/feeCalc.te
          -st.ts`. The formula is covered by the other tests and the inde
-pendent calculation in section 12.
200 +- The comparison e-mail is not delivered in production yet. Th
+e sender is on `etf-landing-tau.vercel.app`, and Resend only s
+ends from a domain verified with DNS records, which a `vercel.
          +app` address cannot have. The lead is saved and the thank-you
+screen shows the comparison, as designed for a failed e-mail.
+It needs a domain I own, verified in Resend.
201 - No double opt-in. One address gets at most one e-mail per 10
minutes, but someone could still submit many different addres
ses once each.
202
203 ## 14. Run locally

⏺ All links resolve. One leftover: line 88 matched the "..." search earlier.
Checking what it is:

Ran 1 shell command (ctrl+o to expand)

⏺ No literal "..." anywhere; the earlier hit was a quirk of the search pattern.
Committing and pushing both commits:

Ran 1 shell command (ctrl+o to expand)

⏺ Everything is pushed and production is redeployed, but the real lead did not
get its e-mail. Production can't send e-mail yet because of a configuration
problem in the sender address.

Commits:

- 0bba4c2 test: independent calculation case
- 24eed7e docs: final README fixes (pushed; the production deploy succeeded)

1. Test: the placeholder is now a real test, "matches independent
   calculation": 3 000 Kč, 20 years, TER 0.03 % gives 1 517 433 Kč. All 57 tests
   pass. README §12 now describes that check in your words, and §13 no longer
   mentions a placeholder.

2. Real lead on production:

- Response: HTTP 201 {"ok":true,"emailed":false}. The lead was saved; the
  e-mail was not sent.
- Supabase row: m.kubanda1@gmail.com, monthly 3000, years 20, variant a,
  created_at 2026-10-15 11:18 UTC (from your first test), updated_at 16:45:06
  UTC (this submit), emailed_at null (the send failed, so the slot was
  released).
- Why Resend refused. I checked by sending only to Resend's test address
  delivered@resend.dev, so no second e-mail went to you. There are two
  problems in NUXT_MAIL_FROM:
  - It reads Porovnání ETF info@etf-landing-tau.vercel.app, without angle
    brackets. Resend took the whole string as the address and rejected it:
    "contains non-ASCII characters".
  - With brackets added it still fails: "This API key is not authorized to
    send emails from etf-landing-tau.vercel.app". Resend only sends from a
    domain verified with DNS records, and you can't add DNS records to a
    vercel.app address.
  - The same key works with Resend's shared sender onboarding@resend.dev (the
    test returned 200).
- How to fix it in Vercel (then redeploy):
  - Proper fix: verify a domain you own in Resend and set
    NUXT_MAIL_FROM=Porovnání ETF <porovnani@yourdomain.cz>. If the key is
    restricted to one domain, it must be that domain.
  - Demo-only workaround: NUXT_MAIL_FROM=Porovnání ETF
    <onboarding@resend.dev>. This only delivers to the e-mail address your
    Resend account is registered with.
- Your .env has the same sender, so it fails locally too. Until this is fixed,
  README §13 says the e-mail isn't delivered in production yet; delete that
  line once it works.

3. Repo and image: the repo is public. docs/funnel.png is committed (2258×1065
   PNG), the README path is correct, and the image loads from GitHub.

4. Placeholders: none left except your "Tested on my phone: …" line. I also
   replaced the two "not in /ai-log yet" notes with links to
   ai-log/06-design-and-launch.md. Every local link in the README resolves.

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/.env in the IDE. This may or may not be
related to the current task.</ide_opened_file>

❯ Verified mail.kubandam.dev in Resend and set NUXT_MAIL_FROM to
"Porovnání ETF <porovnani@mail.kubandam.dev>" in Vercel and .env,
production is redeployed. That address cannot receive mail, so add
NUXT_MAIL_REPLY_TO (I set it to m.kubanda1@gmail.com) and use it as
reply-to in the e-mail. Then send one real lead to production with
m.kubanda1@gmail.com again, confirm emailed:true, remove the
"e-mail not delivered" line from README §13, add a row to the §12
table: "NUXT_MAIL_FROM had no angle brackets and used an unverifiable
vercel.app domain | agent tested against Resend's test address |
verified mail.kubandam.dev", commit and push.

⏺ Plan: add the reply-to setting and deploy it first, so the real e-mail goes
out with the reply-to set. Then send the lead, then update the README. First
checking .env (names only) and that the new sender passes Resend's test
address:

Ran 1 shell command (ctrl+o to expand)

⏺ The new sender works (Resend's test address returned 200). NUXT_MAIL_REPLY_TO
isn't in your local .env, only in Vercel, so I'll add it locally with the same
value. Now the code:

⏺ Bash(python3 - <<'EOF'
def edit(p,a,b):…)
⎿  Updated .env.example (+2 -0)
9 # Resend (server only). Sender must be on a domain verified in
Resend, e.g. "Porovnání ETF <porovnani@vasedomena.cz>".
10 NUXT*RESEND_API_KEY=
11 NUXT_MAIL_FROM=
12 +# Where replies go (the e-mail says "reply to delete your addre
+ss"). Must be an inbox someone reads.
13 +NUXT_MAIL_REPLY_TO=
⎿  Updated nuxt.config.ts (+2 -0)
40 // Server only. Set via NUXT_RESEND_API_KEY / NUXT_MAIL_FRO
M (e.g. "Porovnání ETF <porovnani@vasedomena.cz>").
41 resendApiKey: '',
42 mailFrom: '',
43 + // Set via NUXT_MAIL_REPLY_TO. Replies go here (the sender
+address cannot receive mail).
44 + mailReplyTo: '',
45 public: {
46 // Set via NUXT_PUBLIC_POSTHOG_KEY. Empty = no tracking,
events only logged with console.debug.
47 posthogKey: '',
⎿  Updated server/utils/resend.ts (+10 -2)
14 * Logs never contain the e-mail address.
15 _/
16 export async function sendComparisonEmail(lead: Lead): Promise<
boolean> {
17 - const { resendApiKey, mailFrom } = useRuntimeConfig()
17 + const { resendApiKey, mailFrom, mailReplyTo } = useRuntimeCon
+fig()
18 if (!resendApiKey || !mailFrom) {
19 console.error('[email] not sent: NUXT_RESEND_API_KEY or NUX
T_MAIL_FROM missing')
20 return false
...
27 const timeout = new Promise<never>((_, reject) => {
28 timer = setTimeout(() => reject(new Error(`timeout after
          ${SEND_TIMEOUT_MS} ms`)), SEND_TIMEOUT_MS)
29 })
30 - const { error } = await Promise.race([client.emails.send({
-from: mailFrom, to: lead.email, subject, html, text }), timeout
-])
30 + const { error } = await Promise.race([client.emails.send({
31 + from: mailFrom,
32 + to: lead.email,
33 + // The e-mail asks people to reply to get their address d
+eleted, so replies must reach a real inbox.
34 + ...(mailReplyTo ? { replyTo: mailReplyTo } : {}),
35 + subject,
36 + html,
37 + text,
38 + }), timeout])
39 .finally(() => clearTimeout(timer))
40 if (error) {
41 console.error(`[email] Resend error: ${error.name} ${erro
          r.statusCode ?? ''} ${error.message}`)
⎿  (timeout 4m)

⏺ Typecheck and tests pass. Committing, pushing and waiting for the deploy
before sending the real lead:

Ran 1 shell command (ctrl+o to expand)

⏺ Deployed. Sending the real lead to production:

Ran 1 shell command (ctrl+o to expand)

⏺ The email was accepted by Resend, confirmed by emailed: true and a set
emailed_at timestamp. Now I'll update the README: removing the §13 line,
adding the §12 row, and including NUXT_MAIL_REPLY_TO in the §14 variable list.

⏺ Bash(python3 - <<'EOF'
import re…)
⎿  Updated README.md (+2 -1)
190 | ?v=a / ?v=b did not switch the headline, only the analytics
property | Found when I asked the a
gent to check it | Fixed and covered by a test
|
191 | Performance 71 in Lighthouse: PostHog loaded before the page
| Lighthouse
| PostHog loads after the page, even
ts queue; now 92 |
192 | The form could be used to flood any inbox with e-mails
| Security review by a sep
arate agent | Limit per address; the second revi
ew found a race condition, fixed with one atomic DB update |
193 +| NUXT_MAIL_FROM had no angle brackets and used an unverifiabl
+e vercel.app domain | Agent tested against Resend's test addre
+ss | Verified mail.kubandam.dev |
194
195 ## 13. What is missing
196
...
198 - A privacy policy page. The consent sentence promises deletio
n on request, and today that is a manual step (the visitor rep
lies to the e-mail). Nobody with legal training has checked th
e consent text.
199 - Automatic data refresh. The values are checked by hand. With
more time I would add a script that fetches the issuer pages
once a month and opens a pull request when a value changes.
200 - No real traffic yet, so the conversion estimate in section 9
and the A/B hypotheses in section 10 are untested. Only the h
eadline variant can be switched today (by URL); hypotheses 1 a
nd 3 need their variants built first.
200 -- The comparison e-mail is not delivered in production yet. Th
-e sender is on `etf-landing-tau.vercel.app`, and Resend only s
-ends from a domain verified with DNS records, which a `vercel.
          -app` address cannot have. The lead is saved and the thank-you
-screen shows the comparison, as designed for a failed e-mail.
-It needs a domain I own, verified in Resend.
201 - No double opt-in. One address gets at most one e-mail per 10
minutes, but someone could still submit many different addres
ses once each.
202
203 ## 14. Run locally
...
223 | `NUXT_PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com`
|
224 | `NUXT_RESEND_API_KEY` | Resend API key, server only. E
mpty = no e-mail, the rest works |
225 | `NUXT_MAIL_FROM` | Sender on a domain verified in
Resend, e.g. `Porovnání ETF <porovnani@example.cz>` |
226 +| `NUXT_MAIL_REPLY_TO` | Inbox for replies to the e-mai
+l (people reply to get their address deleted) |
227
228 Database: run [`supabase/leads.sql`](./supabase/leads.sql) onc
e in the Supabase SQL editor. A database created before the e-
mail limit also needs [`supabase/002-emailed-at.sql`](./supaba
se/002-emailed-at.sql).
229
Ran 1 shell command (ctrl+o to expand)

⏺ The real lead on production now gets its e-mail: Resend accepted it and the
API returned emailed: true. Everything is pushed and production is deployed.

Commits:

- 422b639 feat: reply-to address for the comparison e-mail
- 31b8563 docs: e-mail sender fixed, reply-to documented

Reply-to: the e-mail now sets reply-to from NUXT_MAIL_REPLY_TO, so replies
(including deletion requests) go to your Gmail, not the sender address that
can't receive mail. If the variable is empty, the e-mail is sent without a
reply-to. I added the variable to .env.example, the README variable list in
§14, and your local .env (m.kubanda1@gmail.com), since it was only in Vercel.
Tests and typecheck pass.

Real lead on production (sent after the reply-to change was live):

- HTTP 201 {"ok":true,"emailed":true}
- Supabase row: monthly 3000, years 20, variant a, updated_at 17:07:10 UTC,
  emailed_at 17:07:11 UTC.

Resend accepted it, but I can't see your inbox. Please confirm it arrived
(check spam too) and that "Reply" fills in your Gmail address. For the next 10
minutes another submit with your address won't send a new e-mail, but the API
will still answer emailed: true on purpose.

README:

- The "e-mail not delivered" line is removed from §13.
- Your row is added to the §12 table.
- No placeholders are left except your "Tested on my phone: …" line.

❯ <ide_opened_file>The user opened the file
/Users/kubandam/Work/etf-landing/.env in the IDE. This may or may not be
related to the current task.</ide_opened_file>

❯ Two changes after testing the live page:

1. Show the calculator result on load with the defaults (3 000 Kč,
   20 years). An empty space on the first screen wastes the few
   seconds the visitor gives us, and the assignment says the value
   must be clear before the form. Remove the hint text.
   Analytics: calc_result must not fire on load. Keep calc_change on
   the first user input, drop calc_result from the funnel. Funnel is
   now page_view → calc_change → form_focus → form_submit →
   thankyou_view.
   Update README: §5, §6, §8 (events and funnel), §9 (conversion
   steps), §10 hypothesis 3 (baseline: result visible on load;
   variant: hidden until first input), §11 add a row "Result hidden
   until first input → changed to visible on load | I saw the empty
   space on the live page; the value has to be visible in the first
   seconds; the funnel is fixed by not firing calc_result on load".
   Also add a row to the §12 table: "Result was hidden until first
   input, leaving an empty first screen | I noticed it on the live
   page | shown on load, funnel event changed".
2. Bottom e-mail form: keep it, but give it its own heading so it
   doesn't look like a copy of the first one, e.g. "Chcete porovnání
   všech 4 fondů i s evropskými variantami?" Keep the button text.

Run tests, commit each change separately, push, tell me when deployed.

⏺ Reading the files involved:

Ran 1 shell command (ctrl+o to expand)

⏺ Change 1: the result is always shown, touched now only stops calc_change
firing twice, and calc_result is gone from the code:

⏺ Bash(cat > app/composables/useCalculator.ts <<'EOF'
import { MONTHLY, YEARS*INITIAL, compareFunds, type Years } from
'#shared/utils/feeCalc'…)
⎿  Updated app/components/CalcResult.vue (+2 -20)
2 import { cs, formatCsDate } from '#shared/content/cs'
3 import { CALC_ASSUMPTIONS, formatCzk } from '#shared/utils/feeC
alc'
4
5 -const { result, preview, years } = useCalculator()
5 +const { result: shown, years } = useCalculator()
6 const { dataCheckedDate } = useEtfs()
7
8 -// Before the first input the rows are rendered invisibly with
-the default numbers,
9 -// so the block already has its final height and nothing below
-jumps.
10 -const shown = computed(() => result.value ?? preview.value)
11 -const hidden = computed(() => !result.value)
12 -
8 const ter = (pct: number) => pct.toLocaleString('cs-CZ', { maxi
mumFractionDigits: 4 })
9 // VOO and IVV share a TER, so "cheapest" can be more than one
fund.
10 const tickersAt = (value: number) => shown.value.rows.filter(r
=> r.endValue === value).map(r => r.ticker).join(', ')
...
12
13 <template>
14 <div class="result" aria-live="polite">
20 - <p v-if="hidden" class="hint">{{ cs.calc.hint }}</p>
21 -
22 - <div class="sheet" :class="{ 'is-hidden': hidden }" :aria-h
-idden="hidden">
15 + <div class="sheet">
16 <h2 class="heading">{{ cs.calc.resultHeading(years) }}</h
2>
17 <ul class="rows">
18 <li v-for="row in shown.rows" :key="row.ticker" class="
          row">
...
50 padding-top: var(--space-3);
51 }
52
60 -.sheet.is-hidden {
61 - visibility: hidden;
62 -}
53
64 -.hint {
65 - position: absolute;
66 - inset: var(--space-5) 0 auto;
67 - font-family: var(--font-serif);
68 - font-size: 1.375rem;
69 - line-height: 1.3;
70 - color: var(--muted);
71 -}
… 3 more lines (ctrl+o to expand)
⎿  Updated app/composables/useCalculator.ts (+4 -7)
2
3 /\*\*
4 * Calculator state, shared across components (the lead form rea
ds monthly/years).
5 - _ `result` stays null until the user changes an input for the f
-irst time.
5 + _ The result is shown from the first render with the defaults (
+3 000 Kč, 20 let).
6 _/
7 export function useCalculator() {
8 const monthly = useState<number>('calc-monthly', () => MONTHLY
.initial)
...
10 const touched = useState<boolean>('calc-touched', () => false
)
11 const { pageFunds } = useEtfs()
12
13 - // Always computed so the hidden result can reserve its exact - height before the first input.
14 - const preview = computed(() => compareFunds(monthly.value, ye
-ars.value, pageFunds))
15 - const result = computed(() => (touched.value ? preview.value
-: null))
13 + const result = computed(() => compareFunds(monthly.value, yea
+rs.value, pageFunds))
14 const track = useTrack()
15
18 - /\*\* Call from input handlers. The first call reveals the resu
-lt and fires calc_change + calc_result once per page load. _/
16 + /\*\* Call from input handlers. Fires calc*change once per page + load, on the first real user input. */
17 function onUserInput(field: 'monthly' | 'years') {
18 if (touched.value) return
19 touched.value = true
20 track('calc*change', { field })
23 - track('calc_result', { monthly: monthly.value, years: years
-.value, feeGap: Math.round(result.value!.feeGap) })
21 }
22
26 - return { monthly, years, touched, result, preview, onUserInpu
-t }
23 + return { monthly, years, touched, result, onUserInput }
24 }
⎿  Updated app/composables/useTrack.ts (+1 -1)
1 /\** Funnel events, README §8. Props must never contain personal
data (no e-mail). \_/
2 -export type EventName = 'page_view' | 'calc_change' | 'calc_resu
-lt' | 'form_focus' | 'form_submit' | 'thankyou_view'
2 +export type EventName = 'page_view' | 'calc_change' | 'form_focu
+s' | 'form_submit' | 'thankyou_view'
3 export type EventProps = Record<string, string | number | boolea
n>
4
5 export function useTrack() {
⎿  Updated shared/content/cs.ts (+0 -1)
24 yearsLabel: 'Jak dlouho',
25 yearsOption: (y: number) => `${y}`,
26 yearsUnit: 'let',
27 - hint: 'Kolik vám poplatky vezmou? Posuňte částku.',
27 resultHeading: (years: number) => `Za ${years} let budete m
          ít`,
28 feeLine: (ter: string, paid: string) => `poplatek ${ter} %
          · zaplatíte ${paid}`,
29 gapLabel: (years: number) => `Rozdíl za ${years} let`,
⎿  (timeout 4m)

⏺ Typecheck and tests pass. Now I'll verify in the browser that the result
renders in the server HTML, only page_view fires on load, and calc_change
fires once on the first input, while blocking PostHog requests so nothing hits
your project.

Called plugin:playwright:playwright 2 times, ran 1 shell command (ctrl+o to expand)

⏺ The data loads fine with the first screen intact. Since your dev server has a
live PostHog key, I'll intercept and locally decode PostHog requests in the
test browser instead of relying on console output.

Called plugin:playwright:playwright (ctrl+o to expand)

⏺ My route pattern didn't catch the actual PostHog domain, so those earlier
"blocked" test runs actually sent real events (page_view, calc_change,
form_focus, form_submit from localhost) to your PostHog instance. I'll fix the
match pattern and rerun the test.

Called plugin:playwright:playwright (ctrl+o to expand)

⏺ Confirmed: only page_view (variant b) fired on load, and the slider/years
interactions triggered exactly one calc_change with no calc_result. Now I'll
write the README sections documenting change 1.

Searched for 1 pattern (ctrl+o to expand)

⏺ Updating §5, §6, §8, §9, §10, and adding the rows to §11 and §12. Lines 162
and 183 describe what happened earlier, so they stay as written:

Ran 1 shell command (ctrl+o to expand)

⏺ Bash(python3 - <<'EOF'
p='README.md'…)
⎿  Updated README.md (+16 -11)
54 | # | Section
| What it does for the visitor
| Why here
|
55 | --- | -------------------------------------------------------
--------- | ---------------------------------------------------
-------------------------- | ----------------------------------
------------------------------------ |
56 | 1 | Headline + calculator
| Continues the ad promise and gives him something to
do in the first 3 seconds | He came for one thing, so it is th
e first thing on the screen |
57 -| 2 | Result - | Shows the end value and the fees paid in CZK for hi
-s own numbers | This is the value. Everything befo
-re the form has to be earned here |
57 +| 2 | Result + | Shows the end value and the fees paid in CZK, visib
+le on load for 3 000 CZK / 20 years, then for his own numbers | + This is the value. Everything before the form has to be earned + here |
58 | 3 | Form (e-mail only, consent sentence under the button)
| Offers the full comparison with his numbers
| Directly after the value, while th
e number is still on the screen |
59 | 4 | Short comparison (3 ETFs)
| Shows the data behind the calculator so the number
is believable | For people who did not fill the fo
rm yet and want to check the numbers |
60 | 5 | How to buy from CZ
| Answers the next question he has: where do I buy it
| Keeps him on the page instead of g
oogling |
...
63
64 ## 6. Interactive elements
65
66 -**Fee calculator** (sections 1 and 2). Two inputs: monthly amou
-nt (slider, 500 to 20 000 CZK, step 500) and years (5, 10, 20,
-30). It shows the end value with each fund, the fees paid with
-each fund, and the difference between the cheapest and the most - expensive one. The result appears after the first change of an - input, and that first change is an event, so I can see how man
-y people start.
66 +**Fee calculator** (sections 1 and 2). Two inputs: monthly amou
+nt (slider, 500 to 20 000 CZK, step 500) and years (5, 10, 20,
+30). It shows the end value with each fund, the fees paid with
+each fund, and the difference between the cheapest and the most + expensive one. The result is visible on load with 3 000 CZK an
+d 20 years, so the first screen shows a number before he touche
+s anything. The first change of an input is an event (`calc_cha
         +nge`), so I can see how many people try their own numbers.
67
68 It leads to the contact because the result is only for 3 funds
and the full comparison with the same numbers is behind the e-m
ail.
69
...
101 | ---- | --------------- | -----------------------------------
--------- |
102 | 1 | `page_view` | page loads, with the ad version fro
m the URL |
103 | 2 | `calc_change` | first change of a calculator input
|
104 -| 3 | `calc_result` | result is shown - |
105 -| 4 | `form_focus` | user taps into the e-mail field - |
106 -| 5 | `form_submit` | form sent and lead saved - |
107 -| 6 | `thankyou_view` | thank-you screen shown - |
104 +| 3 | `form_focus` | user taps into the e-mail field + |
105 +| 4 | `form_submit` | form sent and lead saved + |
106 +| 5 | `thankyou_view` | thank-you screen shown + |
107 +
108 +Funnel: `page_view` → `calc_change` → `form_focus` → `form_sub
          +mit` → `thankyou_view`. There is no event for seeing the resul
+t: it is on the first screen from the start, and an event fire
+d on load would only repeat `page_view`.
109
110 ![Funnel in PostHog](docs/funnel.png)
111
112 +The screenshot is from the earlier six-step funnel, which stil
+l had `calc_result` between `calc_change` and `form_focus`.
113 +
114 Test run on localhost: 2 page views, 1 full path to thankyou_v
iew.
115
116 Leads are stored in Supabase (table `leads`: e-mail, monthly a
mount, years, ad variant, created_at, updated_at, emailed_at).
A repeat submit with the same e-mail updates the row.
...
123
124 Estimate for cold traffic from a mobile ad, calculated step by
step:
125
123 -- 100 % arrive. About 40 % leave without touching anything (bo
-unce on cold mobile traffic is usually 50 to 70 %, the calcula
-tor on the first screen should keep it lower).
… 32 more lines (ctrl+o to expand)

⏺ I confirmed the calc_result mentions in lines 112, 155, and 187 are fine
as-is, and I'm updating §8's "checked all six events" to "every event" since
there are now five. Committing this change now.

⏺ Bash(python3 - <<'EOF'
p='README.md'; s=open(p).read()…)
⎿  Updated README.md (+2 -2)
117
118 The comparison e-mail is sent by Resend from a Nuxt server rou
te, after the lead is saved. One address gets at most one e-ma
il per 10 minutes, so the form cannot be used to flood someone
's inbox. The limit is one atomic database update, so parallel
requests cannot get around it.
119
120 -How I verified it: Went through the whole path on localhost wi
-th ?v=b, checked all six events in PostHog Activity and the ro
-w in Supabase.
120 +How I verified it: Went through the whole path on localhost wi
+th ?v=b, checked every event in PostHog Activity and the row i
+n Supabase.
121
122 ## 9. Expected conversion
123
...
174 - Every number in `/data/etfs.json` against the issuer page sa
ved as PDF, by hand.
175 - The calculator against an independent calculation. I verifie
d it in a separate Claude chat with the FV formula and a month
-by-month loop: 3 000 Kč a month, 20 years, TER 0.03 % gives 1
517 433 Kč. The same case is a unit test, "matches independen
t calculation" in [`shared/utils/feeCalc.test.ts`](./shared/ut
ils/feeCalc.test.ts).
176 - The form submitted for real, then the row in Supabase, inclu
ding a repeat submit that updated the same row.
177 -- All six events in PostHog.
177 +- Every funnel event in PostHog.
178 - Lighthouse on mobile, production build: Performance 92, Acce
ssibility 100, Best Practices 100, SEO 100.
179 - The Czech texts read by me. I rewrote the ones I did not lik
e, for example the line above the form, the button text and th
e hint before the first change.
180

⏺ Line 168 quotes what the analytics prompt asked for at the time, so "six"
stays there. Change 1 committed (c6a1bfe).

Change 2: a separate heading for the bottom form:

⏺ Bash(python3 - <<'EOF'
def edit(p,a,b):…)
⎿  Updated app/components/LeadForm.vue (+1 -1)
52 <template>
53 <section class="lead">
54 <form novalidate @submit.prevent="submit">
55 - <h2 class="heading">{{ cs.form.heading }}</h2>
55 + <h2 class="heading">{{ placement === 'bottom' ? cs.form.h
         +eadingBottom : cs.form.heading }}</h2>
56 <label :for="inputId" class="label">{{ cs.form.emailLabel
           }}</label>
57 <input
58 :id="inputId"
⎿  Updated shared/content/cs.ts (+2 -0)
63 form: {
64 heading:
65 'Pošleme vám porovnání všech 4 fondů včetně evropských va
riant, které koupíte u českého brokera, s vašimi čísly.',
66 + // The bottom form follows the comparison and "how to buy", + so it asks instead of repeating the top line.
67 + headingBottom: 'Chcete porovnání všech 4 fondů i s evropský
+mi variantami?',
68 emailLabel: 'Váš e-mail',
69 emailPlaceholder: 'jan@email.cz',
70 submit: 'Poslat porovnání',
⎿  (timeout 4m)

⏺ The top form keeps its line and the bottom form shows the new question; the
button text is unchanged. Committing, pushing, and waiting for the deploy:

Called plugin:playwright:playwright, ran 1 shell command (ctrl+o to expand)

⏺ Both changes are live on production; the deploy finished at 19:15. The live
page now shows the result on load, the bottom form has its new heading, and
the old hint is gone. All 57 tests pass.

Commits:

- c6a1bfe feat: show calculator result on load
- 9626bcf feat: own heading for the bottom e-mail form

1. Result on load:

- The result for 3 000 Kč / 20 years is already in the page HTML, and the hint
  is removed. At 380×700 everything down to the source line still fits on the
  first screen (it ends at 695 px).
- Analytics: calc_result is removed from the code entirely. In a test browser
  whose PostHog requests I intercepted, only page_view was sent on load. After
  two slider moves and a years change, exactly one calc_change was sent.
- README: §5, §6, §8 (five events and the new funnel), §9 (same estimate,
  steps re-mapped to the new events), §10 hypothesis 3 (baseline visible on
  load, variant hidden), plus your rows in §11 and §12. I didn't change the
  history rows that mention calc_result, or the line quoting the original
  analytics prompt.

2. Bottom form: its heading is now "Chcete porovnání všech 4 fondů i s
   evropskými variantami?". The top form keeps its line, and both buttons still
   say "Poslat porovnání".

For you to do:

- PostHog funnel insight: it still has the calc_result step, which will now
  always be empty. Edit it to the five steps.
- Funnel screenshot: take a new one for docs/funnel.png. Until then, §8 notes
  that the screenshot shows the earlier six-step funnel; delete that line once
  you've replaced it.
- Test events in PostHog: my "blocked" test runs earlier today didn't actually
  block PostHog, because the address pattern was wrong. A few test events
  from localhost reached your project: page_view, calc_change, form_focus and
  form_submit. Filter by host = localhost to exclude them. My final check in
  this round intercepted everything correctly, so nothing from it was sent.

❯ New 5-step funnel screenshot from production is in docs/funnel.png.
Remove the note about the old six-step screenshot in README §8.
Fill the §13 line: "Tested on my phone (iPhone, Safari): both ad
variants, result on load, form, thank-you screen, comparison e-mail
delivered with working reply-to." Add a row to the §12 table: "My
test runs sent localhost events to PostHog because the blocking
pattern was wrong | agent noticed and reported it | funnel filters
out localhost". Commit and push.

Ran 1 shell command (ctrl+o to expand)

⏺ The new docs/funnel.png is in place. There's also an untracked
docs/funnel_old.png; I'll leave it out of the commit since you didn't mention
it. Making the three README edits:

⏺ Bash(python3 - <<'EOF'
p='README.md'; s=open(p).read()…)
⎿  Updated README.md (+2 -3)
109
110 ![Funnel in PostHog](docs/funnel.png)
111
112 -The screenshot is from the earlier six-step funnel, which stil
-l had `calc_result` between `calc_change` and `form_focus`.
113 -
112 Test run on localhost: 2 page views, 1 full path to thankyou_v
iew.
113
114 Leads are stored in Supabase (table `leads`: e-mail, monthly a
mount, years, ad variant, created_at, updated_at, emailed_at).
A repeat submit with the same e-mail updates the row.
...
194 | The form could be used to flood any inbox with e-mails
| Security review by a sep
arate agent | Limit per address; the second revi
ew found a race condition, fixed with one atomic DB update |
195 | NUXT_MAIL_FROM had no angle brackets and used an unverifiabl
e vercel.app domain | Agent tested against Resend's test addre
ss | Verified mail.kubandam.dev |
196 | Result was hidden until first input, leaving an empty first
screen | I noticed it on the live page | Shown on load, funnel
event changed |
197 +| My test runs sent localhost events to PostHog because the bl
+ocking pattern was wrong | Agent noticed and reported it | Fun
+nel filters out localhost |
198
199 ## 13. What is missing
200
202 -- Real phone test. Tested on my phone: …
201 +- Tested on my phone (iPhone, Safari): both ad variants, resul
+t on load, form, thank-you screen, comparison e-mail delivered + with working reply-to.
202 - A privacy policy page. The consent sentence promises deletio
n on request, and today that is a manual step (the visitor rep
lies to the e-mail). Nobody with legal training has checked th
e consent text.
203 - Automatic data refresh. The values are checked by hand. With
more time I would add a script that fetches the issuer pages
once a month and opens a pull request when a value changes.
204 - No real traffic yet, so the conversion estimate in section 9
and the A/B hypotheses in section 10 are untested. Only the h
eadline variant can be switched today (by URL); hypotheses 1 a
nd 3 need their variants built first.
⎿  (timeout 2m)

⏺ Done: committed as 2c97cd1 and pushed. No placeholders or TODOs are left in
the README.

- §8: the note about the old six-step screenshot is removed. The new
  docs/funnel.png is in the same commit.
- §13: your phone test line replaces the "Tested on my phone: …" placeholder,
  word for word.
- §12 table: your localhost-events row is added after the "result hidden" row.
- docs/funnel_old.png: not committed and still untracked. Delete it, or tell
  me if you want it in the repo.

Two things in the README now don't quite fit. Want me to fix them?

- §8 still says "Test run on localhost: 2 page views, 1 full path to
  thankyou_view." right under the screenshot, but the new screenshot is from
  production. I can change the line to describe the production run, or remove
  it.
- §13 is headed "What is missing", but the phone test line describes something
  you did. It would fit better in §12 under "How I checked the output".

❯ Yes and commit also funnel_old for backtrack of implementation
⏺ Checking that funnel_old.png is the earlier six-step screenshot (the one
committed before), so the README can describe it correctly:

Read 1 file (ctrl+o to expand)

⏺ It's byte-for-byte the earlier six-step screenshot from the localhost test
run. Updating §8 to point to it, moving the phone test line into §12, and
committing:

⏺ Bash(python3 - <<'EOF'
p='README.md'; s=open(p).read()…)
⎿  Updated README.md (+2 -2)
109
110 ![Funnel in PostHog](docs/funnel.png)
111
112 -Test run on localhost: 2 page views, 1 full path to thankyou_v
-iew.
112 +The screenshot is from production. The earlier six-step funnel + from my test run on localhost (2 page views, 1 full path to t
+hankyou_view, with `calc_result` still in it) is in [`docs/fun
          +nel_old.png`](./docs/funnel_old.png).
113
114 Leads are stored in Supabase (table `leads`: e-mail, monthly a
mount, years, ad variant, created_at, updated_at, emailed_at).
A repeat submit with the same e-mail updates the row.
115
...
173 - The calculator against an independent calculation. I verifie
d it in a separate Claude chat with the FV formula and a month
-by-month loop: 3 000 Kč a month, 20 years, TER 0.03 % gives 1
517 433 Kč. The same case is a unit test, "matches independen
t calculation" in [`shared/utils/feeCalc.test.ts`](./shared/ut
ils/feeCalc.test.ts).
174 - The form submitted for real, then the row in Supabase, inclu
ding a repeat submit that updated the same row.
175 - Every funnel event in PostHog.
176 +- The live page on my phone (iPhone, Safari): both ad variants
+, result on load, form, thank-you screen, comparison e-mail de
+livered with working reply-to.
177 - Lighthouse on mobile, production build: Performance 92, Acce
ssibility 100, Best Practices 100, SEO 100.
178 - The Czech texts read by me. I rewrote the ones I did not lik
e, for example the line above the form, the button text and th
e hint before the first change.
179
...
199
200 ## 13. What is missing
201
201 -- Tested on my phone (iPhone, Safari): both ad variants, resul
-t on load, form, thank-you screen, comparison e-mail delivered - with working reply-to.
202 - A privacy policy page. The consent sentence promises deletio
n on request, and today that is a manual step (the visitor rep
lies to the e-mail). Nobody with legal training has checked th
e consent text.
203 - Automatic data refresh. The values are checked by hand. With
more time I would add a script that fetches the issuer pages
once a month and opens a pull request when a value changes.
204 - No real traffic yet, so the conversion estimate in section 9
and the A/B hypotheses in section 10 are untested. Only the h
eadline variant can be switched today (by URL); hypotheses 1 a
nd 3 need their variants built first.
⎿  (timeout 2m)

⏺ I committed funnel_old.png and made both README fixes as e8d9639, then pushed.

- §8: the line under the screenshot now says it's from production. It links to
  docs/funnel_old.png as the earlier six-step localhost funnel (2 page views,
  1 full path to thankyou_view, calc_result still in it). I checked that the
  file is identical to the screenshot committed before, so that description is
  accurate.
- §12 "How I checked the output": your phone test is a bullet there now ("The
  live page on my phone (iPhone, Safari): …"). It's no longer in §13, which
  now lists only things that are missing.

Two small things I left as they are:

- Lighthouse: the 92 in §12 was measured before the result started showing on
  load. I haven't re-run it since, so I can't say whether that change affected
  the score.
- Repository layout: the README still says /docs holds "funnel screenshot"
  (singular).

❯ Run lighthouse again

⏺ I'll run it against the live production page, so the score reflects real
Vercel hosting. Lighthouse visits would otherwise show up as real page_view
events in your production funnel, so I'm blocking PostHog requests in the
Lighthouse browser. PostHog only loads after the page has loaded anyway. Three
runs:

Ran 1 shell command (ctrl+o to expand)

⏺ Production scores are volatile (78, 99, 91), likely due to a cold server or
CDN cache, so I'll run four more production tests and take the median per
Lighthouse's recommendation, while also re-running the local production-build
test to compare against the earlier 92.

Ran 1 shell command (ctrl+o to expand)

⏺ Showing the result on load did not change the score. The same test as before
gives the same result: 92 / 100 / 100 / 100.

┌──────────────────────┬───────────────┬───────────────┬────────────┬─────┐
│ Setup │ Performance │ Accessibility │ Best │ SEO │
│ │ │ │ practices │ │
├──────────────────────┼───────────────┼───────────────┼────────────┼─────┤
│ Local production │ │ │ │ │
│ build (same test as │ 92, 92, 92 │ 100 │ 100 │ 100 │
│ the README's 92), 3 │ │ │ │ │
│ runs │ │ │ │ │
├──────────────────────┼───────────────┼───────────────┼────────────┼─────┤
│ Live site on Vercel, │ median 91 │ 100 │ 100 │ 100 │
│ 7 runs │ (range 78–99) │ │ │ │
└──────────────────────┴───────────────┴───────────────┴────────────┴─────┘

On the live site:

- Typical run: first paint 1.9 s, main content 3.0 s, no blocking time, no
  layout shift.
- The main content element is now the result heading "Za 20 let budete mít",
  because the result is visible on load.
- The scores vary because of the real network and Vercel, not the page. The 78
  was the first run (probably a cold cache); the other six were 90–99.
- PostHog was blocked in the Lighthouse browser, so none of the 7 runs reached
  your production funnel (0 requests sent).

README §12 ("Lighthouse on mobile, production build: … 92") is still accurate,
since that's the local production-build test. Should I add the live-site
result (median 91 over 7 runs) next to it?

❯ Yes, add the live-site result next to the local one in README §12,
one line: "Live site on Vercel, 7 runs: median 91 (78–99, the 78 was
a cold first run), accessibility, best practices and SEO 100."
I also take screenshot of my lighthouse performance, u can add it to readme
too @docs/performance.png
Commit and push.

⏺ Checking the screenshot first so the README describes it accurately:

Read 1 file, ran 1 shell command (ctrl+o to expand)

⏺ I'll caption the Lighthouse screenshot (98/100/100/100) as one individual run
rather than a median, and update the /docs line in the repository layout to
reflect the three screenshots now stored there.

⏺ Bash(python3 - <<'EOF'
p='README.md'; s=open(p).read()…)
⎿  Updated README.md (+6 -1)
175 - Every funnel event in PostHog.
176 - The live page on my phone (iPhone, Safari): both ad variants
, result on load, form, thank-you screen, comparison e-mail de
livered with working reply-to.
177 - Lighthouse on mobile, production build: Performance 92, Acce
ssibility 100, Best Practices 100, SEO 100.
178 +- Live site on Vercel, 7 runs: median 91 (78–99, the 78 was a
+cold first run), accessibility, best practices and SEO 100.
179 +
180 + ![Lighthouse on the live site](docs/performance.png)
181 +
182 + One of my own Lighthouse runs on the live site: 98 / 100 / 1
+00 / 100.
183 - The Czech texts read by me. I rewrote the ones I did not lik
e, for example the line above the form, the button text and th
e hint before the first change.
184
185 **Where the AI got it wrong.**
...
243 /ai-log exported Claude Code conversations
244 /app Nuxt app: page, components, composables, PostHog p
lugin, CSS
245 /data ETF data with sources and dates
241 -/docs funnel screenshot
246 +/docs funnel and Lighthouse screenshots
247 /public self-hosted fonts
248 /scripts data check that runs before every build
249 /server API route for leads, Supabase, e-mail template and
Resend
⎿  (timeout 2m)

⏺ I've added the live-site Lighthouse line and your screenshot to the README,
and pushed it as 98d8eb1.

- §12, "How I checked the output": your line is right under the local result:
  "Live site on Vercel, 7 runs: median 91 (78–99, the 78 was a cold first
  run), accessibility, best practices and SEO 100."
- Screenshot: docs/performance.png is committed and shown right below that
  line. The caption says it's one of your own runs on the live site (98 / 100
  / 100 / 100), so nobody mistakes it for the median.
- Repository layout: /docs now reads "funnel and Lighthouse screenshots".

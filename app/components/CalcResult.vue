<script setup lang="ts">
import { cs, formatCsDate } from '#shared/content/cs'
import { CALC_ASSUMPTIONS, formatCzk } from '#shared/utils/feeCalc'

const { result, preview, years } = useCalculator()
const { dataCheckedDate } = useEtfs()

// Before the first input the rows are rendered invisibly with the default numbers,
// so the block already has its final height and nothing below jumps.
const shown = computed(() => result.value ?? preview.value)
const hidden = computed(() => !result.value)

const ter = (pct: number) => pct.toLocaleString('cs-CZ', { maximumFractionDigits: 4 })
// VOO and IVV share a TER, so "cheapest" can be more than one fund.
const tickersAt = (value: number) => shown.value.rows.filter(r => r.endValue === value).map(r => r.ticker).join(', ')
</script>

<template>
  <div class="result" aria-live="polite">
    <p v-if="hidden" class="hint">{{ cs.calc.hint }}</p>

    <div class="sheet" :class="{ 'is-hidden': hidden }" :aria-hidden="hidden">
      <h2 class="heading">{{ cs.calc.resultHeading(years) }}</h2>
      <ul class="rows">
        <li v-for="row in shown.rows" :key="row.ticker" class="row">
          <div class="line">
            <span class="ticker">{{ row.ticker }}</span>
            <span class="leader" aria-hidden="true" />
            <span class="value num">{{ formatCzk(row.endValue) }}</span>
          </div>
          <p class="small">{{ cs.calc.feeLine(ter(row.terPct), formatCzk(row.feesPaid)) }}</p>
        </li>
      </ul>

      <div class="gap">
        <div class="line">
          <span class="gap-label">{{ cs.calc.gapLabel(years) }}</span>
          <span class="leader" aria-hidden="true" />
          <span class="gap-value num">{{ formatCzk(shown.feeGap) }}</span>
        </div>
        <p class="small">
          {{ cs.calc.gapWho(tickersAt(shown.rows[0]!.endValue), tickersAt(shown.rows.at(-1)!.endValue)) }}
        </p>
      </div>

      <p class="small note">{{ cs.calc.source(formatCsDate(dataCheckedDate)) }}</p>
      <p class="small note">{{ cs.calc.assumption(CALC_ASSUMPTIONS.annualReturnPct) }}</p>
    </div>
  </div>
</template>

<style scoped>
.result {
  position: relative;
  margin-top: var(--space-5);
  border-top: 1px solid var(--ink);
  padding-top: var(--space-3);
}

.sheet.is-hidden {
  visibility: hidden;
}

.hint {
  position: absolute;
  inset: var(--space-5) 0 auto;
  font-family: var(--font-serif);
  font-size: 1.375rem;
  line-height: 1.3;
  color: var(--muted);
}

.heading {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--muted);
}

.rows {
  margin-top: var(--space-2);
}

.row + .row {
  margin-top: var(--space-2);
}

.line {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.leader {
  flex: 1;
  min-width: var(--space-4);
  border-bottom: 1px dotted var(--muted);
  transform: translateY(-0.25em);
}

.ticker {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.value {
  font-size: 1.125rem;
  font-weight: 500;
}

.gap {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 2px solid var(--ink);
}

.gap-label {
  font-weight: 600;
}

.gap-value {
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--rust);
}

.note {
  margin-top: var(--space-2);
}
</style>

<script setup lang="ts">
import { cs } from '#shared/content/cs'
import { CALC_ASSUMPTIONS, formatCzk } from '#shared/utils/feeCalc'

const { result, years } = useCalculator()
const ter = (pct: number) => pct.toLocaleString('cs-CZ', { maximumFractionDigits: 4 })
// VOO and IVV share a TER, so "cheapest" can be more than one fund.
const tickersAt = (value: number) => result.value!.rows.filter(r => r.endValue === value).map(r => r.ticker).join(', ')
</script>

<template>
  <div v-if="result" aria-live="polite">
    <h3>{{ cs.calc.resultHeading(years) }}</h3>
    <ul>
      <li v-for="row in result.rows" :key="row.ticker">
        <strong>{{ row.ticker }}</strong>: {{ formatCzk(row.endValue) }}
        <small>({{ cs.calc.terLabel(ter(row.terPct)) }})</small>
      </li>
    </ul>
    <p>
      {{ cs.calc.feeGap(formatCzk(result.feeGap), tickersAt(result.rows[0]!.endValue), tickersAt(result.rows.at(-1)!.endValue)) }}
    </p>
    <p><small>{{ cs.calc.assumption(CALC_ASSUMPTIONS.annualReturnPct) }}</small></p>
  </div>
</template>

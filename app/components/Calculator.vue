<script setup lang="ts">
import { cs } from '#shared/content/cs'
import { MONTHLY, YEARS, formatCzk } from '#shared/utils/feeCalc'

const { monthly, years, onUserInput } = useCalculator()
</script>

<template>
  <section class="calc">
    <div class="amount">
      <label for="calc-monthly" class="label">{{ cs.calc.monthlyLabel }}</label>
      <output for="calc-monthly" class="amount-value num">{{ formatCzk(monthly) }}</output>
      <input
        id="calc-monthly"
        v-model.number="monthly"
        class="slider"
        type="range"
        :min="MONTHLY.min"
        :max="MONTHLY.max"
        :step="MONTHLY.step"
        :aria-valuetext="formatCzk(monthly)"
        @input="onUserInput('monthly')"
      >
    </div>

    <fieldset class="years">
      <legend class="label">{{ cs.calc.yearsLabel }}</legend>
      <div class="segments">
        <label v-for="y in YEARS" :key="y" class="segment">
          <input
            v-model="years"
            class="visually-hidden"
            type="radio"
            name="calc-years"
            :value="y"
            @change="onUserInput('years')"
          >
          <span>{{ cs.calc.yearsOption(y) }} <span class="unit">{{ cs.calc.yearsUnit }}</span></span>
        </label>
      </div>
    </fieldset>

    <CalcResult />
  </section>
</template>

<style scoped>
.calc {
  margin-top: var(--space-4);
}

.label {
  display: block;
  font-size: 0.875rem;
  color: var(--muted);
}

.amount-value {
  display: block;
  font-size: 2.75rem;
  line-height: 1.1;
  font-weight: 500;
  letter-spacing: -0.02em;
  margin-top: var(--space-1);
}

/* Range: flat track, heavy square-ish thumb. No fill gradient. */
.slider {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  width: 100%;
  height: var(--tap);
  margin: var(--space-2) 0 0;
  background: transparent;
  cursor: pointer;
  touch-action: pan-y;
}

.slider::-webkit-slider-runnable-track {
  height: 4px;
  background: var(--ink);
  border-radius: 0;
}

.slider::-moz-range-track {
  height: 4px;
  background: var(--ink);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 28px;
  height: 28px;
  margin-top: -12px;
  border-radius: 50%;
  background: var(--paper);
  border: 3px solid var(--ink);
}

.slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--paper);
  border: 3px solid var(--ink);
}

.years {
  margin-top: var(--space-4);
}

.segments {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: var(--space-2);
  border: 1px solid var(--ink);
  border-radius: var(--radius);
}

.segment {
  display: block;
  cursor: pointer;
}

.segment + .segment {
  border-left: 1px solid var(--ink);
}

.segment > span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25em;
  min-height: var(--tap);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.unit {
  font-weight: 400;
  font-size: 0.875rem;
}

.segment input:checked + span {
  background: var(--ink);
  color: var(--paper);
}

.segment input:focus-visible + span {
  outline: 2px solid var(--rust);
  outline-offset: -4px;
}
</style>

<script setup lang="ts">
import { cs } from '#shared/content/cs'
import { MONTHLY, YEARS, formatCzk } from '#shared/utils/feeCalc'

const { monthly, years, onUserInput } = useCalculator()
</script>

<template>
  <section>
    <h2>{{ cs.calc.heading }}</h2>

    <label for="calc-monthly">{{ cs.calc.monthlyLabel }}</label>
    <input
      id="calc-monthly"
      v-model.number="monthly"
      type="range"
      :min="MONTHLY.min"
      :max="MONTHLY.max"
      :step="MONTHLY.step"
      @input="onUserInput('monthly')"
    >
    <output for="calc-monthly">{{ formatCzk(monthly) }}</output>

    <fieldset>
      <legend>{{ cs.calc.yearsLabel }}</legend>
      <label v-for="y in YEARS" :key="y">
        <input v-model="years" type="radio" name="calc-years" :value="y" @change="onUserInput('years')">
        {{ cs.calc.yearsOption(y) }}
      </label>
    </fieldset>

    <CalcResult />
  </section>
</template>

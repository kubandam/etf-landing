<script setup lang="ts">
import { cs, formatCsDate } from '#shared/content/cs'
import { CALC_ASSUMPTIONS, compareAll, formatCzk } from '#shared/utils/feeCalc'
import { formatPct } from '#shared/utils/format'

const submitted = useLead()
const s = submitted.value!
const { allFunds, dataCheckedDate } = useEtfs()
const rows = compareAll(s.monthly, s.years, allFunds)

const variant = useVariant()
const track = useTrack()
const root = ref<HTMLElement>()
onMounted(() => {
  track('thankyou_view', { placement: s.placement, variant, emailed: s.emailed })
  root.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  root.value?.focus({ preventScroll: true })
})
</script>

<template>
  <section ref="root" class="thanks" tabindex="-1" aria-labelledby="thanks-heading">
    <h2 id="thanks-heading" class="heading">{{ cs.thanks.heading }}</h2>
    <p class="restate">{{ cs.thanks.restate(formatCzk(s.monthly), s.years) }}</p>
    <p class="mail" role="status">{{ s.emailed ? cs.thanks.emailed : cs.thanks.notEmailed }}</p>

    <ul class="funds">
      <li v-for="r in rows" :key="r.ticker" class="fund">
        <div class="line">
          <span class="ticker">{{ r.ticker }}</span>
          <span class="leader" aria-hidden="true" />
          <span class="value num">{{ formatCzk(r.endValue) }}</span>
        </div>
        <p class="small">{{ cs.thanks.usLabel }} · {{ cs.thanks.feeLine(formatPct(r.terPct), formatCzk(r.feesPaid)) }}</p>

        <div class="ucits">
          <div class="line">
            <span class="ticker">{{ r.ucits.ticker }}</span>
            <span class="leader" aria-hidden="true" />
            <span class="value num">{{ formatCzk(r.ucits.endValue) }}</span>
          </div>
          <p class="small">{{ cs.thanks.ucitsLabel }} · ISIN <span class="num">{{ r.ucits.isin }}</span></p>
          <p class="small">{{ cs.thanks.feeLine(formatPct(r.ucits.terPct), formatCzk(r.ucits.feesPaid)) }}</p>
        </div>
      </li>
    </ul>

    <p class="small note">{{ cs.calc.source(formatCsDate(dataCheckedDate)) }}</p>
    <p class="small note">{{ cs.calc.assumption(CALC_ASSUMPTIONS.annualReturnPct) }}</p>
  </section>
</template>

<style scoped>
.thanks {
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 2px solid var(--ink);
  outline: none;
  scroll-margin-top: var(--space-4);
}

.heading {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
}

.restate {
  margin-top: var(--space-2);
  font-weight: 500;
}

.mail {
  margin-top: var(--space-1);
  color: var(--muted);
}

.funds {
  margin-top: var(--space-4);
  border-top: 1px solid var(--ink);
}

.fund {
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--rule);
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

.ucits {
  margin-top: var(--space-2);
  margin-left: var(--space-4);
  padding-left: var(--space-3);
  border-left: 2px solid var(--ink);
}

.note {
  margin-top: var(--space-3);
}
</style>

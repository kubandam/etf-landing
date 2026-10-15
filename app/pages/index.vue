<script setup lang="ts">
import { cs } from '#shared/content/cs'
import { headline } from '#shared/content/headline'

const variant = useVariant()
const track = useTrack()
const { pageFunds } = useEtfs()
const submitted = useLead()
// Read during setup, so the server-rendered HTML already has the right headline (no flash).
const h = headline(variant, pageFunds)
onMounted(() => track('page_view', { variant }))
</script>

<template>
  <main class="page">
    <header>
      <p class="kicker">{{ cs.hero.kicker }}</p>
      <h1 class="headline">
        {{ h.question }}
        <span class="fact">{{ h.fact }}</span>
      </h1>
    </header>
    <Calculator />
    <ThankYou v-if="submitted?.placement === 'top'" />
    <LeadForm v-else-if="!submitted" placement="top" />
    <CompareTable :funds="pageFunds" />
    <HowToBuy />
    <ThankYou v-if="submitted?.placement === 'bottom'" />
    <LeadForm v-else-if="!submitted" placement="bottom" />
    <SiteFooter />
  </main>
</template>

<style scoped>
.kicker {
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.fact {
  display: block;
  margin-top: var(--space-1);
  font-family: var(--font-sans);
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0;
}

.headline {
  margin-top: var(--space-2);
  font-family: var(--font-serif);
  font-size: 1.875rem;
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
</style>

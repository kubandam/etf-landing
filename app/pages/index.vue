<script setup lang="ts">
import { cs } from '#shared/content/cs'

const variant = useVariant()
const track = useTrack()
const { pageFunds } = useEtfs()
onMounted(() => track('page_view', { variant }))
</script>

<template>
  <main class="page">
    <header>
      <p class="kicker">{{ cs.hero.kicker }}</p>
      <h1 class="headline">{{ cs.hero.headline.a }}</h1>
    </header>
    <Calculator />
    <LeadForm placement="top" />
    <CompareTable :funds="pageFunds" />
  </main>
</template>

<style scoped>
.kicker {
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  color: var(--muted);
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

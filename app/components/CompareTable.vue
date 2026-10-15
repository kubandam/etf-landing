<script setup lang="ts">
import type { Etf } from '#shared/types/etf'
import { cs } from '#shared/content/cs'
import { formatPct, formatUsdBn } from '#shared/utils/format'

defineProps<{ funds: Etf[] }>()
</script>

<template>
  <section class="compare" aria-labelledby="compare-heading">
    <h2 id="compare-heading" class="heading">{{ cs.compare.heading }}</h2>
    <p class="intro">{{ cs.compare.intro }}</p>

    <ul class="funds">
      <li v-for="f in funds" :key="f.ticker" class="fund">
        <h3 class="title">
          <span class="ticker">{{ f.ticker }}</span>
          <span class="name small">{{ f.name }}</span>
        </h3>

        <dl class="stats">
          <div class="stat">
            <dt>{{ cs.compare.ter }}</dt>
            <span class="leader" aria-hidden="true" />
            <dd class="num">{{ formatPct(f.terPct.value) }}</dd>
          </div>
          <div class="stat">
            <dt>{{ cs.compare.size }}</dt>
            <span class="leader" aria-hidden="true" />
            <dd class="num">{{ formatUsdBn(f.aumUsd.value) }}</dd>
          </div>
          <div class="stat">
            <dt>{{ cs.compare.yield }} <span class="small">({{ cs.compare.yieldNote }})</span></dt>
            <span class="leader" aria-hidden="true" />
            <dd class="num">{{ formatPct(f.dividendYieldPct.value) }}</dd>
          </div>
        </dl>

        <p class="ucits">
          <span class="small">{{ cs.compare.ucits }}</span>
          <span class="ucits-value">{{ cs.compare.ucitsLine(f.ucits.ticker, formatPct(f.ucits.terPct.value)) }}</span>
        </p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.compare {
  margin-top: var(--space-7);
}

.heading {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
}

.intro {
  margin-top: var(--space-2);
  color: var(--muted);
}

.funds {
  margin-top: var(--space-4);
  border-top: 1px solid var(--ink);
}

.fund {
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--rule);
}

.title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 var(--space-2);
  font-size: 1rem;
  font-weight: 400;
}

.ticker {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.stats {
  margin: var(--space-2) 0 0;
}

.stat {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-1) 0;
}

.stat dt {
  color: var(--muted);
  font-size: 0.9375rem;
}

.stat dd {
  margin: 0;
  font-weight: 500;
}

.leader {
  flex: 1;
  min-width: var(--space-4);
  border-bottom: 1px dotted var(--rule);
  transform: translateY(-0.25em);
}

.ucits {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-2);
  border-top: 1px dotted var(--muted);
}

.ucits-value {
  font-weight: 500;
}
</style>

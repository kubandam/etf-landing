<script setup lang="ts">
import type { Etf } from '#shared/types/etf'
import { cs, formatCsDate } from '#shared/content/cs'
import { CALC_ASSUMPTIONS } from '#shared/utils/feeCalc'

const { allFunds, dataCheckedDate } = useEtfs()

/** Unique source URLs per ticker (US fund and its UCITS version listed separately). */
function sources(f: Etf) {
  const us = [f.exchange, f.terPct, f.aumUsd, f.dividendYieldPct].map(v => v.source)
  const eu = [f.ucits.isin, f.ucits.terPct].map(v => v.source)
  return [
    { ticker: f.ticker, urls: [...new Set(us)] },
    { ticker: f.ucits.ticker, urls: [...new Set(eu)] },
  ]
}
const rows = allFunds.flatMap(sources)
const host = (url: string) => new URL(url).hostname.replace(/^www\./, '')
</script>

<template>
  <footer class="footer">
    <h2 class="heading">{{ cs.footer.sourcesHeading }}</h2>
    <p class="small">{{ cs.footer.sourcesIntro }} {{ cs.footer.checked(formatCsDate(dataCheckedDate)) }}</p>
    <ul class="sources">
      <li v-for="r in rows" :key="r.ticker" class="source">
        <span class="ticker">{{ r.ticker }}</span>
        <span class="links">
          <a v-for="u in r.urls" :key="u" :href="u" target="_blank" rel="noopener noreferrer">{{ host(u) }}</a>
        </span>
      </li>
    </ul>
    <p class="small note">{{ cs.footer.assumption(CALC_ASSUMPTIONS.annualReturnPct) }}</p>
    <p class="advice">{{ cs.footer.notAdvice }}</p>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: var(--space-7);
  padding-top: var(--space-4);
  border-top: 2px solid var(--ink);
}

.heading {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.sources {
  margin-top: var(--space-3);
}

.source {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  border-bottom: 1px solid var(--rule);
}

.ticker {
  flex: 0 0 3.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--space-3);
}

/* Each link is a full 44 px tap target. */
.links a {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap);
  color: var(--ink);
  font-size: 0.875rem;
  text-decoration-color: var(--muted);
  text-underline-offset: 3px;
}

.note {
  margin-top: var(--space-4);
}

.advice {
  margin-top: var(--space-3);
  font-weight: 600;
}
</style>

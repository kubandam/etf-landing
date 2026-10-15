<script setup lang="ts">
import { cs } from '#shared/content/cs'

const { allFunds } = useEtfs()
const [noKid, ucits, brokers] = cs.howToBuy.points
</script>

<template>
  <section class="buy" aria-labelledby="buy-heading">
    <h2 id="buy-heading" class="heading">{{ cs.howToBuy.heading }}</h2>
    <ol class="points">
      <li>{{ noKid }}</li>
      <li>
        {{ ucits }}
        <ul class="map">
          <li v-for="f in allFunds" :key="f.ticker" class="map-row">
            <span class="pair">{{ cs.howToBuy.mapping(f.ticker, f.ucits.ticker) }}</span>
            <span class="small num">{{ cs.howToBuy.isin }} {{ f.ucits.isin.value }}</span>
          </li>
        </ul>
      </li>
      <li>{{ brokers }}</li>
    </ol>
  </section>
</template>

<style scoped>
.buy {
  margin-top: var(--space-7);
}

.heading {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
}

.points {
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
  counter-reset: point;
  border-top: 1px solid var(--ink);
}

.points > li {
  counter-increment: point;
  position: relative;
  padding: var(--space-4) 0 var(--space-4) 2rem;
  border-bottom: 1px solid var(--rule);
}

.points > li::before {
  content: counter(point);
  position: absolute;
  left: 0;
  top: var(--space-4);
  font-family: var(--font-serif);
  font-size: 1.25rem;
  line-height: 1.2;
}

.map {
  margin-top: var(--space-3);
}

.map-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0 var(--space-3);
  padding: var(--space-1) 0;
}

.pair {
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>

import type { Etf } from '../types/etf'
import type { Variant } from '../utils/variant'
import { MONTHLY, YEARS_INITIAL, compareFunds, formatCzk } from '../utils/feeCalc'
import { cs } from './cs'

export interface Headline {
  question: string
  fact: string
}

/**
 * First-screen headline for the ad version.
 * A quotes what the most expensive page fund costs in fees at the calculator defaults
 * (3 000 Kč / 20 let), rounded down to whole thousands so "přes" stays true.
 */
export function headline(variant: Variant, pageFunds: Etf[]): Headline {
  if (variant === 'b') return { question: cs.hero.headline.b.question, fact: cs.hero.headline.b.fact() }

  const priciest = compareFunds(MONTHLY.initial, YEARS_INITIAL, pageFunds).rows.at(-1)!
  const floored = Math.floor(priciest.feesPaid / 1000) * 1000
  return {
    question: cs.hero.headline.a.question,
    fact: cs.hero.headline.a.fact(priciest.ticker, YEARS_INITIAL, formatCzk(floored)),
  }
}

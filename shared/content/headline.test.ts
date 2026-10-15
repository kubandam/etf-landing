import { expect, test } from 'vitest'
import type { EtfData } from '../types/etf'
import data from '../../data/etfs.json'
import { headline } from './headline'

const pageFunds = (data as EtfData).funds.filter(f => f.showOnPage)
const text = (h: { question: string; fact: string }) => `${h.question} ${h.fact}`.replace(/ /g, ' ')

// If this fails after a data change, the ad A text in ads/README.md must change too.
test('A matches ad A', () => {
  expect(text(headline('a', pageFunds))).toBe('Kolik vás stojí poplatek ETF? U SPY za 20 let přes 16 000 Kč.')
})

test('B matches ad B', () => {
  expect(text(headline('b', pageFunds))).toBe('Který S&P 500 ETF si vybrat? Stejný index, jiné poplatky.')
})

import { describe, expect, test } from 'vitest'
import type { Etf } from '../types/etf'
import { CALC_ASSUMPTIONS, MONTHLY, YEARS, compareAll, compareFunds, endValue, formatCzk } from './feeCalc'

/** Minimal Etf with only the fields the calculator reads. */
function fund(ticker: string, terPct: number): Etf {
  const v = <T>(value: T) => ({ value, source: 'https://example.com', checked: '2026-10-14' })
  return {
    ticker,
    name: ticker,
    issuer: 'x',
    issuerUrl: 'https://example.com',
    showOnPage: true,
    exchange: v('NYSE Arca'),
    terPct: v(terPct),
    aumUsd: v(1),
    dividendYieldPct: v(1),
    ucits: { ticker: 'U', name: 'U', issuerUrl: 'https://example.com', isin: v('IE0'), terPct: v(0.1) },
  }
}

describe('endValue', () => {
  test('return 0 and TER 0 → sum of deposits', () => {
    expect(endValue({ monthly: 3000, years: 20, annualReturnPct: 0, terPct: 0 })).toBe(3000 * 20 * 12)
  })

  test('0 years → 0', () => {
    expect(endValue({ monthly: 3000, years: 0, annualReturnPct: 7, terPct: 0.03 })).toBe(0)
  })

  test('higher TER → strictly lower end value', () => {
    const base = { monthly: 3000, years: 20, annualReturnPct: 7 }
    expect(endValue({ ...base, terPct: 0.0945 })).toBeLessThan(endValue({ ...base, terPct: 0.03 }))
    expect(endValue({ ...base, terPct: 0.03 })).toBeLessThan(endValue({ ...base, terPct: 0.02 }))
  })

  test('equals month-by-month simulation (deposit at month end, net rate compounded monthly)', () => {
    const monthly = 3000
    const years = 20
    const i = (1 + (7 - 0.0945) / 100) ** (1 / 12) - 1
    let balance = 0
    for (let m = 0; m < years * 12; m++) balance = balance * (1 + i) + monthly
    expect(endValue({ monthly, years, annualReturnPct: 7, terPct: 0.0945 })).toBeCloseTo(balance, 6)
  })

  test('one year, 1 000/month, 12 % net → matches spreadsheet FV(1.12^(1/12)-1; 12; -1000)', () => {
    // =FV(1.12^(1/12)-1; 12; -1000) = 12 646.48 (end-of-month deposits)
    expect(endValue({ monthly: 1000, years: 1, annualReturnPct: 12, terPct: 0 })).toBeCloseTo(12646.48, 1)
  })

  test.each([
    [MONTHLY.min, YEARS[0]],
    [MONTHLY.min, YEARS[3]],
    [MONTHLY.max, YEARS[0]],
    [MONTHLY.max, YEARS[3]],
  ])('bounds: %i CZK / %i years → finite and > 0', (monthly, years) => {
    const v = endValue({ monthly, years, annualReturnPct: CALC_ASSUMPTIONS.annualReturnPct, terPct: 0.0945 })
    expect(Number.isFinite(v)).toBe(true)
    expect(v).toBeGreaterThan(0)
  })

  // Verified independently (FV formula and a month-by-month loop) outside this repo.
  test('matches independent calculation', () => {
    const v = endValue({ monthly: 3000, years: 20, annualReturnPct: 7, terPct: 0.03 })
    expect(Math.round(v)).toBe(1517433)
    expect(formatCzk(v)).toBe('1 517 433 Kč')
  })
})

describe('compareFunds', () => {
  const funds = [fund('SPY', 0.0945), fund('VOO', 0.03), fund('IVV', 0.03)]

  test('rows sorted by end value desc, gap = best − worst', () => {
    const { rows, feeGap } = compareFunds(3000, 20, funds)
    expect(rows.map(r => r.ticker)).toEqual(['VOO', 'IVV', 'SPY'])
    for (let k = 1; k < rows.length; k++) expect(rows[k - 1]!.endValue).toBeGreaterThanOrEqual(rows[k]!.endValue)
    expect(feeGap).toBeCloseTo(rows[0]!.endValue - rows[rows.length - 1]!.endValue, 6)
    expect(feeGap).toBeGreaterThan(0)
  })

  test('feesPaid = end value without fees − end value with fees', () => {
    const { rows } = compareFunds(3000, 20, funds)
    const noFee = endValue({ monthly: 3000, years: 20, annualReturnPct: CALC_ASSUMPTIONS.annualReturnPct, terPct: 0 })
    for (const r of rows) expect(r.feesPaid).toBeCloseTo(noFee - r.endValue, 6)
  })

  test('equal TERs → gap 0', () => {
    expect(compareFunds(3000, 20, [fund('A', 0.03), fund('B', 0.03)]).feeGap).toBe(0)
  })
})

describe('constants', () => {
  test('assumed return is 7 %', () => {
    expect(CALC_ASSUMPTIONS.annualReturnPct).toBe(7)
  })

  test('slider and years match spec', () => {
    expect(MONTHLY).toMatchObject({ min: 500, max: 20000, step: 500 })
    expect([...YEARS]).toEqual([5, 10, 20, 30])
  })
})

describe('formatCzk', () => {
  test('cs-CZ grouping, no decimals, NBSP before Kč', () => {
    // cs-CZ groups with U+00A0 (NBSP); both separators are NBSP.
    expect(formatCzk(1234567)).toBe('1 234 567 Kč')
  })

  test('rounds to whole crowns', () => {
    expect(formatCzk(999.6)).toBe('1 000 Kč')
  })
})

describe('compareAll', () => {
  const funds = [fund('SPY', 0.0945), fund('VOO', 0.03)]
  funds[0]!.ucits.terPct.value = 0.03
  funds[1]!.ucits.terPct.value = 0.07

  test('US and UCITS rows use their own TER', () => {
    const rows = compareAll(3000, 20, funds)
    const r = CALC_ASSUMPTIONS.annualReturnPct
    const spy = rows.find(x => x.ticker === 'SPY')!
    expect(spy.endValue).toBe(endValue({ monthly: 3000, years: 20, annualReturnPct: r, terPct: 0.0945 }))
    expect(spy.ucits.endValue).toBe(endValue({ monthly: 3000, years: 20, annualReturnPct: r, terPct: 0.03 }))
    expect(spy.ucits.feesPaid).toBeLessThan(spy.feesPaid)
  })

  test('sorted by US end value desc, US numbers equal compareFunds', () => {
    const rows = compareAll(3000, 20, funds)
    const cf = compareFunds(3000, 20, funds).rows
    expect(rows.map(x => [x.ticker, x.endValue])).toEqual(cf.map(x => [x.ticker, x.endValue]))
  })
})

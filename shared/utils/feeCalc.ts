import type { Etf } from '../types/etf'

/**
 * Assumptions shown next to the result and in the e-mail.
 * 7 % is the assumed yearly return of the S&P 500 before fees (owner decision, README §11).
 */
export const CALC_ASSUMPTIONS = { annualReturnPct: 7 } as const

export const MONTHLY = { min: 500, max: 20000, step: 500, initial: 3000 } as const
export const YEARS = [5, 10, 20, 30] as const
export type Years = (typeof YEARS)[number]
export const YEARS_INITIAL: Years = 20

export interface EndValueInput {
  /** Deposit per month in CZK. */
  monthly: number
  years: number
  /** Yearly return before fees in percent, e.g. 7. */
  annualReturnPct: number
  /** Fund TER in percent per year, e.g. 0.03. */
  terPct: number
}

/**
 * Value in CZK after `years` of monthly deposits.
 *
 * - TER lowers the yearly rate: net = annualReturnPct − terPct.
 * - Net yearly rate is converted to an equivalent monthly rate: i = (1 + net)^(1/12) − 1,
 *   so a full year compounds to exactly `net`.
 * - Deposit at the end of each month, no deposit fees, no taxes, no FX.
 *
 * Spreadsheet equivalent (Excel / Google Sheets, CZ locale uses `;`):
 *   =FV((1 + (return − TER)/100)^(1/12) − 1; years*12; −monthly)
 */
export function endValue({ monthly, years, annualReturnPct, terPct }: EndValueInput): number {
  const months = years * 12
  const i = (1 + (annualReturnPct - terPct) / 100) ** (1 / 12) - 1
  if (i === 0) return monthly * months
  return monthly * (((1 + i) ** months - 1) / i)
}

export interface CompareRow {
  ticker: string
  terPct: number
  endValue: number
  /** End value with TER 0 minus end value with this fund's TER. */
  feesPaid: number
}

export interface Comparison {
  /** Sorted by end value, highest first (= cheapest fund first). */
  rows: CompareRow[]
  /** Difference between the cheapest and the most expensive fund, in CZK. */
  feeGap: number
}

export function compareFunds(monthly: number, years: number, funds: Etf[]): Comparison {
  const { annualReturnPct } = CALC_ASSUMPTIONS
  const noFee = endValue({ monthly, years, annualReturnPct, terPct: 0 })
  const rows = funds
    .map((f) => {
      const value = endValue({ monthly, years, annualReturnPct, terPct: f.terPct.value })
      return { ticker: f.ticker, terPct: f.terPct.value, endValue: value, feesPaid: noFee - value }
    })
    .sort((a, b) => b.endValue - a.endValue)
  const feeGap = rows.length ? rows[0]!.endValue - rows[rows.length - 1]!.endValue : 0
  return { rows, feeGap }
}

const czk = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })

/** "1 234 567 Kč" with NBSP separators, whole crowns. */
export function formatCzk(n: number): string {
  return czk.format(Math.round(n))
}

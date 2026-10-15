import type { Etf } from '../types/etf'

/** Latest `checked` date across every figure, "YYYY-MM-DD". Shown as "ověřeno …" on the page and in the e-mail. */
export function latestCheckedDate(funds: Etf[]): string {
  return funds
    .flatMap(f => [f.exchange, f.terPct, f.aumUsd, f.dividendYieldPct, f.ucits.isin, f.ucits.terPct].map(v => v.checked))
    .sort()
    .at(-1)!
}

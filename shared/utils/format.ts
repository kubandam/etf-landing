/** Percent as the issuer states it, min. 2 decimals: 0.0945 → "0,0945 %", 1 → "1,00 %". */
export function formatPct(pct: number): string {
  return `${pct.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} %`
}

/** Fund size in USD → whole billions: 823 230 730 000 → "823 mld. USD". */
export function formatUsdBn(usd: number): string {
  return `${Math.round(usd / 1e9).toLocaleString('cs-CZ')} mld. USD`
}

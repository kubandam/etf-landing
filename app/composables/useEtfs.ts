import type { EtfData } from '#shared/types/etf'
import data from '~~/data/etfs.json'

const funds = (data as EtfData).funds

export function useEtfs() {
  const checkedDates = funds.flatMap(f => [f.exchange, f.terPct, f.aumUsd, f.dividendYieldPct, f.ucits.isin, f.ucits.terPct].map(v => v.checked))
  return {
    allFunds: funds,
    pageFunds: funds.filter(f => f.showOnPage),
    dataCheckedDate: checkedDates.sort().at(-1)!,
  }
}

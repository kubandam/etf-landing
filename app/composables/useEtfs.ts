import type { EtfData } from '#shared/types/etf'
import { latestCheckedDate } from '#shared/utils/etfData'
import data from '~~/data/etfs.json'

const funds = (data as EtfData).funds

export function useEtfs() {
  return {
    allFunds: funds,
    pageFunds: funds.filter(f => f.showOnPage),
    dataCheckedDate: latestCheckedDate(funds),
  }
}

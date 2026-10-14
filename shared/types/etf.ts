/** One figure taken from an issuer page: the value, where it was read and when. */
export interface EtfValue<T> {
  value: T
  /** https URL on the issuer's domain where `value` can be read. */
  source: string
  /** Date the value was read off `source`, YYYY-MM-DD. */
  checked: string
  /** Optional: which metric on the page this is (e.g. "30 Day SEC Yield"), or the page's own "as of" date. */
  note?: string
}

/** UCITS (EU-domiciled) equivalent of a US-listed fund, for the "how to buy from CZ" section. */
export interface UcitsEquivalent {
  ticker: string
  name: string
  issuerUrl: string
  isin: EtfValue<string>
  terPct: EtfValue<number>
}

export interface Etf {
  ticker: string
  name: string
  issuer: string
  issuerUrl: string
  /** true for the 3 funds shown on the page; all funds go to the e-mail and thank-you. */
  showOnPage: boolean
  exchange: EtfValue<string>
  /** Total expense ratio in percent per year, e.g. 0.03 means 0.03 %. */
  terPct: EtfValue<number>
  /** Fund size in USD, plain number (no "bn"). */
  aumUsd: EtfValue<number>
  /** Trailing distribution / dividend yield in percent. */
  dividendYieldPct: EtfValue<number>
  ucits: UcitsEquivalent
}

export interface EtfData {
  funds: Etf[]
}

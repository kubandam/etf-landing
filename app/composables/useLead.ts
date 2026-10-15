import type { Years } from '#shared/utils/feeCalc'

export interface Submitted {
  placement: 'top' | 'bottom'
  /** Snapshot of the calculator at submit time; the thank-you screen and e-mail use these, not live values. */
  monthly: number
  years: Years
  emailed: boolean
}

/** Set after a successful submit. Both forms disappear; ThankYou shows where the submitted form was. */
export function useLead() {
  return useState<Submitted | null>('lead-submitted', () => null)
}

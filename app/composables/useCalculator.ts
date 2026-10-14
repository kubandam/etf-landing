import { MONTHLY, YEARS_INITIAL, compareFunds, type Years } from '#shared/utils/feeCalc'

/**
 * Calculator state, shared across components (the lead form reads monthly/years).
 * `result` stays null until the user changes an input for the first time.
 */
export function useCalculator() {
  const monthly = useState<number>('calc-monthly', () => MONTHLY.initial)
  const years = useState<Years>('calc-years', () => YEARS_INITIAL)
  const touched = useState<boolean>('calc-touched', () => false)
  const { pageFunds } = useEtfs()

  const result = computed(() => (touched.value ? compareFunds(monthly.value, years.value, pageFunds) : null))

  return { monthly, years, touched, result }
}

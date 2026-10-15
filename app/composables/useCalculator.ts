import { MONTHLY, YEARS_INITIAL, compareFunds, type Years } from '#shared/utils/feeCalc'

/**
 * Calculator state, shared across components (the lead form reads monthly/years).
 * The result is shown from the first render with the defaults (3 000 Kč, 20 let).
 */
export function useCalculator() {
  const monthly = useState<number>('calc-monthly', () => MONTHLY.initial)
  const years = useState<Years>('calc-years', () => YEARS_INITIAL)
  const touched = useState<boolean>('calc-touched', () => false)
  const { pageFunds } = useEtfs()

  const result = computed(() => compareFunds(monthly.value, years.value, pageFunds))
  const track = useTrack()

  /** Call from input handlers. Fires calc_change once per page load, on the first real user input. */
  function onUserInput(field: 'monthly' | 'years') {
    if (touched.value) return
    touched.value = true
    track('calc_change', { field })
  }

  return { monthly, years, touched, result, onUserInput }
}

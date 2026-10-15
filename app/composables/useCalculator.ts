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

  // Always computed so the hidden result can reserve its exact height before the first input.
  const preview = computed(() => compareFunds(monthly.value, years.value, pageFunds))
  const result = computed(() => (touched.value ? preview.value : null))
  const track = useTrack()

  /** Call from input handlers. The first call reveals the result and fires calc_change + calc_result once per page load. */
  function onUserInput(field: 'monthly' | 'years') {
    if (touched.value) return
    touched.value = true
    track('calc_change', { field })
    track('calc_result', { monthly: monthly.value, years: years.value, feeGap: Math.round(result.value!.feeGap) })
  }

  return { monthly, years, touched, result, preview, onUserInput }
}

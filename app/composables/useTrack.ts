/** Funnel events, README §8. Props must never contain personal data (no e-mail). */
export type EventName = 'page_view' | 'calc_change' | 'calc_result' | 'form_focus' | 'form_submit' | 'thankyou_view'
export type EventProps = Record<string, string | number | boolean>

export function useTrack() {
  const { $posthog } = useNuxtApp()
  return (event: EventName, props?: EventProps) => {
    if (import.meta.server) return
    if (!$posthog) {
      console.debug('[track]', event, props ?? {})
      return
    }
    $posthog.capture(event, props)
  }
}

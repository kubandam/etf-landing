/** Funnel events, README §8. Props must never contain personal data (no e-mail). */
export type EventName = 'page_view' | 'calc_change' | 'form_focus' | 'form_submit' | 'thankyou_view'
export type EventProps = Record<string, string | number | boolean>

export function useTrack() {
  const { $track } = useNuxtApp()
  return (event: EventName, props?: EventProps) => {
    if (import.meta.server) return
    $track(event, props)
  }
}

import type { PostHog } from 'posthog-js'
import type { EventName, EventProps } from '~/composables/useTrack'

/**
 * PostHog without a cookie banner: nothing is written to cookies or localStorage,
 * the anonymous id lives in memory only (new id on every page load).
 * Only the events from useTrack() are sent; no autocapture, recordings or pageview magic.
 *
 * posthog-js (~400 kB) is imported only after the page has loaded, so it never delays
 * the first paint. Events fired before that wait in a queue with their original timestamp.
 */
export default defineNuxtPlugin(() => {
  const { posthogKey, posthogHost } = useRuntimeConfig().public
  const enabled = Boolean(posthogKey) && navigator.doNotTrack !== '1'

  let client: PostHog | null = null
  const queue: { event: EventName; props?: EventProps; at: Date }[] = []

  function track(event: EventName, props?: EventProps) {
    if (!enabled) {
      console.debug('[track]', event, props ?? {})
      return
    }
    if (client) client.capture(event, props)
    else queue.push({ event, props, at: new Date() })
  }

  async function load() {
    const { default: posthog } = await import('posthog-js')
    client = posthog.init(posthogKey, {
      api_host: posthogHost,
      persistence: 'memory',
      person_profiles: 'never',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      rageclick: false,
      capture_dead_clicks: false,
      capture_heatmaps: false,
      capture_exceptions: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_surveys: true,
      disable_product_tours: true,
      disable_web_experiments: true,
      disable_external_dependency_loading: true,
      advanced_disable_flags: true,
      mask_personal_data_properties: true,
      save_referrer: false,
    }) ?? null
    for (const q of queue.splice(0)) client?.capture(q.event, q.props, { timestamp: q.at })
  }

  if (enabled) {
    const idle = (fn: () => void) =>
      'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1)
    const start = () => idle(() => void load())
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
  }

  return { provide: { track } }
})

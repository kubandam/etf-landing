import posthog, { type PostHog } from 'posthog-js'

/**
 * PostHog without a cookie banner: nothing is written to cookies or localStorage,
 * the anonymous id lives in memory only (new id on every page load).
 * Only the events from useTrack() are sent; no autocapture, recordings or pageview magic.
 */
export default defineNuxtPlugin(() => {
  const { posthogKey, posthogHost } = useRuntimeConfig().public
  let client: PostHog | null = null

  if (posthogKey && navigator.doNotTrack !== '1') {
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
  }

  return { provide: { posthog: client } }
})

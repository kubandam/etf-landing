// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    // Server only. Set via NUXT_SUPABASE_URL / NUXT_SUPABASE_SERVICE_KEY.
    supabaseUrl: '',
    supabaseServiceKey: '',
    public: {
      // Set via NUXT_PUBLIC_POSTHOG_KEY. Empty = no tracking, events only logged with console.debug.
      posthogKey: '',
      posthogHost: 'https://eu.i.posthog.com',
    },
  },
})

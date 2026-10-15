// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    // Server only. Set via NUXT_SUPABASE_URL / NUXT_SUPABASE_SERVICE_KEY.
    supabaseUrl: '',
    supabaseServiceKey: '',
  },
})

import { cs } from './shared/content/cs'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/fonts.css', '~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'cs' },
      title: cs.meta.title,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: cs.meta.description },
        { name: 'theme-color', content: '#f5f2eb' },
      ],
      // Self-hosted fonts (no request to Google). All four files are used on the first screen.
      link: ['plex-sans-latin', 'plex-sans-latin-ext', 'newsreader-500-latin', 'newsreader-500-latin-ext'].map(f => ({
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: `/fonts/${f}.woff2`,
        crossorigin: '',
      })),
    },
  },
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

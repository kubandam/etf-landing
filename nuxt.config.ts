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
      // Self-hosted fonts (no request to Google). Preload only the basic Latin files;
      // the latin-ext files (č, ř, ě, ů) are small and load as soon as the text needs them.
      link: ['plex-sans-latin', 'newsreader-500-latin'].map(f => ({
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: `/fonts/${f}.woff2`,
        crossorigin: '',
      })),
    },
  },
  nitro: {
    // Pre-built gzip/brotli files, so compression does not depend on the host.
    compressPublicAssets: true,
  },
  routeRules: {
    // Font files never change; rename the file if they ever do.
    '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },
  runtimeConfig: {
    // Server only. Set via NUXT_SUPABASE_URL / NUXT_SUPABASE_SERVICE_KEY.
    supabaseUrl: '',
    supabaseServiceKey: '',
    // Server only. Set via NUXT_RESEND_API_KEY / NUXT_MAIL_FROM (e.g. "Porovnání ETF <porovnani@vasedomena.cz>").
    resendApiKey: '',
    mailFrom: '',
    // Set via NUXT_MAIL_REPLY_TO. Replies go here (the sender address cannot receive mail).
    mailReplyTo: '',
    public: {
      // Set via NUXT_PUBLIC_POSTHOG_KEY. Empty = no tracking, events only logged with console.debug.
      posthogKey: '',
      posthogHost: 'https://eu.i.posthog.com',
    },
  },
})

// SSR on by default — that's the whole point of this app.
// We want <AdsProvider> to run server-side so installId can demonstrably
// fall into its "no window/localStorage" branch and mint a fresh UUID
// per request.
export default defineNuxtConfig({
  compatibilityDate: '2026-05-28',
  devtools: { enabled: true },

  // Auto-import the customer's ambient constants (AD_REWARD is referenced
  // in KontextAds.vue without an explicit import, mirroring how Nuxt
  // would auto-import it from a project-level constants file).
  imports: {
    dirs: ['common/constants/**'],
  },
})

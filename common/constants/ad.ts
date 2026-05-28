// KontextAds.vue references AD_REWARD without an explicit import; in their
// app it's auto-imported. nuxt.config.ts registers this directory in
// `imports.dirs` so the symbol is globally available.
export const AD_REWARD = {
  VIEW: 1,
  ERROR_REWARD: 2,
} as const

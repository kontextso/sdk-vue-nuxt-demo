// Mock of ~/common/tools — only what KontextAds.vue actually imports.

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 744px)').matches
}

export function zsTrack(event: string, data?: Record<string, unknown>): void {
  console.log('[zsTrack]', event, data)
}

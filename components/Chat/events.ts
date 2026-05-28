// Kontext-ad-local events, sibling of KontextAds.vue so the relative
// import `./events` resolves here.
//
// We don't have polybuzz's real `events.ts`. KontextAds.vue calls
// `updateAdConfig(false)` ~500ms after the ad becomes visible. If our mock
// naively writes that `false` back to kontextConfig.visible, the
// .ad-preload CSS re-applies (position: absolute; top: -1000px) and the
// ad pops off-screen ≈ "disappears immediately". That's an artefact of
// the mock, not of polybuzz's actual logic — their updateAdConfig
// probably handles a different concern (server-side reward bookkeeping,
// next-ad scheduling, etc.) and leaves visibility alone.
//
// We therefore make this a no-op (just log) so the demo behaves like
// "ad becomes visible and stays visible until the user navigates away".
import { kontextConfig as _kontextConfig } from './state'

export async function updateAdConfig(visible: boolean): Promise<void> {
  console.log('[updateAdConfig]', { visible, note: 'mock — not mutating kontextConfig.visible' })
  // If you want to faithfully simulate "hide after view", uncomment:
  // _kontextConfig.value = { ..._kontextConfig.value, visible }
  void _kontextConfig
}

// Local sibling state for KontextStore.vue. The customer's `./state` is
// imported by KontextStore for two things — `kontextConfig` (which must be
// the same ref KontextAds.vue reads) and `kontextSession` (their own
// signal that the SDK session is ready to receive addMessage calls).
//
// We re-export `kontextConfig` / `kontextVisible` from the shared
// components/Chat/state.ts so the two consumers share one module instance.
// `kontextSession` is local — we don't know exactly how polybuzz populates
// it (likely via inject of AdsSessionKey in some parent), so we just set
// it to a truthy value to make the addAiMessage gate pass.
import { ref } from 'vue'

export { kontextConfig, kontextVisible } from '../../state'

// Polybuzz's real kontextSession is presumably a ref<Session | null> set
// once their AdsProvider session is created. We don't know the mechanism;
// for the demo a truthy boolean is enough to satisfy the
// `if (!kontextSession.value) return` guard in KontextStore.vue.
export const kontextSession = ref<boolean>(true)

// Mock of @/components/Chat/store/state — the "chat store" half of
// polybuzz's split state. Only the bits KontextProvider/KontextAds
// destructure off useStore() live here.
//
// kontextConfig / kontextVisible / updateAdConfig live in
// components/Chat/state.ts and components/Chat/events.ts respectively
// (imported relatively by KontextAds.vue).
import { ref } from 'vue'

// `sessionId` is what KontextProvider passes to AdsProvider as
// `:conversation-id`. Polybuzz builds it from `userId + secretSceneId`
// on first render (their "temp" pattern), then swaps to a real backend
// conversation id later.
const sessionId = ref<string>('')

const sceneInfo = ref({
  secretSceneId: '',
  sceneName: '',
  sceneAvatarUrl: '',
})

const query = ref({
  secretSceneId: '',
  sceneName: '',
  sceneAvatarUrl: '',
  oriSceneName: '',
})

const submitLoading = ref(false)

export function useStore() {
  return { sessionId, sceneInfo, query, submitLoading }
}

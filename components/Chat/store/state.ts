// Mock of @/components/Chat/store/state — the "chat store" half of
// polybuzz's split state. Only the bits KontextProvider/KontextAds/
// KontextStore destructure off useStore() live here.
//
// kontextConfig / kontextVisible / updateAdConfig live in
// components/Chat/state.ts and components/Chat/events.ts respectively
// (imported relatively by KontextAds.vue). kontextSession lives in
// components/Chat/Kontext/Store/state.ts (sibling of KontextStore.vue).
import { ref } from 'vue'
import type { IMessage } from '../types'

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

// The chat message list. KontextStore.vue iterates this and forwards
// each entry to addMessage(); on user-action, the chat UI pushes to
// this array and fires CHAT_AD_KONTEXT_ADD_MSG to trigger KontextStore.
const msgList = ref<IMessage[]>([])

export function useStore() {
  return { sessionId, sceneInfo, query, submitLoading, msgList }
}

<script setup lang="ts">
// /character/chat/[cid] — same route shape as polybuzz. KontextProvider is
// mounted inside the per-route page component (matching where they put it),
// so each route change unmounts and remounts it.
//
// By default we keep sessionId stable (temp `${suid}_${secretSceneId}`)
// for the lifetime of the page so the ad renders and stays visible. Add
// `?swap=1` to the URL to simulate polybuzz's temp→real conversationId
// swap ~2s after mount — this destroys the SDK session and recreates it
// with a backend-shaped UUID, which is exactly why their ads "show then
// disappear" (the new session has no preloaded bids, so InlineAd's
// session-changed watcher creates a bid-less Ad on the new session).
//
// To demonstrate the unrelated remount-on-navigation cause of session
// fragmentation, just click between characters — the page component
// unmounts and remounts, and so does AdsProvider.
//
// The actual addMessage() / kontextConfig orchestration lives in
// KontextStore.vue (verbatim from the customer) — it sits inside the
// KontextProvider slot so it can useAds(), and listens for the
// CHAT_AD_KONTEXT_ADD_MSG event that our ChatUI.vue fires after pushing
// new entries onto msgList.
import KontextProvider from '~/components/Chat/KontextProvider.vue'
import KontextStore from '~/components/Chat/Kontext/Store/KontextStore.vue'
import ChatUI from '~/components/Chat/ChatUI.vue'
import { useStore } from '~/components/Chat/store/state'

const route = useRoute()
const cid = computed(() => String(route.params.cid))
const swapEnabled = computed(() => route.query.swap === '1' || route.query.swap === 'true')

// Polybuzz's "slug-secretSceneId" CID convention; recover the secretSceneId
// by taking the substring after the last "-".
const secretSceneId = computed(() => {
  const m = cid.value.match(/-([^-]+)$/)
  return m ? m[1]! : cid.value
})

// Tiny in-memory character "DB" so the demo has names + avatars.
const characters: Record<string, { sceneName: string; oriSceneName: string; sceneAvatarUrl: string }> = {
  '42y7D': {
    sceneName: 'Pugsley Addams',
    oriSceneName: 'Pugsley Addams',
    sceneAvatarUrl: 'https://cdn.polyspeak.ai/speakmaster/f44c68b2d2512501d705869b2648818d.webp',
  },
  uyWK7: { sceneName: 'Angelo Parker', oriSceneName: 'Angelo Parker', sceneAvatarUrl: '' },
  vqfNe: { sceneName: 'Lily Skynir', oriSceneName: 'Lily Skynir', sceneAvatarUrl: '' },
}

const authStore = useAuthStore()
const store = useStore()

function fakeBackendConversationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

let realIdTimer: ReturnType<typeof setTimeout> | null = null

watch(
  [() => secretSceneId.value, () => authStore.userInfos?.suid, () => swapEnabled.value],
  ([id, suid, swap]) => {
    if (realIdTimer) {
      clearTimeout(realIdTimer)
      realIdTimer = null
    }

    const meta = characters[id] ?? { sceneName: id, oriSceneName: id, sceneAvatarUrl: '' }
    store.sceneInfo.value = {
      secretSceneId: id,
      sceneName: meta.sceneName,
      sceneAvatarUrl: meta.sceneAvatarUrl,
    }
    store.query.value = {
      secretSceneId: id,
      sceneName: meta.sceneName,
      oriSceneName: meta.oriSceneName,
      sceneAvatarUrl: meta.sceneAvatarUrl,
    }

    if (!suid || !id) {
      store.sessionId.value = ''
      return
    }

    // Temp conversationId (always set immediately).
    store.sessionId.value = `${suid}_${id}`

    // Optional: swap to a backend-shaped UUID ~2s later. Off by default
    // because it destroys the SDK session mid-conversation and the ad
    // visibly disappears (which is the bug, but unhelpful for the demo
    // unless you're trying to show it).
    if (swap) {
      realIdTimer = setTimeout(() => {
        if (secretSceneId.value === id && authStore.userInfos?.suid === suid) {
          store.sessionId.value = fakeBackendConversationId()
        }
      }, 2000)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (realIdTimer) clearTimeout(realIdTimer)
})
</script>

<template>
  <main>
    <p><NuxtLink to="/">&larr; back</NuxtLink></p>
    <KontextProvider>
      <h1>Chat with {{ store.sceneInfo.value.sceneName || cid }}</h1>
      <p style="opacity: 0.7; font-size: 0.9rem;">
        cid: <code>{{ cid }}</code> &nbsp;|&nbsp;
        secretSceneId: <code>{{ secretSceneId }}</code><br />
        suid: <code>{{ authStore.userInfos?.suid ?? '(unauthenticated)' }}</code> &nbsp;|&nbsp;
        sessionId (sent as conversationId): <code>{{ store.sessionId.value || '(empty)' }}</code><br />
        <span v-if="swapEnabled" style="color: #f54444;">
          ⚠ swap mode ON — sessionId will be replaced ~2s after mount, destroying the SDK session
        </span>
        <span v-else>
          (add <code>?swap=1</code> to the URL to simulate polybuzz's temp→real conversationId swap)
        </span>
      </p>

      <KontextStore />
      <ChatUI />
    </KontextProvider>
  </main>
</template>

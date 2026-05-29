<script setup lang="ts">
// Chat display + input. Our best guess at polybuzz's chat-input
// component: pushes new messages to msgList and fires
// CHAT_AD_KONTEXT_ADD_MSG so KontextStore.vue pumps them into the SDK.
// The actual <InlineAd> render is handled by <KontextAds> (the customer's
// verbatim component), which we render below the messages.
//
// We also flip kontextConfig.visible = true once the ad has rendered.
// Otherwise the `.ad-preload { position: absolute; top: -1000px }` CSS
// in KontextAds.vue keeps the iframe off-screen forever, the SDK's
// IntersectionObserver sees zero pixels, and `ad.viewed` never fires —
// exactly the "rendered but not viewed" pattern we kept seeing in
// polybuzz's ClickHouse data. We don't know which component does this
// in their real app (it might be a scroll-into-view detector); for the
// demo we just bring the ad on-screen as soon as CHAT_AD_KONTEXT_RENDERED
// fires.
import { ROLETYPE } from './constant'
import { useStore } from './store/state'
import { kontextConfig } from './state'
import KontextAds from './KontextAds.vue'
import usePlugin from '../PluginStore/hook'
import { EVENT_NAME } from '../PluginStore/interface'

const { msgList } = useStore()
const { triggerEvents, onEvent, offEvent } = usePlugin()

function pushExchange(userText: string, replyText: string) {
  const stamp = Date.now()
  msgList.value.push(
    { id: `m${stamp}u`, role: ROLETYPE.USER, content: userText },
    { id: `m${stamp}a`, role: ROLETYPE.AI, content: replyText }
  )
  triggerEvents(EVENT_NAME.CHAT_AD_KONTEXT_ADD_MSG)
}

function onAdRendered() {
  // Bring the ad on-screen so viewability tracking can fire.
  kontextConfig.value = { ...kontextConfig.value, visible: true }
}

onMounted(() => {
  onEvent(EVENT_NAME.CHAT_AD_KONTEXT_RENDERED, onAdRendered)
  if (msgList.value.length === 0) {
    pushExchange('Hi!', 'Hello there.')
  }
})

onBeforeUnmount(() => {
  offEvent(EVENT_NAME.CHAT_AD_KONTEXT_RENDERED, onAdRendered)
})

function sendMessage() {
  pushExchange('Tell me more.', 'Sure — here is more.')
}
</script>

<template>
  <section class="chat">
    <div v-for="m in msgList" :key="m.id" class="msg-list">
      <div class="messagebox">
        <strong>{{ m.role === ROLETYPE.AI ? 'assistant' : 'user' }}:</strong> {{ m.content }}
      </div>
    </div>

    <KontextAds :is-last="true" />
  </section>

  <button class="send" @click="sendMessage">Send another message</button>
</template>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 1rem;
}
.chat .msg-list .messagebox {
  background: #343434;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  display: inline-block;
}
.send {
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  background: #7673ff;
  color: #fff;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.95rem;
}
.send:hover {
  background: #8481ff;
}
</style>

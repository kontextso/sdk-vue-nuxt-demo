<script setup lang="ts">
// Sits inside the <KontextProvider> slot, so it can use useAds() to
// inject the session and call addMessage() — which is what actually
// triggers the SDK's /preload pipeline. Without this call the SDK
// never asks for bids and no ad ever renders.
//
// Also owns the chat messages array and drives kontextConfig.msgId,
// matching the role of polybuzz's chat-input component.
import { useAds } from '@kontextso/sdk-vue'
import { kontextConfig } from './state'
import KontextAds from './KontextAds.vue'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<ChatMessage[]>([])
const { addMessage } = useAds()

function pushExchange(userText: string, replyText: string) {
  const stamp = Date.now()
  const userMsg: ChatMessage = { id: `m${stamp}u`, role: 'user', content: userText }
  const aiMsg: ChatMessage = { id: `m${stamp}a`, role: 'assistant', content: replyText }
  messages.value.push(userMsg, aiMsg)
  // The user message is what kicks off the (debounced) preload.
  addMessage(userMsg)
  // The assistant message is what InlineAd binds to via :message-id.
  addMessage(aiMsg)

  // Queue the ad for this assistant turn, polybuzz-style: preload
  // off-screen (visible=false), then flip visible=true ~1s later so
  // KontextAds removes the `ad-preload` class and brings it on-screen.
  kontextConfig.value = { rounds: 1, visible: false, loaded: false, msgId: aiMsg.id }
  setTimeout(() => {
    kontextConfig.value = { ...kontextConfig.value, visible: true }
  }, 1000)
}

onMounted(() => {
  // Seed one exchange so an ad shows up immediately.
  pushExchange('Hi!', 'Hello there.')
})

function sendMessage() {
  pushExchange('Tell me more.', 'Sure — here is more.')
}
</script>

<template>
  <section class="chat">
    <div v-for="m in messages" :key="m.id" class="msg-list">
      <div class="messagebox">
        <strong>{{ m.role }}:</strong> {{ m.content }}
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

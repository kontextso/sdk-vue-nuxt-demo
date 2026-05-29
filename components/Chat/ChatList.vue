<script setup lang="ts">
// Recommended-pattern chat list. Replaces the customer's
// KontextStore.vue + KontextAds.vue path with the three concrete fixes
// documented in https://docs.kontext.so/sdk/vue:
//
//   1. Call useAds().addMessage() **immediately** when each message is
//      added — not only after both user + assistant are ready. This lets
//      the SDK start the preload as early as possible so the bid is
//      already in hand by the time the assistant reply lands.
//
//   2. Render <InlineAd> **inline next to the specific assistant
//      message** it's bound to, using the wrapper slot. The slot lets
//      us style the ad row to match the chat (avatar + bubble) and,
//      crucially, parks the iframe inside the message flow rather than
//      at the bottom of the chat. The ad's narrative now matches the
//      conversation around it (the wrong-context-after-N-more-messages
//      problem from the customer's video disappears).
//
//   3. **No off-screen preload trick.** The empty container renders in
//      its natural place. If there's no bid for that messageId, nothing
//      visible appears (the container is a zero-height div). If a bid
//      arrives, the iframe drops in and is immediately in the viewport
//      — IntersectionObserver fires, viewability accrues, ad.viewed
//      arrives on time.
//
// `KontextProvider.vue` still wraps this slot (it's the verbatim file
// from polybuzz and is fine — it just creates the AdsProvider with their
// props). `KontextAds.vue` and `KontextStore.vue` are kept in the repo
// as reference (the customer's actual code), but are not used here.

import { defineComponent, h, onMounted, ref } from 'vue'
import { InlineAd, useAds } from '@kontextso/sdk-vue'
import { useStore } from './store/state'
import { ROLETYPE } from './constant'

const { addMessage } = useAds()
const { msgList } = useStore()
const input = ref('')
const aiTyping = ref(false)

// Tiny helper component: renders an arbitrary VNode passed as a prop.
// Needed because the InlineAd wrapper slot hands us a VNode (the ad
// container) and Vue templates can't render raw VNodes inline.
const VNodeRenderer = defineComponent({
  name: 'VNodeRenderer',
  props: { vnode: { type: Object, required: true } },
  setup: (p) => () => p.vnode,
})

function makeId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

async function sendMessage(text: string) {
  if (!text.trim()) return
  // Recommendation #1 — push and addMessage the user's message NOW.
  const userMsg = { id: makeId(), role: ROLETYPE.USER as const, content: text }
  msgList.value.push(userMsg)
  await addMessage({ id: userMsg.id, role: 'user', content: text })

  // Pretend to call an LLM. In the real app this is the streaming reply.
  aiTyping.value = true
  await new Promise((r) => setTimeout(r, 600))
  const reply = `(simulated reply to: "${text}")`
  const aiMsg = { id: makeId(), role: ROLETYPE.AI as const, content: reply }
  msgList.value.push(aiMsg)
  await addMessage({ id: aiMsg.id, role: 'assistant', content: reply })
  aiTyping.value = false
}

async function onSubmit() {
  const text = input.value.trim()
  input.value = ''
  await sendMessage(text)
}

onMounted(async () => {
  if (msgList.value.length === 0) {
    await sendMessage('Hi!')
  }
})
</script>

<template>
  <section class="chat">
    <template v-for="m in msgList" :key="m.id">
      <div class="msg-row" :class="m.role === ROLETYPE.AI ? 'ai' : 'user'">
        <div class="bubble">
          <span class="role">{{ m.role === ROLETYPE.AI ? 'assistant' : 'user' }}</span>
          <span class="content">{{ m.content }}</span>
        </div>
      </div>

      <!--
        Recommendation #2 — InlineAd lives INLINE next to its assistant
        message. The wrapper slot styles the ad row to match the chat
        (avatar lozenge + bubble). The ad iframe mounts inside the row;
        if no bid arrives for this messageId the inner div stays empty
        and the row collapses to zero height (recommendation #3 — no
        off-screen preload trick required).
      -->
      <InlineAd v-if="m.role === ROLETYPE.AI" :message-id="m.id">
        <template #wrapper="{ ad }">
          <div class="ad-row">
            <div class="ad-avatar" aria-hidden="true">ad</div>
            <div class="ad-bubble">
              <VNodeRenderer :vnode="ad" />
            </div>
          </div>
        </template>
      </InlineAd>
    </template>

    <div v-if="aiTyping" class="msg-row ai">
      <div class="bubble typing">…</div>
    </div>
  </section>

  <form class="composer" @submit.prevent="onSubmit">
    <input v-model="input" placeholder="Type a message" :disabled="aiTyping" />
    <button :disabled="aiTyping || !input.trim()">Send</button>
  </form>
</template>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  min-height: 60vh;
}
.msg-row {
  display: flex;
}
.msg-row.user {
  justify-content: flex-end;
}
.msg-row.ai {
  justify-content: flex-start;
}
.bubble {
  background: #343434;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  max-width: 70%;
  display: inline-flex;
  flex-direction: column;
  gap: 0.2rem;
}
.role {
  font-size: 0.75rem;
  opacity: 0.7;
  text-transform: lowercase;
}
.typing {
  background: #232323;
  font-size: 1.4rem;
  letter-spacing: 0.2em;
  opacity: 0.6;
}
/* Ad row: in the flow of the chat, immediately under its bound message.
   If no bid lands for this messageId, the inner container is empty and
   the row collapses (avatar lozenge stays hidden via :has). */
.ad-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.ad-row:not(:has(iframe)) {
  display: none;
}
.ad-avatar {
  flex: 0 0 36px;
  height: 36px;
  border-radius: 50%;
  background: #555;
  color: #fff;
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ad-bubble {
  background: #2a2a2b;
  border-radius: 12px;
  padding: 0.4rem;
  flex: 1;
  min-width: 0;
}
.composer {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.composer input {
  flex: 1;
  padding: 0.55rem 0.9rem;
  background: #2a2a2b;
  color: #fff;
  border: 1px solid #444;
  border-radius: 999px;
  font-size: 0.95rem;
}
.composer input:disabled {
  opacity: 0.5;
}
.composer button {
  padding: 0.55rem 1.1rem;
  background: #7673ff;
  color: #fff;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.95rem;
}
.composer button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

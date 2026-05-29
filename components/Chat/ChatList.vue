<script setup lang="ts">
// Recommended-pattern chat list. Replaces the customer's
// KontextStore.vue + KontextAds.vue path with the four fixes documented
// in https://docs.kontext.so/sdk/vue:
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
//      visible appears. If a bid arrives, the iframe drops in and is
//      immediately in the viewport — IntersectionObserver fires,
//      viewability accrues, ad.viewed arrives on time.
//
//   4. **Use { trackOnly: true } for pacing.** When the publisher wants
//      to skip an ad for a particular turn, they still call addMessage()
//      (so the server has the full conversation context), but pass
//      { trackOnly: true } as the second argument. The SDK sends the
//      preload but doesn't process bids. Below we use this to demonstrate
//      a pacing rule: ad on turns 1, 2, 6, 10, 14, … and trackOnly on
//      all other turns.
//      https://docs.kontext.so/concepts/pacing#方式-2：用-trackonly-在单条消息上覆盖
//
// `KontextProvider.vue` still wraps this slot (it's the verbatim file
// from polybuzz and is fine — it just creates the AdsProvider with their
// props). `KontextAds.vue` and `KontextStore.vue` are kept in the repo
// as reference (the customer's actual code), but are not used here.

import { defineComponent, onMounted, ref, computed } from 'vue'
import { InlineAd, useAds } from '@kontextso/sdk-vue'
import { useStore } from './store/state'
import { ROLETYPE } from './constant'
import type { IMessage } from './types'

const { addMessage } = useAds()
const { msgList } = useStore()
const input = ref('')
const aiTyping = ref(false)

// Per-user-message counter, used to drive the pacing rule below. We track
// our own counter (instead of computing from msgList) so message-deletions
// or edits don't shift the pacing position.
const userTurn = ref(0)

// MessageId of the assistant reply that *currently* has an ad attached.
// Only one ad is ever on screen at a time: when the user sends a new
// message we clear this, so the previous ad's <InlineAd> unmounts and
// disappears from the chat. If the new turn is an ad turn, this is set
// again once the assistant reply lands.
const currentAdMsgId = ref<string | null>(null)

// Pacing rule: show an ad on user turns 1, 5, 9, 13, … (every 4th
// turn starting from the first one) and use { trackOnly: true } on the
// turns in between.
//   1 → ad
//   2, 3, 4 → trackOnly
//   5 → ad
//   6, 7, 8 → trackOnly
//   9 → ad
//   …
function shouldShowAd(turn: number): boolean {
  return turn % 4 === 1
}

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
  userTurn.value++
  const turn = userTurn.value
  const showAd = shouldShowAd(turn)
  // Pass an empty options object for normal "show ad" turns and
  // { trackOnly: true } for paced-off turns. Both still reach the server
  // so it has the full conversation context.
  const opts = showAd ? {} : { trackOnly: true as const }

  // Recommendation #1 — push and addMessage the user's message NOW.
  // The user message is what triggers the preload; trackOnly here is
  // what controls whether the SDK will process bids for this turn.
  // Clearing currentAdMsgId here unmounts the previously-rendered ad
  // so the chat doesn't accumulate stale ads as the conversation grows.
  currentAdMsgId.value = null
  const userMsg: IMessage = { id: makeId(), role: ROLETYPE.USER, content: text }
  msgList.value.push(userMsg)
  addMessage({ id: userMsg.id, role: 'user', content: text, createdAt: new Date() }, opts)

  // Pretend to call an LLM. In a real app this is the streaming reply.
  aiTyping.value = true
  await new Promise((r) => setTimeout(r, 600))
  const reply = `(simulated reply to: "${text}")`
  const aiMsg: IMessage = { id: makeId(), role: ROLETYPE.AI, content: reply }
  msgList.value.push(aiMsg)
  if (showAd) currentAdMsgId.value = aiMsg.id
  addMessage({ id: aiMsg.id, role: 'assistant', content: reply, createdAt: new Date() }, opts)
  aiTyping.value = false
}

async function onSubmit() {
  const text = input.value.trim()
  input.value = ''
  await sendMessage(text)
}

// Convenience: fire several auto-generated messages in sequence so the
// pacing pattern becomes visible without typing 14 times. Each call
// waits for the previous one to finish so userTurn increments correctly.
async function autoSend(n: number) {
  for (let i = 0; i < n; i++) {
    await sendMessage(`Test message ${userTurn.value + 1}`)
  }
}

// Compute the "next ad turn" so we can show a human-friendly hint.
const nextAdTurn = computed(() => {
  let t = userTurn.value + 1
  while (!shouldShowAd(t)) t++
  return t
})

onMounted(async () => {
  if (msgList.value.length === 0) {
    await sendMessage('Hi!')
  }
})
</script>

<template>
  <div class="pacing-info">
    <strong>Pacing:</strong> ad on turns <code>1, 5, 9, 13, …</code>
    — every other turn is <code>addMessage(msg, { trackOnly: true })</code>.
    You're at turn <strong>{{ userTurn }}</strong>; next ad on turn
    <strong>{{ nextAdTurn }}</strong>.
  </div>

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
        message. Only the *current* ad is mounted (currentAdMsgId === m.id);
        when the user sends a new message currentAdMsgId is cleared and
        the previous ad's <InlineAd> unmounts, so old ads don't pile up
        in the chat. Turns marked trackOnly never get an ad mounted at
        all because currentAdMsgId stays null on those turns.
      -->
      <InlineAd
        v-if="m.role === ROLETYPE.AI && currentAdMsgId === m.id"
        :message-id="m.id"
      >
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
    <button type="submit" :disabled="aiTyping || !input.trim()">Send</button>
    <button type="button" class="secondary" :disabled="aiTyping" @click="autoSend(5)">
      +5 test msgs
    </button>
  </form>
</template>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  min-height: 55vh;
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
   :has(iframe) check collapses the row to zero height before the iframe
   has loaded, so a brief "ad pending" gap doesn't push the chat down. */
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
.pacing-info {
  margin: 1rem 0 0;
  padding: 0.6rem 0.8rem;
  background: #1f1f20;
  border: 1px solid #333;
  border-radius: 8px;
  font-size: 0.85rem;
  opacity: 0.85;
}
.composer {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
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
.composer button.secondary {
  background: #343435;
}
.composer button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

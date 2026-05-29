# `@kontextso/sdk-vue` — Nuxt 3 demo

A minimal Nuxt 3 app that integrates [`@kontextso/sdk-vue`](https://www.npmjs.com/package/@kontextso/sdk-vue) the way a real chat app should. The chat lives at `/character/chat/[cid]`, messages flow through `useAds().addMessage()`, and `<InlineAd>` renders inline next to assistant replies.

## Run it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## What the demo shows — three integration recommendations

The chat page wraps `ChatList.vue` in the customer's own `KontextProvider.vue` (verbatim) and demonstrates the three things their current integration is missing:

1. **Call `useAds().addMessage()` immediately on each user message** (don't wait for both user + assistant to be ready). This lets the SDK start preloading right away so the bid is already in hand by the time the assistant reply lands. See `ChatList.vue → sendMessage()`.

2. **Render `<InlineAd>` inline with its specific assistant message**, using the wrapper slot. The slot lets you style the ad row to match the chat (avatar + bubble) and parks the iframe in the message flow rather than at the bottom of the chat. The ad's narrative now matches the conversation around it — no more "ad generated for message 53, but rendered under message 56" drift. See `ChatList.vue → <template #wrapper="{ ad }">`.

3. **No off-screen preload trick.** Don't apply `position: absolute; top: -1000px` to the ad row. Let the empty container render in the flow — if no bid lands for that messageId, it stays a zero-height div (invisible). If a bid arrives, the iframe drops in and is immediately in the viewport — `IntersectionObserver` fires, viewability accrues, `ad.viewed` arrives on time.

The two files that implement the *opposite* of these three (the customer's current code) are kept in the repo for reference:

- `components/Chat/KontextAds.vue` — uses `.ad-preload { position: absolute; top: -1000px }` and renders at the bottom of the chat
- `components/Chat/Kontext/Store/KontextStore.vue` — has `if (kontextConfig.msgId) return;` early-return in `addAiMessage`, so subsequent messages never reach the SDK while an ad is on screen

Neither is mounted in the live demo; both are byte-for-byte the originals.

## Try the failure modes

| URL | Behaviour |
|---|---|
| `/character/chat/lily-skynir-vqfNe` | Stable `conversationId` for the lifetime of the page — ad renders and stays visible. |
| `/character/chat/lily-skynir-vqfNe?swap=1` | Simulates a **temp → real `conversationId` swap** ~2s after mount. `<AdsProvider>`'s watcher recreates the SDK session; the new session has no preloaded bid for the assistant message, so the ad **disappears mid-flight**. |
| Click "back" → open a different character | Simulates the **route-change remount** path. New page, new `<AdsProvider>`, new session. |

## How to verify the SDK is doing the right thing

Open DevTools → **Network → filter `/preload`**:

- One `/preload` per `addMessage(userMessage)` call (debounced 10 ms).
- The same `sessionId` in every `/preload` body for the lifetime of a session.

Open **Application → Local Storage → `http://localhost:3000`**:

- Key `kontextso:installId` is written on first mount and reused thereafter.

## File layout

```
.
├── nuxt.config.ts                   # SSR on by default
├── app.vue
├── pages/
│   ├── index.vue                    # character picker
│   └── character/
│       ├── chat/[cid].vue           # mounts <KontextProvider><ChatList /></KontextProvider>
│       └── profile/[cid].vue        # placeholder route
├── components/
│   ├── Chat/
│   │   ├── KontextProvider.vue      # VERBATIM customer file — wraps <AdsProvider>
│   │   ├── ChatList.vue             # recommended-pattern chat: inline InlineAd via wrapper slot
│   │   ├── KontextAds.vue           # VERBATIM reference (not mounted) — off-screen preload pattern
│   │   ├── Kontext/Store/
│   │   │   ├── KontextStore.vue     # VERBATIM reference (not mounted) — has the early-return bug
│   │   │   └── state.ts             # local kontextConfig re-export + kontextSession mock
│   │   ├── state.ts                 # kontextConfig / kontextVisible (used by KontextAds)
│   │   ├── events.ts                # updateAdConfig (used by KontextAds)
│   │   ├── store/state.ts           # useStore: sessionId, sceneInfo, query, submitLoading, msgList
│   │   ├── common/common.ts         # getMsgId helper for KontextStore
│   │   ├── constant.ts              # ROLETYPE enum
│   │   └── types.ts                 # IMessage shape
│   ├── CommonAvatar.vue
│   └── PluginStore/
│       ├── hook.ts                  # tiny event-bus mock
│       └── interface.ts             # EVENT_NAME / GETTER_NAME enums
├── composables/
│   ├── useAuthStore.ts              # auto-imported; mock auth (sync)
│   └── useExtendLocalePath.ts       # auto-imported; i18n-aware path helper mock
├── common/
│   ├── tools/{index.ts,seo-id.ts,retry.ts}
│   ├── constants/ad.ts              # auto-imported AD_REWARD enum
│   └── prometheus/api-interface.ts  # callMonitorEndpoint mock used by KontextStore
└── networkapi/yapiApi.ts            # ad-reward report API mock
```

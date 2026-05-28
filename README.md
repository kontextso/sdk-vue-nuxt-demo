# `@kontextso/sdk-vue` — Nuxt 3 demo

A minimal Nuxt 3 app that integrates [`@kontextso/sdk-vue`](https://www.npmjs.com/package/@kontextso/sdk-vue) the way a real chat app would. The chat lives at `/character/chat/[cid]`, messages flow through `useAds().addMessage()`, and `<InlineAd>` renders next to assistant replies.

## Run it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## What the demo shows

1. `/` — character picker (Pugsley Addams, Angelo Parker, Lily Skynir).
2. `/character/chat/[cid]` — a chat page that:
   - mounts `<KontextProvider>` (which wraps `<AdsProvider>`),
   - feeds messages into the SDK via `useAds().addMessage()` from `ChatRunner.vue`,
   - sets `kontextConfig.msgId` to attach `<InlineAd>` to the last assistant message.

## Try the two failure modes

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
│       ├── chat/[cid].vue           # main chat page
│       └── profile/[cid].vue        # placeholder route
├── components/
│   ├── Chat/
│   │   ├── KontextProvider.vue      # wraps <AdsProvider>
│   │   ├── KontextAds.vue           # renders <InlineAd> on a per-message basis
│   │   ├── ChatRunner.vue           # owns the messages array + calls addMessage
│   │   ├── state.ts                 # kontextConfig / kontextVisible (local)
│   │   ├── events.ts                # updateAdConfig (local)
│   │   └── store/state.ts           # useStore: sessionId, sceneInfo, query, submitLoading
│   ├── CommonAvatar.vue
│   └── PluginStore/
│       ├── hook.ts                  # tiny event-bus mock
│       └── interface.ts             # EVENT_NAME / GETTER_NAME enums
├── composables/
│   ├── useAuthStore.ts              # auto-imported; mock auth (sync)
│   └── useExtendLocalePath.ts       # auto-imported; i18n-aware path helper mock
├── common/
│   ├── tools/{index.ts,seo-id.ts,retry.ts}
│   └── constants/ad.ts              # auto-imported AD_REWARD enum
└── networkapi/yapiApi.ts            # ad-reward report API mock
```

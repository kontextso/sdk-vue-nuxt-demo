// ROLETYPE — polybuzz's role enum. KontextStore.vue only references
// ROLETYPE.AI (to map their AI role onto the SDK's "assistant" role).
// Real values are likely numeric in their codebase; the exact constant
// doesn't matter as long as it's consistent with how msgList is populated.
export const ROLETYPE = {
  USER: 0,
  AI: 1,
} as const

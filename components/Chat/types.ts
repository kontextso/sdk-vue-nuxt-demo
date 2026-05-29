// IMessage — polybuzz's chat-message shape. KontextStore.vue only reads
// `msg.content`, `msg.role` (compared against ROLETYPE), and `msg.id` (via
// getMsgId). `lastChatTime` is referenced in a commented-out line that
// would derive createdAt from a unix-seconds timestamp.
export interface IMessage {
  id: string
  role: string | number
  content: string
  lastChatTime?: number
}

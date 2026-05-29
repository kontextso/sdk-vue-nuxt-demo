// getMsgId — polybuzz's helper to extract a stable message id from their
// IMessage shape. KontextStore.vue calls it for every msg and short-
// circuits when it returns falsy, so messages without ids never reach
// addMessage(). The real implementation likely handles their internal
// id derivation; here we just return msg.id.
import type { IMessage } from '../types'

export function getMsgId(msg: IMessage | undefined | null): string | undefined {
  return msg?.id || undefined
}

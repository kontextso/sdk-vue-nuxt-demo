// Mock of @/components/PluginStore/hook — a small event bus + getter
// resolver. KontextProvider uses triggerEvents; KontextAds uses all four.
import type { EVENT_NAME, GETTER_NAME } from './interface'

type Handler = () => void
const listeners = new Map<string, Set<Handler>>()

function triggerEvents(event: EVENT_NAME): void {
  const set = listeners.get(event)
  if (!set) return
  for (const h of set) h()
}

function triggerGetters(_getter: GETTER_NAME): boolean {
  return false
}

function onEvent(event: EVENT_NAME, handler: Handler): void {
  let set = listeners.get(event)
  if (!set) {
    set = new Set()
    listeners.set(event, set)
  }
  set.add(handler)
}

function offEvent(event: EVENT_NAME, handler: Handler): void {
  listeners.get(event)?.delete(handler)
}

export default function usePlugin() {
  return { triggerEvents, triggerGetters, onEvent, offEvent }
}

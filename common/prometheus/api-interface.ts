// Mock of ~/common/prometheus/api-interface — polybuzz's Prometheus
// monitoring client. KontextStore.vue uses it to report `kontext_add_msg_error`
// when addMessage throws (e.g. duplicate-id / missing-id from sdk-js 4.0.3
// validation). For the demo we just log to the console.
export function callMonitorEndpoint(payload: Record<string, unknown>): void {
  console.log('[prometheus]', payload)
}

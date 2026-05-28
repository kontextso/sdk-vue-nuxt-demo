// Mock of @/networkapi/yapiApi — only the function KontextAds.vue calls.
// In their app this POSTs an ad-reward telemetry payload; here it's a
// no-op that logs to console.
export async function SMApiAdRewardChatadReport(payload: {
  adUniqueId: string
  reportType: string
  adType: string
  createTime: string
  sign: string
}): Promise<void> {
  console.log('[SMApiAdRewardChatadReport]', payload)
}

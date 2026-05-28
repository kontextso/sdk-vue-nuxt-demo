// Mock of ~/common/tools/retry — only the `timeout(seconds)` helper used
// by KontextAds.vue.
export function timeout(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

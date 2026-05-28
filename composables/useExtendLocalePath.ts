// Mock of polybuzz's useExtendLocalePath (Nuxt i18n helper). They use it
// to build localised routes from `{ name, params, query }`. For the repro
// we only need to return a usable href for the avatar link in KontextAds.
export function useExtendLocalePath() {
  return (input: { name?: string; params?: Record<string, string>; query?: Record<string, string | number> }): string => {
    const cid = input.params?.CID
    if (input.name === 'RoleInformation' && cid) {
      return `/character/profile/${cid}`
    }
    return '/'
  }
}

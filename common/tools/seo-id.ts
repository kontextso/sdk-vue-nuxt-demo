// Mock of ~/common/tools/seo-id — builds polybuzz's CID convention
// "slug-secretSceneId" (e.g. "pugsley-addams-42y7D").
export function buildCidWithName(secretSceneId: string, oriSceneName: string): string {
  const slug = (oriSceneName || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  return slug ? `${slug}-${secretSceneId}` : secretSceneId
}

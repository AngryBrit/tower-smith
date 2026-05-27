/** Short gallery share links: `?build=<uuid>` (loads tower from the community gallery API). */
export const TOWER_GALLERY_BUILD_PARAM = 'build'

export const GALLERY_BUILD_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isGalleryBuildId(id: string): boolean {
  return GALLERY_BUILD_ID_RE.test(id.trim())
}

export function readGalleryBuildIdFromUrlSearchParams(
  params: URLSearchParams,
): string | null {
  const raw = params.get(TOWER_GALLERY_BUILD_PARAM)?.trim()
  if (!raw || !isGalleryBuildId(raw)) return null
  return raw
}

export function clearGalleryBuildIdFromUrl(url: URL): void {
  url.searchParams.delete(TOWER_GALLERY_BUILD_PARAM)
}

/** Extract `build` query value from a pasted URL (percent-decoded). */
export function extractGalleryBuildIdFromText(text: string): string | null {
  const t = text.trim()
  const escaped = TOWER_GALLERY_BUILD_PARAM.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m =
    t.match(new RegExp(`[?&]${escaped}=([^&\\s#]+)`, 'i')) ??
    t.match(new RegExp(`^${escaped}=([^&\\s#]+)`, 'i'))
  const raw = m?.[1]?.trim()
  if (!raw) return null
  try {
    const decoded = decodeURIComponent(raw).trim()
    return isGalleryBuildId(decoded) ? decoded : null
  } catch {
    return isGalleryBuildId(raw) ? raw : null
  }
}

/**
 * Builds share URLs for a gallery build id.
 * - **clean**: `origin` + `pathname` + `?build=…` only.
 * - **full**: current `href` with `build` set (keeps other params and hash).
 */
export function buildGalleryShareUrls(
  buildId: string,
  pageHref: string,
): { clean: string; full: string } {
  const full = new URL(pageHref)
  full.searchParams.delete('tower')
  full.searchParams.set(TOWER_GALLERY_BUILD_PARAM, buildId)
  const clean = new URL(full.origin + full.pathname)
  clean.searchParams.set(TOWER_GALLERY_BUILD_PARAM, buildId)
  return { clean: clean.toString(), full: full.toString() }
}

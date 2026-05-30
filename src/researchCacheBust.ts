export const RESEARCH_CACHE_BUST_STORAGE_KEY = 'tower-export-research-cache-bust-v1'

export function readResearchCacheBust(): string {
  try {
    return localStorage.getItem(RESEARCH_CACHE_BUST_STORAGE_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

export function bumpResearchCacheBust(): string {
  const next = String(Date.now())
  try {
    localStorage.setItem(RESEARCH_CACHE_BUST_STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
  return next
}

/** Drop Workbox research JSON caches so the next load refetches sections. */
export async function clearResearchServiceWorkerCaches(): Promise<void> {
  if (typeof caches === 'undefined') return
  const keys = await caches.keys()
  await Promise.all(
    keys
      .filter((name) => name.startsWith('tower-research'))
      .map((name) => caches.delete(name)),
  )
}

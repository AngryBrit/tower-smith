import { readResearchCacheBust } from './researchCacheBust'

/** Dev: always bypass HTTP cache. Prod: default fetch + SW stale-while-revalidate. */
export function researchFetchInit(): RequestInit {
  return import.meta.env.DEV ? { cache: 'no-store' } : {}
}

/** Append cache-bust query in production after a manual refresh. */
export function withResearchCacheBust(url: string): string {
  if (import.meta.env.DEV) return url
  const bust = readResearchCacheBust()
  if (!bust) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${encodeURIComponent(bust)}`
}

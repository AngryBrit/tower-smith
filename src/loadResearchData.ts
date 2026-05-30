import {
  parseResearchManifest,
  parseResearchSection,
  type ResearchData,
} from './types/research'
import type { I18nFormatters } from './i18n/dictionary'
import { researchFetchInit, withResearchCacheBust } from './researchLoadCache'

export async function loadResearchData(
  baseUrl: string,
  fmt: I18nFormatters,
): Promise<ResearchData> {
  const fetchInit = researchFetchInit()
  const manifestUrl = withResearchCacheBust(`${baseUrl}research/manifest.json`)
  const manifestRes = await fetch(manifestUrl, fetchInit)
  if (!manifestRes.ok) {
    throw new Error(fmt.manifestLoadError(manifestRes.status))
  }
  const manifestRaw: unknown = await manifestRes.json()
  const { sectionFiles } = parseResearchManifest(manifestRaw)

  const sections = await Promise.all(
    sectionFiles.map(async (rel) => {
      const url = withResearchCacheBust(`${baseUrl}${rel.replace(/^\//, '')}`)
      const res = await fetch(url, fetchInit)
      if (!res.ok) {
        throw new Error(fmt.sectionLoadError(rel, res.status))
      }
      const json: unknown = await res.json()
      const slug = rel.replace(/^\//, '').split('/').pop()!.replace(/\.json$/i, '')
      return parseResearchSection(json, slug)
    }),
  )

  return { sections }
}

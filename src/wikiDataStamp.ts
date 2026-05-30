import stampJson from './data/wikiDataStamp.json'

export type WikiDataStamp = {
  /** ISO-8601 instant when wiki/game-derived data was last regenerated. */
  alignedAt: string
  /** Per-script timestamps from maintainer `scripts/*.mjs` runs. */
  scripts?: Record<string, string>
}

export const WIKI_DATA_STAMP = stampJson as WikiDataStamp

export function wikiDataAlignedAtDate(): Date | null {
  const raw = WIKI_DATA_STAMP.alignedAt?.trim()
  if (!raw) return null
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Locale-aware calendar date for UI, e.g. "May 30, 2026". */
export function formatWikiDataAlignedAt(locale: string): string | null {
  const d = wikiDataAlignedAtDate()
  if (!d) return null
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d)
}

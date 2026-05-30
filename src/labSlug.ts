import { parseAppDeepLinkFromUrl } from './appDeepLink'
import type { ResearchData } from './types/research'

/** Query param for deep links, e.g. `?lab=attack-research--damage` */
export const LAB_DEEP_LINK_QUERY_PARAM = 'lab'

/**
 * URL- and HTML-id-safe segment (lowercase, hyphens, no leading/trailing hyphen).
 */
export function slugifySegment(raw: string): string {
  const s = raw
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s.length > 0 ? s : 'item'
}

function uniqueSlugsFromLabels(labels: readonly string[]): string[] {
  const slugged = labels.map((label) => slugifySegment(label))
  const firstIndex = new Map<string, number>()
  return slugged.map((slug, i) => {
    if (!firstIndex.has(slug)) {
      firstIndex.set(slug, i)
      return slug
    }
    return `${slug}-${i}`
  })
}

/**
 * Base ids for items in one section (before global de-duplication).
 * Duplicate item names in the same section: first keeps `sec--item`, rest get `-{itemIndex}`.
 */
export function labDomIdsForSectionItems(
  sectionSlug: string,
  items: readonly { name: string }[],
): string[] {
  const bases = items.map(
    (it) => `${sectionSlug}--${slugifySegment(it.name)}`,
  )
  const firstIndexForBase = new Map<string, number>()
  return items.map((_, i) => {
    const base = bases[i]
    if (!firstIndexForBase.has(base)) {
      firstIndexForBase.set(base, i)
      return base
    }
    return `${base}-${i}`
  })
}

export type LabDomIdTables = {
  /** `labDomIdsBySection[si][ii]` matches `data.sections[si].items[ii]` */
  labDomIdsBySection: string[][]
  /** Lookup DOM id → grid position */
  labSlugToPosition: ReadonlyMap<string, { si: number; ii: number }>
}

export function buildLabDomIdTables(data: ResearchData): LabDomIdTables {
  const sectionSlugs = uniqueSlugsFromLabels(
    data.sections.map((s) => s.title),
  )
  const labDomIdsBySection: string[][] = []
  const labSlugToPosition = new Map<string, { si: number; ii: number }>()
  const usedGlobally = new Set<string>()

  for (let si = 0; si < data.sections.length; si += 1) {
    const sec = data.sections[si]
    const secSlug = sectionSlugs[si]
    const bases = labDomIdsForSectionItems(secSlug, sec.items)
    const row: string[] = []
    for (let ii = 0; ii < sec.items.length; ii += 1) {
      let id = bases[ii]
      if (usedGlobally.has(id)) {
        id = `${bases[ii]}-s${si}-i${ii}`
        let k = 1
        while (usedGlobally.has(id)) {
          id = `${bases[ii]}-s${si}-i${ii}-${k}`
          k += 1
        }
      }
      usedGlobally.add(id)
      row.push(id)
      labSlugToPosition.set(id, { si, ii })
    }
    labDomIdsBySection.push(row)
  }

  return { labDomIdsBySection, labSlugToPosition }
}

/**
 * Read lab deep link (`#slug` or `?lab=slug`). Ignores `relic-` / `workshop-` hashes.
 */
export function getLabSlugFromUrl(): string | null {
  const link = parseAppDeepLinkFromUrl()
  return link?.kind === 'lab' ? link.target : null
}

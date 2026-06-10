import { categoryNameKey } from './effectivePathsCategoryNames'
import type { EffectivePathsLinkedWorkbook } from './parseIdsMasterWorkbooks'

/** Category rows on the IDS Master IDS tab (only these are linked workbooks). */
export const EFFECTIVE_PATHS_IDS_WORKBOOK_NAMES = [
  'Laboratory',
  'Workshop',
  'Ultimate Weapon',
  'Themes & Songs',
  'Bots',
  'Relics',
  'Vault',
  'Cards',
  'Modules',
  'Guardians',
  'Player & Stuff',
] as const

const KNOWN_IDS_WORKBOOK_KEYS = new Set(
  EFFECTIVE_PATHS_IDS_WORKBOOK_NAMES.map((name) => categoryNameKey(name)),
)

const CANONICAL_ORDER = new Map(
  EFFECTIVE_PATHS_IDS_WORKBOOK_NAMES.map((name, index) => [categoryNameKey(name), index]),
)

export function isKnownIdsWorkbookName(name: string): boolean {
  return KNOWN_IDS_WORKBOOK_KEYS.has(categoryNameKey(name))
}

/** Keep only the eleven IDS gateway categories; drop IDS Collection, master ID rows, etc. */
export function filterKnownIdsWorkbooks(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook[] {
  const seen = new Set<string>()
  const out: EffectivePathsLinkedWorkbook[] = []
  for (const workbook of workbooks) {
    const key = categoryNameKey(workbook.name)
    if (!KNOWN_IDS_WORKBOOK_KEYS.has(key) || seen.has(key)) continue
    seen.add(key)
    out.push(workbook)
  }
  return sortIdsWorkbooksCanonical(out)
}

export function sortIdsWorkbooksCanonical(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook[] {
  return [...workbooks].sort(
    (a, b) =>
      (CANONICAL_ORDER.get(categoryNameKey(a.name)) ?? 999) -
      (CANONICAL_ORDER.get(categoryNameKey(b.name)) ?? 999),
  )
}

/** Canonical order for linked-workbook access rows (eleven IDS categories only). */
export function sortLinkedWorkbookAccess<
  T extends { name: string; spreadsheetId: string },
>(rows: readonly T[]): T[] {
  const known = rows.filter((row) => isKnownIdsWorkbookName(row.name))
  const canon = sortIdsWorkbooksCanonical(
    known.map((row) => ({ name: row.name, spreadsheetId: row.spreadsheetId })),
  )
  const out: T[] = []
  for (const wb of canon) {
    const row = known.find(
      (candidate) =>
        candidate.name === wb.name && candidate.spreadsheetId === wb.spreadsheetId,
    )
    if (row) out.push(row)
  }
  return out
}

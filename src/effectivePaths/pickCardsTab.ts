import { EFFECTIVE_PATHS_CARDS_TAB_TITLE, EFFECTIVE_PATHS_CARDS_WORKBOOK_NAME } from './effectivePathsWorkbooks'
import { pickIdsCollectionCategoryTab } from './pickIdsCollectionCategoryTab'

export type SheetTabGridProperties = {
  rowCount?: number
  columnCount?: number
}

export type SheetTabProperties = {
  sheetId: number
  title: string
  gridProperties?: SheetTabGridProperties
}

export const CARDS_INPUT_MIN_COLUMNS = 4
export const CARDS_INPUT_MIN_ROWS = 10

/** Skip navigation tabs; require grid size for B–D card block. */
export function isCardsInputTabCandidate(
  title: string,
  grid?: SheetTabGridProperties,
): boolean {
  const cols = grid?.columnCount ?? CARDS_INPUT_MIN_COLUMNS
  const rows = grid?.rowCount ?? 60
  if (cols < CARDS_INPUT_MIN_COLUMNS || rows < CARDS_INPUT_MIN_ROWS) return false

  const lower = title.trim().toLowerCase()
  if (
    lower === 'home page' ||
    lower === 'home' ||
    /^home\b/.test(lower) ||
    lower === 'ios' ||
    lower === 'readme'
  ) {
    return false
  }

  if (/card\s*preset/i.test(title)) return false

  return (
    /^cards_ms$/i.test(title.trim()) ||
    /^workshop_ms$/i.test(title.trim()) ||
    /^bots_ms$/i.test(title.trim()) ||
    /master\s*sheet/i.test(title) ||
    /^cards$/i.test(title.trim()) ||
    /^workshop$/i.test(title.trim()) ||
    /^bots$/i.test(title.trim()) ||
    /cards.*input/i.test(title)
  )
}

/** Pick the Cards v3.x Master Sheet input tab. */
export function pickEffectivePathsCardsTab(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties | null {
  return pickIdsCollectionCategoryTab(sheets, sheetGid, EFFECTIVE_PATHS_CARDS_WORKBOOK_NAME, () => {
    const master = sheets.find(
      (s) =>
        s.properties.title.trim().toLowerCase() ===
        EFFECTIVE_PATHS_CARDS_TAB_TITLE.toLowerCase(),
    )
    if (master) return master.properties

    const masterPattern = sheets.find((s) => /master\s*sheet/i.test(s.properties.title))
    if (masterPattern) return masterPattern.properties

    const cardsTab = sheets.find((s) => /^cards$/i.test(s.properties.title.trim()))
    return cardsTab?.properties ?? null
  })
}

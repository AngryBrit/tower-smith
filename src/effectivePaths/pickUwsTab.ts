import { EFFECTIVE_PATHS_UWS_TAB_TITLE, EFFECTIVE_PATHS_UWS_WORKBOOK_NAME } from './effectivePathsWorkbooks'
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

export const UWS_INPUT_MIN_COLUMNS = 8
export const UWS_INPUT_MIN_ROWS = 40

export function isUwsInputTabCandidate(
  title: string,
  grid?: SheetTabGridProperties,
): boolean {
  const cols = grid?.columnCount ?? UWS_INPUT_MIN_COLUMNS
  const rows = grid?.rowCount ?? UWS_INPUT_MIN_ROWS
  if (cols < UWS_INPUT_MIN_COLUMNS || rows < UWS_INPUT_MIN_ROWS) return false

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

  if (/uw\s*cost/i.test(title)) return false
  if (/^all\s*uws$/i.test(lower)) return false
  if (/^gt\+/i.test(lower)) return false
  if (/^cf\+/i.test(lower)) return false
  if (/^ids$/i.test(lower)) return false

  return (
    /^uw_ms$/i.test(title.trim()) ||
    /master\s*sheet/i.test(title) ||
    /^uws$/i.test(title.trim()) ||
    /^ultimate\s*weapons?$/i.test(title.trim())
  )
}

export function pickEffectivePathsUwsTab(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties | null {
  return pickIdsCollectionCategoryTab(sheets, sheetGid, EFFECTIVE_PATHS_UWS_WORKBOOK_NAME, () => {
    const master = sheets.find(
      (s) =>
        s.properties.title.trim().toLowerCase() === EFFECTIVE_PATHS_UWS_TAB_TITLE.toLowerCase(),
    )
    if (master) return master.properties

    const masterPattern = sheets.find((s) => /master\s*sheet/i.test(s.properties.title))
    if (masterPattern) return masterPattern.properties

    return null
  })
}

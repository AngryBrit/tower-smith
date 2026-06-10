import { EFFECTIVE_PATHS_LABORATORY_TAB_TITLE } from './effectivePathsWorkbooks'

export type SheetTabGridProperties = {
  rowCount?: number
  columnCount?: number
}

export type SheetTabProperties = {
  sheetId: number
  title: string
  gridProperties?: SheetTabGridProperties
}

export const LABORATORY_INPUT_MIN_COLUMNS = 8
export const LABORATORY_INPUT_MIN_ROWS = 20

export function isLaboratoryInputTabCandidate(
  title: string,
  grid?: SheetTabGridProperties,
): boolean {
  const cols = grid?.columnCount ?? LABORATORY_INPUT_MIN_COLUMNS
  const rows = grid?.rowCount ?? 60
  if (cols < LABORATORY_INPUT_MIN_COLUMNS || rows < LABORATORY_INPUT_MIN_ROWS) return false

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

  if (/lab\s*calculator/i.test(title)) return false
  if (/lab\s*planner/i.test(title)) return false

  return (
    /master\s*sheet/i.test(title) ||
    /^laboratory$/i.test(title.trim()) ||
    /^labs$/i.test(title.trim())
  )
}

export function pickEffectivePathsLaboratoryTab(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties | null {
  if (sheetGid != null) {
    const byGid = sheets.find((s) => s.properties.sheetId === sheetGid)
    if (byGid) return byGid.properties
    return null
  }

  const master = sheets.find(
    (s) =>
      s.properties.title.trim().toLowerCase() ===
      EFFECTIVE_PATHS_LABORATORY_TAB_TITLE.toLowerCase(),
  )
  if (master) return master.properties

  const masterPattern = sheets.find((s) => /master\s*sheet/i.test(s.properties.title))
  if (masterPattern) return masterPattern.properties

  return null
}

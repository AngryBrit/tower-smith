import { EFFECTIVE_PATHS_GUARDIANS_TAB_TITLE } from './effectivePathsWorkbooks'

export type SheetTabGridProperties = {
  rowCount?: number
  columnCount?: number
}

export type SheetTabProperties = {
  sheetId: number
  title: string
  gridProperties?: SheetTabGridProperties
}

export const GUARDIANS_INPUT_MIN_COLUMNS = 4
export const GUARDIANS_INPUT_MIN_ROWS = 20

export function isGuardiansInputTabCandidate(
  title: string,
  grid?: SheetTabGridProperties,
): boolean {
  const cols = grid?.columnCount ?? GUARDIANS_INPUT_MIN_COLUMNS
  const rows = grid?.rowCount ?? GUARDIANS_INPUT_MIN_ROWS
  if (cols < GUARDIANS_INPUT_MIN_COLUMNS || rows < GUARDIANS_INPUT_MIN_ROWS) return false

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

  if (/^ids$/i.test(lower)) return false
  if (/^all\s*chips$/i.test(lower)) return false
  if (/\bpath$/i.test(lower)) return false
  if (/^export$/i.test(lower)) return false
  if (/^dvt_/i.test(lower)) return false

  return (
    /master\s*sheet/i.test(title) ||
    /^guardians$/i.test(title.trim())
  )
}

export function pickEffectivePathsGuardiansTab(
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
      s.properties.title.trim().toLowerCase() === EFFECTIVE_PATHS_GUARDIANS_TAB_TITLE.toLowerCase(),
  )
  if (master) return master.properties

  const masterPattern = sheets.find((s) => /master\s*sheet/i.test(s.properties.title))
  if (masterPattern) return masterPattern.properties

  return null
}

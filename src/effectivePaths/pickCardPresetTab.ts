import { CARD_PRESET_SHEET_GRID_ROWS } from './cardPresetSheetLayout'
import { EFFECTIVE_PATHS_CARD_PRESET_TAB_TITLE } from './effectivePathsWorkbooks'
import type { SheetTabGridProperties, SheetTabProperties } from './pickCardsTab'

export const CARD_PRESET_INPUT_MIN_COLUMNS = 8
export const CARD_PRESET_INPUT_MIN_ROWS = 32

/** Skip navigation tabs; require grid size for D/H/L/P/T preset blocks. */
export function isCardPresetInputTabCandidate(
  title: string,
  grid?: SheetTabGridProperties,
): boolean {
  const cols = grid?.columnCount ?? CARD_PRESET_INPUT_MIN_COLUMNS
  const rows = grid?.rowCount ?? CARD_PRESET_SHEET_GRID_ROWS
  if (cols < CARD_PRESET_INPUT_MIN_COLUMNS || rows < CARD_PRESET_INPUT_MIN_ROWS) return false

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

  if (/card\s*preset/i.test(title) || /^presets?$/i.test(title.trim())) return true

  return false
}

/** Tabs that are never Card Preset input targets. */
export function isCardPresetTabExcluded(title: string): boolean {
  const lower = title.trim().toLowerCase()
  return (
    lower === 'home page' ||
    lower === 'home' ||
    /^home\b/.test(lower) ||
    lower === 'ios' ||
    lower === 'readme' ||
    /master\s*sheet/i.test(title)
  )
}

/** Pick the Cards v3.x Card Preset input tab. */
export function pickEffectivePathsCardPresetTab(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties | null {
  if (sheetGid != null) {
    const byGid = sheets.find((s) => s.properties.sheetId === sheetGid)
    if (byGid) return byGid.properties
    return null
  }

  const exact = sheets.find(
    (s) =>
      s.properties.title.trim().toLowerCase() ===
      EFFECTIVE_PATHS_CARD_PRESET_TAB_TITLE.toLowerCase(),
  )
  if (exact) return exact.properties

  const pattern = sheets.find((s) => /card\s*preset/i.test(s.properties.title))
  return pattern?.properties ?? null
}

import {
  EFFECTIVE_PATHS_MODULES_TAB_TITLE,
  EFFECTIVE_PATHS_MODULES_WORKBOOK_NAME,
} from './effectivePathsWorkbooks'
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

export const MODULES_INPUT_MIN_COLUMNS = 45
export const MODULES_INPUT_MIN_ROWS = 25

export function isModulesInputTabCandidate(
  title: string,
  grid?: SheetTabGridProperties,
): boolean {
  const cols = grid?.columnCount ?? MODULES_INPUT_MIN_COLUMNS
  const rows = grid?.rowCount ?? MODULES_INPUT_MIN_ROWS
  if (cols < MODULES_INPUT_MIN_COLUMNS || rows < MODULES_INPUT_MIN_ROWS) return false

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

  if (/reroll/i.test(title)) return false
  if (/calculator/i.test(title)) return false
  if (/^uw[_\s-]*modules$/i.test(lower)) return false
  if (/^tracker$/i.test(lower)) return false
  if (/^overview$/i.test(lower)) return false
  if (/^substats$/i.test(lower)) return false
  if (/^module costs$/i.test(lower)) return false
  if (/^presets$/i.test(lower)) return false
  if (/^shard path$/i.test(lower)) return false
  if (/^optimal/i.test(lower)) return false
  if (/^master\s*sheet$/i.test(lower)) return false

  return /inventory/i.test(title) || /^modules inventory$/i.test(title.trim())
}

export function pickEffectivePathsModulesTab(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties | null {
  return pickIdsCollectionCategoryTab(
    sheets,
    sheetGid,
    EFFECTIVE_PATHS_MODULES_WORKBOOK_NAME,
    () => {
      const exact = sheets.find(
        (s) =>
          s.properties.title.trim().toLowerCase() ===
          EFFECTIVE_PATHS_MODULES_TAB_TITLE.toLowerCase(),
      )
      if (
        exact &&
        isModulesInputTabCandidate(exact.properties.title, exact.properties.gridProperties)
      ) {
        return exact.properties
      }

      const pattern = sheets.find((s) =>
        isModulesInputTabCandidate(s.properties.title, s.properties.gridProperties),
      )
      return pattern?.properties ?? null
    },
  )
}

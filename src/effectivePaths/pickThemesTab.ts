import {
  EFFECTIVE_PATHS_THEMES_TAB_TITLE,
  EFFECTIVE_PATHS_THEMES_WORKBOOK_NAME,
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

/** Themes input uses owned/name columns through R (18 columns). */
export const THEMES_INPUT_MIN_COLUMNS = 18
export const THEMES_INPUT_MIN_ROWS = 8

/** Skip navigation/summary tabs; require grid size for B–R theme blocks. */
export function isThemesInputTabCandidate(
  title: string,
  grid?: SheetTabGridProperties,
): boolean {
  const cols = grid?.columnCount ?? THEMES_INPUT_MIN_COLUMNS
  const rows = grid?.rowCount ?? 120
  if (cols < THEMES_INPUT_MIN_COLUMNS || rows < THEMES_INPUT_MIN_ROWS) return false

  const lower = title.trim().toLowerCase()
  if (
    lower === 'home page' ||
    lower === 'home' ||
    /^home\b/.test(lower) ||
    lower === 'readme' ||
    lower === 'instructions' ||
    lower === 'changelog'
  ) {
    return false
  }

  return (
    /themes.*songs/i.test(title) ||
    /red.*input/i.test(title) ||
    lower === EFFECTIVE_PATHS_THEMES_TAB_TITLE.toLowerCase()
  )
}

/** Pick the Themes & Songs input tab inside the Effective Paths workbook. */
export function pickEffectivePathsThemesTab(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties | null {
  return pickIdsCollectionCategoryTab(
    sheets,
    sheetGid,
    EFFECTIVE_PATHS_THEMES_WORKBOOK_NAME,
    () => {
      const inputTab = sheets.find((s) => /themes.*songs.*input/i.test(s.properties.title))
      if (inputTab) return inputTab.properties

      const redInput = sheets.find((s) => /red.*input/i.test(s.properties.title))
      if (redInput) return redInput.properties

      const exact = sheets.find(
        (s) =>
          s.properties.title.trim().toLowerCase() ===
          EFFECTIVE_PATHS_THEMES_TAB_TITLE.toLowerCase(),
      )
      if (exact) return exact.properties

      const themesTab = sheets.find((s) => /themes.*songs/i.test(s.properties.title))
      return themesTab?.properties ?? null
    },
  )
}

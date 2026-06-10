import { quoteSheetTitleForRange } from './buildRelicUnlockedUpdates'
import { columnIndexToA1Letter } from './relicSheetLayout'
import { gameThemeIdFromSheetName, type EffectivePathsThemeSheetSection } from './themeSheetNames'

export type EffectivePathsThemeSheetRow = {
  /** 1-based row index in the Google Sheet. */
  rowIndex: number
  name: string
  section: EffectivePathsThemeSheetSection
  ownedCol: number
}

export type ThemeOwnedBatchUpdate = {
  range: string
  values: string[][]
}

/** Build per-row updates for owned checkbox columns (B, E, M, Q on Themes & Songs v3.x). */
export function buildThemeOwnedUpdates(
  sheetTitle: string,
  themeRows: readonly EffectivePathsThemeSheetRow[],
  ownedThemeIds: ReadonlySet<string>,
): ThemeOwnedBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  return themeRows.map((row) => {
    const id = gameThemeIdFromSheetName(row.name, row.section)
    const owned = id != null && ownedThemeIds.has(id)
    const col = columnIndexToA1Letter(row.ownedCol)
    return {
      range: `${quoted}!${col}${row.rowIndex}`,
      values: [[owned ? 'TRUE' : 'FALSE']],
    }
  })
}

import { workshopRelicIdFromSheetName } from './relicSheetNames'
import { columnIndexToA1Letter } from './relicSheetLayout'

export type EffectivePathsRelicSheetRow = {
  /** 1-based row index in the Google Sheet. */
  rowIndex: number
  name: string
}

export type RelicUnlockedBatchUpdate = {
  range: string
  values: string[][]
}

/** @deprecated Use parseRelicRowsWithLayout — kept for tests using C:F slices. */
export function parseRelicRowsFromSheetValues(
  rows: readonly (readonly string[])[],
  startRowIndex = 1,
): EffectivePathsRelicSheetRow[] {
  const out: EffectivePathsRelicSheetRow[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const name = row[0]?.trim()
    if (!name || name.startsWith('Rarity')) continue
    const unlockedRaw = row[3]?.trim().toUpperCase()
    if (unlockedRaw && unlockedRaw !== 'TRUE' && unlockedRaw !== 'FALSE') continue
    if (!workshopRelicIdFromSheetName(name)) continue
    out.push({ rowIndex: startRowIndex + i, name })
  }
  return out
}

export function quoteSheetTitleForRange(title: string): string {
  return `'${title.replace(/'/g, "''")}'`
}

/** Build per-row updates for the Unlocked column. */
export function buildRelicUnlockedUpdates(
  sheetTitle: string,
  relicRows: readonly EffectivePathsRelicSheetRow[],
  ownedRelicIds: ReadonlySet<string>,
  unlockedCol = 5,
): RelicUnlockedBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const col = columnIndexToA1Letter(unlockedCol)
  return relicRows.map((row) => {
    const id = workshopRelicIdFromSheetName(row.name)
    const owned = id != null && ownedRelicIds.has(id)
    return {
      range: `${quoted}!${col}${row.rowIndex}`,
      values: [[owned ? 'TRUE' : 'FALSE']],
    }
  })
}

export function unmappedRelicSheetNames(
  rows: readonly (readonly string[])[],
): string[] {
  const out: string[] = []
  for (const row of rows) {
    const name = row[0]?.trim()
    if (!name || name.startsWith('Rarity')) continue
    const unlockedRaw = row[3]?.trim().toUpperCase()
    if (unlockedRaw && unlockedRaw !== 'TRUE' && unlockedRaw !== 'FALSE') continue
    if (!workshopRelicIdFromSheetName(name)) out.push(name)
  }
  return out
}

import { quoteSheetTitleForRange } from './buildRelicUnlockedUpdates'
import { columnIndexToA1Letter } from './relicSheetLayout'
import { getEffectiveLevel } from '../types/research'
import type { ResearchData } from '../types/research'
import type { EffectivePathsLabSheetRow } from './labSheetLayout'

export type LabSheetBatchUpdate = {
  range: string
  values: (string | number | boolean)[][]
}

/** Build per-row Level column updates for Laboratory v3.x Master Sheet. */
export function buildLabSheetUpdates(
  sheetTitle: string,
  labRows: readonly EffectivePathsLabSheetRow[],
  data: ResearchData,
  levelOverrides: Readonly<Record<string, number>>,
): LabSheetBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const out: LabSheetBatchUpdate[] = []

  for (const row of labRows) {
    const { sectionIndex, itemIndex } = row.itemRef
    const item = data.sections[sectionIndex]?.items[itemIndex]
    if (!item) continue
    const level = Math.max(
      0,
      Math.round(getEffectiveLevel(sectionIndex, itemIndex, item, { ...levelOverrides })),
    )
    const levelCol = columnIndexToA1Letter(row.levelCol)
    out.push({
      range: `${quoted}!${levelCol}${row.rowIndex}`,
      values: [[level]],
    })
  }

  return out
}

import type { WorkshopGameCardId } from '../data/workshopGameCards'
import { quoteSheetTitleForRange } from './buildRelicUnlockedUpdates'
import type { EffectivePathsCardSheetRow } from './cardSheetLayout'
import { columnIndexToA1Letter } from './cardSheetLayout'
import { workshopCardIdFromSheetName } from './cardSheetNames'

export type CardSheetBatchUpdate = {
  range: string
  values: string[][]
}

function levelCellValue(cardId: WorkshopGameCardId, stars: number): string | number {
  if (cardId === 'areaOfEffect' && stars <= 0) return 'Locked'
  return Math.max(0, Math.min(7, Math.round(stars)))
}

/** Build per-row updates for level (C) and mastery (D) on Cards v3.x Master Sheet. */
export function buildCardSheetUpdates(
  sheetTitle: string,
  cardRows: readonly EffectivePathsCardSheetRow[],
  cardStars: Readonly<Record<string, number>>,
  cardMasteryUnlockedIds: ReadonlySet<string>,
  cardEquipSlots: number,
): CardSheetBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const out: CardSheetBatchUpdate[] = []

  for (const row of cardRows) {
    const levelCol = columnIndexToA1Letter(2)
    const masteryCol = columnIndexToA1Letter(3)

    if (row.kind === 'equip_slots') {
      out.push({
        range: `${quoted}!${levelCol}${row.rowIndex}`,
        values: [[Math.max(0, Math.round(cardEquipSlots))]],
      })
      continue
    }

    const cardId = workshopCardIdFromSheetName(row.name)
    if (!cardId) continue
    const stars = cardStars[cardId] ?? 0
    out.push({
      range: `${quoted}!${levelCol}${row.rowIndex}`,
      values: [[levelCellValue(cardId, stars)]],
    })
    out.push({
      range: `${quoted}!${masteryCol}${row.rowIndex}`,
      values: [[cardMasteryUnlockedIds.has(cardId) ? 'TRUE' : 'FALSE']],
    })
  }

  return out
}

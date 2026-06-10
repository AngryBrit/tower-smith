import type { WorkshopGameCardId } from '../data/workshopGameCards'
import { WORKSHOP_CARD_PRESET_COUNT } from '../data/workshopGameCardWiki'
import { quoteSheetTitleForRange } from './buildRelicUnlockedUpdates'
import { workshopCardSheetNameFromId } from './cardSheetNames'
import type { EffectivePathsCardPresetSlot } from './cardPresetSheetLayout'
import { columnIndexToA1Letter } from './cardPresetSheetLayout'

export type CardPresetSheetBatchUpdate = {
  range: string
  values: string[][]
}

/** Build per-slot card-name updates for Cards v3.x Card Preset tab. */
export function buildCardPresetSheetUpdates(
  sheetTitle: string,
  slots: readonly EffectivePathsCardPresetSlot[],
  cardPresetLoadouts: readonly (readonly WorkshopGameCardId[])[],
  sheetLabels?: ReadonlyMap<WorkshopGameCardId, string>,
): CardPresetSheetBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const out: CardPresetSheetBatchUpdate[] = []

  for (const slot of slots) {
    if (slot.presetIndex < 0 || slot.presetIndex >= WORKSHOP_CARD_PRESET_COUNT) continue
    const loadout = cardPresetLoadouts[slot.presetIndex] ?? []
    const cardId = loadout[slot.slotIndex]
    const col = columnIndexToA1Letter(slot.nameCol)
    out.push({
      range: `${quoted}!${col}${slot.rowIndex}`,
      values: [[cardId ? workshopCardSheetNameFromId(cardId, sheetLabels) : '']],
    })
  }

  return out
}

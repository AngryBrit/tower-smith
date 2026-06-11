import type { WorkshopGameCardId } from '../data/workshopGameCards'
import { WORKSHOP_CARD_PRESET_COUNT } from '../data/workshopGameCardWiki'
import type { EffectivePathsCardPresetSlot } from './cardPresetSheetLayout'
import { isCardEquipSlotsSheetName, workshopCardIdFromSheetName } from './cardSheetNames'
import type { EffectivePathsCardSheetRow, CardSheetLayout } from './cardSheetLayout'
import { parseSheetBoolCell, parseSheetLevelCell } from './epSheetCellParsing'

export type CardStateFromSheet = {
  cardStars: Record<string, number>
  cardEquipSlots: number
  cardMasteryUnlockedIds: string[]
  cardPresetLoadouts: WorkshopGameCardId[][]
}

function parseCardLevelCell(
  cardId: WorkshopGameCardId,
  raw: unknown,
): number | null {
  const text = String(raw ?? '').trim()
  if (!text) return 0
  if (/^locked$/i.test(text)) return 0
  return parseSheetLevelCell(raw)
}

/** Read card stars, mastery, equip slots, and presets from Cards workbook sheets. */
export function cardStateFromSheetRows(
  cardRows: readonly EffectivePathsCardSheetRow[],
  grid: readonly (readonly unknown[])[],
  layout: CardSheetLayout,
  presetSlots: readonly EffectivePathsCardPresetSlot[],
  presetGrid: readonly (readonly unknown[])[],
): CardStateFromSheet {
  const cardStars: Record<string, number> = {}
  let cardEquipSlots = 0
  const cardMasteryUnlockedIds: string[] = []

  for (const row of cardRows) {
    if (row.kind === 'equip_slots') {
      const level = parseSheetLevelCell(grid[row.rowIndex - 1]?.[layout.levelCol])
      if (level != null) cardEquipSlots = level
      continue
    }

    const cardId = workshopCardIdFromSheetName(row.name)
    if (!cardId) continue

    const stars = parseCardLevelCell(cardId, grid[row.rowIndex - 1]?.[layout.levelCol])
    if (stars != null) cardStars[cardId] = Math.max(0, Math.min(7, stars))

    if (parseSheetBoolCell(grid[row.rowIndex - 1]?.[layout.masteryCol])) {
      cardMasteryUnlockedIds.push(cardId)
    }
  }

  const cardPresetLoadouts: WorkshopGameCardId[][] = Array.from(
    { length: WORKSHOP_CARD_PRESET_COUNT },
    () => [],
  )

  for (const slot of presetSlots) {
    if (slot.presetIndex < 0 || slot.presetIndex >= WORKSHOP_CARD_PRESET_COUNT) continue
    const name = String(presetGrid[slot.rowIndex - 1]?.[slot.nameCol] ?? '').trim()
    if (!name) continue
    const cardId = workshopCardIdFromSheetName(name)
    if (!cardId) continue
    const loadout = cardPresetLoadouts[slot.presetIndex]!
    while (loadout.length <= slot.slotIndex) loadout.push('damage' as WorkshopGameCardId)
    loadout[slot.slotIndex] = cardId
  }

  return { cardStars, cardEquipSlots, cardMasteryUnlockedIds, cardPresetLoadouts }
}

export { isCardEquipSlotsSheetName }

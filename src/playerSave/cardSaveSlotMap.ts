/**
 * `cardLevel` / `cardUnlocked` save index per workshop card id (playerInfo.dat field order).
 * First eight cards align 1:1 with catalog order; later cards skip reserved slots at
 * indices 8–9, 14, 17, 24, and 36–39 (40-element arrays).
 */

import {
  WORKSHOP_GAME_CARD_ORDER,
  clampWorkshopCardActivePresetIndex,
  defaultWorkshopCardStars,
  type WorkshopCardStarsState,
  type WorkshopGameCardId,
} from '../data/workshopGameCards'
import {
  WORKSHOP_CARD_MAX_SLOTS_HARMONY,
  WORKSHOP_CARD_PRESET_COUNT,
  defaultCardPresetLoadouts,
} from '../data/workshopGameCardWiki'

/** Unused slots in the 40-element `cardLevel` / `cardUnlocked` arrays. */
export const CARD_SAVE_RESERVED_INDICES = [8, 9, 14, 17, 24, 36, 37, 38, 39] as const

export const CARD_SAVE_ARRAY_LENGTH = 40

const CARD_SAVE_RESERVED = new Set<number>(CARD_SAVE_RESERVED_INDICES)

function buildCardSaveIndexByCardId(): Readonly<Record<WorkshopGameCardId, number>> {
  const out = {} as Record<WorkshopGameCardId, number>
  let saveIndex = 0
  for (const cardId of WORKSHOP_GAME_CARD_ORDER) {
    while (CARD_SAVE_RESERVED.has(saveIndex)) saveIndex++
    out[cardId] = saveIndex
    saveIndex++
  }
  return out
}

export const CARD_SAVE_INDEX_BY_CARD_ID = buildCardSaveIndexByCardId()

function buildCardSaveCardIdByIndex(): Readonly<Partial<Record<number, WorkshopGameCardId>>> {
  const out: Partial<Record<number, WorkshopGameCardId>> = {}
  for (const [cardId, saveIndex] of Object.entries(CARD_SAVE_INDEX_BY_CARD_ID) as [
    WorkshopGameCardId,
    number,
  ][]) {
    out[saveIndex] = cardId
  }
  return out
}

export const CARD_SAVE_CARD_ID_BY_INDEX = buildCardSaveCardIdByIndex()

export const CARD_PRESET_SLOT_ARRAY_LENGTH =
  WORKSHOP_CARD_PRESET_COUNT * WORKSHOP_CARD_MAX_SLOTS_HARMONY

export const CARD_SAVE_MAX_MAPPED_INDEX = Math.max(
  ...Object.values(CARD_SAVE_INDEX_BY_CARD_ID),
)

export function cardSaveIndexForCardId(id: WorkshopGameCardId): number {
  return CARD_SAVE_INDEX_BY_CARD_ID[id]
}

export function cardIdForSaveIndex(saveIndex: number): WorkshopGameCardId | null {
  if (!Number.isFinite(saveIndex)) return null
  return CARD_SAVE_CARD_ID_BY_INDEX[Math.trunc(saveIndex)] ?? null
}

export function mapCardPresetsFromSave(
  slotPresetCardInt: readonly number[],
  slotPresetCardAssignedBool: readonly boolean[],
  currentCardPreset: number,
): {
  cardPresetLoadouts: WorkshopGameCardId[][]
  cardActivePresetIndex: number
} {
  const loadouts = defaultCardPresetLoadouts()
  for (let preset = 0; preset < WORKSHOP_CARD_PRESET_COUNT; preset++) {
    const row: WorkshopGameCardId[] = []
    const seen = new Set<WorkshopGameCardId>()
    for (let slot = 0; slot < WORKSHOP_CARD_MAX_SLOTS_HARMONY; slot++) {
      const idx = preset * WORKSHOP_CARD_MAX_SLOTS_HARMONY + slot
      if (slotPresetCardAssignedBool[idx] !== true) continue
      const saveIndex = slotPresetCardInt[idx]
      if (typeof saveIndex !== 'number' || !Number.isFinite(saveIndex)) continue
      const cardId = cardIdForSaveIndex(saveIndex)
      if (!cardId || seen.has(cardId)) continue
      seen.add(cardId)
      row.push(cardId)
    }
    loadouts[preset] = row
  }
  return {
    cardPresetLoadouts: loadouts,
    cardActivePresetIndex: clampWorkshopCardActivePresetIndex(currentCardPreset),
  }
}

export function mapCardStarsFromSave(
  cardLevel: readonly number[],
  cardUnlocked?: readonly boolean[],
): WorkshopCardStarsState {
  const stars = defaultWorkshopCardStars()
  const hasUnlock = cardUnlocked != null && cardUnlocked.length > 0

  for (const cardId of WORKSHOP_GAME_CARD_ORDER) {
    const saveIndex = CARD_SAVE_INDEX_BY_CARD_ID[cardId]!
    if (hasUnlock && cardUnlocked[saveIndex] !== true) {
      continue
    }
    const level = cardLevel[saveIndex]
    if (typeof level === 'number' && Number.isFinite(level)) {
      stars[cardId] = Math.max(0, Math.trunc(level))
    }
  }
  return stars
}

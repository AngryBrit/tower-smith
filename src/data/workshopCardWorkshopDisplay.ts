/**
 * Apply equipped ACTIVE cards (stars × Card Mastery) to workshop stat displays.
 */

import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { ResearchData } from '../types/research'
import { workshopCardMasteryMultiplier } from './workshopCardMastery'
import {
  workshopEquippedCardStars,
  type WorkshopCardLoadoutPersisted,
  type WorkshopGameCardId,
} from './workshopGameCards'
import { workshopGameCardStarValue, workshopGameCardWiki } from './workshopGameCardWiki'

function loadoutFromPersisted(ws: WorkshopPersistedV1): WorkshopCardLoadoutPersisted {
  return {
    cardStars: ws.cardStars,
    cardPresetLoadouts: ws.cardPresetLoadouts,
    cardActivePresetIndex: ws.cardActivePresetIndex,
    cardEquipSlots: ws.cardEquipSlots,
  }
}

/** Wiki **Damage Card** × multiplier (in active preset + Card Mastery). */
export function workshopDamageCardMultiplier(
  ws: WorkshopPersistedV1,
  research: ResearchData | null,
  overrides: Record<string, number>,
): number {
  return workshopCardMultProduct(ws, research, overrides, 'damage')
}

/** × multiplier from equipped card stars (mult kind only) × mastery. */
export function workshopCardMultProduct(
  ws: WorkshopPersistedV1,
  research: ResearchData | null,
  overrides: Record<string, number>,
  cardId: WorkshopGameCardId,
): number {
  const stars = workshopEquippedCardStars(loadoutFromPersisted(ws), cardId)
  if (stars <= 0) return 1
  if (workshopGameCardWiki(cardId).kind !== 'mult') return 1
  const v = workshopGameCardStarValue(cardId, stars)
  if (v == null) return 1
  return v * workshopCardMasteryMultiplier(cardId, research, overrides)
}

/** Additive percent points from equipped card (addPercent / percent kinds) × mastery. */
export function workshopCardAddPercentPoints(
  ws: WorkshopPersistedV1,
  research: ResearchData | null,
  overrides: Record<string, number>,
  cardId: WorkshopGameCardId,
): number {
  const stars = workshopEquippedCardStars(loadoutFromPersisted(ws), cardId)
  if (stars <= 0) return 0
  const kind = workshopGameCardWiki(cardId).kind
  if (kind !== 'addPercent' && kind !== 'percent') return 0
  const v = workshopGameCardStarValue(cardId, stars)
  if (v == null) return 0
  return v * workshopCardMasteryMultiplier(cardId, research, overrides)
}

/** Lab × card product; undefined when both are neutral and lab was omitted. */
export function mergeLabAndCardMult(
  labMultiplier: number | undefined,
  cardMultiplier: number,
): number | undefined {
  const card = cardMultiplier > 1 + 1e-9 ? cardMultiplier : 1
  const lab = labMultiplier ?? 1
  const product = lab * card
  if (product <= 1 + 1e-9 && labMultiplier === undefined) return undefined
  return product
}

export function mergeLabAndCardPercentPoints(
  labPercentPoints: number | undefined,
  cardPercentPoints: number,
): number | undefined {
  const card = cardPercentPoints > 0 ? cardPercentPoints : 0
  const lab = labPercentPoints ?? 0
  const sum = lab + card
  if (sum <= 0 && labPercentPoints === undefined && card <= 0) return undefined
  return sum
}

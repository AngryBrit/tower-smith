/**
 * Card detail dialog — tower lab rows that enhance specific workshop cards (in-game copy).
 */

import { getEffectiveLevel, type ResearchData } from '../types/research'
import type { WorkshopGameCardId } from './workshopGameCards'
import type { StringId } from '../i18n/dictionary'

/** In-game max extra-orb distance slider when Extra Orb Adjuster is unlocked. */
export const EXTRA_ORB_ADJUSTER_MAX_DISTANCE = 400

export type CardDetailLabEnhancementRow = {
  titleId: StringId
  descId: StringId
  value: string
}

function cardsResearchLabLevel(
  data: ResearchData | null,
  overrides: Record<string, number>,
  labName: string,
): number {
  if (!data) return 0
  const sectionIndex = data.sections.findIndex((s) => s.sectionSlug === 'cards-research')
  if (sectionIndex < 0) return 0
  const itemIndex = data.sections[sectionIndex]?.items.findIndex((i) => i.name === labName) ?? -1
  if (itemIndex < 0) return 0
  const item = data.sections[sectionIndex]?.items[itemIndex]
  if (!item) return 0
  return getEffectiveLevel(sectionIndex, itemIndex, item, overrides)
}

function extraOrbLabEnhancements(
  data: ResearchData | null,
  overrides: Record<string, number>,
): readonly CardDetailLabEnhancementRow[] {
  const adjusterLevel = cardsResearchLabLevel(data, overrides, 'Extra Orb Adjuster')
  const extraOrbsLevel = cardsResearchLabLevel(data, overrides, 'Extra Extra Orbs')
  return [
    {
      titleId: 'ws_cards_detail_lab_extra_orb_distance_title',
      descId: 'ws_cards_detail_lab_extra_orb_distance_desc',
      value: adjusterLevel > 0 ? String(EXTRA_ORB_ADJUSTER_MAX_DISTANCE) : '0',
    },
    {
      titleId: 'ws_cards_detail_lab_extra_orb_additional_title',
      descId: 'ws_cards_detail_lab_extra_orb_additional_desc',
      value: String(extraOrbsLevel),
    },
  ]
}

export function workshopCardDetailLabEnhancements(
  cardId: WorkshopGameCardId,
  data: ResearchData | null,
  overrides: Record<string, number>,
): readonly CardDetailLabEnhancementRow[] {
  switch (cardId) {
    case 'extraOrb':
      return extraOrbLabEnhancements(data, overrides)
    default:
      return []
  }
}

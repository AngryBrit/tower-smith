/**
 * Card detail dialog — tower lab rows that enhance specific workshop cards (in-game copy).
 */

import {
  getEffectiveLevel,
  rechargeDemonModeCardDetailWavesDisplay,
  rechargeSecondWindCardDetailWavesDisplay,
  secondWindBlastPercentDisplay,
  superTowerBonusMultiplierDisplay,
  type ResearchData,
} from '../types/research'
import type { WorkshopGameCardId } from './workshopGameCards'
import type { StringId } from '../i18n/dictionary'

/** In-game max extra-orb distance slider when Extra Orb Adjuster is unlocked. */
export const EXTRA_ORB_ADJUSTER_MAX_DISTANCE = 400

export type CardDetailLabEnhancementRow = {
  titleId: StringId
  descId: StringId
  value: string
}

export function cardsResearchLabLevel(
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

function deathRayLabEnhancements(
  data: ResearchData | null,
  overrides: Record<string, number>,
): readonly CardDetailLabEnhancementRow[] {
  const level = cardsResearchLabLevel(data, overrides, 'Double Death Ray')
  const sectionIndex = data?.sections.findIndex((s) => s.sectionSlug === 'cards-research') ?? -1
  const item =
    sectionIndex >= 0
      ? data?.sections[sectionIndex]?.items.find((i) => i.name === 'Double Death Ray')
      : undefined
  const maxLevel = item?.maxLevel ?? 30
  const capped =
    maxLevel > 0 ? Math.min(Math.max(0, level), maxLevel) : Math.max(0, level)
  return [
    {
      titleId: 'ws_cards_detail_lab_death_ray_double_title',
      descId: 'ws_cards_detail_lab_death_ray_double_desc',
      value: `${capped.toFixed(2)}%`,
    },
  ]
}

function superTowerLabEnhancements(
  data: ResearchData | null,
  overrides: Record<string, number>,
): readonly CardDetailLabEnhancementRow[] {
  const level = cardsResearchLabLevel(data, overrides, 'Super Tower Bonus')
  const sectionIndex = data?.sections.findIndex((s) => s.sectionSlug === 'cards-research') ?? -1
  const item =
    sectionIndex >= 0
      ? data?.sections[sectionIndex]?.items.find((i) => i.name === 'Super Tower Bonus')
      : undefined
  const maxLevel = item?.maxLevel ?? 30
  return [
    {
      titleId: 'ws_cards_detail_lab_super_tower_bonus_title',
      descId: 'ws_cards_detail_lab_super_tower_bonus_desc',
      value: superTowerBonusMultiplierDisplay(level, maxLevel),
    },
  ]
}

function secondWindLabEnhancements(
  data: ResearchData | null,
  overrides: Record<string, number>,
): readonly CardDetailLabEnhancementRow[] {
  const blastLevel = cardsResearchLabLevel(data, overrides, 'Second Wind Blast')
  const rechargeLevel = cardsResearchLabLevel(data, overrides, 'Recharge Second Wind')
  const sectionIndex = data?.sections.findIndex((s) => s.sectionSlug === 'cards-research') ?? -1
  const blastItem =
    sectionIndex >= 0
      ? data?.sections[sectionIndex]?.items.find((i) => i.name === 'Second Wind Blast')
      : undefined
  const rechargeItem =
    sectionIndex >= 0
      ? data?.sections[sectionIndex]?.items.find((i) => i.name === 'Recharge Second Wind')
      : undefined
  const blastMax = blastItem?.maxLevel ?? 4
  const rechargeMax = rechargeItem?.maxLevel ?? 7
  return [
    {
      titleId: 'ws_cards_detail_lab_second_wind_blast_title',
      descId: 'ws_cards_detail_lab_second_wind_blast_desc',
      value: secondWindBlastPercentDisplay(blastLevel, blastMax),
    },
    {
      titleId: 'ws_cards_detail_lab_second_wind_recharge_title',
      descId: 'ws_cards_detail_lab_second_wind_recharge_desc',
      value: rechargeSecondWindCardDetailWavesDisplay(rechargeLevel, rechargeMax),
    },
  ]
}

function demonModeLabEnhancements(
  data: ResearchData | null,
  overrides: Record<string, number>,
): readonly CardDetailLabEnhancementRow[] {
  const rechargeLevel = cardsResearchLabLevel(data, overrides, 'Recharge Demon Mode')
  const sectionIndex = data?.sections.findIndex((s) => s.sectionSlug === 'cards-research') ?? -1
  const rechargeItem =
    sectionIndex >= 0
      ? data?.sections[sectionIndex]?.items.find((i) => i.name === 'Recharge Demon Mode')
      : undefined
  const rechargeMax = rechargeItem?.maxLevel ?? 7
  return [
    {
      titleId: 'ws_cards_detail_lab_demon_mode_recharge_title',
      descId: 'ws_cards_detail_lab_demon_mode_recharge_desc',
      value: rechargeDemonModeCardDetailWavesDisplay(rechargeLevel, rechargeMax),
    },
  ]
}

function energyShieldLabEnhancements(
  data: ResearchData | null,
  overrides: Record<string, number>,
): readonly CardDetailLabEnhancementRow[] {
  const extraHitLevel = cardsResearchLabLevel(data, overrides, 'Energy Shield Extra Hit')
  const sectionIndex = data?.sections.findIndex((s) => s.sectionSlug === 'cards-research') ?? -1
  const extraHitItem =
    sectionIndex >= 0
      ? data?.sections[sectionIndex]?.items.find((i) => i.name === 'Energy Shield Extra Hit')
      : undefined
  const extraHitMax = extraHitItem?.maxLevel ?? 2
  const capped =
    extraHitMax > 0
      ? Math.min(Math.max(0, extraHitLevel), extraHitMax)
      : Math.max(0, extraHitLevel)
  const totalHits = 1 + capped
  return [
    {
      titleId: 'ws_cards_detail_lab_energy_shield_extra_hit_title',
      descId: 'ws_cards_detail_lab_energy_shield_extra_hit_desc',
      value: `${totalHits} ${totalHits === 1 ? 'hit' : 'hits'}`,
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
    case 'deathRay':
      return deathRayLabEnhancements(data, overrides)
    case 'superTower':
      return superTowerLabEnhancements(data, overrides)
    case 'secondWind':
      return secondWindLabEnhancements(data, overrides)
    case 'demonMode':
      return demonModeLabEnhancements(data, overrides)
    case 'energyShield':
      return energyShieldLabEnhancements(data, overrides)
    default:
      return []
  }
}

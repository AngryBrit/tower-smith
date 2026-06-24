/**
 * Card Mastery lab rows (research section `card-mastery`) align 1:1 with {@link WORKSHOP_GAME_CARD_ORDER}.
 */

import cardMasteryTierLabels from './card-mastery-tier-labels.json'
import { getEffectiveLevel, levelOverrideKey, type ResearchData, type ResearchItem } from '../types/research'
import {
  WORKSHOP_GAME_CARD_ORDER,
  workshopGameCardTitleId,
  type WorkshopGameCardId,
} from './workshopGameCards'
import { formatWorkshopGameCardStarEffectForDetail } from './workshopGameCardWiki'
import type { StringId } from '../i18n/dictionary'

const CARD_MASTERY_TIER_LABELS = cardMasteryTierLabels as Record<string, readonly string[]>

type CardMasteryDetailMasteryDescStyle = 'additional_multiplier' | 'stat_multiplier'
type CardMasteryDetailTierLabelStyle =
  | 'default'
  | 'incremental_percent'
  | 'plain_percent'
  | 'plus_percent'
  | 'thirds_percent'
  | 'plain_sec'
  | 'compact_mult'

/** In-game card detail mastery copy when it differs from the inventory card title. */
type CardMasteryDetailDisplay = {
  titleId?: StringId
  abilitySuffixPlus?: boolean
  masteryDescId?: StringId
  masteryDescStyle?: CardMasteryDetailMasteryDescStyle
  masteryTierLabelStyle?: CardMasteryDetailTierLabelStyle
  abilityDescId?: StringId
  researchDescId?: StringId
}

const CARD_MASTERY_DETAIL_DISPLAY: Partial<Record<WorkshopGameCardId, CardMasteryDetailDisplay>> = {
  range: { titleId: 'ws_stat_damagePerMeter', abilitySuffixPlus: false },
  damage: {
    masteryDescStyle: 'stat_multiplier',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_damage',
    researchDescId: 'ws_cards_detail_mastery_research_desc_damage',
  },
  attackSpeed: {
    masteryDescStyle: 'stat_multiplier',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_attack_speed',
    researchDescId: 'ws_cards_detail_mastery_research_desc_attack_speed',
  },
  health: {
    masteryDescStyle: 'stat_multiplier',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_health',
    researchDescId: 'ws_cards_detail_mastery_research_desc_health',
  },
  healthRegen: {
    masteryDescStyle: 'stat_multiplier',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_health_regen',
    researchDescId: 'ws_cards_detail_mastery_research_desc_health_regen',
  },
  cash: {
    titleId: 'ws_card_elite_farming',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_cash',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_cash',
    researchDescId: 'ws_cards_detail_mastery_research_desc_cash',
  },
  coins: {
    masteryDescStyle: 'stat_multiplier',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_coins',
    researchDescId: 'ws_cards_detail_mastery_research_desc_coins',
  },
  slowAura: {
    titleId: 'ws_card_slow_attack',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_slow_aura',
    masteryTierLabelStyle: 'incremental_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_slow_aura',
    researchDescId: 'ws_cards_detail_mastery_research_desc_slow_aura',
  },
  criticalChance: {
    titleId: 'ws_card_super_critical_chance',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_critical_chance',
    masteryTierLabelStyle: 'plain_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_critical_chance',
    researchDescId: 'ws_cards_detail_mastery_research_desc_critical_chance',
  },
  enemyBalance: {
    titleId: 'ws_card_elite_balance',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_enemy_balance',
    masteryTierLabelStyle: 'plain_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_enemy_balance',
    researchDescId: 'ws_cards_detail_mastery_research_desc_enemy_balance',
  },
  extraDefense: {
    masteryDescStyle: 'stat_multiplier',
    masteryTierLabelStyle: 'plain_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_extra_defense',
    researchDescId: 'ws_cards_detail_mastery_research_desc_extra_defense',
  },
  fortress: {
    titleId: 'ws_card_fortress_walls',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_fortress',
    masteryTierLabelStyle: 'plain_sec',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_fortress',
    researchDescId: 'ws_cards_detail_mastery_research_desc_fortress',
  },
  freeUpgrades: {
    titleId: 'ws_card_locked_upgrade',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_free_upgrades',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_free_upgrades',
    researchDescId: 'ws_cards_detail_mastery_research_desc_free_upgrades',
  },
  extraOrb: {
    titleId: 'ws_card_coin_orb',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_extra_orb',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_extra_orb',
    researchDescId: 'ws_cards_detail_mastery_research_desc_extra_orb',
  },
  plasmaCannon: {
    titleId: 'ws_card_elite_cannon',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_plasma_cannon',
    masteryTierLabelStyle: 'plain_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_plasma_cannon',
    researchDescId: 'ws_cards_detail_mastery_research_desc_plasma_cannon',
  },
  criticalCoin: {
    titleId: 'ws_card_double_coins',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_critical_coin',
    masteryTierLabelStyle: 'plain_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_critical_coin',
    researchDescId: 'ws_cards_detail_mastery_research_desc_critical_coin',
  },
  waveSkip: {
    titleId: 'ws_card_double_wave_skip',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_wave_skip',
    masteryTierLabelStyle: 'plain_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_wave_skip',
    researchDescId: 'ws_cards_detail_mastery_research_desc_wave_skip',
  },
  introSprint: {
    titleId: 'ws_card_warp_speed',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_intro_sprint',
    masteryTierLabelStyle: 'compact_mult',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_intro_sprint',
    researchDescId: 'ws_cards_detail_mastery_research_desc_intro_sprint',
  },
  landMineStun: {
    titleId: 'ws_card_flashbang',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_land_mine_stun',
    masteryTierLabelStyle: 'plain_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_land_mine_stun',
    researchDescId: 'ws_cards_detail_mastery_research_desc_land_mine_stun',
  },
  recoveryPackageChance: {
    titleId: 'ws_card_care_package',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_recovery_package_chance',
    masteryTierLabelStyle: 'plain_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_recovery_package_chance',
    researchDescId: 'ws_cards_detail_mastery_research_desc_recovery_package_chance',
  },
  deathRay: {
    titleId: 'ws_card_enhanced_ray',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_death_ray',
    masteryTierLabelStyle: 'plain_percent',
    researchDescId: 'ws_cards_detail_mastery_research_desc_death_ray',
  },
  energyNet: {
    titleId: 'ws_card_electrified_net',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_energy_net',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_energy_net',
    researchDescId: 'ws_cards_detail_mastery_research_desc_energy_net',
  },
  superTower: {
    titleId: 'ws_card_ultimate_tower',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_super_tower',
    masteryTierLabelStyle: 'plain_sec',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_super_tower',
    researchDescId: 'ws_cards_detail_mastery_research_desc_super_tower',
  },
  secondWind: {
    titleId: 'ws_card_angel_wings',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_second_wind',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_second_wind',
    researchDescId: 'ws_cards_detail_mastery_research_desc_second_wind',
  },
  demonMode: {
    titleId: 'ws_card_demon_revenge',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_demon_mode',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_demon_mode',
    researchDescId: 'ws_cards_detail_mastery_research_desc_demon_mode',
  },
  energyShield: {
    titleId: 'ws_card_repel',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_energy_shield',
    masteryTierLabelStyle: 'plain_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_energy_shield',
    researchDescId: 'ws_cards_detail_mastery_research_desc_energy_shield',
  },
  waveAccelerator: {
    titleId: 'ws_card_spawn_accelerator',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_wave_accelerator',
    masteryTierLabelStyle: 'plus_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_wave_accelerator',
    researchDescId: 'ws_cards_detail_mastery_research_desc_wave_accelerator',
  },
  berserker: {
    titleId: 'ws_card_viking_funeral',
    abilitySuffixPlus: false,
    masteryDescId: 'ws_cards_detail_mastery_desc_berserker',
    masteryTierLabelStyle: 'plain_sec',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_berserker',
    researchDescId: 'ws_cards_detail_mastery_research_desc_berserker',
  },
  ultimateCrit: {
    masteryDescStyle: 'stat_multiplier',
    masteryTierLabelStyle: 'thirds_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_ultimate_crit',
    researchDescId: 'ws_cards_detail_mastery_research_desc_ultimate_crit',
  },
}

export function workshopCardMasteryDetailTitleId(cardId: WorkshopGameCardId): StringId {
  return CARD_MASTERY_DETAIL_DISPLAY[cardId]?.titleId ?? workshopGameCardTitleId(cardId)
}

export function workshopCardMasteryDetailMasteryDescId(
  cardId: WorkshopGameCardId,
): StringId | null {
  return CARD_MASTERY_DETAIL_DISPLAY[cardId]?.masteryDescId ?? null
}

export function workshopCardMasteryDetailAbilityDescId(
  cardId: WorkshopGameCardId,
): StringId | null {
  return CARD_MASTERY_DETAIL_DISPLAY[cardId]?.abilityDescId ?? null
}

export function workshopCardMasteryDetailResearchDescId(
  cardId: WorkshopGameCardId,
): StringId | null {
  return CARD_MASTERY_DETAIL_DISPLAY[cardId]?.researchDescId ?? null
}

export function workshopCardMasteryDetailMasteryDescStyle(
  cardId: WorkshopGameCardId,
): CardMasteryDetailMasteryDescStyle {
  return CARD_MASTERY_DETAIL_DISPLAY[cardId]?.masteryDescStyle ?? 'additional_multiplier'
}

export function workshopCardMasteryDetailTierLabelStyle(
  cardId: WorkshopGameCardId,
): CardMasteryDetailTierLabelStyle {
  return CARD_MASTERY_DETAIL_DISPLAY[cardId]?.masteryTierLabelStyle ?? 'default'
}

export function workshopCardMasteryDetailAbilityLabel(
  cardId: WorkshopGameCardId,
  statLabel: string,
): string {
  const suffixPlus = CARD_MASTERY_DETAIL_DISPLAY[cardId]?.abilitySuffixPlus ?? true
  return suffixPlus ? `${statLabel}+` : statLabel
}

export function cardMasterySectionIndex(data: ResearchData): number {
  return data.sections.findIndex((s) => s.sectionSlug === 'card-mastery')
}

export function workshopCardMasteryLevel(
  cardId: WorkshopGameCardId,
  data: ResearchData | null,
  overrides: Record<string, number>,
): number {
  if (!data) return 0
  const sectionIndex = cardMasterySectionIndex(data)
  if (sectionIndex < 0) return 0
  const itemIndex = WORKSHOP_GAME_CARD_ORDER.indexOf(cardId)
  if (itemIndex < 0) return 0
  const item = data.sections[sectionIndex]?.items[itemIndex]
  if (!item) return 0
  return getEffectiveLevel(sectionIndex, itemIndex, item, overrides)
}

/** True when the matching Card Mastery lab has level &gt; 0 in the simulator. */
export function workshopCardMasteryUnlocked(
  cardId: WorkshopGameCardId,
  data: ResearchData | null,
  overrides: Record<string, number>,
): boolean {
  return workshopCardMasteryLevel(cardId, data, overrides) > 0
}

export function workshopCardMasteryUnlockedSet(
  data: ResearchData | null,
  overrides: Record<string, number>,
): ReadonlySet<WorkshopGameCardId> {
  const unlocked = new Set<WorkshopGameCardId>()
  if (!data) return unlocked
  for (const id of WORKSHOP_GAME_CARD_ORDER) {
    if (workshopCardMasteryUnlocked(id, data, overrides)) {
      unlocked.add(id)
    }
  }
  return unlocked
}

export function workshopCardMasteryResearchRef(
  cardId: WorkshopGameCardId,
  data: ResearchData | null,
): { sectionIndex: number; itemIndex: number; item: ResearchItem } | null {
  if (!data) return null
  const sectionIndex = cardMasterySectionIndex(data)
  if (sectionIndex < 0) return null
  const itemIndex = WORKSHOP_GAME_CARD_ORDER.indexOf(cardId)
  if (itemIndex < 0) return null
  const item = data.sections[sectionIndex]?.items[itemIndex]
  if (!item) return null
  return { sectionIndex, itemIndex, item }
}

export function workshopCardMasteryTierLabel(
  cardId: WorkshopGameCardId,
  data: ResearchData | null,
  level: number,
): string | null {
  if (!data || level < 0) return null
  const itemName = workshopCardMasteryItemName(cardId, data)
  if (!itemName) return null
  const tiers = CARD_MASTERY_TIER_LABELS[itemName]
  if (!tiers?.length) return null
  const idx = Math.min(level, tiers.length - 1)
  return tiers[idx] ?? null
}

/** First-tier mastery multiplier label (e.g. x1.4) for unlock preview. */
export function workshopCardMasteryUnlockPreviewLabel(
  cardId: WorkshopGameCardId,
  data: ResearchData | null,
): string | null {
  if (!data) return null
  const itemName = workshopCardMasteryItemName(cardId, data)
  if (!itemName) return null
  const tiers = CARD_MASTERY_TIER_LABELS[itemName]
  return tiers?.[0] ?? null
}

function workshopCardMasteryItemName(
  cardId: WorkshopGameCardId,
  data: ResearchData,
): string | null {
  const sectionIndex = cardMasterySectionIndex(data)
  if (sectionIndex < 0) return null
  const itemIndex = WORKSHOP_GAME_CARD_ORDER.indexOf(cardId)
  if (itemIndex < 0) return null
  return data.sections[sectionIndex]?.items[itemIndex]?.name ?? null
}

/** Clear every Card Mastery lab override (used by Reset Cards). */
export function clearWorkshopCardMasteryOverrides(
  data: ResearchData | null,
  overrides: Readonly<Record<string, number>>,
): Record<string, number> {
  if (!data) return { ...overrides }
  const sectionIndex = cardMasterySectionIndex(data)
  if (sectionIndex < 0) return { ...overrides }
  const items = data.sections[sectionIndex]?.items
  if (!items?.length) return { ...overrides }
  const out = { ...overrides }
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const key = levelOverrideKey(sectionIndex, itemIndex)
    if ((out[key] ?? 0) !== 0) out[key] = 0
  }
  return out
}

export function parseCardMasteryTierMultiplier(label: string): number {
  const m = /^x([\d.]+)$/i.exec(label.trim())
  if (!m) return 1
  const n = Number(m[1])
  return Number.isFinite(n) && n > 0 ? n : 1
}

/** Detail-dialog display for tier labels (e.g. x1.2 → x1.20, 0.4% → 0.40%). */
export function formatCardMasteryTierLabelDetail(label: string, fixedDecimals = 2): string {
  const trimmed = label.trim()
  const xMatch = /^x([\d.]+)$/i.exec(trimmed)
  if (xMatch) {
    const n = Number(xMatch[1])
    if (Number.isFinite(n)) return `x${n.toFixed(fixedDecimals)}`
  }
  const pctMatch = /^(\+?)([\d.]+)%$/.exec(trimmed)
  if (pctMatch) {
    const n = Number(pctMatch[2])
    if (Number.isFinite(n)) return `${pctMatch[1]}${n.toFixed(fixedDecimals)}%`
  }
  return label
}

function formatIncrementalPercentFromMultiplierLabel(
  label: string,
  fixedDecimals = 2,
): string | null {
  const m = /^x([\d.]+)$/i.exec(label.trim())
  if (!m) return null
  const mult = Number(m[1])
  if (!Number.isFinite(mult)) return null
  const pct = (mult - 1) * 100
  if (!Number.isFinite(pct)) return null
  const num = Number.isInteger(pct)
    ? String(pct)
    : pct.toFixed(fixedDecimals).replace(/\.?0+$/, '')
  return `+${num}%`
}

function formatPlainPercentLabel(label: string, fixedDecimals = 2): string | null {
  const m = /^\+?([\d.]+)%$/.exec(label.trim())
  if (!m) return null
  const n = Number(m[1])
  if (!Number.isFinite(n)) return null
  const num = Number.isInteger(n)
    ? String(n)
    : n.toFixed(fixedDecimals).replace(/\.?0+$/, '')
  return `${num}%`
}

function formatPlusPercentLabel(label: string, fixedDecimals = 2): string | null {
  const m = /^\+?([\d.]+)%$/.exec(label.trim())
  if (!m) return null
  const n = Number(m[1])
  if (!Number.isFinite(n)) return null
  const num = Number.isInteger(n)
    ? String(n)
    : n.toFixed(fixedDecimals).replace(/\.?0+$/, '')
  return `+${num}%`
}

/**
 * Mastery tier value as exact thirds with two decimals (in-game Ultimate Crit copy):
 * stored labels round to one decimal (+0.3%, +0.7%, +1.0%…) but the game shows the
 * precise increment (+0.33%, +0.67%, +1.00%…).
 */
function formatThirdsPercentLabel(label: string, fixedDecimals = 2): string | null {
  const m = /^\+?([\d.]+)%$/.exec(label.trim())
  if (!m) return null
  const n = Number(m[1])
  if (!Number.isFinite(n)) return null
  const exact = Math.round(n * 3) / 3
  return `+${exact.toFixed(fixedDecimals)}%`
}

function formatPlainSecLabel(label: string): string | null {
  const m = /^-?(\d+(?:\.\d+)?)s$/i.exec(label.trim())
  if (!m) return null
  return `${m[1]}s`
}

function formatCompactMultLabel(label: string): string | null {
  const m = /^x([\d.]+)$/i.exec(label.trim())
  if (!m) return null
  const n = Number(m[1])
  if (!Number.isFinite(n)) return null
  const num = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')
  return `x${num}`
}

/** Card detail mastery tier value (e.g. Slow Aura x1.05 → +5%). */
export function formatCardMasteryTierLabelDetailForCard(
  cardId: WorkshopGameCardId,
  label: string,
  fixedDecimals = 2,
): string {
  const style = workshopCardMasteryDetailTierLabelStyle(cardId)
  if (style === 'incremental_percent') {
    const pct = formatIncrementalPercentFromMultiplierLabel(label, fixedDecimals)
    if (pct) return pct
  }
  if (style === 'plain_percent') {
    const pct = formatPlainPercentLabel(label, fixedDecimals)
    if (pct) return pct
  }
  if (style === 'plus_percent') {
    const pct = formatPlusPercentLabel(label, fixedDecimals)
    if (pct) return pct
  }
  if (style === 'thirds_percent') {
    const pct = formatThirdsPercentLabel(label, fixedDecimals)
    if (pct) return pct
  }
  if (style === 'plain_sec') {
    const sec = formatPlainSecLabel(label)
    if (sec) return sec
  }
  if (style === 'compact_mult') {
    const mult = formatCompactMultLabel(label)
    if (mult) return mult
  }
  return formatCardMasteryTierLabelDetail(label, fixedDecimals)
}

/** Card detail Lv.1–7 value; applies plain_percent when configured for the card. */
export function formatWorkshopGameCardStarLevelEffectForDetail(
  cardId: WorkshopGameCardId,
  stars: number,
): string {
  return formatWorkshopGameCardStarEffectForDetail(cardId, stars)
}

/** Wiki tier multiplier for the simulated Card Mastery level (1 when level ≤ 0). */
export function workshopCardMasteryMultiplier(
  cardId: WorkshopGameCardId,
  data: ResearchData | null,
  overrides: Record<string, number>,
): number {
  const level = workshopCardMasteryLevel(cardId, data, overrides)
  if (level <= 0 || !data) return 1
  const itemName = workshopCardMasteryItemName(cardId, data)
  if (!itemName) return 1
  const tiers = CARD_MASTERY_TIER_LABELS[itemName]
  if (!tiers?.length) return 1
  const idx = Math.min(level, tiers.length - 1)
  return parseCardMasteryTierMultiplier(tiers[idx] ?? 'x1')
}

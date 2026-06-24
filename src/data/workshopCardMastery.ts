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
import type { StringId } from '../i18n/dictionary'

const CARD_MASTERY_TIER_LABELS = cardMasteryTierLabels as Record<string, readonly string[]>

type CardMasteryDetailMasteryDescStyle = 'additional_multiplier' | 'stat_multiplier'
type CardMasteryDetailTierLabelStyle = 'default' | 'incremental_percent' | 'plain_percent'

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
  cash: {
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
    masteryDescId: 'ws_cards_detail_mastery_desc_slow_aura',
    masteryTierLabelStyle: 'incremental_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_slow_aura',
    researchDescId: 'ws_cards_detail_mastery_research_desc_slow_aura',
  },
  criticalChance: {
    masteryDescId: 'ws_cards_detail_mastery_desc_critical_chance',
    masteryTierLabelStyle: 'plain_percent',
    abilityDescId: 'ws_cards_detail_mastery_ability_desc_critical_chance',
    researchDescId: 'ws_cards_detail_mastery_research_desc_critical_chance',
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
  if (!data || level <= 0) return null
  const itemName = workshopCardMasteryItemName(cardId, data)
  if (!itemName) return null
  const tiers = CARD_MASTERY_TIER_LABELS[itemName]
  if (!tiers?.length) return null
  const idx = Math.min(level, tiers.length) - 1
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
  return formatCardMasteryTierLabelDetail(label, fixedDecimals)
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

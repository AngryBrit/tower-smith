/**
 * Workshop **bot** upgrades (medals, wiki Basic Upgrades tables).
 */

import {
  WORKSHOP_BOT_ORDER,
  WORKSHOP_BOT_SPECIAL_BY_BOT,
  WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT,
  WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED,
  WORKSHOP_BOT_SPECIAL_LEVEL_ORDER,
  WORKSHOP_BOT_SPECIAL_TRACKS,
  WORKSHOP_BOT_SPECIAL_UNLOCK_STONES,
  WORKSHOP_BOT_TRACKS,
  WORKSHOP_BOT_UPGRADE_ORDER,
  WORKSHOP_BOT_WEAPON_STATS,
  type WorkshopBotId,
  type WorkshopBotSpecialKey,
  type WorkshopBotSpecialLevelKey,
  type WorkshopBotUpgradeKey,
} from './workshopBotsData'
import {
  formatPercentAfterLabAddition,
  formatSecondsAfterLabAddition,
  formatSecondsAfterLabReduction,
} from './workshopLabDisplayHelpers'
import type { WorkshopBotLabDisplayOpts } from './workshopLabDisplayOpts'
import {
  formatWorkshopUltimateCooldown,
  formatWorkshopUltimateValue,
  workshopUltimateTrackClampLevel,
  workshopUltimateTrackMaxLevel,
  workshopUltimateTrackNextMarginalStones,
  workshopUltimateTrackStatDisplay,
  workshopUltimateTrackStatValue,
} from './workshopUltimateTable'

export type { WorkshopBotLabDisplayOpts } from './workshopLabDisplayOpts'

export {
  WORKSHOP_BOT_ORDER,
  WORKSHOP_BOT_SPECIAL_BY_BOT,
  WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT,
  WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED,
  WORKSHOP_BOT_SPECIAL_LEVEL_ORDER,
  WORKSHOP_BOT_SPECIAL_TRACKS,
  WORKSHOP_BOT_SPECIAL_UNLOCK_STONES,
  WORKSHOP_BOT_TRACKS,
  WORKSHOP_BOT_UPGRADE_ORDER,
  WORKSHOP_BOT_WEAPON_STATS,
  type WorkshopBotId,
  type WorkshopBotSpecialKey,
  type WorkshopBotSpecialLevelKey,
  type WorkshopBotUpgradeKey,
}

export function workshopBotSpecialLevelKey(botId: WorkshopBotId): WorkshopBotSpecialLevelKey {
  return WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT[botId]
}

export function workshopBotSpecialMaxLevel(botId: WorkshopBotId): number {
  const key = workshopBotSpecialLevelKey(botId)
  return workshopUltimateTrackMaxLevel(WORKSHOP_BOT_SPECIAL_TRACKS[key])
}

export function workshopBotSpecialClampLevel(botId: WorkshopBotId, level: number): number {
  const key = workshopBotSpecialLevelKey(botId)
  if (!Number.isFinite(level)) return WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED
  const n = Math.trunc(level)
  if (n < WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED) return WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED
  return workshopUltimateTrackClampLevel(WORKSHOP_BOT_SPECIAL_TRACKS[key], n)
}

/** One-time stone purchase in the event shop (separate from medal upgrade level). */
export function workshopBotSpecialStonePurchased(
  ws: Partial<Record<WorkshopBotSpecialKey, boolean>> &
    Partial<Record<WorkshopBotSpecialLevelKey, number>>,
  botId: WorkshopBotId,
): boolean {
  return ws[WORKSHOP_BOT_SPECIAL_BY_BOT[botId]] === true
}

export function workshopBotSpecialLevel(
  ws: Partial<Record<WorkshopBotSpecialLevelKey, number>> &
    Partial<Record<WorkshopBotSpecialKey, boolean>>,
  botId: WorkshopBotId,
): number {
  if (!workshopBotSpecialStonePurchased(ws, botId)) return WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED
  const key = workshopBotSpecialLevelKey(botId)
  const raw = Number(ws[key])
  if (!Number.isFinite(raw)) return 0
  return workshopBotSpecialClampLevel(botId, raw)
}

export function workshopBotSpecialNextMarginalMedals(
  botId: WorkshopBotId,
  completedLevels: number,
): number | undefined {
  const key = workshopBotSpecialLevelKey(botId)
  const L = workshopUltimateTrackClampLevel(
    WORKSHOP_BOT_SPECIAL_TRACKS[key],
    completedLevels,
  )
  if (L >= workshopBotSpecialMaxLevel(botId)) return undefined
  return workshopUltimateTrackNextMarginalStones(WORKSHOP_BOT_SPECIAL_TRACKS[key], L)
}

function formatWorkshopBotPlusMult(value: number): string {
  return `x${(Math.round(value * 100) / 100).toFixed(2)}`
}

export function workshopBotSpecialStatDisplay(botId: WorkshopBotId, completedLevels: number): string {
  const key = workshopBotSpecialLevelKey(botId)
  const track = WORKSHOP_BOT_SPECIAL_TRACKS[key]
  if (track.valueKind === 'mult') {
    const L = workshopUltimateTrackClampLevel(track, completedLevels)
    return formatWorkshopBotPlusMult(track.milestones[L]!.value)
  }
  return workshopUltimateTrackStatDisplay(track, completedLevels)
}

export function workshopBotMaxLevel(key: WorkshopBotUpgradeKey): number {
  return workshopUltimateTrackMaxLevel(WORKSHOP_BOT_TRACKS[key])
}

export function workshopBotClampLevel(key: WorkshopBotUpgradeKey, level: number): number {
  return workshopUltimateTrackClampLevel(WORKSHOP_BOT_TRACKS[key], level)
}

export function workshopBotNextMarginalMedals(
  key: WorkshopBotUpgradeKey,
  completedLevels: number,
): number | undefined {
  return workshopUltimateTrackNextMarginalStones(WORKSHOP_BOT_TRACKS[key], completedLevels)
}

export function workshopBotStatDisplay(
  key: WorkshopBotUpgradeKey,
  completedLevels: number,
  opts?: WorkshopBotLabDisplayOpts,
): string {
  const track = WORKSHOP_BOT_TRACKS[key]
  const L = workshopUltimateTrackClampLevel(track, completedLevels)
  if (track.valueKind === 'seconds') {
    const base = track.milestones[L]!.value
    const cooldownRed = opts?.cooldownReduction?.[key]
    if (cooldownRed != null && cooldownRed > 0) {
      return formatSecondsAfterLabReduction(base, cooldownRed)
    }
    const durationBonus = opts?.durationBonus?.[key]
    if (durationBonus != null && durationBonus > 0) {
      return formatSecondsAfterLabAddition(base, durationBonus)
    }
    return formatWorkshopUltimateCooldown(base)
  }
  if (track.valueKind === 'mult') {
    return formatWorkshopBotPlusMult(track.milestones[L]!.value)
  }
  if (key === 'thunderBotLingerLevel') {
    const labPct = opts?.thunderLingerLabPercentPoints
    if (labPct != null && labPct > 0) {
      const pct = workshopUltimateTrackStatValue(track, completedLevels)
      return formatPercentAfterLabAddition(pct, labPct)
    }
  }
  if (track.valueKind === 'meters' && key.endsWith('RangeLevel')) {
    const relicM = opts?.botRangeRelicMeters ?? 0
    if (relicM > 0) {
      const base = workshopUltimateTrackStatValue(track, completedLevels)
      return formatWorkshopUltimateValue('meters', base + relicM)
    }
  }
  return workshopUltimateTrackStatDisplay(track, completedLevels)
}

export type WorkshopBotActiveKey =
  | `${Exclude<WorkshopBotId, 'botBot'>}BotActive`
  | 'botBotActive'

export const WORKSHOP_BOT_ACTIVE_ORDER: readonly WorkshopBotActiveKey[] = WORKSHOP_BOT_ORDER.map(
  (id) => workshopBotActiveKey(id),
)

export function workshopBotActiveKey(botId: WorkshopBotId): WorkshopBotActiveKey {
  if (botId === 'botBot') return 'botBotActive'
  return `${botId}BotActive`
}

/** Event shop medal cost by number of bots already owned (wiki Basic Upgrades). */
export const WORKSHOP_BOT_UNLOCK_MEDAL_COSTS = [100, 300, 600, 900, 1200] as const

export const WORKSHOP_BOT_UNLOCK_MEDAL_TOTAL = WORKSHOP_BOT_UNLOCK_MEDAL_COSTS.reduce(
  (sum, cost) => sum + cost,
  0,
)

export type WorkshopBotOwnedKey = `${WorkshopBotId}Owned`

export const WORKSHOP_BOT_OWNED_ORDER: readonly WorkshopBotOwnedKey[] = WORKSHOP_BOT_ORDER.map(
  (id) => workshopBotOwnedKey(id),
)

export function workshopBotOwnedKey(botId: WorkshopBotId): WorkshopBotOwnedKey {
  return `${botId}Owned`
}

function workshopBotHasLegacyPurchase(
  ws: Partial<Record<WorkshopBotUpgradeKey, number>>,
  botId: WorkshopBotId,
): boolean {
  return workshopBotUpgradeKeys(botId).some((key) => Number(ws[key] ?? 0) > 0)
}

/** Whether this bot has been bought with medals in the event shop. */
export function workshopBotIsOwned(
  ws: Partial<Record<WorkshopBotOwnedKey, boolean>> &
    Partial<Record<WorkshopBotUpgradeKey, number>>,
  botId: WorkshopBotId,
): boolean {
  if (ws[workshopBotOwnedKey(botId)] === true) return true
  return workshopBotHasLegacyPurchase(ws, botId)
}

export function workshopBotOwnedCount(
  ws: Partial<Record<WorkshopBotOwnedKey, boolean>> &
    Partial<Record<WorkshopBotUpgradeKey, number>>,
): number {
  return WORKSHOP_BOT_ORDER.filter((id) => workshopBotIsOwned(ws, id)).length
}

export function workshopBotExplicitOwnedCount(
  ws: Partial<Record<WorkshopBotOwnedKey, boolean>>,
): number {
  return WORKSHOP_BOT_ORDER.filter((id) => ws[workshopBotOwnedKey(id)] === true).length
}

/** Medals already spent on event-shop bot unlocks (explicit `*Owned` flags only). */
export function workshopBotUnlockSpentMedals(
  ws: Partial<Record<WorkshopBotOwnedKey, boolean>>,
): number {
  const count = workshopBotExplicitOwnedCount(ws)
  return WORKSHOP_BOT_UNLOCK_MEDAL_COSTS.slice(0, count).reduce((sum, cost) => sum + cost, 0)
}

/** Medals still needed to unlock every bot not yet owned (includes legacy-owned bots). */
export function workshopBotUnlockToMaxMedals(
  ws: Partial<Record<WorkshopBotOwnedKey, boolean>> &
    Partial<Record<WorkshopBotUpgradeKey, number>>,
): number {
  const count = workshopBotOwnedCount(ws)
  return WORKSHOP_BOT_UNLOCK_MEDAL_COSTS.slice(count).reduce((sum, cost) => sum + cost, 0)
}

/** Medal cost to unlock the next bot (null when all five are owned). */
export function workshopBotNextUnlockCost(
  ws: Partial<Record<WorkshopBotOwnedKey, boolean>> &
    Partial<Record<WorkshopBotUpgradeKey, number>>,
): number | null {
  const count = workshopBotOwnedCount(ws)
  if (count >= WORKSHOP_BOT_UNLOCK_MEDAL_COSTS.length) return null
  return WORKSHOP_BOT_UNLOCK_MEDAL_COSTS[count]!
}

/** Medal cost to unlock this bot (null if already owned). */
export function workshopBotUnlockCostForBot(
  ws: Partial<Record<WorkshopBotOwnedKey, boolean>> &
    Partial<Record<WorkshopBotUpgradeKey, number>>,
  botId: WorkshopBotId,
): number | null {
  if (workshopBotIsOwned(ws, botId)) return null
  return workshopBotNextUnlockCost(ws)
}

export function workshopBotIsActive(
  ws: Partial<Record<WorkshopBotActiveKey, boolean>> &
    Partial<Record<WorkshopBotOwnedKey, boolean>> &
    Partial<Record<WorkshopBotUpgradeKey, number>>,
  botId: WorkshopBotId,
): boolean {
  if (!workshopBotIsOwned(ws, botId)) return false
  return ws[workshopBotActiveKey(botId)] !== false
}

export function workshopBotUpgradeKeys(botId: WorkshopBotId): readonly WorkshopBotUpgradeKey[] {
  return WORKSHOP_BOT_WEAPON_STATS[botId].map((s) => s.key)
}

export function workshopBotAllMaxed(
  levels: Record<WorkshopBotUpgradeKey, number>,
  botId: WorkshopBotId,
): boolean {
  return workshopBotUpgradeKeys(botId).every((key) => levels[key] >= workshopBotMaxLevel(key))
}

export function workshopBotSpecialIsUnlocked(
  ws: Partial<Record<WorkshopBotSpecialKey, boolean>> &
    Partial<Record<WorkshopBotSpecialLevelKey, number>>,
  botId: WorkshopBotId,
): boolean {
  return workshopBotSpecialStonePurchased(ws, botId)
}

/** All five base bots bought in the event shop (required before any Bot+ unlock). */
export function workshopAllBotsOwnedForPlus(
  ws: Partial<Record<WorkshopBotOwnedKey, boolean>> &
    Partial<Record<WorkshopBotUpgradeKey, number>>,
): boolean {
  return WORKSHOP_BOT_ORDER.every((id) => workshopBotIsOwned(ws, id))
}

export function workshopBotSpecialUnlockStones(): number {
  return WORKSHOP_BOT_SPECIAL_UNLOCK_STONES
}

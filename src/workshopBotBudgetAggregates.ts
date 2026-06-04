import {
  WORKSHOP_BOT_ORDER,
  WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT,
  WORKSHOP_BOT_UPGRADE_ORDER,
  WORKSHOP_BOT_WEAPON_STATS,
  workshopAllBotsOwnedForPlus,
  workshopBotIsActive,
  workshopBotIsOwned,
  workshopBotMaxLevel,
  workshopBotNextMarginalMedals,
  workshopBotNextUnlockCost,
  workshopBotSpecialLevelKey,
  workshopBotSpecialMaxLevel,
  workshopBotSpecialNextMarginalMedals,
  workshopBotSpecialStonePurchased,
  workshopBotUnlockSpentMedals,
  workshopBotUnlockToMaxMedals,
} from './data/workshopBots'
import { formatCoinAbbrev } from './labCosts'
import type { WorkshopPersistedV1 } from './labPresetsStorage'

export type WorkshopBotMedalAggregates = {
  spentAll: number
  toMaxAll: number
  nextUpgradeVisibleSum: number
}

function sumMarginalSteps(
  nextAt: (completed: number) => number | undefined,
  fromLevel: number,
  toExclusive: number,
): number {
  let s = 0
  for (let L = fromLevel; L < toExclusive; L += 1) {
    const c = nextAt(L)
    if (c != null) s += c
  }
  return s
}

function statSpent(level: number, nextAt: (l: number) => number | undefined): number {
  return sumMarginalSteps(nextAt, 0, Math.max(0, level))
}

function statToMax(
  level: number,
  max: number,
  nextAt: (l: number) => number | undefined,
): number {
  const L = Math.min(Math.max(0, level), max)
  return sumMarginalSteps(nextAt, L, max)
}

function maybeAddNext(
  sum: { n: number },
  visible: boolean,
  level: number,
  max: number,
  nextAt: (l: number) => number | undefined,
): void {
  if (!visible || level >= max) return
  const c = nextAt(level)
  if (c != null) sum.n += c
}

function addBotMedalTotals(
  ws: WorkshopPersistedV1,
  sink: { spent: number; toMax: number },
): void {
  sink.spent += workshopBotUnlockSpentMedals(ws)
  sink.toMax += workshopBotUnlockToMaxMedals(ws)

  for (const key of WORKSHOP_BOT_UPGRADE_ORDER) {
    const max = workshopBotMaxLevel(key)
    const level = ws[key] ?? 0
    const next = (L: number) => workshopBotNextMarginalMedals(key, L)
    sink.spent += statSpent(level, next)
    sink.toMax += statToMax(level, max, next)
  }

  for (const botId of WORKSHOP_BOT_ORDER) {
    if (!workshopBotSpecialStonePurchased(ws, botId)) continue
    const levelKey = WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT[botId]
    const level = ws[levelKey] ?? 0
    const max = workshopBotSpecialMaxLevel(botId)
    const next = (L: number) => workshopBotSpecialNextMarginalMedals(botId, L)
    sink.spent += statSpent(level, next)
    sink.toMax += statToMax(level, max, next)
  }
}

/**
 * Medal totals for bot event-shop unlocks and medal upgrade tracks (basic stats + Bot+ levels).
 * Bot+ stone unlocks (1,250 power stones) are excluded.
 */
export function computeWorkshopBotMedalAggregates(
  ws: WorkshopPersistedV1,
): WorkshopBotMedalAggregates {
  const sink = { spent: 0, toMax: 0 }
  addBotMedalTotals(ws, sink)

  const sum = { n: 0 }
  const unlockNext = workshopBotNextUnlockCost(ws)
  if (unlockNext != null) sum.n += unlockNext

  const plusReady = workshopAllBotsOwnedForPlus(ws)

  for (const botId of WORKSHOP_BOT_ORDER) {
    if (!workshopBotIsOwned(ws, botId)) continue
    if (!workshopBotIsActive(ws, botId)) continue

    for (const { key } of WORKSHOP_BOT_WEAPON_STATS[botId]) {
      const level = ws[key] ?? 0
      const max = workshopBotMaxLevel(key)
      maybeAddNext(sum, true, level, max, (L) => workshopBotNextMarginalMedals(key, L))
    }

    if (plusReady && workshopBotSpecialStonePurchased(ws, botId)) {
      const levelKey = workshopBotSpecialLevelKey(botId)
      const level = ws[levelKey] ?? 0
      const max = workshopBotSpecialMaxLevel(botId)
      maybeAddNext(sum, true, level, max, (L) =>
        workshopBotSpecialNextMarginalMedals(botId, L),
      )
    }
  }

  return {
    spentAll: sink.spent,
    toMaxAll: sink.toMax,
    nextUpgradeVisibleSum: sum.n,
  }
}

export function formatWorkshopBotMedalAggregates(a: WorkshopBotMedalAggregates): {
  spentLabel: string
  toMaxLabel: string
  nextVisibleLabel: string
} {
  return {
    spentLabel: formatCoinAbbrev(a.spentAll),
    toMaxLabel: formatCoinAbbrev(a.toMaxAll),
    nextVisibleLabel: formatCoinAbbrev(a.nextUpgradeVisibleSum),
  }
}

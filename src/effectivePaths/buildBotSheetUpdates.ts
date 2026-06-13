import {
  workshopBotClampLevel,
  workshopBotSpecialClampLevel,
} from '../data/workshopBots'
import {
  WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT,
  WORKSHOP_BOT_SPECIAL_LEVEL_ORDER,
  WORKSHOP_BOT_SPECIAL_TRACKS,
  WORKSHOP_BOT_TRACKS,
  type WorkshopBotId,
  type WorkshopBotSpecialLevelKey,
  type WorkshopBotUpgradeKey,
} from '../data/workshopBotsData'
import { workshopUltimateTrackMaxLevel, type WorkshopUltimateTrack } from '../data/workshopUltimateTable'
import { quoteSheetTitleForRange } from './buildRelicUnlockedUpdates'

/** Power stones glyph on Bots v3.1 column G dropdown labels. */
export const BOT_EP_STONES_SYMBOL = '⧓'
import type { BotsEpSyncState } from './botsEpStateFromPersisted'
import {
  BOT_EP_V31_FARMING_LEVEL_START_ROWS,
  BOT_EP_V31_LEVEL_KEY_ORDER,
  botEpBotStatusRowIndex,
  botLabNameFromSheetName,
} from './botSheetNames'
import { WORKSHOP_BOT_ORDER } from '../data/workshopBotsData'
import type {
  BotSheetLayout,
  EffectivePathsBotHeaderRow,
  EffectivePathsBotLabRow,
  EffectivePathsBotStatRow,
} from './botSheetLayout'
import { columnIndexToA1Letter } from './botSheetLayout'

export type BotSheetBatchUpdate = {
  range: string
  values: (string | number | boolean)[][]
}

export type BotFarmingLevelCellUpdate = {
  /** 1-based Google Sheet row (column G). */
  rowIndex: number
  /** Full dropdown label (e.g. `06 | 23.0s | Cost 300 ⧓ | Next 340 ⧓`). */
  label: string
}

function botIdForSpecialLevelKey(key: WorkshopBotSpecialLevelKey): WorkshopBotId {
  for (const botId of Object.keys(WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT) as WorkshopBotId[]) {
    if (WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT[botId] === key) return botId
  }
  return 'flame'
}

function isSpecialLevelKey(levelKey: string): levelKey is WorkshopBotSpecialLevelKey {
  return (WORKSHOP_BOT_SPECIAL_LEVEL_ORDER as readonly string[]).includes(levelKey)
}

/** EP v3.1 dropdown max (may be below in-game max for some tracks). */
function botEpFarmingMaxLevel(levelKey: string, track: WorkshopUltimateTrack): number {
  if (levelKey === 'botBotBonusLevel') return 19
  return workshopUltimateTrackMaxLevel(track)
}

/** Clamp medal / Bot+ level to the EP farming dropdown max for that track. */
export function botEpClampFarmingLevel(levelKey: string, rawLevel: number): number {
  if (!Number.isFinite(rawLevel)) return 0
  const track = botEpTrackForLevelKey(levelKey)
  let level: number
  if (isSpecialLevelKey(levelKey)) {
    const botId = botIdForSpecialLevelKey(levelKey)
    level = Math.max(0, workshopBotSpecialClampLevel(botId, rawLevel))
  } else {
    level = workshopBotClampLevel(levelKey as WorkshopBotUpgradeKey, rawLevel)
  }
  return Math.min(level, botEpFarmingMaxLevel(levelKey, track))
}

/** Numeric farming level (clamped). */
export function botEpFarmingLevelSheetValue(levelKey: string, rawLevel: number): number {
  return botEpClampFarmingLevel(levelKey, rawLevel)
}

function botEpTrackForLevelKey(levelKey: string): WorkshopUltimateTrack {
  if (isSpecialLevelKey(levelKey)) {
    return WORKSHOP_BOT_SPECIAL_TRACKS[levelKey]
  }
  return WORKSHOP_BOT_TRACKS[levelKey as WorkshopBotUpgradeKey]
}

function botEpSecondsDropdownLabel(track: WorkshopUltimateTrack, value: number): string {
  // Duration tracks use half-seconds (20.0s); cooldown tracks use whole seconds (108s).
  const useTenths = track.milestones.some((m) => m.value % 1 !== 0)
  return useTenths ? `${value.toFixed(1)}s` : `${value}s`
}

/** 0 = integer mult (x50); 1 = one decimal (x4.0); 2 = hundredths (x1.55). */
function botEpMultDecimalPlaces(track: WorkshopUltimateTrack): number {
  let minDelta = Infinity
  for (let i = 1; i < track.milestones.length; i++) {
    const delta = Math.abs(track.milestones[i]!.value - track.milestones[i - 1]!.value)
    if (delta > 0 && delta < minDelta) minDelta = delta
  }
  if (minDelta <= 0.05 + 1e-6) return 2
  if (minDelta <= 0.2 + 1e-6) return 1
  return 0
}

function botEpMultStatValue(
  _levelKey: string,
  track: WorkshopUltimateTrack,
  level: number,
): number {
  return track.milestones[level]!.value
}

function botEpDropdownStatLabel(
  levelKey: string,
  track: WorkshopUltimateTrack,
  level: number,
): string {
  const value = botEpMultStatValue(levelKey, track, level)
  switch (track.valueKind) {
    case 'seconds':
      return botEpSecondsDropdownLabel(track, value)
    case 'meters':
      return `${value}m`
    case 'mult': {
      const places = botEpMultDecimalPlaces(track)
      return places === 0 ? `x${value}` : `x${value.toFixed(places)}`
    }
    case 'percent':
      return value % 1 === 0 ? `${value}%` : `${value.toFixed(2)}%`
    case 'count':
      return String(Math.round(value))
    default:
      return String(value)
  }
}

/**
 * Exact Bots v3.1 column G dropdown spelling (matches validation list).
 * Example: `06 | 32m | Cost 300 ⧓ | Next 340 ⧓` for Golden Bot Range level 6.
 */
export function botEpFarmingLevelDropdownLabel(levelKey: string, rawLevel: number): string {
  const track = botEpTrackForLevelKey(levelKey)
  const level = botEpClampFarmingLevel(levelKey, rawLevel)
  const maxLevel = botEpFarmingMaxLevel(levelKey, track)
  const levelLabel = String(level).padStart(2, '0')
  const stat = botEpDropdownStatLabel(levelKey, track, level)
  const cost = track.milestones[level]!.marginalStones
  const stones = BOT_EP_STONES_SYMBOL
  const tail =
    level >= maxLevel
      ? 'Maxed'
      : `Next ${track.milestones[level + 1]!.marginalStones} ${stones}`
  return `${levelLabel} | ${stat} | Cost ${cost} ${stones} | ${tail}`
}

/** Column G farming levels — full dropdown labels via updateCells (not bare numbers). */
export function buildBotFarmingLevelCellUpdates(
  statRows: readonly EffectivePathsBotStatRow[],
  state: BotsEpSyncState,
): BotFarmingLevelCellUpdate[] {
  if (statRows.length === 0) return []

  const out: BotFarmingLevelCellUpdate[] = []
  for (const botId of WORKSHOP_BOT_ORDER) {
    const startRow = BOT_EP_V31_FARMING_LEVEL_START_ROWS[botId]
    const levelKeys = BOT_EP_V31_LEVEL_KEY_ORDER[botId]
    levelKeys.forEach((levelKey, index) => {
      out.push({
        rowIndex: startRow + index,
        label: botEpFarmingLevelDropdownLabel(levelKey, state.levels[levelKey] ?? 0),
      })
    })
  }

  return out
}

/**
 * Build per-row updates for Bots v3.x Master Sheet:
 * C6/11/16/21/26 = unlocked; H = Sync; X = lab level. (G uses buildBotFarmingLevelCellUpdates.)
 */
export function buildBotSheetUpdates(
  sheetTitle: string,
  statRows: readonly EffectivePathsBotStatRow[],
  _headerRows: readonly EffectivePathsBotHeaderRow[],
  labRows: readonly EffectivePathsBotLabRow[],
  state: BotsEpSyncState,
  layout: BotSheetLayout,
): BotSheetBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const botNameCol = columnIndexToA1Letter(layout.botNameCol)
  const farmingSyncCol = columnIndexToA1Letter(layout.farmingSyncCol)
  const labLevelCol = columnIndexToA1Letter(layout.labLevelCol)
  const out: BotSheetBatchUpdate[] = []

  for (const botId of WORKSHOP_BOT_ORDER) {
    const statusRow = botEpBotStatusRowIndex(botId)
    const owned = state.ownedByBotId[botId] === true
    out.push({
      range: `${quoted}!${botNameCol}${statusRow}`,
      values: [[owned ? 'TRUE' : 'FALSE']],
    })
  }

  if (statRows.length > 0) {
    for (const botId of WORKSHOP_BOT_ORDER) {
      out.push({
        range: `${quoted}!${farmingSyncCol}${botEpBotStatusRowIndex(botId)}`,
        values: [[state.ownedByBotId[botId] ? 'TRUE' : 'FALSE']],
      })
    }
  }

  for (const row of labRows) {
    const labName = botLabNameFromSheetName(row.name)
    if (!labName) continue
    const level = Math.max(0, Math.round(state.labLevels[labName] ?? 0))
    out.push({
      range: `${quoted}!${labLevelCol}${row.rowIndex}`,
      values: [[level]],
    })
  }

  return out
}

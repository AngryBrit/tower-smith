import {
  WORKSHOP_ULTIMATE_PLUS_TRACKS,
  ULTIMATE_PLUS_LEVEL_LOCKED,
  workshopUltimatePlusClampLevel,
} from '../data/workshopUltimatePlus'
import {
  WORKSHOP_ULTIMATE_TRACKS,
  workshopUltimateClampLevel,
  type WorkshopUltimateUpgradeKey,
} from '../data/workshopUltimate'
import {
  workshopUltimateTrackMaxLevel,
  workshopUltimateTrackStatValue,
  type WorkshopUltimateTrack,
} from '../data/workshopUltimateTable'
import { quoteSheetTitleForRange } from './buildRelicUnlockedUpdates'
import type { UwsEpSyncState } from './uwsEpStateFromPersisted'
import {
  UW_EP_V31_LEVEL_KEY_ORDER,
  UW_EP_V31_LEVEL_START_ROWS,
  UW_EP_V31_UNLOCKED_ROWS,
  isUwEpPlusLevelKey,
  uwEpPlusAbilityForLevelKey,
  type UwEpLevelKey,
} from './uwEpSheetNames'
import { UW_EP_PLUS_MILESTONES } from './uwEpPlusTracks.generated'
import { WORKSHOP_ULTIMATE_WEAPON_ORDER } from '../data/workshopUltimateData'

/** Power stones glyph on UWs v3.1.2 column G dropdown labels. */
export const UW_EP_STONES_SYMBOL = '⧌'

export type UwSheetBatchUpdate = {
  range: string
  values: (string | number | boolean)[][]
}

export type UwFarmingLevelCellUpdate = {
  /** 1-based Google Sheet row (column G). */
  rowIndex: number
  label: string
}

function uwEpTrackForLevelKey(levelKey: UwEpLevelKey): WorkshopUltimateTrack {
  if (isUwEpPlusLevelKey(levelKey)) {
    const abilityId = uwEpPlusAbilityForLevelKey(levelKey)
    return WORKSHOP_ULTIMATE_PLUS_TRACKS[abilityId]
  }
  return WORKSHOP_ULTIMATE_TRACKS[levelKey as WorkshopUltimateUpgradeKey]
}

function uwEpSecondsDropdownLabel(track: WorkshopUltimateTrack, value: number): string {
  const useTenths = track.milestones.some((m) => m.value % 1 !== 0)
  return useTenths ? `${value.toFixed(1)}s` : `${value}s`
}

function uwEpMultDecimalPlaces(track: WorkshopUltimateTrack): number {
  let minDelta = Infinity
  for (let i = 1; i < track.milestones.length; i++) {
    const delta = Math.abs(track.milestones[i]!.value - track.milestones[i - 1]!.value)
    if (delta > 0 && delta < minDelta) minDelta = delta
  }
  if (minDelta <= 0.05 + 1e-6) return 2
  if (minDelta <= 0.2 + 1e-6) return 1
  return 0
}

function uwEpPercentOneDecimal(value: number): string {
  return `${value.toFixed(1)}%`
}

function uwEpPercentWhole(value: number): string {
  return `${Math.round(value)}%`
}

function uwEpMultOneDecimal(value: number): string {
  return `x${value.toFixed(1)}`
}

/** EP Master Sheet stat column spelling (differs from in-app labels for several Plus rows). */
function uwEpDropdownStatLabel(
  levelKey: UwEpLevelKey,
  track: WorkshopUltimateTrack,
  level: number,
): string {
  const value = workshopUltimateTrackStatValue(track, level)
  switch (levelKey) {
    case 'ultimatePlusChainLightningSmiteLevel':
    case 'ultimatePlusBlackHoleConsumeLevel':
      return `${(value / 100).toFixed(2)}%`
    case 'ultimatePlusGoldenTowerGoldenComboLevel':
      return `${value.toFixed(2)}%`
    case 'ultimatePlusChronoFieldChronoLoopLevel':
    case 'ultimatePlusSpotlightLightRangeLevel':
      return uwEpPercentWhole(value * 100)
    case 'ultimatePlusDeathWaveKillWallLevel':
      return value % 1 === 0 ? `x${value}` : `x${value.toFixed(1)}`
    case 'ultimatePlusInnerLandMinesChargedMinesLevel':
      return `${value.toFixed(2)}/s`
    case 'ultimatePlusPoisonSwampDeathCreepLevel':
      return uwEpPercentWhole(value)
    case 'goldenTowerBonusLevel':
    case 'spotlightBonusLevel':
      return uwEpMultOneDecimal(value)
    case 'chronoFieldSlowLevel':
      return uwEpPercentWhole(value)
    default:
      break
  }

  switch (track.valueKind) {
    case 'seconds':
      return uwEpSecondsDropdownLabel(track, value)
    case 'meters':
      return `${value}m`
    case 'mult': {
      const places = uwEpMultDecimalPlaces(track)
      return places === 0 ? `x${value}` : `x${value.toFixed(places)}`
    }
    case 'percent':
      return uwEpPercentOneDecimal(value)
    case 'count':
      return `#${Math.round(value)}`
    case 'angle':
      return `${Math.round(value)}°`
    default:
      return String(value)
  }
}

function uwEpClampDisplayLevel(levelKey: UwEpLevelKey, rawLevel: number): {
  level: number
  locked: boolean
} {
  if (isUwEpPlusLevelKey(levelKey)) {
    const epMax = UW_EP_PLUS_MILESTONES[levelKey]?.at(-1)?.level ?? 0
    if (rawLevel < 0) return { level: 0, locked: true }
    const abilityId = uwEpPlusAbilityForLevelKey(levelKey)
    const inGame = workshopUltimatePlusClampLevel(abilityId, rawLevel)
    return {
      level: Math.min(inGame < 0 ? 0 : inGame, epMax),
      locked: false,
    }
  }
  return {
    level: workshopUltimateClampLevel(levelKey as WorkshopUltimateUpgradeKey, rawLevel),
    locked: false,
  }
}

function uwEpPlusDropdownLabel(levelKey: UwEpLevelKey, rawLevel: number): string {
  const milestones = UW_EP_PLUS_MILESTONES[levelKey]
  if (!milestones?.length) {
    return uwEpBasicDropdownLabel(levelKey, rawLevel, false)
  }
  const locked = rawLevel < 0
  const maxLevel = milestones[milestones.length - 1]!.level
  const level = locked
    ? 0
    : Math.max(0, Math.min(maxLevel, Math.trunc(rawLevel)))
  const row = milestones.find((m) => m.level === level) ?? milestones[0]!
  const next = milestones.find((m) => m.level === level + 1)
  const levelLabel = String(level).padStart(2, '0')
  const stones = UW_EP_STONES_SYMBOL
  const tail = next ? `Next ${next.marginalStones} ${stones}` : 'Maxed'
  const body = `${levelLabel} | ${row.stat} | Cost ${row.marginalStones} ${stones} | ${tail}`
  return locked ? `Lo | Locked ${body}` : body
}

function uwEpBasicDropdownLabel(
  levelKey: UwEpLevelKey,
  rawLevel: number,
  locked: boolean,
): string {
  const track = uwEpTrackForLevelKey(levelKey)
  const level = workshopUltimateClampLevel(levelKey as WorkshopUltimateUpgradeKey, rawLevel)
  const maxLevel = workshopUltimateTrackMaxLevel(track)
  const levelLabel = String(level).padStart(2, '0')
  const stat = uwEpDropdownStatLabel(levelKey, track, level)
  const cost = track.milestones[level]!.marginalStones
  const stones = UW_EP_STONES_SYMBOL
  const tail =
    level >= maxLevel
      ? 'Maxed'
      : `Next ${track.milestones[level + 1]!.marginalStones} ${stones}`
  const body = `${levelLabel} | ${stat} | Cost ${cost} ${stones} | ${tail}`
  return locked ? `Lo | Locked ${body}` : body
}

/**
 * Exact UWs v3.1.2 column G dropdown spelling (matches validation list).
 * Plus rows prefix `Lo | Locked ` when the ability is not unlocked (level -1).
 */
export function uwEpFarmingLevelDropdownLabel(levelKey: UwEpLevelKey, rawLevel: number): string {
  if (isUwEpPlusLevelKey(levelKey)) {
    return uwEpPlusDropdownLabel(levelKey, rawLevel)
  }
  const { locked } = uwEpClampDisplayLevel(levelKey, rawLevel)
  return uwEpBasicDropdownLabel(levelKey, rawLevel, locked)
}

/** Column G farming levels — full dropdown labels via updateCells. */
export function buildUwFarmingLevelCellUpdates(state: UwsEpSyncState): UwFarmingLevelCellUpdate[] {
  const out: UwFarmingLevelCellUpdate[] = []
  for (const weaponId of WORKSHOP_ULTIMATE_WEAPON_ORDER) {
    const startRow = UW_EP_V31_LEVEL_START_ROWS[weaponId]
    const keys = UW_EP_V31_LEVEL_KEY_ORDER[weaponId]
    keys.forEach((levelKey, index) => {
      const raw = state.levels[levelKey] ?? (isUwEpPlusLevelKey(levelKey) ? ULTIMATE_PLUS_LEVEL_LOCKED : 0)
      out.push({
        rowIndex: startRow + index,
        label: uwEpFarmingLevelDropdownLabel(levelKey, raw),
      })
    })
  }
  return out
}

/** Column D UW unlocked checkboxes. */
export function buildUwSheetUpdates(
  sheetTitle: string,
  state: UwsEpSyncState,
): UwSheetBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const out: UwSheetBatchUpdate[] = []
  for (const weaponId of WORKSHOP_ULTIMATE_WEAPON_ORDER) {
    const row = UW_EP_V31_UNLOCKED_ROWS[weaponId]
    out.push({
      range: `${quoted}!D${row}`,
      values: [[state.ownedByWeaponId[weaponId] ?? false]],
    })
  }
  return out
}

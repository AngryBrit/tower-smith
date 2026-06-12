import {
  guardianChipAllyTrack,
  guardianChipAllyTrackLevel,
  guardianChipAllyValueAtLevel,
  guardianChipAttackTrack,
  guardianChipAttackTrackLevel,
  guardianChipAttackValueAtLevel,
  guardianChipBountyTrack,
  guardianChipBountyTrackLevel,
  guardianChipBountyValueAtLevel,
  guardianChipFetchTrack,
  guardianChipFetchTrackLevel,
  guardianChipFetchValueAtLevel,
  guardianChipScoutTrack,
  guardianChipScoutTrackLevel,
  guardianChipScoutValueAtLevel,
  guardianChipSummonTrack,
  guardianChipSummonTrackLevel,
  guardianChipSummonValueAtLevel,
  type GuardianChipAllyTrackId,
  type GuardianChipAttackTrackId,
  type GuardianChipBountyTrackId,
  type GuardianChipFetchTrackId,
  type GuardianChipScoutTrackId,
  type GuardianChipSummonTrackId,
} from '../data/guardianChipGodTables'
import type { GuardianChipId } from '../data/guardianChips'
import { quoteSheetTitleForRange } from './buildRelicUnlockedUpdates'
import { cellValueToString } from './epSheetCellParsing'
import { columnIndexToA1Letter } from './relicSheetLayout'
import type { GuardiansEpSyncState } from './guardiansEpStateFromPersisted'
import {
  GUARDIAN_EP_BITS_SYMBOL,
  GUARDIAN_EP_CHIP_START_ROWS,
  GUARDIAN_EP_CHIP_TRACK_ORDER,
  GUARDIAN_EP_V302_UNLOCKED_CHIP_IDS,
  GUARDIAN_EP_V302_UNLOCKED_ROWS,
  GUARDIAN_EP_V302_UNLOCK_COL,
} from './guardianEpSheetNames'

export type GuardianSheetBatchUpdate = {
  range: string
  values: (string | number | boolean)[][]
}

export type GuardianLevelCellUpdate = {
  rowIndex: number
  label: string
}

function gameLevelToEpLevel(gameLevel: number): number {
  return Math.max(0, Math.round(gameLevel) - 1)
}

function guardianEpStatLabel(chipId: GuardianChipId, trackId: string, gameLevel: number): string {
  switch (chipId) {
    case 'attack': {
      const track = trackId as GuardianChipAttackTrackId
      const value = guardianChipAttackValueAtLevel(track, gameLevel)
      if (value == null) return '—'
      if (track === 'percent') return `${value}%`
      if (track === 'cooldown') return `${value}s`
      return String(value)
    }
    case 'ally': {
      const track = trackId as GuardianChipAllyTrackId
      const value = guardianChipAllyValueAtLevel(track, gameLevel)
      if (value == null) return '—'
      if (track === 'recovery') return `${value}%`
      if (track === 'maxRecovery') return `${(value / 10).toFixed(1)}x`
      return `${value}s`
    }
    case 'bounty': {
      const track = trackId as GuardianChipBountyTrackId
      const value = guardianChipBountyValueAtLevel(track, gameLevel)
      if (value == null) return '—'
      if (track === 'multiplier') return `${(value / 100).toFixed(2)}x`
      if (track === 'cooldown') return `${value}s`
      return String(value)
    }
    case 'fetch': {
      const track = trackId as GuardianChipFetchTrackId
      const value = guardianChipFetchValueAtLevel(track, gameLevel)
      if (value == null) return '—'
      if (track === 'cooldown') return `${value.toFixed(1)}s`
      return `${value}%`
    }
    case 'summon': {
      const track = trackId as GuardianChipSummonTrackId
      const value = guardianChipSummonValueAtLevel(track, gameLevel)
      if (value == null) return '—'
      if (track === 'cooldown') return `${value}s`
      if (track === 'duration') return `${value}s|`
      return `${(value / 10).toFixed(1)}x`
    }
    case 'scout': {
      const track = trackId as GuardianChipScoutTrackId
      const value = guardianChipScoutValueAtLevel(track, gameLevel)
      if (value == null) return '—'
      if (track === 'cooldown' || track === 'duration') return `${value}s`
      return `${(value / 10).toFixed(1)}x`
    }
    default:
      return '—'
  }
}

function guardianEpTrackMaxLevel(chipId: GuardianChipId, trackId: string): number {
  switch (chipId) {
    case 'attack':
      return guardianChipAttackTrack(trackId as GuardianChipAttackTrackId).maxLevel
    case 'ally':
      return guardianChipAllyTrack(trackId as GuardianChipAllyTrackId).maxLevel
    case 'bounty':
      return guardianChipBountyTrack(trackId as GuardianChipBountyTrackId).maxLevel
    case 'fetch':
      return guardianChipFetchTrack(trackId as GuardianChipFetchTrackId).maxLevel
    case 'summon':
      return guardianChipSummonTrack(trackId as GuardianChipSummonTrackId).maxLevel
    case 'scout':
      return guardianChipScoutTrack(trackId as GuardianChipScoutTrackId).maxLevel
    default:
      return 1
  }
}

function guardianEpTotalCostAtLevel(
  chipId: GuardianChipId,
  trackId: string,
  gameLevel: number,
): number {
  switch (chipId) {
    case 'attack':
      return guardianChipAttackTrackLevel(trackId as GuardianChipAttackTrackId, gameLevel)?.totalCost ?? 0
    case 'ally':
      return guardianChipAllyTrackLevel(trackId as GuardianChipAllyTrackId, gameLevel)?.totalCost ?? 0
    case 'bounty':
      return guardianChipBountyTrackLevel(trackId as GuardianChipBountyTrackId, gameLevel)?.totalCost ?? 0
    case 'fetch':
      return guardianChipFetchTrackLevel(trackId as GuardianChipFetchTrackId, gameLevel)?.totalCost ?? 0
    case 'summon':
      return guardianChipSummonTrackLevel(trackId as GuardianChipSummonTrackId, gameLevel)?.totalCost ?? 0
    case 'scout':
      return guardianChipScoutTrackLevel(trackId as GuardianChipScoutTrackId, gameLevel)?.totalCost ?? 0
    default:
      return 0
  }
}

/** Exact Guardians v3.0.2 column F dropdown spelling. */
export function guardianEpLevelDropdownLabel(
  chipId: GuardianChipId,
  trackId: string,
  gameLevel: number,
): string {
  const level = Math.max(1, Math.round(gameLevel))
  const maxLevel = guardianEpTrackMaxLevel(chipId, trackId)
  const epLevel = gameLevelToEpLevel(level)
  const levelLabel = String(epLevel).padStart(2, '0')
  const stat = guardianEpStatLabel(chipId, trackId, level)
  const cost = guardianEpTotalCostAtLevel(chipId, trackId, level)
  const bits = GUARDIAN_EP_BITS_SYMBOL
  const nextTotal =
    level < maxLevel ? guardianEpTotalCostAtLevel(chipId, trackId, level + 1) : undefined
  const tail = nextTotal == null ? 'Maxed' : `Next ${nextTotal} ${bits}`
  const costSegment =
    chipId === 'summon' && trackId === 'duration'
      ? `${stat} Cost ${cost} ${bits}`
      : `${stat} | Cost ${cost} ${bits}`
  return `${levelLabel} | ${costSegment} | ${tail}`
}

/** Column F level dropdowns — 18 rows (six chips × three tracks). */
export function buildGuardianLevelCellUpdates(state: GuardiansEpSyncState): GuardianLevelCellUpdate[] {
  const out: GuardianLevelCellUpdate[] = []
  for (const chipId of Object.keys(GUARDIAN_EP_CHIP_START_ROWS) as GuardianChipId[]) {
    const tracks = GUARDIAN_EP_CHIP_TRACK_ORDER[chipId]
    const startRow = GUARDIAN_EP_CHIP_START_ROWS[chipId]
    tracks.forEach((trackId, index) => {
      const gameLevel = (state.upgrades[chipId] as Record<string, number>)[trackId] ?? 1
      out.push({
        rowIndex: startRow + index,
        label: guardianEpLevelDropdownLabel(chipId, trackId, gameLevel),
      })
    })
  }
  return out
}

/** Column B unlock checkboxes (B10, B13, B16, B19) as TRUE/FALSE. */
export function buildGuardianSheetUpdates(
  sheetTitle: string,
  state: GuardiansEpSyncState,
): GuardianSheetBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const unlockCol = columnIndexToA1Letter(GUARDIAN_EP_V302_UNLOCK_COL)
  const out: GuardianSheetBatchUpdate[] = []
  for (const chipId of GUARDIAN_EP_V302_UNLOCKED_CHIP_IDS) {
    const row = GUARDIAN_EP_V302_UNLOCKED_ROWS[chipId]
    const unlocked = state.unlockedChipIds.includes(chipId)
    out.push({
      range: `${quoted}!${unlockCol}${row}`,
      values: [[cellValueToString(unlocked)]],
    })
  }
  return out
}

import {
  clampGuardianChipAllyLevel,
  clampGuardianChipAttackLevel,
  clampGuardianChipBountyLevel,
  clampGuardianChipFetchLevel,
  clampGuardianChipScoutLevel,
  clampGuardianChipSummonLevel,
  type GuardianChipAllyTrackId,
  type GuardianChipAttackTrackId,
  type GuardianChipBountyTrackId,
  type GuardianChipFetchTrackId,
  type GuardianChipScoutTrackId,
  type GuardianChipSummonTrackId,
} from '../data/guardianChipGodTables'
import { GUARDIAN_CHIP_IDS, type GuardianChipId } from '../data/guardianChips'
import {
  DEFAULT_GUARDIAN_ALLY_UPGRADES,
  DEFAULT_GUARDIAN_ATTACK_UPGRADES,
  DEFAULT_GUARDIAN_BOUNTY_UPGRADES,
  DEFAULT_GUARDIAN_FETCH_UPGRADES,
  DEFAULT_GUARDIAN_SCOUT_UPGRADES,
  DEFAULT_GUARDIAN_SUMMON_UPGRADES,
} from '../guardianChipStorage'
import { farmingDropdownLevelFromLabel } from './epSheetCellParsing'
import type { GuardiansEpSyncState } from './guardiansEpStateFromPersisted'
import {
  GUARDIAN_EP_CHIP_START_ROWS,
  GUARDIAN_EP_CHIP_TRACK_ORDER,
  GUARDIAN_EP_V302_LEVEL_COL,
  GUARDIAN_EP_V302_UNLOCK_COL,
  guardianEpUnlockRowIndex,
} from './guardianEpSheetNames'

function chipUnlockedFromGridRow(
  grid: readonly (readonly unknown[])[],
  chipId: GuardianChipId,
): boolean {
  const row0 = guardianEpUnlockRowIndex(chipId) - 1
  const label = String(grid[row0]?.[GUARDIAN_EP_V302_UNLOCK_COL] ?? '').trim()
  return /^unlocked$/i.test(label)
}

function epLevelToGameLevel(epLevel: number): number {
  return Math.max(1, epLevel + 1)
}

function parseChipTrackLevel(
  grid: readonly (readonly unknown[])[],
  chipId: GuardianChipId,
  trackId: string,
  trackIndex: number,
): number {
  const row0 = GUARDIAN_EP_CHIP_START_ROWS[chipId] - 1 + trackIndex
  const label = String(grid[row0]?.[GUARDIAN_EP_V302_LEVEL_COL] ?? '')
  const epLevel = farmingDropdownLevelFromLabel(label)
  if (epLevel == null) return 1
  const gameLevel = epLevelToGameLevel(epLevel)

  switch (chipId) {
    case 'attack':
      return clampGuardianChipAttackLevel(trackId as GuardianChipAttackTrackId, gameLevel)
    case 'ally':
      return clampGuardianChipAllyLevel(trackId as GuardianChipAllyTrackId, gameLevel)
    case 'bounty':
      return clampGuardianChipBountyLevel(trackId as GuardianChipBountyTrackId, gameLevel)
    case 'fetch':
      return clampGuardianChipFetchLevel(trackId as GuardianChipFetchTrackId, gameLevel)
    case 'summon':
      return clampGuardianChipSummonLevel(trackId as GuardianChipSummonTrackId, gameLevel)
    case 'scout':
      return clampGuardianChipScoutLevel(trackId as GuardianChipScoutTrackId, gameLevel)
    default:
      return 1
  }
}

/** Read Guardians workbook sync state from Master Sheet grid. */
export function guardiansEpStateFromSheetGrid(
  grid: readonly (readonly unknown[])[],
): GuardiansEpSyncState {
  const upgrades: GuardiansEpSyncState['upgrades'] = {
    attack: { ...DEFAULT_GUARDIAN_ATTACK_UPGRADES },
    ally: { ...DEFAULT_GUARDIAN_ALLY_UPGRADES },
    bounty: { ...DEFAULT_GUARDIAN_BOUNTY_UPGRADES },
    fetch: { ...DEFAULT_GUARDIAN_FETCH_UPGRADES },
    summon: { ...DEFAULT_GUARDIAN_SUMMON_UPGRADES },
    scout: { ...DEFAULT_GUARDIAN_SCOUT_UPGRADES },
  }
  const unlockedChipIds: GuardianChipId[] = []

  for (const chipId of GUARDIAN_CHIP_IDS) {
    if (chipUnlockedFromGridRow(grid, chipId)) {
      unlockedChipIds.push(chipId)
    }
    const tracks = GUARDIAN_EP_CHIP_TRACK_ORDER[chipId]
    tracks.forEach((trackId, trackIndex) => {
      const level = parseChipTrackLevel(grid, chipId, trackId, trackIndex)
      ;(upgrades[chipId] as Record<string, number>)[trackId] = level
    })
  }

  return { upgrades, unlockedChipIds }
}

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
import {
  GUARDIAN_CHIP_IDS,
  GUARDIAN_CHIP_SLOT_COUNT,
  type GuardianChipId,
} from '../data/guardianChips'
import {
  DEFAULT_GUARDIAN_UNLOCKED_SLOTS,
  type GuardianChipState,
  type GuardianChipUpgrades,
} from '../guardianChipStorage'
import type { DecodedPlayerSave } from './decodePlayerInfo'

/** Upgrade tracks per chip in `guardianChipLevel[]` (3 values per `ChipType` index). */
export const GAME_GUARDIAN_CHIP_UPGRADES_PER_CHIP = 3 as const

/**
 * Game `ChipType` / `guardianChip*` array index per TowerSmith chip id.
 * `ChipType` index 0 is Bounty; indices 1, 3, and 4 are reserved in saves.
 */
export const GAME_GUARDIAN_CHIP_INDEX: Readonly<Record<GuardianChipId, number>> = {
  bounty: 0,
  attack: 2,
  ally: 5,
  fetch: 6,
  summon: 7,
  scout: 8,
}

const GAME_CHIP_TYPE_TO_ID: Readonly<Partial<Record<number, GuardianChipId>>> = Object.fromEntries(
  (Object.entries(GAME_GUARDIAN_CHIP_INDEX) as [GuardianChipId, number][]).map(
    ([chipId, gameIndex]) => [gameIndex, chipId],
  ),
)

const ATTACK_TRACK_ORDER: readonly GuardianChipAttackTrackId[] = [
  'percent',
  'cooldown',
  'targets',
]
const ALLY_TRACK_ORDER: readonly GuardianChipAllyTrackId[] = [
  'recovery',
  'maxRecovery',
  'cooldown',
]
const BOUNTY_TRACK_ORDER: readonly GuardianChipBountyTrackId[] = [
  'multiplier',
  'cooldown',
  'targets',
]
const FETCH_TRACK_ORDER: readonly GuardianChipFetchTrackId[] = [
  'cooldown',
  'findChance',
  'doubleFindChance',
]
const SUMMON_TRACK_ORDER: readonly GuardianChipSummonTrackId[] = [
  'cooldown',
  'duration',
  'cashBonus',
]
const SCOUT_TRACK_ORDER: readonly GuardianChipScoutTrackId[] = [
  'cooldown',
  'rangeBonus',
  'duration',
]

export function gameGuardianChipIdAtTypeIndex(chipType: number): GuardianChipId | null {
  return GAME_CHIP_TYPE_TO_ID[chipType] ?? null
}

function chipTrackBase(gameIndex: number): number {
  return gameIndex * GAME_GUARDIAN_CHIP_UPGRADES_PER_CHIP
}

/** Game `guardianChipLevel` stores upgrade tier minus one; TowerSmith uses 1-based levels. */
export function gameGuardianChipLevelFromSave(raw: number): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 1
  return Math.max(1, Math.trunc(raw) + 1)
}

function levelAt(levels: number[], gameIndex: number, trackOffset: number): number {
  const raw = levels[chipTrackBase(gameIndex) + trackOffset]
  return gameGuardianChipLevelFromSave(typeof raw === 'number' ? raw : 0)
}

function mapAttackUpgrades(levels: number[]): GuardianChipUpgrades['attack'] {
  const gameIndex = GAME_GUARDIAN_CHIP_INDEX.attack
  return {
    percent: clampGuardianChipAttackLevel('percent', levelAt(levels, gameIndex, 0)),
    cooldown: clampGuardianChipAttackLevel('cooldown', levelAt(levels, gameIndex, 1)),
    targets: clampGuardianChipAttackLevel('targets', levelAt(levels, gameIndex, 2)),
  }
}

function mapAllyUpgrades(levels: number[]): GuardianChipUpgrades['ally'] {
  const gameIndex = GAME_GUARDIAN_CHIP_INDEX.ally
  return {
    recovery: clampGuardianChipAllyLevel('recovery', levelAt(levels, gameIndex, 0)),
    maxRecovery: clampGuardianChipAllyLevel('maxRecovery', levelAt(levels, gameIndex, 1)),
    cooldown: clampGuardianChipAllyLevel('cooldown', levelAt(levels, gameIndex, 2)),
  }
}

function mapBountyUpgrades(levels: number[]): GuardianChipUpgrades['bounty'] {
  const gameIndex = GAME_GUARDIAN_CHIP_INDEX.bounty
  return {
    multiplier: clampGuardianChipBountyLevel('multiplier', levelAt(levels, gameIndex, 0)),
    cooldown: clampGuardianChipBountyLevel('cooldown', levelAt(levels, gameIndex, 1)),
    targets: clampGuardianChipBountyLevel('targets', levelAt(levels, gameIndex, 2)),
  }
}

function mapFetchUpgrades(levels: number[]): GuardianChipUpgrades['fetch'] {
  const gameIndex = GAME_GUARDIAN_CHIP_INDEX.fetch
  return {
    cooldown: clampGuardianChipFetchLevel('cooldown', levelAt(levels, gameIndex, 0)),
    findChance: clampGuardianChipFetchLevel('findChance', levelAt(levels, gameIndex, 1)),
    doubleFindChance: clampGuardianChipFetchLevel(
      'doubleFindChance',
      levelAt(levels, gameIndex, 2),
    ),
  }
}

function mapSummonUpgrades(levels: number[]): GuardianChipUpgrades['summon'] {
  const gameIndex = GAME_GUARDIAN_CHIP_INDEX.summon
  return {
    cooldown: clampGuardianChipSummonLevel('cooldown', levelAt(levels, gameIndex, 0)),
    duration: clampGuardianChipSummonLevel('duration', levelAt(levels, gameIndex, 1)),
    cashBonus: clampGuardianChipSummonLevel('cashBonus', levelAt(levels, gameIndex, 2)),
  }
}

function mapScoutUpgrades(levels: number[]): GuardianChipUpgrades['scout'] {
  const gameIndex = GAME_GUARDIAN_CHIP_INDEX.scout
  return {
    cooldown: clampGuardianChipScoutLevel('cooldown', levelAt(levels, gameIndex, 0)),
    rangeBonus: clampGuardianChipScoutLevel('rangeBonus', levelAt(levels, gameIndex, 1)),
    duration: clampGuardianChipScoutLevel('duration', levelAt(levels, gameIndex, 2)),
  }
}

function mapUpgrades(levels: number[]): GuardianChipUpgrades {
  return {
    attack: mapAttackUpgrades(levels),
    ally: mapAllyUpgrades(levels),
    bounty: mapBountyUpgrades(levels),
    fetch: mapFetchUpgrades(levels),
    summon: mapSummonUpgrades(levels),
    scout: mapScoutUpgrades(levels),
  }
}

/** Purchased slot count from `guardianSlotsUnlocked` (slot 0 is always free). */
export function guardianChipUnlockedSlotsFromSave(slotsUnlocked: number): boolean[] {
  const purchased = Math.max(0, Math.trunc(slotsUnlocked))
  const unlockedSlots = [...DEFAULT_GUARDIAN_UNLOCKED_SLOTS]
  for (let i = 1; i < GUARDIAN_CHIP_SLOT_COUNT; i += 1) {
    unlockedSlots[i] = i <= purchased
  }
  return unlockedSlots
}

function mapUnlockedChipIds(unlocked: boolean[]): GuardianChipId[] {
  const out: GuardianChipId[] = []
  for (const chipId of GUARDIAN_CHIP_IDS) {
    const gameIndex = GAME_GUARDIAN_CHIP_INDEX[chipId]
    if (unlocked[gameIndex] === true) out.push(chipId)
  }
  return out
}

function mapEquippedSlots(
  chipSlots: number[],
  unlockedSlots: boolean[],
): (GuardianChipId | null)[] {
  const slots: (GuardianChipId | null)[] = Array.from({ length: GUARDIAN_CHIP_SLOT_COUNT }, () => null)
  for (let i = 0; i < chipSlots.length && i < GUARDIAN_CHIP_SLOT_COUNT; i += 1) {
    if (!unlockedSlots[i]) continue
    const chipId = gameGuardianChipIdAtTypeIndex(chipSlots[i]!)
    slots[i] = chipId
  }
  return slots
}

export function playerSaveToGuardianChips(save: DecodedPlayerSave): GuardianChipState {
  const unlockedSlots = guardianChipUnlockedSlotsFromSave(save.guardianSlotsUnlocked)
  return {
    slots: mapEquippedSlots(save.guardianChipSlot, unlockedSlots),
    unlockedSlots,
    unlockedChipIds: mapUnlockedChipIds(save.guardianChipUnlocked),
    upgrades: mapUpgrades(save.guardianChipLevel),
  }
}

/** @internal Exported for tests that assert track order matches game arrays. */
export const GAME_GUARDIAN_CHIP_TRACK_ORDER = {
  attack: ATTACK_TRACK_ORDER,
  ally: ALLY_TRACK_ORDER,
  bounty: BOUNTY_TRACK_ORDER,
  fetch: FETCH_TRACK_ORDER,
  summon: SUMMON_TRACK_ORDER,
  scout: SCOUT_TRACK_ORDER,
} as const

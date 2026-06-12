import attackChip from '../../tables/guardians/chips/attack.json'
import allyChip from '../../tables/guardians/chips/ally.json'
import bountyChip from '../../tables/guardians/chips/bounty.json'
import fetchChip from '../../tables/guardians/chips/fetch.json'
import scoutChip from '../../tables/guardians/chips/scout.json'
import summonChip from '../../tables/guardians/chips/summon.json'

export type GuardianChipTrackLevel = {
  level: number
  value: number
  /** Cumulative upgrade cost to reach this level. */
  totalCost: number
}

export type GuardianChipTrack = {
  maxLevel: number
  levels: GuardianChipTrackLevel[]
}

export type GuardianAttackChipGodTable = {
  name: string
  chipId: 'attack'
  tracks: {
    percent: GuardianChipTrack
    cooldown: GuardianChipTrack
    targets: GuardianChipTrack
  }
}

export type GuardianAllyChipGodTable = {
  name: string
  chipId: 'ally'
  tracks: {
    recovery: GuardianChipTrack
    maxRecovery: GuardianChipTrack
    cooldown: GuardianChipTrack
  }
}

export type GuardianBountyChipGodTable = {
  name: string
  chipId: 'bounty'
  tracks: {
    multiplier: GuardianChipTrack
    cooldown: GuardianChipTrack
    targets: GuardianChipTrack
  }
}

export type GuardianFetchChipGodTable = {
  name: string
  chipId: 'fetch'
  tracks: {
    cooldown: GuardianChipTrack
    findChance: GuardianChipTrack
    doubleFindChance: GuardianChipTrack
  }
}

export type GuardianSummonChipGodTable = {
  name: string
  chipId: 'summon'
  tracks: {
    cooldown: GuardianChipTrack
    duration: GuardianChipTrack
    cashBonus: GuardianChipTrack
  }
}

export type GuardianScoutChipGodTable = {
  name: string
  chipId: 'scout'
  tracks: {
    cooldown: GuardianChipTrack
    rangeBonus: GuardianChipTrack
    duration: GuardianChipTrack
  }
}

/** Attack chip upgrade ladders from `tables/guardians/chips/attack.json`. */
export const GUARDIAN_ATTACK_CHIP_TABLE = attackChip as GuardianAttackChipGodTable

/** Ally chip upgrade ladders from `tables/guardians/chips/ally.json`. */
export const GUARDIAN_ALLY_CHIP_TABLE = allyChip as GuardianAllyChipGodTable

/** Bounty chip upgrade ladders from `tables/guardians/chips/bounty.json`. */
export const GUARDIAN_BOUNTY_CHIP_TABLE = bountyChip as GuardianBountyChipGodTable

/** Fetch chip upgrade ladders from `tables/guardians/chips/fetch.json`. */
export const GUARDIAN_FETCH_CHIP_TABLE = fetchChip as GuardianFetchChipGodTable

/** Summon chip upgrade ladders from `tables/guardians/chips/summon.json`. */
export const GUARDIAN_SUMMON_CHIP_TABLE = summonChip as GuardianSummonChipGodTable

/** Scout chip upgrade ladders from `tables/guardians/chips/scout.json`. */
export const GUARDIAN_SCOUT_CHIP_TABLE = scoutChip as GuardianScoutChipGodTable

export type GuardianChipAttackTrackId = keyof GuardianAttackChipGodTable['tracks']
export type GuardianChipAllyTrackId = keyof GuardianAllyChipGodTable['tracks']
export type GuardianChipBountyTrackId = keyof GuardianBountyChipGodTable['tracks']
export type GuardianChipFetchTrackId = keyof GuardianFetchChipGodTable['tracks']
export type GuardianChipSummonTrackId = keyof GuardianSummonChipGodTable['tracks']
export type GuardianChipScoutTrackId = keyof GuardianScoutChipGodTable['tracks']

export function guardianChipAttackTrack(
  track: GuardianChipAttackTrackId,
): GuardianChipTrack {
  return GUARDIAN_ATTACK_CHIP_TABLE.tracks[track]
}

export function guardianChipAllyTrack(track: GuardianChipAllyTrackId): GuardianChipTrack {
  return GUARDIAN_ALLY_CHIP_TABLE.tracks[track]
}

export function guardianChipAttackTrackLevel(
  track: GuardianChipAttackTrackId,
  level: number,
): GuardianChipTrackLevel | undefined {
  return guardianChipAttackTrack(track).levels.find((row) => row.level === level)
}

export function guardianChipAttackValueAtLevel(
  track: GuardianChipAttackTrackId,
  level: number,
): number | undefined {
  return guardianChipAttackTrackLevel(track, level)?.value
}

export function guardianChipAttackTotalCostAtLevel(
  track: GuardianChipAttackTrackId,
  level: number,
): number | undefined {
  return guardianChipAttackTrackLevel(track, level)?.totalCost
}

/** Coins to upgrade from `fromLevel` to `fromLevel + 1`. */
export function guardianChipAttackMarginalCost(
  track: GuardianChipAttackTrackId,
  fromLevel: number,
): number | undefined {
  const next = guardianChipAttackTrackLevel(track, fromLevel + 1)
  if (!next) return undefined
  const current = guardianChipAttackTrackLevel(track, fromLevel)
  return next.totalCost - (current?.totalCost ?? 0)
}

export function clampGuardianChipAttackLevel(
  track: GuardianChipAttackTrackId,
  level: number,
): number {
  const max = guardianChipAttackTrack(track).maxLevel
  if (!Number.isFinite(level)) return 1
  return Math.max(1, Math.min(max, Math.floor(level)))
}

export function formatGuardianChipAttackValue(
  track: GuardianChipAttackTrackId,
  level: number,
): string {
  const value = guardianChipAttackValueAtLevel(track, level)
  if (value == null) return '—'
  switch (track) {
    case 'percent':
      return `${value}%`
    case 'cooldown':
      return `${value}s`
    case 'targets':
      return String(value)
    default:
      return String(value)
  }
}

export const GUARDIAN_CHIP_ATTACK_TRACK_IDS = [
  'percent',
  'cooldown',
  'targets',
] as const satisfies readonly GuardianChipAttackTrackId[]

export function guardianChipAllyTrackLevel(
  track: GuardianChipAllyTrackId,
  level: number,
): GuardianChipTrackLevel | undefined {
  return guardianChipAllyTrack(track).levels.find((row) => row.level === level)
}

export function guardianChipAllyValueAtLevel(
  track: GuardianChipAllyTrackId,
  level: number,
): number | undefined {
  return guardianChipAllyTrackLevel(track, level)?.value
}

export function guardianChipAllyMarginalCost(
  track: GuardianChipAllyTrackId,
  fromLevel: number,
): number | undefined {
  const next = guardianChipAllyTrackLevel(track, fromLevel + 1)
  if (!next) return undefined
  const current = guardianChipAllyTrackLevel(track, fromLevel)
  return next.totalCost - (current?.totalCost ?? 0)
}

export function clampGuardianChipAllyLevel(
  track: GuardianChipAllyTrackId,
  level: number,
): number {
  const max = guardianChipAllyTrack(track).maxLevel
  if (!Number.isFinite(level)) return 1
  return Math.max(1, Math.min(max, Math.floor(level)))
}

export function formatGuardianChipAllyValue(
  track: GuardianChipAllyTrackId,
  level: number,
): string {
  const value = guardianChipAllyValueAtLevel(track, level)
  if (value == null) return '—'
  switch (track) {
    case 'recovery':
      return `${value}%`
    case 'maxRecovery':
      return `x${(value / 10).toFixed(2)}`
    case 'cooldown':
      return `${value}s`
    default:
      return String(value)
  }
}

export const GUARDIAN_CHIP_ALLY_TRACK_IDS = [
  'recovery',
  'maxRecovery',
  'cooldown',
] as const satisfies readonly GuardianChipAllyTrackId[]

export function guardianChipBountyTrack(track: GuardianChipBountyTrackId): GuardianChipTrack {
  return GUARDIAN_BOUNTY_CHIP_TABLE.tracks[track]
}

export function guardianChipBountyTrackLevel(
  track: GuardianChipBountyTrackId,
  level: number,
): GuardianChipTrackLevel | undefined {
  return guardianChipBountyTrack(track).levels.find((row) => row.level === level)
}

export function guardianChipBountyValueAtLevel(
  track: GuardianChipBountyTrackId,
  level: number,
): number | undefined {
  return guardianChipBountyTrackLevel(track, level)?.value
}

export function guardianChipBountyMarginalCost(
  track: GuardianChipBountyTrackId,
  fromLevel: number,
): number | undefined {
  const next = guardianChipBountyTrackLevel(track, fromLevel + 1)
  if (!next) return undefined
  const current = guardianChipBountyTrackLevel(track, fromLevel)
  return next.totalCost - (current?.totalCost ?? 0)
}

export function clampGuardianChipBountyLevel(
  track: GuardianChipBountyTrackId,
  level: number,
): number {
  const max = guardianChipBountyTrack(track).maxLevel
  if (!Number.isFinite(level)) return 1
  return Math.max(1, Math.min(max, Math.floor(level)))
}

export function formatGuardianChipBountyValue(
  track: GuardianChipBountyTrackId,
  level: number,
): string {
  const value = guardianChipBountyValueAtLevel(track, level)
  if (value == null) return '—'
  switch (track) {
    case 'multiplier':
      return `x${(1 + value / 100).toFixed(2)}`
    case 'cooldown':
      return `${value}s`
    case 'targets':
      return String(value)
    default:
      return String(value)
  }
}

export const GUARDIAN_CHIP_BOUNTY_TRACK_IDS = [
  'multiplier',
  'cooldown',
  'targets',
] as const satisfies readonly GuardianChipBountyTrackId[]

export function guardianChipFetchTrack(track: GuardianChipFetchTrackId): GuardianChipTrack {
  return GUARDIAN_FETCH_CHIP_TABLE.tracks[track]
}

export function guardianChipFetchTrackLevel(
  track: GuardianChipFetchTrackId,
  level: number,
): GuardianChipTrackLevel | undefined {
  return guardianChipFetchTrack(track).levels.find((row) => row.level === level)
}

export function guardianChipFetchValueAtLevel(
  track: GuardianChipFetchTrackId,
  level: number,
): number | undefined {
  return guardianChipFetchTrackLevel(track, level)?.value
}

export function guardianChipFetchMarginalCost(
  track: GuardianChipFetchTrackId,
  fromLevel: number,
): number | undefined {
  const next = guardianChipFetchTrackLevel(track, fromLevel + 1)
  if (!next) return undefined
  const current = guardianChipFetchTrackLevel(track, fromLevel)
  return next.totalCost - (current?.totalCost ?? 0)
}

export function clampGuardianChipFetchLevel(
  track: GuardianChipFetchTrackId,
  level: number,
): number {
  const max = guardianChipFetchTrack(track).maxLevel
  if (!Number.isFinite(level)) return 1
  return Math.max(1, Math.min(max, Math.floor(level)))
}

export function formatGuardianChipFetchValue(
  track: GuardianChipFetchTrackId,
  level: number,
): string {
  const value = guardianChipFetchValueAtLevel(track, level)
  if (value == null) return '—'
  switch (track) {
    case 'cooldown':
      return `${value}s`
    case 'findChance':
    case 'doubleFindChance':
      return `${value}%`
    default:
      return String(value)
  }
}

export const GUARDIAN_CHIP_FETCH_TRACK_IDS = [
  'cooldown',
  'findChance',
  'doubleFindChance',
] as const satisfies readonly GuardianChipFetchTrackId[]

export function guardianChipSummonTrack(track: GuardianChipSummonTrackId): GuardianChipTrack {
  return GUARDIAN_SUMMON_CHIP_TABLE.tracks[track]
}

export function guardianChipSummonTrackLevel(
  track: GuardianChipSummonTrackId,
  level: number,
): GuardianChipTrackLevel | undefined {
  return guardianChipSummonTrack(track).levels.find((row) => row.level === level)
}

export function guardianChipSummonValueAtLevel(
  track: GuardianChipSummonTrackId,
  level: number,
): number | undefined {
  return guardianChipSummonTrackLevel(track, level)?.value
}

export function guardianChipSummonMarginalCost(
  track: GuardianChipSummonTrackId,
  fromLevel: number,
): number | undefined {
  const next = guardianChipSummonTrackLevel(track, fromLevel + 1)
  if (!next) return undefined
  const current = guardianChipSummonTrackLevel(track, fromLevel)
  return next.totalCost - (current?.totalCost ?? 0)
}

export function clampGuardianChipSummonLevel(
  track: GuardianChipSummonTrackId,
  level: number,
): number {
  const max = guardianChipSummonTrack(track).maxLevel
  if (!Number.isFinite(level)) return 1
  return Math.max(1, Math.min(max, Math.floor(level)))
}

export function formatGuardianChipSummonValue(
  track: GuardianChipSummonTrackId,
  level: number,
): string {
  const value = guardianChipSummonValueAtLevel(track, level)
  if (value == null) return '—'
  switch (track) {
    case 'cooldown':
    case 'duration':
      return `${value}s`
    case 'cashBonus':
      return `x${(value / 10).toFixed(1)}`
    default:
      return String(value)
  }
}

export const GUARDIAN_CHIP_SUMMON_TRACK_IDS = [
  'cooldown',
  'duration',
  'cashBonus',
] as const satisfies readonly GuardianChipSummonTrackId[]

export function guardianChipScoutTrack(track: GuardianChipScoutTrackId): GuardianChipTrack {
  return GUARDIAN_SCOUT_CHIP_TABLE.tracks[track]
}

export function guardianChipScoutTrackLevel(
  track: GuardianChipScoutTrackId,
  level: number,
): GuardianChipTrackLevel | undefined {
  return guardianChipScoutTrack(track).levels.find((row) => row.level === level)
}

export function guardianChipScoutValueAtLevel(
  track: GuardianChipScoutTrackId,
  level: number,
): number | undefined {
  return guardianChipScoutTrackLevel(track, level)?.value
}

export function guardianChipScoutMarginalCost(
  track: GuardianChipScoutTrackId,
  fromLevel: number,
): number | undefined {
  const next = guardianChipScoutTrackLevel(track, fromLevel + 1)
  if (!next) return undefined
  const current = guardianChipScoutTrackLevel(track, fromLevel)
  return next.totalCost - (current?.totalCost ?? 0)
}

export function clampGuardianChipScoutLevel(
  track: GuardianChipScoutTrackId,
  level: number,
): number {
  const max = guardianChipScoutTrack(track).maxLevel
  if (!Number.isFinite(level)) return 1
  return Math.max(1, Math.min(max, Math.floor(level)))
}

export function formatGuardianChipScoutValue(
  track: GuardianChipScoutTrackId,
  level: number,
): string {
  const value = guardianChipScoutValueAtLevel(track, level)
  if (value == null) return '—'
  switch (track) {
    case 'cooldown':
    case 'duration':
      return `${value}s`
    case 'rangeBonus':
      return `x${(value / 10).toFixed(1)}`
    default:
      return String(value)
  }
}

export const GUARDIAN_CHIP_SCOUT_TRACK_IDS = [
  'cooldown',
  'rangeBonus',
  'duration',
] as const satisfies readonly GuardianChipScoutTrackId[]

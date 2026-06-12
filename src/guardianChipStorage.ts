import { useCallback, useEffect, useState } from 'react'
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
} from './data/guardianChipGodTables'
import {
  DEFAULT_GUARDIAN_CHIP_SLOTS,
  GUARDIAN_CHIP_IDS,
  GUARDIAN_CHIP_SLOT_COUNT,
  type GuardianChipId,
} from './data/guardianChips'
import {
  guardianChipSlotIsFreeUnlock,
  guardianChipSlotRequiresPurchase,
} from './data/guardianSlotGodTables'

export const GUARDIAN_CHIP_STORAGE_KEY = 'tower-export-guardian-chips-v1'

/** Bump when persisted unlock semantics change and old saves need normalization. */
export const GUARDIAN_CHIP_STORAGE_VERSION = 2

const CHANGE_EVENT = 'tower-export-guardian-chips-change'

export type GuardianAttackChipUpgrades = {
  percent: number
  cooldown: number
  targets: number
}

export type GuardianAllyChipUpgrades = {
  recovery: number
  maxRecovery: number
  cooldown: number
}

export type GuardianBountyChipUpgrades = {
  multiplier: number
  cooldown: number
  targets: number
}

export type GuardianFetchChipUpgrades = {
  cooldown: number
  findChance: number
  doubleFindChance: number
}

export type GuardianSummonChipUpgrades = {
  cooldown: number
  duration: number
  cashBonus: number
}

export type GuardianScoutChipUpgrades = {
  cooldown: number
  rangeBonus: number
  duration: number
}

export type GuardianChipUpgrades = {
  attack: GuardianAttackChipUpgrades
  ally: GuardianAllyChipUpgrades
  bounty: GuardianBountyChipUpgrades
  fetch: GuardianFetchChipUpgrades
  summon: GuardianSummonChipUpgrades
  scout: GuardianScoutChipUpgrades
}

export const DEFAULT_GUARDIAN_ATTACK_UPGRADES: GuardianAttackChipUpgrades = {
  percent: 1,
  cooldown: 1,
  targets: 1,
}

export const DEFAULT_GUARDIAN_ALLY_UPGRADES: GuardianAllyChipUpgrades = {
  recovery: 1,
  maxRecovery: 1,
  cooldown: 1,
}

export const DEFAULT_GUARDIAN_BOUNTY_UPGRADES: GuardianBountyChipUpgrades = {
  multiplier: 1,
  cooldown: 1,
  targets: 1,
}

export const DEFAULT_GUARDIAN_FETCH_UPGRADES: GuardianFetchChipUpgrades = {
  cooldown: 1,
  findChance: 1,
  doubleFindChance: 1,
}

export const DEFAULT_GUARDIAN_SUMMON_UPGRADES: GuardianSummonChipUpgrades = {
  cooldown: 1,
  duration: 1,
  cashBonus: 1,
}

export const DEFAULT_GUARDIAN_SCOUT_UPGRADES: GuardianScoutChipUpgrades = {
  cooldown: 1,
  rangeBonus: 1,
  duration: 1,
}

/** Default: slot 0 free (cost 0); slots 1–3 locked until purchased. */
export const DEFAULT_GUARDIAN_UNLOCKED_SLOTS: readonly boolean[] = [true, false, false, false]

export type GuardianChipState = {
  slots: (GuardianChipId | null)[]
  /** Per-slot unlock flags for slots with cost > 0. Free slots are always treated as unlocked. */
  unlockedSlots: boolean[]
  unlockedChipIds: GuardianChipId[]
  upgrades: GuardianChipUpgrades
}

function isGuardianChipId(value: unknown): value is GuardianChipId {
  return (
    typeof value === 'string' &&
    (GUARDIAN_CHIP_IDS as readonly string[]).includes(value)
  )
}

function parseSlots(raw: unknown): (GuardianChipId | null)[] {
  if (!Array.isArray(raw)) return [...DEFAULT_GUARDIAN_CHIP_SLOTS]
  const slots: (GuardianChipId | null)[] = []
  for (let i = 0; i < GUARDIAN_CHIP_SLOT_COUNT; i += 1) {
    const value = raw[i]
    slots.push(isGuardianChipId(value) ? value : null)
  }
  return slots
}

function storageVersion(record: Record<string, unknown>): number {
  const version = record.storageVersion
  return typeof version === 'number' && Number.isFinite(version) ? Math.floor(version) : 1
}

function migrateUnlockedSlotsFromV1(raw: unknown, record: Record<string, unknown>): boolean[] {
  const migrated = [...DEFAULT_GUARDIAN_UNLOCKED_SLOTS]
  if (Array.isArray(raw)) {
    // v1 treated slots 0–1 as free; only preserve purchases on old slots 3–4 (index 2–3).
    if (raw[2] === true) migrated[2] = true
    if (raw[3] === true) migrated[3] = true
    return migrated
  }
  if ('fourthSlotUnlocked' in record) {
    if (record.fourthSlotUnlocked === true) migrated[3] = true
  }
  return migrated
}

function parseUnlockedSlots(raw: unknown, record: Record<string, unknown>): boolean[] {
  if (storageVersion(record) < GUARDIAN_CHIP_STORAGE_VERSION) {
    return migrateUnlockedSlotsFromV1(raw, record)
  }

  const base = [...DEFAULT_GUARDIAN_UNLOCKED_SLOTS]
  if (Array.isArray(raw)) {
    for (let i = 0; i < GUARDIAN_CHIP_SLOT_COUNT; i += 1) {
      if (guardianChipSlotIsFreeUnlock(i)) {
        base[i] = true
        continue
      }
      base[i] = raw[i] === true
    }
    return base
  }
  return base
}

function normalizeSlotsForUnlocks(
  slots: (GuardianChipId | null)[],
  unlockedSlots: boolean[],
): (GuardianChipId | null)[] {
  return slots.map((chipId, slotIndex) =>
    isGuardianChipSlotUnlocked({ unlockedSlots } as GuardianChipState, slotIndex)
      ? chipId
      : null,
  )
}

function parseUnlocked(raw: unknown): GuardianChipId[] {
  if (!Array.isArray(raw)) return [...GUARDIAN_CHIP_IDS]
  const out = raw.filter(isGuardianChipId)
  return out.length > 0 ? out : [...GUARDIAN_CHIP_IDS]
}

function parseLevel(raw: unknown, fallback: number): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return fallback
  return Math.floor(raw)
}

function parseAttackUpgrades(raw: unknown): GuardianAttackChipUpgrades {
  const base = { ...DEFAULT_GUARDIAN_ATTACK_UPGRADES }
  if (typeof raw !== 'object' || raw === null) return base
  const record = raw as Record<string, unknown>
  return {
    percent: clampGuardianChipAttackLevel('percent', parseLevel(record.percent, base.percent)),
    cooldown: clampGuardianChipAttackLevel('cooldown', parseLevel(record.cooldown, base.cooldown)),
    targets: clampGuardianChipAttackLevel('targets', parseLevel(record.targets, base.targets)),
  }
}

function parseAllyUpgrades(raw: unknown): GuardianAllyChipUpgrades {
  const base = { ...DEFAULT_GUARDIAN_ALLY_UPGRADES }
  if (typeof raw !== 'object' || raw === null) return base
  const record = raw as Record<string, unknown>
  return {
    recovery: clampGuardianChipAllyLevel('recovery', parseLevel(record.recovery, base.recovery)),
    maxRecovery: clampGuardianChipAllyLevel(
      'maxRecovery',
      parseLevel(record.maxRecovery, base.maxRecovery),
    ),
    cooldown: clampGuardianChipAllyLevel('cooldown', parseLevel(record.cooldown, base.cooldown)),
  }
}

function parseBountyUpgrades(raw: unknown): GuardianBountyChipUpgrades {
  const base = { ...DEFAULT_GUARDIAN_BOUNTY_UPGRADES }
  if (typeof raw !== 'object' || raw === null) return base
  const record = raw as Record<string, unknown>
  return {
    multiplier: clampGuardianChipBountyLevel(
      'multiplier',
      parseLevel(record.multiplier, base.multiplier),
    ),
    cooldown: clampGuardianChipBountyLevel('cooldown', parseLevel(record.cooldown, base.cooldown)),
    targets: clampGuardianChipBountyLevel('targets', parseLevel(record.targets, base.targets)),
  }
}

function parseFetchUpgrades(raw: unknown): GuardianFetchChipUpgrades {
  const base = { ...DEFAULT_GUARDIAN_FETCH_UPGRADES }
  if (typeof raw !== 'object' || raw === null) return base
  const record = raw as Record<string, unknown>
  return {
    cooldown: clampGuardianChipFetchLevel('cooldown', parseLevel(record.cooldown, base.cooldown)),
    findChance: clampGuardianChipFetchLevel(
      'findChance',
      parseLevel(record.findChance, base.findChance),
    ),
    doubleFindChance: clampGuardianChipFetchLevel(
      'doubleFindChance',
      parseLevel(record.doubleFindChance, base.doubleFindChance),
    ),
  }
}

function parseSummonUpgrades(raw: unknown): GuardianSummonChipUpgrades {
  const base = { ...DEFAULT_GUARDIAN_SUMMON_UPGRADES }
  if (typeof raw !== 'object' || raw === null) return base
  const record = raw as Record<string, unknown>
  return {
    cooldown: clampGuardianChipSummonLevel('cooldown', parseLevel(record.cooldown, base.cooldown)),
    duration: clampGuardianChipSummonLevel('duration', parseLevel(record.duration, base.duration)),
    cashBonus: clampGuardianChipSummonLevel(
      'cashBonus',
      parseLevel(record.cashBonus, base.cashBonus),
    ),
  }
}

function parseScoutUpgrades(raw: unknown): GuardianScoutChipUpgrades {
  const base = { ...DEFAULT_GUARDIAN_SCOUT_UPGRADES }
  if (typeof raw !== 'object' || raw === null) return base
  const record = raw as Record<string, unknown>
  return {
    cooldown: clampGuardianChipScoutLevel('cooldown', parseLevel(record.cooldown, base.cooldown)),
    rangeBonus: clampGuardianChipScoutLevel(
      'rangeBonus',
      parseLevel(record.rangeBonus, base.rangeBonus),
    ),
    duration: clampGuardianChipScoutLevel('duration', parseLevel(record.duration, base.duration)),
  }
}

function parseUpgrades(raw: unknown): GuardianChipUpgrades {
  if (typeof raw !== 'object' || raw === null) {
    return {
      attack: { ...DEFAULT_GUARDIAN_ATTACK_UPGRADES },
      ally: { ...DEFAULT_GUARDIAN_ALLY_UPGRADES },
      bounty: { ...DEFAULT_GUARDIAN_BOUNTY_UPGRADES },
      fetch: { ...DEFAULT_GUARDIAN_FETCH_UPGRADES },
      summon: { ...DEFAULT_GUARDIAN_SUMMON_UPGRADES },
      scout: { ...DEFAULT_GUARDIAN_SCOUT_UPGRADES },
    }
  }
  const record = raw as Record<string, unknown>
  return {
    attack: parseAttackUpgrades(record.attack),
    ally: parseAllyUpgrades(record.ally),
    bounty: parseBountyUpgrades(record.bounty),
    fetch: parseFetchUpgrades(record.fetch),
    summon: parseSummonUpgrades(record.summon),
    scout: parseScoutUpgrades(record.scout),
  }
}

function defaultGuardianChipState(): GuardianChipState {
  return {
    slots: [...DEFAULT_GUARDIAN_CHIP_SLOTS],
    unlockedSlots: [...DEFAULT_GUARDIAN_UNLOCKED_SLOTS],
    unlockedChipIds: [...GUARDIAN_CHIP_IDS],
    upgrades: {
      attack: { ...DEFAULT_GUARDIAN_ATTACK_UPGRADES },
      ally: { ...DEFAULT_GUARDIAN_ALLY_UPGRADES },
      bounty: { ...DEFAULT_GUARDIAN_BOUNTY_UPGRADES },
      fetch: { ...DEFAULT_GUARDIAN_FETCH_UPGRADES },
      summon: { ...DEFAULT_GUARDIAN_SUMMON_UPGRADES },
      scout: { ...DEFAULT_GUARDIAN_SCOUT_UPGRADES },
    },
  }
}

export function readGuardianChipState(): GuardianChipState {
  try {
    const raw = localStorage.getItem(GUARDIAN_CHIP_STORAGE_KEY)
    if (!raw) return defaultGuardianChipState()
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return defaultGuardianChipState()
    const record = parsed as Record<string, unknown>
    const unlockedSlots = parseUnlockedSlots(record.unlockedSlots, record)
    const state: GuardianChipState = {
      slots: normalizeSlotsForUnlocks(parseSlots(record.slots), unlockedSlots),
      unlockedSlots,
      unlockedChipIds: parseUnlocked(record.unlockedChipIds),
      upgrades: parseUpgrades(record.upgrades),
    }
    if (storageVersion(record) < GUARDIAN_CHIP_STORAGE_VERSION) {
      writeGuardianChipState(state)
    }
    return state
  } catch {
    return defaultGuardianChipState()
  }
}

export function writeGuardianChipState(next: GuardianChipState): void {
  try {
    localStorage.setItem(
      GUARDIAN_CHIP_STORAGE_KEY,
      JSON.stringify({ storageVersion: GUARDIAN_CHIP_STORAGE_VERSION, ...next }),
    )
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

export function isGuardianChipSlotUnlocked(
  state: GuardianChipState,
  slotIndex: number,
): boolean {
  if (slotIndex < 0 || slotIndex >= GUARDIAN_CHIP_SLOT_COUNT) return false
  if (guardianChipSlotIsFreeUnlock(slotIndex)) return true
  return state.unlockedSlots[slotIndex] === true
}

export function isGuardianChipSlotLocked(
  state: GuardianChipState,
  slotIndex: number,
): boolean {
  return !isGuardianChipSlotUnlocked(state, slotIndex)
}

export function unlockGuardianChipSlot(
  state: GuardianChipState,
  slotIndex: number,
): GuardianChipState {
  if (!guardianChipSlotRequiresPurchase(slotIndex)) return state
  if (isGuardianChipSlotUnlocked(state, slotIndex)) return state
  const unlockedSlots = [...state.unlockedSlots]
  unlockedSlots[slotIndex] = true
  return { ...state, unlockedSlots }
}

function isSlotLocked(state: GuardianChipState, slotIndex: number): boolean {
  return isGuardianChipSlotLocked(state, slotIndex)
}

export function equipGuardianChip(
  state: GuardianChipState,
  chipId: GuardianChipId,
  slotIndex?: number,
): GuardianChipState {
  if (!state.unlockedChipIds.includes(chipId)) return state

  const slots = [...state.slots]
  const existingSlot = slots.findIndex((id) => id === chipId)
  if (existingSlot >= 0) slots[existingSlot] = null

  if (slotIndex != null) {
    if (isSlotLocked(state, slotIndex)) return state
    const displaced = slots[slotIndex]
    slots[slotIndex] = chipId
    if (displaced && displaced !== chipId) {
      const empty = slots.findIndex((id, i) => id == null && !isSlotLocked(state, i))
      if (empty >= 0) slots[empty] = displaced
    }
    return { ...state, slots }
  }

  const target = slots.findIndex((id, i) => id == null && !isSlotLocked(state, i))
  if (target < 0) return state
  slots[target] = chipId
  return { ...state, slots }
}

export function unequipGuardianChipSlot(
  state: GuardianChipState,
  slotIndex: number,
): GuardianChipState {
  if (isSlotLocked(state, slotIndex)) return state
  const slots = [...state.slots]
  slots[slotIndex] = null
  return { ...state, slots }
}

export function respecGuardianChips(state: GuardianChipState): GuardianChipState {
  return {
    ...state,
    slots: state.slots.map(() => null),
    unlockedSlots: [...DEFAULT_GUARDIAN_UNLOCKED_SLOTS],
  }
}

export function setGuardianAttackUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipAttackTrackId,
  level: number,
): GuardianChipState {
  return {
    ...state,
    upgrades: {
      ...state.upgrades,
      attack: {
        ...state.upgrades.attack,
        [track]: clampGuardianChipAttackLevel(track, level),
      },
    },
  }
}

export function bumpGuardianAttackUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipAttackTrackId,
  direction: -1 | 1,
): GuardianChipState {
  const current = state.upgrades.attack[track]
  return setGuardianAttackUpgradeLevel(state, track, current + direction)
}

export function setGuardianAllyUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipAllyTrackId,
  level: number,
): GuardianChipState {
  return {
    ...state,
    upgrades: {
      ...state.upgrades,
      ally: {
        ...state.upgrades.ally,
        [track]: clampGuardianChipAllyLevel(track, level),
      },
    },
  }
}

export function bumpGuardianAllyUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipAllyTrackId,
  direction: -1 | 1,
): GuardianChipState {
  const current = state.upgrades.ally[track]
  return setGuardianAllyUpgradeLevel(state, track, current + direction)
}

export function setGuardianBountyUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipBountyTrackId,
  level: number,
): GuardianChipState {
  return {
    ...state,
    upgrades: {
      ...state.upgrades,
      bounty: {
        ...state.upgrades.bounty,
        [track]: clampGuardianChipBountyLevel(track, level),
      },
    },
  }
}

export function bumpGuardianBountyUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipBountyTrackId,
  direction: -1 | 1,
): GuardianChipState {
  const current = state.upgrades.bounty[track]
  return setGuardianBountyUpgradeLevel(state, track, current + direction)
}

export function setGuardianFetchUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipFetchTrackId,
  level: number,
): GuardianChipState {
  return {
    ...state,
    upgrades: {
      ...state.upgrades,
      fetch: {
        ...state.upgrades.fetch,
        [track]: clampGuardianChipFetchLevel(track, level),
      },
    },
  }
}

export function bumpGuardianFetchUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipFetchTrackId,
  direction: -1 | 1,
): GuardianChipState {
  const current = state.upgrades.fetch[track]
  return setGuardianFetchUpgradeLevel(state, track, current + direction)
}

export function setGuardianSummonUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipSummonTrackId,
  level: number,
): GuardianChipState {
  return {
    ...state,
    upgrades: {
      ...state.upgrades,
      summon: {
        ...state.upgrades.summon,
        [track]: clampGuardianChipSummonLevel(track, level),
      },
    },
  }
}

export function bumpGuardianSummonUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipSummonTrackId,
  direction: -1 | 1,
): GuardianChipState {
  const current = state.upgrades.summon[track]
  return setGuardianSummonUpgradeLevel(state, track, current + direction)
}

export function setGuardianScoutUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipScoutTrackId,
  level: number,
): GuardianChipState {
  return {
    ...state,
    upgrades: {
      ...state.upgrades,
      scout: {
        ...state.upgrades.scout,
        [track]: clampGuardianChipScoutLevel(track, level),
      },
    },
  }
}

export function bumpGuardianScoutUpgradeLevel(
  state: GuardianChipState,
  track: GuardianChipScoutTrackId,
  direction: -1 | 1,
): GuardianChipState {
  const current = state.upgrades.scout[track]
  return setGuardianScoutUpgradeLevel(state, track, current + direction)
}

export function useGuardianChipState(): [
  GuardianChipState,
  (updater: (prev: GuardianChipState) => GuardianChipState) => void,
] {
  const [state, setState] = useState<GuardianChipState>(readGuardianChipState)

  useEffect(() => {
    const sync = () => setState(readGuardianChipState())
    window.addEventListener(CHANGE_EVENT, sync)
    const onStorage = (e: StorageEvent) => {
      if (e.key === GUARDIAN_CHIP_STORAGE_KEY || e.key === null) sync()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const update = useCallback((updater: (prev: GuardianChipState) => GuardianChipState) => {
    setState((prev) => {
      const next = updater(prev)
      writeGuardianChipState(next)
      return next
    })
  }, [])

  return [state, update]
}

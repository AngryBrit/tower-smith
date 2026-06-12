import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_GUARDIAN_CHIP_SLOTS,
  GUARDIAN_CHIP_IDS,
  GUARDIAN_CHIP_LOCKED_SLOT_INDEX,
  GUARDIAN_CHIP_SLOT_COUNT,
  type GuardianChipId,
} from './data/guardianChips'

export const GUARDIAN_CHIP_STORAGE_KEY = 'tower-export-guardian-chips-v1'

const CHANGE_EVENT = 'tower-export-guardian-chips-change'

export type GuardianChipState = {
  slots: (GuardianChipId | null)[]
  /** When false, the fourth equip slot stays locked (matches in-game unlock). */
  fourthSlotUnlocked: boolean
  unlockedChipIds: GuardianChipId[]
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

function parseUnlocked(raw: unknown): GuardianChipId[] {
  if (!Array.isArray(raw)) return [...GUARDIAN_CHIP_IDS]
  const out = raw.filter(isGuardianChipId)
  return out.length > 0 ? out : [...GUARDIAN_CHIP_IDS]
}

export function readGuardianChipState(): GuardianChipState {
  try {
    const raw = localStorage.getItem(GUARDIAN_CHIP_STORAGE_KEY)
    if (!raw) {
      return {
        slots: [...DEFAULT_GUARDIAN_CHIP_SLOTS],
        fourthSlotUnlocked: false,
        unlockedChipIds: [...GUARDIAN_CHIP_IDS],
      }
    }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return {
        slots: [...DEFAULT_GUARDIAN_CHIP_SLOTS],
        fourthSlotUnlocked: false,
        unlockedChipIds: [...GUARDIAN_CHIP_IDS],
      }
    }
    const record = parsed as Record<string, unknown>
    return {
      slots: parseSlots(record.slots),
      fourthSlotUnlocked: record.fourthSlotUnlocked === true,
      unlockedChipIds: parseUnlocked(record.unlockedChipIds),
    }
  } catch {
    return {
      slots: [...DEFAULT_GUARDIAN_CHIP_SLOTS],
      fourthSlotUnlocked: false,
      unlockedChipIds: [...GUARDIAN_CHIP_IDS],
    }
  }
}

export function writeGuardianChipState(next: GuardianChipState): void {
  try {
    localStorage.setItem(GUARDIAN_CHIP_STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

function isSlotLocked(state: GuardianChipState, slotIndex: number): boolean {
  return slotIndex === GUARDIAN_CHIP_LOCKED_SLOT_INDEX && !state.fourthSlotUnlocked
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
    slots: state.slots.map((_, i) =>
      isSlotLocked(state, i) ? null : null,
    ),
  }
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

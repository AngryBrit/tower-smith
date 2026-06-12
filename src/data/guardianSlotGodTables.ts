import slotUnlockCosts from '../../tables/guardians/slot-unlock-costs.json'

export type GuardianChipSlotUnlockRow = {
  /** 1-based chip slot number shown in the guardians loadout UI. */
  slot: number
  /** Bits cost to unlock; `0` = free; `null` = unknown / not in data yet. */
  cost: number | null
}

export type GuardianChipSlotUnlockTable = {
  name: string
  slots: GuardianChipSlotUnlockRow[]
}

/** Slot unlock costs from `tables/guardians/slot-unlock-costs.json`. */
export const GUARDIAN_CHIP_SLOT_UNLOCK_TABLE =
  slotUnlockCosts as GuardianChipSlotUnlockTable

export function guardianChipSlotUnlockRow(slotIndex: number): GuardianChipSlotUnlockRow | undefined {
  return GUARDIAN_CHIP_SLOT_UNLOCK_TABLE.slots.find((row) => row.slot === slotIndex + 1)
}

/** Bits cost for a slot; `undefined` if slot is not in the table. */
export function guardianChipSlotUnlockCost(slotIndex: number): number | null | undefined {
  return guardianChipSlotUnlockRow(slotIndex)?.cost
}

/** Slots with a known numeric cost that appear in the guardians loadout UI. */
export function guardianChipSlotUnlockCostForUi(slotIndex: number): number | null | undefined {
  const cost = guardianChipSlotUnlockCost(slotIndex)
  if (cost == null) return cost
  return cost
}

export function guardianChipSlotIsFreeUnlock(slotIndex: number): boolean {
  return guardianChipSlotUnlockCost(slotIndex) === 0
}

export function guardianChipSlotRequiresPurchase(slotIndex: number): boolean {
  const cost = guardianChipSlotUnlockCost(slotIndex)
  return typeof cost === 'number' && cost > 0
}

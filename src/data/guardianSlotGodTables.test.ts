import { describe, expect, it } from 'vitest'
import {
  GUARDIAN_CHIP_SLOT_UNLOCK_TABLE,
  guardianChipSlotIsFreeUnlock,
  guardianChipSlotRequiresPurchase,
  guardianChipSlotUnlockCost,
} from './guardianSlotGodTables'

describe('guardianSlotGodTables', () => {
  it('lists supplied slot unlock costs', () => {
    expect(GUARDIAN_CHIP_SLOT_UNLOCK_TABLE.slots).toEqual([
      { slot: 1, cost: 0 },
      { slot: 2, cost: 200 },
      { slot: 3, cost: 300 },
      { slot: 4, cost: null },
    ])
  })

  it('classifies free and purchasable slots', () => {
    expect(guardianChipSlotUnlockCost(0)).toBe(0)
    expect(guardianChipSlotIsFreeUnlock(0)).toBe(true)
    expect(guardianChipSlotIsFreeUnlock(1)).toBe(false)
    expect(guardianChipSlotRequiresPurchase(1)).toBe(true)
    expect(guardianChipSlotUnlockCost(1)).toBe(200)
    expect(guardianChipSlotRequiresPurchase(2)).toBe(true)
    expect(guardianChipSlotUnlockCost(2)).toBe(300)
    expect(guardianChipSlotUnlockCost(3)).toBeNull()
    expect(guardianChipSlotRequiresPurchase(3)).toBe(false)
  })
})

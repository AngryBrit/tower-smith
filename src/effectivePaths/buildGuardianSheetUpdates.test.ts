import { describe, expect, it } from 'vitest'
import {
  buildGuardianLevelCellUpdates,
  buildGuardianSheetUpdates,
  guardianEpLevelDropdownLabel,
} from './buildGuardianSheetUpdates'
import type { GuardiansEpSyncState } from './guardiansEpStateFromPersisted'
import { guardianEpUnlockRowIndex, GUARDIAN_EP_V302_UNLOCK_COL } from './guardianEpSheetNames'

describe('buildGuardianSheetUpdates', () => {
  it('writes Unlocked / Locked labels to column B on unlock rows', () => {
    const state: GuardiansEpSyncState = {
      upgrades: {
        attack: { percent: 1, cooldown: 1, targets: 1 },
        ally: { recovery: 1, maxRecovery: 1, cooldown: 1 },
        bounty: { multiplier: 1, cooldown: 1, targets: 1 },
        fetch: { cooldown: 1, findChance: 1, doubleFindChance: 1 },
        summon: { cooldown: 1, duration: 1, cashBonus: 1 },
        scout: { cooldown: 1, rangeBonus: 1, duration: 1 },
      },
      unlockedChipIds: ['attack', 'fetch'],
    }

    const batch = buildGuardianSheetUpdates('Master Sheet', state)
    const unlockCol = String.fromCharCode('A'.charCodeAt(0) + GUARDIAN_EP_V302_UNLOCK_COL)
    const attack = batch.find((entry) => entry.range === `'Master Sheet'!${unlockCol}${guardianEpUnlockRowIndex('attack')}`)
    const bounty = batch.find((entry) => entry.range === `'Master Sheet'!${unlockCol}${guardianEpUnlockRowIndex('bounty')}`)

    expect(attack?.values[0]?.[0]).toBe('Unlocked')
    expect(bounty?.values[0]?.[0]).toBe('Locked')
  })

  it('builds 18 column C level dropdown cells', () => {
    const state: GuardiansEpSyncState = {
      upgrades: {
        attack: { percent: 2, cooldown: 1, targets: 1 },
        ally: { recovery: 1, maxRecovery: 1, cooldown: 1 },
        bounty: { multiplier: 1, cooldown: 1, targets: 1 },
        fetch: { cooldown: 1, findChance: 1, doubleFindChance: 1 },
        summon: { cooldown: 1, duration: 1, cashBonus: 1 },
        scout: { cooldown: 1, rangeBonus: 1, duration: 1 },
      },
      unlockedChipIds: [],
    }

    const cells = buildGuardianLevelCellUpdates(state)
    expect(cells).toHaveLength(18)
    expect(cells[0]?.rowIndex).toBe(2)
    expect(guardianEpLevelDropdownLabel('attack', 'percent', 2)).toMatch(/^01 \| 2% \| Cost/)
  })
})

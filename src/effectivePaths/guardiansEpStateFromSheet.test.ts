import { describe, expect, it } from 'vitest'
import {
  buildGuardianLevelCellUpdates,
  buildGuardianSheetUpdates,
} from './buildGuardianSheetUpdates'
import { guardiansEpStateAppliedToPersisted } from './epImportAppliedToPersisted'
import { guardiansEpStateFromSheetGrid } from './guardiansEpStateFromSheet'
import type { GuardiansEpSyncState } from './guardiansEpStateFromPersisted'
import { readGuardianChipState } from '../guardianChipStorage'
import {
  GUARDIAN_EP_CHIP_START_ROWS,
  GUARDIAN_EP_V302_LEVEL_COL,
  GUARDIAN_EP_V302_UNLOCK_COL,
  guardianEpUnlockRowIndex,
} from './guardianEpSheetNames'

function gridFromGuardianExport(state: GuardiansEpSyncState): string[][] {
  const grid = Array.from({ length: 24 }, () => Array<string>(8).fill(''))
  for (const entry of buildGuardianSheetUpdates('Master Sheet', state)) {
    const match = /!B(\d+)$/.exec(entry.range)
    if (!match) continue
    const row = Number(match[1]) - 1
    grid[row]![GUARDIAN_EP_V302_UNLOCK_COL] = String(entry.values[0]![0])
  }
  for (const { rowIndex, label } of buildGuardianLevelCellUpdates(state)) {
    grid[rowIndex - 1]![GUARDIAN_EP_V302_LEVEL_COL] = label
  }
  return grid
}

describe('guardiansEpStateFromSheetGrid', () => {
  it('round-trips unlock labels from column B', () => {
    const state: GuardiansEpSyncState = {
      upgrades: {
        attack: { percent: 1, cooldown: 1, targets: 1 },
        ally: { recovery: 1, maxRecovery: 1, cooldown: 1 },
        bounty: { multiplier: 1, cooldown: 1, targets: 1 },
        fetch: { cooldown: 1, findChance: 1, doubleFindChance: 1 },
        summon: { cooldown: 1, duration: 1, cashBonus: 1 },
        scout: { cooldown: 1, rangeBonus: 1, duration: 1 },
      },
      unlockedChipIds: ['attack', 'scout'],
    }

    const imported = guardiansEpStateFromSheetGrid(gridFromGuardianExport(state))
    expect(imported.unlockedChipIds).toEqual(['attack', 'scout'])
  })

  it('reads attack percent level from column C dropdown', () => {
    const grid = Array.from({ length: 24 }, () => Array<string>(8).fill(''))
    grid[GUARDIAN_EP_CHIP_START_ROWS.attack - 1]![GUARDIAN_EP_V302_LEVEL_COL] =
      '01 | 2% | Cost 25 ⧈ | Next 10 ⧈'
    grid[guardianEpUnlockRowIndex('attack') - 1]![GUARDIAN_EP_V302_UNLOCK_COL] = 'Unlocked'

    const imported = guardiansEpStateFromSheetGrid(grid)
    expect(imported.upgrades.attack.percent).toBe(2)
    expect(imported.unlockedChipIds).toContain('attack')
  })

  it('applies imported chip state to persisted guardian storage shape', () => {
    const grid = Array.from({ length: 24 }, () => Array<string>(8).fill(''))
    grid[GUARDIAN_EP_CHIP_START_ROWS.bounty - 1]![GUARDIAN_EP_V302_LEVEL_COL] =
      '00 | 0.01x | Cost 0 ⧈ | Next 1 ⧈'
    grid[guardianEpUnlockRowIndex('bounty') - 1]![GUARDIAN_EP_V302_UNLOCK_COL] = 'Unlocked'

    const applied = guardiansEpStateAppliedToPersisted(
      readGuardianChipState(),
      guardiansEpStateFromSheetGrid(grid),
    )
    expect(applied.unlockedChipIds).toContain('bounty')
    expect(applied.upgrades.bounty.multiplier).toBe(1)
  })
})

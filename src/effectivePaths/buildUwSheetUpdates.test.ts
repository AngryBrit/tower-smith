import { describe, expect, it } from 'vitest'
import {
  UW_EP_STONES_SYMBOL,
  buildUwFarmingLevelCellUpdates,
  buildUwSheetUpdates,
  uwEpFarmingLevelDropdownLabel,
} from './buildUwSheetUpdates'
import type { UwsEpSyncState } from './uwsEpStateFromPersisted'

const state: UwsEpSyncState = {
  levels: {
    chainLightningDamageLevel: 4,
    chainLightningQuantityLevel: 1,
    chainLightningChanceLevel: 5,
    ultimatePlusChainLightningSmiteLevel: -1,
    goldenTowerBonusLevel: 15,
    goldenTowerDurationLevel: 12,
    goldenTowerCooldownLevel: 10,
    ultimatePlusGoldenTowerGoldenComboLevel: 0,
  },
  ownedByWeaponId: {
    chainLightning: true,
    smartMissiles: false,
    deathWave: true,
    chronoField: false,
    innerLandMines: false,
    goldenTower: true,
    poisonSwamp: false,
    blackHole: true,
    spotlight: true,
  },
}

describe('uwEpFarmingLevelDropdownLabel', () => {
  it('matches Golden Tower Bonus dropdown spelling from UWs v3.1.2', () => {
    const s = UW_EP_STONES_SYMBOL
    expect(uwEpFarmingLevelDropdownLabel('goldenTowerBonusLevel', 15)).toBe(
      `15 | x17.0 | Cost 500 ${s} | Next 700 ${s}`,
    )
  })

  it('prefixes locked Plus rows with Lo | Locked', () => {
    const s = UW_EP_STONES_SYMBOL
    expect(uwEpFarmingLevelDropdownLabel('ultimatePlusChainLightningSmiteLevel', -1)).toMatch(
      new RegExp(`^Lo \\| Locked 00 \\| .* \\| Cost 0 ${s} \\| Next`),
    )
  })
})

describe('buildUwFarmingLevelCellUpdates', () => {
  it('writes 36 level dropdown rows on column G', () => {
    const cells = buildUwFarmingLevelCellUpdates(state)
    expect(cells).toHaveLength(36)
    expect(cells[0]).toEqual({
      rowIndex: 2,
      label: uwEpFarmingLevelDropdownLabel('chainLightningDamageLevel', 4),
    })
    expect(cells.find((cell) => cell.rowIndex === 22)).toEqual({
      rowIndex: 22,
      label: uwEpFarmingLevelDropdownLabel('goldenTowerBonusLevel', 15),
    })
  })
})

describe('buildUwSheetUpdates', () => {
  it('writes UW unlocked checkboxes on column D', () => {
    const batch = buildUwSheetUpdates('Master Sheet', state)
    expect(batch).toEqual(
      expect.arrayContaining([
        { range: "'Master Sheet'!D2", values: [[true]] },
        { range: "'Master Sheet'!D6", values: [[false]] },
        { range: "'Master Sheet'!D22", values: [[true]] },
      ]),
    )
    expect(batch).toHaveLength(9)
  })
})

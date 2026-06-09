import { describe, expect, it } from 'vitest'
import {
  getLabGodLabNames,
  getLabGodTables,
  LAB_GOD_TABLE_COUNT,
  labGodLevelEntry,
} from './labGodTables'
import {
  toolkitMarginalCoinCost,
  toolkitUpgradeDurationSeconds,
} from '../labCosts'

describe('labGodTables', () => {
  it('registers one GOD table per research card (217 labs)', () => {
    expect(getLabGodLabNames().size).toBe(LAB_GOD_TABLE_COUNT)
    expect(Object.keys(getLabGodTables()).sort()).toEqual(
      [...getLabGodLabNames()].sort(),
    )
    for (const name of [
      'Game Speed',
      'Labs Coin Discount',
      'Starting Cash',
      'Super Tower Bonus',
      'Workshop Attack Discount',
    ]) {
      expect(getLabGodLabNames().has(name)).toBe(true)
    }
  })

  it('level rows match marginal coin and duration lookups', () => {
    for (const table of Object.values(getLabGodTables())) {
      for (const row of table.levels) {
        const current = row.level - 1
        expect(toolkitMarginalCoinCost(table.name, current)).toBe(row.coins)
        expect(toolkitUpgradeDurationSeconds(table.name, current)).toBe(
          row.time.seconds,
        )
        expect(labGodLevelEntry(table.name, row.level)).toEqual(row)
      }
    }
  })
})

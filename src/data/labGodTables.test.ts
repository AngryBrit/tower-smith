import { describe, expect, it } from 'vitest'
import {
  LAB_GOD_LAB_NAMES,
  LAB_GOD_TABLES,
  labGodLevelEntry,
} from './labGodTables'
import {
  toolkitMarginalCoinCost,
  toolkitUpgradeDurationSeconds,
} from '../labCosts'

describe('labGodTables', () => {
  it('registers one GOD table per research card (217 labs)', () => {
    expect(LAB_GOD_LAB_NAMES.size).toBe(217)
    expect(Object.keys(LAB_GOD_TABLES).sort()).toEqual(
      [...LAB_GOD_LAB_NAMES].sort(),
    )
    for (const name of [
      'Game Speed',
      'Labs Coin Discount',
      'Starting Cash',
      'Super Tower Bonus',
      'Workshop Attack Discount',
    ]) {
      expect(LAB_GOD_LAB_NAMES.has(name)).toBe(true)
    }
  })

  it('level rows match marginal coin and duration lookups', () => {
    for (const table of Object.values(LAB_GOD_TABLES)) {
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

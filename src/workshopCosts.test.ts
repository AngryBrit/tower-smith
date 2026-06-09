import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_DEFENSE_GOD_NAMES,
  WORKSHOP_ENHANCE_ATTACK_GOD_NAMES,
  WORKSHOP_ENHANCE_DEFENSE_GOD_NAMES,
  WORKSHOP_ENHANCE_UTILITY_GOD_NAMES,
  WORKSHOP_UTILITY_GOD_NAMES,
  workshopGodTableMaxLevel,
  workshopHasGodTable,
  workshopToolkitMarginalCoins,
  workshopToolkitStatValue,
} from './workshopCosts'
import {
  getWorkshopGodTables,
  WORKSHOP_GOD_TABLE_COUNT,
  workshopGodMarginalCoins,
} from './data/workshopGodTables'

describe('workshopCosts', () => {
  it('registers GOD tables for all mapped workshop stats', () => {
    const mapped = [
      ...Object.values(WORKSHOP_DEFENSE_GOD_NAMES),
      ...Object.values(WORKSHOP_UTILITY_GOD_NAMES),
      ...Object.values(WORKSHOP_ENHANCE_ATTACK_GOD_NAMES),
      ...Object.values(WORKSHOP_ENHANCE_DEFENSE_GOD_NAMES),
      ...Object.values(WORKSHOP_ENHANCE_UTILITY_GOD_NAMES),
      'Attack Speed',
      'Damage',
      'Rend Armor Chance',
      'Rend Armor Mult',
    ]
    for (const name of mapped) {
      expect(workshopHasGodTable(name), name).toBe(true)
    }
    expect(Object.keys(getWorkshopGodTables()).length).toBe(WORKSHOP_GOD_TABLE_COUNT)
  })

  it('marginal coins match GOD rows for every table', () => {
    for (const table of Object.values(getWorkshopGodTables())) {
      for (const row of table.levels) {
        if (row.level >= table.maxLevel) continue
        const coins = row.nextCoins.coins
        if (typeof coins !== 'number' || !Number.isFinite(coins)) continue
        expect(workshopToolkitMarginalCoins(table.name, row.level)).toBe(coins)
        expect(workshopGodMarginalCoins(table.name, row.level + 1)).toBe(coins)
      }
    }
  })

  it('stat values match GOD rows for every table', () => {
    for (const table of Object.values(getWorkshopGodTables())) {
      for (const row of table.levels) {
        const value = row.value
        if (typeof value !== 'number' || !Number.isFinite(value)) continue
        expect(workshopToolkitStatValue(table.name, row.level)).toBe(value)
      }
    }
  })

  it('resolves slash aliases to calculator export names', () => {
    expect(workshopGodTableMaxLevel('Cash / Wave')).toBe(
      getWorkshopGodTables()['Cash - Wave'].maxLevel,
    )
    expect(workshopToolkitMarginalCoins('Thorn Damage', 0)).toBe(
      workshopToolkitMarginalCoins('Thorns', 0),
    )
  })
})

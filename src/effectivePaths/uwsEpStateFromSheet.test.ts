import { describe, expect, it } from 'vitest'
import { workshopUltimateIsActive, workshopUltimateWeaponIsOwned } from '../data/workshopUltimate'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { uwsEpStateAppliedToPersisted } from './epImportAppliedToPersisted'
import { uwsEpStateFromSheetGrid } from './uwsEpStateFromSheet'
import { UW_EP_V31_UNLOCKED_ROWS } from './uwEpSheetNames'

describe('uwsEpStateFromSheetGrid', () => {
  it('reads unlocked checkboxes from column D', () => {
    const grid = Array.from({ length: 40 }, () => Array<string>(8).fill(''))
    grid[UW_EP_V31_UNLOCKED_ROWS.goldenTower - 1]![3] = 'TRUE'
    grid[UW_EP_V31_UNLOCKED_ROWS.chainLightning - 1]![3] = 'FALSE'

    const state = uwsEpStateFromSheetGrid(grid)
    expect(state.ownedByWeaponId.goldenTower).toBe(true)
    expect(state.ownedByWeaponId.chainLightning).toBe(false)
  })

  it('falls back to column C when column D is empty', () => {
    const grid = Array.from({ length: 40 }, () => Array<string>(8).fill(''))
    grid[UW_EP_V31_UNLOCKED_ROWS.spotlight - 1]![2] = 'TRUE'

    const state = uwsEpStateFromSheetGrid(grid)
    expect(state.ownedByWeaponId.spotlight).toBe(true)
  })

  it('applies imported unlock flags to workshop persisted state', () => {
    const grid = Array.from({ length: 40 }, () => Array<string>(8).fill(''))
    grid[UW_EP_V31_UNLOCKED_ROWS.deathWave - 1]![3] = 'TRUE'
    grid[UW_EP_V31_UNLOCKED_ROWS.deathWave - 1]![6] =
      '04 | 1.2s | Cost 120 ⧌ | Next 160 ⧌'

    const applied = uwsEpStateAppliedToPersisted(
      defaultWorkshopPersisted(),
      uwsEpStateFromSheetGrid(grid),
    )
    expect(workshopUltimateWeaponIsOwned(applied, 'deathWave')).toBe(true)
    expect(workshopUltimateIsActive(applied, 'deathWave')).toBe(true)
    expect(applied.deathWaveDamageLevel).toBe(4)
  })
})

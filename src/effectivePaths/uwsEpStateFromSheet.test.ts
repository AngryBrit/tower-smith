import { describe, expect, it } from 'vitest'
import { WORKSHOP_ULTIMATE_WEAPON_ORDER } from '../data/workshopUltimateData'
import { workshopUltimateIsActive, workshopUltimateWeaponIsOwned } from '../data/workshopUltimate'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { buildUwSheetUpdates } from './buildUwSheetUpdates'
import { uwsEpStateAppliedToPersisted } from './epImportAppliedToPersisted'
import { uwsEpStateFromSheetGrid } from './uwsEpStateFromSheet'
import type { UwsEpSyncState } from './uwsEpStateFromPersisted'
import {
  UW_EP_V31_LEVEL_START_ROWS,
  UW_EP_V31_UNLOCKED_COL,
  UW_EP_V31_UNLOCKED_ROWS,
} from './uwEpSheetNames'

function gridFromUwUnlockExport(state: UwsEpSyncState): string[][] {
  const grid = Array.from({ length: 40 }, () => Array<string>(8).fill(''))
  for (const entry of buildUwSheetUpdates('Master Sheet', state)) {
    const match = /!C(\d+)$/.exec(entry.range)
    if (!match) continue
    const row = Number(match[1]) - 1
    grid[row]![UW_EP_V31_UNLOCKED_COL] = String(entry.values[0]![0])
  }
  return grid
}

describe('uwsEpStateFromSheetGrid', () => {
  it('round-trips export unlock values from column C', () => {
    const state: UwsEpSyncState = {
      levels: {},
      ownedByWeaponId: Object.fromEntries(
        WORKSHOP_ULTIMATE_WEAPON_ORDER.map((id) => [id, id === 'goldenTower' || id === 'deathWave']),
      ) as UwsEpSyncState['ownedByWeaponId'],
    }
    const imported = uwsEpStateFromSheetGrid(gridFromUwUnlockExport(state))
    expect(imported.ownedByWeaponId.goldenTower).toBe(true)
    expect(imported.ownedByWeaponId.deathWave).toBe(true)
    expect(imported.ownedByWeaponId.chainLightning).toBe(false)
  })

  it('reads unlocked checkboxes from column C', () => {
    const grid = Array.from({ length: 40 }, () => Array<string>(8).fill(''))
    grid[UW_EP_V31_UNLOCKED_ROWS.goldenTower - 1]![UW_EP_V31_UNLOCKED_COL] = 'TRUE'
    grid[UW_EP_V31_UNLOCKED_ROWS.chainLightning - 1]![UW_EP_V31_UNLOCKED_COL] = 'FALSE'

    const state = uwsEpStateFromSheetGrid(grid)
    expect(state.ownedByWeaponId.goldenTower).toBe(true)
    expect(state.ownedByWeaponId.chainLightning).toBe(false)
  })

  it('falls back to column D when column C is empty', () => {
    const grid = Array.from({ length: 40 }, () => Array<string>(8).fill(''))
    grid[UW_EP_V31_UNLOCKED_ROWS.spotlight - 1]![3] = 'TRUE'

    const state = uwsEpStateFromSheetGrid(grid)
    expect(state.ownedByWeaponId.spotlight).toBe(true)
  })

  it('applies imported unlock flags to workshop persisted state', () => {
    const grid = Array.from({ length: 40 }, () => Array<string>(8).fill(''))
    grid[UW_EP_V31_UNLOCKED_ROWS.deathWave - 1]![UW_EP_V31_UNLOCKED_COL] = 'TRUE'
    grid[UW_EP_V31_LEVEL_START_ROWS.deathWave - 1]![6] =
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

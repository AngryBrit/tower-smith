import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted, sanitizeWorkshopPersisted } from '../labPresetsStorage'
import {
  workshopUltimateWeaponIsOwned,
  type WorkshopUltimateWeaponId,
} from '../data/workshopUltimate'
import { decodePlayerInfoFile } from './decodePlayerInfo'
import { mapUltimateWeaponsFromSave } from './gameUltimateWeaponMapping'

const SAMPLE = 'h:/The Tower/SaveGames/playerInfo.dat'

const EXPECTED_OWNED: readonly WorkshopUltimateWeaponId[] = [
  'goldenTower',
  'blackHole',
  'spotlight',
  'deathWave',
  'chainLightning',
]

const SHOULD_NOT_OWN: readonly WorkshopUltimateWeaponId[] = [
  'smartMissiles',
  'poisonSwamp',
  'chronoField',
  'innerLandMines',
]

describe('gameUltimateWeaponMapping', () => {
  it('maps sample save ultimate weapons to game index order', async () => {
    if (!existsSync(SAMPLE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    const ws = sanitizeWorkshopPersisted(defaultWorkshopPersisted())
    mapUltimateWeaponsFromSave(save, ws)

    for (const id of EXPECTED_OWNED) {
      expect(workshopUltimateWeaponIsOwned(ws, id), id).toBe(true)
    }
    for (const id of SHOULD_NOT_OWN) {
      expect(workshopUltimateWeaponIsOwned(ws, id), id).toBe(false)
    }
  })
})

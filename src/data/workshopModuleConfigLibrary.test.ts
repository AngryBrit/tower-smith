import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import {
  workshopModuleConfigEntry,
  workshopModuleIsOwned,
  workshopPersistedEquipModuleFromLibrary,
  workshopPersistedUnequipModule,
  workshopPersistedWithModuleConfigEffectToggle,
  workshopPersistedWithModuleConfigEntry,
} from './workshopModuleConfigLibrary'
import { submoduleEffectId } from './workshopSubmoduleCatalog'

describe('workshopModuleConfigLibrary', () => {
  it('persists unequipped module rarity and level in the library', () => {
    let ws = defaultWorkshopPersisted()
    ws = workshopPersistedWithModuleConfigEntry(ws, 'cannon', 'main', 'astralDeliverance', {
      rarity: 'legendary',
      level: 42,
    })

    expect(
      workshopModuleConfigEntry(ws, 'cannon', 'main', 'astralDeliverance'),
    ).toMatchObject({
      rarity: 'legendary',
      level: 42,
    })
    expect(ws.simCannonChassisModuleId).toBe('')
  })

  it('equips from library and syncs slot fields', () => {
    let ws = defaultWorkshopPersisted()
    ws = workshopPersistedWithModuleConfigEntry(ws, 'cannon', 'main', 'astralDeliverance', {
      rarity: 'mythic',
      level: 77,
    })
    ws = workshopPersistedEquipModuleFromLibrary(ws, 'cannon', 'main', 'astralDeliverance')

    expect(ws.simCannonChassisModuleId).toBe('astralDeliverance')
    expect(ws.simCannonChassisModuleRarity).toBe('mythic')
    expect(ws.simCannonChassisModuleLevel).toBe(77)
  })

  it('keeps library config after unequip', () => {
    let ws = defaultWorkshopPersisted()
    ws = workshopPersistedWithModuleConfigEntry(ws, 'cannon', 'main', 'astralDeliverance', {
      rarity: 'epic_plus',
      level: 15,
    })
    ws = workshopPersistedEquipModuleFromLibrary(ws, 'cannon', 'main', 'astralDeliverance')
    ws = workshopPersistedUnequipModule(ws, 'cannon', 'main')

    expect(ws.simCannonChassisModuleId).toBe('')
    expect(workshopModuleConfigEntry(ws, 'cannon', 'main', 'astralDeliverance')).toMatchObject({
      rarity: 'epic_plus',
      level: 15,
    })
  })

  it('tracks owned modules from library entries or equip state', () => {
    let ws = defaultWorkshopPersisted()
    expect(workshopModuleIsOwned(ws, 'cannon', 'astralDeliverance')).toBe(true)

    ws = {
      ...ws,
      simChassisModuleConfigs: {
        ...ws.simChassisModuleConfigs,
        cannon: {
          main: {},
          assist: {},
        },
      },
    }
    ws = workshopPersistedWithModuleConfigEntry(ws, 'cannon', 'main', 'astralDeliverance', {
      rarity: 'epic',
      level: 10,
    })
    expect(workshopModuleIsOwned(ws, 'cannon', 'astralDeliverance')).toBe(true)
    expect(workshopModuleIsOwned(ws, 'cannon', 'havocBringer')).toBe(false)

    ws = workshopPersistedEquipModuleFromLibrary(ws, 'cannon', 'main', 'havocBringer')
    expect(workshopModuleIsOwned(ws, 'cannon', 'havocBringer')).toBe(true)
  })

  it('persists sub-module effects for unequipped modules', () => {
    const attackSpeedId = submoduleEffectId('Attack Speed')
    let ws = defaultWorkshopPersisted()
    ws = workshopPersistedWithModuleConfigEffectToggle(
      ws,
      'cannon',
      'main',
      'astralDeliverance',
      attackSpeedId,
      'legendary',
      '0.12',
    )

    expect(
      workshopModuleConfigEntry(ws, 'cannon', 'main', 'astralDeliverance').submodules[
        attackSpeedId
      ],
    ).toBe('legendary')
    expect(ws.simCannonChassisModuleId).toBe('')
  })
})

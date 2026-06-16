import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { workshopPersistedWithModuleConfigEntry } from '../data/workshopModuleConfigLibrary'
import { modulesEpStateFromPersisted } from './modulesEpStateFromPersisted'

describe('modulesEpStateFromPersisted', () => {
  it('returns empty modules when none are equipped', () => {
    const state = modulesEpStateFromPersisted(defaultWorkshopPersisted())
    expect(state.modules).toEqual([])
    expect(state.sectionLevels.cannon).toEqual({ highestPrimaryLevel: 0, highestAssistLevel: 0 })
  })

  it('includes main and assist chassis modules from active tab', () => {
    const ws = defaultWorkshopPersisted()
    ws.simCannonChassisModuleId = 'astralDeliverance'
    ws.simCannonChassisModuleRarity = 'star_1'
    ws.simCannonChassisModuleLevel = 140
    ws.simCannonAssistChassisModuleId = 'amplifyingStrike'
    ws.simCannonAssistChassisModuleRarity = 'legendary_plus'
    ws.simCannonModuleLevel = 100

    const state = modulesEpStateFromPersisted(ws)
    expect(state.sectionLevels.cannon).toEqual({
      highestPrimaryLevel: 140,
      highestAssistLevel: 100,
    })
    expect(state.modules.map((m) => `${m.hubSlot}:${m.role}:${m.moduleId}`).sort()).toEqual([
      'cannon:assist:amplifyingStrike',
      'cannon:main:astralDeliverance',
    ])
  })

  it('uses equipped assist module level for section assist level', () => {
    const ws = defaultWorkshopPersisted()
    ws.simArmorAssistChassisModuleId = 'orbitalAugment'
    ws.simArmorAssistChassisModuleRarity = 'ancestral'
    ws.simArmorModuleLevel = 90

    const state = modulesEpStateFromPersisted(ws)
    expect(state.sectionLevels.armor.highestAssistLevel).toBe(90)
    expect(state.modules.find((m) => m.hubSlot === 'armor' && m.role === 'assist')?.moduleId).toBe(
      'orbitalAugment',
    )
  })

  it('collects ordered submodule picks for sync substats', () => {
    const ws = defaultWorkshopPersisted()
    ws.simCannonChassisModuleId = 'astralDeliverance'
    ws.simCannonChassisModuleRarity = 'star_1'
    ws.simCannonChassisModuleLevel = 140
    ws.simSubmoduleSelections = {
      ...ws.simSubmoduleSelections,
      cannon: {
        main: {
          'crit-chance': 'epic',
          'super-crit-multi': 'epic',
        },
        assist: {},
        mainSlots: [
          { effectId: 'crit-chance', rarity: 'epic' },
          { effectId: 'super-crit-multi', rarity: 'epic' },
          null,
          null,
          null,
          null,
          null,
          null,
        ],
      },
    }

    const main = modulesEpStateFromPersisted(ws).modules.find((m) => m.hubSlot === 'cannon' && m.role === 'main')
    expect(main?.substats).toEqual([
      { effectId: 'crit-chance', catalogLabel: 'Crit Chance [%]', rarity: 'epic' },
      { effectId: 'super-crit-multi', catalogLabel: 'Super Crit Multi', rarity: 'epic' },
    ])
  })

  it('collects substats from flat selection maps without mainSlots', () => {
    const ws = defaultWorkshopPersisted()
    ws.simGeneratorChassisModuleId = 'blackHoleDigestor'
    ws.simSubmoduleSelections = {
      ...ws.simSubmoduleSelections,
      generator: {
        main: {
          'free-attack-upgrade': 'epic',
          'free-defense-upgrade': 'epic',
        },
        assist: {},
      },
    }

    const main = modulesEpStateFromPersisted(ws).modules.find(
      (m) => m.hubSlot === 'generator' && m.role === 'main',
    )
    expect(main?.substats.map((s) => s.effectId).sort()).toEqual([
      'free-attack-upgrade',
      'free-defense-upgrade',
    ])
  })

  it('includes unassigned owned modules from simChassisModuleConfigs', () => {
    let ws = defaultWorkshopPersisted()
    ws = workshopPersistedWithModuleConfigEntry(ws, 'cannon', 'main', 'havocBringer', {
      rarity: 'legendary',
      level: 55,
    })
    ws.simCannonChassisModuleId = 'astralDeliverance'
    ws.simCannonChassisModuleRarity = 'star_1'
    ws.simCannonChassisModuleLevel = 140

    const state = modulesEpStateFromPersisted(ws)
    expect(state.modules.map((m) => `${m.hubSlot}:${m.moduleId}:${m.hubEquipped}`).sort()).toEqual([
      'cannon:astralDeliverance:true',
      'cannon:havocBringer:false',
    ])
    expect(state.modules.find((m) => m.moduleId === 'havocBringer')).toMatchObject({
      mergeTier: 'legendary',
      level: 55,
      hubEquipped: false,
    })
  })

  it('includes every owned library module across slots', () => {
    let ws = defaultWorkshopPersisted()
    ws = workshopPersistedWithModuleConfigEntry(ws, 'cannon', 'main', 'astralDeliverance', {
      rarity: 'legendary',
      level: 12,
    })
    ws = workshopPersistedWithModuleConfigEntry(ws, 'armor', 'main', 'sharpFortitude', {
      rarity: 'epic_plus',
      level: 5,
    })
    ws.simCannonChassisModuleId = 'havocBringer'
    ws.simCannonChassisModuleRarity = 'mythic_plus'
    ws.simCannonChassisModuleLevel = 99

    const state = modulesEpStateFromPersisted(ws)
    expect(state.modules.map((m) => `${m.hubSlot}:${m.moduleId}:${m.hubEquipped}`).sort()).toEqual([
      'armor:sharpFortitude:false',
      'cannon:astralDeliverance:false',
      'cannon:havocBringer:true',
    ])
  })
})

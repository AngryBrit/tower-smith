import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { modulesEpStateFromPersisted } from './modulesEpStateFromPersisted'

describe('modulesEpStateFromPersisted', () => {
  it('returns empty modules when none are equipped', () => {
    expect(modulesEpStateFromPersisted(defaultWorkshopPersisted()).modules).toEqual([])
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
    expect(state.modules.map((m) => `${m.hubSlot}:${m.role}:${m.moduleId}`).sort()).toEqual([
      'cannon:assist:amplifyingStrike',
      'cannon:main:astralDeliverance',
    ])
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
})

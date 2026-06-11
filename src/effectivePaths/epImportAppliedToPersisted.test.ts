import { describe, expect, it } from 'vitest'
import { patchWorkshopModules, selectWorkshopModulePreset } from '../data/workshopModulePresets'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { modulesEpStateAppliedToPersisted } from './epImportAppliedToPersisted'
import type { ModulesEpSyncState } from './modulesEpStateFromPersisted'
import { modulesEpDefaultSectionLevels } from './modulesEpStateFromPersisted'

const IMPORTED_CANNON: ModulesEpSyncState = {
  sectionLevels: {
    ...modulesEpDefaultSectionLevels(),
    cannon: { highestPrimaryLevel: 140, highestAssistLevel: 0 },
  },
  modules: [
    {
      moduleId: 'astralDeliverance',
      hubSlot: 'cannon',
      role: 'main',
      mergeTier: 'star_1',
      level: 140,
      substats: [],
    },
  ],
}

describe('modulesEpStateAppliedToPersisted', () => {
  it('applies imported modules over the active preset tab', () => {
    const base = patchWorkshopModules(defaultWorkshopPersisted(), {
      simCannonChassisModuleId: 'deathPenalty',
      simCannonChassisModuleRarity: 'mythic',
      simCannonChassisModuleLevel: 40,
    })

    const applied = modulesEpStateAppliedToPersisted(base, IMPORTED_CANNON)

    expect(applied.simCannonChassisModuleId).toBe('astralDeliverance')
    expect(applied.simCannonChassisModuleRarity).toBe('star_1')
    expect(applied.simCannonChassisModuleLevel).toBe(140)
    expect(applied.modulePresetSnapshots[0]?.simCannonChassisModuleId).toBe('astralDeliverance')
  })

  it('updates the active preset when not on preset 0', () => {
    const onPreset1 = selectWorkshopModulePreset(
      patchWorkshopModules(defaultWorkshopPersisted(), {
        simCannonChassisModuleId: 'deathPenalty',
        simCannonChassisModuleRarity: 'mythic',
        simCannonChassisModuleLevel: 40,
      }),
      1,
    )

    const applied = modulesEpStateAppliedToPersisted(onPreset1, IMPORTED_CANNON)

    expect(applied.moduleActivePresetIndex).toBe(1)
    expect(applied.simCannonChassisModuleId).toBe('astralDeliverance')
    expect(applied.modulePresetSnapshots[1]?.simCannonChassisModuleId).toBe('astralDeliverance')
  })
})

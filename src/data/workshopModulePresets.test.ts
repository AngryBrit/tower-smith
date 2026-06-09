import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted, resetWorkshopModules } from '../labPresetsStorage'
import {
  extractWorkshopModulePresetSnapshot,
  patchWorkshopModules,
  selectWorkshopModulePreset,
} from './workshopModulePresets'

describe('workshopModulePresets', () => {
  it('selectWorkshopModulePreset saves current tab and restores the target', () => {
    const base = defaultWorkshopPersisted()
    const withCannon = patchWorkshopModules(base, {
      simCannonChassisModuleId: 'deathPenalty',
      simCannonChassisModuleRarity: 'mythic',
      simCannonChassisModuleLevel: 40,
    })

    const switched = selectWorkshopModulePreset(withCannon, 1)
    expect(switched.moduleActivePresetIndex).toBe(1)
    expect(switched.simCannonChassisModuleId).toBe('')
    expect(switched.simCannonChassisModuleLevel).toBe(0)

    const back = selectWorkshopModulePreset(switched, 0)
    expect(back.simCannonChassisModuleId).toBe('deathPenalty')
    expect(back.simCannonChassisModuleRarity).toBe('mythic')
    expect(back.simCannonChassisModuleLevel).toBe(40)
  })

  it('patchWorkshopModules updates the active preset snapshot', () => {
    const base = defaultWorkshopPersisted()
    const next = patchWorkshopModules(base, { simCoreModuleLevel: 99 })
    expect(next.simCoreModuleLevel).toBe(99)
    expect(next.modulePresetSnapshots[0]?.simCoreModuleLevel).toBe(99)
  })

  it('resetWorkshopModules clears all preset tabs', () => {
    const before = patchWorkshopModules(defaultWorkshopPersisted(), {
      simGeneratorChassisModuleId: 'galaxyCompressor',
      simGeneratorChassisModuleRarity: 'legendary',
    })
    before.modulePresetSnapshots[2] = extractWorkshopModulePresetSnapshot(before)
    const after = resetWorkshopModules(before)
    expect(after.simGeneratorChassisModuleId).toBe('')
    expect(after.modulePresetSnapshots[2]?.simGeneratorChassisModuleId).toBe('')
  })
})

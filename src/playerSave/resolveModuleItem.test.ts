import { describe, expect, it } from 'vitest'
import { moduleItemEffectSlot, resolveModuleItemToWorkshop } from './resolveModuleItem'

describe('resolveModuleItem', () => {
  it('reads submodule effect slot from inventory row', () => {
    expect(
      moduleItemEffectSlot({
        infoIndex: 23,
        level: 1,
        rarity: 5,
        effects: [191, 161, 0, 0, 0, 0, 0, 0],
      }),
    ).toBe('generator')
  })

  it('does not map generator-fodder infoIndex 23 to armor Orbital Augment', () => {
    expect(
      resolveModuleItemToWorkshop({
        infoIndex: 23,
        level: 1,
        rarity: 5,
        effects: [191, 161, 0, 0, 0, 0, 0, 0],
      }),
    ).toBeNull()
  })

  it('maps high-tier Orbital Augment infoIndex 46 with armor substats', () => {
    expect(
      resolveModuleItemToWorkshop({
        infoIndex: 46,
        level: 60,
        rarity: 4,
        effects: [89, 83, 147, 0, 0, 0, 0, 0],
      }),
    ).toEqual({ slot: 'armor', moduleId: 'orbitalAugment' })
  })
})

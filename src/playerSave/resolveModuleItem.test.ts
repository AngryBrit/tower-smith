import { describe, expect, it } from 'vitest'
import { moduleItemEffectSlot, resolveModuleItemOwnership, resolveModuleItemToWorkshop } from './resolveModuleItem'

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

  it('does not map cross-slot fodder infoIndex 34 to generator Project Funding', () => {
    expect(
      resolveModuleItemToWorkshop({
        infoIndex: 34,
        level: 1,
        rarity: 5,
        effects: [300, 217, 0, 0, 0, 0, 0, 0],
      }),
    ).toBeNull()
  })

  it('maps high-tier Project Funding infoIndex 43 with generator substats', () => {
    expect(
      resolveModuleItemToWorkshop({
        infoIndex: 43,
        level: 101,
        rarity: 8,
        effects: [191, 185, 167, 161, 0, 0, 0, 0],
      }),
    ).toEqual({ slot: 'generator', moduleId: 'projectFunding' })
  })

  it('owns leveled modules with mixed substats when hub slot matches', () => {
    expect(
      resolveModuleItemOwnership({
        infoIndex: 38,
        level: 60,
        rarity: 5,
        effects: [229, 219, 248, 0, 0, 0, 0, 0],
      }),
    ).toEqual({ slot: 'core', moduleId: 'dimensionCore' })
  })

  it('does not own epic fodder via loose ownership', () => {
    expect(
      resolveModuleItemOwnership({
        infoIndex: 34,
        level: 1,
        rarity: 5,
        effects: [300, 217, 0, 0, 0, 0, 0, 0],
      }),
    ).toBeNull()
  })

  it('resolves Dimension Core epic main sparse indices for copy counting', () => {
    const item = {
      infoIndex: 38,
      level: 60,
      rarity: 4,
      effects: [229, 219, 248, 0, 0, 0, 0, 0],
    }
    expect(moduleItemEffectSlot(item)).toBe('core')
    expect(resolveModuleItemToWorkshop(item)).toEqual({
      slot: 'core',
      moduleId: 'dimensionCore',
    })
  })

  it('resolves Om Chip epic main sparse indices for copy counting', () => {
    const item = {
      infoIndex: 40,
      level: 60,
      rarity: 4,
      effects: [280, 227, 228, 0, 0, 0, 0, 0],
    }
    expect(moduleItemEffectSlot(item)).toBe('core')
    expect(resolveModuleItemToWorkshop(item)).toEqual({
      slot: 'core',
      moduleId: 'omChip',
    })
  })
})

import { describe, expect, it } from 'vitest'
import { formatWorkshopChassisModuleHeroStat } from './workshopChassisModuleHeroStat'
import { WORKSHOP_ARMOR_MODULES, WORKSHOP_ARMOR_MODULE_ORDER } from './workshopArmorModules'
import { WORKSHOP_CANNON_MODULES, WORKSHOP_CANNON_MODULE_ORDER } from './workshopCannonModules'
import {
  WORKSHOP_GENERATOR_MODULES,
  WORKSHOP_GENERATOR_MODULE_ORDER,
} from './workshopGeneratorModules'
import { WORKSHOP_CORE_MODULES, WORKSHOP_CORE_MODULE_ORDER } from './workshopCoreModules'

describe('formatWorkshopChassisModuleHeroStat', () => {
  it('scales cannon tower damage by module level for every module', () => {
    const ctx = { moduleLevel: 101 }
    const lines = WORKSHOP_CANNON_MODULE_ORDER.map((id) =>
      formatWorkshopChassisModuleHeroStat(
        'cannon',
        WORKSHOP_CANNON_MODULES[id],
        'mythic',
        ctx,
      ),
    )
    expect(new Set(lines).size).toBe(1)
    expect(lines[0]).toBe('x2.460 Tower Damage')
  })

  it('shows base tower damage hero mult when module level is 0', () => {
    const line = formatWorkshopChassisModuleHeroStat(
      'cannon',
      WORKSHOP_CANNON_MODULES.amplifyingStrike,
      'epic',
      { moduleLevel: 0 },
    )
    expect(line).toBe('x5 Tower Damage')
  })

  it('scales armor tower health by module level for every module', () => {
    const ctx = { moduleLevel: 100 }
    const lines = WORKSHOP_ARMOR_MODULE_ORDER.map((id) =>
      formatWorkshopChassisModuleHeroStat(
        'armor',
        WORKSHOP_ARMOR_MODULES[id],
        'legendary',
        ctx,
      ),
    )
    expect(new Set(lines).size).toBe(1)
    expect(lines[0]).toBe('x2.270 Tower Health')
  })

  it('shows base tower health hero mult when module level is 0', () => {
    const line = formatWorkshopChassisModuleHeroStat(
      'armor',
      WORKSHOP_ARMOR_MODULES.sharpFortitude,
      'legendary',
      { moduleLevel: 0 },
    )
    expect(line).toBe('x4.2 Tower Health')
  })

  it('does not stack health card or enhance on armor hero stat', () => {
    const line = formatWorkshopChassisModuleHeroStat(
      'armor',
      WORKSHOP_ARMOR_MODULES.sharpFortitude,
      'legendary',
      { moduleLevel: 100, healthMult: 2, enhanceHealthLevel: 100 },
    )
    expect(line).toBe('x2.270 Tower Health')
  })

  it('labels all armor modules as Tower Health', () => {
    for (const id of WORKSHOP_ARMOR_MODULE_ORDER) {
      const line = formatWorkshopChassisModuleHeroStat(
        'armor',
        WORKSHOP_ARMOR_MODULES[id],
        'epic',
        { moduleLevel: 60 },
      )
      expect(line.endsWith(' Tower Health')).toBe(true)
    }
  })

  it('scales generator coin bonus by module level for every module', () => {
    const ctx = { moduleLevel: 60 }
    const lines = WORKSHOP_GENERATOR_MODULE_ORDER.map((id) =>
      formatWorkshopChassisModuleHeroStat(
        'generator',
        WORKSHOP_GENERATOR_MODULES[id],
        'epic',
        ctx,
      ),
    )
    expect(new Set(lines).size).toBe(1)
    expect(lines[0]).toBe('x1.128 Coin Bonus')
  })

  it('shows base coin bonus hero mult when module level is 0', () => {
    const line = formatWorkshopChassisModuleHeroStat(
      'generator',
      WORKSHOP_GENERATOR_MODULES.blackHoleDigestor,
      'epic',
      { moduleLevel: 0 },
    )
    expect(line).toBe('x1 Coin Bonus')
  })

  it('scales core ultimate weapon damage by module level for every module', () => {
    const ctx = { moduleLevel: 101 }
    const lines = WORKSHOP_CORE_MODULE_ORDER.map((id) =>
      formatWorkshopChassisModuleHeroStat(
        'core',
        WORKSHOP_CORE_MODULES[id],
        'epic',
        ctx,
      ),
    )
    expect(new Set(lines).size).toBe(1)
    expect(lines[0]).toBe('x3.980 Ultimate Weapon Damage')
  })

  it('shows base ultimate weapon damage hero mult when module level is 0', () => {
    const line = formatWorkshopChassisModuleHeroStat(
      'core',
      WORKSHOP_CORE_MODULES.harmonyConductor,
      'epic',
      { moduleLevel: 0 },
    )
    expect(line).toBe('x8 Ultimate Weapon Damage')
  })

  it('labels all core modules as Ultimate Weapon Damage', () => {
    for (const id of WORKSHOP_CORE_MODULE_ORDER) {
      const line = formatWorkshopChassisModuleHeroStat(
        'core',
        WORKSHOP_CORE_MODULES[id],
        'epic',
        { moduleLevel: 60 },
      )
      expect(line.endsWith(' Ultimate Weapon Damage')).toBe(true)
    }
  })
})

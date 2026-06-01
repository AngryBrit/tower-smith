import { describe, expect, it } from 'vitest'
import { formatWorkshopChassisModuleHeroStat } from './workshopChassisModuleHeroStat'
import {
  formatWorkshopChassisModuleHeroStatMilli,
  WORKSHOP_CANNON_ARMOR_HERO_LV100_BY_MERGE,
  WORKSHOP_CORE_HERO_LV100_BY_MERGE,
  WORKSHOP_GENERATOR_HERO_LV100_BY_MERGE,
  WORKSHOP_MODULE_HERO_STAT_BASE_BY_MERGE,
  workshopChassisModuleHeroStatCommonMilli,
  workshopChassisModuleHeroStatMilli,
} from './workshopChassisModuleHeroStatAnchors'
import { WORKSHOP_ARMOR_MODULES } from './workshopArmorModules'
import { WORKSHOP_CANNON_MODULES } from './workshopCannonModules'
import { WORKSHOP_GENERATOR_MODULES } from './workshopGeneratorModules'
import { WORKSHOP_CORE_MODULES } from './workshopCoreModules'
import {
  WORKSHOP_CHASSIS_MODULE_MERGE_TIERS,
  type WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'

type HeroStatCase = {
  merge: WorkshopChassisModuleMergeTier
  level: number
  expected: string
}

const CANNON_ARMOR_CASES: HeroStatCase[] = [
  { merge: 'epic', level: 1, expected: 'x1.072' },
  { merge: 'epic', level: 60, expected: 'x1.150' },
  { merge: 'epic_plus', level: 1, expected: 'x1.102' },
  { merge: 'epic_plus', level: 80, expected: 'x1.356' },
  { merge: 'legendary', level: 1, expected: 'x1.132' },
  { merge: 'legendary', level: 100, expected: 'x2.270' },
  { merge: 'legendary_plus', level: 1, expected: 'x1.162' },
  { merge: 'legendary_plus', level: 100, expected: 'x2.300' },
  { merge: 'mythic', level: 1, expected: 'x1.202' },
  { merge: 'mythic', level: 100, expected: 'x2.340' },
  { merge: 'mythic_plus', level: 1, expected: 'x1.252' },
  { merge: 'mythic_plus', level: 100, expected: 'x2.390' },
  { merge: 'ancestral', level: 1, expected: 'x1.302' },
  { merge: 'ancestral', level: 100, expected: 'x2.440' },
  { merge: 'star_1', level: 1, expected: 'x1.314' },
  { merge: 'star_1', level: 100, expected: 'x2.498' },
  { merge: 'star_1', level: 160, expected: 'x8.530' },
  { merge: 'star_5', level: 1, expected: 'x1.362' },
  { merge: 'star_5', level: 100, expected: 'x2.728' },
  { merge: 'star_5', level: 160, expected: 'x9.688' },
  { merge: 'mythic_plus', level: 101, expected: 'x2.460' },
]

const GENERATOR_CASES: HeroStatCase[] = [
  { merge: 'epic', level: 1, expected: 'x1.019' },
  { merge: 'epic', level: 60, expected: 'x1.128' },
  { merge: 'epic_plus', level: 1, expected: 'x1.023' },
  { merge: 'epic_plus', level: 80, expected: 'x1.192' },
  { merge: 'legendary', level: 1, expected: 'x1.026' },
  { merge: 'legendary', level: 100, expected: 'x1.275' },
  { merge: 'legendary_plus', level: 1, expected: 'x1.029' },
  { merge: 'legendary_plus', level: 100, expected: 'x1.278' },
  { merge: 'legendary_plus', level: 120, expected: 'x1.378' },
  { merge: 'mythic', level: 1, expected: 'x1.033' },
  { merge: 'mythic', level: 100, expected: 'x1.282' },
  { merge: 'mythic', level: 140, expected: 'x1.502' },
  { merge: 'mythic_plus', level: 1, expected: 'x1.036' },
  { merge: 'mythic_plus', level: 100, expected: 'x1.285' },
  { merge: 'mythic_plus', level: 160, expected: 'x1.665' },
  { merge: 'ancestral', level: 1, expected: 'x1.041' },
  { merge: 'ancestral', level: 100, expected: 'x1.290' },
  { merge: 'ancestral', level: 200, expected: 'x2.070' },
  { merge: 'star_1', level: 160, expected: 'x1.697' },
  { merge: 'star_2', level: 1, expected: 'x1.044' },
  { merge: 'star_2', level: 100, expected: 'x1.313' },
  { merge: 'star_2', level: 160, expected: 'x1.724' },
  { merge: 'star_3', level: 1, expected: 'x1.046' },
  { merge: 'star_3', level: 100, expected: 'x1.325' },
  { merge: 'star_3', level: 160, expected: 'x1.750' },
  { merge: 'star_4', level: 160, expected: 'x1.776' },
  { merge: 'star_4', level: 200, expected: 'x2.241' },
  { merge: 'star_5', level: 200, expected: 'x2.284' },
  { merge: 'star_5', level: 1, expected: 'x1.049' },
  { merge: 'star_5', level: 100, expected: 'x1.348' },
  { merge: 'star_1', level: 216, expected: 'x2.279' },
  { merge: 'star_1', level: 217, expected: 'x2.290' },
  { merge: 'star_1', level: 218, expected: 'x2.300' },
  { merge: 'star_1', level: 219, expected: 'x2.310' },
  { merge: 'star_1', level: 220, expected: 'x2.321' },
  { merge: 'star_2', level: 236, expected: 'x2.544' },
  { merge: 'star_2', level: 237, expected: 'x2.555' },
  { merge: 'star_2', level: 238, expected: 'x2.566' },
  { merge: 'star_2', level: 239, expected: 'x2.568' },
  { merge: 'star_2', level: 240, expected: 'x2.588' },
  { merge: 'star_3', level: 257, expected: 'x2.837' },
  { merge: 'star_3', level: 258, expected: 'x2.848' },
  { merge: 'star_3', level: 259, expected: 'x2.859' },
  { merge: 'star_3', level: 260, expected: 'x2.870' },
  { merge: 'star_4', level: 276, expected: 'x3.123' },
  { merge: 'star_4', level: 278, expected: 'x3.146' },
  { merge: 'star_4', level: 279, expected: 'x3.158' },
  { merge: 'star_4', level: 280, expected: 'x3.169' },
  { merge: 'star_5', level: 300, expected: 'x3.484' },
]

const CORE_CASES: HeroStatCase[] = [
  { merge: 'epic', level: 1, expected: 'x1.130' },
  { merge: 'epic', level: 60, expected: 'x1.539' },
  { merge: 'epic_plus', level: 1, expected: 'x1.160' },
  { merge: 'epic_plus', level: 80, expected: 'x2.178' },
  { merge: 'legendary', level: 1, expected: 'x1.210' },
  { merge: 'legendary', level: 100, expected: 'x3.850' },
  { merge: 'legendary_plus', level: 1, expected: 'x1.260' },
  { merge: 'legendary_plus', level: 100, expected: 'x3.900' },
  { merge: 'mythic', level: 1, expected: 'x1.310' },
  { merge: 'mythic', level: 100, expected: 'x3.950' },
  { merge: 'mythic_plus', level: 1, expected: 'x1.360' },
  { merge: 'mythic_plus', level: 100, expected: 'x4.000' },
  { merge: 'ancestral', level: 1, expected: 'x1.410' },
  { merge: 'ancestral', level: 100, expected: 'x4.050' },
  { merge: 'star_4', level: 100, expected: 'x4.538' },
  { merge: 'star_5', level: 100, expected: 'x4.660' },
]

describe('formatWorkshopChassisModuleHeroStat', () => {
  it.each(CANNON_ARMOR_CASES)(
    'cannon $merge at lvl $level → $expected Tower Damage',
    ({ merge, level, expected }) => {
      const line = formatWorkshopChassisModuleHeroStat(
        'cannon',
        WORKSHOP_CANNON_MODULES.amplifyingStrike,
        merge,
        { moduleLevel: level },
      )
      expect(line).toBe(`${expected} Tower Damage`)
    },
  )

  it.each(CANNON_ARMOR_CASES.filter(({ level }) => level !== 101))(
    'armor $merge at lvl $level → $expected Tower Health',
    ({ merge, level, expected }) => {
      const line = formatWorkshopChassisModuleHeroStat(
        'armor',
        WORKSHOP_ARMOR_MODULES.sharpFortitude,
        merge,
        { moduleLevel: level },
      )
      expect(line).toBe(`${expected} Tower Health`)
    },
  )

  it.each(GENERATOR_CASES)(
    'generator $merge at lvl $level → $expected Coin Bonus',
    ({ merge, level, expected }) => {
      const line = formatWorkshopChassisModuleHeroStat(
        'generator',
        WORKSHOP_GENERATOR_MODULES.blackHoleDigestor,
        merge,
        { moduleLevel: level },
      )
      expect(line).toBe(`${expected} Coin Bonus`)
    },
  )

  it.each(CORE_CASES)(
    'core $merge at lvl $level → $expected Ultimate Weapon Damage',
    ({ merge, level, expected }) => {
      const line = formatWorkshopChassisModuleHeroStat(
        'core',
        WORKSHOP_CORE_MODULES.harmonyConductor,
        merge,
        { moduleLevel: level },
      )
      expect(line).toBe(`${expected} Ultimate Weapon Damage`)
    },
  )

  it('derives Lv.1 from DVT base stat (1 + base) for every merge tier', () => {
    for (const merge of WORKSHOP_CHASSIS_MODULE_MERGE_TIERS) {
      for (const slot of ['cannon', 'generator', 'core'] as const) {
        const base = WORKSHOP_MODULE_HERO_STAT_BASE_BY_MERGE[merge][slot]
        const milli = workshopChassisModuleHeroStatMilli(slot, merge, 1)
        expect(formatWorkshopChassisModuleHeroStatMilli(milli)).toBe((1 + base).toFixed(3))
      }
    }
  })

  it('matches Inventory Common tier at Lv.20 via DVT Increase/lvl', () => {
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatCommonMilli('cannon', 20))).toBe(
      '1.050',
    )
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatCommonMilli('generator', 20))).toBe(
      '1.030',
    )
  })

  it('clamps stored module level to merge max for hero stat display', () => {
    const atCap = formatWorkshopChassisModuleHeroStat(
      'generator',
      WORKSHOP_GENERATOR_MODULES.blackHoleDigestor,
      'epic',
      { moduleLevel: 60 },
    )
    const aboveCap = formatWorkshopChassisModuleHeroStat(
      'generator',
      WORKSHOP_GENERATOR_MODULES.blackHoleDigestor,
      'epic',
      { moduleLevel: 200 },
    )
    expect(aboveCap).toBe(atCap)
  })

  it('shows x1.000 Coin Bonus for generator at module level 0', () => {
    expect(
      formatWorkshopChassisModuleHeroStat(
        'generator',
        WORKSHOP_GENERATOR_MODULES.blackHoleDigestor,
        'epic',
        { moduleLevel: 0 },
      ),
    ).toBe('x1.000 Coin Bonus')
  })

  it('covers every merge tier in DVT tables', () => {
    for (const merge of WORKSHOP_CHASSIS_MODULE_MERGE_TIERS) {
      expect(WORKSHOP_MODULE_HERO_STAT_BASE_BY_MERGE[merge]).toBeDefined()
      if (merge === 'rare' || merge === 'rare_plus') continue
      expect(WORKSHOP_CANNON_ARMOR_HERO_LV100_BY_MERGE[merge]).toBeDefined()
      expect(WORKSHOP_GENERATOR_HERO_LV100_BY_MERGE[merge]).toBeDefined()
      expect(WORKSHOP_CORE_HERO_LV100_BY_MERGE[merge]).toBeDefined()
    }
  })
})

import { describe, expect, it } from 'vitest'
import {
  formatWorkshopChassisModuleHeroStatMilli,
  workshopChassisModuleHeroStatCommonMilli,
  workshopChassisModuleHeroStatMilli,
  WORKSHOP_MODULE_HERO_STAT_BASE_BY_MERGE,
  WORKSHOP_MODULE_HERO_STAT_INCREASE_BRACKETS,
} from './workshopChassisModuleHeroStatAnchors'

describe('workshopChassisModuleHeroStatAnchors (DVT_Modules)', () => {
  it('exports DVT base stat and increase brackets', () => {
    expect(WORKSHOP_MODULE_HERO_STAT_BASE_BY_MERGE.epic.cannon).toBe(0.072)
    expect(WORKSHOP_MODULE_HERO_STAT_BASE_BY_MERGE.epic.generator).toBe(0.019)
    expect(WORKSHOP_MODULE_HERO_STAT_INCREASE_BRACKETS[0]?.generator).toBe(0.001)
    expect(WORKSHOP_MODULE_HERO_STAT_INCREASE_BRACKETS.find((b) => b.fromLevel === 100)?.cannon).toBe(0.07)
  })

  it('computes Lv.1 as 1 + baseStat', () => {
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('generator', 'epic', 1))).toBe(
      '1.019',
    )
  })

  it('uses hybrid generator curve above Lv.100 (Inventory Mythic+ Lv.160)', () => {
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('generator', 'epic', 60))).toBe(
      '1.128',
    )
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('generator', 'mythic_plus', 100))).toBe(
      '1.285',
    )
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('generator', 'mythic_plus', 160))).toBe(
      '1.665',
    )
  })

  it('scales Ancestral 1★ post-L100 growth (Inventory Lv.160)', () => {
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('cannon', 'mythic_plus', 160))).toBe(
      '8.190',
    )
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('cannon', 'star_1', 160))).toBe(
      '8.530',
    )
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('cannon', 'star_5', 160))).toBe(
      '9.688',
    )
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('generator', 'star_1', 160))).toBe(
      '1.697',
    )
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('generator', 'star_2', 160))).toBe(
      '1.724',
    )
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('generator', 'star_3', 160))).toBe(
      '1.750',
    )
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('generator', 'star_4', 200))).toBe(
      '2.241',
    )
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('generator', 'star_5', 200))).toBe(
      '2.284',
    )
  })

  it('adds Increase/lvl steps above Lv.100 (Planner Mythic+ cannon Lv.101)', () => {
    expect(
      formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatMilli('cannon', 'mythic_plus', 101)),
    ).toBe('2.460')
  })

  it('matches Inventory Common cannon/generator at Lv.20', () => {
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatCommonMilli('cannon', 20))).toBe(
      '1.050',
    )
    expect(formatWorkshopChassisModuleHeroStatMilli(workshopChassisModuleHeroStatCommonMilli('generator', 20))).toBe(
      '1.030',
    )
  })
})

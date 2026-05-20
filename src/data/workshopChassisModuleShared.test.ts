import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_CHASSIS_MODULE_MAX_LEVEL_BY_MERGE,
  clampWorkshopChassisModuleLevel,
  coerceChassisMergeTierForModuleLevel,
  defaultMergeTierForEffectTier,
  sanitizeChassisModuleMergeTier,
  workshopChassisModuleEffectTier,
  workshopChassisModuleMaxLevel,
} from './workshopChassisModuleShared'

describe('workshopChassisModuleMaxLevel', () => {
  it('matches wiki merge-tier caps (Rare 30 … 5★ 300)', () => {
    expect(WORKSHOP_CHASSIS_MODULE_MAX_LEVEL_BY_MERGE).toEqual({
      rare: 30,
      rare_plus: 40,
      epic: 60,
      epic_plus: 80,
      legendary: 100,
      legendary_plus: 120,
      mythic: 140,
      mythic_plus: 160,
      ancestral: 200,
      star_1: 220,
      star_2: 240,
      star_3: 260,
      star_4: 280,
      star_5: 300,
    })
    expect(workshopChassisModuleMaxLevel('mythic_plus')).toBe(160)
    expect(workshopChassisModuleMaxLevel('star_5')).toBe(300)
  })

  it('clamps module level to the selected merge tier max', () => {
    expect(clampWorkshopChassisModuleLevel(101, 'epic')).toBe(60)
    expect(clampWorkshopChassisModuleLevel(85, 'epic_plus')).toBe(80)
    expect(clampWorkshopChassisModuleLevel(-3, 'legendary')).toBe(0)
    expect(clampWorkshopChassisModuleLevel(250.9, 'star_5')).toBe(250)
  })

  it('maps merge tiers to wiki effect value columns', () => {
    expect(workshopChassisModuleEffectTier('rare_plus')).toBe('epic')
    expect(workshopChassisModuleEffectTier('legendary_plus')).toBe('legendary')
    expect(workshopChassisModuleEffectTier('star_3')).toBe('ancestral')
  })

  it('coerces legacy ancestral + high level to 5★ (was max 300)', () => {
    expect(sanitizeChassisModuleMergeTier('ancestral')).toBe('ancestral')
    expect(coerceChassisMergeTierForModuleLevel('ancestral', 250)).toBe('star_5')
    expect(coerceChassisMergeTierForModuleLevel('ancestral', 200)).toBe('ancestral')
    expect(sanitizeChassisModuleMergeTier('epic_plus')).toBe('epic_plus')
  })

  it('defaults catalog ancestral column to 5★ merge tier', () => {
    expect(defaultMergeTierForEffectTier('ancestral')).toBe('star_5')
  })
})

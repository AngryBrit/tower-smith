import { describe, expect, it } from 'vitest'
import {
  workshopChassisModuleBorderImageUrl,
  workshopChassisModuleDedicatedImageUrl,
  workshopChassisModuleHasDedicatedArt,
  workshopChassisModuleImagePath,
  workshopChassisModuleImageUrl,
} from './workshopModuleImages'

describe('workshopModuleImages', () => {
  it('resolves known cannon art', () => {
    expect(workshopChassisModuleImagePath('cannon', 'deathPenalty', 'epic')).toBe(
      'cannon/cannon_epic_2.webp',
    )
  })

  it('falls back to rarity placeholder for missing art', () => {
    expect(workshopChassisModuleImagePath('cannon', 'unknownModule', 'mythic')).toBe(
      'mod_mythic.webp',
    )
  })

  it('returns null url when no module equipped', () => {
    expect(workshopChassisModuleImageUrl('armor', null, 'epic')).toBeNull()
  })

  it('builds absolute url for equipped module', () => {
    const url = workshopChassisModuleImageUrl('armor', 'antiCubePortal', 'legendary')
    expect(url).toContain('modules/armor/armor_epic_2.webp')
  })

  it('detects dedicated art vs placeholder-only modules', () => {
    expect(workshopChassisModuleHasDedicatedArt('cannon', 'havocBringer')).toBe(true)
    expect(workshopChassisModuleHasDedicatedArt('cannon', 'shrinkRay')).toBe(true)
    expect(workshopChassisModuleDedicatedImageUrl('cannon', 'shrinkRay')).toContain(
      'modules/cannon/Shrink%20Ray.webp',
    )
  })

  it('builds border url for empty and merge tiers', () => {
    expect(workshopChassisModuleBorderImageUrl('cannon', 'empty')).toContain(
      'modules/borders/cannon/mf_cannon_empty.webp',
    )
    expect(workshopChassisModuleBorderImageUrl('cannon', 'epic_plus')).toContain(
      'modules/borders/cannon/mf_cannon_epic_plus.webp',
    )
    expect(workshopChassisModuleBorderImageUrl('core', 'star_3')).toContain(
      'modules/borders/generator/mf_generator_ancestral.webp',
    )
    expect(workshopChassisModuleBorderImageUrl('generator', 'empty')).toContain(
      'modules/borders/core/mf_core_empty.webp',
    )
    expect(workshopChassisModuleBorderImageUrl('cannon', 'legendary')).toContain(
      'modules/borders/cannon/mf_cannon_legendary.webp',
    )
  })
})

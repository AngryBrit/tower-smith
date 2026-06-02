import { describe, expect, it } from 'vitest'
import {
  GAME_MODULE_INFO_INDEX_TO_WORKSHOP_ID,
  gameWorkshopChassisModuleId,
} from './gameModuleIndex'

const ALL_NAMED_MODULE_IDS = [
  'havocBringer',
  'deathPenalty',
  'beingAnnihilator',
  'astralDeliverance',
  'shrinkRay',
  'amplifyingStrike',
  'wormholeRedirector',
  'antiCubePortal',
  'spaceDisplacer',
  'negativeMassProjector',
  'sharpFortitude',
  'orbitalAugment',
  'blackHoleDigestor',
  'pulsarHarvester',
  'galaxyCompressor',
  'singularityHarness',
  'projectFunding',
  'restorativeBonus',
  'multiverseNexus',
  'dimensionCore',
  'harmonyConductor',
  'omChip',
  'primordialCollapse',
  'magneticHook',
] as const

describe('gameModuleIndex', () => {
  it('maps every named chassis module at least once', () => {
    const mapped = new Set(GAME_MODULE_INFO_INDEX_TO_WORKSHOP_ID.filter(Boolean))
    for (const id of ALL_NAMED_MODULE_IDS) {
      expect(mapped.has(id)).toBe(true)
    }
  })

  it('maps unverified guess indices to the expected slot', () => {
    expect(gameWorkshopChassisModuleId(11, 'cannon')).toBe('shrinkRay')
    expect(gameWorkshopChassisModuleId(19, 'armor')).toBe('wormholeRedirector')
    expect(gameWorkshopChassisModuleId(21, 'armor')).toBe('spaceDisplacer')
    expect(gameWorkshopChassisModuleId(39, 'core')).toBe('harmonyConductor')
    expect(gameWorkshopChassisModuleId(40, 'core')).toBe('omChip')
  })

  it('maps high-tier Shrink Ray on cannon (infoIndex 41)', () => {
    expect(gameWorkshopChassisModuleId(41, 'cannon')).toBe('shrinkRay')
    expect(gameWorkshopChassisModuleId(41, 'core')).toBeNull()
  })

  it('maps named cannon, armor, generator, and core indices when slot matches', () => {
    expect(gameWorkshopChassisModuleId(45, 'cannon')).toBe('amplifyingStrike')
    expect(gameWorkshopChassisModuleId(42, 'armor')).toBe('sharpFortitude')
    expect(gameWorkshopChassisModuleId(28, 'generator')).toBe('pulsarHarvester')
    expect(gameWorkshopChassisModuleId(48, 'core')).toBe('primordialCollapse')
  })

  it('returns null for cross-slot ids', () => {
    expect(gameWorkshopChassisModuleId(45, 'armor')).toBeNull()
    expect(gameWorkshopChassisModuleId(42, 'cannon')).toBeNull()
    expect(gameWorkshopChassisModuleId(28, 'core')).toBeNull()
    expect(gameWorkshopChassisModuleId(48, 'generator')).toBeNull()
  })
})

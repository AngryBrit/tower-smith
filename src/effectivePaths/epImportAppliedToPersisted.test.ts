import { describe, expect, it } from 'vitest'
import { workshopModuleConfigEntry } from '../data/workshopModuleConfigLibrary'
import { patchWorkshopModules, selectWorkshopModulePreset } from '../data/workshopModulePresets'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { modulesEpStateAppliedToPersisted, uwsEpStateAppliedToPersisted } from './epImportAppliedToPersisted'
import type { ModulesEpSyncState } from './modulesEpStateFromPersisted'
import { modulesEpDefaultSectionLevels } from './modulesEpStateFromPersisted'
import type { UwsEpSyncState } from './uwsEpStateFromPersisted'
import { workshopUltimateIsActive, workshopUltimateWeaponIsOwned } from '../data/workshopUltimate'
import { flattenTowerBuild, splitTowerBuild } from '../towerBuildStorage'

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
      hubEquipped: true,
      substats: [],
    },
  ],
}

describe('uwsEpStateAppliedToPersisted', () => {
  it('turns on ultimate weapons that are unlocked on the EP sheet', () => {
    const state: UwsEpSyncState = {
      levels: { goldenTowerBonusLevel: 3 },
      ownedByWeaponId: {
        chainLightning: false,
        smartMissiles: false,
        deathWave: false,
        chronoField: false,
        innerLandMines: false,
        goldenTower: true,
        poisonSwamp: false,
        blackHole: false,
        spotlight: true,
      },
    }
    const applied = uwsEpStateAppliedToPersisted(defaultWorkshopPersisted(), state)
    expect(workshopUltimateWeaponIsOwned(applied, 'goldenTower')).toBe(true)
    expect(workshopUltimateIsActive(applied, 'goldenTower')).toBe(true)
    expect(workshopUltimateWeaponIsOwned(applied, 'spotlight')).toBe(true)
    expect(workshopUltimateIsActive(applied, 'spotlight')).toBe(true)
    expect(workshopUltimateWeaponIsOwned(applied, 'chainLightning')).toBe(false)
    expect(workshopUltimateIsActive(applied, 'chainLightning')).toBe(false)
  })

  it('turns on weapons that are owned via imported upgrade levels when D is empty', () => {
    const state: UwsEpSyncState = {
      levels: { deathWaveDamageLevel: 4 },
      ownedByWeaponId: {
        chainLightning: false,
        smartMissiles: false,
        deathWave: false,
        chronoField: false,
        innerLandMines: false,
        goldenTower: false,
        poisonSwamp: false,
        blackHole: false,
        spotlight: false,
      },
    }
    const applied = uwsEpStateAppliedToPersisted(defaultWorkshopPersisted(), state)
    expect(workshopUltimateWeaponIsOwned(applied, 'deathWave')).toBe(true)
    expect(workshopUltimateIsActive(applied, 'deathWave')).toBe(true)
  })

  it('keeps active on after workspace split and flatten', () => {
    const state: UwsEpSyncState = {
      levels: { goldenTowerBonusLevel: 2 },
      ownedByWeaponId: {
        chainLightning: false,
        smartMissiles: false,
        deathWave: false,
        chronoField: false,
        innerLandMines: false,
        goldenTower: true,
        poisonSwamp: false,
        blackHole: false,
        spotlight: false,
      },
    }
    const applied = uwsEpStateAppliedToPersisted(defaultWorkshopPersisted(), state)
    const flat = flattenTowerBuild(splitTowerBuild(applied))
    expect(workshopUltimateIsActive(flat, 'goldenTower')).toBe(true)
  })
})

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

  it('stores unassigned inventory modules in simChassisModuleConfigs', () => {
    const state: ModulesEpSyncState = {
      sectionLevels: modulesEpDefaultSectionLevels(),
      modules: [
        {
          moduleId: 'astralDeliverance',
          hubSlot: 'cannon',
          role: 'main',
          mergeTier: 'star_1',
          level: 140,
          hubEquipped: true,
          substats: [],
        },
        {
          moduleId: 'havocBringer',
          hubSlot: 'cannon',
          role: 'main',
          mergeTier: 'legendary',
          level: 0,
          hubEquipped: false,
          substats: [
            { effectId: 'attack-speed', catalogLabel: 'Attack Speed', rarity: 'rare' },
          ],
        },
      ],
    }

    const applied = modulesEpStateAppliedToPersisted(defaultWorkshopPersisted(), state)

    expect(applied.simCannonChassisModuleId).toBe('astralDeliverance')
    expect(workshopModuleConfigEntry(applied, 'cannon', 'main', 'havocBringer')).toMatchObject({
      rarity: 'legendary',
      level: 0,
    })
    expect(
      workshopModuleConfigEntry(applied, 'cannon', 'main', 'havocBringer').submodules,
    ).toHaveProperty('attack-speed', 'rare')
  })
})

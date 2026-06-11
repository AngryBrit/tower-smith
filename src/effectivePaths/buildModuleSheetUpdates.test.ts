import { describe, expect, it } from 'vitest'
import {
  formatWorkshopChassisModuleHeroStatMilli,
  workshopChassisModuleHeroStatMilli,
} from '../data/workshopChassisModuleHeroStatAnchors'
import type { WorkshopChassisModuleMergeTier } from '../data/workshopChassisModuleShared'
import type { WorkshopAssistModuleSlot } from '../data/workshopSimModules'
import {
  buildModuleSheetUpdates,
  countModulesEpEquippedSlots,
  countModulesEpEquippedSubstats,
} from './buildModuleSheetUpdates'
import { legacyModuleEpInventoryLayout } from './moduleEpInventoryLayoutFromSheet'
import type { ModulesEpSyncState } from './modulesEpStateFromPersisted'

function heroStat(
  slot: WorkshopAssistModuleSlot,
  merge: WorkshopChassisModuleMergeTier,
  level: number,
): string {
  const milli = workshopChassisModuleHeroStatMilli(slot, merge, level)
  return `x${formatWorkshopChassisModuleHeroStatMilli(milli)}`
}

const LEGACY_LAYOUT = legacyModuleEpInventoryLayout()

const SAMPLE_STATE: ModulesEpSyncState = {
  modules: [
    {
      moduleId: 'astralDeliverance',
      hubSlot: 'cannon',
      role: 'main',
      mergeTier: 'star_1',
      level: 140,
      substats: [
        { effectId: 'crit-chance', catalogLabel: 'Crit Chance [%]', rarity: 'epic' },
        { effectId: 'super-crit-multi', catalogLabel: 'Super Crit Multi', rarity: 'epic' },
        { effectId: 'crit-factor', catalogLabel: 'Crit Factor', rarity: 'epic' },
      ],
    },
    {
      moduleId: 'antiCubePortal',
      hubSlot: 'armor',
      role: 'main',
      mergeTier: 'ancestral',
      level: 140,
      substats: [],
    },
    {
      moduleId: 'blackHoleDigestor',
      hubSlot: 'generator',
      role: 'main',
      mergeTier: 'star_1',
      level: 100,
      substats: [
        { effectId: 'free-attack-upgrade', catalogLabel: 'Free Attack Upgrade [%]', rarity: 'epic' },
        { effectId: 'free-defense-upgrade', catalogLabel: 'Free Defense Upgrade [%]', rarity: 'epic' },
        { effectId: 'free-utility-upgrade', catalogLabel: 'Free Utility Upgrade [%]', rarity: 'epic' },
      ],
    },
    {
      moduleId: 'multiverseNexus',
      hubSlot: 'core',
      role: 'main',
      mergeTier: 'star_1',
      level: 100,
      substats: [],
    },
  ],
}

describe('buildModuleSheetUpdates', () => {
  it('writes equipped module rarity, level, stat, and main substats (legacy layout)', () => {
    const updates = buildModuleSheetUpdates('Inventory', SAMPLE_STATE, LEGACY_LAYOUT)
    const byRange = Object.fromEntries(updates.map((u) => [u.range, u.values[0]![0]]))

    expect(byRange["'Inventory'!F2"]).toBe('Ancestral 1*')
    expect(byRange["'Inventory'!G2"]).toBe(140)
    expect(byRange["'Inventory'!H2"]).toBe(heroStat('cannon', 'star_1', 140))

    expect(byRange["'Inventory'!F3"]).toBe('Critical Chance')
    expect(byRange["'Inventory'!G3"]).toBe('Epic')

    expect(byRange["'Inventory'!F6"]).toBe('Ancestral')
    expect(byRange["'Inventory'!G6"]).toBe(140)

    expect(byRange["'Inventory'!F10"]).toBe('Ancestral 1*')
    expect(byRange["'Inventory'!G10"]).toBe(100)
    expect(byRange["'Inventory'!F11"]).toBe('Free Attack Upgrade')

    expect(byRange["'Inventory'!F14"]).toBe('Ancestral 1*')
    expect(byRange["'Inventory'!H14"]).toBe(heroStat('core', 'star_1', 100))
  })

  it('writes assist modules to Any Other with spare label (legacy layout)', () => {
    const state: ModulesEpSyncState = {
      modules: [
        {
          moduleId: 'amplifyingStrike',
          hubSlot: 'cannon',
          role: 'assist',
          mergeTier: 'legendary_plus',
          level: 100,
          substats: [
            { effectId: 'attack-speed', catalogLabel: 'Attack Speed', rarity: 'epic' },
          ],
        },
      ],
    }
    const byRange = Object.fromEntries(
      buildModuleSheetUpdates('Inventory', state, LEGACY_LAYOUT).map((u) => [u.range, u.values[0]![0]]),
    )

    expect(byRange["'Inventory'!AJ2"]).toBe('Legendary+')
    expect(byRange["'Inventory'!AJ3"]).toBe('Spare Amplifying Strike')
    expect(byRange["'Inventory'!AJ4"]).toBe('Attack Speed')
  })

  it('counts equipped inventory columns', () => {
    expect(countModulesEpEquippedSlots(SAMPLE_STATE)).toBe(4)
  })

  it('counts equipped submodule effects across modules', () => {
    expect(countModulesEpEquippedSubstats(SAMPLE_STATE)).toBe(6)
  })
})

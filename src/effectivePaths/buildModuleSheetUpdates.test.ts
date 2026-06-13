import { describe, expect, it } from 'vitest'
import {
  buildModuleSheetUpdates,
  countModulesEpEquippedSlots,
  countModulesEpEquippedSubstats,
} from './buildModuleSheetUpdates'
import { legacyModuleEpInventoryLayout } from './moduleEpInventoryLayoutFromSheet'
import {
  modulesEpDefaultSectionLevels,
  type ModulesEpSyncState,
} from './modulesEpStateFromPersisted'

const LEGACY_LAYOUT = legacyModuleEpInventoryLayout()

const SAMPLE_STATE: ModulesEpSyncState = {
  sectionLevels: {
    ...modulesEpDefaultSectionLevels(),
    cannon: { highestPrimaryLevel: 140, highestAssistLevel: 100 },
    armor: { highestPrimaryLevel: 140, highestAssistLevel: 0 },
    generator: { highestPrimaryLevel: 100, highestAssistLevel: 0 },
    core: { highestPrimaryLevel: 100, highestAssistLevel: 0 },
  },
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
  it('clears unequipped module columns before writing (legacy layout)', () => {
    const state: ModulesEpSyncState = {
      sectionLevels: modulesEpDefaultSectionLevels(),
      modules: [
        {
          moduleId: 'astralDeliverance',
          hubSlot: 'cannon',
          role: 'main',
          mergeTier: 'rare',
          level: 20,
          substats: [],
        },
      ],
    }
    const byRange = Object.fromEntries(
      buildModuleSheetUpdates('Inventory', state, LEGACY_LAYOUT).map((u) => [u.range, u.values[0]![0]]),
    )

    expect(byRange["'Inventory'!D2"]).toBe(0)
    expect(byRange["'Inventory'!D3"]).toBe(0)
    expect(byRange["'Inventory'!D6"]).toBe(0)
    expect(byRange["'Inventory'!D21"]).toBe(0)
    expect(byRange["'Inventory'!F2"]).toBe('Rare')
    expect(byRange["'Inventory'!G2"]).toBeUndefined()
    expect(byRange["'Inventory'!K2"]).toBe('None')
    expect(byRange["'Inventory'!L2"]).toBeUndefined()
    expect(byRange["'Inventory'!G7"]).toBe('')
    expect(byRange["'Inventory'!P2"]).toBe('None')
    expect(byRange["'Inventory'!F7"]).toBe('')
  })

  it('writes equipped module rarity and main substats (legacy layout)', () => {
    const updates = buildModuleSheetUpdates('Inventory', SAMPLE_STATE, LEGACY_LAYOUT)
    const byRange = Object.fromEntries(updates.map((u) => [u.range, u.values[0]![0]]))

    expect(byRange["'Inventory'!D2"]).toBe(140)
    expect(byRange["'Inventory'!D3"]).toBe(100)
    expect(byRange["'Inventory'!F2"]).toBe('Ancestral 1*')
    expect(byRange["'Inventory'!G2"]).toBeUndefined()
    expect(byRange["'Inventory'!H2"]).toBeUndefined()

    expect(byRange["'Inventory'!F3"]).toBe('Critical Chance')
    expect(byRange["'Inventory'!G3"]).toBe('Epic')
    expect(byRange["'Inventory'!F4"]).toBe('Super Crit Multi')
    expect(byRange["'Inventory'!F5"]).toBe('Critical Factor')
    expect(byRange["'Inventory'!G5"]).toBe('Epic')

    expect(byRange["'Inventory'!F6"]).toBe('Ancestral')

    expect(byRange["'Inventory'!F10"]).toBe('Ancestral 1*')
    expect(byRange["'Inventory'!G10"]).toBeUndefined()
    expect(byRange["'Inventory'!F11"]).toBe('Free Attack Upgrade')

    expect(byRange["'Inventory'!F14"]).toBe('Ancestral 1*')
    expect(byRange["'Inventory'!H14"]).toBeUndefined()
  })

  it('writes named assist modules to their dedicated column (legacy layout)', () => {
    const state: ModulesEpSyncState = {
      sectionLevels: modulesEpDefaultSectionLevels(),
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

    expect(byRange["'Inventory'!AE2"]).toBe('Legendary+')
    expect(byRange["'Inventory'!AE4"]).toBe('Attack Speed')
    expect(byRange["'Inventory'!AE3"]).toBe('')
    expect(byRange["'Inventory'!AF3"]).toBe('')
  })

  it('counts equipped inventory columns', () => {
    expect(countModulesEpEquippedSlots(SAMPLE_STATE)).toBe(4)
  })

  it('counts equipped submodule effects across modules', () => {
    expect(countModulesEpEquippedSubstats(SAMPLE_STATE)).toBe(6)
  })
})

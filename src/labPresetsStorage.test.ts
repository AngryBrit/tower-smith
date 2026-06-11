import { describe, expect, it } from 'vitest'
import {
  buildLabPresetsPayload,
  clearBuildWorkspace,
  defaultWorkshopPersisted,
  extractLabWorkspaceFromPresetsFile,
  parseLabPresetsFile,
  maxWorkshopBots,
  maxWorkshopCardStars,
  resetWorkshopCards,
  resetWorkshopModules,
  resetWorkshopRelics,
  resetWorkshopUltimates,
  resetWorkshopUpgradeLevels,
  sanitizeWorkshopPersisted,
} from './labPresetsStorage'
import { workshopBotIsOwned, workshopBotStatDisplay } from './data/workshopBots'

describe('parseLabPresetsFile', () => {
  it('accepts a valid v1 file', () => {
    const raw = {
      v: 1,
      activePresetId: 'a',
      presets: [{ id: 'a', name: 'A', levelOverrides: { '0-0': 1 } }],
      scratchOverrides: { '0-1': 2 },
    }
    expect(parseLabPresetsFile(raw)).toEqual(raw)
  })

  it('rejects invalid preset entries', () => {
    expect(
      parseLabPresetsFile({
        v: 1,
        presets: [{ id: 1, name: 'x', levelOverrides: {} }],
        scratchOverrides: {},
      }),
    ).toBeNull()
  })
})

describe('resetWorkshopCards', () => {
  it('clears card state but keeps workshop upgrade levels', () => {
    const before = {
      ...defaultWorkshopPersisted(),
      damageLevel: 42,
      enhanceDamageLevel: 3,
      simAssistModuleSlot: 'armor' as const,
      simRelicsBonusFraction: 0.25,
      cardStars: { ...defaultWorkshopPersisted().cardStars, damage: 5 },
      cardEquipSlots: 8,
    }
    before.cardPresetLoadouts[0] = ['damage', 'health']
    const after = resetWorkshopCards(before)
    expect(after.damageLevel).toBe(42)
    expect(after.enhanceDamageLevel).toBe(3)
    expect(after.simAssistModuleSlot).toBe('armor')
    expect(after.simRelicsBonusFraction).toBe(0.25)
    expect(after.cardStars.damage).toBe(0)
    expect(after.cardEquipSlots).toBe(1)
    expect(after.cardPresetLoadouts[0]).toEqual([])
    expect(after.simDamageCardStars).toBe(0)
  })
})

describe('maxWorkshopBots', () => {
  it('owns all bots and maxes upgrades and Bot+ levels', () => {
    const after = maxWorkshopBots(defaultWorkshopPersisted())
    expect(after.flameOwned).toBe(true)
    expect(after.flameBotActive).toBe(true)
    expect(after.flameBotDamageLevel).toBeGreaterThan(0)
    expect(after.flameBotBurningGroundUnlocked).toBe(true)
    expect(after.flameBotBurningGroundLevel).toBeGreaterThanOrEqual(0)
  })
})

describe('maxWorkshopCardStars', () => {
  it('sets every card to max stars without clearing loadouts', () => {
    const before = {
      ...defaultWorkshopPersisted(),
      cardStars: { ...defaultWorkshopPersisted().cardStars, damage: 1 },
    }
    before.cardPresetLoadouts[0] = ['damage']
    const after = maxWorkshopCardStars(before)
    expect(after.cardStars.damage).toBe(7)
    expect(after.cardPresetLoadouts[0]).toEqual(['damage'])
  })
})

describe('resetWorkshopModules', () => {
  it('clears module state but keeps workshop upgrades and cards', () => {
    const before = {
      ...defaultWorkshopPersisted(),
      damageLevel: 42,
      cardStars: { ...defaultWorkshopPersisted().cardStars, damage: 5 },
      simAssistModuleSlot: 'armor' as const,
      simCannonModuleLevel: 12,
      simCannonChassisModuleId: 'deathPenalty',
      simCannonChassisModuleRarity: 'mythic' as const,
      simSubmoduleSelections: {
        ...defaultWorkshopPersisted().simSubmoduleSelections,
        cannon: {
          main: { 'attack-speed': 'legendary' as const },
          assist: {},
        },
      },
      simAttackSpeedModuleSubEffect: 1,
    }
    const after = resetWorkshopModules(before)
    expect(after.damageLevel).toBe(42)
    expect(after.cardStars.damage).toBe(5)
    expect(after.simAssistModuleSlot).toBe('cannon')
    expect(after.simCannonModuleLevel).toBe(0)
    expect(after.simCannonChassisModuleId).toBe('')
    expect(after.simCannonChassisModuleRarity).toBe('epic')
    expect(after.simSubmoduleSelections.cannon).toEqual({ main: {}, assist: {} })
    expect(after.simAttackSpeedModuleSubEffect).toBe(0)
  })
})

describe('resetWorkshopRelics', () => {
  it('clears relic ownership and bonus but keeps cards and workshop levels', () => {
    const before = {
      ...defaultWorkshopPersisted(),
      damageLevel: 42,
      cardStars: { ...defaultWorkshopPersisted().cardStars, damage: 5 },
      relicOwnedIds: ['t_iv_harmonic', 't_xiv_arcane'],
      simRelicsBonusFraction: 0.12,
    }
    const after = resetWorkshopRelics(before)
    expect(after.damageLevel).toBe(42)
    expect(after.cardStars.damage).toBe(5)
    expect(after.relicOwnedIds).toEqual([])
    expect(after.simRelicsBonusFraction).toBe(0)
  })
})

describe('resetWorkshopUltimates', () => {
  it('clears ultimate fields but keeps upgrade levels and cards', () => {
    const before = {
      ...defaultWorkshopPersisted(),
      damageLevel: 42,
      smartMissilesDamageLevel: 5,
      smartMissilesOwned: true,
      smartMissilesActive: true,
      ultimatePlusSmartMissilesCoverFireLevel: 3,
      cardStars: { ...defaultWorkshopPersisted().cardStars, damage: 5 },
    }
    const after = resetWorkshopUltimates(before)
    expect(after.damageLevel).toBe(42)
    expect(after.cardStars.damage).toBe(5)
    expect(after.smartMissilesDamageLevel).toBe(0)
    expect(after.smartMissilesOwned).toBe(false)
    expect(after.smartMissilesActive).toBe(true)
    expect(after.ultimatePlusSmartMissilesCoverFireLevel).toBe(-1)
  })
})

describe('resetWorkshopUpgradeLevels', () => {
  it('clears upgrade levels but keeps cards and modules sim', () => {
    const before = {
      ...defaultWorkshopPersisted(),
      damageLevel: 42,
      enhanceDamageLevel: 3,
      cardStars: { ...defaultWorkshopPersisted().cardStars, damage: 5 },
      simAssistModuleSlot: 'armor' as const,
      simAttackSpeedModuleSubEffect: 12,
    }
    const after = resetWorkshopUpgradeLevels(before)
    expect(after.damageLevel).toBe(0)
    expect(after.enhanceDamageLevel).toBe(0)
    expect(after.cardStars.damage).toBe(5)
    expect(after.simAssistModuleSlot).toBe('armor')
    expect(after.simAttackSpeedModuleSubEffect).toBe(12)
    expect(after.simDamageCardStars).toBe(0)
  })
})

describe('clearBuildWorkspace', () => {
  it('clears each build domain while preserving workshop UI prefs', () => {
    const before = maxWorkshopBots(
      maxWorkshopCardStars({
        ...defaultWorkshopPersisted(),
        mainTab: 'cards',
        category: 'defense',
        multiplier: 5,
        hideMaxed: true,
        relicOwnedIds: ['relic-a'],
        simRelicsBonusFraction: 0.25,
        damageLevel: 42,
      }),
    )
    const after = clearBuildWorkspace(before)

    expect(after.mainTab).toBe('cards')
    expect(after.category).toBe('defense')
    expect(after.multiplier).toBe(5)
    expect(after.hideMaxed).toBe(true)
    expect(after.damageLevel).toBe(0)
    expect(after.cardStars.damage).toBe(0)
    expect(after.relicOwnedIds).toEqual([])
    expect(after.simRelicsBonusFraction).toBe(0)
    expect(workshopBotIsOwned(after, 'flame')).toBe(false)
  })
})

describe('extractLabWorkspaceFromPresetsFile', () => {
  const def = defaultWorkshopPersisted()

  it('uses active preset levels and workshop when set', () => {
    const parsed = parseLabPresetsFile({
      v: 1,
      activePresetId: 'a',
      presets: [
        {
          id: 'a',
          name: 'A',
          levelOverrides: { '0-0': 2 },
          workshop: def,
        },
      ],
      scratchOverrides: { '0-0': 1 },
    })
    expect(parsed).not.toBeNull()
    const ws = extractLabWorkspaceFromPresetsFile(parsed!)
    expect(ws.levelOverrides).toEqual({ '0-0': 2 })
    expect(ws.workshopPersisted.mainTab).toBe(def.mainTab)
  })

  it('uses scratch when no active preset', () => {
    const parsed = parseLabPresetsFile({
      v: 1,
      activePresetId: null,
      presets: [],
      scratchOverrides: { '1-1': 4 },
      scratchWorkshop: def,
    })
    expect(parsed).not.toBeNull()
    const ws = extractLabWorkspaceFromPresetsFile(parsed!)
    expect(ws.levelOverrides).toEqual({ '1-1': 4 })
    expect(ws.workshopPersisted).toBe(ws.scratchWorkshopPersisted)
  })
})

describe('buildLabPresetsPayload', () => {
  const def = defaultWorkshopPersisted()

  it('merges active preset levels into presets array', () => {
    const p = buildLabPresetsPayload(
      'a',
      [{ id: 'a', name: 'A', levelOverrides: { '0-0': 0 } }],
      { '0-0': 5 },
      {},
      def,
      def,
    )
    expect(p.presets[0].levelOverrides).toEqual({ '0-0': 5 })
    expect(p.presets[0].workshop).toEqual(def)
    expect(p.scratchOverrides).toEqual({})
    expect(p.scratchWorkshop).toEqual(def)
  })

  it('writes scratch when no active preset', () => {
    const p = buildLabPresetsPayload(null, [], { '1-1': 3 }, {}, def, def)
    expect(p.scratchOverrides).toEqual({ '1-1': 3 })
    expect(p.scratchWorkshop).toEqual(def)
  })
})

describe('sanitizeWorkshopPersisted', () => {
  it('fills missing bot levels and legacy workshop category', () => {
    const ws = sanitizeWorkshopPersisted({ category: 'bots', hideMaxed: true })
    expect(ws.category).toBe('attack')
    expect(ws.hideMaxed).toBe(true)
    expect(ws.flameBotDamageLevel).toBe(0)
    expect(() => workshopBotStatDisplay('flameBotDamageLevel', ws.flameBotDamageLevel)).not.toThrow()
  })
})

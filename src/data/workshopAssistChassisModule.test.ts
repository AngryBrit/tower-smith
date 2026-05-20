import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted, type WorkshopPersistedV1 } from '../labPresetsStorage'
import {
  assistModuleConflictsWithMain,
  mainModuleConflictsWithAssist,
  sanitizeAssistModuleIdAgainstMain,
  clampAssistStoneEfficiency,
  workshopAssistChassisModuleSelection,
} from './workshopAssistChassisModule'

describe('workshopAssistChassisModule', () => {
  it('defaults assist slots locked until purchased', () => {
    const ws = defaultWorkshopPersisted()
    expect(workshopAssistChassisModuleSelection(ws, 'cannon')).toMatchObject({
      unlocked: false,
      moduleId: null,
      rarity: 'epic',
      uniqueRarity: 'epic',
      mainStoneEfficiency: 1,
      subStoneEfficiency: 1,
      stoneEfficiency: 1,
    })
  })

  it('migrates legacy single stone efficiency to main and sub', () => {
    const {
      simCannonAssistMainStoneEfficiency: _m,
      simCannonAssistSubStoneEfficiency: _s,
      ...rest
    } = defaultWorkshopPersisted()
    const ws = { ...rest, simCannonAssistStoneEfficiency: 12 } as WorkshopPersistedV1
    expect(workshopAssistChassisModuleSelection(ws, 'cannon')).toMatchObject({
      mainStoneEfficiency: 12,
      subStoneEfficiency: 12,
    })
  })

  it('mainModuleConflictsWithAssist mirrors assist vs main id check', () => {
    const ws: WorkshopPersistedV1 = {
      ...defaultWorkshopPersisted(),
      simCannonAssistUnlocked: true,
      simCannonChassisModuleId: 'deathPenalty',
      simCannonAssistChassisModuleId: 'astralDeliverance',
    }
    expect(mainModuleConflictsWithAssist('cannon', ws, 'astralDeliverance')).toBe(true)
    expect(mainModuleConflictsWithAssist('cannon', ws, 'deathPenalty')).toBe(false)
  })

  it('sanitizeAssistModuleIdAgainstMain drops assist when same as main', () => {
    const ws: WorkshopPersistedV1 = {
      ...defaultWorkshopPersisted(),
      simCannonAssistUnlocked: true,
      simCannonChassisModuleId: 'deathPenalty',
      simCannonAssistChassisModuleId: 'deathPenalty',
    }
    expect(sanitizeAssistModuleIdAgainstMain(ws, 'cannon', 'deathPenalty')).toBeNull()
    expect(
      workshopAssistChassisModuleSelection(ws, 'cannon').moduleId,
    ).toBeNull()
  })

  it('detects duplicate main/assist module names', () => {
    const ws: WorkshopPersistedV1 = {
      ...defaultWorkshopPersisted(),
      simCannonAssistUnlocked: true,
      simCannonChassisModuleId: 'deathPenalty',
      simCannonAssistChassisModuleId: 'astralDeliverance',
    }
    expect(assistModuleConflictsWithMain('cannon', ws, 'deathPenalty')).toBe(true)
    expect(assistModuleConflictsWithMain('cannon', ws, 'astralDeliverance')).toBe(false)
  })

  it('keeps unique rarity separate from equipped module tier', () => {
    const ws: WorkshopPersistedV1 = {
      ...defaultWorkshopPersisted(),
      simCannonAssistUnlocked: true,
      simCannonAssistChassisModuleRarity: 'legendary',
      simCannonAssistUniqueRarity: 'mythic',
    }
    expect(workshopAssistChassisModuleSelection(ws, 'cannon')).toMatchObject({
      rarity: 'legendary',
      uniqueRarity: 'mythic',
    })
  })

  it('clamps stone efficiency to 0–70', () => {
    expect(clampAssistStoneEfficiency(0)).toBe(0)
    expect(clampAssistStoneEfficiency(71)).toBe(70)
    expect(clampAssistStoneEfficiency(34)).toBe(34)
  })
})

import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted, type WorkshopPersistedV1 } from '../labPresetsStorage'
import {
  assistModuleConflictsWithMain,
  assistStoneEfficiencyPercentFromLevel,
  mainModuleConflictsWithAssist,
  sanitizeAssistModuleIdAgainstMain,
  clampAssistStoneEfficiency,
  clampAssistSubmoduleEfficiencyPercent,
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
      mainStoneEfficiency: 0,
      subStoneEfficiency: 0,
      mainStoneEfficiencyPercent: 1,
      subStoneEfficiencyPercent: 1,
      stoneEfficiency: 0,
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
      mainStoneEfficiency: 11,
      subStoneEfficiency: 11,
      mainStoneEfficiencyPercent: 12,
      subStoneEfficiencyPercent: 12,
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

  it('clamps stone efficiency level to 0–69', () => {
    expect(clampAssistStoneEfficiency(0)).toBe(0)
    expect(clampAssistStoneEfficiency(71)).toBe(69)
    expect(clampAssistStoneEfficiency(34)).toBe(34)
  })

  it('maps stone efficiency level to display percent (first 1% is free)', () => {
    expect(assistStoneEfficiencyPercentFromLevel(0)).toBe(1)
    expect(assistStoneEfficiencyPercentFromLevel(29)).toBe(30)
    expect(assistStoneEfficiencyPercentFromLevel(69)).toBe(70)
  })

  it('clamps combined sub stone + SE lab efficiency to 0–100', () => {
    expect(clampAssistSubmoduleEfficiencyPercent(0)).toBe(0)
    expect(clampAssistSubmoduleEfficiencyPercent(70)).toBe(70)
    expect(clampAssistSubmoduleEfficiencyPercent(100)).toBe(100)
    expect(clampAssistSubmoduleEfficiencyPercent(101)).toBe(100)
  })
})

import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { submoduleEffectId } from './workshopSubmoduleCatalog'
import {
  assistSubmoduleSubEfficiencyPercent,
  scaleAssistSubmoduleRawValue,
} from './workshopAssistSubmoduleScale'
import { buildWorkshopSubmoduleBonuses } from './workshopSubmoduleBonuses'
import { defaultWorkshopSubmoduleSelections } from './workshopSubmoduleSelection'
import { CANNON_ATTACK_SPEED_EFFECT_ID } from './workshopSubmoduleSelection'

describe('workshopAssistSubmoduleScale', () => {
  it('floors scaled percent sub-stats to whole integers', () => {
    expect(
      scaleAssistSubmoduleRawValue(3, submoduleEffectId('Crit Chance [%]'), 70),
    ).toBe(2)
  })

  it('scales sub-stats by sub stone + substats lab %', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      simCannonAssistUnlocked: true,
      simCannonAssistChassisModuleId: 'deathPenalty',
      simCannonAssistSubStoneEfficiency: 50,
    }
    expect(assistSubmoduleSubEfficiencyPercent(ws, 'cannon', null, {})).toBe(50)
    expect(
      scaleAssistSubmoduleRawValue(6, submoduleEffectId('Crit Chance [%]'), 50),
    ).toBe(3)
  })

  it('floors quantity sub-stats at partial efficiency', () => {
    expect(
      scaleAssistSubmoduleRawValue(
        3,
        submoduleEffectId('Multishot Targets'),
        33,
      ),
    ).toBe(0)
    expect(
      scaleAssistSubmoduleRawValue(
        3,
        submoduleEffectId('Multishot Targets'),
        34,
      ),
    ).toBe(1)
  })

  it('applies scaled assist bonuses to workshop stats when context provided', () => {
    const selections = defaultWorkshopSubmoduleSelections()
    selections.cannon.main[submoduleEffectId('Crit Chance [%]')] = 'legendary'
    selections.cannon.assist[submoduleEffectId('Crit Chance [%]')] = 'common'
    const ws = {
      ...defaultWorkshopPersisted(),
      simCannonAssistUnlocked: true,
      simCannonAssistChassisModuleId: 'deathPenalty',
      simCannonAssistSubStoneEfficiency: 50,
      simSubmoduleSelections: selections,
    }
    const ctx = { ws, research: null, labOverrides: {} }
    const bonuses = buildWorkshopSubmoduleBonuses(selections, ctx)
    expect(bonuses.attack.critChancePercentPoints).toBe(7)
  })

  it('ignores assist picks when assist module not equipped', () => {
    const selections = defaultWorkshopSubmoduleSelections()
    selections.cannon.assist[CANNON_ATTACK_SPEED_EFFECT_ID] = 'ancestral'
    const ws = {
      ...defaultWorkshopPersisted(),
      simCannonAssistUnlocked: false,
      simSubmoduleSelections: selections,
    }
    const ctx = { ws, research: null, labOverrides: {} }
    const bonuses = buildWorkshopSubmoduleBonuses(selections, ctx)
    expect(bonuses.attack.critChancePercentPoints).toBeUndefined()
  })
})

import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { loadResearchFixture } from '../test/researchFixture'
import type { ResearchData } from '../types/research'
import { submoduleEffectId } from './workshopSubmoduleCatalog'
import {
  assistSubmoduleSubEfficiencyPercent,
  scaleAssistSubmoduleRawValue,
} from './workshopAssistSubmoduleScale'
import { buildWorkshopSubmoduleBonuses } from './workshopSubmoduleBonuses'
import { defaultWorkshopSubmoduleSelections } from './workshopSubmoduleSelection'
import { CANNON_ATTACK_SPEED_EFFECT_ID } from './workshopSubmoduleSelection'
import { workshopUltimateStatDisplay } from './workshopUltimate'

function coreSubstatsLabOverride(research: ResearchData, level: number): Record<string, number> {
  for (let si = 0; si < research.sections.length; si++) {
    const section = research.sections[si]!
    if (section.sectionSlug !== 'modules') continue
    for (let ii = 0; ii < section.items.length; ii++) {
      if (section.items[ii]!.name === 'Assist Module Substats - Core') {
        return { [`${si}-${ii}`]: level }
      }
    }
  }
  throw new Error('Assist Module Substats - Core not found')
}

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

  it('allows combined sub stone + substats lab efficiency up to 100%', () => {
    const cooldownId = submoduleEffectId('Poison Swamp - Cooldown [s]')
    const durationId = submoduleEffectId('Poison Swamp - Duration [s]')
    expect(scaleAssistSubmoduleRawValue(-10, cooldownId, 70)).toBe(-7)
    expect(scaleAssistSubmoduleRawValue(10, durationId, 70)).toBe(7)
    expect(scaleAssistSubmoduleRawValue(-10, cooldownId, 100)).toBe(-10)
    expect(scaleAssistSubmoduleRawValue(10, durationId, 100)).toBe(10)
  })

  it('applies core assist SE lab to poison swamp ultimate display', () => {
    const research = loadResearchFixture()
    const selections = defaultWorkshopSubmoduleSelections()
    selections.core.assist[submoduleEffectId('Poison Swamp - Cooldown [s]')] = 'ancestral'
    selections.core.assist[submoduleEffectId('Poison Swamp - Duration [s]')] = 'ancestral'
    const ws = {
      ...defaultWorkshopPersisted(),
      simCoreAssistUnlocked: true,
      simCoreAssistChassisModuleId: 'multiverseNexus',
      simCoreAssistSubStoneEfficiency: 70,
      simSubmoduleSelections: selections,
    }
    const labOverrides = coreSubstatsLabOverride(research, 30)
    const ctx = { ws, research, labOverrides }
    const bonuses = buildWorkshopSubmoduleBonuses(selections, ctx)
    expect(assistSubmoduleSubEfficiencyPercent(ws, 'core', research, labOverrides)).toBe(100)
    expect(bonuses.ultimate.poisonSwampCooldownLevel).toBe(-10)
    expect(bonuses.ultimate.poisonSwampDurationLevel).toBe(10)
    expect(
      workshopUltimateStatDisplay(
        'poisonSwampCooldownLevel',
        15,
        bonuses.ultimate.poisonSwampCooldownLevel ?? 0,
      ),
    ).toBe('40s')
    expect(
      workshopUltimateStatDisplay(
        'poisonSwampDurationLevel',
        13,
        bonuses.ultimate.poisonSwampDurationLevel ?? 0,
      ),
    ).toBe('105s')
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

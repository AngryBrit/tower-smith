import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { CANNON_ATTACK_SPEED_EFFECT_ID } from './workshopSubmoduleSelection'
import {
  buildWorkshopSubmoduleBonuses,
  submoduleValueForEffectId,
} from './workshopSubmoduleBonuses'
import { submoduleEffectId } from './workshopSubmoduleCatalog'
import { workshopUltimateStatDisplay } from './workshopUltimate'
import { enrichAttackLabDisplayOptsWithSubmodules } from './workshopSubmoduleWorkshopDisplay'
import { workshopCriticalChanceStatDisplay } from './workshopCriticalChance'
import { defaultWorkshopSubmoduleSelections } from './workshopSubmoduleSelection'

describe('workshopSubmoduleBonuses', () => {
  it('reads cannon crit chance from selections', () => {
    const selections = defaultWorkshopSubmoduleSelections()
    selections.cannon.main[submoduleEffectId('Crit Chance [%]')] = 'legendary'
    expect(
      submoduleValueForEffectId(
        selections.cannon.main,
        'cannon',
        submoduleEffectId('Crit Chance [%]'),
      ),
    ).toBe(6)
    const bonuses = buildWorkshopSubmoduleBonuses(selections)
    expect(bonuses.attack.critChancePercentPoints).toBe(6)
  })

  it('sums main and assist crit chance with assist scaled by efficiency', () => {
    const selections = defaultWorkshopSubmoduleSelections()
    selections.cannon.main[submoduleEffectId('Crit Chance [%]')] = 'common'
    selections.cannon.assist[submoduleEffectId('Crit Chance [%]')] = 'rare'
    const ws = {
      ...defaultWorkshopPersisted(),
      simCannonAssistUnlocked: true,
      simCannonAssistChassisModuleId: 'deathPenalty',
      simCannonAssistSubStoneEfficiency: 70,
      simSubmoduleSelections: selections,
    }
    const bonuses = buildWorkshopSubmoduleBonuses(selections, {
      ws,
      research: null,
      labOverrides: {},
    })
    // main common +2; assist rare +3 at max sub stone 70% → floor(2.1) = +2
    expect(bonuses.attack.critChancePercentPoints).toBe(4)
  })

  it('merges cannon bonuses into attack lab display opts', () => {
    const selections = defaultWorkshopSubmoduleSelections()
    selections.cannon.main[submoduleEffectId('Crit Chance [%]')] = 'common'
    const enriched = enrichAttackLabDisplayOptsWithSubmodules({}, selections)
    expect(enriched?.criticalChanceCardPercentPoints).toBe(2)
    expect(
      workshopCriticalChanceStatDisplay(10, enriched?.criticalChanceCardPercentPoints ?? 0),
    ).toBe('13.00%')
  })

  it('maps core golden tower cooldown to ultimate display', () => {
    const selections = defaultWorkshopSubmoduleSelections()
    selections.core.main[submoduleEffectId('Golden Tower - Cooldown [s]')] = 'legendary'
    const bonuses = buildWorkshopSubmoduleBonuses(selections)
    expect(bonuses.ultimate.goldenTowerCooldownLevel).toBe(-5)
    const base = workshopUltimateStatDisplay('goldenTowerCooldownLevel', 20)
    const withSub = workshopUltimateStatDisplay(
      'goldenTowerCooldownLevel',
      20,
      bonuses.ultimate.goldenTowerCooldownLevel ?? 0,
    )
    expect(withSub).not.toBe(base)
  })

  it('keeps attack speed via persisted sim field (cannon row)', () => {
    const selections = defaultWorkshopSubmoduleSelections()
    selections.cannon.main[CANNON_ATTACK_SPEED_EFFECT_ID] = 'ancestral'
    expect(
      submoduleValueForEffectId(
        selections.cannon.main,
        'cannon',
        CANNON_ATTACK_SPEED_EFFECT_ID,
      ),
    ).toBe(5)
  })
})

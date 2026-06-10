import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from '../labPresetsStorage'
import { loadResearchFixture } from '../test/researchFixture'
import type { ResearchData } from '../types/research'
import { submoduleEffectId } from './workshopSubmoduleCatalog'
import {
  assistSubmodulePickerSlotText,
  assistSubmoduleSubEfficiencyPercent,
  scaleAssistSubmoduleRawValue,
} from './workshopAssistSubmoduleScale'
import { buildWorkshopSubmoduleBonuses } from './workshopSubmoduleBonuses'
import {
  defaultWorkshopSubmoduleSelections,
  selectionMapFromOrderedSlots,
} from './workshopSubmoduleSelection'
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

  it('formats Max Recovery assist picks as proportional × with 2 dp', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      simGeneratorAssistUnlocked: true,
      simGeneratorAssistChassisModuleId: 'pulsarHarvester',
      simGeneratorAssistSubStoneEfficiency: 19,
    }
    const ctx = { ws, research: null, labOverrides: {} }
    expect(
      assistSubmodulePickerSlotText(
        '0.4',
        'Max Recovery',
        submoduleEffectId('Max Recovery'),
        ctx,
        'generator',
      ),
    ).toBe('+0.08x Max Recovery')
    expect(
      scaleAssistSubmoduleRawValue(
        0.4,
        submoduleEffectId('Max Recovery'),
        19,
      ),
    ).toBeCloseTo(0.076, 6)
  })

  it('formats assist picker percent lines with one decimal', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      simGeneratorAssistUnlocked: true,
      simGeneratorAssistChassisModuleId: 'pulsarHarvester',
      simGeneratorAssistSubStoneEfficiency: 20,
    }
    const ctx = { ws, research: null, labOverrides: {} }
    expect(
      assistSubmodulePickerSlotText(
        '11',
        'Package Chance [%]',
        submoduleEffectId('Package Chance [%]'),
        ctx,
        'generator',
      ),
    ).toBe('+2.2% Package Chance')
    expect(
      assistSubmodulePickerSlotText(
        '11',
        'Package Chance [%]',
        submoduleEffectId('Package Chance [%]'),
        {
          ws: { ...ws, simGeneratorAssistSubStoneEfficiency: 19 },
          research: null,
          labOverrides: {},
        },
        'generator',
      ),
    ).toBe('+2.09% Package Chance')
    expect(
      assistSubmodulePickerSlotText(
        '11',
        'Package Chance [%]',
        submoduleEffectId('Package Chance [%]'),
        {
          ws: {
            ...ws,
            simGeneratorAssistSubStoneEfficiency: 19,
            simGeneratorAssistUniqueRarity: 'legendary' as const,
          },
          research: null,
          labOverrides: {},
        },
        'generator',
      ),
    ).toBe('+2.2% Package Chance')
    expect(
      assistSubmodulePickerSlotText(
        '8',
        'Enemy Attack Level Skip [%]',
        submoduleEffectId('Enemy Attack Level Skip [%]'),
        ctx,
        'generator',
      ),
    ).toBe('+1.6% Enemy Attack Level Skip')
  })

  it('formats Primordial Collapse assist core picker like in-game (petethered)', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      simCoreAssistUnlocked: true,
      simCoreAssistChassisModuleId: 'primordialCollapse',
      simCoreAssistUniqueRarity: 'epic' as const,
      simCoreAssistSubStoneEfficiency: 19,
    }
    const ctx = { ws, research: null, labOverrides: {} }
    expect(
      assistSubmodulePickerSlotText(
        '-3',
        'Black Hole - Cooldown [s]',
        submoduleEffectId('Black Hole - Cooldown [s]'),
        ctx,
        'core',
      ),
    ).toBe('-0.6s Black Hole - Cooldown')
    expect(
      assistSubmodulePickerSlotText(
        '4',
        'Golden Tower - Bonus',
        submoduleEffectId('Golden Tower - Bonus'),
        ctx,
        'core',
      ),
    ).toBe('+0.8 Golden Tower - Bonus')
    expect(
      assistSubmodulePickerSlotText(
        '15',
        'Spotlight - Angle*',
        submoduleEffectId('Spotlight - Angle*'),
        ctx,
        'core',
      ),
    ).toBe('+3° Spotlight - Angle')
    expect(
      assistSubmodulePickerSlotText(
        '-8',
        'Poison Swamp - Cooldown [s]',
        submoduleEffectId('Poison Swamp - Cooldown [s]'),
        ctx,
        'core',
      ),
    ).toBe('-1.6s Poison Swamp - Cooldown')
  })

  it('formats Space Displacer assist armor picker like in-game (petethered)', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      simArmorAssistUnlocked: true,
      simArmorAssistChassisModuleId: 'spaceDisplacer',
      simArmorAssistUniqueRarity: 'mythic' as const,
      simArmorAssistSubStoneEfficiency: 24,
    }
    const ctx = { ws, research: null, labOverrides: {} }
    expect(
      assistSubmodulePickerSlotText(
        '0.75',
        'Land Mine Radius',
        submoduleEffectId('Land Mine Radius'),
        ctx,
        'armor',
      ),
    ).toBe('+0.19 Land Mine Radius')
    expect(
      assistSubmodulePickerSlotText(
        '20',
        'Health Regen [%]',
        submoduleEffectId('Health Regen [%]'),
        ctx,
        'armor',
      ),
    ).toBe('+5% Health Regen')
    expect(
      assistSubmodulePickerSlotText(
        '9',
        'Land Mine Chance [%]',
        submoduleEffectId('Land Mine Chance [%]'),
        ctx,
        'armor',
      ),
    ).toBe('+2.25% Land Mine Chance')
  })

  it('adds unique-effect tier level to assist picker scaling (petethered Pulsar Harvester)', () => {
    const ws = {
      ...defaultWorkshopPersisted(),
      simGeneratorAssistUnlocked: true,
      simGeneratorAssistChassisModuleId: 'pulsarHarvester',
      simGeneratorAssistUniqueRarity: 'legendary' as const,
      simGeneratorAssistSubStoneEfficiency: 19,
    }
    const ctx = { ws, research: null, labOverrides: {} }
    expect(assistSubmoduleSubEfficiencyPercent(ws, 'generator', null, {})).toBe(19)
    expect(
      assistSubmodulePickerSlotText(
        '11',
        'Package Chance [%]',
        submoduleEffectId('Package Chance [%]'),
        ctx,
        'generator',
      ),
    ).toBe('+2.2% Package Chance')
    expect(
      assistSubmodulePickerSlotText(
        '8',
        'Enemy Attack Level Skip [%]',
        submoduleEffectId('Enemy Attack Level Skip [%]'),
        ctx,
        'generator',
      ),
    ).toBe('+1.6% Enemy Attack Level Skip')
    expect(
      assistSubmodulePickerSlotText(
        '8',
        'Enemy Health Level Skip [%]',
        submoduleEffectId('Enemy Health Level Skip [%]'),
        ctx,
        'generator',
      ),
    ).toBe('+1.6% Enemy Health Level Skip')
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
      simCannonModuleLevel: 1,
      simCannonChassisModuleLevel: 1,
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
      simCoreModuleLevel: 1,
      simCoreChassisModuleLevel: 1,
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

  it('does not apply assist max recovery below slot 4 unlock level (petethered Pulsar Harvester)', () => {
    const assistSlots = [
      { effectId: 'package-chance', rarity: 'mythic' as const },
      { effectId: 'enemy-attack-level-skip', rarity: 'ancestral' as const },
      { effectId: 'enemy-health-level-skip', rarity: 'ancestral' as const },
      { effectId: 'max-recovery', rarity: 'epic' as const },
      null,
      null,
      null,
      null,
    ]
    const selections = defaultWorkshopSubmoduleSelections()
    selections.generator.assistSlots = assistSlots
    selections.generator.assist = selectionMapFromOrderedSlots(assistSlots)
    const ws = {
      ...defaultWorkshopPersisted(),
      simGeneratorAssistUnlocked: true,
      simGeneratorAssistChassisModuleId: 'pulsarHarvester',
      simGeneratorAssistChassisModuleRarity: 'star_2' as const,
      simGeneratorModuleLevel: 66,
      simGeneratorAssistSubStoneEfficiency: 19,
      simSubmoduleSelections: selections,
    }
    const ctx = { ws, research: null, labOverrides: {} }
    const bonuses = buildWorkshopSubmoduleBonuses(selections, ctx)
    expect(bonuses.utility.maxRecoveryAdd).toBeUndefined()
    expect(bonuses.utility.packageChancePercentPoints).toBe(2)
    expect(bonuses.utility.enemyAttackSkipPercentPoints).toBe(1)
    expect(bonuses.utility.enemyHealthSkipPercentPoints).toBe(1)
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

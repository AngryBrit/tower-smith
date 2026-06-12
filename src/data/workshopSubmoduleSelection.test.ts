import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted, sanitizeWorkshopPersisted } from '../labPresetsStorage'
import { submoduleEffectId } from './workshopSubmoduleCatalog'
import {
  CANNON_ATTACK_SPEED_EFFECT_ID,
  cannonSubmoduleAttackSpeedFromSelections,
  defaultWorkshopSubmoduleSelections,
  defaultWorkshopSubmoduleSlotSelections,
  parseSubmoduleSelectionsJson,
  sanitizeSubmoduleSelectionMap,
  sanitizeSubmoduleSelections,
  toggleSubmoduleSelection,
  totalCannonAttackSpeedFromSelections,
  workshopPersistedWithSubmoduleSelections,
} from './workshopSubmoduleSelection'

describe('workshopSubmoduleSelection', () => {
  it('builds stable effect ids from labels', () => {
    expect(submoduleEffectId('Attack Speed')).toBe('attack-speed')
    expect(submoduleEffectId('Crit Chance [%]')).toBe('crit-chance')
  })

  it('toggles selection on valid cells and clears on repeat click', () => {
    let map = toggleSubmoduleSelection({}, CANNON_ATTACK_SPEED_EFFECT_ID, 'epic', '0.7')
    expect(map).toEqual({ [CANNON_ATTACK_SPEED_EFFECT_ID]: 'epic' })
    map = toggleSubmoduleSelection(map, CANNON_ATTACK_SPEED_EFFECT_ID, 'epic', '0.7')
    expect(map).toEqual({})
  })

  it('ignores n/a cells', () => {
    expect(
      toggleSubmoduleSelection({}, CANNON_ATTACK_SPEED_EFFECT_ID, 'common', null),
    ).toEqual({})
  })

  it('derives cannon attack speed from attack-speed pick', () => {
    const map = { [CANNON_ATTACK_SPEED_EFFECT_ID]: 'legendary' as const }
    expect(cannonSubmoduleAttackSpeedFromSelections(map)).toBe(1)
  })

  it('sums main and assist cannon attack-speed sub-effects', () => {
    const selections = defaultWorkshopSubmoduleSelections()
    selections.cannon.main[CANNON_ATTACK_SPEED_EFFECT_ID] = 'legendary'
    selections.cannon.assist[CANNON_ATTACK_SPEED_EFFECT_ID] = 'common'
    expect(totalCannonAttackSpeedFromSelections(selections)).toBe(1.3)
  })

  it('scales assist attack-speed by sub stone efficiency', () => {
    const selections = defaultWorkshopSubmoduleSelections()
    selections.cannon.main[CANNON_ATTACK_SPEED_EFFECT_ID] = 'legendary'
    selections.cannon.assist[CANNON_ATTACK_SPEED_EFFECT_ID] = 'common'
    const ws = {
      ...defaultWorkshopPersisted(),
      simCannonAssistUnlocked: true,
      simCannonAssistChassisModuleId: 'deathPenalty',
      simCannonAssistSubStoneEfficiency: 50,
      simCannonModuleLevel: 1,
      simCannonChassisModuleLevel: 1,
      simSubmoduleSelections: selections,
    }
    expect(
      totalCannonAttackSpeedFromSelections(selections, {
        ws,
        research: null,
        labOverrides: {},
      }),
    ).toBeCloseTo(1.153, 5)
  })

  it('syncs simAttackSpeedModuleSubEffect when main cannon selections change', () => {
    const ws = defaultWorkshopPersisted()
    const next = workshopPersistedWithSubmoduleSelections(ws, 'cannon', 'main', {
      [CANNON_ATTACK_SPEED_EFFECT_ID]: 'mythic',
    })
    expect(next.simAttackSpeedModuleSubEffect).toBe(3)
    expect(next.simSubmoduleSelections.cannon).toEqual({
      main: { [CANNON_ATTACK_SPEED_EFFECT_ID]: 'mythic' },
      assist: {},
    })
  })

  it('stores assist sub-effects separately from main', () => {
    const ws = defaultWorkshopPersisted()
    const next = workshopPersistedWithSubmoduleSelections(ws, 'cannon', 'assist', {
      [CANNON_ATTACK_SPEED_EFFECT_ID]: 'common',
    })
    expect(next.simSubmoduleSelections.cannon.main).toEqual({})
    expect(next.simSubmoduleSelections.cannon.assist).toEqual({
      [CANNON_ATTACK_SPEED_EFFECT_ID]: 'common',
    })
    expect(next.simAttackSpeedModuleSubEffect).toBe(0.3)
  })

  it('migrates legacy flat per-slot maps to main', () => {
    const parsed = sanitizeSubmoduleSelections({
      cannon: { [CANNON_ATTACK_SPEED_EFFECT_ID]: 'mythic', bogus: 'epic' },
    })
    expect(parsed.cannon).toEqual({
      main: { [CANNON_ATTACK_SPEED_EFFECT_ID]: 'mythic' },
      assist: {},
    })
  })

  it('sanitizes persisted submodule selections and legacy attack speed', () => {
    const ws = sanitizeWorkshopPersisted({
      simAttackSpeedModuleSubEffect: 2.5,
      simSubmoduleSelections: {
        cannon: { [CANNON_ATTACK_SPEED_EFFECT_ID]: 'mythic', bogus: 'epic' },
      },
    })
    expect(ws.simSubmoduleSelections.cannon).toEqual({
      main: { [CANNON_ATTACK_SPEED_EFFECT_ID]: 'mythic' },
      assist: {},
    })
    expect(ws.simAttackSpeedModuleSubEffect).toBe(3)
  })

  it('keeps legacy attack speed when no cannon sub-module pick', () => {
    const ws = sanitizeWorkshopPersisted({ simAttackSpeedModuleSubEffect: 2.5 })
    expect(ws.simSubmoduleSelections).toEqual(defaultWorkshopSubmoduleSelections())
    expect(ws.simAttackSpeedModuleSubEffect).toBe(2.5)
  })

  it('drops unknown effect ids per slot', () => {
    expect(
      sanitizeSubmoduleSelectionMap('armor', {
        'health-regen': 'rare',
        'attack-speed': 'epic',
        bogus: 'mythic',
      }),
    ).toEqual({ 'health-regen': 'rare' })
  })

  it('parses JSON selections from CSV-style strings (legacy flat)', () => {
    const parsed = parseSubmoduleSelectionsJson(
      JSON.stringify({ cannon: { 'attack-speed': 'common' } }),
    )
    expect(parsed.cannon).toEqual({
      main: { 'attack-speed': 'common' },
      assist: {},
    })
  })

  it('parses nested main/assist JSON', () => {
    const parsed = parseSubmoduleSelectionsJson(
      JSON.stringify({
        cannon: {
          main: { 'attack-speed': 'epic' },
          assist: { 'crit-chance': 'rare' },
        },
      }),
    )
    expect(parsed.cannon.main).toEqual({ 'attack-speed': 'epic' })
    expect(parsed.cannon.assist).toEqual({ 'crit-chance': 'rare' })
    expect(parsed.armor).toEqual(defaultWorkshopSubmoduleSlotSelections())
  })
})

import { describe, expect, it } from 'vitest'
import { CANNON_SUBMODULE_ATTACK_SPEED_ADD } from './workshopSubmoduleEffects'
import {
  cannonSubmoduleAttackSpeedByRarity,
  WORKSHOP_SUBMODULE_SECTIONS,
  WORKSHOP_SUBMODULE_SLOT_COUNT,
  WORKSHOP_SUBMODULE_SLOT_UNLOCK_LEVEL,
  formatSubmoduleCellDisplay,
  parseSubmoduleCellNumber,
  submoduleCellFromScaledNumber,
  submoduleEffectPickerSlotText,
} from './workshopSubmoduleCatalog'

describe('workshopSubmoduleCatalog', () => {
  it('unlocks eight sub-module slots at wiki module levels', () => {
    expect(WORKSHOP_SUBMODULE_SLOT_UNLOCK_LEVEL).toEqual([
      1, 1, 41, 101, 141, 161, 201, 241,
    ])
    expect(WORKSHOP_SUBMODULE_SLOT_COUNT).toBe(8)
  })

  it('has submodule tables for all four chassis slots', () => {
    expect(WORKSHOP_SUBMODULE_SECTIONS.cannon.rows.length).toBe(17)
    expect(WORKSHOP_SUBMODULE_SECTIONS.armor.rows.length).toBe(17)
    expect(WORKSHOP_SUBMODULE_SECTIONS.generator.rows.length).toBe(13)
    expect(WORKSHOP_SUBMODULE_SECTIONS.core.rows.length).toBe(26)
  })

  it('parses attack speed row for workshop sim', () => {
    expect(cannonSubmoduleAttackSpeedByRarity()).toEqual(CANNON_SUBMODULE_ATTACK_SPEED_ADD)
    expect(CANNON_SUBMODULE_ATTACK_SPEED_ADD.ancestral).toBe(5)
  })

  it('parses suffixed cells', () => {
    expect(parseSubmoduleCellNumber('2.5s')).toBe(2.5)
    expect(parseSubmoduleCellNumber('12%')).toBe(12)
    expect(parseSubmoduleCellNumber(null)).toBeNull()
  })

  it('formats percent sub-module cells from wiki label unit', () => {
    expect(formatSubmoduleCellDisplay('5', 'Defense [%]')).toBe('+5%')
    expect(formatSubmoduleCellDisplay('100', 'Health Regen [%]')).toBe('+100%')
    expect(formatSubmoduleCellDisplay('40', 'Wall Health [%]')).toBe('+40%')
    expect(formatSubmoduleCellDisplay('2%', 'Bounce Shot Chance')).toBe('+2%')
  })

  it('formats Max Recovery submodule cells with x multiplier suffix', () => {
    expect(formatSubmoduleCellDisplay('0.4', 'Max Recovery')).toBe('+0.4x')
    expect(submoduleCellFromScaledNumber(0.076, '0.4', 'Max Recovery')).toBe('0.08x')
    expect(submoduleEffectPickerSlotText('0.4', 'Max Recovery')).toBe('+0.4x Max Recovery')
  })

  it('formats scaled assist percent cells with one decimal', () => {
    expect(submoduleCellFromScaledNumber(2.2, '11', 'Package Chance [%]')).toBe('2.2%')
    expect(submoduleCellFromScaledNumber(3, '6', 'Crit Chance [%]')).toBe('3%')
  })

  it('formats in-game picker slot text for percent effects', () => {
    expect(submoduleEffectPickerSlotText('5', 'Defense [%]')).toBe('+5% Defense %')
    expect(submoduleEffectPickerSlotText('100', 'Defense Absolute [%]')).toBe(
      '+100% Defense Absolute',
    )
    expect(submoduleEffectPickerSlotText('100', 'Health Regen [%]')).toBe('+100% Health Regen')
    expect(submoduleEffectPickerSlotText('40', 'Wall Health [%]')).toBe('+40% Wall Health')
    expect(submoduleEffectPickerSlotText('6', 'Crit Chance [%]')).toBe('+6% Crit Chance')
  })
})

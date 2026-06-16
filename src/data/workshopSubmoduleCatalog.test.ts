import { describe, expect, it } from 'vitest'
import { CANNON_SUBMODULE_ATTACK_SPEED_ADD } from './workshopSubmoduleEffects'
import {
  assistSubmodulePickerCellFromScaledNumber,
  cannonSubmoduleAttackSpeedByRarity,
  WORKSHOP_SUBMODULE_SECTIONS,
  WORKSHOP_SUBMODULE_SLOT_COUNT,
  WORKSHOP_SUBMODULE_SLOT_UNLOCK_LEVEL,
  workshopSubmoduleSlotUnlocked,
  formatSubmoduleCellDisplay,
  parseSubmoduleCellNumber,
  submoduleCellFromScaledNumber,
  submoduleEffectDisplayName,
  submoduleEffectPickerSlotText,
} from './workshopSubmoduleCatalog'

describe('workshopSubmoduleCatalog', () => {
  it('unlocks eight sub-module slots at wiki module levels', () => {
    expect(WORKSHOP_SUBMODULE_SLOT_UNLOCK_LEVEL).toEqual([
      1, 1, 41, 101, 141, 161, 201, 241,
    ])
    expect(WORKSHOP_SUBMODULE_SLOT_COUNT).toBe(8)
    expect(workshopSubmoduleSlotUnlocked(3, 66, 'star_2')).toBe(false)
    expect(workshopSubmoduleSlotUnlocked(3, 101, 'star_2')).toBe(true)
    expect(workshopSubmoduleSlotUnlocked(2, 66, 'star_2')).toBe(true)
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

  it('formats assist picker cells with in-game floor/truncate rules', () => {
    expect(
      assistSubmodulePickerCellFromScaledNumber(5.2, '20', 'Health Regen [%]'),
    ).toBe('5%')
    expect(
      assistSubmodulePickerCellFromScaledNumber(22.5, '90', 'Wall Health [%]'),
    ).toBe('22.5%')
    expect(
      assistSubmodulePickerCellFromScaledNumber(2.25, '9', 'Land Mine Chance [%]'),
    ).toBe('2.25%')
    expect(assistSubmodulePickerCellFromScaledNumber(0.1875, '0.75', 'Land Mine Radius')).toBe(
      '0.19',
    )
  })

  it('uses in-game display names for crit submodule labels', () => {
    expect(submoduleEffectDisplayName('Crit Chance [%]')).toBe('Critical Chance')
    expect(submoduleEffectDisplayName('Crit Factor')).toBe('Critical Factor')
  })

  it('formats in-game picker slot text for percent effects', () => {
    expect(submoduleEffectPickerSlotText('5', 'Defense [%]')).toBe('+5% Defense %')
    expect(submoduleEffectPickerSlotText('100', 'Defense Absolute [%]')).toBe(
      '+100% Defense Absolute',
    )
    expect(submoduleEffectPickerSlotText('100', 'Health Regen [%]')).toBe('+100% Health Regen')
    expect(submoduleEffectPickerSlotText('40', 'Wall Health [%]')).toBe('+40% Wall Health')
    expect(submoduleEffectPickerSlotText('6', 'Crit Chance [%]')).toBe('+6% Critical Chance')
    expect(submoduleEffectPickerSlotText('2', 'Super Crit Multi')).toBe('+2x Super Crit Multi')
    expect(submoduleEffectPickerSlotText('6', 'Crit Factor')).toBe('+6x Critical Factor')
    expect(submoduleEffectPickerSlotText('0.025', 'Damage / Meter [m]')).toBe(
      '+0.03x Damage / Meter',
    )
  })

  it('formats Spotlight Angle with degree unit in picker', () => {
    expect(formatSubmoduleCellDisplay('6', 'Spotlight - Angle*')).toBe('+6°')
    expect(submoduleEffectPickerSlotText('6', 'Spotlight - Angle*')).toBe('+6° Spotlight - Angle')
    expect(assistSubmodulePickerCellFromScaledNumber(6, '6', 'Spotlight - Angle*')).toBe('6°')
    expect(assistSubmodulePickerCellFromScaledNumber(2.85, '15', 'Spotlight - Angle*')).toBe('3°')
  })

  it('formats assist picker seconds and plain cells to one decimal', () => {
    expect(
      assistSubmodulePickerCellFromScaledNumber(-0.57, '-3', 'Black Hole - Cooldown [s]'),
    ).toBe('-0.6s')
    expect(
      assistSubmodulePickerCellFromScaledNumber(-1.52, '-8', 'Poison Swamp - Cooldown [s]'),
    ).toBe('-1.6s')
    expect(assistSubmodulePickerCellFromScaledNumber(0.76, '4', 'Golden Tower - Bonus')).toBe('0.8')
  })
})

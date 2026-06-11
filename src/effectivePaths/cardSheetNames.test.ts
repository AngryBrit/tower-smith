import { describe, expect, it } from 'vitest'
import { WORKSHOP_GAME_CARD_ORDER } from '../data/workshopGameCards'
import {
  effectivePathsCardPresetDropdownLabels,
  effectivePathsCardSheetLabelsFromCardRows,
  isCardEquipSlotsSheetName,
  workshopCardIdFromSheetName,
  workshopCardSheetNameFromId,
} from './cardSheetNames'

describe('workshopCardIdFromSheetName', () => {
  it('maps EP card labels to workshop card ids', () => {
    expect(workshopCardIdFromSheetName('Damage')).toBe('damage')
    expect(workshopCardIdFromSheetName('Attack Speed')).toBe('attackSpeed')
    expect(workshopCardIdFromSheetName('Area of Effect')).toBe('areaOfEffect')
    expect(workshopCardIdFromSheetName('Land Mine Stun')).toBe('landMineStun')
  })

  it('detects card slot row labels', () => {
    expect(isCardEquipSlotsSheetName('Card Slot (Gems)')).toBe(true)
  })

  it('covers every card in the Card Preset dropdown list', () => {
    const labels = effectivePathsCardPresetDropdownLabels()
    expect(labels.size).toBe(WORKSHOP_GAME_CARD_ORDER.length)
    expect(labels.get('freeUpgrades')).toBe('Free Upgrades')
    expect(labels.get('landMineStun')).toBe('Land Mine Stun')
    expect(labels.get('recoveryPackageChance')).toBe('Recovery Package Chance')
  })

  it('prefers Card Preset dropdown spellings over Master Sheet variants', () => {
    const master = new Map([['landMineStun', 'Landmine Stun']] as const)
    const merged = new Map([
      ...master,
      ...effectivePathsCardPresetDropdownLabels(),
    ])
    expect(workshopCardSheetNameFromId('landMineStun', merged)).toBe('Land Mine Stun')
  })

  it('uses exact Master Sheet spellings for preset dropdown labels', () => {
    const rows = Array.from({ length: 40 }, () => Array<string>(8).fill(''))
    rows[5]![1] = 'Free Upgrades'
    rows[6]![1] = 'Landmine Stun'
    const labels = effectivePathsCardSheetLabelsFromCardRows(
      rows,
      [
        { rowIndex: 6, kind: 'card' },
        { rowIndex: 7, kind: 'card' },
      ],
      1,
    )
    expect(workshopCardSheetNameFromId('freeUpgrades', labels)).toBe('Free Upgrades')
    expect(workshopCardSheetNameFromId('landMineStun', labels)).toBe('Landmine Stun')
  })
})

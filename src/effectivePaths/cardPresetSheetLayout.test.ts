import { describe, expect, it } from 'vitest'
import {
  buildCardPresetSheetGridFromColumnRanges,
  detectCardPresetSheetLayout,
  parseCardPresetSlotsWithLayout,
} from './cardPresetSheetLayout'

function buildV304PresetRows(): string[][] {
  const rows = Array.from({ length: 50 }, () => Array<string>(24).fill(''))
  rows[3]![3] = 'Farming'
  rows[3]![7] = 'Tourney'
  rows[3]![12] = 'Preset 3'
  rows[4]![11] = 'Damage'
  rows[4]![3] = 'Free Upgrades'
  rows[5]![3] = 'Coins'
  rows[4]![7] = 'Free Upgrades'
  rows[5]![7] = 'Health'
  return rows
}

describe('cardPresetSheetLayout', () => {
  it('merges single-column preset ranges', () => {
    const grid = buildCardPresetSheetGridFromColumnRanges([
      { range: "'Card Preset'!D4:D4", values: [['Farming']] },
      { range: "'Card Preset'!D5:D7", values: [['Free Upgrades'], ['Coins'], ['Critical Coin']] },
      { range: "'Card Preset'!H5:H6", values: [['Free Upgrades'], ['Health']] },
    ])
    expect(grid[3]![3]).toBe('Farming')
    expect(grid[4]![3]).toBe('Free Upgrades')
    expect(grid[5]![3]).toBe('Coins')
    expect(grid[4]![7]).toBe('Free Upgrades')
    expect(grid[5]![7]).toBe('Health')
  })

  it('detects Cards v3.x Card Preset tab blocks', () => {
    const rows = buildV304PresetRows()
    const layout = detectCardPresetSheetLayout(rows)
    expect(layout).not.toBeNull()
    const slots = parseCardPresetSlotsWithLayout(layout!)
    expect(slots).toHaveLength(5 * 28)
    expect(slots[0]).toEqual({
      presetIndex: 0,
      slotIndex: 0,
      rowIndex: 5,
      nameCol: 3,
    })
    expect(slots[27]).toEqual({
      presetIndex: 0,
      slotIndex: 27,
      rowIndex: 32,
      nameCol: 3,
    })
    expect(slots[28]).toEqual({
      presetIndex: 1,
      slotIndex: 0,
      rowIndex: 5,
      nameCol: 7,
    })
    expect(slots[56]).toEqual({
      presetIndex: 2,
      slotIndex: 0,
      rowIndex: 5,
      nameCol: 11,
    })
  })

  it('detects preset layout from slot card names when headers are missing', () => {
    const rows = Array.from({ length: 50 }, () => Array<string>(24).fill(''))
    rows[4]![3] = 'Free Upgrades'
    rows[5]![7] = 'Health'
    expect(detectCardPresetSheetLayout(rows)).not.toBeNull()
  })

  it('detects layout when preset titles are on M/Q/U and cards on L/P/T', () => {
    const rows = Array.from({ length: 50 }, () => Array<string>(24).fill(''))
    rows[3]![12] = 'Preset 3'
    rows[4]![11] = 'Damage'
    const layout = detectCardPresetSheetLayout(rows)
    expect(layout?.presetNameCols).toEqual([3, 7, 11, 15, 19])
    const slots = parseCardPresetSlotsWithLayout(layout!)
    expect(slots[56]).toEqual({
      presetIndex: 2,
      slotIndex: 0,
      rowIndex: 5,
      nameCol: 11,
    })
  })
})

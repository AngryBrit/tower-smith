import { describe, expect, it } from 'vitest'
import {
  detectWorkshopEnhanceSheetLayout,
  detectWorkshopSheetLayout,
  parseWorkshopEnhanceSheetRowsWithLayout,
  parseWorkshopSheetRowsWithLayout,
  unmappedWorkshopNamesWithLayout,
} from './workshopSheetLayout'
import { workshopLevelsFromSheetRows } from './workshopLevelsFromSheet'
import { buildWorkshopV301CleanRows } from './workshopSheetCatalogFixture'

describe('workshop v3.0.1 clean Master Sheet fixture', () => {
  const rows = buildWorkshopV301CleanRows()

  it('detects upgrade block in columns B/C/D (N=max)', () => {
    const layout = detectWorkshopSheetLayout(rows)
    expect(layout).toEqual({
      unlockedCol: 1,
      nameCol: 2,
      levelCol: 3,
      startRow: 2,
      endRow: 21,
    })
    const parsed = parseWorkshopSheetRowsWithLayout(rows, layout!)
    expect(parsed.map((row) => row.name)).toEqual(
      expect.arrayContaining([
        'Damage',
        'Attack Speed',
        'Critical Chance',
        'Unlock Range (50 ¢)',
        'Health Regen',
      ]),
    )
    const unlockRangeRows = parsed.filter((row) => row.name.startsWith('Unlock Range'))
    expect(unlockRangeRows.map((row) => row.upgradeId)).toEqual([
      'attackRangeLevel',
      'damagePerMeterLevel',
    ])
  })

  it('does not treat unlock-gate labels as unmapped workshop names', () => {
    const layout = detectWorkshopSheetLayout(rows)!
    expect(unmappedWorkshopNamesWithLayout(rows, layout)).toEqual([])
  })

  it('detects enhancement block in columns P/R (W=max)', () => {
    const layout = detectWorkshopEnhanceSheetLayout(rows)
    expect(layout).toEqual({
      nameCol: 15,
      levelCol: 17,
      startRow: 2,
      endRow: 15,
    })
    const parsed = parseWorkshopEnhanceSheetRowsWithLayout(rows, layout!)
    expect(parsed.map((row) => row.name)).toEqual(
      expect.arrayContaining(['Damage +', 'Health +', 'Cash Bonus +']),
    )
  })

  it('reads zero farming levels from a clean sheet', () => {
    const layout = detectWorkshopSheetLayout(rows)!
    const enhanceLayout = detectWorkshopEnhanceSheetLayout(rows)!
    const workshopRows = parseWorkshopSheetRowsWithLayout(rows, layout)
    const enhanceRows = parseWorkshopEnhanceSheetRowsWithLayout(rows, enhanceLayout)
    const levels = workshopLevelsFromSheetRows(
      workshopRows,
      enhanceRows,
      rows,
      layout,
      enhanceLayout,
    )
    expect(levels.damageLevel).toBe(0)
    expect(levels.attackSpeedLevel).toBe(0)
    expect(levels.enhanceDamageLevel).toBe(0)
    expect(levels.enhanceHealthLevel).toBe(0)
    expect(levels.enhanceCashBonusLevel).toBe(0)
  })
})

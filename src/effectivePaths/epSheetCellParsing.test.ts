import { describe, expect, it } from 'vitest'
import { farmingDropdownLevelFromLabel } from './epSheetCellParsing'

describe('farmingDropdownLevelFromLabel', () => {
  it('parses zero-padded level from dropdown label', () => {
    expect(farmingDropdownLevelFromLabel('06 | 32m | Cost 300 ⧓ | Next 340 ⧓')).toBe(6)
  })

  it('returns plus locked value for Lo | Locked prefix', () => {
    expect(
      farmingDropdownLevelFromLabel('Lo | Locked 00 | 0.00% | Cost 120 ⧌ | Next 140 ⧌', {
        plusLockedValue: -1,
      }),
    ).toBe(-1)
  })
})

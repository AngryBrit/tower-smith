import { describe, expect, it } from 'vitest'
import { buildCardSheetUpdates } from './buildCardSheetUpdates'

describe('buildCardSheetUpdates', () => {
  it('writes star level, mastery, and equip slots cells', () => {
    const batch = buildCardSheetUpdates(
      'Master Sheet',
      [
        { rowIndex: 5, name: 'Card Slot (Gems)', kind: 'equip_slots' },
        { rowIndex: 6, name: 'Damage', kind: 'card' },
        { rowIndex: 36, name: 'Area of Effect', kind: 'card' },
      ],
      { damage: 7, areaOfEffect: 0 },
      new Set(['damage']),
      18,
    )
    expect(batch).toEqual(
      expect.arrayContaining([
        { range: "'Master Sheet'!C5", values: [[18]] },
        { range: "'Master Sheet'!C6", values: [[7]] },
        { range: "'Master Sheet'!D6", values: [['TRUE']] },
        { range: "'Master Sheet'!C36", values: [['Locked']] },
        { range: "'Master Sheet'!D36", values: [['FALSE']] },
      ]),
    )
  })
})

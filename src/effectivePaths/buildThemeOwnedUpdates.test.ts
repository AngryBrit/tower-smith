import { describe, expect, it } from 'vitest'
import { buildThemeOwnedUpdates } from './buildThemeOwnedUpdates'

describe('buildThemeOwnedUpdates', () => {
  it('writes TRUE/FALSE to owned columns B, E, M, and Q', () => {
    const batch = buildThemeOwnedUpdates(
      'Themes & Songs',
      [
        { rowIndex: 3, name: 'Star', section: 'tower-event', ownedCol: 1 },
        { rowIndex: 3, name: 'Interstellar', section: 'background', ownedCol: 4 },
        { rowIndex: 3, name: 'Shuriken', section: 'tower-milestone', ownedCol: 12 },
        { rowIndex: 12, name: 'Krisu - Oceans Sings', section: 'music', ownedCol: 12 },
      ],
      new Set(['tower-event-star', 'tower-shuriken', 'music-krisu-oceans-sings']),
    )
    expect(batch).toEqual([
      { range: "'Themes & Songs'!B3", values: [['TRUE']] },
      { range: "'Themes & Songs'!E3", values: [['FALSE']] },
      { range: "'Themes & Songs'!M3", values: [['TRUE']] },
      { range: "'Themes & Songs'!M12", values: [['TRUE']] },
    ])
  })
})

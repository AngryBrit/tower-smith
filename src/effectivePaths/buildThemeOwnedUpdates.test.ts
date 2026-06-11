import { describe, expect, it } from 'vitest'
import { buildThemeOwnedUpdates } from './buildThemeOwnedUpdates'

describe('buildThemeOwnedUpdates', () => {
  it('writes TRUE/FALSE to owned columns B, E, L, and Q', () => {
    const batch = buildThemeOwnedUpdates(
      'Themes & Songs',
      [
        { rowIndex: 3, name: 'Star', section: 'tower-event', ownedCol: 1 },
        { rowIndex: 3, name: 'Interstellar', section: 'background', ownedCol: 4 },
        { rowIndex: 3, name: 'Shuriken', section: 'tower-milestone', ownedCol: 11 },
        { rowIndex: 12, name: 'Krisu - Oceans Sings', section: 'music', ownedCol: 11 },
      ],
      new Set(['tower-event-star', 'tower-shuriken', 'music-krisu-oceans-sings']),
    )
    expect(batch).toEqual([
      { range: "'Themes & Songs'!B3", values: [['TRUE']] },
      { range: "'Themes & Songs'!E3", values: [['FALSE']] },
      { range: "'Themes & Songs'!L3", values: [['TRUE']] },
      { range: "'Themes & Songs'!L12", values: [['TRUE']] },
    ])
  })
})

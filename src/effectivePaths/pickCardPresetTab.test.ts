import { describe, expect, it } from 'vitest'
import {
  isCardPresetInputTabCandidate,
  pickEffectivePathsCardPresetTab,
} from './pickCardPresetTab'

describe('pickCardPresetTab', () => {
  it('skips Home Page tabs that are too small', () => {
    expect(isCardPresetInputTabCandidate('Home Page', { rowCount: 55, columnCount: 11 })).toBe(
      false,
    )
  })

  it('prefers Card Preset tab title', () => {
    const picked = pickEffectivePathsCardPresetTab(
      [
        { properties: { sheetId: 1, title: 'Master Sheet', gridProperties: { rowCount: 60, columnCount: 30 } } },
        { properties: { sheetId: 2, title: 'Card Preset', gridProperties: { rowCount: 60, columnCount: 30 } } },
      ],
      null,
    )
    expect(picked?.title).toBe('Card Preset')
  })
})

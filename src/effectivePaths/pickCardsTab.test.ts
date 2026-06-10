import { describe, expect, it } from 'vitest'
import { isCardsInputTabCandidate, pickEffectivePathsCardsTab } from './pickCardsTab'

describe('isCardsInputTabCandidate', () => {
  it('rejects Home Page and accepts Master Sheet', () => {
    expect(isCardsInputTabCandidate('Home Page', { rowCount: 55, columnCount: 11 })).toBe(false)
    expect(isCardsInputTabCandidate('Master Sheet', { rowCount: 60, columnCount: 30 })).toBe(true)
  })
})

describe('pickEffectivePathsCardsTab', () => {
  it('prefers Master Sheet tab title', () => {
    const picked = pickEffectivePathsCardsTab(
      [
        { properties: { sheetId: 1, title: 'Home Page' } },
        { properties: { sheetId: 2, title: 'Master Sheet' } },
      ],
      null,
    )
    expect(picked?.sheetId).toBe(2)
  })
})

import { describe, expect, it } from 'vitest'
import { isThemesInputTabCandidate, pickEffectivePathsThemesTab } from './pickThemesTab'

describe('isThemesInputTabCandidate', () => {
  it('rejects Home Page and other small navigation tabs', () => {
    expect(isThemesInputTabCandidate('Home Page', { rowCount: 55, columnCount: 11 })).toBe(
      false,
    )
    expect(
      isThemesInputTabCandidate('Themes & Songs', { rowCount: 120, columnCount: 26 }),
    ).toBe(true)
  })
})

describe('pickEffectivePathsThemesTab', () => {
  it('prefers Themes & Songs Input over the summary tab', () => {
    const picked = pickEffectivePathsThemesTab(
      [
        { properties: { sheetId: 2, title: 'Themes & Songs' } },
        { properties: { sheetId: 9, title: 'Themes & Songs Input' } },
      ],
      null,
    )
    expect(picked?.sheetId).toBe(9)
  })

  it('uses exact Themes & Songs title when no input tab exists', () => {
    const picked = pickEffectivePathsThemesTab(
      [
        { properties: { sheetId: 1, title: 'Home' } },
        { properties: { sheetId: 2, title: 'Themes & Songs' } },
      ],
      null,
    )
    expect(picked?.sheetId).toBe(2)
  })

  it('falls back to themes+songs input tab names', () => {
    const picked = pickEffectivePathsThemesTab(
      [{ properties: { sheetId: 9, title: 'Themes & Songs Input' } }],
      null,
    )
    expect(picked?.title).toBe('Themes & Songs Input')
  })
})

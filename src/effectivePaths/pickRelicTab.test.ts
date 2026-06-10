import { describe, expect, it } from 'vitest'
import { pickEffectivePathsRelicTab } from './pickRelicTab'

describe('pickEffectivePathsRelicTab', () => {
  const sheets = [
    { properties: { sheetId: 1, title: 'Notes' } },
    { properties: { sheetId: 683290125, title: 'Relics' } },
    { properties: { sheetId: 3, title: 'Summary' } },
  ]

  it('prefers the Relics tab by exact title', () => {
    expect(pickEffectivePathsRelicTab(sheets, null)?.title).toBe('Relics')
  })

  it('uses gid when provided', () => {
    expect(pickEffectivePathsRelicTab(sheets, 1)?.title).toBe('Notes')
  })

  it('returns null when no relic tab exists', () => {
    expect(
      pickEffectivePathsRelicTab([{ properties: { sheetId: 9, title: 'Labs' } }], null),
    ).toBeNull()
  })
})

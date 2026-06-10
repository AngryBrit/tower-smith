import { describe, expect, it } from 'vitest'
import { orderedIdsMasterTabs, pickIdsMasterTab } from './pickIdsMasterTab'

describe('pickIdsMasterTab', () => {
  const sheets = [
    { properties: { sheetId: 1, title: 'Home Page' } },
    { properties: { sheetId: 2, title: 'IDS' } },
    { properties: { sheetId: 3, title: 'Master Sheet' } },
  ]

  it('prefers the IDS tab over Home Page', () => {
    expect(pickIdsMasterTab(sheets, null)?.title).toBe('IDS')
  })

  it('orders IDS before Home Page when scanning tabs', () => {
    expect(orderedIdsMasterTabs(sheets, null).map((tab) => tab.title)).toEqual([
      'IDS',
      'Master Sheet',
      'Home Page',
    ])
  })

  it('uses gid when provided', () => {
    expect(pickIdsMasterTab(sheets, 1)?.title).toBe('Home Page')
  })
})

import { describe, expect, it } from 'vitest'
import {
  buildIdsCollectionWorkbooks,
  idsCollectionMsTabTitle,
  isIdsCollectionSpreadsheet,
} from './idsCollectionLayout'
import { pickEffectivePathsLaboratoryTab } from './pickLaboratoryTab'
import { pickEffectivePathsWorkshopTab } from './pickWorkshopTab'
import { pickEffectivePathsBotsTab } from './pickBotsTab'

/** Tab names from IDS Collection v3.2.2 template (subset). */
const IDS_COLLECTION_V322_TABS = [
  'Home Page',
  'Main Menu',
  'Version History',
  '_IDS',
  'DVT_IDS',
  'Master Sheet',
  'Lab_MS',
  'Workshop_MS',
  'Cards_MS',
  'Card Preset',
  'UW_MS',
  'Modules Inventory',
  'Themes & Songs',
  'Relics',
  'Relics Timeline',
  'Bots_MS',
  'Guardians_MS',
] as const

const COLLECTION_SPREADSHEET_ID = '1S-Yg0XFDCU1Z38g-OkvgZle91eYhAi1lT7j8bPDO-EQ'

describe('isIdsCollectionSpreadsheet', () => {
  it('detects IDS Collection v3.2 tab layout', () => {
    expect(isIdsCollectionSpreadsheet([...IDS_COLLECTION_V322_TABS])).toBe(true)
  })

  it('does not treat standalone IDS Master as collection', () => {
    expect(isIdsCollectionSpreadsheet(['Home Page', 'IDS', 'Instructions'])).toBe(false)
  })
})

describe('buildIdsCollectionWorkbooks', () => {
  it('maps every present _MS category to the same spreadsheet id', () => {
    const workbooks = buildIdsCollectionWorkbooks(COLLECTION_SPREADSHEET_ID, [
      ...IDS_COLLECTION_V322_TABS,
    ])
    expect(workbooks.map((row) => row.name).sort()).toEqual(
      [
        'Bots',
        'Cards',
        'Guardians',
        'Laboratory',
        'Modules',
        'Relics',
        'Themes & Songs',
        'Ultimate Weapons',
        'Workshop',
      ].sort(),
    )
    expect(new Set(workbooks.map((row) => row.spreadsheetId))).toEqual(
      new Set([COLLECTION_SPREADSHEET_ID]),
    )
  })
})

describe('idsCollectionMsTabTitle', () => {
  it('resolves Lab_MS for Laboratory', () => {
    expect(idsCollectionMsTabTitle('Laboratory', [...IDS_COLLECTION_V322_TABS])).toBe('Lab_MS')
  })
})

describe('pickEffectivePaths category tabs in collection workbook', () => {
  const sheets = IDS_COLLECTION_V322_TABS.map((title, index) => ({
    properties: { sheetId: index + 1, title },
  }))

  it('picks Lab_MS instead of top-level Master Sheet', () => {
    expect(pickEffectivePathsLaboratoryTab(sheets, null)?.title).toBe('Lab_MS')
  })

  it('picks Workshop_MS and Bots_MS', () => {
    expect(pickEffectivePathsWorkshopTab(sheets, null)?.title).toBe('Workshop_MS')
    expect(pickEffectivePathsBotsTab(sheets, null)?.title).toBe('Bots_MS')
  })
})

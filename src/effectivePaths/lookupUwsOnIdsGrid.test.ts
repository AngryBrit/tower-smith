import { describe, expect, it } from 'vitest'
import { lookupUwsWorkbookOnIdsGrid } from './lookupUwsOnIdsGrid'

const USER_UWS_ID = '1UwsWorkbookIdFromIdsGridXXXXXXXX'

describe('lookupUwsWorkbookOnIdsGrid', () => {
  it('finds UWs workbook from Ultimate Weapons category row', () => {
    const uws = lookupUwsWorkbookOnIdsGrid({
      formatted: [
        ['Laboratory', 'Copy Me', '1LaboratoryWorkbookIdXXXXXXX', 'Go to my Laboratory Sheet'],
        ['Ultimate Weapons', 'Copy Me', USER_UWS_ID, 'Go to my Ultimate Weapons Sheet'],
      ],
      formulas: [
        [
          'Laboratory',
          'Copy Me',
          '1LaboratoryWorkbookIdXXXXXXX',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1LaboratoryWorkbookIdXXXXXXX/edit","Go to my Laboratory Sheet")',
        ],
        [
          'Ultimate Weapons',
          'Copy Me',
          USER_UWS_ID,
          `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_UWS_ID}/edit","Go to my Ultimate Weapons Sheet")`,
        ],
      ],
    })
    expect(uws).toEqual({
      name: 'Ultimate Weapons',
      spreadsheetId: USER_UWS_ID,
    })
  })

  it('finds UWs workbook from Go to my UWs Sheet link text', () => {
    const uws = lookupUwsWorkbookOnIdsGrid({
      formatted: [['', 'Copy Me', USER_UWS_ID, 'Go to my UWs Sheet']],
      formulas: [
        [
          '',
          'Copy Me',
          USER_UWS_ID,
          `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_UWS_ID}/edit","Go to my UWs Sheet")`,
        ],
      ],
    })
    expect(uws?.spreadsheetId).toBe(USER_UWS_ID)
    expect(uws?.name).toBe('Ultimate Weapons')
  })
})

import { describe, expect, it } from 'vitest'
import { lookupWorkshopWorkbookOnIdsGrid } from './lookupWorkshopOnIdsGrid'

const USER_WORKSHOP_ID = '1WorkshopWorkbookIdFromIdsMasterXX'

describe('lookupWorkshopWorkbookOnIdsGrid', () => {
  it('finds Workshop workbook ID from column D hyperlink', () => {
    const workshop = lookupWorkshopWorkbookOnIdsGrid({
      formatted: [
        ['Workshop', 'Copy Me', '1WorkshopWorkbookIdXXXXXXXXX', 'Go to my Workshop Sheet'],
        [
          'Workshop',
          'Copy Me',
          '1WorkshopWorkbookIdXXXXXXXXX',
          `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_WORKSHOP_ID}/edit","Go to my Workshop Sheet")`,
        ],
      ],
      formulas: [
        ['Workshop', 'Copy Me', '1WorkshopWorkbookIdXXXXXXXXX', 'Go to my Workshop Sheet'],
        [
          'Workshop',
          'Copy Me',
          '1WorkshopWorkbookIdXXXXXXXXX',
          `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_WORKSHOP_ID}/edit","Go to my Workshop Sheet")`,
        ],
      ],
      columnDHyperlinks: ['', `https://docs.google.com/spreadsheets/d/${USER_WORKSHOP_ID}/edit`],
    })
    expect(workshop).toEqual({
      name: 'Workshop',
      spreadsheetId: USER_WORKSHOP_ID,
    })
  })
})

import { describe, expect, it } from 'vitest'
import { lookupThemesWorkbookOnIdsGrid } from './lookupThemesOnIdsGrid'

const USER_THEMES_ID = '1ThemesWorkbookIdFromIdsMasterXX'

describe('lookupThemesWorkbookOnIdsGrid', () => {
  it('finds Themes & Songs workbook ID from column D hyperlink', () => {
    const themes = lookupThemesWorkbookOnIdsGrid({
      formatted: [
        ['Themes & Songs', 'Copy Me', '1ThemesWorkbookIdXXXXXXXXX', 'Go to my Themes & Songs Sheet'],
      ],
      formulas: [
        [
          'Themes & Songs',
          'Copy Me',
          '1ThemesWorkbookIdXXXXXXXXX',
          `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_THEMES_ID}/edit","Go to my Themes & Songs Sheet")`,
        ],
      ],
    })
    expect(themes).toEqual({
      name: 'Themes & Songs',
      spreadsheetId: USER_THEMES_ID,
    })
  })
})

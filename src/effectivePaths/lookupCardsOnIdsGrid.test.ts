import { describe, expect, it } from 'vitest'
import { lookupCardsWorkbookOnIdsGrid } from './lookupCardsOnIdsGrid'

const USER_CARDS_ID = '1CardsWorkbookIdFromIdsMasterXXXX'

describe('lookupCardsWorkbookOnIdsGrid', () => {
  it('finds Cards workbook ID from column D hyperlink', () => {
    const cards = lookupCardsWorkbookOnIdsGrid({
      formatted: [
        ['Cards', 'Copy Me', '1CardsWorkbookIdXXXXXXXXX', 'Go to my Cards Sheet'],
        [
          'Cards',
          'Copy Me',
          '1CardsWorkbookIdXXXXXXXXX',
          `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_CARDS_ID}/edit","Go to my Cards Sheet")`,
        ],
      ],
      formulas: [
        ['Cards', 'Copy Me', '1CardsWorkbookIdXXXXXXXXX', 'Go to my Cards Sheet'],
        [
          'Cards',
          'Copy Me',
          '1CardsWorkbookIdXXXXXXXXX',
          `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_CARDS_ID}/edit","Go to my Cards Sheet")`,
        ],
      ],
      columnDHyperlinks: ['', `https://docs.google.com/spreadsheets/d/${USER_CARDS_ID}/edit`],
    })
    expect(cards).toEqual({
      name: 'Cards',
      spreadsheetId: USER_CARDS_ID,
    })
  })
})

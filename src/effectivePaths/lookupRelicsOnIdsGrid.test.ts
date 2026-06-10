import { describe, expect, it } from 'vitest'
import { lookupRelicsWorkbookOnIdsGrid } from './lookupRelicsOnIdsGrid'

const USER_RELICS_ID = '1JzurkyQEQauXZEgRNz9lx-F5d76edqT6zXvn3K7QNBs'

describe('lookupRelicsWorkbookOnIdsGrid', () => {
  it('finds Relics workbook ID from column D hyperlink', () => {
    const relics = lookupRelicsWorkbookOnIdsGrid({
      formatted: [
        ['Laboratory', 'Copy Me', '1LaboratoryWorkbookIdXXXXXXX', 'Go to my Laboratory Sheet'],
        ['Relics', 'Copy Me', '1RelicsWorkbookIdXXXXXXXXXX', 'Go to my Relics Sheet'],
      ],
      formulas: [
        [
          'Laboratory',
          'Copy Me',
          '1LaboratoryWorkbookIdXXXXXXX',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1LaboratoryWorkbookIdXXXXXXX/edit","Go to my Laboratory Sheet")',
        ],
        [
          'Relics',
          'Copy Me',
          '1RelicsWorkbookIdXXXXXXXXXX',
          `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_RELICS_ID}/edit","Go to my Relics Sheet")`,
        ],
      ],
    })
    expect(relics).toEqual({
      name: 'Relics',
      spreadsheetId: USER_RELICS_ID,
    })
  })

  it('finds Relics ID from resolved column D hyperlink URI', () => {
    const relics = lookupRelicsWorkbookOnIdsGrid({
      formatted: [['Relics', 'Copy Me', '1oGc...tMp7gTv', 'Go to my Relics Sheet']],
      formulas: [
        [
          'Relics',
          'Copy Me',
          '1oGc...tMp7gTv',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/"&C5&"/edit","Go to my Relics Sheet")',
        ],
      ],
      columnDHyperlinks: [`https://docs.google.com/spreadsheets/d/${USER_RELICS_ID}/edit`],
    })
    expect(relics?.spreadsheetId).toBe(USER_RELICS_ID)
  })

  it('finds Relics ID from column D when column C is truncated', () => {
    const relics = lookupRelicsWorkbookOnIdsGrid({
      formatted: [['Relics', 'Copy Me', '1oGc...tMp7gTv', 'Go to my Relics Sheet']],
      formulas: [
        [
          'Relics',
          'Copy Me',
          '1oGc...tMp7gTv',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1RelicsFromLinkIdXXXXXXXX/edit","Go to my Relics Sheet")',
        ],
      ],
    })
    expect(relics?.spreadsheetId).toBe('1RelicsFromLinkIdXXXXXXXX')
  })

  it('ignores stale template IDs in column C', () => {
    const relics = lookupRelicsWorkbookOnIdsGrid({
      formatted: [
        [
          'Relics',
          'Copy Me',
          '13psLga5xkYIcUiupK9tHmlSsZapFD-IS96aCuUvfjP4',
          'Go to my Relics Sheet',
        ],
      ],
      formulas: [
        [
          'Relics',
          'Copy Me',
          '13psLga5xkYIcUiupK9tHmlSsZapFD-IS96aCuUvfjP4',
          `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_RELICS_ID}/edit","Go to my Relics Sheet")`,
        ],
      ],
    })
    expect(relics?.spreadsheetId).toBe(USER_RELICS_ID)
  })
})

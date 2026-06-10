import { describe, expect, it } from 'vitest'
import { pickSpreadsheetIdFromIdsCategoryRow } from './pickIdsRowSpreadsheetId'

const USER_RELICS_ID = '1JzurkyQEQauXZEgRNz9lx-F5d76edqT6zXvn3K7QNBs'
const STALE_TEMPLATE_ID = '13psLga5xkYIcUiupK9tHmlSsZapFD-IS96aCuUvfjP4'

describe('pickSpreadsheetIdFromIdsCategoryRow', () => {
  it('uses column D HYPERLINK only', () => {
    const id = pickSpreadsheetIdFromIdsCategoryRow(
      ['Relics', 'Copy Me', STALE_TEMPLATE_ID, 'Go to my Relics Sheet'],
      [
        'Relics',
        'Copy Me',
        STALE_TEMPLATE_ID,
        `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_RELICS_ID}/edit","Go to my Relics Sheet")`,
      ],
    )
    expect(id).toBe(USER_RELICS_ID)
  })

  it('ignores column C even when it has a full spreadsheet ID', () => {
    const id = pickSpreadsheetIdFromIdsCategoryRow(
      ['Relics', 'Copy Me', STALE_TEMPLATE_ID, 'Go to my Relics Sheet'],
    )
    expect(id).toBeNull()
  })

  it('returns null when column D has no hyperlink or URL', () => {
    const id = pickSpreadsheetIdFromIdsCategoryRow(
      ['Laboratory', 'Copy Me', '1LaboratoryWorkbookIdXXXXXXX', 'Go to my Laboratory Sheet'],
    )
    expect(id).toBeNull()
  })

  it('reads a URL pasted directly in column D', () => {
    const id = pickSpreadsheetIdFromIdsCategoryRow([
      'Relics',
      'Copy Me',
      STALE_TEMPLATE_ID,
      `https://docs.google.com/spreadsheets/d/${USER_RELICS_ID}/edit`,
    ])
    expect(id).toBe(USER_RELICS_ID)
  })

  it('uses resolved column D hyperlink URI (dynamic HYPERLINK formulas)', () => {
    const id = pickSpreadsheetIdFromIdsCategoryRow(
      ['Relics', 'Copy Me', STALE_TEMPLATE_ID, 'Go to my Relics Sheet'],
      [
        'Relics',
        'Copy Me',
        STALE_TEMPLATE_ID,
        '=HYPERLINK("https://docs.google.com/spreadsheets/d/"&C5&"/edit","Go to my Relics Sheet")',
      ],
      `https://docs.google.com/spreadsheets/d/${USER_RELICS_ID}/edit`,
    )
    expect(id).toBe(USER_RELICS_ID)
  })
})

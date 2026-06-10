import { describe, expect, it } from 'vitest'
import { parseSpreadsheetRef } from './parseSpreadsheetRef'

describe('parseSpreadsheetRef', () => {
  it('parses a raw spreadsheet ID', () => {
    expect(parseSpreadsheetRef('1RnNttj_DW2IGnYxHRI-KLhqQ0SGPKZBWCBCYzf1io3k')).toEqual({
      spreadsheetId: '1RnNttj_DW2IGnYxHRI-KLhqQ0SGPKZBWCBCYzf1io3k',
      sheetGid: null,
    })
  })

  it('parses a full docs URL with gid query param', () => {
    expect(
      parseSpreadsheetRef(
        'https://docs.google.com/spreadsheets/d/1RnNttj_DW2IGnYxHRI-KLhqQ0SGPKZBWCBCYzf1io3k/edit?gid=683290125#gid=683290125',
      ),
    ).toEqual({
      spreadsheetId: '1RnNttj_DW2IGnYxHRI-KLhqQ0SGPKZBWCBCYzf1io3k',
      sheetGid: 683290125,
    })
  })

  it('rejects invalid input', () => {
    expect(parseSpreadsheetRef('')).toBeNull()
    expect(parseSpreadsheetRef('not-a-url')).toBeNull()
    expect(parseSpreadsheetRef('https://example.com/foo')).toBeNull()
  })
})

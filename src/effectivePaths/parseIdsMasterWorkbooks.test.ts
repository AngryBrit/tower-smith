import { describe, expect, it } from 'vitest'
import { extractSpreadsheetIdFromFormula } from './extractSpreadsheetId'
import {
  findLinkedWorkbookByName,
  parseIdsMasterWorkbooks,
} from './parseIdsMasterWorkbooks'

describe('extractSpreadsheetIdFromFormula', () => {
  it('parses HYPERLINK formulas', () => {
    expect(
      extractSpreadsheetIdFromFormula(
        '=HYPERLINK("https://docs.google.com/spreadsheets/d/1RelicsWorkbookIdXXXXXXXXX/edit","Open")',
      ),
    ).toBe('1RelicsWorkbookIdXXXXXXXXX')
  })
})

describe('parseIdsMasterWorkbooks', () => {
  it('reads spreadsheet IDs from column D hyperlink formulas', () => {
    const workbooks = parseIdsMasterWorkbooks({
      formatted: [
        ['Relics', 'Copy Me', 'template-id-ignored-xxxxx', 'Go to my Relics Sheet'],
        ['Laboratory', 'Copy Me', 'template-id-ignored-yyyyy', 'Go to my Laboratory Sheet'],
      ],
      formulas: [
        [
          'Relics',
          'Copy Me',
          'template-id-ignored-xxxxx',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1RelicsWorkbookIdXXXXXXXXX/edit","Go to my Relics Sheet")',
        ],
        [
          'Laboratory',
          'Copy Me',
          'template-id-ignored-yyyyy',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1LaboratoryWorkbookIdXXXXXXX/edit","Go to my Laboratory Sheet")',
        ],
      ],
    })
    expect(workbooks).toEqual([
      { name: 'Laboratory', spreadsheetId: '1LaboratoryWorkbookIdXXXXXXX' },
      { name: 'Relics', spreadsheetId: '1RelicsWorkbookIdXXXXXXXXX' },
    ])
  })

  it('parses Relics from column D when column C is truncated', () => {
    const workbooks = parseIdsMasterWorkbooks({
      formatted: [
        ['Relics', 'Copy Me', '1oGc...tMp7gTv', 'Go to my Relics Sheet'],
      ],
      formulas: [
        [
          'Relics',
          'Copy Me',
          '1oGc...tMp7gTv',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1RelicsFromLinkIdXXXXXXXX/edit","Go to my Relics Sheet")',
        ],
      ],
    })
    expect(findLinkedWorkbookByName(workbooks, 'Relics')?.spreadsheetId).toBe(
      '1RelicsFromLinkIdXXXXXXXX',
    )
  })

  it('parses IDS Master category rows from column D only (name A, link D)', () => {
    const workbooks = parseIdsMasterWorkbooks({
      formatted: [
        ['List of IDS currently usable', '', '', ''],
        ['This Sheet ID is:', '1MasterWorkbookIdXXXXXXXXXX', '', ''],
        ['Laboratory', 'Copy Me', '1LaboratoryWorkbookIdXXXXXXX', 'Go to my Laboratory Sheet'],
        ['Relics', 'Copy Me', '1RelicsWorkbookIdXXXXXXXXXX', 'Go to my Relics Sheet'],
        ['Modules', 'Copy Me', '1ModulesWorkbookIdXXXXXXXXX', 'Go to my Modules Sheet'],
      ],
      formulas: [
        [],
        [],
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
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1RelicsFromLinkIdXXXXXXXX/edit","Go to my Relics Sheet")',
        ],
        [
          'Modules',
          'Copy Me',
          '1ModulesWorkbookIdXXXXXXXXX',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1ModulesWorkbookIdXXXXXXXXX/edit","Go to my Modules Sheet")',
        ],
      ],
    })
    expect(workbooks.map((w) => w.name)).toEqual(
      expect.arrayContaining(['Laboratory', 'Relics', 'Modules']),
    )
    expect(findLinkedWorkbookByName(workbooks, 'Relics')?.spreadsheetId).toBe(
      '1RelicsFromLinkIdXXXXXXXX',
    )
  })

  it('skips category rows without a column D link', () => {
    const workbooks = parseIdsMasterWorkbooks({
      formatted: [
        ['Relics', 'Copy Me', 'abc123spreadsheetidxxxxxx', 'Go to my Relics Sheet'],
      ],
    })
    expect(workbooks).toEqual([])
  })

  it('ignores Home Page progress stat rows with column D links', () => {
    const workbooks = parseIdsMasterWorkbooks({
      formatted: [
        ['Labs done: 984', '', '', 'Go to my Laboratory Sheet'],
        ['Relics Owned: 198', '', '', 'Go to my Relics Sheet'],
        ['Relics', 'Copy Me', '1RelicsWorkbookIdXXXXXXXXXX', 'Go to my Relics Sheet'],
      ],
      formulas: [
        [
          'Labs done: 984',
          '',
          '',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1LaboratoryWorkbookIdXXXXXXX/edit","Go to my Laboratory Sheet")',
        ],
        [
          'Relics Owned: 198',
          '',
          '',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1JunkRelicsStatIdXXXXXXXX/edit","Go to my Relics Sheet")',
        ],
        [
          'Relics',
          'Copy Me',
          '1RelicsWorkbookIdXXXXXXXXXX',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1RelicsFromLinkIdXXXXXXXX/edit","Go to my Relics Sheet")',
        ],
      ],
    })
    expect(workbooks.map((w) => w.name)).toEqual(['Relics'])
  })

  it('uses fallback scan when header-based parse yields no known categories', () => {
    const workbooks = parseIdsMasterWorkbooks({
      formatted: [
        ['Banner', '1StaleTemplateWorkbookIdXXXXX', '', ''],
        ['Relics', 'Copy Me', '1RelicsWorkbookIdXXXXXXXXXX', 'Go to my Relics Sheet'],
        ['Modules', 'Copy Me', '1ModulesWorkbookIdXXXXXXXXX', 'Go to my Modules Sheet'],
      ],
      formulas: [
        ['Banner', '1StaleTemplateWorkbookIdXXXXX', '', ''],
        [
          'Relics',
          'Copy Me',
          '1RelicsWorkbookIdXXXXXXXXXX',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1RelicsFromLinkIdXXXXXXXX/edit","Go to my Relics Sheet")',
        ],
        [
          'Modules',
          'Copy Me',
          '1ModulesWorkbookIdXXXXXXXXX',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1ModulesWorkbookIdXXXXXXXXX/edit","Go to my Modules Sheet")',
        ],
      ],
    })
    expect(workbooks.map((w) => w.name)).toEqual(['Modules', 'Relics'])
  })

  it('parses category rows from resolved column D hyperlink URIs', () => {
    const workbooks = parseIdsMasterWorkbooks({
      formatted: [
        ['Relics', 'Copy Me', '1RelicsWorkbookIdXXXXXXXXXX', 'Go to my Relics Sheet'],
        ['Modules', 'Copy Me', '1ModulesWorkbookIdXXXXXXXXX', 'Go to my Modules Sheet'],
      ],
      formulas: [
        [
          'Relics',
          'Copy Me',
          '1RelicsWorkbookIdXXXXXXXXXX',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/"&C5&"/edit","Go to my Relics Sheet")',
        ],
        [
          'Modules',
          'Copy Me',
          '1ModulesWorkbookIdXXXXXXXXX',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/"&C6&"/edit","Go to my Modules Sheet")',
        ],
      ],
      columnDHyperlinks: [
        'https://docs.google.com/spreadsheets/d/1RelicsFromLinkIdXXXXXXXX/edit',
        'https://docs.google.com/spreadsheets/d/1ModulesWorkbookIdXXXXXXXXX/edit',
      ],
    })
    expect(findLinkedWorkbookByName(workbooks, 'Relics')?.spreadsheetId).toBe(
      '1RelicsFromLinkIdXXXXXXXX',
    )
    expect(findLinkedWorkbookByName(workbooks, 'Modules')?.spreadsheetId).toBe(
      '1ModulesWorkbookIdXXXXXXXXX',
    )
  })
})

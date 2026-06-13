import { describe, expect, it } from 'vitest'
import { lookupGuardiansWorkbookOnIdsGrid } from './lookupGuardiansOnIdsGrid'

const USER_GUARDIANS_ID = '1GuardiansWorkbookIdFromIdsGridXXXX'

describe('lookupGuardiansWorkbookOnIdsGrid', () => {
  it('finds Guardians workbook from category row', () => {
    const guardians = lookupGuardiansWorkbookOnIdsGrid({
      formatted: [
        ['Laboratory', 'Copy Me', '1LaboratoryWorkbookIdXXXXXXX', 'Go to my Laboratory Sheet'],
        ['Guardians v3.0.2', 'Copy Me', USER_GUARDIANS_ID, 'Go to my Guardians Sheet'],
      ],
      formulas: [
        [
          'Laboratory',
          'Copy Me',
          '1LaboratoryWorkbookIdXXXXXXX',
          '=HYPERLINK("https://docs.google.com/spreadsheets/d/1LaboratoryWorkbookIdXXXXXXX/edit","Go to my Laboratory Sheet")',
        ],
        [
          'Guardians v3.0.2',
          'Copy Me',
          USER_GUARDIANS_ID,
          `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_GUARDIANS_ID}/edit","Go to my Guardians Sheet")`,
        ],
      ],
    })
    expect(guardians).toEqual({
      name: 'Guardians',
      spreadsheetId: USER_GUARDIANS_ID,
    })
  })

  it('finds Guardians workbook from Go to my Guardians Sheet link text', () => {
    const guardians = lookupGuardiansWorkbookOnIdsGrid({
      formatted: [['', 'Copy Me', USER_GUARDIANS_ID, 'Go to my Guardians Sheet']],
      formulas: [
        [
          '',
          'Copy Me',
          USER_GUARDIANS_ID,
          `=HYPERLINK("https://docs.google.com/spreadsheets/d/${USER_GUARDIANS_ID}/edit","Go to my Guardians Sheet")`,
        ],
      ],
    })
    expect(guardians?.spreadsheetId).toBe(USER_GUARDIANS_ID)
    expect(guardians?.name).toBe('Guardians')
  })
})

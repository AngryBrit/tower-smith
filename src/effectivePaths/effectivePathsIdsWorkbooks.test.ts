import { describe, expect, it } from 'vitest'
import {
  EFFECTIVE_PATHS_IDS_WORKBOOK_NAMES,
  filterKnownIdsWorkbooks,
  isKnownIdsWorkbookName,
} from './effectivePathsIdsWorkbooks'

describe('filterKnownIdsWorkbooks', () => {
  it('keeps only the eleven IDS gateway categories in canonical order', () => {
    const filtered = filterKnownIdsWorkbooks([
      { name: 'IDS Collection', spreadsheetId: '1CollectionWorkbookIdXXXXXXXX' },
      { name: 'Modules', spreadsheetId: '1ModulesWorkbookIdXXXXXXXXX' },
      { name: 'Laboratory', spreadsheetId: '1LaboratoryWorkbookIdXXXXXXX' },
      { name: 'Relics', spreadsheetId: '1RelicsWorkbookIdXXXXXXXXXX' },
    ])
    expect(filtered.map((w) => w.name)).toEqual(['Laboratory', 'Relics', 'Modules'])
    expect(isKnownIdsWorkbookName('Themes & Songs')).toBe(true)
    expect(isKnownIdsWorkbookName('IDS Collection')).toBe(false)
    expect(EFFECTIVE_PATHS_IDS_WORKBOOK_NAMES).toHaveLength(11)
  })
})

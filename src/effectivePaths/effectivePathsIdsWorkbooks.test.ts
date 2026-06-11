import { describe, expect, it } from 'vitest'
import {
  EFFECTIVE_PATHS_IDS_WORKBOOK_NAMES,
  filterKnownIdsWorkbooks,
  isKnownIdsWorkbookName,
  sortLinkedWorkbookAccess,
} from './effectivePathsIdsWorkbooks'

describe('filterKnownIdsWorkbooks', () => {
  it('keeps only the eleven IDS gateway categories in canonical order', () => {
    const filtered = filterKnownIdsWorkbooks([
      { name: 'IDS Collection', spreadsheetId: '1CollectionWorkbookIdXXXXXXXX' },
      { name: 'Modules', spreadsheetId: '1ModulesWorkbookIdXXXXXXXXX' },
      { name: 'Laboratory', spreadsheetId: '1LaboratoryWorkbookIdXXXXXXX' },
      { name: 'Relics', spreadsheetId: '1RelicsWorkbookIdXXXXXXXXXX' },
    ])
    expect(filtered.map((w) => w.name)).toEqual(['Laboratory', 'Modules', 'Relics'])
    expect(isKnownIdsWorkbookName('Themes & Songs')).toBe(true)
    expect(isKnownIdsWorkbookName('Ultimate Weapons')).toBe(true)
    expect(isKnownIdsWorkbookName('UWs v3.1.2')).toBe(true)
    expect(isKnownIdsWorkbookName('IDS Collection')).toBe(false)
    expect(EFFECTIVE_PATHS_IDS_WORKBOOK_NAMES).toHaveLength(11)
  })

  it('sorts linked workbook access rows in canonical IDS order', () => {
    const sorted = sortLinkedWorkbookAccess([
      { name: 'Relics', spreadsheetId: '1Relics', access: 'ok' },
      { name: 'Laboratory', spreadsheetId: '1Labs', access: 'denied' },
      { name: 'Modules', spreadsheetId: '1Mods', access: 'ok' },
    ])
    expect(sorted.map((row) => row.name)).toEqual(['Laboratory', 'Modules', 'Relics'])
  })

  it('keeps Ultimate Weapon aliases in canonical IDS order', () => {
    const filtered = filterKnownIdsWorkbooks([
      { name: 'UWs v3.1.2', spreadsheetId: '1UwsWorkbookIdXXXXXXXXXXXXXX' },
      { name: 'Laboratory', spreadsheetId: '1LaboratoryWorkbookIdXXXXXXX' },
    ])
    expect(filtered.map((w) => w.name)).toEqual(['Laboratory', 'UWs v3.1.2'])
  })

  it('drops Home Page stat rows from linked workbook access lists', () => {
    const sorted = sortLinkedWorkbookAccess([
      { name: 'Relics', spreadsheetId: '1Relics', access: 'ok' },
      { name: 'Labs done: 984', spreadsheetId: '1Junk', access: 'ok' },
      { name: 'Completion: 97%', spreadsheetId: '1Junk2', access: 'ok' },
    ])
    expect(sorted.map((row) => row.name)).toEqual(['Relics'])
  })
})

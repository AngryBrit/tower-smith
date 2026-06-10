import { describe, expect, it } from 'vitest'
import {
  categoryNameKey,
  findCardsWorkbook,
  findRelicsWorkbook,
  findThemesWorkbook,
  isCardsWorkbookName,
  isRelicsWorkbookName,
  isThemesWorkbookName,
} from './effectivePathsCategoryNames'

describe('categoryNameKey', () => {
  it('strips leading emoji from IDS Master category labels', () => {
    expect(categoryNameKey('🔮 Relics')).toBe('relics')
    expect(categoryNameKey('Relics')).toBe('relics')
  })
})

describe('findRelicsWorkbook', () => {
  it('finds Relics among emoji-prefixed workbook names', () => {
    const found = findRelicsWorkbook([
      { name: 'Laboratory', spreadsheetId: '1LaboratoryWorkbookIdXXXXXXX' },
      { name: '🔮 Relics', spreadsheetId: '1RelicsWorkbookIdXXXXXXXXXX' },
    ])
    expect(found?.spreadsheetId).toBe('1RelicsWorkbookIdXXXXXXXXXX')
    expect(isRelicsWorkbookName('🔮 Relics')).toBe(true)
  })
})

describe('findThemesWorkbook', () => {
  it('finds Themes & Songs among emoji-prefixed workbook names', () => {
    const found = findThemesWorkbook([
      { name: 'Relics', spreadsheetId: '1RelicsWorkbookIdXXXXXXXXXX' },
      { name: '🎵 Themes & Songs', spreadsheetId: '1ThemesWorkbookIdXXXXXXXXX' },
    ])
    expect(found?.spreadsheetId).toBe('1ThemesWorkbookIdXXXXXXXXX')
    expect(isThemesWorkbookName('🎵 Themes & Songs')).toBe(true)
  })
})

describe('findCardsWorkbook', () => {
  it('finds Cards among emoji-prefixed workbook names', () => {
    const found = findCardsWorkbook([
      { name: 'Relics', spreadsheetId: '1RelicsWorkbookIdXXXXXXXXXX' },
      { name: '🃏 Cards', spreadsheetId: '1CardsWorkbookIdXXXXXXXXXXXX' },
    ])
    expect(found?.spreadsheetId).toBe('1CardsWorkbookIdXXXXXXXXXXXX')
    expect(isCardsWorkbookName('🃏 Cards')).toBe(true)
  })
})

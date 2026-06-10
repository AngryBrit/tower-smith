import { describe, expect, it } from 'vitest'
import {
  categoryNameKey,
  cleanEffectivePathsCategoryName,
  findBotsWorkbook,
  findCardsWorkbook,
  findRelicsWorkbook,
  findThemesWorkbook,
  findWorkshopWorkbook,
  findUwsWorkbook,
  isBotsWorkbookName,
  isUwsWorkbookName,
  isCardsWorkbookName,
  isRelicsWorkbookName,
  isThemesWorkbookName,
  isWorkshopWorkbookName,
} from './effectivePathsCategoryNames'

describe('categoryNameKey', () => {
  it('strips leading emoji from IDS Master category labels', () => {
    expect(categoryNameKey('🔮 Relics')).toBe('relics')
    expect(categoryNameKey('Relics')).toBe('relics')
  })
})

describe('cleanEffectivePathsCategoryName', () => {
  it('drops ID suffix from Ultimate Weapon IDS row labels', () => {
    expect(cleanEffectivePathsCategoryName('Ultimate Weapon ID')).toBe('Ultimate Weapon')
    expect(cleanEffectivePathsCategoryName('Ultimate Weapons')).toBe('Ultimate Weapon')
    expect(cleanEffectivePathsCategoryName('UWs v3.1.2')).toBe('Ultimate Weapon')
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

describe('findWorkshopWorkbook', () => {
  it('finds Workshop among emoji-prefixed workbook names', () => {
    const found = findWorkshopWorkbook([
      { name: 'Laboratory', spreadsheetId: '1LaboratoryWorkbookIdXXXXXXX' },
      { name: '🔧 Workshop', spreadsheetId: '1WorkshopWorkbookIdXXXXXXXXX' },
    ])
    expect(found?.spreadsheetId).toBe('1WorkshopWorkbookIdXXXXXXXXX')
    expect(isWorkshopWorkbookName('🔧 Workshop')).toBe(true)
  })
})

describe('findBotsWorkbook', () => {
  it('finds Bots among emoji-prefixed workbook names', () => {
    const found = findBotsWorkbook([
      { name: 'Workshop', spreadsheetId: '1WorkshopWorkbookIdXXXXXXXXX' },
      { name: '🤖 Bots', spreadsheetId: '1BotsWorkbookIdXXXXXXXXXXXXX' },
    ])
    expect(found?.spreadsheetId).toBe('1BotsWorkbookIdXXXXXXXXXXXXX')
    expect(isBotsWorkbookName('🤖 Bots')).toBe(true)
  })
})

describe('findUwsWorkbook', () => {
  it('finds UWs among versioned workbook names', () => {
    const found = findUwsWorkbook([
      { name: 'Laboratory', spreadsheetId: '1LaboratoryWorkbookIdXXXXXXX' },
      { name: 'UWs v3.1.2', spreadsheetId: '1UwsWorkbookIdXXXXXXXXXXXXXX' },
    ])
    expect(found?.spreadsheetId).toBe('1UwsWorkbookIdXXXXXXXXXXXXXX')
    expect(isUwsWorkbookName('UWs v3.1.2')).toBe(true)
    expect(isUwsWorkbookName('Ultimate Weapon')).toBe(true)
  })
})

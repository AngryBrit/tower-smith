import { describe, expect, it } from 'vitest'
import {
  parseThemesSheetTab,
  pickThemesSheetForSync,
  themeOwnedIdsFromParsedThemesTabs,
} from './resolveThemesSheetTab'

function buildTabRows(): string[][] {
  const rows = Array.from({ length: 40 }, () => Array<string>(26).fill(''))
  rows[1]![1] = 'Tower Skin'
  rows[1]![11] = 'Milestone Skin'
  rows[2]![1] = 'TRUE'
  rows[2]![2] = 'Star'
  rows[2]![11] = 'TRUE'
  rows[2]![12] = 'Shuriken'
  return rows
}

describe('resolveThemesSheetTab', () => {
  it('prefers a tab with milestone rows over a tab with more tower-event rows only', () => {
    const eventNames = ['Star', 'Plasma Ball', 'Bee', 'Alien', 'Water Droplet', 'Cherry Blossom']
    const summaryRows = Array.from({ length: 40 }, () => Array<string>(26).fill(''))
    summaryRows[1]![1] = 'Tower Skin'
    eventNames.forEach((name, i) => {
      summaryRows[2 + i]![1] = 'TRUE'
      summaryRows[2 + i]![2] = name
    })

    const input = parseThemesSheetTab('Themes & Songs Input', buildTabRows())!
    const summary = parseThemesSheetTab('Themes & Songs', summaryRows)!
    expect(summary!.themeRows.length).toBeGreaterThan(input.themeRows.length)

    expect(pickThemesSheetForSync([summary, input])?.sheetTitle).toBe('Themes & Songs Input')
    expect(pickThemesSheetForSync([input, summary])?.sheetTitle).toBe('Themes & Songs Input')
  })

  it('unions owned ids from every parsed tab on import', () => {
    const inputRows = buildTabRows()
    const otherRows = Array.from({ length: 40 }, () => Array<string>(26).fill(''))
    otherRows[1]![11] = 'Milestone Skin'
    otherRows[2]![11] = 'TRUE'
    otherRows[2]![12] = 'Donut'
    otherRows[3]![11] = 'FALSE'
    otherRows[3]![12] = 'Yin-Yang'

    const input = parseThemesSheetTab('Input', inputRows)!
    const other = parseThemesSheetTab('Other', otherRows)!
    expect(other).not.toBeNull()
    const owned = themeOwnedIdsFromParsedThemesTabs([input, other])

    expect(owned).toEqual(expect.arrayContaining(['tower-shuriken', 'tower-donut']))
  })
})

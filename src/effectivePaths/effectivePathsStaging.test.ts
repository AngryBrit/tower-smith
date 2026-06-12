import { describe, expect, it } from 'vitest'
import {
  EP_STAGING_TITLE_SUFFIX,
  effectivePathsStagingTabTitle,
  googleSpreadsheetTabUrl,
  isEffectivePathsStagingTabTitle,
} from './effectivePathsStaging'

describe('effectivePathsStaging', () => {
  it('builds preview tab titles from originals', () => {
    expect(effectivePathsStagingTabTitle('Relics')).toBe(`Relics${EP_STAGING_TITLE_SUFFIX}`)
  })

  it('detects preview tab titles', () => {
    expect(isEffectivePathsStagingTabTitle(`Relics${EP_STAGING_TITLE_SUFFIX}`)).toBe(true)
    expect(isEffectivePathsStagingTabTitle('Relics')).toBe(false)
  })

  it('builds spreadsheet tab urls', () => {
    expect(googleSpreadsheetTabUrl('abc123', 42)).toBe(
      'https://docs.google.com/spreadsheets/d/abc123/edit?gid=42#gid=42',
    )
  })
})

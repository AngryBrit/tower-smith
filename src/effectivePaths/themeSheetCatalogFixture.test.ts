import { describe, expect, it } from 'vitest'
import { buildCatalogV305FullRows } from './themeSheetCatalogFixture'
import { detectThemeSheetLayout, parseThemeRowsWithLayout, unmappedThemeNamesWithLayout } from './themeSheetLayout'
import { themeOwnedIdsFromSheetRows } from './themeOwnedIdsFromSheet'

describe('themeSheetCatalogFixture', () => {
  it('maps the full v3.0.5 catalog tab without unmapped theme names', () => {
    const rows = buildCatalogV305FullRows()
    const layout = detectThemeSheetLayout(rows)
    expect(layout).not.toBeNull()
    const parsed = parseThemeRowsWithLayout(rows, layout!)
    expect(parsed.length).toBeGreaterThan(130)
    const unmapped = [...new Set(unmappedThemeNamesWithLayout(rows, layout!))].sort()
    expect(unmapped).toEqual([])
    const owned = themeOwnedIdsFromSheetRows(parsed, rows)
    expect(owned.length).toBeGreaterThan(100)
    expect(owned).toEqual(
      expect.arrayContaining([
        'tower-event-star',
        'tower-shuriken',
        'bg-interstellar',
        'banner-mech',
        'banner-party',
        'banner-pixel',
        'banner-horror',
        'banner-cosmos',
        'banner-supernova',
        'banner-claw',
        'banner-magician',
      ]),
    )
    const bannerRows = parsed.filter((row) => row.section === 'banners')
    expect(bannerRows.map((row) => row.name)).toEqual([
      'Mech World',
      'Party',
      'Pixel Alien War',
      'Crimson Horror',
      'Cosy Cosmos',
      'Supernova',
      'Claw Machine',
      'Magician',
    ])
  })
})

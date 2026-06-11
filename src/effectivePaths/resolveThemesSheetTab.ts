import type { EffectivePathsThemeSheetRow } from './buildThemeOwnedUpdates'
import {
  detectThemeSheetLayout,
  parseThemeRowsWithLayout,
  type ThemeSheetLayout,
} from './themeSheetLayout'
import { themeOwnedIdsFromSheetRows } from './themeOwnedIdsFromSheet'

export type ParsedThemesSheetTab = {
  sheetTitle: string
  layout: ThemeSheetLayout
  themeRows: EffectivePathsThemeSheetRow[]
  rawRows: string[][]
}

export function parseThemesSheetTab(
  sheetTitle: string,
  grid: string[][],
): ParsedThemesSheetTab | null {
  const layout = detectThemeSheetLayout(grid)
  if (!layout) return null
  const themeRows = parseThemeRowsWithLayout(grid, layout)
  if (themeRows.length === 0) return null
  return { sheetTitle, layout, themeRows, rawRows: grid }
}

function milestoneRowCount(rows: readonly EffectivePathsThemeSheetRow[]): number {
  return rows.filter((row) => row.section === 'tower-milestone').length
}

/**
 * Pick the Themes & Songs tab to read/write. Prefer the first ordered candidate that
 * includes milestone skins — the summary tab often has more tower-event rows but empty M/N.
 */
export function pickThemesSheetForSync(
  candidates: readonly ParsedThemesSheetTab[],
): ParsedThemesSheetTab | null {
  if (candidates.length === 0) return null

  const withMilestones = candidates.find((tab) => milestoneRowCount(tab.themeRows) > 0)
  if (withMilestones) return withMilestones

  return candidates[0] ?? null
}

/** Union owned theme ids from every parsed Themes & Songs tab (import). */
export function themeOwnedIdsFromParsedThemesTabs(
  candidates: readonly ParsedThemesSheetTab[],
): string[] {
  const owned = new Set<string>()
  for (const tab of candidates) {
    for (const id of themeOwnedIdsFromSheetRows(tab.themeRows, tab.rawRows)) {
      owned.add(id)
    }
  }
  return [...owned].sort()
}

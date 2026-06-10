import { EFFECTIVE_PATHS_IDS_WORKBOOK_NAMES } from './effectivePathsIdsWorkbooks'
import { gameThemeIdFromSheetName, normalizeEffectivePathsThemeName, type EffectivePathsThemeSheetSection } from './themeSheetNames'
import type { EffectivePathsThemeSheetRow } from './buildThemeOwnedUpdates'
import { columnIndexToA1Letter, padSheetRowsToWidth } from './relicSheetLayout'

const IDS_WORKBOOK_LABEL_KEYS = new Set(
  EFFECTIVE_PATHS_IDS_WORKBOOK_NAMES.map((name) => normalizeEffectivePathsThemeName(name)),
)

export type ThemeSheetColumnSection = {
  section: EffectivePathsThemeSheetSection
  /** 0-based column index for theme name cells. */
  nameCol: number
  /** 0-based column index for owned checkboxes. */
  ownedCol: number
  /** Inclusive 0-based first data row for this block. */
  startRow: number
  /** Exclusive 0-based end row for this block. */
  endRow: number
}

export type ThemeSheetLayout = {
  sections: readonly ThemeSheetColumnSection[]
}

export { columnIndexToA1Letter, padSheetRowsToWidth }

/**
 * Single-column fetches — pair ranges (B1:C) shift when the owned cell is empty
 * because the Sheets API omits leading blanks within each range.
 */
export const THEME_SHEET_FETCH_RANGES = [
  'B1:S8',
  'B1:B120',
  'C1:C120',
  'E1:E120',
  'F1:F120',
  'M1:M120',
  'N1:N120',
  'Q1:Q120',
  'R1:R120',
] as const

const THEME_SHEET_GRID_WIDTH = 26
export const THEME_SHEET_GRID_ROWS = 120

function a1ColumnToIndex0(letters: string): number {
  let index = 0
  for (const ch of letters) {
    index = index * 26 + (ch.charCodeAt(0) - 65 + 1)
  }
  return index - 1
}

/** Clip theme fetch ranges to a tab's grid size (avoids API "exceeds grid limits" errors). */
export function themeSheetFetchRangesForGrid(
  rowCount: number,
  columnCount: number,
): readonly string[] {
  const maxRow = Math.max(1, Math.min(rowCount, THEME_SHEET_GRID_ROWS))
  const out: string[] = []
  for (const slice of THEME_SHEET_FETCH_RANGES) {
    const match = slice.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/)
    if (!match) continue
    const [, startCol, startRowText, endCol, endRowText] = match
    if (a1ColumnToIndex0(startCol!) >= columnCount || a1ColumnToIndex0(endCol!) >= columnCount) {
      continue
    }
    const startRow = Number(startRowText)
    const endRow = Math.min(Number(endRowText), maxRow)
    if (endRow < startRow) continue
    out.push(`${startCol}${startRow}:${endCol}${endRow}`)
  }
  return out
}

const SINGLE_COLUMN_BLOCKS: readonly { suffix: string; col: number }[] = [
  { suffix: '!B1:B', col: 1 },
  { suffix: '!C1:C', col: 2 },
  { suffix: '!E1:E', col: 4 },
  { suffix: '!F1:F', col: 5 },
  { suffix: '!M1:M', col: 12 },
  { suffix: '!N1:N', col: 13 },
  { suffix: '!Q1:Q', col: 16 },
  { suffix: '!R1:R', col: 17 },
]

type ThemeSheetValueRange = {
  range?: string
  values?: readonly (readonly unknown[])[]
}

/** Merge per-block API ranges into a single A-aligned grid. */
export function buildThemeSheetGridFromBlockRanges(
  valueRanges: readonly ThemeSheetValueRange[],
): string[][] {
  const grid: string[][] = Array.from({ length: THEME_SHEET_GRID_ROWS }, () =>
    Array(THEME_SHEET_GRID_WIDTH).fill(''),
  )

  const placeHeaderStrip = (values: readonly (readonly unknown[])[]) => {
    for (let row = 0; row < values.length && row < THEME_SHEET_GRID_ROWS; row++) {
      const source = values[row] ?? []
      for (let col = 0; col < source.length; col++) {
        grid[row]![1 + col] = cellValueToString(source[col])
      }
    }
  }

  const placeColumn = (values: readonly (readonly unknown[])[], col: number) => {
    for (let row = 0; row < values.length && row < THEME_SHEET_GRID_ROWS; row++) {
      grid[row]![col] = cellValueToString(values[row]?.[0])
    }
  }

  const headerStrips: (readonly (readonly unknown[])[])[] = []
  for (const block of valueRanges) {
    const range = block.range ?? ''
    const values = block.values ?? []
    if (range.includes('!B1:S')) headerStrips.push(values)
    else {
      const hit = SINGLE_COLUMN_BLOCKS.find((entry) => range.includes(entry.suffix))
      if (hit) placeColumn(values, hit.col)
    }
  }
  for (const values of headerStrips) placeHeaderStrip(values)

  return grid
}

/** Header anchors on the Themes & Songs tab (0-based column = A). */
const THEME_SHEET_COLUMN_ANCHORS: readonly { pattern: RegExp; sheetCol: number }[] = [
  { pattern: /tower skin/i, sheetCol: 1 },
  { pattern: /background skin/i, sheetCol: 4 },
  { pattern: /milestone skin/i, sheetCol: 12 },
  { pattern: /^menu$/i, sheetCol: 16 },
] as const

/**
 * Google Sheets omits leading empty cells per row; column A is blank on this tab so
 * API rows start at B. Re-align to A:Z indices before reading B/C, E/F, M/N, Q/R.
 */
export function alignThemeSheetRowsToColumnA(
  rows: readonly (readonly unknown[])[],
): string[][] {
  let padLeft = 0
  for (let rowIndex = 0; rowIndex < Math.min(rows.length, 25); rowIndex++) {
    const row = rows[rowIndex] ?? []
    for (let col = 0; col < row.length; col++) {
      const cell = cellValueToString(row[col])
      if (!cell) continue
      for (const anchor of THEME_SHEET_COLUMN_ANCHORS) {
        if (!anchor.pattern.test(cell.trim())) continue
        padLeft = anchor.sheetCol - col
        rowIndex = rows.length
        break
      }
    }
  }

  const width = 26
  return rows.map((row) => {
    const cells = row.map((cell) => cellValueToString(cell))
    const aligned: string[] = Array(Math.max(0, padLeft)).fill('')
    aligned.push(...cells)
    while (aligned.length < width) aligned.push('')
    return aligned.slice(0, width)
  })
}

type SectionDef = {
  section: EffectivePathsThemeSheetSection
  header: RegExp
  nameCol: number
  ownedCol: number
}

/**
 * Effective Paths Themes & Songs v3.x input tab.
 * Owned checkboxes: B (tower event), E (background), M (milestone/songs/guardians), Q (menu/banners).
 */
const EP_THEME_SECTION_DEFS: readonly SectionDef[] = [
  { section: 'tower-event', header: /tower skin/i, nameCol: 2, ownedCol: 1 },
  { section: 'background', header: /background skin/i, nameCol: 5, ownedCol: 4 },
  { section: 'tower-milestone', header: /milestone skin/i, nameCol: 13, ownedCol: 12 },
  { section: 'music', header: /^songs$/i, nameCol: 13, ownedCol: 12 },
  { section: 'guardian', header: /^guardians$/i, nameCol: 13, ownedCol: 12 },
  { section: 'menus', header: /^menu$/i, nameCol: 17, ownedCol: 16 },
  { section: 'banners', header: /profile banner/i, nameCol: 17, ownedCol: 16 },
] as const

function cellValueToString(raw: unknown): string {
  if (raw == null) return ''
  if (typeof raw === 'boolean') return raw ? 'TRUE' : 'FALSE'
  if (typeof raw === 'number') return String(raw)
  return String(raw).trim()
}

function cellAt(rows: readonly (readonly unknown[])[], row: number, col: number): string {
  return cellValueToString(rows[row]?.[col])
}

function isJunkThemeSheetNameCell(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  const lower = trimmed.toLowerCase()
  return (
    /^tier\s*\d+/i.test(trimmed) ||
    /^pass\s*\d+/i.test(lower) ||
    lower === 'free' ||
    /^x\d+$/i.test(trimmed) ||
    /^\d+([.,]\d+)?%$/.test(trimmed) ||
    /^\+[\d.]+%$/.test(trimmed)
  )
}

function isIdsWorkbookCategoryLabel(value: string): boolean {
  const key = normalizeEffectivePathsThemeName(value)
  return key.length > 0 && IDS_WORKBOOK_LABEL_KEYS.has(key)
}

function isHeaderLikeNameCell(value: string): boolean {
  const lower = value.trim().toLowerCase()
  return (
    isIdsWorkbookCategoryLabel(value) ||
    lower === 'name' ||
    lower === 'theme' ||
    lower === 'themes' ||
    lower === 'owned' ||
    lower === 'unlocked' ||
    lower === 'song' ||
    lower === 'songs' ||
    lower === 'tower' ||
    lower === 'tower skin' ||
    lower === 'background' ||
    lower === 'background skin' ||
    lower === 'milestone skin' ||
    lower === 'guardians' ||
    lower === 'menu' ||
    lower === 'profile banner' ||
    lower === 'tier unlocked' ||
    lower === 'event name' ||
    lower === 'reroll' ||
    lower === 'total bonuses' ||
    lower === 'total bonus' ||
    lower.startsWith('total ') ||
    lower.includes('auto-fill')
  )
}

function isLikelyDataRowName(
  value: string,
  section: EffectivePathsThemeSheetSection,
): boolean {
  const trimmed = value.trim()
  if (!trimmed || isHeaderLikeNameCell(trimmed) || isJunkThemeSheetNameCell(trimmed)) return false
  return gameThemeIdFromSheetName(trimmed, section) != null
}

function findHeaderRow(rows: readonly (readonly unknown[])[], pattern: RegExp): number | null {
  const limit = Math.min(rows.length, 80)
  for (let rowIndex = 0; rowIndex < limit; rowIndex++) {
    const row = rows[rowIndex] ?? []
    for (let col = 0; col < row.length; col++) {
      const cell = cellAt(rows, rowIndex, col)
      if (cell && pattern.test(cell.trim())) return rowIndex
    }
  }
  return null
}

function detectThemeSheetSections(
  rows: readonly (readonly unknown[])[],
): ThemeSheetColumnSection[] {
  const hits: (SectionDef & { headerRow: number })[] = []
  for (const def of EP_THEME_SECTION_DEFS) {
    const headerRow = findHeaderRow(rows, def.header)
    if (headerRow != null) hits.push({ ...def, headerRow })
  }
  if (hits.length === 0) return []

  const mColumnHeaders = hits
    .filter((hit) => hit.nameCol === 13)
    .sort((a, b) => a.headerRow - b.headerRow)
  const qColumnHeaders = hits
    .filter((hit) => hit.nameCol === 17)
    .sort((a, b) => a.headerRow - b.headerRow)

  const sections: ThemeSheetColumnSection[] = []
  for (const hit of hits) {
    const startRow = hit.headerRow + 1
    let endRow = rows.length

    if (hit.nameCol === 13) {
      const idx = mColumnHeaders.findIndex((row) => row.headerRow === hit.headerRow)
      const next = mColumnHeaders[idx + 1]
      if (next) endRow = next.headerRow
    } else if (hit.nameCol === 17) {
      const idx = qColumnHeaders.findIndex((row) => row.headerRow === hit.headerRow)
      const next = qColumnHeaders[idx + 1]
      if (next) endRow = next.headerRow
    }

    if (endRow <= startRow) continue
    sections.push({
      section: hit.section,
      nameCol: hit.nameCol,
      ownedCol: hit.ownedCol,
      startRow,
      endRow,
    })
  }

  return sections
}

/** Detect the Themes & Songs v3.x input layout from section headers. */
export function detectThemeSheetLayout(
  rows: readonly (readonly unknown[])[],
): ThemeSheetLayout | null {
  if (rows.length === 0) return null

  const sections = detectThemeSheetSections(rows)
  if (sections.length === 0) return null

  let mappedNames = 0
  for (const section of sections) {
    for (let row = section.startRow; row < section.endRow; row++) {
      if (isLikelyDataRowName(cellAt(rows, row, section.nameCol), section.section)) mappedNames++
    }
  }
  if (mappedNames < 2) return null

  return { sections }
}

export function parseThemeRowsWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: ThemeSheetLayout,
): EffectivePathsThemeSheetRow[] {
  const out: EffectivePathsThemeSheetRow[] = []
  for (const section of layout.sections) {
    for (let i = section.startRow; i < section.endRow; i++) {
      const name = cellAt(rows, i, section.nameCol)
      if (!isLikelyDataRowName(name, section.section)) continue
      out.push({
        rowIndex: i + 1,
        name,
        section: section.section,
        ownedCol: section.ownedCol,
      })
    }
  }
  return out
}

export function unmappedThemeNamesWithLayout(
  rows: readonly (readonly unknown[])[],
  layout: ThemeSheetLayout,
): string[] {
  const out: string[] = []
  for (const section of layout.sections) {
    for (let i = section.startRow; i < section.endRow; i++) {
      const name = cellAt(rows, i, section.nameCol)
      if (!name || isHeaderLikeNameCell(name) || isJunkThemeSheetNameCell(name)) continue
      if (gameThemeIdFromSheetName(name, section.section)) continue
      const owned = cellAt(rows, i, section.ownedCol).toUpperCase()
      if (!owned && !name) continue
      out.push(name)
    }
  }
  return out
}

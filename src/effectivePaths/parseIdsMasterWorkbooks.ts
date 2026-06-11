import { cleanEffectivePathsCategoryName, categoryNameKey } from './effectivePathsCategoryNames'
import { filterKnownIdsWorkbooks } from './effectivePathsIdsWorkbooks'
import { extractSpreadsheetIdFromCell, extractSpreadsheetIdFromSheetCell } from './extractSpreadsheetId'
import { pickSpreadsheetIdFromIdsCategoryRow } from './pickIdsRowSpreadsheetId'

export type EffectivePathsLinkedWorkbook = {
  name: string
  spreadsheetId: string
}

export type IdsMasterSheetGrid = {
  formatted: readonly (readonly string[])[]
  formulas?: readonly (readonly string[])[]
  /** Resolved hyperlink URI for column D per row (from Sheets grid metadata). */
  columnDHyperlinks?: readonly string[]
}

function normalizeWorkbookName(name: string): string {
  return categoryNameKey(name)
}

/** Home Page / IDS tab progress stats (not linked workbook categories). */
function looksLikeIdsStatsRowName(name: string): boolean {
  const trimmed = name.trim()
  const lower = trimmed.toLowerCase()
  if (!trimmed) return false
  return (
    /\bspent\s*:/i.test(trimmed) ||
    /\bdone\s*:/i.test(trimmed) ||
    /^total bonus\s*:/i.test(lower) ||
    /^relics owned\s*:/i.test(lower) ||
    /^completion\s*:/i.test(lower) ||
    /^keys spent\s*:/i.test(lower) ||
    /^bits spent\s*:/i.test(lower) ||
    /^medals spent\s*:/i.test(lower) ||
    /^stones spent\s*:/i.test(lower) ||
    /^ws\+\s*spent\s*:/i.test(lower) ||
    /^tier\s+\d+\s*:/i.test(trimmed) ||
    /^labs done\s*:/i.test(lower)
  )
}

/** IDS Master category rows and banner text to ignore. */
function shouldSkipIdsMasterRowName(name: string): boolean {
  const lower = name.trim().toLowerCase()
  if (!lower) return true
  if (looksLikeIdsStatsRowName(name)) return true
  return (
    /^copy me$/i.test(lower) ||
    /^go to my\b/i.test(lower) ||
    /this sheet id/i.test(lower) ||
    /list of ids/i.test(lower) ||
    /for each category/i.test(lower) ||
    /update master/i.test(lower) ||
    /^trouble/i.test(lower) ||
    /^help\b/i.test(lower) ||
    /^note\b/i.test(lower) ||
    /^click\b/i.test(lower) ||
    /^authorize/i.test(lower) ||
    /^loading/i.test(lower) ||
    /^#ref!/i.test(lower)
  )
}

function isHeaderCell(cell: string, patterns: RegExp[]): boolean {
  const lower = cell.trim().toLowerCase()
  return patterns.some((re) => re.test(lower))
}

function cellAt(
  rows: readonly (readonly string[])[],
  rowIndex: number,
  colIndex: number,
): string {
  return rows[rowIndex]?.[colIndex]?.trim() ?? ''
}

function detectIdsMasterColumns(
  rows: readonly (readonly string[])[],
): { nameCol: number; idCol: number; startRow: number } {
  const nameHeader = [/sheet\s*name/, /^sheet$/, /workbook/, /^name$/, /^title$/, /^file$/]
  const idHeader = [/spreadsheet/, /sheet\s*id/, /^id$/, /url/, /link/, /^key$/]

  for (let rowIndex = 0; rowIndex < Math.min(rows.length, 30); rowIndex++) {
    const row = rows[rowIndex] ?? []
    let nameCol = -1
    let idCol = -1
    for (let col = 0; col < row.length; col++) {
      const cell = row[col]?.trim() ?? ''
      if (!cell) continue
      if (nameCol < 0 && isHeaderCell(cell, nameHeader)) nameCol = col
      if (idCol < 0 && isHeaderCell(cell, idHeader)) idCol = col
    }
    if (nameCol >= 0 && idCol >= 0) {
      return { nameCol, idCol, startRow: rowIndex + 1 }
    }
  }

  return { nameCol: 0, idCol: 1, startRow: 0 }
}

function parseIdsMasterRows(
  grid: IdsMasterSheetGrid,
  nameCol: number,
  _idCol: number,
  startRow: number,
): EffectivePathsLinkedWorkbook[] {
  const { formatted, formulas } = grid
  const out: EffectivePathsLinkedWorkbook[] = []
  const seen = new Set<string>()

  for (let rowIndex = startRow; rowIndex < formatted.length; rowIndex++) {
    const row = formatted[rowIndex] ?? []
    const formulaRow = formulas?.[rowIndex]
    const name = cellAt(formatted, rowIndex, nameCol)
    const rowFormatted: string[] = []
    const rowFormulas: string[] = []
    const maxCols = Math.max(row.length, formulaRow?.length ?? 0)
    for (let col = 0; col < maxCols; col++) {
      rowFormatted[col] = cellAt(formatted, rowIndex, col)
      rowFormulas[col] = formulaRow?.[col]?.trim() ?? ''
    }
    const spreadsheetId = pickSpreadsheetIdFromIdsCategoryRow(
      rowFormatted,
      rowFormulas,
      grid.columnDHyperlinks?.[rowIndex],
    )

    if (!name || !spreadsheetId) continue
    if (shouldSkipIdsMasterRowName(name)) continue
    if (isHeaderCell(name, [/sheet\s*name/, /^sheet$/, /workbook/, /^name$/])) continue
    if (extractSpreadsheetIdFromSheetCell(name)) continue

    const key = `${normalizeWorkbookName(name)}:${spreadsheetId}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ name: cleanEffectivePathsCategoryName(name), spreadsheetId })
  }

  return out
}

function parseIdsMasterFallbackScan(grid: IdsMasterSheetGrid): EffectivePathsLinkedWorkbook[] {
  const { formatted, formulas } = grid
  const out: EffectivePathsLinkedWorkbook[] = []
  const seen = new Set<string>()

  for (let rowIndex = 0; rowIndex < formatted.length; rowIndex++) {
    const formulaRow = formulas?.[rowIndex]
    const row = formatted[rowIndex] ?? []
    const maxCols = Math.max(row.length, formulaRow?.length ?? 0)

    const rowFormatted: string[] = []
    const rowFormulas: string[] = []
    for (let col = 0; col < maxCols; col++) {
      rowFormatted[col] = cellAt(formatted, rowIndex, col)
      rowFormulas[col] = formulaRow?.[col]?.trim() ?? ''
    }
    const spreadsheetId = pickSpreadsheetIdFromIdsCategoryRow(
      rowFormatted,
      rowFormulas,
      grid.columnDHyperlinks?.[rowIndex],
    )
    if (!spreadsheetId) continue

    let idCol = -1
    for (let col = 0; col < maxCols; col++) {
      if (extractSpreadsheetIdFromCell(rowFormatted[col] ?? '') === spreadsheetId) {
        idCol = col
        break
      }
    }

    let name = ''
    for (let col = 0; col < maxCols; col++) {
      if (col === idCol) continue
      const candidate = cellAt(formatted, rowIndex, col)
      if (!candidate) continue
      if (extractSpreadsheetIdFromSheetCell(candidate, formulaRow?.[col])) continue
      if (shouldSkipIdsMasterRowName(candidate)) continue
      if (isHeaderCell(candidate, [/sheet\s*name/, /^sheet$/, /workbook/, /^name$/, /^id$/])) {
        continue
      }
      name = candidate
      break
    }
    if (!name) continue

    const key = `${normalizeWorkbookName(name)}:${spreadsheetId}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ name: cleanEffectivePathsCategoryName(name), spreadsheetId })
  }

  return out
}

/** Parse the IDS Master workbook table into linked spreadsheet entries. */
export function parseIdsMasterWorkbooks(grid: IdsMasterSheetGrid): EffectivePathsLinkedWorkbook[] {
  if (grid.formatted.length === 0) return []

  const { nameCol, idCol, startRow } = detectIdsMasterColumns(grid.formatted)
  const primary = parseIdsMasterRows(grid, nameCol, idCol, startRow)
  const knownPrimary = filterKnownIdsWorkbooks(primary)
  if (knownPrimary.length > 0) return knownPrimary

  const fallback = parseIdsMasterFallbackScan(grid)
  const knownFallback = filterKnownIdsWorkbooks(fallback)
  return knownFallback.length > 0 ? knownFallback : knownPrimary
}

export function findLinkedWorkbookByName(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
  targetName: string,
): EffectivePathsLinkedWorkbook | null {
  const norm = normalizeWorkbookName(targetName)
  const exact = workbooks.find((w) => normalizeWorkbookName(w.name) === norm)
  if (exact) return exact
  return workbooks.find((w) => normalizeWorkbookName(w.name).includes(norm)) ?? null
}

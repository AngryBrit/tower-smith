import {
  cleanEffectivePathsCategoryName,
  isRelicsWorkbookName,
} from './effectivePathsCategoryNames'
import { pickSpreadsheetIdFromIdsCategoryRow } from './pickIdsRowSpreadsheetId'
import type { EffectivePathsLinkedWorkbook, IdsMasterSheetGrid } from './parseIdsMasterWorkbooks'

function cellAt(
  rows: readonly (readonly string[])[],
  rowIndex: number,
  colIndex: number,
): string {
  return rows[rowIndex]?.[colIndex]?.trim() ?? ''
}

/**
 * Find the Relics **workbook** spreadsheet ID on the IDS gateway tab.
 * Relics is a separate Google Spreadsheet — IDS only stores its ID in a category row.
 */
export function lookupRelicsWorkbookOnIdsGrid(
  grid: IdsMasterSheetGrid,
): EffectivePathsLinkedWorkbook | null {
  const { formatted, formulas } = grid

  for (let rowIndex = 0; rowIndex < formatted.length; rowIndex++) {
    const formulaRow = formulas?.[rowIndex]
    const maxCols = Math.max(formatted[rowIndex]?.length ?? 0, formulaRow?.length ?? 0)

    let relicsRow = false
    let name = ''

    for (let col = 0; col < maxCols; col++) {
      const cell = cellAt(formatted, rowIndex, col)
      if (!cell) continue
      if (isRelicsWorkbookName(cell)) {
        relicsRow = true
        name = cleanEffectivePathsCategoryName(cell)
        break
      }
      if (/go to my relics?\b/i.test(cell)) {
        relicsRow = true
        name = name || 'Relics'
      }
    }

    if (!relicsRow) continue

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
    return { name: name || 'Relics', spreadsheetId }
  }

  return null
}

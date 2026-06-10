import { cleanEffectivePathsCategoryName, isBotsWorkbookName } from './effectivePathsCategoryNames'
import { pickSpreadsheetIdFromIdsCategoryRow } from './pickIdsRowSpreadsheetId'
import type { EffectivePathsLinkedWorkbook, IdsMasterSheetGrid } from './parseIdsMasterWorkbooks'

function cellAt(
  rows: readonly (readonly string[])[],
  rowIndex: number,
  colIndex: number,
): string {
  return rows[rowIndex]?.[colIndex]?.trim() ?? ''
}

/** Find the Bots workbook spreadsheet ID on the IDS gateway tab. */
export function lookupBotsWorkbookOnIdsGrid(
  grid: IdsMasterSheetGrid,
): EffectivePathsLinkedWorkbook | null {
  const { formatted, formulas } = grid

  for (let rowIndex = 0; rowIndex < formatted.length; rowIndex++) {
    const formulaRow = formulas?.[rowIndex]
    const maxCols = Math.max(formatted[rowIndex]?.length ?? 0, formulaRow?.length ?? 0)

    let botsRow = false
    let name = ''

    for (let col = 0; col < maxCols; col++) {
      const cell = cellAt(formatted, rowIndex, col)
      if (!cell) continue
      if (isBotsWorkbookName(cell)) {
        botsRow = true
        name = cleanEffectivePathsCategoryName(cell)
        break
      }
      if (/go to my bots\b/i.test(cell)) {
        botsRow = true
        name = name || 'Bots'
      }
    }

    if (!botsRow) continue

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
    return { name: name || 'Bots', spreadsheetId }
  }

  return null
}

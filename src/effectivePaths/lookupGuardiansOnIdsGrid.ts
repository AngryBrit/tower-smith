import { cleanEffectivePathsCategoryName, isGuardiansWorkbookName } from './effectivePathsCategoryNames'
import { pickSpreadsheetIdFromIdsCategoryRow } from './pickIdsRowSpreadsheetId'
import type { EffectivePathsLinkedWorkbook, IdsMasterSheetGrid } from './parseIdsMasterWorkbooks'

function cellAt(
  rows: readonly (readonly string[])[],
  rowIndex: number,
  colIndex: number,
): string {
  return rows[rowIndex]?.[colIndex]?.trim() ?? ''
}

/** Find the Guardians workbook spreadsheet ID on the IDS gateway tab. */
export function lookupGuardiansWorkbookOnIdsGrid(
  grid: IdsMasterSheetGrid,
): EffectivePathsLinkedWorkbook | null {
  const { formatted, formulas } = grid

  for (let rowIndex = 0; rowIndex < formatted.length; rowIndex++) {
    const formulaRow = formulas?.[rowIndex]
    const maxCols = Math.max(formatted[rowIndex]?.length ?? 0, formulaRow?.length ?? 0)

    let guardiansRow = false
    let name = ''

    for (let col = 0; col < maxCols; col++) {
      const cell = cellAt(formatted, rowIndex, col)
      if (!cell) continue
      if (isGuardiansWorkbookName(cell)) {
        guardiansRow = true
        name = cleanEffectivePathsCategoryName(cell)
        break
      }
      if (/go to my guardians\b/i.test(cell)) {
        guardiansRow = true
        name = name || 'Guardians'
      }
    }

    if (!guardiansRow) continue

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
    return { name: name || 'Guardians', spreadsheetId }
  }

  return null
}

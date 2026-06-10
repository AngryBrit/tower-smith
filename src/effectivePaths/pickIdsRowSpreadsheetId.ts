import {
  extractSpreadsheetIdFromFormula,
  extractSpreadsheetIdFromSheetCell,
} from './extractSpreadsheetId'

/** IDS Master category row: A=name, B=Copy Me, C=template (ignored), D=Go to my … Sheet link. */
export const IDS_CATEGORY_GO_LINK_COL = 3

/**
 * Pick the workbook spreadsheet ID from one IDS Master category row.
 * Only column D (“Go to my … Sheet” HYPERLINK or URL) is used; column C is ignored.
 */
export function pickSpreadsheetIdFromIdsCategoryRow(
  formatted: readonly string[],
  formulas?: readonly string[],
  columnDHyperlinkUri?: string,
): string | null {
  const linkUri = columnDHyperlinkUri?.trim() ?? ''
  if (linkUri) {
    const fromUri = extractSpreadsheetIdFromSheetCell(linkUri)
    if (fromUri) return fromUri
  }

  const linkCol = resolveIdsGoLinkColumn(formatted)
  const linkCell = formatted[linkCol]?.trim() ?? ''
  const linkFormula = formulas?.[linkCol]?.trim() ?? ''

  if (linkFormula.includes('HYPERLINK')) {
    const fromLink = extractSpreadsheetIdFromFormula(linkFormula)
    if (fromLink) return fromLink
    const fromRowFormula = findHyperlinkFormulaForGoLink(formulas, linkCell)
    if (fromRowFormula) {
      const fromScanned = extractSpreadsheetIdFromFormula(fromRowFormula)
      if (fromScanned) return fromScanned
    }
  }

  if (linkCell) {
    return extractSpreadsheetIdFromSheetCell(linkCell, linkFormula)
  }

  return null
}

function resolveIdsGoLinkColumn(formatted: readonly string[]): number {
  if (/go to my\b/i.test(formatted[IDS_CATEGORY_GO_LINK_COL]?.trim() ?? '')) {
    return IDS_CATEGORY_GO_LINK_COL
  }
  for (let col = 0; col < formatted.length; col++) {
    if (col === 2) continue
    if (/go to my\b/i.test(formatted[col]?.trim() ?? '')) return col
  }
  return IDS_CATEGORY_GO_LINK_COL
}

function findHyperlinkFormulaForGoLink(
  formulas: readonly string[] | undefined,
  linkLabel: string,
): string | null {
  if (!formulas?.length) return null
  const label = linkLabel.trim().toLowerCase()
  for (let col = 0; col < formulas.length; col++) {
    if (col === 2) continue
    const formula = formulas[col]?.trim() ?? ''
    if (!formula.includes('HYPERLINK')) continue
    if (!label || formula.toLowerCase().includes(label)) return formula
  }
  return null
}

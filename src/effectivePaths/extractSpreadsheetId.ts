const SPREADSHEET_ID_RE = /^[a-zA-Z0-9_-]{20,}$/

/** Pull a spreadsheet ID from a cell value (raw ID or Google Sheets URL). */
export function extractSpreadsheetIdFromCell(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  if (urlMatch?.[1]) return urlMatch[1]
  if (SPREADSHEET_ID_RE.test(trimmed)) return trimmed
  return null
}

/** Extract spreadsheet ID from a Sheets formula cell (e.g. HYPERLINK). */
export function extractSpreadsheetIdFromFormula(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (!trimmed.startsWith('=')) {
    return extractSpreadsheetIdFromCell(trimmed)
  }

  const hyperlink = trimmed.match(/HYPERLINK\s*\(\s*["']([^"']+)["']/i)
  if (hyperlink?.[1]) {
    const fromLink = extractSpreadsheetIdFromCell(hyperlink[1])
    if (fromLink) return fromLink
  }

  for (const quoted of trimmed.matchAll(/["']([^"']+)["']/g)) {
    const fromQuoted = extractSpreadsheetIdFromCell(quoted[1] ?? '')
    if (fromQuoted) return fromQuoted
  }

  return null
}

function looksTruncatedSpreadsheetId(value: string): boolean {
  return /\.\.\./.test(value) && !extractSpreadsheetIdFromCell(value)
}

/** Prefer formula-derived IDs (hyperlinks), then formatted/plain cell text. */
export function extractSpreadsheetIdFromSheetCell(
  formatted: string,
  formula?: string,
): string | null {
  if (formula?.trim()) {
    const fromFormula = extractSpreadsheetIdFromFormula(formula)
    if (fromFormula) return fromFormula
  }
  if (looksTruncatedSpreadsheetId(formatted)) return null
  return extractSpreadsheetIdFromCell(formatted)
}

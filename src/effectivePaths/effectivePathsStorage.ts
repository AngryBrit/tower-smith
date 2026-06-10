const SPREADSHEET_REF_STORAGE_KEY = 'tower-effective-paths-spreadsheet-v1'

export function readStoredSpreadsheetRef(): string {
  try {
    return localStorage.getItem(SPREADSHEET_REF_STORAGE_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

export function writeStoredSpreadsheetRef(value: string): void {
  try {
    const trimmed = value.trim()
    if (!trimmed) {
      localStorage.removeItem(SPREADSHEET_REF_STORAGE_KEY)
      return
    }
    localStorage.setItem(SPREADSHEET_REF_STORAGE_KEY, trimmed)
  } catch {
    /* ignore quota / private mode */
  }
}

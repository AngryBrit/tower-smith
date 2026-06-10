const SPREADSHEET_ID_RE = /^[a-zA-Z0-9_-]{20,}$/

export type ParsedSpreadsheetRef = {
  spreadsheetId: string
  sheetGid: number | null
}

/** Extract spreadsheet ID and optional tab gid from a pasted URL or raw ID. */
export function parseSpreadsheetRef(input: string): ParsedSpreadsheetRef | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (SPREADSHEET_ID_RE.test(trimmed) && !trimmed.includes('/')) {
    return { spreadsheetId: trimmed, sheetGid: null }
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  if (!url.hostname.includes('docs.google.com')) return null

  const pathMatch = url.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  if (!pathMatch?.[1]) return null

  const gidRaw = url.searchParams.get('gid') ?? url.hash.match(/gid=(\d+)/)?.[1]
  const sheetGid =
    gidRaw != null && /^\d+$/.test(gidRaw) ? Number.parseInt(gidRaw, 10) : null

  return { spreadsheetId: pathMatch[1], sheetGid }
}

export function googleSpreadsheetEditUrl(spreadsheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit`
}

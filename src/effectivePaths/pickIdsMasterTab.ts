import type { SheetTabProperties } from './pickRelicTab'

/** Tab titles on IDS Master workbooks (priority order). */
const IDS_MASTER_TAB_PRIORITY: readonly RegExp[] = [
  /^ids$/i,
  /^ids master$/i,
  /^master sheet$/i,
  /^_ids$/i,
]

/** Pick the tab that holds the linked-workbook ID table inside IDS Master. */
export function pickIdsMasterTab(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties | null {
  return orderedIdsMasterTabs(sheets, sheetGid)[0] ?? null
}

/** Tabs to scan, most likely first (IDS tab before Home Page). */
export function orderedIdsMasterTabs(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties[] {
  const props = sheets.map((sheet) => sheet.properties)
  const out: SheetTabProperties[] = []

  if (sheetGid != null) {
    const byGid = props.find((tab) => tab.sheetId === sheetGid)
    if (byGid) out.push(byGid)
  }

  for (const pattern of IDS_MASTER_TAB_PRIORITY) {
    const tab = props.find((entry) => pattern.test(entry.title.trim()))
    if (tab && !out.some((existing) => existing.sheetId === tab.sheetId)) {
      out.push(tab)
    }
  }

  for (const tab of props) {
    if (!out.some((existing) => existing.sheetId === tab.sheetId)) {
      out.push(tab)
    }
  }

  return out
}

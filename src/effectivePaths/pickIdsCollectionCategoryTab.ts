import {
  idsCollectionMsTabTitle,
  isIdsCollectionSpreadsheet,
  findSheetTabByTitle,
} from './idsCollectionLayout'
import type { SheetTabProperties } from './pickRelicTab'

type SheetEntry = { properties: SheetTabProperties }

/**
 * Prefer IDS Collection _MS tabs (Lab_MS, …) before standalone "Master Sheet" tabs.
 * The collection workbook also has a top-level "Master Sheet" navigation tab that must not win.
 */
export function pickIdsCollectionCategoryTab(
  sheets: readonly SheetEntry[],
  sheetGid: number | null,
  workbookName: string,
  fallback: () => SheetTabProperties | null,
): SheetTabProperties | null {
  if (sheetGid != null) {
    const byGid = sheets.find((sheet) => sheet.properties.sheetId === sheetGid)
    if (byGid) return byGid.properties
    return null
  }

  const titles = sheets.map((sheet) => sheet.properties.title)
  if (isIdsCollectionSpreadsheet(titles)) {
    const msTitle = idsCollectionMsTabTitle(workbookName, titles)
    if (msTitle) {
      const tab = findSheetTabByTitle(sheets, msTitle)
      if (tab) return tab.properties
    }
  }

  return fallback()
}

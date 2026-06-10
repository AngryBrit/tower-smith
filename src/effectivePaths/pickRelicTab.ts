import { EFFECTIVE_PATHS_RELICS_TAB_TITLE } from './effectivePathsWorkbooks'

export type SheetTabProperties = {
  sheetId: number
  title: string
}

/** Pick the Relics tab inside the Effective Paths Relics workbook. */
export function pickEffectivePathsRelicTab(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties | null {
  if (sheetGid != null) {
    const byGid = sheets.find((s) => s.properties.sheetId === sheetGid)
    if (byGid) return byGid.properties
    return null
  }
  const exactRelicsTab = sheets.find(
    (s) =>
      s.properties.title.trim().toLowerCase() ===
      EFFECTIVE_PATHS_RELICS_TAB_TITLE.toLowerCase(),
  )
  if (exactRelicsTab) return exactRelicsTab.properties
  const byTitle = sheets.find((s) => /relic/i.test(s.properties.title))
  return byTitle?.properties ?? null
}

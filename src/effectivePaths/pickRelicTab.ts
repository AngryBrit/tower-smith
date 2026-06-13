import { EFFECTIVE_PATHS_RELICS_TAB_TITLE, EFFECTIVE_PATHS_RELICS_WORKBOOK_NAME } from './effectivePathsWorkbooks'
import { pickIdsCollectionCategoryTab } from './pickIdsCollectionCategoryTab'

export type SheetTabProperties = {
  sheetId: number
  title: string
}

/** Pick the Relics tab inside the Effective Paths Relics workbook. */
export function pickEffectivePathsRelicTab(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties | null {
  return pickIdsCollectionCategoryTab(sheets, sheetGid, EFFECTIVE_PATHS_RELICS_WORKBOOK_NAME, () => {
    const exactRelicsTab = sheets.find(
      (s) =>
        s.properties.title.trim().toLowerCase() === EFFECTIVE_PATHS_RELICS_TAB_TITLE.toLowerCase(),
    )
    if (exactRelicsTab) return exactRelicsTab.properties
    const byTitle = sheets.find((s) => /relic/i.test(s.properties.title))
    return byTitle?.properties ?? null
  })
}

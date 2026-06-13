import {
  CARDS_INPUT_MIN_COLUMNS,
  CARDS_INPUT_MIN_ROWS,
  isCardsInputTabCandidate,
  type SheetTabGridProperties,
  type SheetTabProperties,
} from './pickCardsTab'
import {
  EFFECTIVE_PATHS_BOTS_TAB_TITLE,
  EFFECTIVE_PATHS_BOTS_WORKBOOK_NAME,
  EFFECTIVE_PATHS_WORKSHOP_TAB_TITLE,
  EFFECTIVE_PATHS_WORKSHOP_WORKBOOK_NAME,
} from './effectivePathsWorkbooks'
import { pickIdsCollectionCategoryTab } from './pickIdsCollectionCategoryTab'

export {
  CARDS_INPUT_MIN_COLUMNS as BOTS_INPUT_MIN_COLUMNS,
  CARDS_INPUT_MIN_ROWS as BOTS_INPUT_MIN_ROWS,
  isCardsInputTabCandidate as isBotsInputTabCandidate,
}

export {
  CARDS_INPUT_MIN_COLUMNS as WORKSHOP_INPUT_MIN_COLUMNS,
  CARDS_INPUT_MIN_ROWS as WORKSHOP_INPUT_MIN_ROWS,
  isCardsInputTabCandidate as isWorkshopInputTabCandidate,
}

export function pickEffectivePathsBotsTab(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties | null {
  return pickIdsCollectionCategoryTab(sheets, sheetGid, EFFECTIVE_PATHS_BOTS_WORKBOOK_NAME, () => {
    const master = sheets.find(
      (s) =>
        s.properties.title.trim().toLowerCase() === EFFECTIVE_PATHS_BOTS_TAB_TITLE.toLowerCase(),
    )
    if (master) return master.properties

    const masterPattern = sheets.find((s) => /master\s*sheet/i.test(s.properties.title))
    if (masterPattern) return masterPattern.properties

    const botsTab = sheets.find((s) => /^bots$/i.test(s.properties.title.trim()))
    return botsTab?.properties ?? null
  })
}

export function pickEffectivePathsWorkshopTab(
  sheets: readonly { properties: SheetTabProperties }[],
  sheetGid: number | null,
): SheetTabProperties | null {
  return pickIdsCollectionCategoryTab(
    sheets,
    sheetGid,
    EFFECTIVE_PATHS_WORKSHOP_WORKBOOK_NAME,
    () => {
      const master = sheets.find(
        (s) =>
          s.properties.title.trim().toLowerCase() ===
          EFFECTIVE_PATHS_WORKSHOP_TAB_TITLE.toLowerCase(),
      )
      if (master) return master.properties

      const masterPattern = sheets.find((s) => /master\s*sheet/i.test(s.properties.title))
      if (masterPattern) return masterPattern.properties

      const workshopTab = sheets.find((s) => /^workshop$/i.test(s.properties.title.trim()))
      return workshopTab?.properties ?? null
    },
  )
}

export type { SheetTabGridProperties, SheetTabProperties }

import {
  EFFECTIVE_PATHS_BOTS_WORKBOOK_NAME,
  EFFECTIVE_PATHS_CARDS_WORKBOOK_NAME,
  EFFECTIVE_PATHS_GUARDIANS_WORKBOOK_NAME,
  EFFECTIVE_PATHS_LABORATORY_WORKBOOK_NAME,
  EFFECTIVE_PATHS_MODULES_WORKBOOK_NAME,
  EFFECTIVE_PATHS_RELICS_WORKBOOK_NAME,
  EFFECTIVE_PATHS_THEMES_WORKBOOK_NAME,
  EFFECTIVE_PATHS_UWS_WORKBOOK_NAME,
  EFFECTIVE_PATHS_WORKSHOP_WORKBOOK_NAME,
} from './effectivePathsWorkbooks'
import { filterKnownIdsWorkbooks } from './effectivePathsIdsWorkbooks'
import type { EffectivePathsLinkedWorkbook } from './parseIdsMasterWorkbooks'

/** IDS Collection v3.x — category input tabs inside one workbook (see Lab_MS, Workshop_MS, …). */
export const IDS_COLLECTION_MS_TAB_BY_WORKBOOK: Readonly<
  Record<string, readonly RegExp[]>
> = {
  [EFFECTIVE_PATHS_LABORATORY_WORKBOOK_NAME]: [/^Lab_MS$/i],
  [EFFECTIVE_PATHS_WORKSHOP_WORKBOOK_NAME]: [/^Workshop_MS$/i],
  [EFFECTIVE_PATHS_CARDS_WORKBOOK_NAME]: [/^Cards_MS$/i],
  [EFFECTIVE_PATHS_UWS_WORKBOOK_NAME]: [/^UW_MS$/i],
  [EFFECTIVE_PATHS_BOTS_WORKBOOK_NAME]: [/^Bots_MS$/i],
  [EFFECTIVE_PATHS_GUARDIANS_WORKBOOK_NAME]: [/^Guardians_MS$/i],
  [EFFECTIVE_PATHS_MODULES_WORKBOOK_NAME]: [/^Modules Inventory$/i],
  [EFFECTIVE_PATHS_THEMES_WORKBOOK_NAME]: [/^Themes & Songs$/i],
  [EFFECTIVE_PATHS_RELICS_WORKBOOK_NAME]: [/^Relics$/i],
}

export function normalizeSheetTabTitle(title: string): string {
  return title.trim()
}

/** True when the workbook contains IDS Collection master-sheet tabs (all-in-one layout). */
export function isIdsCollectionSpreadsheet(sheetTitles: readonly string[]): boolean {
  const titles = sheetTitles.map(normalizeSheetTabTitle)
  if (
    titles.some((title) => /^Lab_MS$/i.test(title)) &&
    titles.some((title) => /^Workshop_MS$/i.test(title))
  ) {
    return true
  }
  return (
    titles.some((title) => /^_IDS$/i.test(title) || /^DVT_IDS$/i.test(title)) &&
    titles.some((title) => /_MS$/i.test(title))
  )
}

export function idsCollectionMsTabTitle(
  workbookName: string,
  sheetTitles: readonly string[],
): string | null {
  const patterns = IDS_COLLECTION_MS_TAB_BY_WORKBOOK[workbookName]
  if (!patterns) return null
  for (const title of sheetTitles.map(normalizeSheetTabTitle)) {
    if (patterns.some((pattern) => pattern.test(title))) return title
  }
  return null
}

/** Linked workbook rows when every category lives in the same spreadsheet file. */
export function buildIdsCollectionWorkbooks(
  spreadsheetId: string,
  sheetTitles: readonly string[],
): EffectivePathsLinkedWorkbook[] {
  const out: EffectivePathsLinkedWorkbook[] = []
  for (const workbookName of Object.keys(IDS_COLLECTION_MS_TAB_BY_WORKBOOK)) {
    if (idsCollectionMsTabTitle(workbookName, sheetTitles)) {
      out.push({ name: workbookName, spreadsheetId })
    }
  }
  return filterKnownIdsWorkbooks(out)
}

export function findSheetTabByTitle<
  T extends { properties: { title: string; sheetId: number } },
>(sheets: readonly T[], title: string): T | null {
  const norm = normalizeSheetTabTitle(title)
  return sheets.find((sheet) => normalizeSheetTabTitle(sheet.properties.title) === norm) ?? null
}

export const EP_STAGING_TITLE_SUFFIX = ' (TowerSmith preview)'

export type EffectivePathsWorkbookAccessContext =
  | 'relic_workbook'
  | 'themes_workbook'
  | 'cards_workbook'
  | 'workshop_workbook'
  | 'bots_workbook'
  | 'laboratory_workbook'
  | 'uws_workbook'
  | 'guardians_workbook'
  | 'modules_workbook'

export type EffectivePathsStagedSheetRef = {
  workbookId: string
  originalSheetId: number
  originalTitle: string
  stagingSheetId: number
  stagingTitle: string
  accessContext: EffectivePathsWorkbookAccessContext
}

export type EffectivePathsPendingExport = {
  id: string
  syncTarget: string
  createdAt: number
  stagedSheets: EffectivePathsStagedSheetRef[]
  summary: string
}

export function effectivePathsStagingTabTitle(originalTitle: string): string {
  const suffix = EP_STAGING_TITLE_SUFFIX
  const base = originalTitle.trim()
  if (base.length + suffix.length <= 100) return `${base}${suffix}`
  return `${base.slice(0, 100 - suffix.length)}${suffix}`
}

export function isEffectivePathsStagingTabTitle(title: string): boolean {
  return title.trimEnd().endsWith(EP_STAGING_TITLE_SUFFIX)
}

export function accessContextForSyncTarget(
  syncTarget: string,
): EffectivePathsWorkbookAccessContext {
  switch (syncTarget) {
    case 'themes':
      return 'themes_workbook'
    case 'cards':
      return 'cards_workbook'
    case 'workshop':
      return 'workshop_workbook'
    case 'bots':
      return 'bots_workbook'
    case 'labs':
      return 'laboratory_workbook'
    case 'uws':
      return 'uws_workbook'
    case 'guardians':
      return 'guardians_workbook'
    case 'modules':
      return 'modules_workbook'
    default:
      return 'relic_workbook'
  }
}

export function googleSpreadsheetTabUrl(spreadsheetId: string, sheetId: number): string {
  const base = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit`
  return `${base}?gid=${sheetId}#gid=${sheetId}`
}

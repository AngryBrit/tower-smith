import type { EffectivePathsIdsGateway } from './assembleEffectivePathsListResult'
import type { EpMobileGrantPhase } from './effectivePathsMobileGrantSession'
import { redirectToMobilePickerAuth } from './googleDrivePickerMobile'
import {
  linkedWorkbookNamesFromGateway,
  type EnsureEffectivePathsSpreadsheetAccessTitles,
} from './grantEffectivePathsSpreadsheetAccess'

export function isJsPickerGrantFailure(reason: string): boolean {
  return reason === 'picker_failed' || reason === 'picker_not_configured'
}

function linkedPickerTitle(base: string, gateway?: EffectivePathsIdsGateway): string {
  if (!gateway) return base
  const names = linkedWorkbookNamesFromGateway(gateway)
  return names.length > 0 ? `${base} (${names.join(', ')})` : base
}

/** Full-page Google one-pick OAuth when the JS Picker overlay cannot open (desktop Chrome, etc.). */
export async function redirectMobilePickerAfterJsFailure(options: {
  phase: EpMobileGrantPhase
  masterSpreadsheetId: string
  masterSheetGid: number | null
  spreadsheetIds: readonly string[]
  multiselect: boolean
  titles: EnsureEffectivePathsSpreadsheetAccessTitles
  gateway?: EffectivePathsIdsGateway
}): Promise<never> {
  const { phase, masterSpreadsheetId, masterSheetGid, spreadsheetIds, multiselect, titles, gateway } =
    options
  await redirectToMobilePickerAuth({
    phase,
    masterSpreadsheetId,
    masterSheetGid,
    spreadsheetIds: [...spreadsheetIds],
    multiselect,
    requireMasterSpreadsheetId: masterSpreadsheetId,
    titles: {
      ...titles,
      linkedWorkbooks: linkedPickerTitle(titles.linkedWorkbooks, gateway),
    },
  })
  throw new Error('mobile_picker_redirect')
}

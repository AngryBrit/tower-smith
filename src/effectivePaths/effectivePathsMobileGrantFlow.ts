import type { EffectivePathsIdsGateway } from './assembleEffectivePathsListResult'
import type { EpMobileResumePayload } from './effectivePathsMobileGrantSession'
import { readCachedLinkedSpreadsheetIds } from './effectivePathsLinkedSpreadsheetCache'
import { fetchEffectivePathsIdsGateway } from './exportEffectivePathsApi'
import { redirectToMobilePickerAuth } from './googleDrivePickerMobile'
import {
  collectSpreadsheetIdsFromGateway,
  type EnsureEffectivePathsSpreadsheetAccessResult,
  type EnsureEffectivePathsSpreadsheetAccessTitles,
  linkedWorkbookNamesFromGateway,
} from './grantEffectivePathsSpreadsheetAccess'

export type BeginMobileEffectivePathsGrantOptions = {
  masterSpreadsheetId: string
  masterSheetGid: number | null
  titles: EnsureEffectivePathsSpreadsheetAccessTitles
}

function pickerTitleWithWorkbookNames(
  baseTitle: string,
  gateway: EffectivePathsIdsGateway,
): string {
  const names = linkedWorkbookNamesFromGateway(gateway)
  return names.length > 0 ? `${baseTitle} (${names.join(', ')})` : baseTitle
}

function grantFailure(
  reason: Exclude<EnsureEffectivePathsSpreadsheetAccessResult, { ok: true }>['reason'],
  extra?: Partial<Extract<EnsureEffectivePathsSpreadsheetAccessResult, { ok: false }>>,
): EnsureEffectivePathsSpreadsheetAccessResult {
  return { ok: false, reason, ...extra } as EnsureEffectivePathsSpreadsheetAccessResult
}

function validateRequiredMaster(
  pickedIds: readonly string[],
  requiredMaster?: string,
): EnsureEffectivePathsSpreadsheetAccessResult | null {
  const required = requiredMaster?.trim()
  if (!required) return null
  if (!pickedIds.includes(required)) {
    return grantFailure('wrong_spreadsheet')
  }
  return null
}

/** Start mobile redirect grant (page navigates away; does not return). */
export async function beginMobileEffectivePathsGrant(
  options: BeginMobileEffectivePathsGrantOptions,
): Promise<void> {
  const { masterSpreadsheetId, masterSheetGid, titles } = options
  const cachedLinked = readCachedLinkedSpreadsheetIds(masterSpreadsheetId)

  if (cachedLinked.length > 0) {
    await redirectToMobilePickerAuth({
      phase: 'all_workbooks',
      masterSpreadsheetId,
      masterSheetGid,
      spreadsheetIds: [masterSpreadsheetId, ...cachedLinked],
      multiselect: true,
      requireMasterSpreadsheetId: masterSpreadsheetId,
      titles,
    })
    return
  }

  await redirectToMobilePickerAuth({
    phase: 'master',
    masterSpreadsheetId,
    masterSheetGid,
    spreadsheetIds: [masterSpreadsheetId],
    multiselect: false,
    requireMasterSpreadsheetId: masterSpreadsheetId,
    titles,
  })
}

export type ResumeMobileEffectivePathsGrantResult =
  | EnsureEffectivePathsSpreadsheetAccessResult
  | { ok: false; reason: 'mobile_resume_missing' }

/**
 * Continue grant after Google redirects back. May start another redirect for linked workbooks.
 */
export async function resumeMobileEffectivePathsGrant(
  resume: EpMobileResumePayload,
): Promise<ResumeMobileEffectivePathsGrantResult> {
  const {
    accessToken,
    pickedSpreadsheetIds,
    phase,
    masterSpreadsheetId,
    masterSheetGid,
    requireMasterSpreadsheetId,
    titles,
  } = resume

  const masterCheck = validateRequiredMaster(pickedSpreadsheetIds, requireMasterSpreadsheetId)
  if (masterCheck) return masterCheck

  if (phase === 'all_workbooks' || phase === 'linked_workbooks') {
    return { ok: true }
  }

  const gatewayResult = await fetchEffectivePathsIdsGateway({
    googleAccessToken: accessToken,
    masterSpreadsheetId,
    sheetGid: masterSheetGid,
  })
  if (!gatewayResult.ok) {
    return {
      ok: false,
      reason: 'gateway_failed',
      error: gatewayResult.error,
      message: gatewayResult.message,
    }
  }

  const gateway = gatewayResult.gateway
  const allIds = collectSpreadsheetIdsFromGateway(gateway, masterSpreadsheetId)
  const linkedOnly = allIds.filter((id) => id !== masterSpreadsheetId)
  if (linkedOnly.length === 0) {
    return { ok: true }
  }

  await redirectToMobilePickerAuth({
    phase: 'linked_workbooks',
    masterSpreadsheetId,
    masterSheetGid,
    spreadsheetIds: allIds,
    multiselect: true,
    requireMasterSpreadsheetId: masterSpreadsheetId,
    titles: {
      ...titles,
      linkedWorkbooks: pickerTitleWithWorkbookNames(titles.linkedWorkbooks, gateway),
    },
  })
  throw new Error('mobile_picker_redirect')
}

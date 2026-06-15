import {
  workbooksToAuthorizeFromGateway,
  type EffectivePathsIdsGateway,
} from './assembleEffectivePathsListResult'
import {
  readCachedLinkedSpreadsheetIds,
  writeCachedLinkedSpreadsheetIds,
} from './effectivePathsLinkedSpreadsheetCache'
import {
  fetchEffectivePathsIdsGateway,
  type EffectivePathsExportError,
} from './exportEffectivePathsApi'
import {
  isJsPickerGrantFailure,
  redirectMobilePickerAfterJsFailure,
} from './effectivePathsJsPickerFallback'
import {
  pickGoogleSpreadsheets,
  type GoogleSpreadsheetPickerResult,
} from './googleDrivePicker'
import type { LinkedWorkbookAccess } from './assembleEffectivePathsListResult'

export type SpreadsheetAccessGrantResult =
  | { ok: true }
  | {
      ok: false
      reason: 'cancelled' | 'picker_not_configured' | 'picker_failed' | 'wrong_spreadsheet'
    }

export function uniqueSpreadsheetIds(ids: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    const trimmed = id.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

/** IDS Master plus every linked workbook ID from the gateway. */
export function collectSpreadsheetIdsFromGateway(
  gateway: EffectivePathsIdsGateway,
  masterSpreadsheetId: string,
): string[] {
  const linked = workbooksToAuthorizeFromGateway(gateway).map((workbook) => workbook.spreadsheetId)
  return uniqueSpreadsheetIds([masterSpreadsheetId, ...linked])
}

export function linkedWorkbookNamesFromGateway(gateway: EffectivePathsIdsGateway): string[] {
  return workbooksToAuthorizeFromGateway(gateway).map((workbook) => workbook.name)
}

export function collectDeniedLinkedSpreadsheetIds(
  workbookAccess: readonly LinkedWorkbookAccess[],
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const row of workbookAccess) {
    if (row.access !== 'denied') continue
    if (seen.has(row.spreadsheetId)) continue
    seen.add(row.spreadsheetId)
    out.push(row.spreadsheetId)
  }
  return out
}

function grantResultFromPicker(
  pickerResult: GoogleSpreadsheetPickerResult,
): SpreadsheetAccessGrantResult {
  if (pickerResult.ok) return { ok: true }
  return { ok: false, reason: pickerResult.reason }
}

export type GrantEffectivePathsSpreadsheetsOptions = {
  title?: string
  multiselect?: boolean
  /** When set, the user must include this spreadsheet in their picker selection. */
  requireMasterSpreadsheetId?: string
  onPickerUiActive?: (active: boolean) => void
}

/** Open one picker listing only the given spreadsheet IDs (drive.file grant on pick). */
export async function grantEffectivePathsSpreadsheetsAccess(
  accessToken: string,
  spreadsheetIds: readonly string[],
  options: GrantEffectivePathsSpreadsheetsOptions = {},
): Promise<SpreadsheetAccessGrantResult> {
  const uniqueIds = uniqueSpreadsheetIds(spreadsheetIds)
  if (uniqueIds.length === 0) return { ok: true }

  const pickerResult = await pickGoogleSpreadsheets({
    accessToken,
    suggestedFileIds: uniqueIds,
    multiselect: options.multiselect ?? uniqueIds.length > 1,
    title: options.title,
    onPickerUiActive: options.onPickerUiActive,
  })
  if (!pickerResult.ok) {
    return grantResultFromPicker(pickerResult)
  }

  const requiredMaster = options.requireMasterSpreadsheetId?.trim()
  if (requiredMaster && !pickerResult.spreadsheetIds.includes(requiredMaster)) {
    return { ok: false, reason: 'wrong_spreadsheet' }
  }

  return { ok: true }
}

/** Prompt the user to grant drive.file access to the IDS Master spreadsheet only. */
export async function grantIdsMasterSpreadsheetAccess(
  accessToken: string,
  masterSpreadsheetId: string,
  title?: string,
  onPickerUiActive?: (active: boolean) => void,
): Promise<SpreadsheetAccessGrantResult> {
  return grantEffectivePathsSpreadsheetsAccess(accessToken, [masterSpreadsheetId], {
    title,
    requireMasterSpreadsheetId: masterSpreadsheetId,
    onPickerUiActive,
  })
}

export type EnsureEffectivePathsSpreadsheetAccessTitles = {
  idsMaster: string
  allWorkbooks: string
  linkedWorkbooks: string
}

export type EnsureEffectivePathsSpreadsheetAccessResult =
  | { ok: true }
  | { ok: false; reason: Exclude<SpreadsheetAccessGrantResult, { ok: true }>['reason'] }
  | { ok: false; reason: 'gateway_failed'; error: EffectivePathsExportError; message?: string }

function pickerTitleWithWorkbookNames(baseTitle: string, gateway: EffectivePathsIdsGateway): string {
  const names = linkedWorkbookNamesFromGateway(gateway)
  return names.length > 0 ? `${baseTitle} (${names.join(', ')})` : baseTitle
}

/**
 * OAuth follow-up: one picker when linked IDs are cached, otherwise master picker then
 * one multiselect picker for IDS Master + all linked workbooks from the IDS tab.
 */
export async function ensureEffectivePathsSpreadsheetAccess(options: {
  accessToken: string
  masterSpreadsheetId: string
  masterSheetGid: number | null
  titles: EnsureEffectivePathsSpreadsheetAccessTitles
  onPickerUiActive?: (active: boolean) => void
}): Promise<EnsureEffectivePathsSpreadsheetAccessResult> {
  const { accessToken, masterSpreadsheetId, masterSheetGid, titles, onPickerUiActive } = options
  const cachedLinked = readCachedLinkedSpreadsheetIds(masterSpreadsheetId)

  if (cachedLinked.length > 0) {
    const grant = await grantEffectivePathsSpreadsheetsAccess(
      accessToken,
      [masterSpreadsheetId, ...cachedLinked],
      {
        title: titles.allWorkbooks,
        multiselect: true,
        requireMasterSpreadsheetId: masterSpreadsheetId,
        onPickerUiActive,
      },
    )
    if (!grant.ok) {
      if (isJsPickerGrantFailure(grant.reason)) {
        await redirectMobilePickerAfterJsFailure({
          phase: 'all_workbooks',
          masterSpreadsheetId,
          masterSheetGid,
          spreadsheetIds: [masterSpreadsheetId, ...cachedLinked],
          multiselect: true,
          titles,
        })
      }
      return grant
    }
    return { ok: true }
  }

  const masterGrant = await grantIdsMasterSpreadsheetAccess(
    accessToken,
    masterSpreadsheetId,
    titles.idsMaster,
    onPickerUiActive,
  )
  if (!masterGrant.ok) {
    if (isJsPickerGrantFailure(masterGrant.reason)) {
      await redirectMobilePickerAfterJsFailure({
        phase: 'master',
        masterSpreadsheetId,
        masterSheetGid,
        spreadsheetIds: [masterSpreadsheetId],
        multiselect: false,
        titles,
      })
    }
    return masterGrant
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

  if (linkedOnly.length > 0) {
    const grant = await grantEffectivePathsSpreadsheetsAccess(accessToken, allIds, {
      title: pickerTitleWithWorkbookNames(titles.linkedWorkbooks, gateway),
      multiselect: true,
      requireMasterSpreadsheetId: masterSpreadsheetId,
      onPickerUiActive,
    })
    if (!grant.ok) {
      if (isJsPickerGrantFailure(grant.reason)) {
        await redirectMobilePickerAfterJsFailure({
          phase: 'linked_workbooks',
          masterSpreadsheetId,
          masterSheetGid,
          spreadsheetIds: allIds,
          multiselect: true,
          titles,
          gateway,
        })
      }
      return grant
    }
  }

  writeCachedLinkedSpreadsheetIds(masterSpreadsheetId, linkedOnly)
  return { ok: true }
}

/** Refresh device-local linked workbook IDs after a successful gateway read. */
export function cacheLinkedSpreadsheetIdsFromGateway(
  masterSpreadsheetId: string,
  gateway: EffectivePathsIdsGateway,
): void {
  const linked = workbooksToAuthorizeFromGateway(gateway)
    .map((workbook) => workbook.spreadsheetId)
    .filter((id) => id !== masterSpreadsheetId)
  writeCachedLinkedSpreadsheetIds(masterSpreadsheetId, linked)
}

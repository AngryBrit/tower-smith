import type { BotsEpSyncState } from './botsEpStateFromPersisted'
import {
  modulesEpDefaultSectionLevels,
  type ModulesEpSyncState,
} from './modulesEpStateFromPersisted'
import type { UwsEpSyncState } from './uwsEpStateFromPersisted'
import {
  assembleEffectivePathsListResult,
  workbooksToAuthorizeFromGateway,
  type EffectivePathsIdsGateway,
  type EffectivePathsListResult,
} from './assembleEffectivePathsListResult'
import type { EffectivePathsLinkedWorkbook } from './parseIdsMasterWorkbooks'

export type { EffectivePathsIdsGateway, EffectivePathsListResult }

export type EffectivePathsLoadProgress = {
  phase: 'gateway' | 'workbook'
  completed: number
  total: number
  currentWorkbookName?: string
}

export type { LinkedWorkbookAccess } from './assembleEffectivePathsListResult'
import type { LinkedWorkbookAccess } from './assembleEffectivePathsListResult'

const API_BASE =
  (import.meta.env.VITE_TOWER_GALLERY_API as string | undefined)?.replace(/\/$/, '') ??
  '/api'

export type EffectivePathsExportError =
  | 'network'
  | 'invalid_spreadsheet'
  | 'sheets_auth_failed'
  | 'sheet_not_found'
  | 'ids_master_not_found'
  | 'ids_master_empty'
  | 'relic_workbook_not_found'
  | 'relic_workbook_access_denied'
  | 'relic_tab_not_found'
  | 'no_relic_rows'
  | 'themes_workbook_not_found'
  | 'themes_workbook_access_denied'
  | 'themes_tab_not_found'
  | 'no_theme_rows'
  | 'cards_workbook_not_found'
  | 'cards_workbook_access_denied'
  | 'cards_tab_not_found'
  | 'no_card_rows'
  | 'no_card_preset_rows'
  | 'workshop_workbook_not_found'
  | 'workshop_workbook_access_denied'
  | 'workshop_tab_not_found'
  | 'no_workshop_rows'
  | 'bots_workbook_not_found'
  | 'bots_workbook_access_denied'
  | 'bots_tab_not_found'
  | 'no_bot_rows'
  | 'laboratory_workbook_not_found'
  | 'laboratory_workbook_access_denied'
  | 'laboratory_tab_not_found'
  | 'no_lab_rows'
  | 'uws_workbook_not_found'
  | 'uws_workbook_access_denied'
  | 'uws_tab_not_found'
  | 'no_uws_rows'
  | 'modules_workbook_not_found'
  | 'modules_workbook_access_denied'
  | 'modules_tab_not_found'
  | 'no_modules_rows'
  | 'sheets_api_error'
  | 'unknown'

export type EffectivePathsRelicsExportResult = {
  ok: true
  syncTarget: 'relics'
  updatedCells: number
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  relicsWorkbookId: string
}

export type EffectivePathsThemesExportResult = {
  ok: true
  syncTarget: 'themes'
  updatedCells: number
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  themesWorkbookId: string
}

export type EffectivePathsCardsExportResult = {
  ok: true
  syncTarget: 'cards'
  updatedCells: number
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  cardsWorkbookId: string
  presetSheetTitle: string | null
  presetMatchedRows: number
  presetUpdatedCells: number
}

export type EffectivePathsWorkshopExportResult = {
  ok: true
  syncTarget: 'workshop'
  updatedCells: number
  matchedRows: number
  enhanceMatchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  workshopWorkbookId: string
}

export type EffectivePathsBotsExportResult = {
  ok: true
  syncTarget: 'bots'
  updatedCells: number
  matchedRows: number
  labMatchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  botsWorkbookId: string
}

export type EffectivePathsLabsExportResult = {
  ok: true
  syncTarget: 'labs'
  updatedCells: number
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  laboratoryWorkbookId: string
}

export type EffectivePathsLabsImportResult = {
  ok: true
  syncTarget: 'labs'
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  laboratoryWorkbookId: string
  labLevelOverrides: Record<string, number>
}

export type EffectivePathsWorkshopImportResult = {
  ok: true
  syncTarget: 'workshop'
  matchedRows: number
  enhanceMatchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  workshopWorkbookId: string
  workshopLevels: Record<string, number>
}

export type EffectivePathsRelicsImportResult = {
  ok: true
  syncTarget: 'relics'
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  relicsWorkbookId: string
  relicOwnedIds: string[]
}

export type EffectivePathsThemesImportResult = {
  ok: true
  syncTarget: 'themes'
  matchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  themesWorkbookId: string
  themeOwnedIds: string[]
}

export type EffectivePathsCardsImportResult = {
  ok: true
  syncTarget: 'cards'
  matchedRows: number
  presetMatchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  presetSheetTitle: string | null
  cardsWorkbookId: string
  cardStars: Record<string, number>
  cardEquipSlots: number
  cardMasteryUnlockedIds: string[]
  cardPresetLoadouts: string[][][]
}

export type EffectivePathsBotsImportResult = {
  ok: true
  syncTarget: 'bots'
  matchedRows: number
  labMatchedRows: number
  unmappedSheetNames: string[]
  sheetTitle: string
  botsWorkbookId: string
  botsEpState: import('./botsEpStateFromPersisted').BotsEpSyncState
}

export type EffectivePathsUwsImportResult = {
  ok: true
  syncTarget: 'uws'
  matchedRows: number
  sheetTitle: string
  uwsWorkbookId: string
  uwsEpState: import('./uwsEpStateFromPersisted').UwsEpSyncState
}

export type EffectivePathsModulesImportResult = {
  ok: true
  syncTarget: 'modules'
  matchedRows: number
  matchedSubstats: number
  sheetTitle: string
  modulesWorkbookId: string
  modulesEpState: import('./modulesEpStateFromPersisted').ModulesEpSyncState
}

type EffectivePathsImportApiOptions = {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  spreadsheetId?: string | null
  sheetGid?: number | null
}

type EffectivePathsImportApiResult<T> =
  | { ok: true; result: T }
  | { ok: false; error: EffectivePathsExportError; message?: string }

async function postEffectivePathsImport<T extends { ok: true }>(
  syncTarget: string,
  options: EffectivePathsImportApiOptions,
  validate: (body: unknown) => body is T,
): Promise<EffectivePathsImportApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}/effective-paths/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Google-Access-Token': options.googleAccessToken,
      },
      body: JSON.stringify({
        syncTarget,
        masterSpreadsheetId: options.masterSpreadsheetId ?? null,
        masterSheetGid: options.masterSheetGid ?? null,
        spreadsheetId: options.spreadsheetId ?? null,
        sheetGid: options.sheetGid ?? null,
      }),
    })

    const body = await res.json().catch(() => null)
    if (!res.ok) {
      const err = await parseApiError(res, body)
      return { ok: false, ...err }
    }

    if (!validate(body)) {
      return { ok: false, error: 'unknown' }
    }

    return { ok: true, result: body }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export type EffectivePathsUwsExportResult = {
  ok: true
  syncTarget: 'uws'
  updatedCells: number
  matchedRows: number
  sheetTitle: string
  uwsWorkbookId: string
}

export type EffectivePathsModulesExportResult = {
  ok: true
  syncTarget: 'modules'
  updatedCells: number
  matchedRows: number
  matchedSubstats: number
  sheetTitle: string
  modulesWorkbookId: string
}

async function parseApiError(res: Response, body: unknown): Promise<{
  error: EffectivePathsExportError
  message?: string
}> {
  const code = body && typeof body === 'object' && 'error' in body ? body.error : undefined
  const message =
    body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
      ? body.message
      : undefined
  return {
    error: isExportError(code) ? code : res.status === 0 ? 'network' : 'unknown',
    message,
  }
}

function parseLinkedWorkbook(raw: unknown): EffectivePathsLinkedWorkbook | null {
  if (!raw || typeof raw !== 'object') return null
  const spreadsheetId = (raw as { spreadsheetId?: unknown }).spreadsheetId
  const name = (raw as { name?: unknown }).name
  if (typeof spreadsheetId !== 'string' || typeof name !== 'string') return null
  return { name, spreadsheetId }
}

function parseWorkbooksList(raw: unknown): EffectivePathsLinkedWorkbook[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((row) => parseLinkedWorkbook(row))
    .filter((row): row is EffectivePathsLinkedWorkbook => row != null)
}

function parseIdsGatewayBody(body: unknown): EffectivePathsIdsGateway | null {
  if (!body || typeof body !== 'object' || !('workbooks' in body)) return null
  const record = body as { idsTabTitle?: unknown }
  const idsTabTitle = typeof record.idsTabTitle === 'string' ? record.idsTabTitle : 'IDS'
  return {
    idsTabTitle,
    workbooks: parseWorkbooksList((body as { workbooks?: unknown }).workbooks),
    relicsWorkbook: parseLinkedWorkbook((body as { relicsWorkbook?: unknown }).relicsWorkbook),
    themesWorkbook: parseLinkedWorkbook((body as { themesWorkbook?: unknown }).themesWorkbook),
    cardsWorkbook: parseLinkedWorkbook((body as { cardsWorkbook?: unknown }).cardsWorkbook),
    workshopWorkbook: parseLinkedWorkbook((body as { workshopWorkbook?: unknown }).workshopWorkbook),
    botsWorkbook: parseLinkedWorkbook((body as { botsWorkbook?: unknown }).botsWorkbook),
    laboratoryWorkbook: parseLinkedWorkbook(
      (body as { laboratoryWorkbook?: unknown }).laboratoryWorkbook,
    ),
    uwsWorkbook: parseLinkedWorkbook((body as { uwsWorkbook?: unknown }).uwsWorkbook),
    modulesWorkbook: parseLinkedWorkbook((body as { modulesWorkbook?: unknown }).modulesWorkbook),
  }
}

function parseWorkbookAccessBody(body: unknown): LinkedWorkbookAccess | null {
  if (!body || typeof body !== 'object') return null
  const name = (body as { name?: unknown }).name
  const spreadsheetId = (body as { spreadsheetId?: unknown }).spreadsheetId
  const access = (body as { access?: unknown }).access
  if (typeof name !== 'string' || typeof spreadsheetId !== 'string') return null
  if (access !== 'ok' && access !== 'denied' && access !== 'not_found') return null
  return { name, spreadsheetId, access }
}

async function fetchEffectivePathsIdsGateway(options: {
  googleAccessToken: string
  masterSpreadsheetId: string
  sheetGid: number | null
}): Promise<
  | { ok: true; gateway: EffectivePathsIdsGateway }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
  const res = await fetch(`${API_BASE}/effective-paths/ids-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Google-Access-Token': options.googleAccessToken,
    },
    body: JSON.stringify({
      masterSpreadsheetId: options.masterSpreadsheetId,
      sheetGid: options.sheetGid,
    }),
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const err = await parseApiError(res, body)
    return { ok: false, ...err }
  }

  const gateway = parseIdsGatewayBody(body)
  if (!gateway) return { ok: false, error: 'unknown' }
  return { ok: true, gateway }
}

async function probeEffectivePathsWorkbookAccess(options: {
  googleAccessToken: string
  workbook: EffectivePathsLinkedWorkbook
}): Promise<
  | { ok: true; access: LinkedWorkbookAccess }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
  const res = await fetch(`${API_BASE}/effective-paths/workbook-access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Google-Access-Token': options.googleAccessToken,
    },
    body: JSON.stringify({
      name: options.workbook.name,
      spreadsheetId: options.workbook.spreadsheetId,
    }),
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const err = await parseApiError(res, body)
    return { ok: false, ...err }
  }

  const access = parseWorkbookAccessBody(body)
  if (!access) return { ok: false, error: 'unknown' }
  return { ok: true, access }
}

export async function listEffectivePathsWorkbooks(options: {
  googleAccessToken: string
  masterSpreadsheetId: string
  sheetGid: number | null
  onProgress?: (progress: EffectivePathsLoadProgress) => void
  onGateway?: (gateway: EffectivePathsIdsGateway) => void
  onWorkbookAccess?: (access: LinkedWorkbookAccess) => void
}): Promise<
  | EffectivePathsListResult
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
  try {
    const toAuthorizePreview = (gateway: EffectivePathsIdsGateway) =>
      workbooksToAuthorizeFromGateway(gateway)
    const gatewayResult = await fetchEffectivePathsIdsGateway(options)
    if (!gatewayResult.ok) return gatewayResult

    const gateway = gatewayResult.gateway
    const workbooksToCheck = toAuthorizePreview(gateway)
    const total = 1 + workbooksToCheck.length

    options.onProgress?.({ phase: 'gateway', completed: 0, total })
    options.onGateway?.(gateway)
    options.onProgress?.({ phase: 'gateway', completed: 1, total })

    const workbookAccess: LinkedWorkbookAccess[] = []
    for (let index = 0; index < workbooksToCheck.length; index++) {
      const workbook = workbooksToCheck[index]
      options.onProgress?.({
        phase: 'workbook',
        completed: 1 + index,
        total,
        currentWorkbookName: workbook.name,
      })

      const probe = await probeEffectivePathsWorkbookAccess({
        googleAccessToken: options.googleAccessToken,
        workbook,
      })
      if (!probe.ok) return probe

      workbookAccess.push(probe.access)
      options.onWorkbookAccess?.(probe.access)
      options.onProgress?.({
        phase: 'workbook',
        completed: 2 + index,
        total,
        currentWorkbookName: workbook.name,
      })
    }

    return assembleEffectivePathsListResult(gateway, workbookAccess)
  } catch {
    return { ok: false, error: 'network' }
  }
}

type EffectivePathsExportCallResult<TResult> =
  | { ok: true; result: TResult }
  | { ok: false; error: EffectivePathsExportError; message?: string }

export async function exportRelicsToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  relicsSpreadsheetId?: string | null
  relicsSheetGid?: number | null
  relicOwnedIds: readonly string[]
}): Promise<EffectivePathsExportCallResult<EffectivePathsRelicsExportResult>> {
  return exportToEffectivePaths({
    ...options,
    syncTarget: 'relics',
    spreadsheetId: options.relicsSpreadsheetId ?? null,
    sheetGid: options.relicsSheetGid ?? null,
    relicOwnedIds: options.relicOwnedIds,
    themeOwnedIds: [],
    cardStars: {},
    cardMasteryUnlockedIds: [],
    cardEquipSlots: 0,
    cardPresetLoadouts: [],
    workshopLevels: {},
    botsEpState: emptyBotsEpState(),
    uwsEpState: emptyUwsEpState(),
    modulesEpState: emptyModulesEpState(),
    labLevelOverrides: {},
  }) as Promise<EffectivePathsExportCallResult<EffectivePathsRelicsExportResult>>
}

export async function exportThemesToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  themesSpreadsheetId?: string | null
  themesSheetGid?: number | null
  themeOwnedIds: readonly string[]
}): Promise<EffectivePathsExportCallResult<EffectivePathsThemesExportResult>> {
  return exportToEffectivePaths({
    googleAccessToken: options.googleAccessToken,
    masterSpreadsheetId: options.masterSpreadsheetId ?? null,
    masterSheetGid: options.masterSheetGid ?? null,
    syncTarget: 'themes',
    spreadsheetId: options.themesSpreadsheetId ?? null,
    sheetGid: options.themesSheetGid ?? null,
    relicOwnedIds: [],
    themeOwnedIds: options.themeOwnedIds,
    cardStars: {},
    cardMasteryUnlockedIds: [],
    cardEquipSlots: 0,
    cardPresetLoadouts: [],
    workshopLevels: {},
    botsEpState: emptyBotsEpState(),
    uwsEpState: emptyUwsEpState(),
    modulesEpState: emptyModulesEpState(),
    labLevelOverrides: {},
  }) as Promise<EffectivePathsExportCallResult<EffectivePathsThemesExportResult>>
}

export async function exportCardsToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  cardsSpreadsheetId?: string | null
  cardsSheetGid?: number | null
  cardStars: Readonly<Record<string, number>>
  cardMasteryUnlockedIds: readonly string[]
  cardEquipSlots: number
  cardPresetLoadouts: readonly (readonly string[])[]
}): Promise<EffectivePathsExportCallResult<EffectivePathsCardsExportResult>> {
  return exportToEffectivePaths({
    googleAccessToken: options.googleAccessToken,
    masterSpreadsheetId: options.masterSpreadsheetId ?? null,
    masterSheetGid: options.masterSheetGid ?? null,
    syncTarget: 'cards',
    spreadsheetId: options.cardsSpreadsheetId ?? null,
    sheetGid: options.cardsSheetGid ?? null,
    relicOwnedIds: [],
    themeOwnedIds: [],
    cardStars: options.cardStars,
    cardMasteryUnlockedIds: options.cardMasteryUnlockedIds,
    cardEquipSlots: options.cardEquipSlots,
    cardPresetLoadouts: options.cardPresetLoadouts,
    workshopLevels: {},
    botsEpState: emptyBotsEpState(),
    uwsEpState: emptyUwsEpState(),
    modulesEpState: emptyModulesEpState(),
    labLevelOverrides: {},
  }) as Promise<EffectivePathsExportCallResult<EffectivePathsCardsExportResult>>
}

export async function exportWorkshopToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  workshopSpreadsheetId?: string | null
  workshopSheetGid?: number | null
  workshopLevels: Readonly<Record<string, number>>
}): Promise<EffectivePathsExportCallResult<EffectivePathsWorkshopExportResult>> {
  return exportToEffectivePaths({
    googleAccessToken: options.googleAccessToken,
    masterSpreadsheetId: options.masterSpreadsheetId ?? null,
    masterSheetGid: options.masterSheetGid ?? null,
    syncTarget: 'workshop',
    spreadsheetId: options.workshopSpreadsheetId ?? null,
    sheetGid: options.workshopSheetGid ?? null,
    relicOwnedIds: [],
    themeOwnedIds: [],
    cardStars: {},
    cardMasteryUnlockedIds: [],
    cardEquipSlots: 0,
    cardPresetLoadouts: [],
    workshopLevels: options.workshopLevels,
    botsEpState: emptyBotsEpState(),
    uwsEpState: emptyUwsEpState(),
    modulesEpState: emptyModulesEpState(),
    labLevelOverrides: {},
  }) as Promise<EffectivePathsExportCallResult<EffectivePathsWorkshopExportResult>>
}

export function importRelicsFromEffectivePaths(
  options: EffectivePathsImportApiOptions,
): Promise<EffectivePathsImportApiResult<EffectivePathsRelicsImportResult>> {
  return postEffectivePathsImport(
    'relics',
    options,
    (body): body is EffectivePathsRelicsImportResult =>
      !!body &&
      typeof body === 'object' &&
      'relicOwnedIds' in body &&
      'matchedRows' in body,
  )
}

export function importThemesFromEffectivePaths(
  options: EffectivePathsImportApiOptions,
): Promise<EffectivePathsImportApiResult<EffectivePathsThemesImportResult>> {
  return postEffectivePathsImport(
    'themes',
    options,
    (body): body is EffectivePathsThemesImportResult =>
      !!body &&
      typeof body === 'object' &&
      'themeOwnedIds' in body &&
      'matchedRows' in body,
  )
}

export function importCardsFromEffectivePaths(
  options: EffectivePathsImportApiOptions,
): Promise<EffectivePathsImportApiResult<EffectivePathsCardsImportResult>> {
  return postEffectivePathsImport(
    'cards',
    options,
    (body): body is EffectivePathsCardsImportResult =>
      !!body && typeof body === 'object' && 'cardStars' in body && 'matchedRows' in body,
  )
}

export async function importLabsFromEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  laboratorySpreadsheetId?: string | null
  laboratorySheetGid?: number | null
}): Promise<EffectivePathsImportApiResult<EffectivePathsLabsImportResult>> {
  return postEffectivePathsImport(
    'labs',
    {
      googleAccessToken: options.googleAccessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      masterSheetGid: options.masterSheetGid,
      spreadsheetId: options.laboratorySpreadsheetId,
      sheetGid: options.laboratorySheetGid,
    },
    (body): body is EffectivePathsLabsImportResult =>
      !!body &&
      typeof body === 'object' &&
      'labLevelOverrides' in body &&
      'matchedRows' in body,
  )
}

export async function importWorkshopFromEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  workshopSpreadsheetId?: string | null
  workshopSheetGid?: number | null
}): Promise<EffectivePathsImportApiResult<EffectivePathsWorkshopImportResult>> {
  return postEffectivePathsImport(
    'workshop',
    {
      googleAccessToken: options.googleAccessToken,
      masterSpreadsheetId: options.masterSpreadsheetId,
      masterSheetGid: options.masterSheetGid,
      spreadsheetId: options.workshopSpreadsheetId,
      sheetGid: options.workshopSheetGid,
    },
    (body): body is EffectivePathsWorkshopImportResult =>
      !!body &&
      typeof body === 'object' &&
      'workshopLevels' in body &&
      'matchedRows' in body,
  )
}

export function importBotsFromEffectivePaths(
  options: EffectivePathsImportApiOptions,
): Promise<EffectivePathsImportApiResult<EffectivePathsBotsImportResult>> {
  return postEffectivePathsImport(
    'bots',
    options,
    (body): body is EffectivePathsBotsImportResult =>
      !!body && typeof body === 'object' && 'botsEpState' in body && 'matchedRows' in body,
  )
}

export function importUwsFromEffectivePaths(
  options: EffectivePathsImportApiOptions,
): Promise<EffectivePathsImportApiResult<EffectivePathsUwsImportResult>> {
  return postEffectivePathsImport(
    'uws',
    options,
    (body): body is EffectivePathsUwsImportResult =>
      !!body && typeof body === 'object' && 'uwsEpState' in body && 'matchedRows' in body,
  )
}

export function importModulesFromEffectivePaths(
  options: EffectivePathsImportApiOptions,
): Promise<EffectivePathsImportApiResult<EffectivePathsModulesImportResult>> {
  return postEffectivePathsImport(
    'modules',
    options,
    (body): body is EffectivePathsModulesImportResult =>
      !!body && typeof body === 'object' && 'modulesEpState' in body && 'matchedRows' in body,
  )
}

export async function exportLabsToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  laboratorySpreadsheetId?: string | null
  laboratorySheetGid?: number | null
  labLevelOverrides: Readonly<Record<string, number>>
}): Promise<EffectivePathsExportCallResult<EffectivePathsLabsExportResult>> {
  return exportToEffectivePaths({
    googleAccessToken: options.googleAccessToken,
    masterSpreadsheetId: options.masterSpreadsheetId ?? null,
    masterSheetGid: options.masterSheetGid ?? null,
    syncTarget: 'labs',
    spreadsheetId: options.laboratorySpreadsheetId ?? null,
    sheetGid: options.laboratorySheetGid ?? null,
    relicOwnedIds: [],
    themeOwnedIds: [],
    cardStars: {},
    cardMasteryUnlockedIds: [],
    cardEquipSlots: 0,
    cardPresetLoadouts: [],
    workshopLevels: {},
    botsEpState: emptyBotsEpState(),
    uwsEpState: emptyUwsEpState(),
    modulesEpState: emptyModulesEpState(),
    labLevelOverrides: options.labLevelOverrides,
  }) as Promise<EffectivePathsExportCallResult<EffectivePathsLabsExportResult>>
}

export async function exportBotsToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  botsSpreadsheetId?: string | null
  botsSheetGid?: number | null
  botsEpState: BotsEpSyncState
}): Promise<EffectivePathsExportCallResult<EffectivePathsBotsExportResult>> {
  return exportToEffectivePaths({
    googleAccessToken: options.googleAccessToken,
    masterSpreadsheetId: options.masterSpreadsheetId ?? null,
    masterSheetGid: options.masterSheetGid ?? null,
    syncTarget: 'bots',
    spreadsheetId: options.botsSpreadsheetId ?? null,
    sheetGid: options.botsSheetGid ?? null,
    relicOwnedIds: [],
    themeOwnedIds: [],
    cardStars: {},
    cardMasteryUnlockedIds: [],
    cardEquipSlots: 0,
    cardPresetLoadouts: [],
    workshopLevels: {},
    botsEpState: options.botsEpState,
    uwsEpState: emptyUwsEpState(),
    modulesEpState: emptyModulesEpState(),
    labLevelOverrides: {},
  }) as Promise<EffectivePathsExportCallResult<EffectivePathsBotsExportResult>>
}

export async function exportUwsToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  uwsSpreadsheetId?: string | null
  uwsSheetGid?: number | null
  uwsEpState: UwsEpSyncState
}): Promise<EffectivePathsExportCallResult<EffectivePathsUwsExportResult>> {
  return exportToEffectivePaths({
    googleAccessToken: options.googleAccessToken,
    masterSpreadsheetId: options.masterSpreadsheetId ?? null,
    masterSheetGid: options.masterSheetGid ?? null,
    syncTarget: 'uws',
    spreadsheetId: options.uwsSpreadsheetId ?? null,
    sheetGid: options.uwsSheetGid ?? null,
    relicOwnedIds: [],
    themeOwnedIds: [],
    cardStars: {},
    cardMasteryUnlockedIds: [],
    cardEquipSlots: 0,
    cardPresetLoadouts: [],
    workshopLevels: {},
    botsEpState: emptyBotsEpState(),
    uwsEpState: options.uwsEpState,
    modulesEpState: emptyModulesEpState(),
    labLevelOverrides: {},
  }) as Promise<EffectivePathsExportCallResult<EffectivePathsUwsExportResult>>
}

export async function exportModulesToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  modulesSpreadsheetId?: string | null
  modulesSheetGid?: number | null
  modulesEpState: ModulesEpSyncState
}): Promise<EffectivePathsExportCallResult<EffectivePathsModulesExportResult>> {
  return exportToEffectivePaths({
    googleAccessToken: options.googleAccessToken,
    masterSpreadsheetId: options.masterSpreadsheetId ?? null,
    masterSheetGid: options.masterSheetGid ?? null,
    syncTarget: 'modules',
    spreadsheetId: options.modulesSpreadsheetId ?? null,
    sheetGid: options.modulesSheetGid ?? null,
    relicOwnedIds: [],
    themeOwnedIds: [],
    cardStars: {},
    cardMasteryUnlockedIds: [],
    cardEquipSlots: 0,
    cardPresetLoadouts: [],
    workshopLevels: {},
    botsEpState: emptyBotsEpState(),
    uwsEpState: emptyUwsEpState(),
    modulesEpState: options.modulesEpState,
    labLevelOverrides: {},
  }) as Promise<EffectivePathsExportCallResult<EffectivePathsModulesExportResult>>
}

function emptyBotsEpState(): BotsEpSyncState {
  return {
    levels: {},
    ownedByBotId: {
      flame: false,
      thunder: false,
      golden: false,
      amplify: false,
      botBot: false,
    },
    labLevels: {},
  }
}

function emptyUwsEpState(): UwsEpSyncState {
  return {
    levels: {},
    ownedByWeaponId: {
      chainLightning: false,
      smartMissiles: false,
      deathWave: false,
      chronoField: false,
      innerLandMines: false,
      goldenTower: false,
      poisonSwamp: false,
      blackHole: false,
      spotlight: false,
    },
  }
}

function emptyModulesEpState(): ModulesEpSyncState {
  return { modules: [], sectionLevels: modulesEpDefaultSectionLevels() }
}

async function exportToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  syncTarget: 'relics' | 'themes' | 'cards' | 'workshop' | 'bots' | 'labs' | 'uws' | 'modules'
  spreadsheetId?: string | null
  sheetGid?: number | null
  relicOwnedIds: readonly string[]
  themeOwnedIds: readonly string[]
  cardStars: Readonly<Record<string, number>>
  cardMasteryUnlockedIds: readonly string[]
  cardEquipSlots: number
  cardPresetLoadouts: readonly (readonly string[])[]
  workshopLevels: Readonly<Record<string, number>>
  botsEpState: BotsEpSyncState
  uwsEpState: UwsEpSyncState
  modulesEpState: ModulesEpSyncState
  labLevelOverrides: Readonly<Record<string, number>>
}): Promise<
  | {
      ok: true
      result:
        | EffectivePathsRelicsExportResult
        | EffectivePathsThemesExportResult
        | EffectivePathsCardsExportResult
        | EffectivePathsWorkshopExportResult
        | EffectivePathsBotsExportResult
        | EffectivePathsLabsExportResult
        | EffectivePathsUwsExportResult
        | EffectivePathsModulesExportResult
    }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
  try {
    const res = await fetch(`${API_BASE}/effective-paths/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Google-Access-Token': options.googleAccessToken,
      },
      body: JSON.stringify({
        syncTarget: options.syncTarget,
        masterSpreadsheetId: options.masterSpreadsheetId ?? null,
        masterSheetGid: options.masterSheetGid ?? null,
        spreadsheetId: options.spreadsheetId ?? null,
        sheetGid: options.sheetGid ?? null,
        relicOwnedIds: options.relicOwnedIds,
        themeOwnedIds: options.themeOwnedIds,
        cardStars: options.cardStars,
        cardMasteryUnlockedIds: options.cardMasteryUnlockedIds,
        cardEquipSlots: options.cardEquipSlots,
        cardPresetLoadouts: options.cardPresetLoadouts,
        workshopLevels: options.workshopLevels,
        botLevels: options.botsEpState.levels,
        botOwnedByBotId: options.botsEpState.ownedByBotId,
        botLabLevels: options.botsEpState.labLevels,
        uwsLevels: options.uwsEpState.levels,
        uwsOwnedByWeaponId: options.uwsEpState.ownedByWeaponId,
        modulesEpState: options.modulesEpState,
        labLevelOverrides: options.labLevelOverrides,
      }),
    })

    const body = await res.json().catch(() => null)
    if (!res.ok) {
      const err = await parseApiError(res, body)
      return { ok: false, ...err }
    }

    if (!body || typeof body !== 'object' || !('matchedRows' in body)) {
      return { ok: false, error: 'unknown' }
    }

    return {
      ok: true,
      result: body as
        | EffectivePathsRelicsExportResult
        | EffectivePathsThemesExportResult
        | EffectivePathsCardsExportResult
        | EffectivePathsWorkshopExportResult
        | EffectivePathsBotsExportResult
        | EffectivePathsLabsExportResult
        | EffectivePathsUwsExportResult
        | EffectivePathsModulesExportResult,
    }
  } catch {
    return { ok: false, error: 'network' }
  }
}

function isExportError(value: unknown): value is EffectivePathsExportError {
  return (
    value === 'invalid_spreadsheet' ||
    value === 'sheets_auth_failed' ||
    value === 'sheet_not_found' ||
    value === 'ids_master_not_found' ||
    value === 'ids_master_empty' ||
    value === 'relic_workbook_not_found' ||
    value === 'relic_workbook_access_denied' ||
    value === 'relic_tab_not_found' ||
    value === 'no_relic_rows' ||
    value === 'themes_workbook_not_found' ||
    value === 'themes_workbook_access_denied' ||
    value === 'themes_tab_not_found' ||
    value === 'no_theme_rows' ||
    value === 'cards_workbook_not_found' ||
    value === 'cards_workbook_access_denied' ||
    value === 'cards_tab_not_found' ||
    value === 'no_card_rows' ||
    value === 'no_card_preset_rows' ||
    value === 'workshop_workbook_not_found' ||
    value === 'workshop_workbook_access_denied' ||
    value === 'workshop_tab_not_found' ||
    value === 'no_workshop_rows' ||
    value === 'bots_workbook_not_found' ||
    value === 'bots_workbook_access_denied' ||
    value === 'bots_tab_not_found' ||
    value === 'no_bot_rows' ||
    value === 'laboratory_workbook_not_found' ||
    value === 'laboratory_workbook_access_denied' ||
    value === 'laboratory_tab_not_found' ||
    value === 'no_lab_rows' ||
    value === 'uws_workbook_not_found' ||
    value === 'uws_workbook_access_denied' ||
    value === 'uws_tab_not_found' ||
    value === 'no_uws_rows' ||
    value === 'modules_workbook_not_found' ||
    value === 'modules_workbook_access_denied' ||
    value === 'modules_tab_not_found' ||
    value === 'no_modules_rows' ||
    value === 'sheets_api_error' ||
    value === 'network' ||
    value === 'unknown'
  )
}

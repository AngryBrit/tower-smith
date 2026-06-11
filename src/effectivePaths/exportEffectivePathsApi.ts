import type { BotsEpSyncState } from './botsEpStateFromPersisted'
import type { ModulesEpSyncState } from './modulesEpStateFromPersisted'
import type { UwsEpSyncState } from './uwsEpStateFromPersisted'
import type { EffectivePathsLinkedWorkbook } from './parseIdsMasterWorkbooks'

export type LinkedWorkbookAccess = {
  name: string
  spreadsheetId: string
  access: 'ok' | 'denied' | 'not_found'
}

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

export type EffectivePathsListResult = {
  ok: true
  workbooks: EffectivePathsLinkedWorkbook[]
  idsTabTitle: string
  relicsWorkbook: EffectivePathsLinkedWorkbook | null
  relicsWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  themesWorkbook: EffectivePathsLinkedWorkbook | null
  themesWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  cardsWorkbook: EffectivePathsLinkedWorkbook | null
  cardsWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  workshopWorkbook: EffectivePathsLinkedWorkbook | null
  workshopWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  botsWorkbook: EffectivePathsLinkedWorkbook | null
  botsWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  laboratoryWorkbook: EffectivePathsLinkedWorkbook | null
  laboratoryWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  uwsWorkbook: EffectivePathsLinkedWorkbook | null
  uwsWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  modulesWorkbook: EffectivePathsLinkedWorkbook | null
  modulesWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  workbookAccess: LinkedWorkbookAccess[]
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

export async function listEffectivePathsWorkbooks(options: {
  googleAccessToken: string
  masterSpreadsheetId: string
  sheetGid: number | null
}): Promise<
  | EffectivePathsListResult
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
  try {
    const res = await fetch(`${API_BASE}/effective-paths/list`, {
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

    if (!body || typeof body !== 'object' || !('workbooks' in body)) {
      return { ok: false, error: 'unknown' }
    }

    const parsed = body as EffectivePathsListResult
    const relicsAccess = (parsed as { relicsWorkbookAccess?: unknown }).relicsWorkbookAccess
    const relicsWorkbookAccess =
      relicsAccess === 'ok' || relicsAccess === 'denied' || relicsAccess === 'not_found'
        ? relicsAccess
        : null
    const themesAccess = (parsed as { themesWorkbookAccess?: unknown }).themesWorkbookAccess
    const themesWorkbookAccess =
      themesAccess === 'ok' || themesAccess === 'denied' || themesAccess === 'not_found'
        ? themesAccess
        : null
    const cardsAccess = (parsed as { cardsWorkbookAccess?: unknown }).cardsWorkbookAccess
    const cardsWorkbookAccess =
      cardsAccess === 'ok' || cardsAccess === 'denied' || cardsAccess === 'not_found'
        ? cardsAccess
        : null
    const workshopAccess = (parsed as { workshopWorkbookAccess?: unknown }).workshopWorkbookAccess
    const workshopWorkbookAccess =
      workshopAccess === 'ok' || workshopAccess === 'denied' || workshopAccess === 'not_found'
        ? workshopAccess
        : null
    const botsAccess = (parsed as { botsWorkbookAccess?: unknown }).botsWorkbookAccess
    const botsWorkbookAccess =
      botsAccess === 'ok' || botsAccess === 'denied' || botsAccess === 'not_found'
        ? botsAccess
        : null
    const laboratoryAccess = (parsed as { laboratoryWorkbookAccess?: unknown })
      .laboratoryWorkbookAccess
    const laboratoryWorkbookAccess =
      laboratoryAccess === 'ok' ||
      laboratoryAccess === 'denied' ||
      laboratoryAccess === 'not_found'
        ? laboratoryAccess
        : null
    const uwsAccess = (parsed as { uwsWorkbookAccess?: unknown }).uwsWorkbookAccess
    const uwsWorkbookAccess =
      uwsAccess === 'ok' || uwsAccess === 'denied' || uwsAccess === 'not_found'
        ? uwsAccess
        : null
    const modulesAccess = (parsed as { modulesWorkbookAccess?: unknown }).modulesWorkbookAccess
    const modulesWorkbookAccess =
      modulesAccess === 'ok' || modulesAccess === 'denied' || modulesAccess === 'not_found'
        ? modulesAccess
        : null
    const rawAccess = (parsed as { workbookAccess?: unknown }).workbookAccess
    const workbookAccess = Array.isArray(rawAccess)
      ? rawAccess.filter(
          (row): row is LinkedWorkbookAccess =>
            row != null &&
            typeof row === 'object' &&
            typeof (row as LinkedWorkbookAccess).name === 'string' &&
            typeof (row as LinkedWorkbookAccess).spreadsheetId === 'string' &&
            ((row as LinkedWorkbookAccess).access === 'ok' ||
              (row as LinkedWorkbookAccess).access === 'denied' ||
              (row as LinkedWorkbookAccess).access === 'not_found'),
        )
      : []

    return {
      ok: true,
      workbooks: parsed.workbooks,
      idsTabTitle: typeof parsed.idsTabTitle === 'string' ? parsed.idsTabTitle : 'IDS',
      relicsWorkbook:
        parsed.relicsWorkbook &&
        typeof parsed.relicsWorkbook === 'object' &&
        typeof parsed.relicsWorkbook.spreadsheetId === 'string'
          ? parsed.relicsWorkbook
          : null,
      relicsWorkbookAccess,
      themesWorkbook:
        parsed.themesWorkbook &&
        typeof parsed.themesWorkbook === 'object' &&
        typeof parsed.themesWorkbook.spreadsheetId === 'string'
          ? parsed.themesWorkbook
          : null,
      themesWorkbookAccess,
      cardsWorkbook:
        parsed.cardsWorkbook &&
        typeof parsed.cardsWorkbook === 'object' &&
        typeof parsed.cardsWorkbook.spreadsheetId === 'string'
          ? parsed.cardsWorkbook
          : null,
      cardsWorkbookAccess,
      workshopWorkbook:
        parsed.workshopWorkbook &&
        typeof parsed.workshopWorkbook === 'object' &&
        typeof parsed.workshopWorkbook.spreadsheetId === 'string'
          ? parsed.workshopWorkbook
          : null,
      workshopWorkbookAccess,
      botsWorkbook:
        parsed.botsWorkbook &&
        typeof parsed.botsWorkbook === 'object' &&
        typeof parsed.botsWorkbook.spreadsheetId === 'string'
          ? parsed.botsWorkbook
          : null,
      botsWorkbookAccess,
      laboratoryWorkbook:
        parsed.laboratoryWorkbook &&
        typeof parsed.laboratoryWorkbook === 'object' &&
        typeof parsed.laboratoryWorkbook.spreadsheetId === 'string'
          ? parsed.laboratoryWorkbook
          : null,
      laboratoryWorkbookAccess,
      uwsWorkbook:
        parsed.uwsWorkbook &&
        typeof parsed.uwsWorkbook === 'object' &&
        typeof parsed.uwsWorkbook.spreadsheetId === 'string'
          ? parsed.uwsWorkbook
          : null,
      uwsWorkbookAccess,
      modulesWorkbook:
        parsed.modulesWorkbook &&
        typeof parsed.modulesWorkbook === 'object' &&
        typeof parsed.modulesWorkbook.spreadsheetId === 'string'
          ? parsed.modulesWorkbook
          : null,
      modulesWorkbookAccess,
      workbookAccess,
    }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function exportRelicsToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  relicsSpreadsheetId?: string | null
  relicsSheetGid?: number | null
  relicOwnedIds: readonly string[]
}): Promise<
  | { ok: true; result: EffectivePathsRelicsExportResult }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
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
  })
}

export async function exportThemesToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  themesSpreadsheetId?: string | null
  themesSheetGid?: number | null
  themeOwnedIds: readonly string[]
}): Promise<
  | { ok: true; result: EffectivePathsThemesExportResult }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
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
  })
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
}): Promise<
  | { ok: true; result: EffectivePathsCardsExportResult }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
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
  })
}

export async function exportWorkshopToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  workshopSpreadsheetId?: string | null
  workshopSheetGid?: number | null
  workshopLevels: Readonly<Record<string, number>>
}): Promise<
  | { ok: true; result: EffectivePathsWorkshopExportResult }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
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
  })
}

export async function exportLabsToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  laboratorySpreadsheetId?: string | null
  laboratorySheetGid?: number | null
  labLevelOverrides: Readonly<Record<string, number>>
}): Promise<
  | { ok: true; result: EffectivePathsLabsExportResult }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
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
    labLevelOverrides: options.labLevelOverrides,
  })
}

export async function exportBotsToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  botsSpreadsheetId?: string | null
  botsSheetGid?: number | null
  botsEpState: BotsEpSyncState
}): Promise<
  | { ok: true; result: EffectivePathsBotsExportResult }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
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
  })
}

export async function exportUwsToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  uwsSpreadsheetId?: string | null
  uwsSheetGid?: number | null
  uwsEpState: UwsEpSyncState
}): Promise<
  | { ok: true; result: EffectivePathsUwsExportResult }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
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
  })
}

export async function exportModulesToEffectivePaths(options: {
  googleAccessToken: string
  masterSpreadsheetId?: string | null
  masterSheetGid?: number | null
  modulesSpreadsheetId?: string | null
  modulesSheetGid?: number | null
  modulesEpState: ModulesEpSyncState
}): Promise<
  | { ok: true; result: EffectivePathsModulesExportResult }
  | { ok: false; error: EffectivePathsExportError; message?: string }
> {
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
  })
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
  return { modules: [] }
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

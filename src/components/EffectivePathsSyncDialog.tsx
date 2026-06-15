import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ImportNoticeVariant } from '../importNotice'
import type { BotsEpSyncState } from '../effectivePaths/botsEpStateFromPersisted'
import { countModulesEpEquippedSlots } from '../effectivePaths/buildModuleSheetUpdates'
import type { ModulesEpSyncState } from '../effectivePaths/modulesEpStateFromPersisted'
import type { GuardiansEpSyncState } from '../effectivePaths/guardiansEpStateFromPersisted'
import type { UwsEpSyncState } from '../effectivePaths/uwsEpStateFromPersisted'
import {
  EFFECTIVE_PATHS_IMPORT_TARGET_ORDER,
  IMPORT_TARGET_UI,
  importAllSuccessMessage,
  importPayloadFromResult,
  importSuccessMessage,
  type EffectivePathsImportPayload,
  type EffectivePathsImportTarget,
} from '../effectivePaths/effectivePathsImportDialogSupport'
import { EFFECTIVE_PATHS_EXPORT_TARGET_ORDER } from '../effectivePaths/effectivePathsExportDialogSupport'
import type { EffectivePathsExportTarget } from '../effectivePaths/effectivePathsExportSyncingLabel'
import {
  effectivePathsLoadProgressLabel,
  effectivePathsLoadProgressPercent,
} from '../effectivePaths/effectivePathsLoadProgressLabel'
import {
  effectivePathsSyncProgressLabel,
  effectivePathsSyncProgressPercent,
  syncWorkbookNameForTarget,
} from '../effectivePaths/effectivePathsSyncProgressLabel'
import { isModulesWorkbookName } from '../effectivePaths/effectivePathsCategoryNames'
import {
  applyEffectivePathsGateway,
  applyEffectivePathsWorkbookAccessRow,
  resetEffectivePathsWorkbookLoadState,
  resolveLinkedCategoryWorkbook,
} from '../effectivePaths/effectivePathsWorkbookLoadSetters'
import {
  exportBotsToEffectivePaths,
  exportLabsToEffectivePaths,
  exportModulesToEffectivePaths,
  exportUwsToEffectivePaths,
  exportGuardiansToEffectivePaths,
  exportCardsToEffectivePaths,
  exportRelicsToEffectivePaths,
  exportThemesToEffectivePaths,
  exportWorkshopToEffectivePaths,
  promoteEffectivePathsStagedSheets,
  discardEffectivePathsStagedSheets,
  importBotsFromEffectivePaths,
  importCardsFromEffectivePaths,
  importLabsFromEffectivePaths,
  importModulesFromEffectivePaths,
  importRelicsFromEffectivePaths,
  importThemesFromEffectivePaths,
  importUwsFromEffectivePaths,
  importGuardiansFromEffectivePaths,
  importWorkshopFromEffectivePaths,
  listEffectivePathsWorkbooks,
  type EffectivePathsExportError,
  type EffectivePathsLoadProgress,
  type EffectivePathsStagedSheetRef,
  type LinkedWorkbookAccess,
} from '../effectivePaths/exportEffectivePathsApi'
import {
  addPendingEffectivePathsExport,
  readPendingEffectivePathsExports,
  removePendingEffectivePathsExport,
  removePendingExportsForTarget,
  type EffectivePathsPendingExport,
} from '../effectivePaths/effectivePathsPendingExportStorage'
import { accessContextForSyncTarget } from '../effectivePaths/effectivePathsStaging'
import { useStoredSpreadsheetRef } from '../effectivePaths/useStoredSpreadsheetRef'
import {
  cacheLinkedSpreadsheetIdsFromGateway,
  collectDeniedLinkedSpreadsheetIds,
  collectSpreadsheetIdsFromGateway,
  ensureEffectivePathsSpreadsheetAccess,
  grantEffectivePathsSpreadsheetsAccess,
  linkedWorkbookNamesFromGateway,
} from '../effectivePaths/grantEffectivePathsSpreadsheetAccess'
import {
  isJsPickerGrantFailure,
  redirectMobilePickerAfterJsFailure,
} from '../effectivePaths/effectivePathsJsPickerFallback'
import {
  beginMobileEffectivePathsGrant,
  resumeMobileEffectivePathsGrant,
} from '../effectivePaths/effectivePathsMobileGrantFlow'
import {
  beginEpMobileResumeRun,
  claimEpMobileResume,
  consumeEpMobilePickerError,
  finishEpMobileResumeRun,
} from '../effectivePaths/effectivePathsMobileGrantSession'
import { mobilePickerRedirectPreferred } from '../effectivePaths/googleDrivePickerMobile'
import {
  getCachedGoogleSheetsAccessToken,
  googleSheetsOAuthConfigured,
  requestGoogleSheetsAccessToken,
} from '../effectivePaths/googleSheetsOAuth'
import type { EffectivePathsLinkedWorkbook } from '../effectivePaths/parseIdsMasterWorkbooks'
import {
  isGoogleSheetsQuotaExceededError,
  summarizeGoogleSheetsApiError,
} from '../effectivePaths/googleSheetsError'
import { parseSpreadsheetRef } from '../effectivePaths/parseSpreadsheetRef'
import { useAuth } from '../auth/useAuth'
import { useI18n, type StringId } from '../i18n'
import { EffectivePathsLinkedWorkbooksList } from './EffectivePathsLinkedWorkbooksList'
import { EffectivePathsPendingExportsPanel } from './EffectivePathsPendingExportsPanel'
import { EffectivePathsWorkbooksLoadingProgress } from './EffectivePathsWorkbooksLoadingProgress'
import { ImportNoticeBlock } from './ImportNoticeBlock'
import { labOverlayPortal } from './lab/labOverlayPortal'

const EXPORT_ERROR_KEYS: Record<EffectivePathsExportError, StringId> = {
  network: 'ep_export_error_network',
  invalid_spreadsheet: 'ep_export_error_invalid_spreadsheet',
  sheets_auth_failed: 'ep_export_error_sheets_auth_failed',
  sheet_not_found: 'ep_export_error_sheet_not_found',
  ids_master_not_found: 'ep_export_error_ids_master_not_found',
  ids_master_empty: 'ep_export_error_ids_master_empty',
  relic_workbook_not_found: 'ep_export_error_relic_workbook_not_found',
  relic_workbook_access_denied: 'ep_export_error_relic_workbook_access_denied',
  relic_tab_not_found: 'ep_export_error_relic_tab_not_found',
  no_relic_rows: 'ep_export_error_no_relic_rows',
  themes_workbook_not_found: 'ep_export_error_themes_workbook_not_found',
  themes_workbook_access_denied: 'ep_export_error_themes_workbook_access_denied',
  themes_tab_not_found: 'ep_export_error_themes_tab_not_found',
  no_theme_rows: 'ep_export_error_no_theme_rows',
  cards_workbook_not_found: 'ep_export_error_cards_workbook_not_found',
  cards_workbook_access_denied: 'ep_export_error_cards_workbook_access_denied',
  cards_tab_not_found: 'ep_export_error_cards_tab_not_found',
  no_card_rows: 'ep_export_error_no_card_rows',
  no_card_preset_rows: 'ep_export_error_no_card_preset_rows',
  workshop_workbook_not_found: 'ep_export_error_workshop_workbook_not_found',
  workshop_workbook_access_denied: 'ep_export_error_workshop_workbook_access_denied',
  workshop_tab_not_found: 'ep_export_error_workshop_tab_not_found',
  no_workshop_rows: 'ep_export_error_no_workshop_rows',
  bots_workbook_not_found: 'ep_export_error_bots_workbook_not_found',
  bots_workbook_access_denied: 'ep_export_error_bots_workbook_access_denied',
  bots_tab_not_found: 'ep_export_error_bots_tab_not_found',
  no_bot_rows: 'ep_export_error_no_bot_rows',
  laboratory_workbook_not_found: 'ep_export_error_laboratory_workbook_not_found',
  laboratory_workbook_access_denied: 'ep_export_error_laboratory_workbook_access_denied',
  laboratory_tab_not_found: 'ep_export_error_laboratory_tab_not_found',
  no_lab_rows: 'ep_export_error_no_lab_rows',
  uws_workbook_not_found: 'ep_export_error_uws_workbook_not_found',
  uws_workbook_access_denied: 'ep_export_error_uws_workbook_access_denied',
  uws_tab_not_found: 'ep_export_error_uws_tab_not_found',
  no_uws_rows: 'ep_export_error_no_uws_rows',
  guardians_workbook_not_found: 'ep_export_error_guardians_workbook_not_found',
  guardians_workbook_access_denied: 'ep_export_error_guardians_workbook_access_denied',
  guardians_tab_not_found: 'ep_export_error_guardians_tab_not_found',
  no_guardians_rows: 'ep_export_error_no_guardians_rows',
  modules_workbook_not_found: 'ep_export_error_modules_workbook_not_found',
  modules_workbook_access_denied: 'ep_export_error_modules_workbook_access_denied',
  modules_tab_not_found: 'ep_export_error_modules_tab_not_found',
  no_modules_rows: 'ep_export_error_no_modules_rows',
  sheets_api_error: 'ep_export_error_sheets_api_error',
  unknown: 'ep_export_error_unknown',
}

export type EffectivePathsSyncDialogProps = {
  open: boolean
  onClose: () => void
  relicOwnedIds: readonly string[]
  themeOwnedIds: readonly string[]
  cardStars: Readonly<Record<string, number>>
  cardMasteryUnlockedIds: readonly string[]
  cardEquipSlots: number
  cardPresetLoadouts: readonly (readonly string[])[]
  workshopLevels: Readonly<Record<string, number>>
  labLevelOverrides: Readonly<Record<string, number>>
  botsEpState: BotsEpSyncState
  uwsEpState: UwsEpSyncState
  guardiansEpState: GuardiansEpSyncState
  modulesEpState: ModulesEpSyncState
  /** Success notice after export completes. */
  onSuccess: (message: string) => void
  onImported: (payload: EffectivePathsImportPayload, message: string) => void
  onImportedAll: (payloads: EffectivePathsImportPayload[], message: string) => void
}

/** @deprecated Use EffectivePathsSyncDialog */
export type EffectivePathsExportDialogProps = EffectivePathsSyncDialogProps

export function EffectivePathsSyncDialog({
  open,
  onClose,
  relicOwnedIds,
  themeOwnedIds,
  cardStars,
  cardMasteryUnlockedIds,
  cardEquipSlots,
  cardPresetLoadouts,
  workshopLevels,
  labLevelOverrides,
  botsEpState,
  uwsEpState,
  guardiansEpState,
  modulesEpState,
  onSuccess,
  onImported,
  onImportedAll,
}: EffectivePathsSyncDialogProps) {
  const { t } = useI18n()
  const { user } = useAuth()
  const spreadsheetUserId = user?.id ?? null
  const titleId = useId()
  const listId = useId()
  const { spreadsheetRef, persistSpreadsheetRef, reloadSpreadsheetRef } =
    useStoredSpreadsheetRef(spreadsheetUserId)
  const [googleToken, setGoogleToken] = useState<string | null>(() =>
    getCachedGoogleSheetsAccessToken(),
  )
  const [, setWorkbooks] = useState<EffectivePathsLinkedWorkbook[] | null>(null)
  const [idsTabTitle, setIdsTabTitle] = useState<string | null>(null)
  const [relicsWorkbook, setRelicsWorkbook] = useState<EffectivePathsLinkedWorkbook | null>(null)
  const [relicsWorkbookAccess, setRelicsWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [themesWorkbook, setThemesWorkbook] = useState<EffectivePathsLinkedWorkbook | null>(null)
  const [themesWorkbookAccess, setThemesWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [cardsWorkbook, setCardsWorkbook] = useState<EffectivePathsLinkedWorkbook | null>(null)
  const [cardsWorkbookAccess, setCardsWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [workshopWorkbook, setWorkshopWorkbook] = useState<EffectivePathsLinkedWorkbook | null>(null)
  const [workshopWorkbookAccess, setWorkshopWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [botsWorkbook, setBotsWorkbook] = useState<EffectivePathsLinkedWorkbook | null>(null)
  const [botsWorkbookAccess, setBotsWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [laboratoryWorkbook, setLaboratoryWorkbook] =
    useState<EffectivePathsLinkedWorkbook | null>(null)
  const [laboratoryWorkbookAccess, setLaboratoryWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [uwsWorkbook, setUwsWorkbook] = useState<EffectivePathsLinkedWorkbook | null>(null)
  const [uwsWorkbookAccess, setUwsWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [guardiansWorkbook, setGuardiansWorkbook] =
    useState<EffectivePathsLinkedWorkbook | null>(null)
  const [guardiansWorkbookAccess, setGuardiansWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [modulesWorkbook, setModulesWorkbook] = useState<EffectivePathsLinkedWorkbook | null>(null)
  const [modulesWorkbookAccess, setModulesWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [workbookAccess, setWorkbookAccess] = useState<LinkedWorkbookAccess[] | null>(null)
  const [loadingSheets, setLoadingSheets] = useState(false)
  const [pickerUiHidden, setPickerUiHidden] = useState(false)
  const [loadProgress, setLoadProgress] = useState<EffectivePathsLoadProgress | null>(null)
  const [syncProgress, setSyncProgress] = useState<{
    direction: 'import' | 'export'
    completed: number
    total: number
    currentWorkbookName: string
  } | null>(null)
  const [exportingTarget, setExportingTarget] = useState<EffectivePathsExportTarget | null>(null)
  const [importingTarget, setImportingTarget] = useState<EffectivePathsImportTarget | null>(null)
  const [importingAll, setImportingAll] = useState(false)
  const [exportingAll, setExportingAll] = useState(false)
  const bulkSyncRef = useRef<
    | {
        collect: true
        messages: string[]
        payloads: EffectivePathsImportPayload[]
        pendingEntries: EffectivePathsPendingExport[]
      }
    | { collect: false }
  >({ collect: false })
  const [pendingExports, setPendingExports] = useState<EffectivePathsPendingExport[]>(() =>
    readPendingEffectivePathsExports(),
  )
  const pendingExportTargets = useMemo(
    (): ReadonlySet<EffectivePathsExportTarget> =>
      new Set(
        pendingExports.map((entry) => entry.syncTarget as EffectivePathsExportTarget),
      ),
    [pendingExports],
  )
  const [promotingExportId, setPromotingExportId] = useState<string | null>(null)
  const [discardingExportId, setDiscardingExportId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ message: string; variant: ImportNoticeVariant } | null>(
    null,
  )

  const parsedMaster = parseSpreadsheetRef(spreadsheetRef)
  const canSyncRelics =
    relicsWorkbook != null &&
    relicsWorkbookAccess !== 'denied' &&
    relicsWorkbookAccess !== 'not_found'
  const canSyncThemes =
    themesWorkbook != null &&
    themesWorkbookAccess !== 'denied' &&
    themesWorkbookAccess !== 'not_found'
  const canSyncCards =
    cardsWorkbook != null &&
    cardsWorkbookAccess !== 'denied' &&
    cardsWorkbookAccess !== 'not_found'
  const canSyncWorkshop =
    workshopWorkbook != null &&
    workshopWorkbookAccess !== 'denied' &&
    workshopWorkbookAccess !== 'not_found'
  const canSyncBots =
    botsWorkbook != null &&
    botsWorkbookAccess !== 'denied' &&
    botsWorkbookAccess !== 'not_found'
  const canSyncLabs =
    laboratoryWorkbook != null &&
    laboratoryWorkbookAccess !== 'denied' &&
    laboratoryWorkbookAccess !== 'not_found'
  const canSyncUws =
    uwsWorkbook != null &&
    uwsWorkbookAccess !== 'denied' &&
    uwsWorkbookAccess !== 'not_found'
  const canSyncGuardians =
    guardiansWorkbook != null &&
    guardiansWorkbookAccess !== 'denied' &&
    guardiansWorkbookAccess !== 'not_found'
  const modulesEquippedCount = countModulesEpEquippedSlots(modulesEpState)
  const modulesWorkbookResolved = useMemo(
    () =>
      resolveLinkedCategoryWorkbook(
        modulesWorkbook,
        modulesWorkbookAccess,
        workbookAccess,
        isModulesWorkbookName,
      ),
    [modulesWorkbook, modulesWorkbookAccess, workbookAccess],
  )
  const canSyncModules =
    modulesWorkbookResolved.workbook != null &&
    modulesWorkbookResolved.access !== 'denied' &&
    modulesWorkbookResolved.access !== 'not_found'
  const workbookByTarget = useMemo(
    () => ({
      relics: { workbook: relicsWorkbook, access: relicsWorkbookAccess },
      themes: { workbook: themesWorkbook, access: themesWorkbookAccess },
      cards: { workbook: cardsWorkbook, access: cardsWorkbookAccess },
      workshop: { workbook: workshopWorkbook, access: workshopWorkbookAccess },
      bots: { workbook: botsWorkbook, access: botsWorkbookAccess },
      labs: { workbook: laboratoryWorkbook, access: laboratoryWorkbookAccess },
      uws: { workbook: uwsWorkbook, access: uwsWorkbookAccess },
      guardians: { workbook: guardiansWorkbook, access: guardiansWorkbookAccess },
      modules: {
        workbook: modulesWorkbookResolved.workbook,
        access: modulesWorkbookResolved.access,
      },
    }),
    [
      relicsWorkbook,
      relicsWorkbookAccess,
      themesWorkbook,
      themesWorkbookAccess,
      cardsWorkbook,
      cardsWorkbookAccess,
      workshopWorkbook,
      workshopWorkbookAccess,
      botsWorkbook,
      botsWorkbookAccess,
      laboratoryWorkbook,
      laboratoryWorkbookAccess,
      uwsWorkbook,
      uwsWorkbookAccess,
      guardiansWorkbook,
      guardiansWorkbookAccess,
      modulesWorkbookResolved,
    ],
  )
  const canImportTarget = useCallback(
    (target: EffectivePathsImportTarget): boolean => {
      const row = workbookByTarget[target]
      return row.workbook != null && row.access !== 'denied' && row.access !== 'not_found'
    },
    [workbookByTarget],
  )
  const canExportTarget = useCallback(
    (target: EffectivePathsExportTarget): boolean => {
      switch (target) {
        case 'relics':
          return canSyncRelics
        case 'themes':
          return canSyncThemes
        case 'cards':
          return canSyncCards
        case 'workshop':
          return canSyncWorkshop
        case 'bots':
          return canSyncBots
        case 'labs':
          return canSyncLabs
        case 'uws':
          return canSyncUws
        case 'guardians':
          return canSyncGuardians
        case 'modules':
          return canSyncModules
      }
    },
    [
      canSyncRelics,
      canSyncThemes,
      canSyncCards,
      canSyncWorkshop,
      canSyncBots,
      canSyncLabs,
      canSyncUws,
      canSyncGuardians,
      canSyncModules,
    ],
  )
  const exporting = exportingTarget != null || exportingAll
  const importing = importingTarget != null || importingAll
  const stagingBusy = promotingExportId != null || discardingExportId != null
  const busy = loadingSheets || exporting || importing || stagingBusy
  const importableTargetCount = useMemo(
    () => EFFECTIVE_PATHS_IMPORT_TARGET_ORDER.filter((target) => canImportTarget(target)).length,
    [canImportTarget],
  )
  const exportableTargetCount = useMemo(
    () => EFFECTIVE_PATHS_EXPORT_TARGET_ORDER.filter((target) => canExportTarget(target)).length,
    [canExportTarget],
  )
  useEffect(() => {
    if (!open) return
    const frameId = window.requestAnimationFrame(() => {
      reloadSpreadsheetRef()
      setNotice(null)
      setPendingExports(readPendingEffectivePathsExports())
      const cached = getCachedGoogleSheetsAccessToken()
      if (cached) setGoogleToken(cached)
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [open, reloadSpreadsheetRef, spreadsheetUserId])

  const showNotice = useCallback((message: string, variant: ImportNoticeVariant) => {
    setNotice({ message, variant })
  }, [])

  const enrichStagedSheets = useCallback(
    (
      syncTarget: EffectivePathsExportTarget,
      stagedSheets: readonly EffectivePathsStagedSheetRef[],
    ): EffectivePathsStagedSheetRef[] =>
      stagedSheets.map((sheet) => ({
        ...sheet,
        accessContext: sheet.accessContext ?? accessContextForSyncTarget(syncTarget),
      })),
    [],
  )

  const registerStagedExport = useCallback(
    (
      target: EffectivePathsExportTarget,
      stagedSheets: readonly EffectivePathsStagedSheetRef[],
      summary: string,
    ) => {
      removePendingExportsForTarget(target)
      const entry: EffectivePathsPendingExport = {
        id: `${target}-${Date.now()}`,
        syncTarget: target,
        createdAt: Date.now(),
        stagedSheets: enrichStagedSheets(target, stagedSheets),
        summary,
      }
      addPendingEffectivePathsExport(entry)
      setPendingExports(readPendingEffectivePathsExports())

      if (bulkSyncRef.current.collect) {
        bulkSyncRef.current.messages.push(summary)
        bulkSyncRef.current.pendingEntries.push(entry)
        return
      }
      showNotice(summary, 'info')
    },
    [enrichStagedSheets, showNotice],
  )

  const reportSyncProgress = useCallback(
    (
      direction: 'import' | 'export',
      target: EffectivePathsImportTarget,
      completed: number,
      total: number,
    ) => {
      setSyncProgress({
        direction,
        completed,
        total,
        currentWorkbookName: syncWorkbookNameForTarget(
          target,
          workbookByTarget[target].workbook?.name,
        ),
      })
    },
    [workbookByTarget],
  )

  const finishImportSuccess = useCallback(
    (payload: EffectivePathsImportPayload, message: string) => {
      if (bulkSyncRef.current.collect) {
        bulkSyncRef.current.payloads.push(payload)
        bulkSyncRef.current.messages.push(message)
        return
      }
      onImported(payload, message)
      onClose()
    },
    [onClose, onImported],
  )

  const formatExportError = useCallback(
    (error: EffectivePathsExportError, apiMessage?: string) => {
      if (error === 'sheets_api_error' && isGoogleSheetsQuotaExceededError(apiMessage)) {
        return t('ep_export_error_sheets_quota')
      }
      const errorKey = EXPORT_ERROR_KEYS[error] ?? 'ep_export_error_unknown'
      let message = t(errorKey)
      if (apiMessage) {
        const detail = summarizeGoogleSheetsApiError(apiMessage) ?? apiMessage
        if (detail && error === 'sheets_api_error') {
          message = `${message} (${detail})`
        }
      }
      return message
    },
    [t],
  )

  const ensureGoogleToken = useCallback(
    async (options?: { consent?: boolean }): Promise<string | null> => {
      if (!options?.consent) {
        const cached = googleToken ?? getCachedGoogleSheetsAccessToken()
        if (cached) {
          if (!googleToken) setGoogleToken(cached)
          return cached
        }
      }
      if (!googleSheetsOAuthConfigured()) {
        showNotice(t('ep_export_oauth_not_configured'), 'error')
        return null
      }
      try {
        const token = await requestGoogleSheetsAccessToken({ consent: options?.consent })
        setGoogleToken(token)
        return token
      } catch (err) {
        const code = err instanceof Error ? err.message : 'unknown'
        if (code === 'popup_closed_by_user' || code === 'access_denied') {
          showNotice(t('ep_export_cancelled'), 'info')
        } else if (code === 'google_oauth_timeout' || code === 'popup_blocked') {
          showNotice(t('ep_export_oauth_timeout'), 'error')
        } else {
          showNotice(t('ep_export_error_unknown'), 'error')
        }
        return null
      }
    },
    [googleToken, showNotice, t],
  )

  const pickerTitles = useMemo(
    () => ({
      idsMaster: t('ep_picker_ids_master_title'),
      allWorkbooks: t('ep_picker_all_workbooks_title'),
      linkedWorkbooks: t('ep_picker_linked_workbooks_title'),
    }),
    [t],
  )

  const reportMobilePickerError = useCallback(
    (reason: string) => {
      if (reason === 'cancelled') {
        showNotice(t('ep_export_picker_cancelled'), 'info')
      } else if (reason === 'wrong_spreadsheet') {
        showNotice(t('ep_export_picker_wrong_ids_master'), 'error')
      } else {
        showNotice(t('ep_export_picker_failed'), 'error')
      }
    },
    [showNotice, t],
  )

  const loadLinkedWorkbooks = useCallback(
    async (token: string) => {
      if (!parsedMaster) return

      const workbookLoadSetters = {
        setWorkbooks,
        setIdsTabTitle,
        setRelicsWorkbook,
        setRelicsWorkbookAccess,
        setThemesWorkbook,
        setThemesWorkbookAccess,
        setCardsWorkbook,
        setCardsWorkbookAccess,
        setWorkshopWorkbook,
        setWorkshopWorkbookAccess,
        setBotsWorkbook,
        setBotsWorkbookAccess,
        setLaboratoryWorkbook,
        setLaboratoryWorkbookAccess,
        setUwsWorkbook,
        setUwsWorkbookAccess,
        setGuardiansWorkbook,
        setGuardiansWorkbookAccess,
        setModulesWorkbook,
        setModulesWorkbookAccess,
        setWorkbookAccess,
      }

      const listWorkbooks = () =>
        listEffectivePathsWorkbooks({
          googleAccessToken: token,
          masterSpreadsheetId: parsedMaster.spreadsheetId,
          sheetGid: parsedMaster.sheetGid,
          onProgress: setLoadProgress,
          onGateway: (gateway) => {
            applyEffectivePathsGateway(gateway, workbookLoadSetters)
          },
          onWorkbookAccess: (row) => {
            applyEffectivePathsWorkbookAccessRow(row, workbookLoadSetters)
          },
        })

      let result = await listWorkbooks()

      if (result.ok) {
        cacheLinkedSpreadsheetIdsFromGateway(parsedMaster.spreadsheetId, result)

        const deniedIds = collectDeniedLinkedSpreadsheetIds(result.workbookAccess)
        if (deniedIds.length > 0) {
          const linkedNames = linkedWorkbookNamesFromGateway(result)
          if (!mobilePickerRedirectPreferred()) {
            const retryGrant = await grantEffectivePathsSpreadsheetsAccess(
              token,
              collectSpreadsheetIdsFromGateway(result, parsedMaster.spreadsheetId),
              {
                title:
                  linkedNames.length > 0
                    ? `${t('ep_picker_linked_workbooks_title')} (${linkedNames.join(', ')})`
                    : t('ep_picker_linked_workbooks_title'),
                multiselect: true,
                requireMasterSpreadsheetId: parsedMaster.spreadsheetId,
                onPickerUiActive: setPickerUiHidden,
              },
            )
            if (!retryGrant.ok) {
              if (isJsPickerGrantFailure(retryGrant.reason)) {
                await redirectMobilePickerAfterJsFailure({
                  phase: 'linked_workbooks',
                  masterSpreadsheetId: parsedMaster.spreadsheetId,
                  masterSheetGid: parsedMaster.sheetGid,
                  spreadsheetIds: collectSpreadsheetIdsFromGateway(result, parsedMaster.spreadsheetId),
                  multiselect: true,
                  titles: pickerTitles,
                  gateway: result,
                })
              }
              reportMobilePickerError(retryGrant.reason)
            } else {
              result = await listWorkbooks()
              if (result.ok) {
                cacheLinkedSpreadsheetIdsFromGateway(parsedMaster.spreadsheetId, result)
              }
            }
          }
        }
      }

      if (!result.ok) {
        showNotice(formatExportError(result.error, result.message), 'error')
        return
      }

      setWorkbooks(result.workbooks)
      setIdsTabTitle(result.idsTabTitle)
      setRelicsWorkbook(result.relicsWorkbook)
      setRelicsWorkbookAccess(result.relicsWorkbookAccess)
      setThemesWorkbook(result.themesWorkbook)
      setThemesWorkbookAccess(result.themesWorkbookAccess)
      setCardsWorkbook(result.cardsWorkbook)
      setCardsWorkbookAccess(result.cardsWorkbookAccess)
      setWorkshopWorkbook(result.workshopWorkbook)
      setWorkshopWorkbookAccess(result.workshopWorkbookAccess)
      setBotsWorkbook(result.botsWorkbook)
      setBotsWorkbookAccess(result.botsWorkbookAccess)
      setLaboratoryWorkbook(result.laboratoryWorkbook)
      setLaboratoryWorkbookAccess(result.laboratoryWorkbookAccess)
      setUwsWorkbook(result.uwsWorkbook)
      setUwsWorkbookAccess(result.uwsWorkbookAccess)
      setGuardiansWorkbook(result.guardiansWorkbook)
      setGuardiansWorkbookAccess(result.guardiansWorkbookAccess)
      setModulesWorkbook(result.modulesWorkbook)
      setModulesWorkbookAccess(result.modulesWorkbookAccess)
      setWorkbookAccess(result.workbookAccess)
      const deniedWorkbooks = result.workbookAccess.filter((row) => row.access === 'denied')
      if (deniedWorkbooks.length > 0) {
        showNotice(
          t('ep_export_linked_workbooks_denied').replace(
            '{{names}}',
            deniedWorkbooks.map((row) => row.name).join(', '),
          ),
          'error',
        )
      } else if (
        !result.relicsWorkbook &&
        !result.themesWorkbook &&
        !result.cardsWorkbook &&
        !result.workshopWorkbook &&
        !result.botsWorkbook &&
        !result.laboratoryWorkbook &&
        !result.uwsWorkbook &&
        !result.guardiansWorkbook &&
        !result.modulesWorkbook
      ) {
        const loaded = result.workbooks.map((workbook) => workbook.name).join(', ')
        showNotice(
          loaded
            ? `${t('ep_export_sync_targets_missing')} ${t('ep_export_relics_missing_loaded').replace('{{names}}', loaded)}`
            : t('ep_export_sync_targets_missing'),
          'error',
        )
      }
    },
    [formatExportError, parsedMaster, pickerTitles, reportMobilePickerError, showNotice, t],
  )

  useEffect(() => {
    if (!open) return

    const mobileError = consumeEpMobilePickerError()
    if (mobileError) {
      queueMicrotask(() => reportMobilePickerError(mobileError))
      return
    }

    const resume = claimEpMobileResume()
    if (!resume) return
    if (!beginEpMobileResumeRun()) return

    void (async () => {
      setLoadingSheets(true)
      setPickerUiHidden(false)
      resetEffectivePathsWorkbookLoadState({
        setWorkbooks,
        setIdsTabTitle,
        setRelicsWorkbook,
        setRelicsWorkbookAccess,
        setThemesWorkbook,
        setThemesWorkbookAccess,
        setCardsWorkbook,
        setCardsWorkbookAccess,
        setWorkshopWorkbook,
        setWorkshopWorkbookAccess,
        setBotsWorkbook,
        setBotsWorkbookAccess,
        setLaboratoryWorkbook,
        setLaboratoryWorkbookAccess,
        setUwsWorkbook,
        setUwsWorkbookAccess,
        setGuardiansWorkbook,
        setGuardiansWorkbookAccess,
        setModulesWorkbook,
        setModulesWorkbookAccess,
        setWorkbookAccess,
      })
      setLoadProgress(null)
      setNotice(null)
      try {
        const accessResult = await resumeMobileEffectivePathsGrant(resume)
        if (!accessResult.ok) {
          if (accessResult.reason === 'gateway_failed') {
            showNotice(formatExportError(accessResult.error, accessResult.message), 'error')
          } else {
            reportMobilePickerError(accessResult.reason)
          }
          return
        }

        const token = getCachedGoogleSheetsAccessToken()
        if (!token) {
          showNotice(t('ep_export_error_sheets_auth_failed'), 'error')
          return
        }
        setGoogleToken(token)
        await loadLinkedWorkbooks(token)
      } catch (err) {
        if (err instanceof Error && err.message === 'mobile_picker_redirect') return
        showNotice(t('ep_export_picker_failed'), 'error')
      } finally {
        setLoadingSheets(false)
        setLoadProgress(null)
        setPickerUiHidden(false)
        finishEpMobileResumeRun(true)
      }
    })()
  }, [formatExportError, loadLinkedWorkbooks, open, reportMobilePickerError, showNotice, t])

  const handleLoadSheets = useCallback(async () => {
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }

    setLoadingSheets(true)
    resetEffectivePathsWorkbookLoadState({
      setWorkbooks,
      setIdsTabTitle,
      setRelicsWorkbook,
      setRelicsWorkbookAccess,
      setThemesWorkbook,
      setThemesWorkbookAccess,
      setCardsWorkbook,
      setCardsWorkbookAccess,
      setWorkshopWorkbook,
      setWorkshopWorkbookAccess,
      setBotsWorkbook,
      setBotsWorkbookAccess,
      setLaboratoryWorkbook,
      setLaboratoryWorkbookAccess,
      setUwsWorkbook,
      setUwsWorkbookAccess,
      setGuardiansWorkbook,
      setGuardiansWorkbookAccess,
      setModulesWorkbook,
      setModulesWorkbookAccess,
      setWorkbookAccess,
    })
    setLoadProgress(null)
    setNotice(null)
    try {
      persistSpreadsheetRef()

      if (mobilePickerRedirectPreferred()) {
        await beginMobileEffectivePathsGrant({
          masterSpreadsheetId: parsedMaster.spreadsheetId,
          masterSheetGid: parsedMaster.sheetGid,
          titles: pickerTitles,
        })
        return
      }

      const token = await ensureGoogleToken({ consent: true })
      if (!token) return

      const accessResult = await ensureEffectivePathsSpreadsheetAccess({
        accessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        masterSheetGid: parsedMaster.sheetGid,
        titles: pickerTitles,
        onPickerUiActive: setPickerUiHidden,
      })
      if (!accessResult.ok) {
        if (accessResult.reason === 'gateway_failed') {
          showNotice(formatExportError(accessResult.error, accessResult.message), 'error')
        } else {
          reportMobilePickerError(accessResult.reason)
        }
        return
      }

      await loadLinkedWorkbooks(token)
    } catch (err) {
      if (err instanceof Error && err.message === 'mobile_picker_redirect') return
      showNotice(t('ep_export_picker_failed'), 'error')
    } finally {
      setLoadingSheets(false)
      setLoadProgress(null)
      setPickerUiHidden(false)
    }
  }, [
    parsedMaster,
    ensureGoogleToken,
    persistSpreadsheetRef,
    spreadsheetRef,
    formatExportError,
    loadLinkedWorkbooks,
    pickerTitles,
    reportMobilePickerError,
    showNotice,
    t,
  ])

  const handleExportRelics = useCallback(async () => {
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }
    if (!canSyncRelics) {
      showNotice(
        relicsWorkbook
          ? t('ep_export_error_relic_workbook_access_denied').replace(
              '{{id}}',
              relicsWorkbook.spreadsheetId,
            )
          : t('ep_export_relics_missing_in_master'),
        'error',
      )
      return
    }

    setExportingTarget('relics')
    setNotice(null)
    try {
      const token = await ensureGoogleToken()
      if (!token) return

      persistSpreadsheetRef()

      const result = await exportRelicsToEffectivePaths({
        googleAccessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        masterSheetGid: parsedMaster.sheetGid,
        relicOwnedIds,
      })

      if (!result.ok) {
        if (result.error === 'relic_workbook_access_denied') {
          showNotice(
            t('ep_export_error_relic_workbook_access_denied').replace(
              '{{id}}',
              relicsWorkbook?.spreadsheetId ?? '',
            ),
            'error',
          )
        } else {
          showNotice(formatExportError(result.error, result.message), 'error')
        }
        return
      }

      const { matchedRows, updatedCells, sheetTitle, unmappedSheetNames, stagedSheets } = result.result
      let message = t('ep_export_relics_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      if (unmappedSheetNames.length > 0) {
        message += ` ${t('ep_export_relics_unmapped_hint').replace('{{count}}', String(unmappedSheetNames.length))}`
        const sample = [...new Set(unmappedSheetNames)].slice(0, 5).join(', ')
        if (sample) {
          message += ` ${t('ep_export_relics_unmapped_sample').replace('{{names}}', sample)}`
        }
      }
      registerStagedExport('relics', stagedSheets, message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncRelics,
    ensureGoogleToken,
    persistSpreadsheetRef,
    spreadsheetRef,
    relicOwnedIds,
    relicsWorkbook,
    formatExportError,
    showNotice,
    registerStagedExport,
    t,
  ])

  const handleExportThemes = useCallback(async () => {
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }
    if (!canSyncThemes) {
      showNotice(
        themesWorkbook
          ? t('ep_export_error_themes_workbook_access_denied').replace(
              '{{id}}',
              themesWorkbook.spreadsheetId,
            )
          : t('ep_export_themes_missing_in_master'),
        'error',
      )
      return
    }

    setExportingTarget('themes')
    setNotice(null)
    try {
      const token = await ensureGoogleToken()
      if (!token) return

      persistSpreadsheetRef()

      const result = await exportThemesToEffectivePaths({
        googleAccessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        masterSheetGid: parsedMaster.sheetGid,
        themeOwnedIds,
      })

      if (!result.ok) {
        if (result.error === 'themes_workbook_access_denied') {
          showNotice(
            t('ep_export_error_themes_workbook_access_denied').replace(
              '{{id}}',
              themesWorkbook?.spreadsheetId ?? '',
            ),
            'error',
          )
        } else {
          showNotice(formatExportError(result.error, result.message), 'error')
        }
        return
      }

      const { matchedRows, updatedCells, sheetTitle, unmappedSheetNames, stagedSheets } = result.result
      let message = t('ep_export_themes_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      if (unmappedSheetNames.length > 0) {
        message += ` ${t('ep_export_themes_unmapped_hint').replace('{{count}}', String(unmappedSheetNames.length))}`
        const sample = [...new Set(unmappedSheetNames)].slice(0, 5).join(', ')
        if (sample) {
          message += ` ${t('ep_export_themes_unmapped_sample').replace('{{names}}', sample)}`
        }
      }
      registerStagedExport('themes', stagedSheets, message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncThemes,
    ensureGoogleToken,
    persistSpreadsheetRef,
    spreadsheetRef,
    themeOwnedIds,
    themesWorkbook,
    formatExportError,
    showNotice,
    registerStagedExport,
    t,
  ])

  const handleExportCards = useCallback(async () => {
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }
    if (!canSyncCards) {
      showNotice(
        cardsWorkbook
          ? t('ep_export_error_cards_workbook_access_denied').replace(
              '{{id}}',
              cardsWorkbook.spreadsheetId,
            )
          : t('ep_export_cards_missing_in_master'),
        'error',
      )
      return
    }

    setExportingTarget('cards')
    setNotice(null)
    try {
      const token = await ensureGoogleToken()
      if (!token) return

      persistSpreadsheetRef()

      const result = await exportCardsToEffectivePaths({
        googleAccessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        masterSheetGid: parsedMaster.sheetGid,
        cardStars,
        cardMasteryUnlockedIds,
        cardEquipSlots,
        cardPresetLoadouts,
      })

      if (!result.ok) {
        if (result.error === 'cards_workbook_access_denied') {
          showNotice(
            t('ep_export_error_cards_workbook_access_denied').replace(
              '{{id}}',
              cardsWorkbook?.spreadsheetId ?? '',
            ),
            'error',
          )
        } else {
          showNotice(formatExportError(result.error, result.message), 'error')
        }
        return
      }

      const {
        matchedRows,
        updatedCells,
        sheetTitle,
        unmappedSheetNames,
        presetSheetTitle,
        presetMatchedRows,
        stagedSheets,
      } = result.result
      let message = t('ep_export_cards_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      if (presetSheetTitle && presetMatchedRows > 0) {
        message += ` ${t('ep_export_cards_presets_success_suffix')
          .replace('{{presetSheet}}', presetSheetTitle)
          .replace('{{presetRows}}', String(presetMatchedRows))}`
      }
      if (unmappedSheetNames.length > 0) {
        message += ` ${t('ep_export_cards_unmapped_hint').replace('{{count}}', String(unmappedSheetNames.length))}`
        const sample = [...new Set(unmappedSheetNames)].slice(0, 5).join(', ')
        if (sample) {
          message += ` ${t('ep_export_cards_unmapped_sample').replace('{{names}}', sample)}`
        }
      }
      registerStagedExport('cards', stagedSheets, message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncCards,
    ensureGoogleToken,
    persistSpreadsheetRef,
    spreadsheetRef,
    cardStars,
    cardMasteryUnlockedIds,
    cardEquipSlots,
    cardPresetLoadouts,
    cardsWorkbook,
    formatExportError,
    showNotice,
    registerStagedExport,
    t,
  ])

  const handleExportWorkshop = useCallback(async () => {
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }
    if (!canSyncWorkshop) {
      showNotice(
        workshopWorkbook
          ? t('ep_export_error_workshop_workbook_access_denied').replace(
              '{{id}}',
              workshopWorkbook.spreadsheetId,
            )
          : t('ep_export_workshop_missing_in_master'),
        'error',
      )
      return
    }

    setExportingTarget('workshop')
    setNotice(null)
    try {
      const token = await ensureGoogleToken()
      if (!token) return

      persistSpreadsheetRef()

      const result = await exportWorkshopToEffectivePaths({
        googleAccessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        masterSheetGid: parsedMaster.sheetGid,
        workshopLevels,
      })

      if (!result.ok) {
        if (result.error === 'workshop_workbook_access_denied') {
          showNotice(
            t('ep_export_error_workshop_workbook_access_denied').replace(
              '{{id}}',
              workshopWorkbook?.spreadsheetId ?? '',
            ),
            'error',
          )
        } else {
          showNotice(formatExportError(result.error, result.message), 'error')
        }
        return
      }

      const { matchedRows, updatedCells, sheetTitle, unmappedSheetNames, stagedSheets } = result.result
      const enhanceMatchedRows = result.result.enhanceMatchedRows ?? 0
      let message = t('ep_export_workshop_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      if (enhanceMatchedRows > 0) {
        message += ` ${t('ep_export_workshop_enhance_success_suffix').replace(
          '{{enhanceRows}}',
          String(enhanceMatchedRows),
        )}`
      }
      if (unmappedSheetNames.length > 0) {
        message += ` ${t('ep_export_workshop_unmapped_hint').replace('{{count}}', String(unmappedSheetNames.length))}`
        const sample = [...new Set(unmappedSheetNames)].slice(0, 5).join(', ')
        if (sample) {
          message += ` ${t('ep_export_workshop_unmapped_sample').replace('{{names}}', sample)}`
        }
      }
      registerStagedExport('workshop', stagedSheets, message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncWorkshop,
    ensureGoogleToken,
    persistSpreadsheetRef,
    spreadsheetRef,
    workshopLevels,
    workshopWorkbook,
    formatExportError,
    showNotice,
    registerStagedExport,
    t,
  ])

  const handleExportBots = useCallback(async () => {
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }
    if (!canSyncBots) {
      showNotice(
        botsWorkbook
          ? t('ep_export_error_bots_workbook_access_denied').replace(
              '{{id}}',
              botsWorkbook.spreadsheetId,
            )
          : t('ep_export_bots_missing_in_master'),
        'error',
      )
      return
    }

    setExportingTarget('bots')
    setNotice(null)
    try {
      const token = await ensureGoogleToken()
      if (!token) return

      persistSpreadsheetRef()

      const result = await exportBotsToEffectivePaths({
        googleAccessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        masterSheetGid: parsedMaster.sheetGid,
        botsEpState,
      })

      if (!result.ok) {
        if (result.error === 'bots_workbook_access_denied') {
          showNotice(
            t('ep_export_error_bots_workbook_access_denied').replace(
              '{{id}}',
              botsWorkbook?.spreadsheetId ?? '',
            ),
            'error',
          )
        } else {
          showNotice(formatExportError(result.error, result.message), 'error')
        }
        return
      }

      const { matchedRows, updatedCells, sheetTitle, unmappedSheetNames, labMatchedRows, stagedSheets } =
        result.result
      let message = t('ep_export_bots_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      if (labMatchedRows > 0) {
        message += ` ${t('ep_export_bots_lab_success_suffix').replace(
          '{{labRows}}',
          String(labMatchedRows),
        )}`
      }
      if (unmappedSheetNames.length > 0) {
        message += ` ${t('ep_export_bots_unmapped_hint').replace('{{count}}', String(unmappedSheetNames.length))}`
        const sample = [...new Set(unmappedSheetNames)].slice(0, 5).join(', ')
        if (sample) {
          message += ` ${t('ep_export_bots_unmapped_sample').replace('{{names}}', sample)}`
        }
      }
      registerStagedExport('bots', stagedSheets, message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncBots,
    ensureGoogleToken,
    persistSpreadsheetRef,
    spreadsheetRef,
    botsEpState,
    botsWorkbook,
    formatExportError,
    showNotice,
    registerStagedExport,
    t,
  ])

  const handleExportLabs = useCallback(async () => {
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }
    if (!canSyncLabs) {
      showNotice(
        laboratoryWorkbook
          ? t('ep_export_error_laboratory_workbook_access_denied').replace(
              '{{id}}',
              laboratoryWorkbook.spreadsheetId,
            )
          : t('ep_export_labs_missing_in_master'),
        'error',
      )
      return
    }

    setExportingTarget('labs')
    setNotice(null)
    try {
      const token = await ensureGoogleToken()
      if (!token) return

      persistSpreadsheetRef()

      const result = await exportLabsToEffectivePaths({
        googleAccessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        masterSheetGid: parsedMaster.sheetGid,
        labLevelOverrides,
      })

      if (!result.ok) {
        if (result.error === 'laboratory_workbook_access_denied') {
          showNotice(
            t('ep_export_error_laboratory_workbook_access_denied').replace(
              '{{id}}',
              laboratoryWorkbook?.spreadsheetId ?? '',
            ),
            'error',
          )
        } else {
          showNotice(formatExportError(result.error, result.message), 'error')
        }
        return
      }

      const { matchedRows, updatedCells, sheetTitle, unmappedSheetNames, stagedSheets } = result.result
      let message = t('ep_export_labs_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      if (unmappedSheetNames.length > 0) {
        message += ` ${t('ep_export_labs_unmapped_hint').replace('{{count}}', String(unmappedSheetNames.length))}`
        const sample = [...new Set(unmappedSheetNames)].slice(0, 5).join(', ')
        if (sample) {
          message += ` ${t('ep_export_labs_unmapped_sample').replace('{{names}}', sample)}`
        }
      }
      registerStagedExport('labs', stagedSheets, message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncLabs,
    ensureGoogleToken,
    persistSpreadsheetRef,
    spreadsheetRef,
    labLevelOverrides,
    laboratoryWorkbook,
    formatExportError,
    showNotice,
    registerStagedExport,
    t,
  ])

  const handleExportUws = useCallback(async () => {
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }
    if (!canSyncUws) {
      showNotice(
        uwsWorkbook
          ? t('ep_export_error_uws_workbook_access_denied').replace(
              '{{id}}',
              uwsWorkbook.spreadsheetId,
            )
          : t('ep_export_uws_missing_in_master'),
        'error',
      )
      return
    }

    setExportingTarget('uws')
    setNotice(null)
    try {
      const token = await ensureGoogleToken()
      if (!token) return

      persistSpreadsheetRef()

      const result = await exportUwsToEffectivePaths({
        googleAccessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        masterSheetGid: parsedMaster.sheetGid,
        uwsEpState,
      })

      if (!result.ok) {
        if (result.error === 'uws_workbook_access_denied') {
          showNotice(
            t('ep_export_error_uws_workbook_access_denied').replace(
              '{{id}}',
              uwsWorkbook?.spreadsheetId ?? '',
            ),
            'error',
          )
        } else {
          showNotice(formatExportError(result.error, result.message), 'error')
        }
        return
      }

      const { matchedRows, updatedCells, sheetTitle, stagedSheets } = result.result
      const message = t('ep_export_uws_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      registerStagedExport('uws', stagedSheets, message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncUws,
    ensureGoogleToken,
    persistSpreadsheetRef,
    spreadsheetRef,
    uwsEpState,
    uwsWorkbook,
    formatExportError,
    showNotice,
    registerStagedExport,
    t,
  ])

  const handleExportGuardians = useCallback(async () => {
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }
    if (!canSyncGuardians) {
      showNotice(
        guardiansWorkbook
          ? t('ep_export_error_guardians_workbook_access_denied').replace(
              '{{id}}',
              guardiansWorkbook.spreadsheetId,
            )
          : t('ep_export_guardians_missing_in_master'),
        'error',
      )
      return
    }

    setExportingTarget('guardians')
    setNotice(null)
    try {
      const token = await ensureGoogleToken()
      if (!token) return

      persistSpreadsheetRef()

      const result = await exportGuardiansToEffectivePaths({
        googleAccessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        masterSheetGid: parsedMaster.sheetGid,
        guardiansEpState,
      })

      if (!result.ok) {
        if (result.error === 'guardians_workbook_access_denied') {
          showNotice(
            t('ep_export_error_guardians_workbook_access_denied').replace(
              '{{id}}',
              guardiansWorkbook?.spreadsheetId ?? '',
            ),
            'error',
          )
        } else {
          showNotice(formatExportError(result.error, result.message), 'error')
        }
        return
      }

      const { matchedRows, updatedCells, sheetTitle, stagedSheets } = result.result
      const message = t('ep_export_guardians_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      registerStagedExport('guardians', stagedSheets, message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncGuardians,
    ensureGoogleToken,
    persistSpreadsheetRef,
    spreadsheetRef,
    guardiansEpState,
    guardiansWorkbook,
    formatExportError,
    showNotice,
    registerStagedExport,
    t,
  ])

  const handleExportModules = useCallback(async () => {
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }
    const { workbook: modulesTarget, access: modulesTargetAccess } = modulesWorkbookResolved
    if (!modulesTarget || modulesTargetAccess === 'denied' || modulesTargetAccess === 'not_found') {
      showNotice(
        modulesTarget
          ? t('ep_export_error_modules_workbook_access_denied').replace(
              '{{id}}',
              modulesTarget.spreadsheetId,
            )
          : t('ep_export_modules_missing_in_master'),
        'error',
      )
      return
    }
    if (modulesEquippedCount === 0) {
      showNotice(t('ep_export_error_no_modules_rows'), 'error')
      return
    }

    setExportingTarget('modules')
    setNotice(null)
    try {
      const token = await ensureGoogleToken()
      if (!token) return

      persistSpreadsheetRef()

      const result = await exportModulesToEffectivePaths({
        googleAccessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        masterSheetGid: parsedMaster.sheetGid,
        modulesEpState,
      })

      if (!result.ok) {
        if (result.error === 'modules_workbook_access_denied') {
          showNotice(
            t('ep_export_error_modules_workbook_access_denied').replace(
              '{{id}}',
              modulesTarget?.spreadsheetId ?? '',
            ),
            'error',
          )
        } else {
          showNotice(formatExportError(result.error, result.message), 'error')
        }
        return
      }

      const { matchedRows, matchedSubstats, updatedCells, sheetTitle, stagedSheets } = result.result
      const message = t('ep_export_modules_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{effects}}', String(matchedSubstats))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      registerStagedExport('modules', stagedSheets, message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    ensureGoogleToken,
    persistSpreadsheetRef,
    spreadsheetRef,
    modulesEpState,
    modulesEquippedCount,
    modulesWorkbookResolved,
    formatExportError,
    showNotice,
    registerStagedExport,
    t,
  ])

  const handleImportTarget = useCallback(
    async (target: EffectivePathsImportTarget) => {
      const ui = IMPORT_TARGET_UI.find((entry) => entry.target === target)!
      const { workbook } = workbookByTarget[target]

      if (!parsedMaster) {
        showNotice(
          spreadsheetRef.trim()
            ? t('ep_export_invalid_spreadsheet')
            : t('ep_export_missing_ids_master'),
          'error',
        )
        return
      }
      if (!canImportTarget(target)) {
        showNotice(
          workbook
            ? t(ui.accessDeniedKey).replace('{{id}}', workbook.spreadsheetId)
            : t(ui.missingKey),
          'error',
        )
        return
      }

      setImportingTarget(target)
      setNotice(null)
      if (!bulkSyncRef.current.collect) {
        reportSyncProgress('import', target, 0, 1)
      }
      try {
        const token = await ensureGoogleToken()
        if (!token) return

        persistSpreadsheetRef()

        const apiOptions = {
          googleAccessToken: token,
          masterSpreadsheetId: parsedMaster.spreadsheetId,
          masterSheetGid: parsedMaster.sheetGid,
          spreadsheetId: workbook!.spreadsheetId,
        }

        const result =
          target === 'labs'
            ? await importLabsFromEffectivePaths(apiOptions)
            : target === 'workshop'
              ? await importWorkshopFromEffectivePaths(apiOptions)
              : target === 'relics'
                ? await importRelicsFromEffectivePaths(apiOptions)
                : target === 'themes'
                  ? await importThemesFromEffectivePaths(apiOptions)
                  : target === 'cards'
                    ? await importCardsFromEffectivePaths(apiOptions)
                    : target === 'bots'
                      ? await importBotsFromEffectivePaths(apiOptions)
                      : target === 'uws'
                        ? await importUwsFromEffectivePaths(apiOptions)
                        : target === 'guardians'
                          ? await importGuardiansFromEffectivePaths(apiOptions)
                          : await importModulesFromEffectivePaths(apiOptions)

        if (!result.ok) {
          if (workbook && result.error.endsWith('_workbook_access_denied')) {
            showNotice(t(ui.accessDeniedKey).replace('{{id}}', workbook.spreadsheetId), 'error')
          } else {
            showNotice(formatExportError(result.error, result.message), 'error')
          }
          return
        }

        finishImportSuccess(
          importPayloadFromResult(result.result),
          importSuccessMessage(t, result.result),
        )
      } finally {
        setImportingTarget(null)
        if (!bulkSyncRef.current.collect) {
          setSyncProgress(null)
        }
      }
    },
    [
      parsedMaster,
      workbookByTarget,
      canImportTarget,
      ensureGoogleToken,
      persistSpreadsheetRef,
      spreadsheetRef,
      formatExportError,
      showNotice,
      finishImportSuccess,
      reportSyncProgress,
      t,
    ],
  )

  const runExportTarget = useCallback(
    async (
      target: EffectivePathsExportTarget,
      step?: { completed: number; total: number },
    ) => {
      const total = step?.total ?? 1
      const completed = step?.completed ?? 0
      reportSyncProgress('export', target, completed, total)
      try {
        switch (target) {
          case 'relics':
            await handleExportRelics()
            break
          case 'themes':
            await handleExportThemes()
            break
          case 'cards':
            await handleExportCards()
            break
          case 'workshop':
            await handleExportWorkshop()
            break
          case 'bots':
            await handleExportBots()
            break
          case 'labs':
            await handleExportLabs()
            break
          case 'uws':
            await handleExportUws()
            break
          case 'guardians':
            await handleExportGuardians()
            break
          case 'modules':
            await handleExportModules()
            break
        }
      } finally {
        if (step) {
          reportSyncProgress('export', target, completed + 1, total)
        } else if (!bulkSyncRef.current.collect) {
          setSyncProgress(null)
        }
      }
    },
    [
      handleExportRelics,
      handleExportThemes,
      handleExportCards,
      handleExportWorkshop,
      handleExportBots,
      handleExportLabs,
      handleExportUws,
      handleExportGuardians,
      handleExportModules,
      reportSyncProgress,
    ],
  )

  const handleExportTarget = useCallback(
    (target: EffectivePathsExportTarget) => {
      void runExportTarget(target)
    },
    [runExportTarget],
  )

  const handlePromotePendingExport = useCallback(
    async (entry: EffectivePathsPendingExport) => {
      setPromotingExportId(entry.id)
      setNotice(null)
      try {
        const token = await ensureGoogleToken()
        if (!token) return
        const result = await promoteEffectivePathsStagedSheets({
          googleAccessToken: token,
          stagedSheets: enrichStagedSheets(
            entry.syncTarget as EffectivePathsExportTarget,
            entry.stagedSheets,
          ),
        })
        if (!result.ok) {
          showNotice(formatExportError(result.error, result.message), 'error')
          return
        }
        removePendingEffectivePathsExport(entry.id)
        setPendingExports(readPendingEffectivePathsExports())
        onSuccess(t('ep_export_staged_apply_success'))
      } finally {
        setPromotingExportId(null)
      }
    },
    [ensureGoogleToken, enrichStagedSheets, formatExportError, onSuccess, showNotice, t],
  )

  const handleDiscardPendingExport = useCallback(
    async (entry: EffectivePathsPendingExport) => {
      setDiscardingExportId(entry.id)
      setNotice(null)
      try {
        const token = await ensureGoogleToken()
        if (!token) return
        const result = await discardEffectivePathsStagedSheets({
          googleAccessToken: token,
          stagedSheets: enrichStagedSheets(
            entry.syncTarget as EffectivePathsExportTarget,
            entry.stagedSheets,
          ),
        })
        if (!result.ok) {
          showNotice(formatExportError(result.error, result.message), 'error')
          return
        }
        removePendingEffectivePathsExport(entry.id)
        setPendingExports(readPendingEffectivePathsExports())
        showNotice(t('ep_export_staged_discard_success'), 'info')
      } finally {
        setDiscardingExportId(null)
      }
    },
    [ensureGoogleToken, enrichStagedSheets, formatExportError, showNotice, t],
  )

  const handlePromoteAllPendingExports = useCallback(async () => {
    if (pendingExports.length === 0) return
    setPromotingExportId('__all__')
    setNotice(null)
    try {
      const token = await ensureGoogleToken()
      if (!token) return
      const stagedSheets = pendingExports.flatMap((entry) =>
        enrichStagedSheets(entry.syncTarget as EffectivePathsExportTarget, entry.stagedSheets),
      )
      const result = await promoteEffectivePathsStagedSheets({
        googleAccessToken: token,
        stagedSheets,
      })
      if (!result.ok) {
        showNotice(formatExportError(result.error, result.message), 'error')
        return
      }
      for (const entry of pendingExports) {
        removePendingEffectivePathsExport(entry.id)
      }
      setPendingExports(readPendingEffectivePathsExports())
      onSuccess(t('ep_export_staged_apply_success'))
    } finally {
      setPromotingExportId(null)
    }
  }, [ensureGoogleToken, enrichStagedSheets, formatExportError, onSuccess, pendingExports, showNotice, t])

  const handleDiscardAllPendingExports = useCallback(async () => {
    if (pendingExports.length === 0) return
    setDiscardingExportId('__all__')
    setNotice(null)
    try {
      const token = await ensureGoogleToken()
      if (!token) return
      const stagedSheets = pendingExports.flatMap((entry) =>
        enrichStagedSheets(entry.syncTarget as EffectivePathsExportTarget, entry.stagedSheets),
      )
      const result = await discardEffectivePathsStagedSheets({
        googleAccessToken: token,
        stagedSheets,
      })
      if (!result.ok) {
        showNotice(formatExportError(result.error, result.message), 'error')
        return
      }
      for (const entry of pendingExports) {
        removePendingEffectivePathsExport(entry.id)
      }
      setPendingExports(readPendingEffectivePathsExports())
      showNotice(t('ep_export_staged_discard_success'), 'info')
    } finally {
      setDiscardingExportId(null)
    }
  }, [ensureGoogleToken, enrichStagedSheets, formatExportError, pendingExports, showNotice, t])

  const handleImportAll = useCallback(async () => {
    if (importableTargetCount === 0) {
      showNotice(t('ep_import_all_none'), 'info')
      return
    }
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }

    const targets = EFFECTIVE_PATHS_IMPORT_TARGET_ORDER.filter((target) =>
      canImportTarget(target),
    )
    bulkSyncRef.current = { collect: true, messages: [], payloads: [], pendingEntries: [] }
    setImportingAll(true)
    setNotice(null)
    try {
      for (let index = 0; index < targets.length; index++) {
        const target = targets[index]!
        if (index > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
        reportSyncProgress('import', target, index, targets.length)
        await handleImportTarget(target)
        reportSyncProgress('import', target, index + 1, targets.length)
      }
      const collected = bulkSyncRef.current
      if (collected.collect && collected.payloads.length > 0) {
        onImportedAll(collected.payloads, importAllSuccessMessage(t, collected.payloads.length))
      }
    } finally {
      bulkSyncRef.current = { collect: false }
      setImportingAll(false)
      setSyncProgress(null)
    }
  }, [
    canImportTarget,
    handleImportTarget,
    importableTargetCount,
    onImportedAll,
    parsedMaster,
    reportSyncProgress,
    showNotice,
    spreadsheetRef,
    t,
  ])

  const handleExportAll = useCallback(async () => {
    if (exportableTargetCount === 0) {
      showNotice(t('ep_export_all_none'), 'info')
      return
    }
    if (!parsedMaster) {
      showNotice(
        spreadsheetRef.trim() ? t('ep_export_invalid_spreadsheet') : t('ep_export_missing_ids_master'),
        'error',
      )
      return
    }

    const targets = EFFECTIVE_PATHS_EXPORT_TARGET_ORDER.filter((target) =>
      canExportTarget(target),
    )
    bulkSyncRef.current = { collect: true, messages: [], payloads: [], pendingEntries: [] }
    setExportingAll(true)
    setNotice(null)
    try {
      for (let index = 0; index < targets.length; index++) {
        await runExportTarget(targets[index]!, { completed: index, total: targets.length })
      }
      const collected = bulkSyncRef.current
      if (collected.collect && collected.pendingEntries.length > 0) {
        showNotice(
          t('ep_export_all_staged_success').replace(
            '{{count}}',
            String(collected.pendingEntries.length),
          ),
          'info',
        )
      }
    } finally {
      bulkSyncRef.current = { collect: false }
      setExportingAll(false)
      setSyncProgress(null)
    }
  }, [
    canExportTarget,
    exportableTargetCount,
    parsedMaster,
    runExportTarget,
    showNotice,
    spreadsheetRef,
    t,
  ])

  const loadWorkbooksLabel = loadingSheets
    ? t('ep_export_loading_sheets')
    : t('ep_export_load_sheets_btn')

  if (!open) return null

  return labOverlayPortal(
    <div
      className={`select-research__lab-data-backdrop effective-paths-export-backdrop${pickerUiHidden ? ' effective-paths-export-backdrop--picker-behind' : ''}`}
      role="presentation"
      onClick={busy ? undefined : onClose}
    >
      <div
        className="select-research__lab-data-dialog lab-import-export-dialog effective-paths-export-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="select-research__lab-data-title">
          {t('ep_sync_title')}
        </h2>
        <p className="select-research__lab-data-intro">{t('ep_sync_intro')}</p>
        <ol className="effective-paths-export-dialog__steps">
          <li>{t('ep_sync_step1')}</li>
          <li>{t('ep_sync_step2')}</li>
          <li>{t('ep_sync_step3')}</li>
        </ol>
        {!parsedMaster ? (
          <>
            <p className="select-research__lab-data-share-hint" role="status">
              {t('ep_export_missing_ids_master')}
            </p>
            {!user ? (
              <p className="select-research__lab-data-share-hint" role="status">
                {t('ep_sync_ids_master_account_hint')}
              </p>
            ) : null}
          </>
        ) : null}
        {notice ? (
          <ImportNoticeBlock
            message={notice.message}
            variant={notice.variant}
            className={`select-research__lab-data-import-notice select-research__lab-data-import-notice--${notice.variant}`}
          />
        ) : null}
        <div className="select-research__lab-data-actions effective-paths-export-dialog__actions">
          <button
            type="button"
            className="glow-btn glow-btn--block"
            disabled={busy || !parsedMaster}
            onClick={() => void handleLoadSheets()}
          >
            {loadWorkbooksLabel}
          </button>
        </div>
        <EffectivePathsWorkbooksLoadingProgress
          label={
            loadProgress
              ? effectivePathsLoadProgressLabel(loadProgress, t)
              : t('ep_export_loading_sheets')
          }
          active={loadingSheets}
          percent={loadProgress ? effectivePathsLoadProgressPercent(loadProgress) : undefined}
          simulate={loadingSheets && loadProgress == null}
        />
        {workbookAccess && workbookAccess.length > 0 ? (
          <EffectivePathsLinkedWorkbooksList
            listId={listId}
            idsTabTitle={idsTabTitle}
            workbookAccess={workbookAccess}
            t={t}
            bulkActions={{
              busy,
              importingAll,
              exportingAll,
              canImportAll: importableTargetCount > 0,
              canExportAll: exportableTargetCount > 0,
              onImportAll: () => void handleImportAll(),
              onExportAll: () => void handleExportAll(),
            }}
            importActions={{
              importingTarget,
              busy,
              canImportTarget,
              onImportTarget: (target) => void handleImportTarget(target),
            }}
            exportActions={{
              exportingTarget,
              busy,
              canExportTarget,
              onExportTarget: handleExportTarget,
              pendingExportTargets,
            }}
          />
        ) : null}
        <EffectivePathsPendingExportsPanel
          pendingExports={pendingExports}
          busy={busy}
          promotingId={promotingExportId}
          discardingId={discardingExportId}
          t={t}
          categoryLabel={(entry) =>
            syncWorkbookNameForTarget(
              entry.syncTarget as EffectivePathsImportTarget,
              workbookByTarget[entry.syncTarget as EffectivePathsImportTarget]?.workbook?.name,
            )
          }
          onApply={(entry) => void handlePromotePendingExport(entry)}
          onDiscard={(entry) => void handleDiscardPendingExport(entry)}
          onApplyAll={() => void handlePromoteAllPendingExports()}
          onDiscardAll={() => void handleDiscardAllPendingExports()}
        />
        <EffectivePathsWorkbooksLoadingProgress
          label={
            syncProgress
              ? effectivePathsSyncProgressLabel(syncProgress, t)
              : t('ep_sync_syncing')
          }
          active={importing || exporting}
          percent={syncProgress ? effectivePathsSyncProgressPercent(syncProgress) : 5}
          simulate={!syncProgress}
        />
        <div className="select-research__lab-data-actions effective-paths-export-dialog__actions effective-paths-export-dialog__actions--footer">
          <button
            type="button"
            className="glow-btn glow-btn--block select-research__lab-data-close"
            disabled={busy}
            onClick={onClose}
          >
            {t('sr_close')}
          </button>
        </div>
      </div>
    </div>,
  )
}

/** @deprecated Use EffectivePathsSyncDialog */
export const EffectivePathsExportDialog = EffectivePathsSyncDialog

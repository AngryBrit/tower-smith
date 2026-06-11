import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ImportNoticeVariant } from '../importNotice'
import type { BotsEpSyncState } from '../effectivePaths/botsEpStateFromPersisted'
import { countModulesEpEquippedSlots } from '../effectivePaths/buildModuleSheetUpdates'
import type { ModulesEpSyncState } from '../effectivePaths/modulesEpStateFromPersisted'
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
  exportCardsToEffectivePaths,
  exportRelicsToEffectivePaths,
  exportThemesToEffectivePaths,
  exportWorkshopToEffectivePaths,
  importBotsFromEffectivePaths,
  importCardsFromEffectivePaths,
  importLabsFromEffectivePaths,
  importModulesFromEffectivePaths,
  importRelicsFromEffectivePaths,
  importThemesFromEffectivePaths,
  importUwsFromEffectivePaths,
  importWorkshopFromEffectivePaths,
  listEffectivePathsWorkbooks,
  type EffectivePathsExportError,
  type EffectivePathsLoadProgress,
  type LinkedWorkbookAccess,
} from '../effectivePaths/exportEffectivePathsApi'
import { readStoredSpreadsheetRef, writeStoredSpreadsheetRef } from '../effectivePaths/effectivePathsStorage'
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
import { useI18n, type StringId } from '../i18n'
import { EffectivePathsLinkedWorkbooksList } from './EffectivePathsLinkedWorkbooksList'
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
  modulesEpState,
  onSuccess,
  onImported,
  onImportedAll,
}: EffectivePathsSyncDialogProps) {
  const { t } = useI18n()
  const titleId = useId()
  const listId = useId()
  const [spreadsheetRef, setSpreadsheetRef] = useState(() => readStoredSpreadsheetRef())
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
  const [modulesWorkbook, setModulesWorkbook] = useState<EffectivePathsLinkedWorkbook | null>(null)
  const [modulesWorkbookAccess, setModulesWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [workbookAccess, setWorkbookAccess] = useState<LinkedWorkbookAccess[] | null>(null)
  const [loadingSheets, setLoadingSheets] = useState(false)
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
    | { collect: true; messages: string[]; payloads: EffectivePathsImportPayload[] }
    | { collect: false }
  >({ collect: false })
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
      canSyncModules,
    ],
  )
  const exporting = exportingTarget != null || exportingAll
  const importing = importingTarget != null || importingAll
  const busy = loadingSheets || exporting || importing
  const importableTargetCount = useMemo(
    () => EFFECTIVE_PATHS_IMPORT_TARGET_ORDER.filter((target) => canImportTarget(target)).length,
    [canImportTarget],
  )
  const exportableTargetCount = useMemo(
    () => EFFECTIVE_PATHS_EXPORT_TARGET_ORDER.filter((target) => canExportTarget(target)).length,
    [canExportTarget],
  )
  const hasGoogleSheetsAccess =
    googleToken != null || getCachedGoogleSheetsAccessToken() != null

  useEffect(() => {
    if (!open) return
    const frameId = window.requestAnimationFrame(() => {
      setSpreadsheetRef(readStoredSpreadsheetRef())
      setNotice(null)
      const cached = getCachedGoogleSheetsAccessToken()
      if (cached) setGoogleToken(cached)
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [open])

  const showNotice = useCallback((message: string, variant: ImportNoticeVariant) => {
    setNotice({ message, variant })
  }, [])

  const finishExportSuccess = useCallback(
    (message: string) => {
      if (bulkSyncRef.current.collect) {
        bulkSyncRef.current.messages.push(message)
        return
      }
      onSuccess(message)
      onClose()
    },
    [onClose, onSuccess],
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
        } else {
          showNotice(t('ep_export_error_unknown'), 'error')
        }
        return null
      }
    },
    [googleToken, showNotice, t],
  )

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
      setModulesWorkbook,
      setModulesWorkbookAccess,
      setWorkbookAccess,
    })
    setLoadProgress(null)
    setNotice(null)
    try {
      let token = await ensureGoogleToken()
      if (!token) {
        token = await ensureGoogleToken({ consent: true })
      }
      if (!token) return

      writeStoredSpreadsheetRef(spreadsheetRef)
      const result = await listEffectivePathsWorkbooks({
        googleAccessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        sheetGid: parsedMaster.sheetGid,
        onProgress: setLoadProgress,
        onGateway: (gateway) => {
          applyEffectivePathsGateway(gateway, {
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
            setModulesWorkbook,
            setModulesWorkbookAccess,
            setWorkbookAccess,
          })
        },
        onWorkbookAccess: (row) => {
          applyEffectivePathsWorkbookAccessRow(row, {
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
            setModulesWorkbook,
            setModulesWorkbookAccess,
            setWorkbookAccess,
          })
        },
      })

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
    } finally {
      setLoadingSheets(false)
      setLoadProgress(null)
    }
  }, [parsedMaster, ensureGoogleToken, spreadsheetRef, formatExportError, showNotice, t])

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

      writeStoredSpreadsheetRef(spreadsheetRef)

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

      const { matchedRows, updatedCells, sheetTitle, unmappedSheetNames } = result.result
      let message = t('ep_export_relics_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      if (unmappedSheetNames.length > 0) {
        message += ` ${t('ep_export_relics_unmapped_hint').replace('{{count}}', String(unmappedSheetNames.length))}`
      }
      finishExportSuccess(message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncRelics,
    ensureGoogleToken,
    spreadsheetRef,
    relicOwnedIds,
    relicsWorkbook,
    formatExportError,
    showNotice,
    finishExportSuccess,
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

      writeStoredSpreadsheetRef(spreadsheetRef)

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

      const { matchedRows, updatedCells, sheetTitle, unmappedSheetNames } = result.result
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
      finishExportSuccess(message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncThemes,
    ensureGoogleToken,
    spreadsheetRef,
    themeOwnedIds,
    themesWorkbook,
    formatExportError,
    showNotice,
    finishExportSuccess,
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

      writeStoredSpreadsheetRef(spreadsheetRef)

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
      finishExportSuccess(message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncCards,
    ensureGoogleToken,
    spreadsheetRef,
    cardStars,
    cardMasteryUnlockedIds,
    cardEquipSlots,
    cardPresetLoadouts,
    cardsWorkbook,
    formatExportError,
    showNotice,
    finishExportSuccess,
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

      writeStoredSpreadsheetRef(spreadsheetRef)

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

      const { matchedRows, updatedCells, sheetTitle, unmappedSheetNames } = result.result
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
      finishExportSuccess(message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncWorkshop,
    ensureGoogleToken,
    spreadsheetRef,
    workshopLevels,
    workshopWorkbook,
    formatExportError,
    showNotice,
    finishExportSuccess,
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

      writeStoredSpreadsheetRef(spreadsheetRef)

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

      const { matchedRows, updatedCells, sheetTitle, unmappedSheetNames, labMatchedRows } =
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
      finishExportSuccess(message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncBots,
    ensureGoogleToken,
    spreadsheetRef,
    botsEpState,
    botsWorkbook,
    formatExportError,
    showNotice,
    finishExportSuccess,
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

      writeStoredSpreadsheetRef(spreadsheetRef)

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

      const { matchedRows, updatedCells, sheetTitle, unmappedSheetNames } = result.result
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
      finishExportSuccess(message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncLabs,
    ensureGoogleToken,
    spreadsheetRef,
    labLevelOverrides,
    laboratoryWorkbook,
    formatExportError,
    showNotice,
    finishExportSuccess,
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

      writeStoredSpreadsheetRef(spreadsheetRef)

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

      const { matchedRows, updatedCells, sheetTitle } = result.result
      const message = t('ep_export_uws_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      finishExportSuccess(message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    canSyncUws,
    ensureGoogleToken,
    spreadsheetRef,
    uwsEpState,
    uwsWorkbook,
    formatExportError,
    showNotice,
    finishExportSuccess,
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

      writeStoredSpreadsheetRef(spreadsheetRef)

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

      const { matchedRows, matchedSubstats, updatedCells, sheetTitle } = result.result
      const message = t('ep_export_modules_success')
        .replace('{{rows}}', String(matchedRows))
        .replace('{{effects}}', String(matchedSubstats))
        .replace('{{cells}}', String(updatedCells))
        .replace('{{sheet}}', sheetTitle)
      finishExportSuccess(message)
    } finally {
      setExportingTarget(null)
    }
  }, [
    parsedMaster,
    ensureGoogleToken,
    spreadsheetRef,
    modulesEpState,
    modulesEquippedCount,
    modulesWorkbookResolved,
    formatExportError,
    showNotice,
    finishExportSuccess,
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

        writeStoredSpreadsheetRef(spreadsheetRef)

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
    bulkSyncRef.current = { collect: true, messages: [], payloads: [] }
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
    bulkSyncRef.current = { collect: true, messages: [], payloads: [] }
    setExportingAll(true)
    setNotice(null)
    try {
      for (let index = 0; index < targets.length; index++) {
        await runExportTarget(targets[index]!, { completed: index, total: targets.length })
      }
      const collected = bulkSyncRef.current
      if (collected.collect && collected.messages.length > 0) {
        onSuccess(
          t('ep_export_all_success').replace('{{count}}', String(collected.messages.length)),
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
    onSuccess,
    parsedMaster,
    runExportTarget,
    showNotice,
    spreadsheetRef,
    t,
  ])

  const loadWorkbooksLabel = loadingSheets
    ? hasGoogleSheetsAccess
      ? t('ep_export_loading_linked_workbooks')
      : t('ep_export_loading_sheets')
    : hasGoogleSheetsAccess
      ? t('ep_export_load_linked_workbooks_btn')
      : t('ep_export_load_sheets_btn')

  if (!open) return null

  return labOverlayPortal(
    <div
      className="select-research__lab-data-backdrop effective-paths-export-backdrop"
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
        {!parsedMaster ? (
          <p className="select-research__lab-data-share-hint" role="status">
            {t('ep_export_missing_ids_master')}
          </p>
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
              : hasGoogleSheetsAccess
                ? t('ep_export_loading_linked_workbooks')
                : t('ep_export_loading_sheets')
          }
          active={loadingSheets}
          percent={loadProgress ? effectivePathsLoadProgressPercent(loadProgress) : 5}
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
            }}
          />
        ) : null}
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

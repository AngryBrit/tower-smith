import { useCallback, useEffect, useId, useState } from 'react'
import type { ImportNoticeVariant } from '../importNotice'
import {
  exportRelicsToEffectivePaths,
  exportThemesToEffectivePaths,
  listEffectivePathsWorkbooks,
  type EffectivePathsExportError,
  type LinkedWorkbookAccess,
} from '../effectivePaths/exportEffectivePathsApi'
import {
  isRelicsWorkbookName,
  isThemesWorkbookName,
} from '../effectivePaths/effectivePathsCategoryNames'
import { sortLinkedWorkbookAccess } from '../effectivePaths/effectivePathsIdsWorkbooks'
import { readStoredSpreadsheetRef, writeStoredSpreadsheetRef } from '../effectivePaths/effectivePathsStorage'
import {
  googleSheetsOAuthConfigured,
  requestGoogleSheetsAccessToken,
} from '../effectivePaths/googleSheetsOAuth'
import type { EffectivePathsLinkedWorkbook } from '../effectivePaths/parseIdsMasterWorkbooks'
import { summarizeGoogleSheetsApiError } from '../effectivePaths/googleSheetsError'
import { googleSpreadsheetEditUrl, parseSpreadsheetRef } from '../effectivePaths/parseSpreadsheetRef'
import { useI18n, type StringId } from '../i18n'
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
  sheets_api_error: 'ep_export_error_sheets_api_error',
  unknown: 'ep_export_error_unknown',
}

export type EffectivePathsExportDialogProps = {
  open: boolean
  onClose: () => void
  relicOwnedIds: readonly string[]
  themeOwnedIds: readonly string[]
  /** Success notice only — shown on the parent panel after sync completes. */
  onSuccess: (message: string) => void
}

export function EffectivePathsExportDialog({
  open,
  onClose,
  relicOwnedIds,
  themeOwnedIds,
  onSuccess,
}: EffectivePathsExportDialogProps) {
  const { t } = useI18n()
  const titleId = useId()
  const listId = useId()
  const [spreadsheetRef, setSpreadsheetRef] = useState(() => readStoredSpreadsheetRef())
  const [googleToken, setGoogleToken] = useState<string | null>(null)
  const [workbooks, setWorkbooks] = useState<EffectivePathsLinkedWorkbook[] | null>(null)
  const [idsTabTitle, setIdsTabTitle] = useState<string | null>(null)
  const [relicsWorkbook, setRelicsWorkbook] = useState<EffectivePathsLinkedWorkbook | null>(null)
  const [relicsWorkbookAccess, setRelicsWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [themesWorkbook, setThemesWorkbook] = useState<EffectivePathsLinkedWorkbook | null>(null)
  const [themesWorkbookAccess, setThemesWorkbookAccess] = useState<
    'ok' | 'denied' | 'not_found' | null
  >(null)
  const [workbookAccess, setWorkbookAccess] = useState<LinkedWorkbookAccess[] | null>(null)
  const [loadingSheets, setLoadingSheets] = useState(false)
  const [exportingTarget, setExportingTarget] = useState<'relics' | 'themes' | null>(null)
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
  const exporting = exportingTarget != null
  const busy = loadingSheets || exporting

  useEffect(() => {
    if (!open) return
    setSpreadsheetRef(readStoredSpreadsheetRef())
    setNotice(null)
  }, [open])

  const showNotice = useCallback((message: string, variant: ImportNoticeVariant) => {
    setNotice({ message, variant })
  }, [])

  const formatExportError = useCallback(
    (error: EffectivePathsExportError, apiMessage?: string) => {
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
      if (googleToken && !options?.consent) return googleToken
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
    setWorkbooks(null)
    setIdsTabTitle(null)
    setRelicsWorkbook(null)
    setRelicsWorkbookAccess(null)
    setThemesWorkbook(null)
    setThemesWorkbookAccess(null)
    setWorkbookAccess(null)
    setNotice(null)
    try {
      const token = await ensureGoogleToken({ consent: true })
      if (!token) return

      writeStoredSpreadsheetRef(spreadsheetRef)
      const result = await listEffectivePathsWorkbooks({
        googleAccessToken: token,
        masterSpreadsheetId: parsedMaster.spreadsheetId,
        sheetGid: parsedMaster.sheetGid,
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
      } else if (!result.relicsWorkbook && !result.themesWorkbook) {
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
      onSuccess(message)
      onClose()
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
    onSuccess,
    onClose,
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
      onSuccess(message)
      onClose()
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
    onSuccess,
    onClose,
    t,
  ])

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
          {t('ep_export_title')}
        </h2>
        <p className="select-research__lab-data-intro">{t('ep_export_intro')}</p>
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
            {loadingSheets ? t('ep_export_loading_sheets') : t('ep_export_load_sheets_btn')}
          </button>
        </div>
        {relicsWorkbook ? (
          <p className="select-research__lab-data-share-hint effective-paths-export-dialog__relics-id">
            {t('ep_export_relics_resolved')
              .replace('{{tab}}', idsTabTitle ?? 'IDS')
              .replace('{{id}}', relicsWorkbook.spreadsheetId)}
            {relicsWorkbookAccess === 'denied' || relicsWorkbookAccess === 'not_found' ? (
              <>
                {' '}
                <a
                  href={googleSpreadsheetEditUrl(relicsWorkbook.spreadsheetId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('ep_export_relics_open_sheet')}
                </a>
              </>
            ) : null}
          </p>
        ) : null}
        {themesWorkbook ? (
          <p className="select-research__lab-data-share-hint effective-paths-export-dialog__relics-id">
            {t('ep_export_themes_resolved')
              .replace('{{tab}}', idsTabTitle ?? 'IDS')
              .replace('{{id}}', themesWorkbook.spreadsheetId)}
            {themesWorkbookAccess === 'denied' || themesWorkbookAccess === 'not_found' ? (
              <>
                {' '}
                <a
                  href={googleSpreadsheetEditUrl(themesWorkbook.spreadsheetId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('ep_export_themes_open_sheet')}
                </a>
              </>
            ) : null}
          </p>
        ) : null}
        {workbookAccess && workbookAccess.length > 0 ? (
          <div className="effective-paths-export-dialog__workbooks">
            <p id={listId} className="select-research__lab-data-section-label">
              {t('ep_export_linked_sheets_title').replace('{{tab}}', idsTabTitle ?? 'IDS')}
            </p>
            <ul className="effective-paths-export-dialog__workbook-list" aria-labelledby={listId}>
              {sortLinkedWorkbookAccess(workbookAccess).map((workbook) => {
                const accessible = workbook.access === 'ok'
                const accessLabel =
                  workbook.access === 'ok'
                    ? t('ep_export_workbook_access_ok')
                    : workbook.access === 'denied'
                      ? t('ep_export_workbook_access_denied')
                      : workbook.access === 'not_found'
                        ? t('ep_export_workbook_access_not_found')
                        : t('ep_export_workbook_access_denied')
                const isRelics = isRelicsWorkbookName(workbook.name)
                const isThemes = isThemesWorkbookName(workbook.name)
                return (
                  <li
                    key={`${workbook.name}:${workbook.spreadsheetId}`}
                    className={
                      isRelics || isThemes
                        ? 'effective-paths-export-dialog__workbook-item effective-paths-export-dialog__workbook-item--relics'
                        : 'effective-paths-export-dialog__workbook-item'
                    }
                  >
                    <span
                      className={
                        accessible
                          ? 'effective-paths-export-dialog__workbook-status effective-paths-export-dialog__workbook-status--ok'
                          : 'effective-paths-export-dialog__workbook-status effective-paths-export-dialog__workbook-status--bad'
                      }
                      aria-label={accessLabel}
                      title={accessLabel}
                    >
                      {accessible ? '✓' : '✗'}
                    </span>
                    <span className="effective-paths-export-dialog__workbook-name">{workbook.name}</span>
                    {isRelics ? (
                      <span className="effective-paths-export-dialog__workbook-tag">
                        {t('ep_export_relics_sync_target')}
                      </span>
                    ) : null}
                    {isThemes ? (
                      <span className="effective-paths-export-dialog__workbook-tag">
                        {t('ep_export_themes_sync_target')}
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
        <div className="select-research__lab-data-actions effective-paths-export-dialog__actions effective-paths-export-dialog__actions--footer">
          <button
            type="button"
            className="glow-btn glow-btn--block"
            disabled={busy || !canSyncRelics}
            onClick={() => void handleExportRelics()}
          >
            {exportingTarget === 'relics' ? t('ep_export_syncing_relics') : t('ep_export_sync_relics_btn')}
          </button>
          <button
            type="button"
            className="glow-btn glow-btn--block"
            disabled={busy || !canSyncThemes}
            onClick={() => void handleExportThemes()}
          >
            {exportingTarget === 'themes' ? t('ep_export_syncing_themes') : t('ep_export_sync_themes_btn')}
          </button>
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

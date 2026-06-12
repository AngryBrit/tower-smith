import {
  importTargetForWorkbookName,
  importUiForTarget,
  type EffectivePathsImportTarget,
} from '../effectivePaths/effectivePathsImportDialogSupport'
import {
  exportTargetForWorkbookName,
  exportUiForTarget,
} from '../effectivePaths/effectivePathsExportDialogSupport'
import type { EffectivePathsExportTarget } from '../effectivePaths/effectivePathsExportSyncingLabel'
import { sortLinkedWorkbookAccess } from '../effectivePaths/effectivePathsIdsWorkbooks'
import { googleSpreadsheetEditUrl } from '../effectivePaths/parseSpreadsheetRef'
import type { LinkedWorkbookAccess } from '../effectivePaths/exportEffectivePathsApi'
import type { StringId } from '../i18n'

export type EffectivePathsLinkedWorkbooksListProps = {
  listId: string
  idsTabTitle: string | null
  workbookAccess: readonly LinkedWorkbookAccess[]
  t: (id: StringId) => string
  importActions?: {
    importingTarget: EffectivePathsImportTarget | null
    busy: boolean
    canImportTarget: (target: EffectivePathsImportTarget) => boolean
    onImportTarget: (target: EffectivePathsImportTarget) => void
  }
  exportActions?: {
    exportingTarget: EffectivePathsExportTarget | null
    busy: boolean
    canExportTarget: (target: EffectivePathsExportTarget) => boolean
    onExportTarget: (target: EffectivePathsExportTarget) => void
    pendingExportTargets?: ReadonlySet<EffectivePathsExportTarget>
  }
  bulkActions?: {
    busy: boolean
    importingAll: boolean
    exportingAll: boolean
    canImportAll: boolean
    canExportAll: boolean
    onImportAll: () => void
    onExportAll: () => void
  }
}

export function EffectivePathsLinkedWorkbooksList({
  listId,
  idsTabTitle,
  workbookAccess,
  t,
  importActions,
  exportActions,
  bulkActions,
}: EffectivePathsLinkedWorkbooksListProps) {
  if (workbookAccess.length === 0) return null

  return (
    <div className="effective-paths-export-dialog__workbooks">
      <div className="effective-paths-export-dialog__workbooks-header">
        <p id={listId} className="select-research__lab-data-section-label">
          {t('ep_export_linked_sheets_title').replace('{{tab}}', idsTabTitle ?? 'IDS')}
        </p>
        {bulkActions && (importActions || exportActions) ? (
          <div className="effective-paths-export-dialog__bulk-actions">
            {importActions ? (
              <button
                type="button"
                className="glow-btn glow-btn--block effective-paths-export-dialog__bulk-action"
                disabled={bulkActions.busy || !bulkActions.canImportAll}
                onClick={bulkActions.onImportAll}
              >
                {bulkActions.importingAll ? t('ep_import_all_syncing') : t('ep_import_all_btn')}
              </button>
            ) : null}
            {exportActions ? (
              <button
                type="button"
                className="glow-btn glow-btn--block effective-paths-export-dialog__bulk-action"
                disabled={bulkActions.busy || !bulkActions.canExportAll}
                onClick={bulkActions.onExportAll}
              >
                {bulkActions.exportingAll ? t('ep_export_all_syncing') : t('ep_export_all_btn')}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
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
          const importTarget = importActions ? importTargetForWorkbookName(workbook.name) : null
          const exportTarget = exportActions ? exportTargetForWorkbookName(workbook.name) : null
          const syncTarget = importTarget ?? exportTarget
          const importUi = importTarget ? importUiForTarget(importTarget) : null
          const exportUi = exportTarget ? exportUiForTarget(exportTarget) : null
          const importingThis =
            importTarget != null && importActions?.importingTarget === importTarget
          const exportingThis =
            exportTarget != null && exportActions?.exportingTarget === exportTarget

          return (
            <li
              key={`${workbook.name}:${workbook.spreadsheetId}`}
              className={
                syncTarget
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
              <span className="effective-paths-export-dialog__workbook-name">
                <a
                  className="effective-paths-export-dialog__workbook-link"
                  href={googleSpreadsheetEditUrl(workbook.spreadsheetId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {workbook.name}
                </a>
                {exportTarget &&
                exportActions?.pendingExportTargets?.has(exportTarget) ? (
                  <span
                    className="effective-paths-export-dialog__workbook-staged-badge"
                    title={t('ep_export_staged_row_badge')}
                  >
                    {t('ep_export_staged_row_badge')}
                  </span>
                ) : null}
              </span>
              {syncTarget && (importActions || exportActions) ? (
                <span className="effective-paths-export-dialog__workbook-actions">
                  {importActions && importTarget && importUi ? (
                    <button
                      type="button"
                      className="glow-btn effective-paths-export-dialog__workbook-action"
                      disabled={importActions.busy || !importActions.canImportTarget(importTarget)}
                      aria-label={t(importUi.btnKey)}
                      title={t(importUi.btnKey)}
                      onClick={() => importActions.onImportTarget(importTarget)}
                    >
                      {importingThis ? t('ep_import_row_syncing') : t('ep_import_row_btn')}
                    </button>
                  ) : null}
                  {exportActions && exportTarget && exportUi ? (
                    <button
                      type="button"
                      className="glow-btn effective-paths-export-dialog__workbook-action"
                      disabled={
                        exportActions.busy || !exportActions.canExportTarget(exportTarget)
                      }
                      aria-label={t(exportUi.btnKey)}
                      title={t(exportUi.btnKey)}
                      onClick={() => exportActions.onExportTarget(exportTarget)}
                    >
                      {exportingThis ? t('ep_export_row_syncing') : t('ep_export_row_btn')}
                    </button>
                  ) : null}
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

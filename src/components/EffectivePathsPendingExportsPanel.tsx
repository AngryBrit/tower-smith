import type { EffectivePathsPendingExport } from '../effectivePaths/effectivePathsPendingExportStorage'
import { googleSpreadsheetTabUrl } from '../effectivePaths/effectivePathsStaging'
import type { StringId } from '../i18n'

export type EffectivePathsPendingExportsPanelProps = {
  pendingExports: readonly EffectivePathsPendingExport[]
  busy: boolean
  promotingId: string | null
  discardingId: string | null
  t: (id: StringId) => string
  categoryLabel: (entry: EffectivePathsPendingExport) => string
  onApply: (entry: EffectivePathsPendingExport) => void
  onDiscard: (entry: EffectivePathsPendingExport) => void
  onApplyAll: () => void
  onDiscardAll: () => void
}

export function EffectivePathsPendingExportsPanel({
  pendingExports,
  busy,
  promotingId,
  discardingId,
  t,
  categoryLabel,
  onApply,
  onDiscard,
  onApplyAll,
  onDiscardAll,
}: EffectivePathsPendingExportsPanelProps) {
  if (pendingExports.length === 0) return null

  const rowBusy = promotingId != null || discardingId != null

  return (
    <section className="effective-paths-pending-exports" aria-label={t('ep_export_staged_section_title')}>
      <h3 className="effective-paths-pending-exports__title">{t('ep_export_staged_section_title')}</h3>
      <p className="effective-paths-pending-exports__hint">{t('ep_export_staged_verify_hint')}</p>
      <ul className="effective-paths-pending-exports__list">
        {pendingExports.map((entry) => (
          <li key={entry.id} className="effective-paths-pending-exports__item">
            <h4 className="effective-paths-pending-exports__item-title">{categoryLabel(entry)}</h4>
            <p className="effective-paths-pending-exports__summary">{entry.summary}</p>
            <ul className="effective-paths-pending-exports__tabs">
              {entry.stagedSheets.map((sheet) => (
                <li key={`${sheet.workbookId}-${sheet.stagingSheetId}`}>
                  <a
                    className="effective-paths-pending-exports__tab-link"
                    href={googleSpreadsheetTabUrl(sheet.workbookId, sheet.stagingSheetId)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('ep_export_staged_open_preview').replace('{{sheet}}', sheet.stagingTitle)}
                  </a>
                </li>
              ))}
            </ul>
            <div className="effective-paths-pending-exports__actions">
              <button
                type="button"
                className="glow-btn effective-paths-export-dialog__workbook-action"
                disabled={busy || rowBusy}
                onClick={() => onApply(entry)}
              >
                {promotingId === entry.id
                  ? t('ep_export_staged_promoting')
                  : t('ep_export_staged_apply_btn')}
              </button>
              <button
                type="button"
                className="glow-btn effective-paths-export-dialog__workbook-action"
                disabled={busy || rowBusy}
                onClick={() => onDiscard(entry)}
              >
                {discardingId === entry.id
                  ? t('ep_export_staged_discarding')
                  : t('ep_export_staged_discard_btn')}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {pendingExports.length > 1 ? (
        <div className="effective-paths-pending-exports__bulk-actions">
          <button
            type="button"
            className="glow-btn glow-btn--block effective-paths-export-dialog__bulk-action"
            disabled={busy || rowBusy}
            onClick={onApplyAll}
          >
            {promotingId === '__all__'
              ? t('ep_export_staged_promoting')
              : t('ep_export_staged_apply_all_btn')}
          </button>
          <button
            type="button"
            className="glow-btn glow-btn--block effective-paths-export-dialog__bulk-action"
            disabled={busy || rowBusy}
            onClick={onDiscardAll}
          >
            {discardingId === '__all__'
              ? t('ep_export_staged_discarding')
              : t('ep_export_staged_discard_all_btn')}
          </button>
        </div>
      ) : null}
    </section>
  )
}

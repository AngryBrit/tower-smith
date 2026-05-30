import { useRef, type ChangeEvent } from 'react'
import { TOWER_ANDROID_SAVE_FOLDER } from '../../playerSave/playerInfoSavePath'
import { useI18n } from '../../i18n'
import { labOverlayPortal } from './labOverlayPortal'

export type LabImportExportPanelProps = {
  open: boolean
  onClose: () => void
  sharePublishing: boolean
  androidPlayerSaveImport: boolean
  iosPlayerSaveImport: boolean
  onImportCsvFile: (e: ChangeEvent<HTMLInputElement>) => void
  onImportPlayerSaveFile: (e: ChangeEvent<HTMLInputElement>) => void
  onExportCsv: () => void
  onImportPlayerSaveClick: () => void
  onCopyShareLink: () => void | Promise<void>
  onShowShareQr: () => void
}

export function LabImportExportPanel({
  open,
  onClose,
  sharePublishing,
  androidPlayerSaveImport,
  iosPlayerSaveImport,
  onImportCsvFile,
  onImportPlayerSaveFile,
  onExportCsv,
  onImportPlayerSaveClick,
  onCopyShareLink,
  onShowShareQr,
}: LabImportExportPanelProps) {
  const { t } = useI18n()
  const importLabCsvFileInputRef = useRef<HTMLInputElement>(null)
  const importPlayerInfoFileInputRef = useRef<HTMLInputElement>(null)

  return labOverlayPortal(
    <>
      <input
        ref={importLabCsvFileInputRef}
        className="visually-hidden"
        type="file"
        accept=".csv,text/csv"
        aria-hidden
        tabIndex={-1}
        onChange={onImportCsvFile}
      />
      <input
        ref={importPlayerInfoFileInputRef}
        className="visually-hidden"
        type="file"
        accept=".dat,application/octet-stream"
        aria-hidden
        tabIndex={-1}
        onChange={onImportPlayerSaveFile}
      />
      {!open ? null : (
      <div
        className="select-research__lab-data-backdrop"
        role="presentation"
        onClick={onClose}
      >
        <div
          id="lab-data-panel"
          className="select-research__lab-data-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lab-data-panel-title"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="lab-data-panel-title" className="select-research__lab-data-title">
            {t('sr_lab_data_title')}
          </h2>
          <p className="select-research__lab-data-intro">{t('sr_lab_data_intro')}</p>
          <p className="select-research__lab-data-section-label">{t('sr_lab_data_files')}</p>
          <div className="select-research__lab-data-actions">
            <button
              type="button"
              className="glow-btn glow-btn--block"
              onClick={() => importLabCsvFileInputRef.current?.click()}
            >
              {t('sr_lab_import_file')}
            </button>
            <button
              type="button"
              className="glow-btn glow-btn--block"
              onClick={() => {
                onExportCsv()
                onClose()
              }}
            >
              {t('sr_lab_export_file')}
            </button>
          </div>
          <p className="select-research__lab-data-section-label">{t('sr_lab_data_save_game')}</p>
          {androidPlayerSaveImport ? (
            <p className="select-research__lab-data-share-hint select-research__lab-data-path">
              {t('sr_lab_import_player_save_android_hint').replace(
                '{{path}}',
                TOWER_ANDROID_SAVE_FOLDER,
              )}
            </p>
          ) : iosPlayerSaveImport ? (
            <p className="select-research__lab-data-share-hint">
              {t('sr_lab_import_player_save_ios_hint')}
            </p>
          ) : null}
          <div className="select-research__lab-data-actions">
            <button
              type="button"
              className="glow-btn glow-btn--block"
              onClick={() => {
                importPlayerInfoFileInputRef.current?.click()
                if (androidPlayerSaveImport) onImportPlayerSaveClick()
              }}
            >
              {t('sr_lab_import_player_save')}
            </button>
          </div>
          <p className="select-research__lab-data-section-label">{t('sr_lab_data_share')}</p>
          <p className="select-research__lab-data-share-hint">{t('sr_lab_data_share_hint')}</p>
          <div className="select-research__lab-data-actions">
            <button
              type="button"
              className="glow-btn glow-btn--block"
              disabled={sharePublishing}
              onClick={async () => {
                await onCopyShareLink()
                onClose()
              }}
            >
              {sharePublishing ? t('sr_share_publishing') : t('sr_copy_short_link')}
            </button>
            <button
              type="button"
              className="glow-btn glow-btn--block"
              disabled={sharePublishing}
              onClick={() => {
                onClose()
                onShowShareQr()
              }}
            >
              {t('sr_qr_share')}
            </button>
          </div>
          <button
            type="button"
            className="glow-btn glow-btn--block select-research__lab-data-close"
            onClick={onClose}
          >
            {t('sr_close')}
          </button>
        </div>
      </div>
      )}
    </>,
  )
}

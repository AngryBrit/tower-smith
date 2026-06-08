import { useRef, type ChangeEvent } from 'react'
import type { BugBusterInitial } from '../../bugBuster/bugBusterTypes'
import type { ImportNoticeVariant } from '../../importNotice'
import { TOWER_ANDROID_SAVE_FOLDER } from '../../playerSave/playerInfoSavePath'
import { ImportNoticeBlock } from '../ImportNoticeBlock'
import { useI18n } from '../../i18n'
import { labOverlayPortal } from './labOverlayPortal'

export type PlayerSaveImportStage = 'reading' | 'decoding' | 'applying' | 'syncing'

const PLAYER_SAVE_IMPORT_PROGRESS: Record<PlayerSaveImportStage, number> = {
  reading: 20,
  decoding: 45,
  applying: 75,
  syncing: 92,
}

const PLAYER_SAVE_IMPORT_STAGE_KEYS = {
  reading: 'sr_lab_import_player_save_stage_reading',
  decoding: 'sr_lab_import_player_save_stage_decoding',
  applying: 'sr_lab_import_player_save_stage_applying',
  syncing: 'sr_lab_import_player_save_stage_syncing',
} as const

export type LabImportExportPanelProps = {
  open: boolean
  onClose: () => void
  /** Shown inside the dialog (import/export feedback). */
  importNotice: string | null
  importNoticeVariant?: ImportNoticeVariant
  importNoticeBugInitial?: BugBusterInitial | null
  sharePublishing: boolean
  playerSaveImporting: boolean
  playerSaveImportStage: PlayerSaveImportStage | null
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
  importNotice,
  importNoticeVariant = 'info',
  importNoticeBugInitial = null,
  sharePublishing,
  playerSaveImporting,
  playerSaveImportStage,
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
  const importProgressLabel =
    playerSaveImportStage != null
      ? t(PLAYER_SAVE_IMPORT_STAGE_KEYS[playerSaveImportStage])
      : t('sr_lab_import_player_save_stage_reading')
  const importProgressPercent =
    playerSaveImportStage != null
      ? PLAYER_SAVE_IMPORT_PROGRESS[playerSaveImportStage]
      : 10

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
        onClick={playerSaveImporting ? undefined : onClose}
      >
        <div
          id="lab-data-panel"
          className="select-research__lab-data-dialog lab-import-export-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lab-data-panel-title"
          aria-busy={playerSaveImporting}
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
              disabled={playerSaveImporting}
              onClick={() => {
                importPlayerInfoFileInputRef.current?.click()
                if (androidPlayerSaveImport) onImportPlayerSaveClick()
              }}
            >
              {t('sr_lab_import_player_save')}
            </button>
          </div>
          {playerSaveImporting ? (
            <div
              className="select-research__lab-data-import-progress"
              role="status"
              aria-live="polite"
            >
              <p className="select-research__lab-data-import-progress-label">
                {importProgressLabel}
              </p>
              <div
                className="select-research__lab-data-import-progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={importProgressPercent}
                aria-label={importProgressLabel}
              >
                <div
                  className="select-research__lab-data-import-progress-fill"
                  style={{ width: `${importProgressPercent}%` }}
                />
              </div>
            </div>
          ) : null}
          {importNotice ? (
            <ImportNoticeBlock
              message={importNotice}
              variant={importNoticeVariant}
              className={`select-research__lab-data-import-notice select-research__lab-data-import-notice--${importNoticeVariant}`}
              bugInitial={importNoticeBugInitial}
            />
          ) : null}
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
            disabled={playerSaveImporting}
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

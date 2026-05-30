import { useI18n } from '../../i18n'
import { labOverlayPortal } from './labOverlayPortal'

export type LabResetLevelsConfirmDialogProps = {
  onClose: () => void
  onConfirm: () => void
}

export function LabResetLevelsConfirmDialog({
  onClose,
  onConfirm,
}: LabResetLevelsConfirmDialogProps) {
  const { t } = useI18n()

  return labOverlayPortal(
    <div
      className="select-research__reset-confirm-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="select-research__reset-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-levels-confirm-title"
        aria-describedby="reset-levels-confirm-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="reset-levels-confirm-title" className="select-research__reset-confirm-title">
          {t('sr_reset_confirm_title')}
        </h2>
        <p id="reset-levels-confirm-desc" className="select-research__reset-confirm-desc">
          {t('sr_reset_confirm_body')}
        </p>
        <div className="select-research__reset-confirm-actions">
          <button type="button" className="glow-btn glow-btn--block" onClick={onClose}>
            {t('sr_cancel')}
          </button>
          <button
            type="button"
            className="glow-btn glow-btn--danger glow-btn--block"
            onClick={onConfirm}
          >
            {t('sr_reset_all')}
          </button>
        </div>
      </div>
    </div>,
  )
}

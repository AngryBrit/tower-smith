import { useI18n } from '../../i18n'
import { labOverlayPortal } from './labOverlayPortal'

export type LabShareQrDialogProps = {
  dataUrl: string
  onClose: () => void
  onCopyLink: () => void | Promise<void>
}

export function LabShareQrDialog({ dataUrl, onClose, onCopyLink }: LabShareQrDialogProps) {
  const { t } = useI18n()

  return labOverlayPortal(
    <div
      className="select-research__qr-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="select-research__qr-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-qr-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="share-qr-title" className="select-research__qr-title">
          {t('sr_qr_dialog_title')}
        </h2>
        <img
          className="select-research__qr-img"
          src={dataUrl}
          width={220}
          height={220}
          alt={t('sr_qr_image_alt')}
          decoding="async"
        />
        <p className="select-research__qr-hint">{t('sr_qr_hint')}</p>
        <div className="select-research__qr-actions">
          <button
            type="button"
            className="glow-btn glow-btn--block"
            onClick={() => void onCopyLink()}
          >
            {t('sr_qr_copy_link')}
          </button>
          <button type="button" className="glow-btn glow-btn--block" onClick={onClose}>
            {t('sr_close')}
          </button>
        </div>
      </div>
    </div>,
  )
}

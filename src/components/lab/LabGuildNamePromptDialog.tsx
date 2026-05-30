import { useI18n } from '../../i18n'
import { labOverlayPortal } from './labOverlayPortal'

export type LabGuildNamePromptDialogProps = {
  guildId: string
  name: string
  onNameChange: (name: string) => void
  onCancel: () => void
  onSave: () => void
}

export function LabGuildNamePromptDialog({
  guildId,
  name,
  onNameChange,
  onCancel,
  onSave,
}: LabGuildNamePromptDialogProps) {
  const { t } = useI18n()
  const trimmed = name.trim()

  return labOverlayPortal(
    <div
      className="select-research__reset-confirm-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="select-research__reset-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guild-name-prompt-title"
        aria-describedby="guild-name-prompt-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="guild-name-prompt-title" className="select-research__reset-confirm-title">
          Unknown guild ID
        </h2>
        <p id="guild-name-prompt-desc" className="select-research__reset-confirm-desc">
          Congratulations! You are the first to map guild ID "{guildId}". Enter a readable name to
          save for everyone.
        </p>
        <input
          type="text"
          className="glow-input profile-settings__input select-research__guild-name-input"
          value={name}
          maxLength={40}
          autoFocus
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            if (trimmed.length >= 1) onSave()
          }}
        />
        <div className="select-research__reset-confirm-actions">
          <button type="button" className="glow-btn glow-btn--block" onClick={onCancel}>
            {t('sr_cancel')}
          </button>
          <button
            type="button"
            className="glow-btn glow-btn--block"
            onClick={onSave}
            disabled={trimmed.length < 1}
          >
            Save guild name
          </button>
        </div>
      </div>
    </div>,
  )
}

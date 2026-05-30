import { useI18n } from '../../i18n'

export function LabToolbarQuick({
  hideCompleted,
  setHideCompleted,
  onMaxAll,
  onResetLevels,
}: {
  hideCompleted: boolean
  setHideCompleted: (v: boolean) => void
  onMaxAll: () => void
  onResetLevels: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="select-research__toolbar-quick">
      <label className="glow-btn glow-btn--toggle">
        <input
          type="checkbox"
          checked={hideCompleted}
          onChange={(e) => setHideCompleted(e.target.checked)}
        />
        {t('sr_hide_completed')}
      </label>
      <button
        type="button"
        className="glow-btn glow-btn--block"
        onClick={onMaxAll}
        aria-label={t('sr_max_all_aria')}
      >
        {t('sr_max_all')}
      </button>
      <button
        type="button"
        className="glow-btn glow-btn--danger glow-btn--block"
        onClick={onResetLevels}
      >
        {t('sr_reset_lab_levels')}
      </button>
    </div>
  )
}

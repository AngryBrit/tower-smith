import { useI18n } from '../../i18n'

type WorkshopCategory = 'attack' | 'defense' | 'utility' | 'ultimate'

export function WorkshopDemoToolbar({
  hideMaxed,
  setHideMaxed,
  onMaxAll,
  onResetDemo,
  workshopCategory,
}: {
  hideMaxed: boolean
  setHideMaxed: (v: boolean) => void
  onMaxAll: () => void
  onResetDemo: () => void
  workshopCategory: WorkshopCategory
}) {
  const { t } = useI18n()
  const resetLabelKey =
    workshopCategory === 'ultimate' ? 'ws_reset_ultimate_demo' : 'ws_reset_demo'
  return (
    <div className="select-research__toolbar-quick">
      <label className="glow-btn glow-btn--toggle">
        <input
          type="checkbox"
          checked={hideMaxed}
          onChange={(e) => setHideMaxed(e.target.checked)}
        />
        {t('sr_hide_completed')}
      </label>
      <button
        type="button"
        className="glow-btn glow-btn--block"
        onClick={onMaxAll}
        aria-label={t('ws_max_all_aria')}
      >
        {t('sr_max_all')}
      </button>
      <button
        type="button"
        className="glow-btn glow-btn--danger glow-btn--block"
        onClick={onResetDemo}
      >
        {t(resetLabelKey)}
      </button>
    </div>
  )
}

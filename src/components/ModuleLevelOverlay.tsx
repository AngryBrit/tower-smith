import { useI18n } from '../i18n'

export function ModuleLevelOverlay({ value }: { value: number }) {
  const { t } = useI18n()
  return (
    <span className="modules-module-level" aria-hidden>
      <span className="modules-module-level__prefix">{t('ws_modules_level_prefix')}</span>
      <span className="modules-module-level__value">{value}</span>
    </span>
  )
}

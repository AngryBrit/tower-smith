import { createPortal } from 'react-dom'
import { useBugBuster } from '../bugBuster/useBugBuster'
import { useI18n } from '../i18n'
import { BugBusterFabIcon } from './BugBusterFabIcon'

/** Floating Bug Buster entry (desktop / tablet). */
export function BugBusterFab() {
  const { t } = useI18n()
  const { open, openBugBuster } = useBugBuster()

  if (open) return null

  return createPortal(
    <button
      type="button"
      className="bug-buster-fab"
      aria-label={t('bug_buster_fab_aria')}
      title={t('bug_buster_fab_aria')}
      onClick={() => openBugBuster()}
    >
      <BugBusterFabIcon />
    </button>,
    document.body,
  )
}

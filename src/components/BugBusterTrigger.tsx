import type { BugBusterInitial } from '../bugBuster/bugBusterTypes'
import { useBugBuster } from '../bugBuster/useBugBuster'
import { useI18n, type StringId } from '../i18n'

type BugBusterTriggerProps = {
  initial?: BugBusterInitial
  className?: string
  variant?: 'button' | 'link'
  labelKey?: StringId
}

export function BugBusterTrigger({
  initial,
  className,
  variant = 'button',
  labelKey = 'bug_buster_open',
}: BugBusterTriggerProps) {
  const { t } = useI18n()
  const { openBugBuster } = useBugBuster()
  const label = t(labelKey)

  if (variant === 'link') {
    return (
      <button
        type="button"
        className={className ?? 'select-research__footer-report-link'}
        onClick={() => openBugBuster(initial)}
      >
        {label}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={className ?? 'glow-btn glow-btn--block'}
      onClick={() => openBugBuster(initial)}
    >
      {label}
    </button>
  )
}

import type { BugBusterInitial } from '../bugBuster/bugBusterTypes'
import { BugBusterTrigger } from './BugBusterTrigger'

type ImportNoticeBlockProps = {
  message: string
  className?: string
  bugInitial?: BugBusterInitial | null
}

export function ImportNoticeBlock({
  message,
  className = 'select-research__lab-data-import-notice',
  bugInitial,
}: ImportNoticeBlockProps) {
  return (
    <div className="import-notice-block">
      <p className={className} role="alert" aria-live="polite">
        {message}
      </p>
      {bugInitial ? (
        <BugBusterTrigger
          variant="link"
          labelKey="bug_buster_report_this"
          initial={bugInitial}
          className="import-notice-block__report"
        />
      ) : null}
    </div>
  )
}

import type { BugBusterInitial } from '../bugBuster/bugBusterTypes'
import type { ImportNoticeVariant } from '../importNotice'
import { BugBusterTrigger } from './BugBusterTrigger'

type ImportNoticeBlockProps = {
  message: string
  className?: string
  variant?: ImportNoticeVariant
  bugInitial?: BugBusterInitial | null
}

function ImportNoticeIcon({ variant }: { variant: ImportNoticeVariant }) {
  if (variant === 'success') {
    return (
      <svg
        className="import-notice-block__icon"
        viewBox="0 0 20 20"
        width={20}
        height={20}
        aria-hidden
      >
        <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M6 10.2 8.6 12.8 14 7.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (variant === 'error') {
    return (
      <svg
        className="import-notice-block__icon"
        viewBox="0 0 20 20"
        width={20}
        height={20}
        aria-hidden
      >
        <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7 7 13 13M13 7 7 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg
      className="import-notice-block__icon"
      viewBox="0 0 20 20"
      width={20}
      height={20}
      aria-hidden
    >
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 9v5M10 6.2h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ImportNoticeBlock({
  message,
  className = 'select-research__lab-data-import-notice',
  variant,
  bugInitial,
}: ImportNoticeBlockProps) {
  return (
    <div className={variant ? `import-notice-block import-notice-block--${variant}` : 'import-notice-block'}>
      <div className="import-notice-block__row">
        {variant ? <ImportNoticeIcon variant={variant} /> : null}
        <p className={className}>{message}</p>
      </div>
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

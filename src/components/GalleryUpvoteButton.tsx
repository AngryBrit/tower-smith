import { useState } from 'react'
import { toggleGalleryBuildVote, type TowerGalleryApiError } from '../towerGallery/api'
import { useI18n } from '../i18n'

export type GalleryUpvoteButtonProps = {
  buildId: string
  upvoteCount: number
  viewerVoted?: boolean
  signedIn: boolean
  disabled?: boolean
  getAccessToken: () => Promise<string | null>
  onVoteChange: (buildId: string, upvoteCount: number, viewerVoted: boolean) => void
  onNotice?: (message: string) => void
  onError?: (error: TowerGalleryApiError) => void
  className?: string
}

export function GalleryUpvoteButton({
  buildId,
  upvoteCount,
  viewerVoted = false,
  signedIn,
  disabled = false,
  getAccessToken,
  onVoteChange,
  onNotice,
  onError,
  className = 'gallery-upvote-btn',
}: GalleryUpvoteButtonProps) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)

  const handleClick = () => {
    void (async () => {
      if (!signedIn) {
        onNotice?.(t('gallery_upvote_sign_in'))
        return
      }
      setBusy(true)
      const token = await getAccessToken()
      if (!token) {
        setBusy(false)
        onNotice?.(t('gallery_upvote_sign_in'))
        return
      }
      const result = await toggleGalleryBuildVote(buildId, token)
      setBusy(false)
      if (!result.ok) {
        onError?.(result.error)
        return
      }
      onVoteChange(buildId, result.upvoteCount, result.viewerVoted)
    })()
  }

  const label = viewerVoted
    ? t('gallery_upvote_btn_active')
    : t('gallery_upvote_btn')

  return (
    <button
      type="button"
      className={
        viewerVoted
          ? `${className} ${className}--on glow-btn`
          : `${className} glow-btn`
      }
      disabled={disabled || busy}
      onClick={handleClick}
      aria-pressed={viewerVoted}
      aria-label={`${label} (${upvoteCount})`}
      title={!signedIn ? t('gallery_upvote_sign_in') : undefined}
    >
      <span className={`${className}__icon`} aria-hidden="true">
        👍
      </span>
      <span className={`${className}__count`}>{upvoteCount}</span>
    </button>
  )
}

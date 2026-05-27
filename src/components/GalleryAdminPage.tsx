import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../auth/AuthProvider'
import { GalleryAuthorLine } from './GalleryAuthorLine'
import { GalleryBuildCategoryBadge } from './GalleryBuildCategoryFields'
import {
  deleteGalleryTowerAsAdmin,
  type GalleryAdminApiError,
} from '../towerGallery/adminApi'
import { towerGalleryApiAvailable } from '../towerGallery/api'
import { useGalleryList } from '../towerGallery/useGalleryList'
import { useGalleryAdmin } from '../towerGallery/useGalleryAdmin'
import { buildGalleryShareUrls } from '../towerGallery/shareLink'
import type { TowerGalleryIndexEntry } from '../towerGallery/types'
import { useI18n } from '../i18n'

type GalleryAdminPageProps = {
  listRefreshToken?: number
  onGalleryMutated?: () => void
  isActive?: boolean
}

function formatGalleryDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function adminErrorMessage(
  error: GalleryAdminApiError,
  strings: Record<GalleryAdminApiError, string>,
): string {
  return strings[error] ?? strings.unknown
}

export function GalleryAdminPage({
  listRefreshToken = 0,
  onGalleryMutated,
  isActive = true,
}: GalleryAdminPageProps) {
  const { t, fmt, locale } = useI18n()
  const auth = useAuth()
  const {
    loading: adminLoading,
    isAdmin,
    userId,
    error: adminError,
    signedIn,
    refresh: refreshAdminStatus,
  } = useGalleryAdmin()
  const apiEnabled = towerGalleryApiAvailable()

  const errorStrings = useMemo(
    (): Record<GalleryAdminApiError, string> => ({
      network: t('gallery_admin_error_network'),
      unauthorized: t('gallery_admin_error_unauthorized'),
      auth_required: t('auth_required_publish'),
      admin_not_configured: t('gallery_admin_error_not_configured'),
      gallery_unavailable: t('gallery_error_unavailable'),
      not_found: t('gallery_error_not_found'),
      unknown: t('gallery_error_unknown'),
    }),
    [t],
  )

  const {
    entries,
    loading,
    loadingMore,
    hasMore,
    loadFirstPage,
    loadMore,
  } = useGalleryList({
    enabled: apiEnabled && isAdmin,
    refreshToken: listRefreshToken,
  })

  const [notice, setNotice] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TowerGalleryIndexEntry | null>(
    null,
  )
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!isActive) return
    void refreshAdminStatus()
    if (isAdmin) {
      void loadFirstPage()
    }
  }, [isActive, isAdmin, loadFirstPage, refreshAdminStatus])

  const performDelete = useCallback(async () => {
    if (!deleteTarget) return
    const token = await auth.getAccessToken()
    if (!token) return
    setDeleting(true)
    const result = await deleteGalleryTowerAsAdmin(deleteTarget.id, token)
    setDeleting(false)
    setDeleteTarget(null)
    if (!result.ok) {
      setNotice(adminErrorMessage(result.error, errorStrings))
      return
    }
    setNotice(fmt.galleryAdminNoticeDeleted(deleteTarget.title))
    onGalleryMutated?.()
    void loadFirstPage()
  }, [auth, deleteTarget, errorStrings, fmt, loadFirstPage, onGalleryMutated])

  const handleCopyLink = useCallback(
    async (id: string) => {
      try {
        const { clean } = buildGalleryShareUrls(id, window.location.href)
        await navigator.clipboard.writeText(clean)
        setNotice(t('gallery_notice_link_copied'))
      } catch {
        setNotice(t('gallery_error_unknown'))
      }
    },
    [t],
  )

  if (!apiEnabled) {
    return (
      <div className="gallery-admin-page" role="region" aria-labelledby="gallery-admin-title">
        <p className="tower-gallery__hint">{t('gallery_error_unavailable')}</p>
      </div>
    )
  }

  if (!signedIn) {
    return (
      <div className="gallery-admin-page" role="region" aria-labelledby="gallery-admin-title">
        <h2 id="gallery-admin-title" className="tower-gallery__title">
          {t('gallery_admin_title')}
        </h2>
        <p className="tower-gallery__intro">{t('gallery_admin_sign_in_required')}</p>
      </div>
    )
  }

  if (adminLoading) {
    return (
      <div className="gallery-admin-page" role="region" aria-labelledby="gallery-admin-title">
        <p className="tower-gallery__hint" role="status">
          {t('auth_loading')}
        </p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="gallery-admin-page" role="region" aria-labelledby="gallery-admin-title">
        <h2 id="gallery-admin-title" className="tower-gallery__title">
          {t('gallery_admin_title')}
        </h2>
        <p className="tower-gallery__intro">{t('gallery_admin_access_denied')}</p>
        {userId ? (
          <p className="tower-gallery__hint">
            {fmt.galleryAdminYourUserId(userId)}
          </p>
        ) : null}
        {adminError ? (
          <p className="tower-gallery__error" role="alert">
            {adminErrorMessage(adminError, errorStrings)}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="gallery-admin-page" role="region" aria-labelledby="gallery-admin-title">
      <h2 id="gallery-admin-title" className="tower-gallery__title">
        {t('gallery_admin_title')}
      </h2>
      <p className="tower-gallery__intro">{t('gallery_admin_page_intro')}</p>

      <div className="tower-gallery__list-header">
        <p className="tower-gallery__hint">{t('gallery_admin_unlocked_hint')}</p>
        <button
          type="button"
          className="glow-btn"
          disabled={loading}
          onClick={() => void loadFirstPage()}
        >
          {t('gallery_refresh')}
        </button>
      </div>

      {notice ? (
        <p className="tower-gallery__notice" role="status">
          {notice}
        </p>
      ) : null}

      {loading ? (
        <p className="tower-gallery__hint" role="status">
          {t('gallery_loading')}
        </p>
      ) : null}

      {!loading && entries.length === 0 ? (
        <p className="tower-gallery__hint">{t('gallery_empty')}</p>
      ) : null}

      {!loading && entries.length > 0 ? (
        <>
          <ul className="tower-gallery__entries">
            {entries.map((entry) => (
              <li key={entry.id} className="tower-gallery__entry">
                <div className="tower-gallery__entry-main">
                  <span className="tower-gallery__entry-title">{entry.title}</span>
                  {entry.category ? (
                    <GalleryBuildCategoryBadge
                      category={entry.category}
                      className="tower-gallery__entry-category"
                    />
                  ) : null}
                  {entry.author ? (
                    <GalleryAuthorLine
                      author={entry.author}
                      avatarUrl={entry.authorAvatarUrl}
                      className="tower-gallery__entry-author"
                    />
                  ) : null}
                  <time
                    className="tower-gallery__entry-date"
                    dateTime={entry.createdAt}
                  >
                    {formatGalleryDate(entry.createdAt, locale)}
                  </time>
                  <code className="tower-gallery__entry-id">{entry.id}</code>
                </div>
                <div className="tower-gallery__entry-actions">
                  <button
                    type="button"
                    className="glow-btn"
                    onClick={() => void handleCopyLink(entry.id)}
                  >
                    {t('gallery_copy_link_btn')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger"
                    onClick={() => setDeleteTarget(entry)}
                  >
                    {t('gallery_admin_delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {hasMore ? (
            <button
              type="button"
              className="glow-btn glow-btn--block tower-gallery__load-more"
              disabled={loadingMore}
              onClick={() => void loadMore()}
            >
              {loadingMore ? t('gallery_loading_more') : t('gallery_load_more')}
            </button>
          ) : null}
        </>
      ) : null}

      {deleteTarget
        ? createPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => !deleting && setDeleteTarget(null)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="gallery-delete-title"
                aria-describedby="gallery-delete-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id="gallery-delete-title"
                  className="select-research__reset-confirm-title"
                >
                  {t('gallery_admin_delete_confirm_title')}
                </h2>
                <p
                  id="gallery-delete-desc"
                  className="select-research__reset-confirm-desc"
                >
                  {fmt.galleryAdminDeleteConfirmBody(deleteTarget.title)}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    disabled={deleting}
                    onClick={() => setDeleteTarget(null)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    disabled={deleting}
                    onClick={() => void performDelete()}
                  >
                    {deleting ? t('gallery_admin_deleting') : t('gallery_admin_delete')}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

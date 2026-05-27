import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import type { SelectResearchHandle } from './SelectResearch'
import { GalleryBuildCategoryBadge } from './GalleryBuildCategoryFields'
import { useAuth } from '../auth/AuthProvider'
import {
  deleteGalleryTower,
  getGalleryTower,
  regenerateGalleryTowerLink,
  setGalleryTowerVisibility,
  towerGalleryApiAvailable,
  type TowerGalleryApiError,
} from '../towerGallery/api'
import { useGalleryList } from '../towerGallery/useGalleryList'
import { buildGalleryShareUrls } from '../towerGallery/shareLink'
import { useI18n } from '../i18n'

type MyBuildsDialogProps = {
  open: boolean
  onClose: () => void
  labToolsRef: RefObject<SelectResearchHandle | null>
  onGalleryMutated?: () => void
}

type OwnerConfirmState =
  | {
      kind: 'delete' | 'regenerate'
      id: string
      title: string
    }
  | null

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

function apiErrorMessage(
  error: TowerGalleryApiError,
  strings: Record<TowerGalleryApiError, string>,
): string {
  return strings[error] ?? strings.unknown
}

export function MyBuildsDialog({
  open,
  onClose,
  labToolsRef,
  onGalleryMutated,
}: MyBuildsDialogProps) {
  const { t, fmt, locale } = useI18n()
  const auth = useAuth()
  const apiEnabled = towerGalleryApiAvailable()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [ownerConfirm, setOwnerConfirm] = useState<OwnerConfirmState>(null)

  useEffect(() => {
    if (!open) return
    void auth.getAccessToken().then(setAccessToken)
  }, [auth, auth.session, open])

  useEffect(() => {
    if (!open) {
      setNotice(null)
      setOwnerConfirm(null)
      setLoadingId(null)
    }
  }, [open])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const errorStrings = useMemo(
    (): Record<TowerGalleryApiError, string> => ({
      network: t('gallery_error_network'),
      gallery_unavailable: t('gallery_error_unavailable'),
      invalid_title: t('gallery_error_invalid_title'),
      invalid_category: t('gallery_error_invalid_category'),
      invalid_payload: t('gallery_error_invalid_payload'),
      invalid_visibility: t('gallery_error_unknown'),
      submissions_disabled: t('gallery_error_disabled'),
      auth_required: t('auth_required_publish'),
      cannot_vote_own: t('gallery_error_cannot_vote_own'),
      votes_unavailable: t('gallery_error_votes_unavailable'),
      not_found: t('gallery_error_not_found'),
      unknown: t('gallery_error_unknown'),
    }),
    [t],
  )

  const {
    entries,
    loading,
    loadingMore,
    error: listErrorCode,
    hasPrev,
    hasNext,
    currentPage,
    loadFirstPage,
    loadMore,
    loadPrevPage,
    patchEntry,
  } = useGalleryList({
    enabled: open && apiEnabled && Boolean(accessToken),
    mineOnly: true,
    accessToken,
    paginationMode: 'paged',
  })

  useEffect(() => {
    if (!open || !accessToken) return
    void loadFirstPage()
  }, [open, accessToken, loadFirstPage])

  const listError = listErrorCode
    ? apiErrorMessage(listErrorCode, errorStrings)
    : null

  const handleCopyLink = useCallback(
    async (id: string) => {
      setNotice(null)
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

  const handleLoad = useCallback(
    async (id: string) => {
      setNotice(null)
      setLoadingId(id)
      const result = await getGalleryTower(id)
      setLoadingId(null)
      if (!result.ok) {
        setNotice(apiErrorMessage(result.error, errorStrings))
        return
      }
      const applied = labToolsRef.current?.applyLabsShareFile(result.record.payload)
      if (!applied) {
        setNotice(t('gallery_error_apply'))
        return
      }
      setNotice(fmt.galleryNoticeLoaded(result.record.title))
    },
    [errorStrings, fmt, labToolsRef, t],
  )

  const handleDeleteOwn = useCallback(
    async (id: string, title: string) => {
      setNotice(null)
      const token = await auth.getAccessToken()
      if (!token) {
        setNotice(t('auth_required_publish'))
        return
      }
      setLoadingId(id)
      const result = await deleteGalleryTower(id, token)
      setLoadingId(null)
      if (!result.ok) {
        setNotice(apiErrorMessage(result.error, errorStrings))
        return
      }
      setNotice(fmt.galleryAdminNoticeDeleted(title))
      onGalleryMutated?.()
      void loadFirstPage()
    },
    [auth, errorStrings, fmt, loadFirstPage, onGalleryMutated, t],
  )

  const handleToggleVisibilityOwn = useCallback(
    async (id: string, visibility: 'public' | 'unlisted') => {
      setNotice(null)
      const token = await auth.getAccessToken()
      if (!token) {
        setNotice(t('auth_required_publish'))
        return
      }
      const nextVisibility = visibility === 'unlisted' ? 'public' : 'unlisted'
      setLoadingId(id)
      const result = await setGalleryTowerVisibility(id, nextVisibility, token)
      setLoadingId(null)
      if (!result.ok) {
        setNotice(apiErrorMessage(result.error, errorStrings))
        return
      }
      patchEntry(id, { visibility: result.entry.visibility ?? nextVisibility })
      setNotice(
        nextVisibility === 'unlisted'
          ? t('gallery_notice_set_unlisted')
          : t('gallery_notice_set_public'),
      )
      onGalleryMutated?.()
    },
    [auth, errorStrings, onGalleryMutated, patchEntry, t],
  )

  const handleRegenerateOwn = useCallback(
    async (id: string) => {
      setNotice(null)
      const token = await auth.getAccessToken()
      if (!token) {
        setNotice(t('auth_required_publish'))
        return
      }
      setLoadingId(id)
      const result = await regenerateGalleryTowerLink(id, token)
      setLoadingId(null)
      if (!result.ok) {
        setNotice(apiErrorMessage(result.error, errorStrings))
        return
      }
      try {
        const { clean } = buildGalleryShareUrls(result.entry.id, window.location.href)
        await navigator.clipboard.writeText(clean)
        setNotice(t('gallery_notice_regenerated_link'))
      } catch {
        setNotice(t('gallery_notice_regenerated_no_copy'))
      }
      onGalleryMutated?.()
      void loadFirstPage()
    },
    [auth, errorStrings, loadFirstPage, onGalleryMutated, t],
  )

  const confirmOwnerAction = useCallback(async () => {
    if (!ownerConfirm) return
    const { kind, id, title } = ownerConfirm
    if (kind === 'delete') {
      await handleDeleteOwn(id, title)
    } else {
      await handleRegenerateOwn(id)
    }
    setOwnerConfirm(null)
  }, [handleDeleteOwn, handleRegenerateOwn, ownerConfirm])

  if (!open) return null

  return createPortal(
    <>
      <div
        className="select-research__lab-data-backdrop my-builds-dialog-backdrop"
        role="presentation"
        onClick={onClose}
      >
        <div
          className="select-research__lab-data-dialog my-builds-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="my-builds-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="my-builds-dialog-title" className="select-research__lab-data-title">
            {t('auth_my_builds_title')}
          </h2>
          <p className="select-research__lab-data-intro">{t('auth_my_builds_intro')}</p>

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

          {listError && !loading ? (
            <p className="tower-gallery__error" role="alert">
              {listError}
            </p>
          ) : null}

          {!loading && !listError && entries.length === 0 ? (
            <p className="tower-gallery__hint">{t('auth_my_builds_empty')}</p>
          ) : null}

          {!loading && entries.length > 0 ? (
            <>
              <ul className="tower-gallery__entries my-builds-dialog__entries">
                {entries.map((entry) => (
                  <li key={entry.id} className="tower-gallery__entry my-builds-entry">
                    <button
                      type="button"
                      className="tower-gallery__entry-title my-builds-entry__title"
                      disabled={loadingId === entry.id}
                      title={entry.title}
                      aria-label={`${t('gallery_load_btn')}: ${entry.title}`}
                      onClick={() => void handleLoad(entry.id)}
                    >
                      {loadingId === entry.id
                        ? t('gallery_loading_tower')
                        : entry.title}
                    </button>
                    <div className="my-builds-entry__meta-row">
                      <div className="tower-gallery__entry-main">
                        {entry.category ? (
                          <div className="tower-gallery__entry-badges">
                            <GalleryBuildCategoryBadge
                              category={entry.category}
                              className="tower-gallery__entry-category"
                            />
                            <span className="tower-gallery__visibility-badge">
                              {entry.visibility === 'unlisted'
                                ? t('gallery_visibility_private')
                                : t('gallery_visibility_public')}
                            </span>
                          </div>
                        ) : null}
                        <time className="tower-gallery__entry-date" dateTime={entry.createdAt}>
                          {formatGalleryDate(entry.createdAt, locale)}
                        </time>
                      </div>
                      <div className="tower-gallery__entry-actions">
                        <button
                          type="button"
                          className="glow-btn"
                          onClick={() => void handleCopyLink(entry.id)}
                        >
                          {t('gallery_copy_link_btn')}
                        </button>
                      </div>
                    </div>
                    <div className="tower-gallery__owner-actions">
                      <button
                        type="button"
                        className="glow-btn"
                        disabled={loadingId === entry.id}
                        onClick={() =>
                          void handleToggleVisibilityOwn(
                            entry.id,
                            entry.visibility === 'unlisted' ? 'unlisted' : 'public',
                          )
                        }
                      >
                        {entry.visibility === 'unlisted'
                          ? t('gallery_owner_make_public')
                          : t('gallery_owner_make_unlisted')}
                      </button>
                      <button
                        type="button"
                        className="glow-btn"
                        disabled={loadingId === entry.id}
                        onClick={() =>
                          setOwnerConfirm({
                            kind: 'regenerate',
                            id: entry.id,
                            title: entry.title,
                          })
                        }
                      >
                        {t('gallery_owner_regenerate_link')}
                      </button>
                      <button
                        type="button"
                        className="glow-btn glow-btn--danger"
                        disabled={loadingId === entry.id}
                        onClick={() =>
                          setOwnerConfirm({
                            kind: 'delete',
                            id: entry.id,
                            title: entry.title,
                          })
                        }
                      >
                        {t('gallery_admin_delete')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="tower-gallery__pager">
                <button
                  type="button"
                  className="glow-btn"
                  disabled={loadingMore || !hasPrev}
                  onClick={() => void loadPrevPage()}
                >
                  {t('gallery_page_prev')}
                </button>
                <span className="tower-gallery__pager-label">
                  {t('gallery_page_label').replace('{{page}}', String(currentPage))}
                </span>
                <button
                  type="button"
                  className="glow-btn"
                  disabled={loadingMore || !hasNext}
                  onClick={() => void loadMore()}
                >
                  {t('gallery_page_next')}
                </button>
              </div>
            </>
          ) : null}

          <div className="my-builds-dialog__footer">
            <button type="button" className="glow-btn glow-btn--block" onClick={onClose}>
              {t('sr_close')}
            </button>
          </div>
        </div>
      </div>

      {ownerConfirm ? (
        <div
          className="select-research__reset-confirm-backdrop"
          role="presentation"
          onClick={() => setOwnerConfirm(null)}
        >
          <div
            className="select-research__reset-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="select-research__reset-confirm-title">
              {ownerConfirm.kind === 'delete'
                ? t('gallery_admin_delete_confirm_title')
                : t('gallery_owner_regenerate_link')}
            </h2>
            <p className="select-research__reset-confirm-desc">
              {ownerConfirm.kind === 'delete'
                ? t('gallery_owner_delete_confirm')
                : t('gallery_regenerate_confirm')}
            </p>
            <div className="select-research__reset-confirm-actions">
              <button
                type="button"
                className="glow-btn glow-btn--block"
                onClick={() => setOwnerConfirm(null)}
              >
                {t('sr_cancel')}
              </button>
              <button
                type="button"
                className="glow-btn glow-btn--danger glow-btn--block"
                disabled={loadingId === ownerConfirm.id}
                onClick={() => void confirmOwnerAction()}
              >
                {ownerConfirm.kind === 'delete'
                  ? t('gallery_admin_delete')
                  : t('gallery_owner_regenerate_link')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>,
    document.body,
  )
}

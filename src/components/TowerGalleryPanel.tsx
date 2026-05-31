import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'

import type { SelectResearchHandle } from '../lab/labToolsTypes'

import { GalleryAuthorLine } from './GalleryAuthorLine'

import { GallerySortToggle } from './GallerySortToggle'

import { GalleryUpvoteButton } from './GalleryUpvoteButton'

import { GalleryBuildCategoryBadge } from './GalleryBuildCategoryFields'
import { GalleryCategoryChips } from './GalleryCategoryChips'
import { GalleryUnavailableCallout } from './GalleryUnavailableCallout'
import { GalleryCategorySelect } from './GalleryCategorySelect'
import { GalleryVisibilitySelect } from './GalleryVisibilitySelect'
import { BugBusterTrigger } from './BugBusterTrigger'

import { useAuth } from '../auth/useAuth'
import { deferInEffect } from '../deferInEffect'

import {
  deleteGalleryTower,
  regenerateGalleryTowerLink,
  setGalleryTowerVisibility,
  setGalleryTowerCategory,

  getGalleryTower,

  towerGalleryApiAvailable,

  type TowerGalleryApiError,

} from '../towerGallery/api'

import { useGalleryList } from '../towerGallery/useGalleryList'

import type { GalleryListSort } from '../towerGallery/types'

import type { GalleryBuildCategory } from '../towerGallery/buildCategories'

import { buildGalleryShareUrls } from '../towerGallery/shareLink'
import { shouldShowGallerySetupCallout } from '../towerGallery/gallerySetup'

import { useI18n } from '../i18n'



type TowerGalleryPanelProps = {

  labToolsRef: RefObject<SelectResearchHandle | null>

  onTowerLoaded?: () => void

  /** True when the Builds tab is visible. */
  isActive?: boolean

  /** Bump after admin deletes a build so the public list refreshes. */

  listRefreshToken?: number

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



export function TowerGalleryPanel({

  labToolsRef,

  onTowerLoaded,

  isActive = true,

  listRefreshToken = 0,

}: TowerGalleryPanelProps) {

  const { t, fmt, locale } = useI18n()

  const auth = useAuth()

  const apiEnabled = towerGalleryApiAvailable()

  const [searchDraft, setSearchDraft] = useState('')

  const [searchQuery, setSearchQuery] = useState('')

  const [categoryFilter, setCategoryFilter] = useState<GalleryBuildCategory | ''>('')
  const [mineOnlyFilter, setMineOnlyFilter] = useState(false)
  const [listSort, setListSort] = useState<GalleryListSort>('newest')

  const [accessToken, setAccessToken] = useState<string | null>(null)



  useEffect(() => {

    void auth.getAccessToken().then(setAccessToken)

  }, [auth, auth.session])

  useEffect(() => {
    if (!auth.session) deferInEffect(() => setMineOnlyFilter(false))
  }, [auth.session])



  useEffect(() => {

    const timer = window.setTimeout(() => setSearchQuery(searchDraft.trim()), 300)

    return () => window.clearTimeout(timer)

  }, [searchDraft])



  const errorStrings = useMemo(

    (): Record<TowerGalleryApiError, string> => ({

      network: t('gallery_error_network'),

      gallery_unavailable: t('gallery_error_unavailable'),

      invalid_title: t('gallery_error_invalid_title'),
      invalid_guild: t('gallery_error_invalid_guild'),

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

    patchEntryVote,
    patchEntry,

  } = useGalleryList({

    enabled: apiEnabled,

    refreshToken: listRefreshToken,

    searchQuery,

    categoryFilter,

    sort: listSort,

    accessToken,
    mineOnly: mineOnlyFilter && Boolean(accessToken),
    paginationMode: 'paged',

  })

  const showSetupCallout = shouldShowGallerySetupCallout(apiEnabled, listErrorCode)
  const listInteractive = apiEnabled && !showSetupCallout

  useEffect(() => {
    if (!isActive) return
    void loadFirstPage()
  }, [isActive, loadFirstPage])

  const listError = listErrorCode

    ? apiErrorMessage(listErrorCode, errorStrings)

    : null

  const [actionNotice, setActionNotice] = useState<string | null>(null)

  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [ownerConfirm, setOwnerConfirm] = useState<OwnerConfirmState>(null)

  useEffect(() => {
    if (!actionNotice) return
    const timer = window.setTimeout(() => setActionNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [actionNotice])

  useEffect(() => {
    if (isActive) return
    deferInEffect(() => setActionNotice(null))
  }, [isActive])

  const handleCopyLink = useCallback(

    async (id: string) => {

      setActionNotice(null)

      try {

        const { clean } = buildGalleryShareUrls(id, window.location.href)

        await navigator.clipboard.writeText(clean)

        setActionNotice(t('gallery_notice_link_copied'))

      } catch {

        setActionNotice(t('gallery_error_unknown'))

      }

    },

    [t],

  )



  const handleLoad = useCallback(

    async (id: string) => {

      setActionNotice(null)

      setLoadingId(id)

      const result = await getGalleryTower(id)

      setLoadingId(null)

      if (!result.ok) {

        setActionNotice(apiErrorMessage(result.error, errorStrings))

        return

      }

      const applied = labToolsRef.current?.applyLabsShareFile(result.record.payload)

      if (!applied) {

        setActionNotice(t('gallery_error_apply'))

        return

      }

      setActionNotice(fmt.galleryNoticeLoaded(result.record.title))

      onTowerLoaded?.()

    },

    [errorStrings, fmt, labToolsRef, onTowerLoaded, t],

  )

  const handleDeleteOwn = useCallback(
    async (id: string, title: string) => {
      setActionNotice(null)
      const token = await auth.getAccessToken()
      if (!token) {
        setActionNotice(t('auth_required_publish'))
        return
      }

      setLoadingId(id)
      const result = await deleteGalleryTower(id, token)
      setLoadingId(null)
      if (!result.ok) {
        setActionNotice(apiErrorMessage(result.error, errorStrings))
        return
      }
      setActionNotice(fmt.galleryAdminNoticeDeleted(title))
      void loadFirstPage()
    },
    [auth, errorStrings, fmt, loadFirstPage, t],
  )

  const handleSetCategoryOwn = useCallback(
    async (id: string, category: GalleryBuildCategory) => {
      setActionNotice(null)
      const token = await auth.getAccessToken()
      if (!token) {
        setActionNotice(t('auth_required_publish'))
        return
      }
      setLoadingId(id)
      const result = await setGalleryTowerCategory(id, category, token)
      setLoadingId(null)
      if (!result.ok) {
        setActionNotice(apiErrorMessage(result.error, errorStrings))
        return
      }
      patchEntry(id, { category: result.entry.category ?? category })
      setActionNotice(t('gallery_notice_category_updated'))
      void loadFirstPage()
    },
    [auth, errorStrings, loadFirstPage, patchEntry, t],
  )

  const handleSetVisibilityOwn = useCallback(
    async (id: string, nextVisibility: 'public' | 'unlisted') => {
      setActionNotice(null)
      const token = await auth.getAccessToken()
      if (!token) {
        setActionNotice(t('auth_required_publish'))
        return
      }
      setLoadingId(id)
      const result = await setGalleryTowerVisibility(id, nextVisibility, token)
      setLoadingId(null)
      if (!result.ok) {
        setActionNotice(apiErrorMessage(result.error, errorStrings))
        return
      }
      patchEntry(id, { visibility: result.entry.visibility ?? nextVisibility })
      setActionNotice(
        nextVisibility === 'unlisted'
          ? t('gallery_notice_set_unlisted')
          : t('gallery_notice_set_public'),
      )
      void loadFirstPage()
    },
    [auth, errorStrings, loadFirstPage, patchEntry, t],
  )

  const handleRegenerateOwn = useCallback(
    async (id: string) => {
      setActionNotice(null)
      const token = await auth.getAccessToken()
      if (!token) {
        setActionNotice(t('auth_required_publish'))
        return
      }
      setLoadingId(id)
      const result = await regenerateGalleryTowerLink(id, token)
      setLoadingId(null)
      if (!result.ok) {
        setActionNotice(apiErrorMessage(result.error, errorStrings))
        return
      }
      try {
        const { clean } = buildGalleryShareUrls(result.entry.id, window.location.href)
        await navigator.clipboard.writeText(clean)
        setActionNotice(t('gallery_notice_regenerated_link'))
      } catch {
        setActionNotice(t('gallery_notice_regenerated_no_copy'))
      }
      void loadFirstPage()
    },
    [auth, errorStrings, loadFirstPage, t],
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



  return (

    <section className="tower-gallery" aria-labelledby="tower-gallery-title">

      <h2 id="tower-gallery-title" className="tower-gallery__title">

        {t('gallery_title')}

      </h2>

      <p className="tower-gallery__intro">{t('gallery_intro')}</p>



      <hr className="tower-gallery__divider" aria-hidden />

      {showSetupCallout ? (
        <GalleryUnavailableCallout error={listErrorCode} />
      ) : null}

      <div className="tower-gallery__list-header">

        <div>

          <h3 className="tower-gallery__subtitle">{t('gallery_list_title')}</h3>

          <p className="tower-gallery__hint tower-gallery__hint--tight">

            {t('gallery_list_paged_hint')}

          </p>

        </div>

        <button

          type="button"

          className="glow-btn"

          disabled={loading || !listInteractive}

          onClick={() => {
            setActionNotice(null)
            void loadFirstPage()
          }}

        >

          {t('gallery_refresh')}

        </button>

      </div>



      <div className="tower-gallery__filters">
        <label className="tower-gallery__field tower-gallery__search">
          <span>{t('gallery_search_label')}</span>
          <input
            type="search"
            className="tower-gallery__input"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={t('gallery_search_placeholder')}
            autoComplete="off"
            disabled={!listInteractive}
          />
        </label>

        {auth.session ? (
          <label className="tower-gallery__mine-filter">
            <input
              type="checkbox"
              checked={mineOnlyFilter}
              disabled={loading || !listInteractive || !accessToken}
              onChange={(e) => setMineOnlyFilter(e.target.checked)}
            />
            <span>{t('gallery_filter_mine')}</span>
          </label>
        ) : null}
      </div>

      <GalleryCategoryChips
        value={categoryFilter}
        onChange={setCategoryFilter}
        disabled={loading || !listInteractive}
      />

      <div className="tower-gallery__sort-row">
        <GallerySortToggle
          name="tower-gallery-sort"
          value={listSort}
          onChange={setListSort}
          disabled={loading || !listInteractive}
        />
      </div>

      {listInteractive && !loading && entries.length > 0 ? (
        <p className="tower-gallery__hint tower-gallery__hint--tight">
          {fmt.galleryShowingCount(entries.length)}
        </p>
      ) : null}



      {actionNotice ? (

        <p className="tower-gallery__notice" role="status">

          {actionNotice}

        </p>

      ) : null}



      {listInteractive && loading ? (
        <p className="tower-gallery__hint" role="status">
          {t('gallery_loading')}
        </p>
      ) : null}

      {listInteractive && listError && !loading && !showSetupCallout ? (
        <div className="tower-gallery__error-block">
          <p className="tower-gallery__error" role="alert">
            {listError}
          </p>
          <BugBusterTrigger
            variant="link"
            labelKey="bug_buster_report_this"
            className="tower-gallery__error-report"
            initial={{
              category: 'share_gallery',
              description: listError,
              panelId: 'gallery',
            }}
          />
        </div>
      ) : null}

      {listInteractive && !loading && !listError && entries.length === 0 ? (
        <p className="tower-gallery__hint">{t('gallery_empty')}</p>
      ) : null}

      {listInteractive && !loading && entries.length > 0 ? (

        <>

          <ul className="tower-gallery__entries">

            {entries.map((entry) => (

              <li key={entry.id} className="tower-gallery__entry">

                <div className="tower-gallery__entry-main">

                  <button
                    type="button"
                    className="tower-gallery__entry-title"
                    disabled={loadingId === entry.id}
                    aria-label={`${t('gallery_load_btn')}: ${entry.title}`}
                    onClick={() => void handleLoad(entry.id)}
                  >
                    {loadingId === entry.id
                      ? t('gallery_loading_tower')
                      : entry.title}
                  </button>

                  {(entry.category || entry.viewerOwns) ? (
                    <div className="tower-gallery__entry-badges">
                      {entry.viewerOwns ? (
                        <GalleryCategorySelect
                          value={entry.category ?? 'other'}
                          disabled={loadingId === entry.id}
                          onChange={(next) =>
                            void handleSetCategoryOwn(entry.id, next)
                          }
                        />
                      ) : entry.category ? (
                        <GalleryBuildCategoryBadge
                          category={entry.category}
                          className="tower-gallery__entry-category"
                        />
                      ) : null}
                      {entry.viewerOwns ? (
                        <GalleryVisibilitySelect
                          value={entry.visibility === 'unlisted' ? 'unlisted' : 'public'}
                          disabled={loadingId === entry.id}
                          onChange={(next) =>
                            void handleSetVisibilityOwn(entry.id, next)
                          }
                        />
                      ) : null}
                    </div>
                  ) : null}

                  {entry.author ? (
                    <GalleryAuthorLine
                      author={entry.author}
                      guild={entry.guild}
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
                </div>

                <div className="tower-gallery__entry-actions">

                  <GalleryUpvoteButton
                    buildId={entry.id}
                    upvoteCount={entry.upvoteCount}
                    viewerVoted={entry.viewerVoted}
                    signedIn={Boolean(auth.session)}
                    disabled={loadingId === entry.id}
                    getAccessToken={auth.getAccessToken}
                    onVoteChange={patchEntryVote}
                    onNotice={setActionNotice}
                    onError={(error) =>
                      setActionNotice(apiErrorMessage(error, errorStrings))
                    }
                  />

                  <button

                    type="button"

                    className="glow-btn"

                    onClick={() => void handleCopyLink(entry.id)}

                  >

                    {t('gallery_copy_link_btn')}

                  </button>
                </div>
                {entry.viewerOwns ? (
                  <div className="tower-gallery__owner-actions">
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
                ) : null}

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

      {ownerConfirm
        ? createPortal(
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
            </div>,
            document.body,
          )
        : null}

    </section>

  )

}



import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react'

import type { SelectResearchHandle } from './SelectResearch'

import { GalleryAuthorLine } from './GalleryAuthorLine'

import { GallerySortToggle } from './GallerySortToggle'

import { GalleryUpvoteButton } from './GalleryUpvoteButton'

import {
  GalleryBuildCategoryBadge,
  GalleryBuildCategoryFilter,
} from './GalleryBuildCategoryFields'

import { useAuth } from '../auth/AuthProvider'

import {

  getGalleryTower,

  towerGalleryApiAvailable,

  type TowerGalleryApiError,

} from '../towerGallery/api'

import { useGalleryList } from '../towerGallery/useGalleryList'

import type { GalleryListSort } from '../towerGallery/types'

import type { GalleryBuildCategory } from '../towerGallery/buildCategories'

import { buildGalleryShareUrls } from '../towerGallery/shareLink'

import { useI18n } from '../i18n'



type TowerGalleryPanelProps = {

  labToolsRef: RefObject<SelectResearchHandle | null>

  onTowerLoaded?: () => void

  /** Bump after admin deletes a build so the public list refreshes. */

  listRefreshToken?: number

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



function apiErrorMessage(

  error: TowerGalleryApiError,

  strings: Record<TowerGalleryApiError, string>,

): string {

  return strings[error] ?? strings.unknown

}



export function TowerGalleryPanel({

  labToolsRef,

  onTowerLoaded,

  listRefreshToken = 0,

}: TowerGalleryPanelProps) {

  const { t, fmt, locale } = useI18n()

  const auth = useAuth()

  const apiEnabled = towerGalleryApiAvailable()

  const [searchDraft, setSearchDraft] = useState('')

  const [searchQuery, setSearchQuery] = useState('')

  const [categoryFilter, setCategoryFilter] = useState<GalleryBuildCategory | ''>('')

  const [listSort, setListSort] = useState<GalleryListSort>('newest')

  const [accessToken, setAccessToken] = useState<string | null>(null)



  useEffect(() => {

    void auth.getAccessToken().then(setAccessToken)

  }, [auth, auth.session])



  useEffect(() => {

    const timer = window.setTimeout(() => setSearchQuery(searchDraft.trim()), 300)

    return () => window.clearTimeout(timer)

  }, [searchDraft])



  const errorStrings = useMemo(

    (): Record<TowerGalleryApiError, string> => ({

      network: t('gallery_error_network'),

      gallery_unavailable: t('gallery_error_unavailable'),

      invalid_title: t('gallery_error_invalid_title'),

      invalid_category: t('gallery_error_invalid_category'),

      invalid_payload: t('gallery_error_invalid_payload'),

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

    hasMore,

    loadFirstPage,

    loadMore,

    patchEntryVote,

  } = useGalleryList({

    enabled: apiEnabled,

    refreshToken: listRefreshToken,

    searchQuery,

    categoryFilter,

    sort: listSort,

    accessToken,

  })

  const listError = listErrorCode

    ? apiErrorMessage(listErrorCode, errorStrings)

    : null

  const [actionNotice, setActionNotice] = useState<string | null>(null)

  const [loadingId, setLoadingId] = useState<string | null>(null)



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



  return (

    <section className="tower-gallery" aria-labelledby="tower-gallery-title">

      <h2 id="tower-gallery-title" className="tower-gallery__title">

        {t('gallery_title')}

      </h2>

      <p className="tower-gallery__intro">{t('gallery_intro')}</p>



      <hr className="tower-gallery__divider" aria-hidden />



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

          disabled={loading}

          onClick={() => void loadFirstPage()}

        >

          {t('gallery_refresh')}

        </button>

      </div>



      <label className="tower-gallery__field tower-gallery__search">

        <span>{t('gallery_search_label')}</span>

        <input

          type="search"

          className="tower-gallery__input"

          value={searchDraft}

          onChange={(e) => setSearchDraft(e.target.value)}

          placeholder={t('gallery_search_placeholder')}

          autoComplete="off"

        />

      </label>



      <GalleryBuildCategoryFilter
        value={categoryFilter}
        onChange={setCategoryFilter}
        disabled={loading}
      />



      <GallerySortToggle
        name="tower-gallery-sort"
        value={listSort}
        onChange={setListSort}
        disabled={loading}
      />



      {!loading && entries.length > 0 ? (

        <p className="tower-gallery__hint tower-gallery__hint--tight">

          {fmt.galleryShowingCount(entries.length)}

        </p>

      ) : null}



      {actionNotice ? (

        <p className="tower-gallery__notice" role="status">

          {actionNotice}

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

        <p className="tower-gallery__hint">{t('gallery_empty')}</p>

      ) : null}



      {!loading && entries.length > 0 ? (

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

    </section>

  )

}



import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../auth/useAuth'
import { useTowerWorkspaceContext } from '../towerWorkspaceContext'
import { useLabHydration } from './labHydrationContext'
import { useWorkspaceUndo } from './workspaceUndoContext'
import { buildLabsShareFileFromWorkspace } from './labShareActions'
import {
  buildLabsShareUrls,
  encodeLabsShareQueryValue,
  type LabsShareFile,
} from '../labsShareCodec'
import {
  registerGuildNameById,
  resolveGuildNameById,
  towerGalleryApiAvailable,
} from '../towerGallery/api'
import { publishGalleryShareLink } from '../towerGallery/publishShareLink'
import type { GalleryBuildCategory } from '../towerGallery/buildCategories'
import type { GalleryBuildVisibility } from '../towerGallery/types'
import { updateUserGuildId } from '../profile/profileApi'
import { supabaseBrowserConfigured } from '../supabase/client'
import { applyTowerThemes, readTowerThemesSnapshot } from '../towerDataThemes'
import {
  clearTowerWorkspace,
  workspaceThemesSnapshot,
} from '../towerWorkspaceStorage'
import { useI18n } from '../i18n'
import { CommunityBuildContext } from './communityBuildContext'

const GalleryPublishDialog = lazy(() =>
  import('../components/GalleryPublishDialog').then((m) => ({ default: m.GalleryPublishDialog })),
)
const AuthSignInDialog = lazy(() =>
  import('../components/AuthSignInDialog').then((m) => ({ default: m.AuthSignInDialog })),
)
const LabGuildNamePromptDialog = lazy(() =>
  import('../components/lab/LabGuildNamePromptDialog').then((m) => ({
    default: m.LabGuildNamePromptDialog,
  })),
)

export function CommunityBuildProvider({ children }: { children: ReactNode }) {
  const { t, fmt } = useI18n()
  const { hydrated, setImportNotice } = useLabHydration()
  const {
    workspace,
    setWorkspace,
    scratchWorkspace,
    setScratchWorkspace,
    labLevelOverrides: levelOverrides,
    workshopFlat,
  } = useTowerWorkspaceContext()
  const auth = useAuth()
  const { pushUndoSnapshot } = useWorkspaceUndo()

  const [sharePublishing, setSharePublishing] = useState(false)
  const [communityPublishDialogOpen, setCommunityPublishDialogOpen] = useState(false)
  const [authSignInDialogOpen, setAuthSignInDialogOpen] = useState(false)
  const [guildNamePrompt, setGuildNamePrompt] = useState<{
    guildId: string
    name: string
  } | null>(null)
  const [publishTitle, setPublishTitle] = useState('')
  const [publishGuildId, setPublishGuildId] = useState('')
  const [publishCategory, setPublishCategory] = useState<GalleryBuildCategory | ''>('')
  const [publishVisibility, setPublishVisibility] =
    useState<GalleryBuildVisibility>('public')
  const [communityPublishSubmitting, setCommunityPublishSubmitting] = useState(false)

  const guildNamePromptResolveRef = useRef<((value: string | null) => void) | null>(null)

  const getLabsShareFileForGallery = useCallback((): LabsShareFile | null => {
    if (!hydrated) return null
    return buildLabsShareFileFromWorkspace(levelOverrides, workshopFlat)
  }, [hydrated, levelOverrides, workshopFlat])

  const resolveShareTitle = useCallback(() => {
    return `Build ${new Date().toISOString().slice(0, 10)}`
  }, [])

  const getPublishAccessToken = useCallback(async (): Promise<string | null> => {
    return auth.getAccessToken()
  }, [auth])

  const requestGuildName = useCallback((guildId: string): Promise<string | null> => {
    return new Promise((resolve) => {
      guildNamePromptResolveRef.current = resolve
      setGuildNamePrompt({ guildId, name: '' })
    })
  }, [])

  const resolveGuildNameForPublish = useCallback(
    async (guildId: string): Promise<string | null> => {
      const id = guildId.trim()
      if (!id) return null
      const resolved = await resolveGuildNameById(id)
      if (resolved) return resolved
      const proposed = await requestGuildName(id)
      const name = proposed?.trim() ?? ''
      if (!name || name.length > 40) return null
      const token = await auth.getAccessToken()
      if (!token) return null
      return registerGuildNameById(id, name, token)
    },
    [auth, requestGuildName],
  )

  const closeGuildNamePrompt = useCallback((value: string | null) => {
    const resolve = guildNamePromptResolveRef.current
    guildNamePromptResolveRef.current = null
    setGuildNamePrompt(null)
    resolve?.(value)
  }, [])

  const ensureSignedInForPublish = useCallback(async (): Promise<boolean> => {
    if (!supabaseBrowserConfigured()) {
      setImportNotice(t('gallery_error_unavailable'))
      return false
    }
    const token = await getPublishAccessToken()
    if (token) return true
    setImportNotice(t('auth_required_publish'))
    return false
  }, [getPublishAccessToken, setImportNotice, t])

  const ensurePublishCategorySelected = useCallback((): GalleryBuildCategory | null => {
    if (!publishCategory) {
      setImportNotice(t('gallery_error_invalid_category'))
      setCommunityPublishDialogOpen(true)
      return null
    }
    return publishCategory
  }, [publishCategory, setImportNotice, t])

  const copyEmbeddedShareLink = useCallback(async (): Promise<string | null> => {
    try {
      const encoded = await encodeLabsShareQueryValue(
        levelOverrides,
        workshopFlat,
        undefined,
        readTowerThemesSnapshot(),
      )
      const { clean } = buildLabsShareUrls(encoded, window.location.href)
      await navigator.clipboard.writeText(clean)
      return clean
    } catch {
      return null
    }
  }, [levelOverrides, workshopFlat])

  const publishAndCopyGalleryShareLink = useCallback(async (): Promise<boolean> => {
    const payload = getLabsShareFileForGallery()
    if (!payload) return false
    if (!towerGalleryApiAvailable()) {
      return (await copyEmbeddedShareLink()) != null
    }
    if (!(await ensureSignedInForPublish())) return false
    const category = ensurePublishCategorySelected()
    if (!category) return false
    const accessToken = await getPublishAccessToken()
    setSharePublishing(true)
    try {
      const result = await publishGalleryShareLink(
        payload,
        resolveShareTitle(),
        category,
        window.location.href,
        { accessToken, visibility: 'unlisted' },
      )
      if (!result.ok) {
        if (result.error === 'auth_required') {
          setImportNotice(t('auth_required_publish'))
          return false
        }
        return (await copyEmbeddedShareLink()) != null
      }
      await navigator.clipboard.writeText(result.url)
      return true
    } catch {
      return false
    } finally {
      setSharePublishing(false)
    }
  }, [
    copyEmbeddedShareLink,
    ensurePublishCategorySelected,
    ensureSignedInForPublish,
    getLabsShareFileForGallery,
    getPublishAccessToken,
    resolveShareTitle,
    setImportNotice,
    t,
  ])

  const copyBuildShareLink = useCallback(async (): Promise<boolean> => {
    if (!towerGalleryApiAvailable()) {
      return (await copyEmbeddedShareLink()) != null
    }
    return publishAndCopyGalleryShareLink()
  }, [copyEmbeddedShareLink, publishAndCopyGalleryShareLink])

  const openPublishDialog = useCallback(() => {
    void (async () => {
      if (!supabaseBrowserConfigured()) {
        setImportNotice(t('gallery_error_unavailable'))
        return
      }
      const token = await getPublishAccessToken()
      if (!token) {
        setAuthSignInDialogOpen(true)
        return
      }
      setPublishTitle('')
      setPublishGuildId(auth.guildId ?? '')
      setPublishVisibility('public')
      setCommunityPublishDialogOpen(true)
    })()
  }, [auth.guildId, getPublishAccessToken, setImportNotice, t])

  const closeCommunityPublishDialog = useCallback(() => {
    if (communityPublishSubmitting) return
    setCommunityPublishDialogOpen(false)
  }, [communityPublishSubmitting])

  const commitCommunityPublish = useCallback(async () => {
    const trimmedTitle = publishTitle.trim()
    if (!trimmedTitle) {
      setImportNotice(t('gallery_error_invalid_title'))
      return
    }
    if (!publishCategory) {
      setImportNotice(t('gallery_error_invalid_category'))
      return
    }
    const payload = getLabsShareFileForGallery()
    if (!payload) return
    const accessToken = await getPublishAccessToken()
    setCommunityPublishSubmitting(true)
    try {
      const guildId = publishGuildId.trim()
      let guildName: string | undefined
      if (guildId) {
        const resolved = await resolveGuildNameForPublish(guildId)
        if (resolved) guildName = resolved
        if (auth.user) {
          await updateUserGuildId(auth.user.id, guildId)
        }
      }
      const result = await publishGalleryShareLink(
        payload,
        trimmedTitle,
        publishCategory,
        window.location.href,
        {
          accessToken,
          ...(guildName ? { guild: guildName } : {}),
          visibility: publishVisibility,
        },
      )
      if (!result.ok) {
        const msg =
          result.error === 'auth_required'
            ? t('auth_required_publish')
            : result.error === 'invalid_title'
              ? t('gallery_error_invalid_title')
              : result.error === 'invalid_guild'
                ? t('gallery_error_invalid_guild')
                : result.error === 'invalid_category'
                  ? t('gallery_error_invalid_category')
                  : result.error === 'submissions_disabled'
                    ? t('gallery_error_disabled')
                    : result.error === 'gallery_unavailable'
                      ? t('gallery_error_unavailable')
                      : result.error === 'network'
                        ? t('gallery_error_network')
                        : t('gallery_error_unknown')
        setImportNotice(msg)
        return
      }
      await navigator.clipboard.writeText(result.url)
      setImportNotice(fmt.galleryNoticeSubmitted(result.title))
      setCommunityPublishDialogOpen(false)
      setPublishTitle('')
      setPublishGuildId('')
      setPublishVisibility('public')
    } catch {
      setImportNotice(t('gallery_error_unknown'))
    } finally {
      setCommunityPublishSubmitting(false)
    }
  }, [
    auth.user,
    fmt,
    getLabsShareFileForGallery,
    getPublishAccessToken,
    publishCategory,
    publishGuildId,
    publishTitle,
    publishVisibility,
    resolveGuildNameForPublish,
    setImportNotice,
    t,
  ])

  const copyCleanShareLink = useCallback(async () => {
    if (!towerGalleryApiAvailable()) {
      if (await copyEmbeddedShareLink()) {
        setImportNotice(t('sr_notice_copy_gallery_fallback'))
      } else {
        setImportNotice(t('sr_notice_copy_short_fail'))
      }
      return
    }
    if (!(await ensureSignedInForPublish())) return
    const category = ensurePublishCategorySelected()
    if (!category) return
    const accessToken = await getPublishAccessToken()
    setSharePublishing(true)
    const payload = getLabsShareFileForGallery()
    if (!payload) {
      setSharePublishing(false)
      setImportNotice(t('sr_notice_copy_short_fail'))
      return
    }
    try {
      const result = await publishGalleryShareLink(
        payload,
        resolveShareTitle(),
        category,
        window.location.href,
        { accessToken, visibility: 'unlisted' },
      )
      if (!result.ok) {
        if (result.error === 'auth_required') {
          setImportNotice(t('auth_required_publish'))
          return
        }
        if (await copyEmbeddedShareLink()) {
          setImportNotice(t('sr_notice_copy_gallery_fail'))
        } else {
          setImportNotice(t('sr_notice_copy_short_fail'))
        }
        return
      }
      await navigator.clipboard.writeText(result.url)
      setImportNotice(t('sr_notice_copy_gallery_ok'))
    } catch {
      setImportNotice(t('sr_notice_copy_short_fail'))
    } finally {
      setSharePublishing(false)
    }
  }, [
    copyEmbeddedShareLink,
    ensurePublishCategorySelected,
    ensureSignedInForPublish,
    getLabsShareFileForGallery,
    getPublishAccessToken,
    resolveShareTitle,
    setImportNotice,
    t,
  ])

  const publishForQrUrl = useCallback(async (): Promise<string | null> => {
    if (!towerGalleryApiAvailable()) return null
    if (!(await ensureSignedInForPublish())) return null
    const category = ensurePublishCategorySelected()
    if (!category) return null
    const payload = getLabsShareFileForGallery()
    if (!payload) return null
    const accessToken = await getPublishAccessToken()
    setSharePublishing(true)
    try {
      const result = await publishGalleryShareLink(
        payload,
        resolveShareTitle(),
        category,
        window.location.href,
        { accessToken, visibility: 'unlisted' },
      )
      if (!result.ok) {
        if (result.error === 'auth_required') {
          setImportNotice(t('auth_required_publish'))
        } else {
          setImportNotice(t('sr_notice_qr_fail'))
        }
        return null
      }
      return result.url
    } catch {
      setImportNotice(t('sr_notice_qr_fail'))
      return null
    } finally {
      setSharePublishing(false)
    }
  }, [
    ensurePublishCategorySelected,
    ensureSignedInForPublish,
    getLabsShareFileForGallery,
    getPublishAccessToken,
    resolveShareTitle,
    setImportNotice,
    t,
  ])

  const clearWorkspace = useCallback(() => {
    pushUndoSnapshot()
    const cleared = clearTowerWorkspace(workspace)
    applyTowerThemes(workspaceThemesSnapshot(cleared))
    setWorkspace(cleared)
    setScratchWorkspace(clearTowerWorkspace(scratchWorkspace))
    setImportNotice(t('sr_community_clear_done'))
  }, [
    pushUndoSnapshot,
    scratchWorkspace,
    setScratchWorkspace,
    setWorkspace,
    setImportNotice,
    t,
    workspace,
  ])

  useEffect(() => {
    const blocking =
      communityPublishDialogOpen || authSignInDialogOpen || guildNamePrompt !== null
    if (!blocking) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setCommunityPublishDialogOpen(false)
      setAuthSignInDialogOpen(false)
      if (guildNamePromptResolveRef.current) {
        guildNamePromptResolveRef.current(null)
        guildNamePromptResolveRef.current = null
      }
      setGuildNamePrompt(null)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [authSignInDialogOpen, communityPublishDialogOpen, guildNamePrompt])

  const prefillPublishGuildId = useCallback((guildId: string) => {
    setPublishGuildId(guildId)
  }, [])

  const value = useMemo(
    () => ({
      hydrated,
      sharePublishing,
      openPublishDialog,
      copyBuildShareLink,
      clearWorkspace,
      copyCleanShareLink,
      publishForQrUrl,
      prefillPublishGuildId,
      resolveGuildNameForPublish,
    }),
    [
      clearWorkspace,
      copyBuildShareLink,
      copyCleanShareLink,
      hydrated,
      openPublishDialog,
      prefillPublishGuildId,
      publishForQrUrl,
      resolveGuildNameForPublish,
      sharePublishing,
    ],
  )

  return (
    <CommunityBuildContext.Provider value={value}>
      {children}
      {communityPublishDialogOpen ? (
        <Suspense fallback={null}>
          <GalleryPublishDialog
            open
            title={publishTitle}
            guildId={publishGuildId}
            category={publishCategory}
            visibility={publishVisibility}
            submitting={communityPublishSubmitting}
            onTitleChange={setPublishTitle}
            onGuildIdChange={setPublishGuildId}
            onCategoryChange={setPublishCategory}
            onVisibilityChange={setPublishVisibility}
            onClose={closeCommunityPublishDialog}
            onSubmit={() => void commitCommunityPublish()}
            dialogTitleKey="sr_community_publish_title"
            submitLabelKey="sr_community_publish_submit"
          />
        </Suspense>
      ) : null}
      {authSignInDialogOpen ? (
        <Suspense fallback={null}>
          <AuthSignInDialog open onClose={() => setAuthSignInDialogOpen(false)} />
        </Suspense>
      ) : null}
      {guildNamePrompt ? (
        <Suspense fallback={null}>
          <LabGuildNamePromptDialog
            guildId={guildNamePrompt.guildId}
            name={guildNamePrompt.name}
            onNameChange={(name) =>
              setGuildNamePrompt((prev) => (prev ? { ...prev, name } : prev))
            }
            onCancel={() => closeGuildNamePrompt(null)}
            onSave={() => closeGuildNamePrompt(guildNamePrompt.name.trim() || null)}
          />
        </Suspense>
      ) : null}
    </CommunityBuildContext.Provider>
  )
}

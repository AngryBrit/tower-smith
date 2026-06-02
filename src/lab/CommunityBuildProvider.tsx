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
import {
  publishGalleryShareLink,
  type PublishGalleryShareResult,
} from '../towerGallery/publishShareLink'
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
import type { StringId } from '../i18n/dictionary'
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

type PublishFailureError = Extract<
  PublishGalleryShareResult,
  { ok: false }
>['error']

function publishFailureMessage(
  t: (id: StringId) => string,
  error: PublishFailureError,
): string {
  switch (error) {
    case 'auth_required':
      return t('auth_required_publish')
    case 'invalid_token':
      return t('auth_session_expired')
    case 'project_mismatch':
      return t('gallery_error_project_mismatch')
    case 'invalid_title':
      return t('gallery_error_invalid_title')
    case 'invalid_guild':
      return t('gallery_error_invalid_guild')
    case 'invalid_category':
      return t('gallery_error_invalid_category')
    case 'submissions_disabled':
      return t('gallery_error_disabled')
    case 'gallery_unavailable':
      return t('gallery_error_unavailable')
    case 'network':
      return t('gallery_error_network')
    default:
      return t('gallery_error_unknown')
  }
}

export function CommunityBuildProvider({ children }: { children: ReactNode }) {
  const { t, fmt } = useI18n()
  const { hydrated, publishImportNotice } = useLabHydration()
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
      publishImportNotice(t('gallery_error_unavailable'), 'error')
      return false
    }
    const token = await getPublishAccessToken()
    if (token) return true
    if (auth.user) {
      publishImportNotice(t('auth_session_expired'), 'error')
    } else {
      setAuthSignInDialogOpen(true)
      publishImportNotice(t('auth_required_publish'), 'error')
    }
    return false
  }, [auth.user, getPublishAccessToken, publishImportNotice, t])

  const ensurePublishCategorySelected = useCallback((): GalleryBuildCategory | null => {
    if (!publishCategory) {
      publishImportNotice(t('gallery_error_invalid_category'), 'error')
      setCommunityPublishDialogOpen(true)
      return null
    }
    return publishCategory
  }, [publishCategory, publishImportNotice, t])

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
        if (
          result.error === 'auth_required' ||
          result.error === 'invalid_token' ||
          result.error === 'project_mismatch'
        ) {
          publishImportNotice(publishFailureMessage(t, result.error), 'error')
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
    publishImportNotice,
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
        publishImportNotice(t('gallery_error_unavailable'), 'error')
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
  }, [auth.guildId, getPublishAccessToken, publishImportNotice, t])

  const closeCommunityPublishDialog = useCallback(() => {
    if (communityPublishSubmitting) return
    setCommunityPublishDialogOpen(false)
  }, [communityPublishSubmitting])

  const commitCommunityPublish = useCallback(async () => {
    const trimmedTitle = publishTitle.trim()
    if (!trimmedTitle) {
      publishImportNotice(t('gallery_error_invalid_title'), 'error')
      return
    }
    if (!publishCategory) {
      publishImportNotice(t('gallery_error_invalid_category'), 'error')
      return
    }
    if (!(await ensureSignedInForPublish())) return
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
        publishImportNotice(publishFailureMessage(t, result.error), 'error')
        return
      }
      await navigator.clipboard.writeText(result.url)
      publishImportNotice(fmt.galleryNoticeSubmitted(result.title), 'success')
      setCommunityPublishDialogOpen(false)
      setPublishTitle('')
      setPublishGuildId('')
      setPublishVisibility('public')
    } catch {
      publishImportNotice(t('gallery_error_unknown'), 'error')
    } finally {
      setCommunityPublishSubmitting(false)
    }
  }, [
    auth.user,
    fmt,
    ensureSignedInForPublish,
    getLabsShareFileForGallery,
    getPublishAccessToken,
    publishCategory,
    publishGuildId,
    publishTitle,
    publishVisibility,
    resolveGuildNameForPublish,
    publishImportNotice,
    t,
  ])

  const copyCleanShareLink = useCallback(async () => {
    if (!towerGalleryApiAvailable()) {
      if (await copyEmbeddedShareLink()) {
        publishImportNotice(t('sr_notice_copy_gallery_fallback'), 'info')
      } else {
        publishImportNotice(t('sr_notice_copy_short_fail'), 'error')
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
      publishImportNotice(t('sr_notice_copy_short_fail'), 'error')
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
        if (
          result.error === 'auth_required' ||
          result.error === 'invalid_token' ||
          result.error === 'project_mismatch'
        ) {
          publishImportNotice(publishFailureMessage(t, result.error), 'error')
          return
        }
        if (await copyEmbeddedShareLink()) {
          publishImportNotice(t('sr_notice_copy_gallery_fail'), 'error')
        } else {
          publishImportNotice(t('sr_notice_copy_short_fail'), 'error')
        }
        return
      }
      await navigator.clipboard.writeText(result.url)
      publishImportNotice(t('sr_notice_copy_gallery_ok'), 'success')
    } catch {
      publishImportNotice(t('sr_notice_copy_short_fail'), 'error')
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
    publishImportNotice,
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
        if (
          result.error === 'auth_required' ||
          result.error === 'invalid_token' ||
          result.error === 'project_mismatch'
        ) {
          publishImportNotice(publishFailureMessage(t, result.error), 'error')
        } else {
          publishImportNotice(t('sr_notice_qr_fail'), 'error')
        }
        return null
      }
      return result.url
    } catch {
      publishImportNotice(t('sr_notice_qr_fail'), 'error')
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
    publishImportNotice,
    t,
  ])

  const clearWorkspace = useCallback(() => {
    pushUndoSnapshot()
    const cleared = clearTowerWorkspace(workspace)
    applyTowerThemes(workspaceThemesSnapshot(cleared))
    setWorkspace(cleared)
    setScratchWorkspace(clearTowerWorkspace(scratchWorkspace))
    publishImportNotice(t('sr_community_clear_done'), 'success')
  }, [
    pushUndoSnapshot,
    scratchWorkspace,
    setScratchWorkspace,
    setWorkspace,
    publishImportNotice,
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

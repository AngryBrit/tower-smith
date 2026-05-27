import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../auth/AuthProvider'
import { CommunityBuildRow } from './CommunityBuildRow'
import { AuthSignInDialog } from './AuthSignInDialog'
import { GalleryPublishDialog } from './GalleryPublishDialog'
import { supabaseBrowserConfigured } from '../supabase/client'
import { APP_VERSION, CHANGELOG_URL, SPONSOR_URL } from '../appVersion'
import { useBudgetPanelsVisible } from '../budgetPanelsVisibility'
import { buildLabDomIdTables, getLabSlugFromUrl } from '../labSlug'
import {
  buildLabsShareFile,
  buildLabsShareUrls,
  decodeLabsShareQueryValue,
  encodeLabsShareQueryValue,
  clearShareEncodedFromUrl,
  readShareEncodedFromUrlSearchParams,
  type LabsShareFile,
} from '../labsShareCodec'
import {
  computeSimulatorCoinAggregates,
  formatSimulatorCoinAggregates,
  maxVisibleLabLevels,
} from '../labBudgetAggregates'
import { importPlayerInfoDat } from '../playerSave/importPlayerInfo'
import { updateUserGuildId, updateUserPlayfabId } from '../profile/profileApi'
import {
  getGalleryTower,
  registerGuildNameById,
  resolveGuildNameById,
  towerGalleryApiAvailable,
} from '../towerGallery/api'
import { publishGalleryShareLink } from '../towerGallery/publishShareLink'
import type { GalleryBuildCategory } from '../towerGallery/buildCategories'
import type { GalleryBuildVisibility } from '../towerGallery/types'
import {
  clearGalleryBuildIdFromUrl,
  readGalleryBuildIdFromUrlSearchParams,
} from '../towerGallery/shareLink'
import {
  parseTowerUnifiedCsv,
  serializeTowerUnifiedCsv,
  towerUnifiedPrimaryBuild,
} from '../towerUnifiedCsv'
import {
  applyTowerThemes,
  readTowerThemesSnapshot,
  sanitizeThemeOwnedIds,
} from '../towerDataThemes'
import { sanitizeLevelOverrides } from '../labLevelOverridesSanitize'
import {
  parseLabPresetsFile,
  sanitizeWorkshopPersisted,
} from '../labPresetsStorage'
import { useTowerWorkspaceContext } from '../TowerBuildContext'
import {
  clearTowerWorkspace,
  defaultTowerWorkspace,
  mergeWorkspaceBuild,
  syncWorkspaceThemesFromStorage,
  workspaceThemesSnapshot,
} from '../towerWorkspaceStorage'
import { splitTowerBuild } from '../towerBuildStorage'
import {
  buildLabPresetsPayloadWithWorkspace,
  readTowerWorkspaceFromPresetsFile,
} from '../towerWorkspacePresets'
import type { ResearchData } from '../types/research'
import { combinedLabsSpeedMultiplier } from '../data/workshopRelicWorkshopDisplay'
import {
  getLevelBounds,
  levelOverrideKey,
  resolveLabsCoinDiscountPercent,
  resolveLabsSpeedMultiplier,
} from '../types/research'
import { LabCompareDialog } from './LabCompareDialog'
import { ResearchSection } from './ResearchSection'
import { useI18n, type AppLocale } from '../i18n'

/** Survives React Strict Mode remount so initial `?lab=` / `#` runs once per full load. */
let initialLabUrlNavigationConsumed = false

export type SelectResearchHandle = {
  openLabDataPanel: () => void
  openCompareDialog: () => void
  getLabsShareFile: () => LabsShareFile | null
  applyLabsShareFile: (file: LabsShareFile) => boolean
}

interface SelectResearchProps {
  data: ResearchData
  /** When true, omit outer panel chrome and site footer (parent provides shell + footer). */
  embeddedInPanel?: boolean
  /** In-panel: render BUILD row into this node so it stays visible on Workshop tab. */
  embeddedPresetsMount?: HTMLElement | null
}

/** Legacy single-map storage; read once to migrate when `LAB_PRESETS_STORAGE_KEY` is absent. */
const LEVEL_OVERRIDES_STORAGE_KEY = 'tower-export-level-overrides-v1'
const LAB_PRESETS_STORAGE_KEY = 'tower-export-lab-presets-v1'
const SECTION_COLLAPSED_STORAGE_KEY = 'tower-export-section-collapsed-v1'
const LAB_BUDGET_COLLAPSED_STORAGE_KEY = 'tower-export-lab-budget-collapsed-v1'
const BULK_SECTIONS_TOGGLE_ID = 'tower-bulk-sections-collapsed-toggle'

function labOverlayPortal(node: ReactNode) {
  return createPortal(node, document.body)
}

function LabToolbarQuick({
  hideCompleted,
  setHideCompleted,
  onMaxAll,
  onResetLevels,
}: {
  hideCompleted: boolean
  setHideCompleted: (v: boolean) => void
  onMaxAll: () => void
  onResetLevels: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="select-research__toolbar-quick">
      <label className="glow-btn glow-btn--toggle">
        <input
          type="checkbox"
          checked={hideCompleted}
          onChange={(e) => setHideCompleted(e.target.checked)}
        />
        {t('sr_hide_completed')}
      </label>
      <button
        type="button"
        className="glow-btn glow-btn--block"
        onClick={onMaxAll}
        aria-label={t('sr_max_all_aria')}
      >
        {t('sr_max_all')}
      </button>
      <button
        type="button"
        className="glow-btn glow-btn--danger glow-btn--block"
        onClick={onResetLevels}
      >
        {t('sr_reset_lab_levels')}
      </button>
    </div>
  )
}

function sanitizeSectionCollapsed(
  sectionCount: number,
  raw: Record<string, unknown>,
): Record<number, boolean> {
  const out: Record<number, boolean> = {}
  for (const [key, val] of Object.entries(raw)) {
    const si = Number(key)
    if (!Number.isInteger(si) || si < 0 || si >= sectionCount) continue
    if (val === true) out[si] = true
  }
  return out
}

export const SelectResearch = forwardRef<
  SelectResearchHandle,
  SelectResearchProps
>(function SelectResearch(
  {
    data,
    embeddedInPanel = false,
    embeddedPresetsMount = null,
  },
  ref,
) {
  const { t, fmt, locale, setLocale } = useI18n()
  const {
    workspace,
    setWorkspace,
    scratchWorkspace,
    setScratchWorkspace,
    labLevelOverrides: levelOverrides,
    setLabLevelOverrides: setLevelOverrides,
    workshopFlat,
  } = useTowerWorkspaceContext()
  const auth = useAuth()
  const [budgetPanelsVisible] = useBudgetPanelsVisible()
  const labBudgetBodyId = useId().replace(/:/g, '')
  const [search, setSearch] = useState('')
  const [hideCompleted, setHideCompleted] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})
  const [hydrated, setHydrated] = useState(false)
  const [importNotice, setImportNotice] = useState<string | null>(null)
  const [shareQr, setShareQr] = useState<{
    dataUrl: string
    url: string
  } | null>(null)
  const [resetLevelsConfirmOpen, setResetLevelsConfirmOpen] = useState(false)
  const [labDataPanelOpen, setLabDataPanelOpen] = useState(false)
  const [labCompareOpen, setLabCompareOpen] = useState(false)
  const [sharePublishing, setSharePublishing] = useState(false)
  const [communityPublishDialogOpen, setCommunityPublishDialogOpen] =
    useState(false)
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
  const [communityPublishSubmitting, setCommunityPublishSubmitting] =
    useState(false)
  const [labBudgetCollapsed, setLabBudgetCollapsed] = useState(() => {
    try {
      return localStorage.getItem(LAB_BUDGET_COLLAPSED_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const importLabCsvFileInputRef = useRef<HTMLInputElement>(null)
  const importPlayerInfoFileInputRef = useRef<HTMLInputElement>(null)
  const bulkAllSectionsToggleRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const pendingLabScrollSlug = useRef<string | null>(null)
  const guildNamePromptResolveRef = useRef<((value: string | null) => void) | null>(null)
  const [scrollLayoutGen, setScrollLayoutGen] = useState(0)

  useEffect(() => {
    if (!importNotice) return
    const t = window.setTimeout(() => setImportNotice(null), 5000)
    return () => window.clearTimeout(t)
  }, [importNotice])

  useEffect(() => {
    try {
      localStorage.setItem(
        LAB_BUDGET_COLLAPSED_STORAGE_KEY,
        labBudgetCollapsed ? '1' : '0',
      )
    } catch {
      /* ignore quota / private mode */
    }
  }, [labBudgetCollapsed])

  useEffect(() => {
    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.repeat) return
      if (e.target === searchInputRef.current) return
      const t = e.target
      if (t instanceof HTMLElement && t.isContentEditable) return
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement
      ) {
        return
      }
      e.preventDefault()
      const el = searchInputRef.current
      if (!el) return
      el.focus()
      el.select()
    }
    document.addEventListener('keydown', onDocKeyDown)
    return () => document.removeEventListener('keydown', onDocKeyDown)
  }, [])

  useEffect(() => {
    const blocking =
      shareQr !== null ||
      resetLevelsConfirmOpen ||
      labDataPanelOpen ||
      labCompareOpen ||
      communityPublishDialogOpen ||
      authSignInDialogOpen ||
      guildNamePrompt !== null
    if (!blocking) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setShareQr(null)
      setResetLevelsConfirmOpen(false)
      setLabDataPanelOpen(false)
      setLabCompareOpen(false)
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
  }, [
    shareQr,
    resetLevelsConfirmOpen,
    labDataPanelOpen,
    labCompareOpen,
    communityPublishDialogOpen,
    authSignInDialogOpen,
    guildNamePrompt,
  ])

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

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      const loadPersistedLabState = () => {
        const empty = {
          workspace: defaultTowerWorkspace(),
          scratchWorkspace: defaultTowerWorkspace(),
        }
        try {
          const rawNew = localStorage.getItem(LAB_PRESETS_STORAGE_KEY)
          if (rawNew) {
            const parsed = parseLabPresetsFile(JSON.parse(rawNew))
            if (parsed) {
              return readTowerWorkspaceFromPresetsFile(parsed)
            }
          }
        } catch {
          /* ignore corrupt storage */
        }
        try {
          const rawJson = localStorage.getItem(LEVEL_OVERRIDES_STORAGE_KEY)
          if (rawJson) {
            const parsed: unknown = JSON.parse(rawJson)
            if (
              parsed &&
              typeof parsed === 'object' &&
              'levelOverrides' in parsed
            ) {
              const lo = (parsed as { levelOverrides?: unknown }).levelOverrides
              if (lo && typeof lo === 'object' && !Array.isArray(lo)) {
                const levelOverrides = sanitizeLevelOverrides(
                  data,
                  lo as Record<string, unknown>,
                )
                return {
                  workspace: {
                    ...defaultTowerWorkspace(),
                    lab: { levelOverrides },
                  },
                  scratchWorkspace: {
                    ...defaultTowerWorkspace(),
                    lab: { levelOverrides },
                  },
                }
              }
            }
          }
        } catch {
          /* ignore corrupt storage */
        }
        return empty
      }

      const applySectionCollapsedFromStorage = () => {
        try {
          const rawJson = localStorage.getItem(SECTION_COLLAPSED_STORAGE_KEY)
          if (!rawJson || cancelled) return
          const parsed: unknown = JSON.parse(rawJson)
          if (
            !parsed ||
            typeof parsed !== 'object' ||
            !('collapsed' in parsed)
          ) {
            return
          }
          const c = (parsed as { collapsed?: unknown }).collapsed
          if (!c || typeof c !== 'object' || Array.isArray(c)) return
          if (!cancelled) {
            setCollapsed(
              sanitizeSectionCollapsed(
                data.sections.length,
                c as Record<string, unknown>,
              ),
            )
          }
        } catch {
          /* ignore corrupt storage */
        }
      }

      const persistedLabs = loadPersistedLabState()

      try {
        const params = new URLSearchParams(window.location.search)

        const galleryBuildId = readGalleryBuildIdFromUrlSearchParams(params)
        if (galleryBuildId) {
          const gallery = await getGalleryTower(galleryBuildId)
          const payload = gallery.ok ? gallery.record.payload : null
          if (payload?.o && !cancelled) {
            const sanitized = sanitizeLevelOverrides(
              data,
              payload.o as Record<string, unknown>,
            )
            const workshopFromLink = payload.w !== undefined
            const sharedBuildName =
              typeof payload.n === 'string'
                ? payload.n.trim()
                : gallery.ok
                  ? gallery.record.title
                  : undefined
            let nextWorkspace = persistedLabs.workspace
            let nextScratchWorkspace = persistedLabs.scratchWorkspace
            if (workshopFromLink) {
              const build = splitTowerBuild(sanitizeWorkshopPersisted(payload.w))
              nextWorkspace = mergeWorkspaceBuild(nextWorkspace, build)
              nextScratchWorkspace = mergeWorkspaceBuild(nextScratchWorkspace, build)
            }
            if (payload.t) {
              applyTowerThemes({
                ownedIds: sanitizeThemeOwnedIds(payload.t.owned),
              })
            }
            const lab = { levelOverrides: sanitized }
            setLevelOverrides(sanitized)
            setWorkspace({ ...nextWorkspace, lab })
            setScratchWorkspace({ ...nextScratchWorkspace, lab })
            applySectionCollapsedFromStorage()
            const url = new URL(window.location.href)
            clearGalleryBuildIdFromUrl(url)
            clearShareEncodedFromUrl(url)
            window.history.replaceState(null, '', url.pathname + url.search + url.hash)
            const n = Object.keys(sanitized).length
            setImportNotice(
              fmt.shareOpenedLevels(n, workshopFromLink, sharedBuildName),
            )
            setHydrated(true)
            return
          }
        }

        const share = readShareEncodedFromUrlSearchParams(params)
        if (share) {
          const payload = await decodeLabsShareQueryValue(share)
          if (payload?.o && !cancelled) {
            const sanitized = sanitizeLevelOverrides(
              data,
              payload.o as Record<string, unknown>,
            )
            const workshopFromLink = payload.w !== undefined
            const sharedBuildName =
              typeof payload.n === 'string' ? payload.n.trim() : undefined
            let nextWorkspace = persistedLabs.workspace
            let nextScratchWorkspace = persistedLabs.scratchWorkspace
            if (workshopFromLink) {
              const build = splitTowerBuild(sanitizeWorkshopPersisted(payload.w))
              nextWorkspace = mergeWorkspaceBuild(nextWorkspace, build)
              nextScratchWorkspace = mergeWorkspaceBuild(nextScratchWorkspace, build)
            }
            if (payload.t) {
              applyTowerThemes({
                ownedIds: sanitizeThemeOwnedIds(payload.t.owned),
              })
            }
            const lab = { levelOverrides: sanitized }
            setLevelOverrides(sanitized)
            setWorkspace({ ...nextWorkspace, lab })
            setScratchWorkspace({ ...nextScratchWorkspace, lab })
            applySectionCollapsedFromStorage()
            const url = new URL(window.location.href)
            clearShareEncodedFromUrl(url)
            window.history.replaceState(null, '', url.pathname + url.search + url.hash)
            const n = Object.keys(sanitized).length
            setImportNotice(
              fmt.shareOpenedLevels(n, workshopFromLink, sharedBuildName),
            )
            setHydrated(true)
            return
          }
        }
      } catch {
        /* ignore corrupt share payload */
      }

      if (!cancelled) {
        const sanitizeWorkspaceLab = (ws: ReturnType<typeof defaultTowerWorkspace>) => ({
          ...ws,
          lab: {
            levelOverrides: sanitizeLevelOverrides(
              data,
              ws.lab.levelOverrides as Record<string, unknown>,
            ),
          },
        })
        setWorkspace(sanitizeWorkspaceLab(persistedLabs.workspace))
        setScratchWorkspace(sanitizeWorkspaceLab(persistedLabs.scratchWorkspace))
      }

      applySectionCollapsedFromStorage()

      if (!cancelled) setHydrated(true)
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [data, fmt, setScratchWorkspace, setWorkspace])

  useEffect(() => {
    if (!hydrated) return
    try {
      const payload = buildLabPresetsPayloadWithWorkspace(
        null,
        [],
        syncWorkspaceThemesFromStorage(workspace),
        syncWorkspaceThemesFromStorage(scratchWorkspace),
      )
      localStorage.setItem(
        LAB_PRESETS_STORAGE_KEY,
        JSON.stringify(payload),
      )
    } catch {
      /* quota / private mode */
    }
  }, [hydrated, workspace, scratchWorkspace])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(
        SECTION_COLLAPSED_STORAGE_KEY,
        JSON.stringify({ v: 1, collapsed }),
      )
    } catch {
      /* quota / private mode */
    }
  }, [collapsed, hydrated])

  const labsCoinDiscountPercent = useMemo(
    () => resolveLabsCoinDiscountPercent(data, levelOverrides),
    [data, levelOverrides],
  )

  const relicOwnedSet = useMemo(
    () => new Set(workshopFlat.relicOwnedIds),
    [workshopFlat.relicOwnedIds],
  )

  const labsSpeedMultiplier = useMemo(
    () =>
      combinedLabsSpeedMultiplier(
        resolveLabsSpeedMultiplier(data, levelOverrides),
        relicOwnedSet,
      ),
    [data, levelOverrides, relicOwnedSet],
  )

  const { labDomIdsBySection, labSlugToPosition } = useMemo(
    () => buildLabDomIdTables(data),
    [data],
  )

  const simulatorCoinAggregates = useMemo(
    () =>
      computeSimulatorCoinAggregates(
        data,
        levelOverrides,
        labsCoinDiscountPercent,
        search,
        hideCompleted,
        collapsed,
      ),
    [
      data,
      levelOverrides,
      labsCoinDiscountPercent,
      search,
      hideCompleted,
      collapsed,
    ],
  )

  const simulatorCoinLabels = useMemo(
    () => formatSimulatorCoinAggregates(simulatorCoinAggregates),
    [simulatorCoinAggregates],
  )

  const requestLabScroll = useCallback(
    (slug: string) => {
      if (!labSlugToPosition.has(slug)) return
      const { si } = labSlugToPosition.get(slug)!
      pendingLabScrollSlug.current = slug
      setCollapsed((prev) => {
        if (!prev[si]) return prev
        const next = { ...prev }
        delete next[si]
        return next
      })
      setSearch('')
      setHideCompleted(false)
      setScrollLayoutGen((g) => g + 1)
    },
    [labSlugToPosition],
  )

  useLayoutEffect(() => {
    const slug = pendingLabScrollSlug.current
    if (!slug) return
    const el = document.getElementById(slug)
    if (!el) {
      pendingLabScrollSlug.current = null
      return
    }
    if (el.classList.contains('research-card--hidden')) {
      return
    }
    pendingLabScrollSlug.current = null
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [collapsed, search, hideCompleted, scrollLayoutGen])

  useEffect(() => {
    if (!hydrated) return
    if (initialLabUrlNavigationConsumed) return
    initialLabUrlNavigationConsumed = true
    const slug = getLabSlugFromUrl()
    if (!slug) return
    queueMicrotask(() => {
      requestLabScroll(slug)
    })
  }, [hydrated, requestLabScroll])

  useEffect(() => {
    const onHashChange = () => {
      const slug = getLabSlugFromUrl()
      if (slug) requestLabScroll(slug)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [requestLabScroll])

  const adjustLevel = useCallback(
    (sectionIndex: number, itemIndex: number, delta: number) => {
      setLevelOverrides((prev) => {
        const item = data.sections[sectionIndex]?.items[itemIndex]
        if (!item) return prev
        const bounds = getLevelBounds(item)
        const key = levelOverrideKey(sectionIndex, itemIndex)
        const prior =
          prev[key] !== undefined ? prev[key] : bounds.current
        const raw = prior + delta
        const capped =
          bounds.max > 0
            ? Math.max(0, Math.min(bounds.max, raw))
            : Math.max(0, raw)
        return { ...prev, [key]: capped }
      })
    },
    [data.sections],
  )

  const setLevel = useCallback(
    (sectionIndex: number, itemIndex: number, level: number) => {
      setLevelOverrides((prev) => {
        const item = data.sections[sectionIndex]?.items[itemIndex]
        if (!item) return prev
        const bounds = getLevelBounds(item)
        const key = levelOverrideKey(sectionIndex, itemIndex)
        const rounded = Math.round(level)
        const capped =
          bounds.max > 0
            ? Math.max(0, Math.min(bounds.max, rounded))
            : Math.max(0, rounded)
        return { ...prev, [key]: capped }
      })
    },
    [data.sections],
  )

  const toggleSection = useCallback((index: number) => {
    setCollapsed((prev) => {
      if (prev[index]) {
        const next = { ...prev }
        delete next[index]
        return next
      }
      return { ...prev, [index]: true }
    })
  }, [])

  const expandAllSections = useCallback(() => {
    setCollapsed({})
  }, [])

  const collapseAllSections = useCallback(() => {
    const n = data.sections.length
    if (n === 0) return
    const next: Record<number, boolean> = {}
    for (let i = 0; i < n; i += 1) next[i] = true
    setCollapsed(next)
  }, [data.sections.length])

  const sectionCount = data.sections.length
  const { allSectionsCollapsed, bulkSectionsToggleMixed } = useMemo(() => {
    let collapsedCount = 0
    for (let i = 0; i < sectionCount; i += 1) {
      if (collapsed[i]) collapsedCount += 1
    }
    return {
      allSectionsCollapsed:
        sectionCount > 0 && collapsedCount === sectionCount,
      bulkSectionsToggleMixed:
        collapsedCount > 0 && collapsedCount < sectionCount,
    }
  }, [collapsed, sectionCount])

  useLayoutEffect(() => {
    const el = bulkAllSectionsToggleRef.current
    if (!el) return
    el.indeterminate = bulkSectionsToggleMixed
  }, [bulkSectionsToggleMixed])

  const handleBulkSectionsToggleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        collapseAllSections()
      } else {
        expandAllSections()
      }
    },
    [collapseAllSections, expandAllSections],
  )

  const performResetLevels = useCallback(() => {
    setResetLevelsConfirmOpen(false)
    setLevelOverrides({})
    setImportNotice(t('sr_notice_reset_all'))
  }, [t])

  const handleExportLevels = useCallback(() => {
    const date = new Date().toISOString().slice(0, 10)
    const themes = readTowerThemesSnapshot()
    const csv = serializeTowerUnifiedCsv(
      levelOverrides,
      workshopFlat,
      undefined,
      themes,
    )
    const blob = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tower-export-${date}.csv`
    a.rel = 'noopener'
    a.click()
    URL.revokeObjectURL(url)
  }, [levelOverrides, workshopFlat])

  const getLabsShareFileForGallery = useCallback((): LabsShareFile | null => {
    if (!hydrated) return null
    return buildLabsShareFile(
      levelOverrides,
      workshopFlat,
      undefined,
      readTowerThemesSnapshot(),
    )
  }, [hydrated, levelOverrides, workshopFlat])

  const applyLabsShareFileFromGallery = useCallback(
    (file: LabsShareFile): boolean => {
      if (!hydrated) return false
      try {
        const sanitized = sanitizeLevelOverrides(
          data,
          file.o as Record<string, unknown>,
        )
        const ws =
          file.w !== undefined
            ? sanitizeWorkshopPersisted(file.w)
            : workshopFlat
        if (file.t) {
          applyTowerThemes({ ownedIds: sanitizeThemeOwnedIds(file.t.owned) })
        }
        setLevelOverrides(sanitized)
        const build = splitTowerBuild(ws)
        setWorkspace((prev) => mergeWorkspaceBuild({ ...prev, lab: { levelOverrides: sanitized } }, build))
        setScratchWorkspace((prev) => mergeWorkspaceBuild({ ...prev, lab: { levelOverrides: sanitized } }, build))
        const buildName = file.n?.trim()
        setImportNotice(
          buildName
            ? fmt.importedTowerBuildNamed(buildName)
            : t('sr_notice_import_tower_ok'),
        )
        return true
      } catch {
        return false
      }
    },
    [data, fmt, hydrated, setScratchWorkspace, setWorkspace, t, workshopFlat],
  )

  const resolveShareTitle = useCallback(() => {
    return `Build ${new Date().toISOString().slice(0, 10)}`
  }, [])

  const getPublishAccessToken = useCallback(async (): Promise<string | null> => {
    return auth.getAccessToken()
  }, [auth])

  const ensureSignedInForPublish = useCallback(async (): Promise<boolean> => {
    if (!supabaseBrowserConfigured()) {
      setImportNotice(t('gallery_error_unavailable'))
      return false
    }
    const token = await getPublishAccessToken()
    if (token) return true
    setImportNotice(t('auth_required_publish'))
    return false
  }, [getPublishAccessToken, t])

  const ensurePublishCategorySelected = useCallback((): GalleryBuildCategory | null => {
    if (!publishCategory) {
      setImportNotice(t('gallery_error_invalid_category'))
      setCommunityPublishDialogOpen(true)
      return null
    }
    return publishCategory
  }, [publishCategory, t])

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
    t,
  ])

  const handleCopyBuildShareLink = useCallback(async (): Promise<boolean> => {
    if (!towerGalleryApiAvailable()) {
      return (await copyEmbeddedShareLink()) != null
    }
    return publishAndCopyGalleryShareLink()
  }, [copyEmbeddedShareLink, publishAndCopyGalleryShareLink])

  const handleCopyCleanShareLink = useCallback(async () => {
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
    t,
  ])

  const handleShowShareQr = useCallback(async () => {
    if (!towerGalleryApiAvailable()) {
      setImportNotice(t('sr_notice_qr_fail'))
      return
    }
    if (!(await ensureSignedInForPublish())) return
    const category = ensurePublishCategorySelected()
    if (!category) return
    const payload = getLabsShareFileForGallery()
    if (!payload) {
      setImportNotice(t('sr_notice_qr_fail'))
      return
    }
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
        return
      }
      const QRCode = (await import('qrcode')).default
      const dataUrl = await QRCode.toDataURL(result.url, {
        width: 220,
        margin: 2,
        color: { dark: '#0f172a', light: '#e0f2fe' },
      })
      setShareQr({ dataUrl, url: result.url })
    } catch {
      setImportNotice(t('sr_notice_qr_fail'))
    } finally {
      setSharePublishing(false)
    }
  }, [
    ensurePublishCategorySelected,
    ensureSignedInForPublish,
    getLabsShareFileForGallery,
    getPublishAccessToken,
    resolveShareTitle,
    t,
  ])

  const handleImportPlayerInfoFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target
      const file = input.files?.[0]
      input.value = ''
      if (!file) return
      try {
        const buf = new Uint8Array(await file.arrayBuffer())
        const imported = await importPlayerInfoDat(buf, data)
        if (!imported.ok) {
          if (imported.error === 'gzip_unsupported') {
            setImportNotice(t('sr_notice_import_player_gzip_unsupported'))
          } else {
            setImportNotice(t('sr_notice_import_player_invalid'))
          }
          return
        }
        const sanitized = imported.overrides
        setLevelOverrides(sanitized)
        const build = splitTowerBuild(imported.workshop)
        setWorkspace((prev) => mergeWorkspaceBuild({ ...prev, lab: { levelOverrides: sanitized } }, build))
        setScratchWorkspace((prev) => mergeWorkspaceBuild({ ...prev, lab: { levelOverrides: sanitized } }, build))
        applyTowerThemes(imported.themes)
        let shouldRefreshProfile = false
        if (imported.guild) {
          setPublishGuildId(imported.guild)
          const knownGuild = await resolveGuildNameById(imported.guild)
          if (!knownGuild && auth.user) {
            await resolveGuildNameForPublish(imported.guild)
          }
          if (auth.user) {
            const updated = await updateUserGuildId(auth.user.id, imported.guild)
            if (updated.ok) shouldRefreshProfile = true
          }
        }
        if (auth.user && imported.playfabId) {
          await updateUserPlayfabId(auth.user.id, imported.playfabId)
          shouldRefreshProfile = true
        }
        if (auth.user && shouldRefreshProfile) {
          await auth.refreshProfile()
        }
        auth.prefillProfileFromImport({
          displayName: imported.fakeUserName ?? imported.userName,
        })
        setImportNotice(t('sr_notice_import_player_ok'))
      } catch {
        setImportNotice(t('sr_notice_import_read_fail'))
      }
    },
    [auth, data, resolveGuildNameForPublish, setScratchWorkspace, setWorkspace, t],
  )

  const handleImportLabCsvFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target
      const file = input.files?.[0]
      input.value = ''
      if (!file) return
      try {
        const text = await file.text()
        const tower = parseTowerUnifiedCsv(text)
        if (tower.tag === 'invalid') {
          setImportNotice(t('sr_notice_import_invalid_tower_csv'))
          return
        }
        if (tower.tag === 'ok') {
          if (tower.themes) applyTowerThemes(tower.themes)
          const primary = towerUnifiedPrimaryBuild(tower)
          const sanitized = sanitizeLevelOverrides(
            data,
            primary.overrides as Record<string, unknown>,
          )
          setLevelOverrides(sanitized)
          const build = splitTowerBuild(primary.workshop)
          setWorkspace((prev) => mergeWorkspaceBuild({ ...prev, lab: { levelOverrides: sanitized } }, build))
          setScratchWorkspace((prev) => mergeWorkspaceBuild({ ...prev, lab: { levelOverrides: sanitized } }, build))
          const buildName = primary.name?.trim()
          setImportNotice(
            buildName
              ? fmt.importedTowerBuildNamed(buildName)
              : t('sr_notice_import_tower_ok'),
          )
          return
        }
        setImportNotice(t('sr_notice_import_invalid_tower_csv'))
      } catch {
        setImportNotice(t('sr_notice_import_read_fail'))
      }
    },
    [data, fmt, setScratchWorkspace, setWorkspace, t],
  )

  const openCommunityPublishDialog = useCallback(() => {
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
  }, [auth.guildId, getPublishAccessToken, t])

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
    fmt,
    getLabsShareFileForGallery,
    getPublishAccessToken,
    publishCategory,
    auth.user,
    publishGuildId,
    publishVisibility,
    publishTitle,
    resolveGuildNameForPublish,
    t,
  ])

  const handleClearWorkspace = useCallback(() => {
    const cleared = clearTowerWorkspace(workspace)
    applyTowerThemes(workspaceThemesSnapshot(cleared))
    setWorkspace(cleared)
    setScratchWorkspace(clearTowerWorkspace(scratchWorkspace))
    setImportNotice(t('sr_community_clear_done'))
  }, [scratchWorkspace, setScratchWorkspace, setWorkspace, t, workspace])

  const maxAllVisibleLabs = useCallback(() => {
    setLevelOverrides((prev) =>
      maxVisibleLabLevels(data, prev, search, hideCompleted, collapsed),
    )
  }, [collapsed, data, hideCompleted, search])

  const openResetLevelsConfirm = useCallback(() => {
    setShareQr(null)
    setLabDataPanelOpen(false)
    setLabCompareOpen(false)
    setResetLevelsConfirmOpen(true)
  }, [])

  const searchFieldId = 'select-research-search'
  const searchSlashHintId = 'select-research-search-slash-hint'

  const presetsBarInline =
    !embeddedInPanel || embeddedPresetsMount === null

  useImperativeHandle(
    ref,
    () => ({
      openLabDataPanel: () => {
        if (!hydrated) return
        setShareQr(null)
        setLabCompareOpen(false)
        setLabDataPanelOpen(true)
      },
      openCompareDialog: () => {
        if (!hydrated) return
        setShareQr(null)
        setLabDataPanelOpen(false)
        setLabCompareOpen(true)
      },
      getLabsShareFile: getLabsShareFileForGallery,
      applyLabsShareFile: applyLabsShareFileFromGallery,
    }),
    [
      applyLabsShareFileFromGallery,
      getLabsShareFileForGallery,
      hydrated,
    ],
  )

  const PanelRoot = embeddedInPanel ? 'div' : 'section'
  const panelRootClass = embeddedInPanel
    ? 'select-research-embed'
    : 'select-research'

  return (
    <PanelRoot
      className={panelRootClass}
      aria-label={t('sr_title')}
    >
      {!embeddedInPanel ? (
        <header className="select-research__header">
          <div className="select-research__header-locale">
            <label htmlFor="locale-select-field" className="visually-hidden">
              {t('sr_locale_aria')}
            </label>
            <select
              id="locale-select-field"
              className="select-research__header-locale-select"
              value={locale}
              onChange={(e) => setLocale(e.target.value as AppLocale)}
              aria-label={t('sr_locale_aria')}
            >
              <option value="en">{t('sr_locale_option_en')}</option>
              <option value="es">{t('sr_locale_option_es')}</option>
              <option value="de">{t('sr_locale_option_de')}</option>
            </select>
          </div>
        </header>
      ) : null}

      <nav className="select-research__toolbar" aria-label={t('sr_toolbar_aria')}>
        {presetsBarInline ? (
          <CommunityBuildRow
            hydrated={hydrated}
            onSaveAs={openCommunityPublishDialog}
            onCopyShareLink={handleCopyBuildShareLink}
            onClearWorkspace={handleClearWorkspace}
          />
        ) : null}

        <LabToolbarQuick
          hideCompleted={hideCompleted}
          setHideCompleted={setHideCompleted}
          onMaxAll={maxAllVisibleLabs}
          onResetLevels={openResetLevelsConfirm}
        />

        <label className="visually-hidden" htmlFor={searchFieldId}>
          {t('sr_search_label_hidden')}
        </label>
        <input
          ref={searchInputRef}
          id={searchFieldId}
          className="select-research__search glow-input"
          type="search"
          placeholder={t('sr_search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
          aria-describedby={searchSlashHintId}
        />
        <p id={searchSlashHintId} className="visually-hidden">
          {t('sr_search_slash_hint')}
        </p>

        <div
          className={
            embeddedInPanel
              ? 'select-research__filters select-research__filters--embedded'
              : 'select-research__filters'
          }
        >
          <input
            ref={importLabCsvFileInputRef}
            className="visually-hidden"
            type="file"
            accept=".csv,text/csv"
            aria-hidden
            tabIndex={-1}
            onChange={handleImportLabCsvFileChange}
          />
          <input
            ref={importPlayerInfoFileInputRef}
            className="visually-hidden"
            type="file"
            accept=".dat,application/octet-stream"
            aria-hidden
            tabIndex={-1}
            onChange={handleImportPlayerInfoFileChange}
          />
          {!embeddedInPanel ? (
            <div className="select-research__filter-actions">
              <button
                type="button"
                className="glow-btn glow-btn--block select-research__filter-actions-launcher"
                onClick={() => {
                  setShareQr(null)
                  setLabCompareOpen(false)
                  setLabDataPanelOpen(true)
                }}
                disabled={!hydrated}
                aria-haspopup="dialog"
                aria-expanded={labDataPanelOpen}
                aria-controls="lab-data-panel"
              >
                {t('sr_import_export_launcher')}
              </button>
              <button
                type="button"
                className="glow-btn glow-btn--block select-research__filter-actions-launcher"
                onClick={() => {
                  setShareQr(null)
                  setLabDataPanelOpen(false)
                  setLabCompareOpen(true)
                }}
                disabled={!hydrated}
                aria-haspopup="dialog"
                aria-expanded={labCompareOpen}
                aria-controls="lab-compare-dialog"
              >
                {t('sr_compare_launcher')}
              </button>
            </div>
          ) : null}
        {importNotice ? (
          <p className="select-research__import-notice" role="status">
            {importNotice}
          </p>
        ) : null}
      </div>
      </nav>

      {embeddedInPanel && embeddedPresetsMount
        ? createPortal(
            <CommunityBuildRow
              hydrated={hydrated}
              onSaveAs={openCommunityPublishDialog}
              onCopyShareLink={handleCopyBuildShareLink}
              onClearWorkspace={handleClearWorkspace}
            />,
            embeddedPresetsMount,
          )
        : null}

      {budgetPanelsVisible ? (
      <div
        className={
          labBudgetCollapsed
            ? 'select-research__budget select-research__budget--collapsed'
            : 'select-research__budget'
        }
        role="region"
        aria-labelledby="simulator-budget-title"
      >
        <div className="select-research__budget-head">
          <h2 id="simulator-budget-title" className="select-research__budget-title">
            {t('sr_budget_title')}
          </h2>
          <button
            type="button"
            className="select-research__budget-toggle"
            aria-expanded={!labBudgetCollapsed}
            aria-controls={labBudgetBodyId}
            aria-label={
              labBudgetCollapsed
                ? t('sr_budget_toggle_expand')
                : t('sr_budget_toggle_collapse')
            }
            onClick={() => setLabBudgetCollapsed((c) => !c)}
          >
            <span className="select-research__budget-chevron" aria-hidden>
              ▼
            </span>
          </button>
        </div>
        <div
          id={labBudgetBodyId}
          className="select-research__budget-body"
          hidden={labBudgetCollapsed}
        >
        <p className="visually-hidden" aria-live="polite" aria-atomic="true">
          {fmt.simulatorBudgetAria(
            simulatorCoinLabels.spentLabel,
            simulatorCoinLabels.toMaxLabel,
            simulatorCoinLabels.nextVisibleLabel,
          )}
        </p>
        <dl className="select-research__budget-stats">
          <div className="select-research__budget-row">
            <dt>{t('sr_budget_spent_dt')}</dt>
            <dd>{simulatorCoinLabels.spentLabel}</dd>
          </div>
          <div className="select-research__budget-row">
            <dt>{t('sr_budget_to_max_dt')}</dt>
            <dd>{simulatorCoinLabels.toMaxLabel}</dd>
          </div>
          <div className="select-research__budget-row">
            <dt>{t('sr_budget_next_dt')}</dt>
            <dd>{simulatorCoinLabels.nextVisibleLabel}</dd>
          </div>
        </dl>
        <p className="select-research__budget-footnote">
          {t('sr_budget_footnote')}
        </p>
        </div>
      </div>
      ) : null}

      {labDataPanelOpen
        ? labOverlayPortal(
            <div
              className="select-research__lab-data-backdrop"
              role="presentation"
              onClick={() => setLabDataPanelOpen(false)}
            >
              <div
                id="lab-data-panel"
                className="select-research__lab-data-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="lab-data-panel-title"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="lab-data-panel-title" className="select-research__lab-data-title">
                  {t('sr_lab_data_title')}
                </h2>
                <p className="select-research__lab-data-intro">
                  {t('sr_lab_data_intro')}
                </p>
                <p className="select-research__lab-data-section-label">{t('sr_lab_data_files')}</p>
                <div className="select-research__lab-data-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => {
                      setLabDataPanelOpen(false)
                      queueMicrotask(() => importLabCsvFileInputRef.current?.click())
                    }}
                  >
                    {t('sr_lab_import_file')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => {
                      handleExportLevels()
                      setLabDataPanelOpen(false)
                    }}
                  >
                    {t('sr_lab_export_file')}
                  </button>
                </div>
                <p className="select-research__lab-data-section-label">{t('sr_lab_data_save_game')}</p>
                <div className="select-research__lab-data-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => {
                      setLabDataPanelOpen(false)
                      queueMicrotask(() => importPlayerInfoFileInputRef.current?.click())
                    }}
                  >
                    {t('sr_lab_import_player_save')}
                  </button>
                </div>
                <p className="select-research__lab-data-section-label">{t('sr_lab_data_share')}</p>
                <p className="select-research__lab-data-share-hint">
                  {t('sr_lab_data_share_hint')}
                </p>
                <div className="select-research__lab-data-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    disabled={sharePublishing}
                    onClick={async () => {
                      await handleCopyCleanShareLink()
                      setLabDataPanelOpen(false)
                    }}
                  >
                    {sharePublishing ? t('sr_share_publishing') : t('sr_copy_short_link')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    disabled={sharePublishing}
                    onClick={() => {
                      setLabDataPanelOpen(false)
                      void handleShowShareQr()
                    }}
                  >
                    {t('sr_qr_share')}
                  </button>
                </div>
                <button
                  type="button"
                  className="glow-btn glow-btn--block select-research__lab-data-close"
                  onClick={() => setLabDataPanelOpen(false)}
                >
                  {t('sr_close')}
                </button>
              </div>
            </div>,
          )
        : null}

      {labOverlayPortal(
        <LabCompareDialog
          data={data}
          open={labCompareOpen}
          onClose={() => setLabCompareOpen(false)}
          currentOverrides={levelOverrides}
          currentWorkshop={workshopFlat}
          t={t}
          fmt={fmt}
        />,
      )}

      <GalleryPublishDialog
        open={communityPublishDialogOpen}
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

      <AuthSignInDialog
        open={authSignInDialogOpen}
        onClose={() => setAuthSignInDialogOpen(false)}
      />

      <div
        className="select-research__sections"
        role="region"
        aria-label={t('sr_sections_aria')}
      >
        {data.sections.map((section, index) => (
          <ResearchSection
            key={`${section.sectionSlug}-${index}`}
            labDomIds={labDomIdsBySection[index] ?? []}
            section={section}
            sectionIndex={index}
            collapsed={Boolean(collapsed[index])}
            onToggle={() => toggleSection(index)}
            searchQuery={search}
            hideCompleted={hideCompleted}
            levelOverrides={levelOverrides}
            labsCoinDiscountPercent={labsCoinDiscountPercent}
            labsSpeedMultiplier={labsSpeedMultiplier}
            onLevelDelta={(itemIndex, delta) =>
              adjustLevel(index, itemIndex, delta)
            }
            onLevelSet={(itemIndex, level) => setLevel(index, itemIndex, level)}
            sectionHeadEnd={
              index === 0 && sectionCount > 0 ? (
                <label
                  className="glow-btn glow-btn--toggle research-section__bulk-toggle"
                  htmlFor={BULK_SECTIONS_TOGGLE_ID}
                >
                  <input
                    id={BULK_SECTIONS_TOGGLE_ID}
                    ref={bulkAllSectionsToggleRef}
                    type="checkbox"
                    checked={allSectionsCollapsed}
                    onChange={handleBulkSectionsToggleChange}
                    aria-label={t('sr_bulk_collapse_aria')}
                  />
                  {t('sr_collapse_all')}
                </label>
              ) : undefined
            }
          />
        ))}
      </div>

      {shareQr
        ? labOverlayPortal(
            <div
              className="select-research__qr-backdrop"
              role="presentation"
              onClick={() => setShareQr(null)}
            >
              <div
                className="select-research__qr-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-qr-title"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="share-qr-title" className="select-research__qr-title">
                  {t('sr_qr_dialog_title')}
                </h2>
                <img
                  className="select-research__qr-img"
                  src={shareQr.dataUrl}
                  width={220}
                  height={220}
                  alt={t('sr_qr_image_alt')}
                  decoding="async"
                />
                <p className="select-research__qr-hint">
                  {t('sr_qr_hint')}
                </p>
                <div className="select-research__qr-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareQr.url)
                        setImportNotice(t('sr_notice_qr_link_copied'))
                      } catch {
                        setImportNotice(t('sr_notice_copy_fail_short'))
                      }
                    }}
                  >
                    {t('sr_qr_copy_link')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setShareQr(null)}
                  >
                    {t('sr_close')}
                  </button>
                </div>
              </div>
            </div>,
          )
        : null}

      {resetLevelsConfirmOpen
        ? labOverlayPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => setResetLevelsConfirmOpen(false)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="reset-levels-confirm-title"
                aria-describedby="reset-levels-confirm-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="reset-levels-confirm-title" className="select-research__reset-confirm-title">
                  {t('sr_reset_confirm_title')}
                </h2>
                <p id="reset-levels-confirm-desc" className="select-research__reset-confirm-desc">
                  {t('sr_reset_confirm_body')}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setResetLevelsConfirmOpen(false)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    onClick={performResetLevels}
                  >
                    {t('sr_reset_all')}
                  </button>
                </div>
              </div>
            </div>,
          )
        : null}

      {guildNamePrompt
        ? labOverlayPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => closeGuildNamePrompt(null)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="guild-name-prompt-title"
                aria-describedby="guild-name-prompt-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="guild-name-prompt-title" className="select-research__reset-confirm-title">
                  Unknown guild ID
                </h2>
                <p id="guild-name-prompt-desc" className="select-research__reset-confirm-desc">
                  Congratulations! You are the first to map guild ID "{guildNamePrompt.guildId}".
                  Enter a readable name to save for everyone.
                </p>
                <input
                  type="text"
                  className="glow-input profile-settings__input select-research__guild-name-input"
                  value={guildNamePrompt.name}
                  maxLength={40}
                  autoFocus
                  onChange={(e) =>
                    setGuildNamePrompt((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev,
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    e.preventDefault()
                    closeGuildNamePrompt(guildNamePrompt.name.trim() || null)
                  }}
                />
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => closeGuildNamePrompt(null)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => closeGuildNamePrompt(guildNamePrompt.name.trim() || null)}
                    disabled={guildNamePrompt.name.trim().length < 1}
                  >
                    Save guild name
                  </button>
                </div>
              </div>
            </div>,
          )
        : null}

      {!embeddedInPanel ? (
      <footer className="select-research__site-footer">
        <nav
          className="select-research__version-badge"
          aria-label={t('sr_footer_nav_aria')}
        >
          <span
            className="select-research__version-label"
            aria-label={fmt.versionAria(APP_VERSION)}
          >
            v{APP_VERSION}
          </span>
          <div className="select-research__version-badge-links">
            <a
              className="select-research__footer-link"
              href={CHANGELOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              title={t('sr_changelog_title')}
            >
              {t('sr_changelog')}
            </a>
            <a
              className="select-research__footer-link"
              href={SPONSOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              title={t('sr_sponsor_title')}
            >
              {t('sr_sponsor')}
            </a>
          </div>
        </nav>
      </footer>
      ) : null}
    </PanelRoot>
  )
})

SelectResearch.displayName = 'SelectResearch'

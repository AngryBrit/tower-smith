import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAuth } from '../auth/AuthProvider'
import { CommunityBuildRow } from './CommunityBuildRow'
import { APP_VERSION, CHANGELOG_URL } from '../appVersion'
import { BuyMeACoffeeButton } from './BuyMeACoffeeButton'
import { useBudgetPanelsVisible } from '../budgetPanelsVisibility'
import { buildLabDomIdTables, getLabSlugFromUrl } from '../labSlug'
import {
  computeSimulatorCoinAggregates,
  formatSimulatorCoinAggregates,
  maxVisibleLabLevels,
} from '../labBudgetAggregates'
import { importPlayerInfoDat } from '../playerSave/importPlayerInfo'
import {
  isAndroidBrowser,
  isIosBrowser,
  TOWER_ANDROID_SAVE_FOLDER,
} from '../playerSave/playerInfoSavePath'
import { updateUserGuildId, updateUserPlayfabId } from '../profile/profileApi'
import { resolveGuildNameById } from '../towerGallery/api'
import {
  parseTowerUnifiedCsv,
  serializeTowerUnifiedCsv,
  towerUnifiedPrimaryBuild,
} from '../towerUnifiedCsv'
import {
  applyTowerThemes,
  readTowerThemesSnapshot,
} from '../towerDataThemes'
import { sanitizeLevelOverrides } from '../labLevelOverridesSanitize'
import { useTowerWorkspaceContext } from '../TowerBuildContext'
import {
  applyImportedLabAndBuild,
  mergeWorkspaceBuild,
} from '../towerWorkspaceStorage'
import { splitTowerBuild } from '../towerBuildStorage'
import { persistLabWorkspacesToLocalStorage } from '../towerWorkspacePresets'
import type { ResearchData } from '../types/research'
import { combinedLabsSpeedMultiplier } from '../data/workshopRelicWorkshopDisplay'
import {
  getLevelBounds,
  levelOverrideKey,
  resolveLabsCoinDiscountPercent,
  resolveLabsSpeedMultiplier,
} from '../types/research'
import { ResearchSection } from './ResearchSection'
import { LabToolbarQuick } from './lab/LabToolbarQuick'
import { labOverlayPortal } from './lab/labOverlayPortal'

const LabImportExportPanel = lazy(() =>
  import('./lab/LabImportExportPanel').then((m) => ({ default: m.LabImportExportPanel })),
)
const LabShareQrDialog = lazy(() =>
  import('./lab/LabShareQrDialog').then((m) => ({ default: m.LabShareQrDialog })),
)
const LabResetLevelsConfirmDialog = lazy(() =>
  import('./lab/LabResetLevelsConfirmDialog').then((m) => ({
    default: m.LabResetLevelsConfirmDialog,
  })),
)
import { useCommunityBuild } from '../lab/CommunityBuildProvider'
import { useLabHydration } from '../lab/LabHydrationContext'
import { useLabToolsBridge } from '../lab/LabToolsBridge'
import { useI18n, type AppLocale } from '../i18n'

const LabCompareDialog = lazy(() =>
  import('./LabCompareDialog').then((m) => ({ default: m.LabCompareDialog })),
)

/** Survives React Strict Mode remount so initial `?lab=` / `#` runs once per full load. */
let initialLabUrlNavigationConsumed = false

export type { SelectResearchHandle } from '../lab/labToolsTypes'

interface SelectResearchProps {
  data: ResearchData
  /** When true, omit outer panel chrome and site footer (parent provides shell + footer). */
  embeddedInPanel?: boolean
}

const SECTION_COLLAPSED_STORAGE_KEY = 'tower-export-section-collapsed-v1'
const LAB_BUDGET_COLLAPSED_STORAGE_KEY = 'tower-export-lab-budget-collapsed-v1'
const BULK_SECTIONS_TOGGLE_ID = 'tower-bulk-sections-collapsed-toggle'

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

export function SelectResearch({
  data,
  embeddedInPanel = false,
}: SelectResearchProps) {
  const { t, fmt, locale, setLocale } = useI18n()
  const { hydrated, importNotice, setImportNotice } = useLabHydration()
  const { registerResearchUi } = useLabToolsBridge()
  const {
    sharePublishing,
    openPublishDialog,
    copyBuildShareLink,
    clearWorkspace,
    copyCleanShareLink,
    publishForQrUrl,
    prefillPublishGuildId,
    resolveGuildNameForPublish,
  } = useCommunityBuild()
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
  const [shareQr, setShareQr] = useState<{
    dataUrl: string
    url: string
  } | null>(null)
  const [resetLevelsConfirmOpen, setResetLevelsConfirmOpen] = useState(false)
  const [labDataPanelOpen, setLabDataPanelOpen] = useState(false)
  const [labCompareOpen, setLabCompareOpen] = useState(false)
  const [labBudgetCollapsed, setLabBudgetCollapsed] = useState(() => {
    try {
      return localStorage.getItem(LAB_BUDGET_COLLAPSED_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const androidPlayerSaveImport = useMemo(() => isAndroidBrowser(), [])
  const iosPlayerSaveImport = useMemo(() => isIosBrowser(), [])
  const bulkAllSectionsToggleRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const pendingLabScrollSlug = useRef<string | null>(null)
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
      labCompareOpen
    if (!blocking) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setShareQr(null)
      setResetLevelsConfirmOpen(false)
      setLabDataPanelOpen(false)
      setLabCompareOpen(false)
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
  ])

  useEffect(() => {
    if (!hydrated) return
    try {
      const rawJson = localStorage.getItem(SECTION_COLLAPSED_STORAGE_KEY)
      if (!rawJson) return
      const parsed: unknown = JSON.parse(rawJson)
      if (!parsed || typeof parsed !== 'object' || !('collapsed' in parsed)) return
      const c = (parsed as { collapsed?: unknown }).collapsed
      if (!c || typeof c !== 'object' || Array.isArray(c)) return
      setCollapsed(
        sanitizeSectionCollapsed(data.sections.length, c as Record<string, unknown>),
      )
    } catch {
      /* ignore corrupt storage */
    }
  }, [data.sections.length, hydrated])

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

  const handleShowShareQr = useCallback(async () => {
    const url = await publishForQrUrl()
    if (!url) return
    try {
      const QRCode = (await import('qrcode')).default
      const dataUrl = await QRCode.toDataURL(url, {
        width: 220,
        margin: 2,
        color: { dark: '#0f172a', light: '#e0f2fe' },
      })
      setShareQr({ dataUrl, url })
    } catch {
      setImportNotice(t('sr_notice_qr_fail'))
    }
  }, [publishForQrUrl, setImportNotice, t])

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
        const build = splitTowerBuild(imported.workshop)
        applyTowerThemes(imported.themes)
        const nextWorkspace = applyImportedLabAndBuild(workspace, sanitized, build)
        const nextScratch = applyImportedLabAndBuild(scratchWorkspace, sanitized, build)
        setWorkspace(nextWorkspace)
        setScratchWorkspace(nextScratch)
        persistLabWorkspacesToLocalStorage(nextWorkspace, nextScratch)
        let shouldRefreshProfile = false
        if (imported.guild) {
          prefillPublishGuildId(imported.guild)
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
    [
      auth,
      data,
      prefillPublishGuildId,
      resolveGuildNameForPublish,
      scratchWorkspace,
      setScratchWorkspace,
      setWorkspace,
      t,
      workspace,
    ],
  )

  const handleImportPlayerSaveClick = useCallback(() => {
    setLabDataPanelOpen(false)
    if (androidPlayerSaveImport) {
      void navigator.clipboard
        .writeText(TOWER_ANDROID_SAVE_FOLDER)
        .then(() => {
          setImportNotice(t('sr_notice_import_player_android_path'))
        })
        .catch(() => {
          setImportNotice(t('sr_notice_import_player_android_path_no_clip'))
        })
    }
  }, [androidPlayerSaveImport, t])

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

  const openLabDataPanel = useCallback(() => {
    if (!hydrated) return
    setShareQr(null)
    setLabCompareOpen(false)
    setLabDataPanelOpen(true)
  }, [hydrated])

  const openCompareDialog = useCallback(() => {
    if (!hydrated) return
    setShareQr(null)
    setLabDataPanelOpen(false)
    setLabCompareOpen(true)
  }, [hydrated])

  useEffect(() => {
    registerResearchUi({ openLabDataPanel, openCompareDialog })
    return () => registerResearchUi(null)
  }, [openCompareDialog, openLabDataPanel, registerResearchUi])

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
        {!embeddedInPanel ? (
          <CommunityBuildRow
            hydrated={hydrated}
            onSaveAs={openPublishDialog}
            onCopyShareLink={copyBuildShareLink}
            onClearWorkspace={clearWorkspace}
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

      {labDataPanelOpen ? (
        <Suspense fallback={null}>
          <LabImportExportPanel
            open
            onClose={() => setLabDataPanelOpen(false)}
            sharePublishing={sharePublishing}
            androidPlayerSaveImport={androidPlayerSaveImport}
            iosPlayerSaveImport={iosPlayerSaveImport}
            onImportCsvFile={handleImportLabCsvFileChange}
            onImportPlayerSaveFile={handleImportPlayerInfoFileChange}
            onExportCsv={handleExportLevels}
            onImportPlayerSaveClick={handleImportPlayerSaveClick}
            onCopyShareLink={() => void copyCleanShareLink()}
            onShowShareQr={() => void handleShowShareQr()}
          />
        </Suspense>
      ) : null}

      {labCompareOpen ? (
        <Suspense fallback={null}>
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
        </Suspense>
      ) : null}

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

      {shareQr ? (
        <Suspense fallback={null}>
          <LabShareQrDialog
            dataUrl={shareQr.dataUrl}
            onClose={() => setShareQr(null)}
            onCopyLink={async () => {
              try {
                await navigator.clipboard.writeText(shareQr.url)
                setImportNotice(t('sr_notice_qr_link_copied'))
              } catch {
                setImportNotice(t('sr_notice_copy_fail_short'))
              }
            }}
          />
        </Suspense>
      ) : null}

      {resetLevelsConfirmOpen ? (
        <Suspense fallback={null}>
          <LabResetLevelsConfirmDialog
            onClose={() => setResetLevelsConfirmOpen(false)}
            onConfirm={performResetLevels}
          />
        </Suspense>
      ) : null}

      {!embeddedInPanel ? (
      <footer className="select-research__site-footer">
        <nav
          className="select-research__version-badge"
          aria-label={t('sr_footer_nav_aria')}
        >
          <a
            className="select-research__version-label"
            href={CHANGELOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={t('sr_changelog_title')}
            aria-label={`${fmt.versionAria(APP_VERSION)} — ${t('sr_changelog_title')}`}
          >
            v{APP_VERSION}
          </a>
          <BuyMeACoffeeButton className="select-research__bmc-button" />
        </nav>
      </footer>
      ) : null}
    </PanelRoot>
  )
}

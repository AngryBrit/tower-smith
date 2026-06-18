import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { BugBusterProvider } from './bugBuster/BugBusterProvider'
import { BugBusterDialog } from './components/BugBusterDialog'
import { BugBusterFab } from './components/BugBusterFab'
import { BugBusterTrigger } from './components/BugBusterTrigger'
import type { SelectResearchHandle } from './lab/labToolsTypes'
import { defaultTowerWorkspace, mergeWorkspaceBuildDomain, type TowerWorkspaceV1 } from './towerWorkspaceStorage'
import { TowerWorkspaceProvider } from './TowerBuildContext'
import { LabHydrationProvider } from './lab/LabHydrationProvider'
import { AccountWorkspaceSyncProvider } from './accountWorkspace/AccountWorkspaceSyncProvider'
import { LabToolsBridgeProvider } from './lab/LabToolsBridge'
import { CommunityBuildProvider } from './lab/CommunityBuildProvider'
import { WorkspaceUndoProvider } from './lab/WorkspaceUndoProvider'
import { useInpanelTabHotkeys } from './hooks/useInpanelTabHotkeys'
import { InpanelPresetsPortal } from './components/InpanelPresetsPortal'
import { AuthButton } from './components/AuthButton'
const MyBuildsDialog = lazy(() =>
  import('./components/MyBuildsDialog').then((m) => ({ default: m.MyBuildsDialog })),
)
import { LabToolsRefBinder } from './components/LabToolsRefBinder'
import { AppHintsBanner } from './components/AppHintsBanner'
import { LabImportNoticeBanner } from './components/LabImportNoticeBanner'
import { PlayerSaveImportInput } from './components/PlayerSaveImportInput'
import { MainPanelContent } from './components/MainPanelContent'
import { SiteFooter } from './components/SiteFooter'
import { useI18n } from './i18n'
import { loadGodTables } from './loadGodTables'
import { loadResearchData } from './loadResearchData'
import {
  bumpResearchCacheBust,
  clearResearchServiceWorkerCaches,
} from './researchCacheBust'
import type { ResearchData } from './types/research'
import {
  emitAppDeepLink,
  mainPanelForDeepLink,
  parseAppDeepLinkFromUrl,
} from './appDeepLink'
import {
  readMainPanel,
  writeMainPanel,
  type MainPanel,
} from './mainPanelStorage'
import './App.css'

/** Top-level Modules tab (panel + nav). */
const MODULES_PANEL_ENABLED = true

export default function App() {
  const { t, fmt } = useI18n()
  const [galleryListRefreshToken, setGalleryListRefreshToken] = useState(0)
  const [myBuildsOpen, setMyBuildsOpen] = useState(false)
  const [mainPanel, setMainPanel] = useState<MainPanel>(() =>
    readMainPanel(MODULES_PANEL_ENABLED),
  )
  const [inpanelPresetsMount, setInpanelPresetsMount] =
    useState<HTMLDivElement | null>(null)
  const [inpanelWorkshopToolbarMount, setInpanelWorkshopToolbarMount] =
    useState<HTMLDivElement | null>(null)
  const labToolsRef = useRef<SelectResearchHandle | null>(null)
  const playerSaveInputRef = useRef<HTMLInputElement>(null)
  const openPlayerSaveImport = useCallback(() => {
    playerSaveInputRef.current?.click()
  }, [])
  const openTowerBackupSharing = useCallback(() => {
    labToolsRef.current?.openLabDataPanel()
  }, [])
  const fmtRef = useRef(fmt)
  const godTablesLoadedRef = useRef(false)
  useLayoutEffect(() => {
    fmtRef.current = fmt
  }, [fmt])

  const [data, setData] = useState<ResearchData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [researchRefreshing, setResearchRefreshing] = useState(false)
  const [researchReloadToken, setResearchReloadToken] = useState(0)
  const [workspace, setWorkspace] = useState<TowerWorkspaceV1>(() => defaultTowerWorkspace())
  const [scratchWorkspace, setScratchWorkspace] = useState<TowerWorkspaceV1>(() =>
    defaultTowerWorkspace(),
  )

  useEffect(() => {
    document.documentElement.classList.add('app-shell-ready')
    return () => {
      document.documentElement.classList.remove('app-shell-ready')
    }
  }, [])

  useEffect(() => {
    if (!MODULES_PANEL_ENABLED && workspace.build.workshop.mainTab === 'modules') {
      queueMicrotask(() => {
        setWorkspace((w) =>
          w.build.workshop.mainTab === 'modules'
            ? mergeWorkspaceBuildDomain(w, 'workshop', { ...w.build.workshop, mainTab: 'upgrade' })
            : w,
        )
      })
    }
  }, [workspace.build.workshop.mainTab])

  useEffect(() => {
    if (!MODULES_PANEL_ENABLED && mainPanel === 'modules') {
      queueMicrotask(() => setMainPanel('workshop'))
      return
    }
    writeMainPanel(mainPanel)
  }, [mainPanel])

  useEffect(() => {
    const applyFromUrl = () => {
      const link = parseAppDeepLinkFromUrl()
      if (!link) return
      setMainPanel(mainPanelForDeepLink(link))
      queueMicrotask(() => emitAppDeepLink(link))
    }
    applyFromUrl()
    window.addEventListener('hashchange', applyFromUrl)
    return () => window.removeEventListener('hashchange', applyFromUrl)
  }, [])

  const selectInpanelPanel = useCallback(
    (panel: MainPanel) => {
      setMainPanel(panel)
      if (panel === 'workshop') {
        const tab = workspace.build.workshop.mainTab
        if (tab === 'modules' || tab === 'cards') {
          setWorkspace((w) =>
            mergeWorkspaceBuildDomain(w, 'workshop', {
              ...w.build.workshop,
              mainTab: 'upgrade',
            }),
          )
        }
      } else if (panel === 'cards') {
        setWorkspace((w) =>
          mergeWorkspaceBuildDomain(w, 'workshop', {
            ...w.build.workshop,
            mainTab: 'cards',
          }),
        )
      } else if (panel === 'modules' && MODULES_PANEL_ENABLED) {
        setWorkspace((w) =>
          mergeWorkspaceBuildDomain(w, 'workshop', {
            ...w.build.workshop,
            mainTab: 'modules',
          }),
        )
      }
    },
    [workspace.build.workshop.mainTab],
  )

  const inpanelTabHotkeys = useMemo(
    () => [
      { key: '1', panel: 'workshop' as const },
      { key: '2', panel: 'research' as const },
      { key: '3', panel: 'cards' as const },
      { key: '4', panel: 'modules' as const, enabled: MODULES_PANEL_ENABLED },
      { key: '5', panel: 'bots' as const },
      { key: '6', panel: 'guardians' as const },
      { key: '7', panel: 'themes' as const },
      { key: '8', panel: 'relics' as const },
      { key: '9', panel: 'vault' as const },
      { key: '0', panel: 'gallery' as const },
    ],
    [],
  )

  useInpanelTabHotkeys(inpanelTabHotkeys, selectInpanelPanel, Boolean(data) && !loading)

  useEffect(() => {
    let cancelled = false
    const base = import.meta.env.BASE_URL
    const godTablesPromise = godTablesLoadedRef.current
      ? Promise.resolve()
      : loadGodTables(base).then(() => {
          godTablesLoadedRef.current = true
        })

    Promise.all([loadResearchData(base, fmtRef.current), godTablesPromise])
      .then(([d]) => {
        if (!cancelled) setData(d)
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
          setResearchRefreshing(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [researchReloadToken])

  const refreshResearchData = useCallback(async () => {
    setResearchRefreshing(true)
    setError(null)
    bumpResearchCacheBust()
    await clearResearchServiceWorkerCaches()
    setResearchReloadToken((token) => token + 1)
  }, [])

  const inpanelTabsClass = MODULES_PANEL_ENABLED
    ? 'select-research__inpanel-tabs select-research__inpanel-tabs--ten-no-tools'
    : 'select-research__inpanel-tabs select-research__inpanel-tabs--nine-vault-no-tools'

  return (
    <div className="app-root">
      <a href="#main-content" className="app-skip-link">
        {t('app_skipToMain')}
      </a>
      <main
        id="main-content"
        className="app-main"
        tabIndex={-1}
        aria-busy={loading}
      >
        {loading ? (
          <p className="app-status" role="status">
            {t('app_loadingResearch')}
          </p>
        ) : null}
        {error ? (
          <p className="app-status app-status--error" role="alert">
            {error}
          </p>
        ) : null}
        {data ? (
          <TowerWorkspaceProvider
            workspace={workspace}
            setWorkspace={setWorkspace}
            scratchWorkspace={scratchWorkspace}
            setScratchWorkspace={setScratchWorkspace}
          >
          <LabHydrationProvider data={data}>
          <AccountWorkspaceSyncProvider>
          <WorkspaceUndoProvider>
          <LabToolsBridgeProvider data={data}>
          <CommunityBuildProvider>
          <PlayerSaveImportInput data={data} inputRef={playerSaveInputRef} />
          <BugBusterProvider mainPanel={mainPanel}>
          <LabToolsRefBinder labToolsRef={labToolsRef} />
          <InpanelPresetsPortal
            mount={inpanelPresetsMount}
            visible={
              mainPanel === 'research' ||
              mainPanel === 'workshop' ||
              mainPanel === 'bots' ||
              mainPanel === 'modules' ||
              mainPanel === 'cards' ||
              mainPanel === 'relics' ||
              mainPanel === 'themes' ||
              mainPanel === 'guardians' ||
              mainPanel === 'gallery' ||
              mainPanel === 'vault'
            }
          />
          <div className="app-shell">
            <div className="app-shell__page">
              <section
                className="select-research"
                aria-label={t('app_inpanel_tabs_aria')}
              >
                <LabImportNoticeBanner />
                <div className="select-research__inpanel-header">
                <nav
                  className={inpanelTabsClass}
                  role="tablist"
                >
                  <button
                    id="inpanel-tab-workshop"
                    type="button"
                    role="tab"
                    aria-selected={mainPanel === 'workshop'}
                    aria-controls="inpanel-panel-workshop"
                    className={
                      mainPanel === 'workshop'
                        ? 'select-research__inpanel-tab select-research__inpanel-tab--workshop select-research__inpanel-tab--on'
                        : 'select-research__inpanel-tab select-research__inpanel-tab--workshop'
                    }
                    onClick={() => {
                      setMainPanel('workshop')
                      const tab = workspace.build.workshop.mainTab
                      if (tab === 'modules' || tab === 'cards') {
                      setWorkspace((w) =>
                        mergeWorkspaceBuildDomain(w, 'workshop', {
                          ...w.build.workshop,
                          mainTab: 'upgrade',
                        }),
                      )
                      }
                    }}
                  >
                    {t('app_nav_workshop')}
                  </button>
                  <button
                    id="inpanel-tab-lab"
                    type="button"
                    role="tab"
                    aria-selected={mainPanel === 'research'}
                    aria-controls="inpanel-panel-lab"
                    className={
                      mainPanel === 'research'
                        ? 'select-research__inpanel-tab select-research__inpanel-tab--lab select-research__inpanel-tab--on'
                        : 'select-research__inpanel-tab select-research__inpanel-tab--lab'
                    }
                    onClick={() => setMainPanel('research')}
                  >
                    {t('app_nav_research')}
                  </button>
                  <button
                    id="inpanel-tab-cards"
                    type="button"
                    role="tab"
                    aria-selected={mainPanel === 'cards'}
                    aria-controls="inpanel-panel-cards"
                    className={
                      mainPanel === 'cards'
                        ? 'select-research__inpanel-tab select-research__inpanel-tab--cards select-research__inpanel-tab--on'
                        : 'select-research__inpanel-tab select-research__inpanel-tab--cards'
                    }
                    onClick={() => {
                      setMainPanel('cards')
                      setWorkspace((w) =>
                        mergeWorkspaceBuildDomain(w, 'workshop', {
                          ...w.build.workshop,
                          mainTab: 'cards',
                        }),
                      )
                    }}
                  >
                    {t('app_nav_cards')}
                  </button>
                  {MODULES_PANEL_ENABLED ? (
                    <button
                      id="inpanel-tab-modules"
                      type="button"
                      role="tab"
                      aria-selected={mainPanel === 'modules'}
                      aria-controls="inpanel-panel-modules"
                      className={
                        mainPanel === 'modules'
                          ? 'select-research__inpanel-tab select-research__inpanel-tab--modules select-research__inpanel-tab--on'
                          : 'select-research__inpanel-tab select-research__inpanel-tab--modules'
                      }
                      onClick={() => {
                        setMainPanel('modules')
                        setWorkspace((w) =>
                          mergeWorkspaceBuildDomain(w, 'workshop', {
                            ...w.build.workshop,
                            mainTab: 'modules',
                          }),
                        )
                      }}
                    >
                      {t('app_nav_modules')}
                    </button>
                  ) : null}
                  <button
                    id="inpanel-tab-bots"
                    type="button"
                    role="tab"
                    aria-selected={mainPanel === 'bots'}
                    aria-controls="inpanel-panel-bots"
                    className={
                      mainPanel === 'bots'
                        ? 'select-research__inpanel-tab select-research__inpanel-tab--bots select-research__inpanel-tab--on'
                        : 'select-research__inpanel-tab select-research__inpanel-tab--bots'
                    }
                    onClick={() => setMainPanel('bots')}
                  >
                    {t('app_nav_bots')}
                  </button>
                  <button
                    id="inpanel-tab-guardians"
                    type="button"
                    role="tab"
                    aria-selected={mainPanel === 'guardians'}
                    aria-controls="inpanel-panel-guardians"
                    className={
                      mainPanel === 'guardians'
                        ? 'select-research__inpanel-tab select-research__inpanel-tab--guardians select-research__inpanel-tab--on'
                        : 'select-research__inpanel-tab select-research__inpanel-tab--guardians'
                    }
                    onClick={() => setMainPanel('guardians')}
                  >
                    {t('app_nav_guardians')}
                  </button>
                  <button
                    id="inpanel-tab-themes"
                    type="button"
                    role="tab"
                    aria-selected={mainPanel === 'themes'}
                    aria-controls="inpanel-panel-themes"
                    className={
                      mainPanel === 'themes'
                        ? 'select-research__inpanel-tab select-research__inpanel-tab--themes select-research__inpanel-tab--on'
                        : 'select-research__inpanel-tab select-research__inpanel-tab--themes'
                    }
                    onClick={() => setMainPanel('themes')}
                  >
                    {t('app_nav_themes')}
                  </button>
                  <button
                    id="inpanel-tab-relics"
                    type="button"
                    role="tab"
                    aria-selected={mainPanel === 'relics'}
                    aria-controls="inpanel-panel-relics"
                    className={
                      mainPanel === 'relics'
                        ? 'select-research__inpanel-tab select-research__inpanel-tab--relics select-research__inpanel-tab--on'
                        : 'select-research__inpanel-tab select-research__inpanel-tab--relics'
                    }
                    onClick={() => setMainPanel('relics')}
                  >
                    {t('app_nav_relics')}
                  </button>
                  <button
                    id="inpanel-tab-vault"
                    type="button"
                    role="tab"
                    aria-selected={mainPanel === 'vault'}
                    aria-controls="inpanel-panel-vault"
                    className={
                      mainPanel === 'vault'
                        ? 'select-research__inpanel-tab select-research__inpanel-tab--vault select-research__inpanel-tab--on'
                        : 'select-research__inpanel-tab select-research__inpanel-tab--vault'
                    }
                    onClick={() => setMainPanel('vault')}
                  >
                    {t('app_nav_vault')}
                  </button>
                  <button
                    id="inpanel-tab-gallery"
                    type="button"
                    role="tab"
                    aria-selected={mainPanel === 'gallery'}
                    aria-controls="inpanel-panel-gallery"
                    className={
                      mainPanel === 'gallery'
                        ? 'select-research__inpanel-tab select-research__inpanel-tab--gallery select-research__inpanel-tab--on'
                        : 'select-research__inpanel-tab select-research__inpanel-tab--gallery'
                    }
                    onClick={() => setMainPanel('gallery')}
                  >
                    {t('app_nav_gallery')}
                  </button>
                </nav>
                <div className="select-research__inpanel-auth">
                  <AuthButton
                    placement="nav"
                    onOpenTowerBackup={openTowerBackupSharing}
                    onOpenMyBuilds={() => setMyBuildsOpen(true)}
                    onOpenSettings={() => setMainPanel('toolsSettings')}
                  />
                </div>
                </div>

                <AppHintsBanner
                  onImportSave={openPlayerSaveImport}
                  onBrowseBuilds={() => setMainPanel('gallery')}
                />

                <div
                  ref={setInpanelPresetsMount}
                  className="select-research__inpanel-presets-slot"
                />

                <div
                  ref={setInpanelWorkshopToolbarMount}
                  className="select-research__inpanel-workshop-toolbar-slot"
                  hidden={
                    mainPanel !== 'workshop' &&
                    mainPanel !== 'bots' &&
                    mainPanel !== 'cards' &&
                    mainPanel !== 'relics' &&
                    mainPanel !== 'modules' &&
                    mainPanel !== 'themes' &&
                    mainPanel !== 'guardians'
                  }
                />

                <MainPanelContent
                  mainPanel={mainPanel}
                  data={data}
                  labToolsRef={labToolsRef}
                  inpanelWorkshopToolbarMount={inpanelWorkshopToolbarMount}
                  galleryListRefreshToken={galleryListRefreshToken}
                  onGalleryMutated={() => setGalleryListRefreshToken((n) => n + 1)}
                  onOpenTowerBackup={openTowerBackupSharing}
                  onRefreshResearch={() => void refreshResearchData()}
                  researchRefreshing={researchRefreshing}
                />

                <SiteFooter
                  bugBuster={
                    <BugBusterTrigger
                      variant="link"
                      labelKey="bug_buster_footer_link"
                    />
                  }
                />
              </section>
            </div>
          </div>
          {myBuildsOpen ? (
            <Suspense fallback={null}>
              <MyBuildsDialog
                open
                onClose={() => setMyBuildsOpen(false)}
                labToolsRef={labToolsRef}
                onGalleryMutated={() => setGalleryListRefreshToken((n) => n + 1)}
              />
            </Suspense>
          ) : null}
          <BugBusterDialog />
          <BugBusterFab />
          </BugBusterProvider>
          </CommunityBuildProvider>
          </LabToolsBridgeProvider>
          </WorkspaceUndoProvider>
          </AccountWorkspaceSyncProvider>
          </LabHydrationProvider>
          </TowerWorkspaceProvider>
        ) : (
          <SiteFooter />
        )}
      </main>
    </div>
  )
}

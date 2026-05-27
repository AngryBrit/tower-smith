import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { APP_VERSION, CHANGELOG_URL, SPONSOR_URL } from './appVersion'
import type { SelectResearchHandle } from './components/SelectResearch'
import { SelectResearch } from './components/SelectResearch'
import { ToolsSettingsPage } from './components/ToolsSettingsPage'
import { CardsPage } from './components/CardsPage'
import { ModulesPage } from './components/ModulesPage'
import { RelicsPage } from './components/RelicsPage'
import { ThemesPage } from './components/ThemesPage'
import { BotsPage } from './components/BotsPage'
import { WorkshopPage } from './components/WorkshopPage'
import { defaultTowerWorkspace, mergeWorkspaceBuildDomain, type TowerWorkspaceV1 } from './towerWorkspaceStorage'
import { TowerWorkspaceProvider } from './TowerBuildContext'
import { TowerGalleryPanel } from './components/TowerGalleryPanel'
import { AuthButton } from './components/AuthButton'
import { useI18n } from './i18n'
import { loadResearchData } from './loadResearchData'
import type { ResearchData } from './types/research'
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
  const [mainPanel, setMainPanel] = useState<MainPanel>(() =>
    readMainPanel(MODULES_PANEL_ENABLED),
  )
  const [inpanelPresetsMount, setInpanelPresetsMount] =
    useState<HTMLDivElement | null>(null)
  const [inpanelWorkshopToolbarMount, setInpanelWorkshopToolbarMount] =
    useState<HTMLDivElement | null>(null)
  const labToolsRef = useRef<SelectResearchHandle | null>(null)
  const fmtRef = useRef(fmt)
  useLayoutEffect(() => {
    fmtRef.current = fmt
  }, [fmt])

  const [data, setData] = useState<ResearchData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [workspace, setWorkspace] = useState<TowerWorkspaceV1>(() => defaultTowerWorkspace())
  const [scratchWorkspace, setScratchWorkspace] = useState<TowerWorkspaceV1>(() =>
    defaultTowerWorkspace(),
  )

  useEffect(() => {
    if (!MODULES_PANEL_ENABLED && workspace.build.workshop.mainTab === 'modules') {
      setWorkspace((w) =>
        w.build.workshop.mainTab === 'modules'
          ? mergeWorkspaceBuildDomain(w, 'workshop', { ...w.build.workshop, mainTab: 'upgrade' })
          : w,
      )
    }
  }, [workspace.build.workshop.mainTab])

  useEffect(() => {
    if (!MODULES_PANEL_ENABLED && mainPanel === 'modules') {
      setMainPanel('workshop')
      return
    }
    writeMainPanel(mainPanel)
  }, [mainPanel])

  useEffect(() => {
    let cancelled = false
    const base = import.meta.env.BASE_URL
    loadResearchData(base, fmtRef.current)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const inpanelTabsClass = MODULES_PANEL_ENABLED
    ? 'select-research__inpanel-tabs select-research__inpanel-tabs--nine'
    : 'select-research__inpanel-tabs select-research__inpanel-tabs--eight'

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
          <div className="app-shell">
            <div className="app-shell__page">
              <section
                className="select-research"
                aria-label={t('app_inpanel_tabs_aria')}
              >
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
                  <button
                    id="inpanel-tab-tools-settings"
                    type="button"
                    role="tab"
                    aria-selected={mainPanel === 'toolsSettings'}
                    aria-controls="inpanel-panel-tools-settings"
                    aria-label={t('app_nav_settings')}
                    className={
                      mainPanel === 'toolsSettings'
                        ? 'select-research__inpanel-tab select-research__inpanel-tab--tools-settings select-research__inpanel-tab--on'
                        : 'select-research__inpanel-tab select-research__inpanel-tab--tools-settings'
                    }
                    onClick={() => setMainPanel('toolsSettings')}
                  >
                    {t('app_nav_settings')}
                  </button>
                </nav>

                <div
                  ref={setInpanelPresetsMount}
                  className="select-research__inpanel-presets-slot"
                  hidden={
                    mainPanel !== 'research' &&
                    mainPanel !== 'workshop' &&
                    mainPanel !== 'bots' &&
                    mainPanel !== 'modules' &&
                    mainPanel !== 'cards' &&
                    mainPanel !== 'relics' &&
                    mainPanel !== 'themes'
                  }
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
                    mainPanel !== 'themes'
                  }
                />

                <div
                  id="inpanel-panel-lab"
                  role="tabpanel"
                  aria-labelledby="inpanel-tab-lab"
                  hidden={mainPanel !== 'research'}
                >
                  <SelectResearch
                    ref={labToolsRef}
                    data={data}
                    embeddedInPanel
                    embeddedPresetsMount={inpanelPresetsMount}
                  />
                </div>
                <div
                  id="inpanel-panel-workshop"
                  role="tabpanel"
                  aria-labelledby="inpanel-tab-workshop"
                  hidden={mainPanel !== 'workshop'}
                >
                  <WorkshopPage
                    embeddedInPanel
                    toolbarMount={
                      mainPanel === 'workshop'
                        ? inpanelWorkshopToolbarMount
                        : null
                    }
                    researchData={data}
                  />
                </div>
                <div
                  id="inpanel-panel-bots"
                  role="tabpanel"
                  aria-labelledby="inpanel-tab-bots"
                  hidden={mainPanel !== 'bots'}
                >
                  <BotsPage
                    embeddedInPanel
                    toolbarMount={
                      mainPanel === 'bots' ? inpanelWorkshopToolbarMount : null
                    }
                    researchData={data}
                  />
                </div>
                <div
                  id="inpanel-panel-cards"
                  role="tabpanel"
                  aria-labelledby="inpanel-tab-cards"
                  hidden={mainPanel !== 'cards'}
                >
                  <CardsPage
                    embeddedInPanel
                    toolbarMount={
                      mainPanel === 'cards' ? inpanelWorkshopToolbarMount : null
                    }
                    researchData={data}
                  />
                </div>
                <div
                  id="inpanel-panel-modules"
                  role="tabpanel"
                  aria-labelledby="inpanel-tab-modules"
                  hidden={mainPanel !== 'modules'}
                >
                  <ModulesPage
                    embeddedInPanel
                    toolbarMount={
                      mainPanel === 'modules' ? inpanelWorkshopToolbarMount : null
                    }
                    researchData={data}
                  />
                </div>
                <div
                  id="inpanel-panel-themes"
                  role="tabpanel"
                  aria-labelledby="inpanel-tab-themes"
                  hidden={mainPanel !== 'themes'}
                >
                  <ThemesPage
                    embeddedInPanel
                    toolbarMount={
                      mainPanel === 'themes' ? inpanelWorkshopToolbarMount : null
                    }
                  />
                </div>
                <div
                  id="inpanel-panel-relics"
                  role="tabpanel"
                  aria-labelledby="inpanel-tab-relics"
                  hidden={mainPanel !== 'relics'}
                >
                  <RelicsPage
                    embeddedInPanel
                    toolbarMount={
                      mainPanel === 'relics' ? inpanelWorkshopToolbarMount : null
                    }
                  />
                </div>
                <div
                  id="inpanel-panel-tools-settings"
                  role="tabpanel"
                  aria-labelledby="inpanel-tab-tools-settings"
                  hidden={mainPanel !== 'toolsSettings'}
                >
                  <ToolsSettingsPage
                    labToolsRef={labToolsRef}
                    galleryListRefreshToken={galleryListRefreshToken}
                    onGalleryMutated={() => setGalleryListRefreshToken((n) => n + 1)}
                  />
                </div>
                <div
                  id="inpanel-panel-gallery"
                  role="tabpanel"
                  aria-labelledby="inpanel-tab-gallery"
                  hidden={mainPanel !== 'gallery'}
                >
                  <TowerGalleryPanel
                    labToolsRef={labToolsRef}
                    onTowerLoaded={() => setMainPanel('research')}
                    listRefreshToken={galleryListRefreshToken}
                  />
                </div>

                <footer className="select-research__site-footer">
                  <div className="select-research__site-footer-auth">
                    <AuthButton />
                  </div>
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
              </section>
            </div>
          </div>
          </TowerWorkspaceProvider>
        ) : null}
      </main>
    </div>
  )
}

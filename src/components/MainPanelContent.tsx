import { lazy, Suspense, useCallback, useState, type ReactNode, type RefObject } from 'react'
import type { SelectResearchHandle } from '../lab/labToolsTypes'
import type { MainPanel } from '../mainPanelStorage'
import type { ResearchData } from '../types/research'
import { PanelErrorBoundary } from './PanelErrorBoundary'
import { useI18n } from '../i18n'

const SelectResearch = lazy(() =>
  import('./SelectResearch').then((m) => ({ default: m.SelectResearch })),
)
const WorkshopPage = lazy(() =>
  import('./WorkshopPage').then((m) => ({ default: m.WorkshopPage })),
)
const BotsPage = lazy(() => import('./BotsPage').then((m) => ({ default: m.BotsPage })))
const CardsPage = lazy(() => import('./CardsPage').then((m) => ({ default: m.CardsPage })))
const ModulesPage = lazy(() =>
  import('./ModulesPage').then((m) => ({ default: m.ModulesPage })),
)
const ThemesPage = lazy(() =>
  import('./ThemesPage').then((m) => ({ default: m.ThemesPage })),
)
const RelicsPage = lazy(() =>
  import('./RelicsPage').then((m) => ({ default: m.RelicsPage })),
)
const VaultPage = lazy(() =>
  import('./VaultPage').then((m) => ({ default: m.VaultPage })),
)
const GuardiansPage = lazy(() =>
  import('./GuardiansPage').then((m) => ({ default: m.GuardiansPage })),
)
const ToolsSettingsPage = lazy(() =>
  import('./ToolsSettingsPage').then((m) => ({ default: m.ToolsSettingsPage })),
)
const TowerGalleryPanel = lazy(() =>
  import('./TowerGalleryPanel').then((m) => ({ default: m.TowerGalleryPanel })),
)

function PanelFallback() {
  const { t } = useI18n()
  return (
    <p className="app-status" role="status">
      {t('app_loadingResearch')}
    </p>
  )
}

type PanelTabShellProps = {
  panel: MainPanel
  panelLabel: string
  boundaryKey: number
  onReloadPanel: () => void
  id: string
  labelledBy?: string
  ariaLabel?: string
  /** Keep mounted for overlays (import/share) usable from other tabs. */
  hidden?: boolean
  children: ReactNode
}

function PanelTabShell({
  panel,
  panelLabel,
  boundaryKey,
  onReloadPanel,
  id,
  labelledBy,
  ariaLabel,
  hidden = false,
  children,
}: PanelTabShellProps) {
  return (
    <div
      id={id}
      role="tabpanel"
      hidden={hidden ? true : undefined}
      aria-hidden={hidden ? true : undefined}
      {...(labelledBy ? { 'aria-labelledby': labelledBy } : {})}
      {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
    >
      <PanelErrorBoundary
        panelId={panel}
        panelLabel={panelLabel}
        resetKey={boundaryKey}
        onReload={onReloadPanel}
      >
        {children}
      </PanelErrorBoundary>
    </div>
  )
}

type MainPanelContentProps = {
  mainPanel: MainPanel
  data: ResearchData
  labToolsRef: RefObject<SelectResearchHandle | null>
  inpanelWorkshopToolbarMount: HTMLDivElement | null
  galleryListRefreshToken: number
  onGalleryMutated: () => void
  onOpenTowerBackup: () => void
  onRefreshResearch?: () => void | Promise<void>
  researchRefreshing?: boolean
}

export function MainPanelContent({
  mainPanel,
  data,
  labToolsRef,
  inpanelWorkshopToolbarMount,
  galleryListRefreshToken,
  onGalleryMutated,
  onOpenTowerBackup,
  onRefreshResearch,
  researchRefreshing = false,
}: MainPanelContentProps) {
  const { t } = useI18n()
  const [panelResetKey, setPanelResetKey] = useState(0)
  const reloadPanel = useCallback(() => {
    setPanelResetKey((key) => key + 1)
  }, [])

  const boundaryKey = panelResetKey

  const workshopToolbarMount =
    mainPanel === 'workshop' ||
    mainPanel === 'bots' ||
    mainPanel === 'cards' ||
    mainPanel === 'relics' ||
    mainPanel === 'modules' ||
    mainPanel === 'themes' ||
    mainPanel === 'guardians' ||
    mainPanel === 'vault'
      ? inpanelWorkshopToolbarMount
      : null

  const shellProps = {
    boundaryKey,
    onReloadPanel: reloadPanel,
  }

  return (
    <Suspense fallback={<PanelFallback />}>
      <PanelTabShell
        panel="research"
        panelLabel={t('app_nav_research')}
        id="inpanel-panel-lab"
        labelledBy="inpanel-tab-lab"
        hidden={mainPanel !== 'research'}
        {...shellProps}
      >
        <SelectResearch data={data} embeddedInPanel />
      </PanelTabShell>

      {mainPanel === 'workshop' ? (
        <PanelTabShell
          panel="workshop"
          panelLabel={t('app_nav_workshop')}
          id="inpanel-panel-workshop"
          labelledBy="inpanel-tab-workshop"
          {...shellProps}
        >
          <WorkshopPage
            embeddedInPanel
            toolbarMount={workshopToolbarMount}
            researchData={data}
          />
        </PanelTabShell>
      ) : null}

      {mainPanel === 'bots' ? (
        <PanelTabShell
          panel="bots"
          panelLabel={t('app_nav_bots')}
          id="inpanel-panel-bots"
          labelledBy="inpanel-tab-bots"
          {...shellProps}
        >
          <BotsPage
            embeddedInPanel
            toolbarMount={workshopToolbarMount}
            researchData={data}
          />
        </PanelTabShell>
      ) : null}

      {mainPanel === 'cards' ? (
        <PanelTabShell
          panel="cards"
          panelLabel={t('app_nav_cards')}
          id="inpanel-panel-cards"
          labelledBy="inpanel-tab-cards"
          {...shellProps}
        >
          <CardsPage
            embeddedInPanel
            toolbarMount={workshopToolbarMount}
            researchData={data}
          />
        </PanelTabShell>
      ) : null}

      {mainPanel === 'modules' ? (
        <PanelTabShell
          panel="modules"
          panelLabel={t('app_nav_modules')}
          id="inpanel-panel-modules"
          labelledBy="inpanel-tab-modules"
          {...shellProps}
        >
          <ModulesPage
            embeddedInPanel
            toolbarMount={workshopToolbarMount}
            researchData={data}
          />
        </PanelTabShell>
      ) : null}

      {mainPanel === 'themes' ? (
        <PanelTabShell
          panel="themes"
          panelLabel={t('app_nav_themes')}
          id="inpanel-panel-themes"
          labelledBy="inpanel-tab-themes"
          {...shellProps}
        >
          <ThemesPage embeddedInPanel toolbarMount={workshopToolbarMount} />
        </PanelTabShell>
      ) : null}

      {mainPanel === 'relics' ? (
        <PanelTabShell
          panel="relics"
          panelLabel={t('app_nav_relics')}
          id="inpanel-panel-relics"
          labelledBy="inpanel-tab-relics"
          {...shellProps}
        >
          <RelicsPage embeddedInPanel toolbarMount={workshopToolbarMount} />
        </PanelTabShell>
      ) : null}

      {mainPanel === 'vault' ? (
        <PanelTabShell
          panel="vault"
          panelLabel={t('app_nav_vault')}
          id="inpanel-panel-vault"
          labelledBy="inpanel-tab-vault"
          {...shellProps}
        >
          <VaultPage embeddedInPanel toolbarMount={workshopToolbarMount} />
        </PanelTabShell>
      ) : null}

      {mainPanel === 'guardians' ? (
        <PanelTabShell
          panel="guardians"
          panelLabel={t('app_nav_guardians')}
          id="inpanel-panel-guardians"
          labelledBy="inpanel-tab-guardians"
          {...shellProps}
        >
          <GuardiansPage embeddedInPanel toolbarMount={workshopToolbarMount} />
        </PanelTabShell>
      ) : null}

      {mainPanel === 'toolsSettings' ? (
        <PanelTabShell
          panel="toolsSettings"
          panelLabel={t('app_nav_settings')}
          id="inpanel-panel-tools-settings"
          ariaLabel={t('app_nav_settings')}
          {...shellProps}
        >
          <ToolsSettingsPage
            onOpenTowerBackup={onOpenTowerBackup}
            isActive
            galleryListRefreshToken={galleryListRefreshToken}
            onGalleryMutated={onGalleryMutated}
            onRefreshResearch={onRefreshResearch}
            researchRefreshing={researchRefreshing}
          />
        </PanelTabShell>
      ) : null}

      {mainPanel === 'gallery' ? (
        <PanelTabShell
          panel="gallery"
          panelLabel={t('app_nav_gallery')}
          id="inpanel-panel-gallery"
          labelledBy="inpanel-tab-gallery"
          {...shellProps}
        >
          <TowerGalleryPanel
            labToolsRef={labToolsRef}
            isActive
            listRefreshToken={galleryListRefreshToken}
          />
        </PanelTabShell>
      ) : null}
    </Suspense>
  )
}

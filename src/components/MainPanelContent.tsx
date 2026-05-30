import { lazy, Suspense, type RefObject } from 'react'
import type { SelectResearchHandle } from '../lab/labToolsTypes'
import type { MainPanel } from '../mainPanelStorage'
import type { ResearchData } from '../types/research'
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

type MainPanelContentProps = {
  mainPanel: MainPanel
  data: ResearchData
  labToolsRef: RefObject<SelectResearchHandle | null>
  inpanelWorkshopToolbarMount: HTMLDivElement | null
  galleryListRefreshToken: number
  onGalleryMutated: () => void
}

export function MainPanelContent({
  mainPanel,
  data,
  labToolsRef,
  inpanelWorkshopToolbarMount,
  galleryListRefreshToken,
  onGalleryMutated,
}: MainPanelContentProps) {
  const { t } = useI18n()
  const workshopToolbarMount =
    mainPanel === 'workshop' ||
    mainPanel === 'bots' ||
    mainPanel === 'cards' ||
    mainPanel === 'relics' ||
    mainPanel === 'modules' ||
    mainPanel === 'themes'
      ? inpanelWorkshopToolbarMount
      : null

  return (
    <Suspense fallback={<PanelFallback />}>
      {mainPanel === 'research' ? (
        <div
          id="inpanel-panel-lab"
          role="tabpanel"
          aria-labelledby="inpanel-tab-lab"
        >
          <SelectResearch
            data={data}
            embeddedInPanel
          />
        </div>
      ) : null}

      {mainPanel === 'workshop' ? (
        <div
          id="inpanel-panel-workshop"
          role="tabpanel"
          aria-labelledby="inpanel-tab-workshop"
        >
          <WorkshopPage
            embeddedInPanel
            toolbarMount={workshopToolbarMount}
            researchData={data}
          />
        </div>
      ) : null}

      {mainPanel === 'bots' ? (
        <div
          id="inpanel-panel-bots"
          role="tabpanel"
          aria-labelledby="inpanel-tab-bots"
        >
          <BotsPage
            embeddedInPanel
            toolbarMount={workshopToolbarMount}
            researchData={data}
          />
        </div>
      ) : null}

      {mainPanel === 'cards' ? (
        <div
          id="inpanel-panel-cards"
          role="tabpanel"
          aria-labelledby="inpanel-tab-cards"
        >
          <CardsPage
            embeddedInPanel
            toolbarMount={workshopToolbarMount}
            researchData={data}
          />
        </div>
      ) : null}

      {mainPanel === 'modules' ? (
        <div
          id="inpanel-panel-modules"
          role="tabpanel"
          aria-labelledby="inpanel-tab-modules"
        >
          <ModulesPage
            embeddedInPanel
            toolbarMount={workshopToolbarMount}
            researchData={data}
          />
        </div>
      ) : null}

      {mainPanel === 'themes' ? (
        <div
          id="inpanel-panel-themes"
          role="tabpanel"
          aria-labelledby="inpanel-tab-themes"
        >
          <ThemesPage embeddedInPanel toolbarMount={workshopToolbarMount} />
        </div>
      ) : null}

      {mainPanel === 'relics' ? (
        <div
          id="inpanel-panel-relics"
          role="tabpanel"
          aria-labelledby="inpanel-tab-relics"
        >
          <RelicsPage embeddedInPanel toolbarMount={workshopToolbarMount} />
        </div>
      ) : null}

      {mainPanel === 'toolsSettings' ? (
        <div
          id="inpanel-panel-tools-settings"
          role="tabpanel"
          aria-label={t('app_nav_settings')}
        >
          <ToolsSettingsPage
            labToolsRef={labToolsRef}
            isActive
            galleryListRefreshToken={galleryListRefreshToken}
            onGalleryMutated={onGalleryMutated}
          />
        </div>
      ) : null}

      {mainPanel === 'gallery' ? (
        <div
          id="inpanel-panel-gallery"
          role="tabpanel"
          aria-labelledby="inpanel-tab-gallery"
        >
          <TowerGalleryPanel
            labToolsRef={labToolsRef}
            isActive
            listRefreshToken={galleryListRefreshToken}
          />
        </div>
      ) : null}
    </Suspense>
  )
}

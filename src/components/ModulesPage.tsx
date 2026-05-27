import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { WorkshopModulesPanel } from './WorkshopModulesPanel'
import {
  type WorkshopPersistedV1,
} from '../labPresetsStorage'
import { useTowerWorkspaceContext } from '../TowerBuildContext'
import { resetTowerBuildModules, splitTowerBuild } from '../towerBuildStorage'
import { useI18n } from '../i18n'
import type { ResearchData } from '../types/research'

type ModulesPageProps = {
  embeddedInPanel?: boolean
  toolbarMount?: HTMLDivElement | null
  researchData: ResearchData | null
}

function modulesOverlayPortal(node: ReactNode) {
  return createPortal(node, document.body)
}

function ModulesToolbarQuick({ onResetModules }: { onResetModules: () => void }) {
  const { t } = useI18n()
  return (
    <div className="select-research__toolbar-quick select-research__toolbar-quick--modules-only">
      <button
        type="button"
        className="glow-btn glow-btn--danger glow-btn--block"
        onClick={onResetModules}
        aria-label={t('sr_reset_modules_aria')}
      >
        {t('sr_reset_modules')}
      </button>
    </div>
  )
}

export function ModulesPage({
  embeddedInPanel = false,
  toolbarMount = null,
  researchData,
}: ModulesPageProps) {
  const { t } = useI18n()
  const { workshopFlat, setTowerBuild, setScratchTowerBuild, labLevelOverrides } =
    useTowerWorkspaceContext()
  const [resetModulesConfirmOpen, setResetModulesConfirmOpen] = useState(false)
  const workshopPersistedRef = useRef(workshopFlat)

  useEffect(() => {
    workshopPersistedRef.current = workshopFlat
  }, [workshopFlat])

  const onWorkshopPersistedChange = useCallback(
    (next: WorkshopPersistedV1) => {
      setTowerBuild(splitTowerBuild(next))
    },
    [setTowerBuild],
  )

  const openResetModulesConfirm = useCallback(() => {
    setResetModulesConfirmOpen(true)
  }, [])

  const performResetModules = useCallback(() => {
    setResetModulesConfirmOpen(false)
    setTowerBuild((prev) => resetTowerBuildModules(prev))
    setScratchTowerBuild((prev) => resetTowerBuildModules(prev))
  }, [setScratchTowerBuild, setTowerBuild])

  useEffect(() => {
    if (!resetModulesConfirmOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setResetModulesConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resetModulesConfirmOpen])

  return (
    <div
      className={embeddedInPanel ? 'workshop workshop--embedded' : 'workshop'}
      aria-label={t('ws_section_modules')}
    >
      {embeddedInPanel && toolbarMount
        ? createPortal(
            <ModulesToolbarQuick onResetModules={openResetModulesConfirm} />,
            toolbarMount,
          )
        : null}

      <WorkshopModulesPanel
        workshopPersisted={workshopFlat}
        onWorkshopPersistedChange={onWorkshopPersistedChange}
        researchData={researchData}
        labLevelOverrides={labLevelOverrides}
      />

      {resetModulesConfirmOpen
        ? modulesOverlayPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => setResetModulesConfirmOpen(false)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="reset-modules-confirm-title"
                aria-describedby="reset-modules-confirm-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id="reset-modules-confirm-title"
                  className="select-research__reset-confirm-title"
                >
                  {t('sr_reset_modules_confirm_title')}
                </h2>
                <p
                  id="reset-modules-confirm-desc"
                  className="select-research__reset-confirm-desc"
                >
                  {t('sr_reset_modules_confirm_body')}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setResetModulesConfirmOpen(false)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    onClick={performResetModules}
                  >
                    {t('sr_reset_modules')}
                  </button>
                </div>
              </div>
            </div>,
          )
        : null}
    </div>
  )
}

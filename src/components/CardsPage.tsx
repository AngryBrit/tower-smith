import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { WorkshopCardsPanel } from './WorkshopCardsPanel'
import { maxWorkshopCardStars } from '../labPresetsStorage'
import { useTowerWorkspaceContext } from '../TowerBuildContext'
import { resetTowerBuildCards, splitTowerBuild, flattenTowerBuild } from '../towerBuildStorage'
import { useI18n } from '../i18n'
import type { ResearchData } from '../types/research'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'

type CardsPageProps = {
  embeddedInPanel?: boolean
  toolbarMount?: HTMLDivElement | null
  researchData: ResearchData | null
}

function cardsOverlayPortal(node: ReactNode) {
  return createPortal(node, document.body)
}

function CardsToolbarQuick({
  onMaxAll,
  onResetCards,
}: {
  onMaxAll: () => void
  onResetCards: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="select-research__toolbar-quick select-research__toolbar-quick--cards-only">
      <button
        type="button"
        className="glow-btn glow-btn--block"
        onClick={onMaxAll}
        aria-label={t('sr_max_all_cards_aria')}
      >
        {t('sr_max_all')}
      </button>
      <button
        type="button"
        className="glow-btn glow-btn--danger glow-btn--block"
        onClick={onResetCards}
        aria-label={t('sr_reset_cards_aria')}
      >
        {t('sr_reset_cards')}
      </button>
    </div>
  )
}

export function CardsPage({
  embeddedInPanel = false,
  toolbarMount = null,
  researchData,
}: CardsPageProps) {
  const { t } = useI18n()
  const { workshopFlat, setTowerBuild, setScratchTowerBuild, labLevelOverrides } =
    useTowerWorkspaceContext()
  const [resetCardsConfirmOpen, setResetCardsConfirmOpen] = useState(false)
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

  const openResetCardsConfirm = useCallback(() => {
    setResetCardsConfirmOpen(true)
  }, [])

  const performResetCards = useCallback(() => {
    setResetCardsConfirmOpen(false)
    setTowerBuild((prev) => resetTowerBuildCards(prev))
    setScratchTowerBuild((prev) => resetTowerBuildCards(prev))
  }, [setScratchTowerBuild, setTowerBuild])

  const maxAllCards = useCallback(() => {
    const next = maxWorkshopCardStars(workshopPersistedRef.current)
    onWorkshopPersistedChange(next)
    setScratchTowerBuild((prev) =>
      splitTowerBuild(maxWorkshopCardStars(flattenTowerBuild(prev))),
    )
  }, [onWorkshopPersistedChange, setScratchTowerBuild])

  useEffect(() => {
    if (!resetCardsConfirmOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setResetCardsConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resetCardsConfirmOpen])

  return (
    <div
      className={embeddedInPanel ? 'workshop workshop--embedded' : 'workshop'}
      aria-label={t('ws_section_cards')}
    >
      {embeddedInPanel && toolbarMount
        ? createPortal(
            <CardsToolbarQuick
              onMaxAll={maxAllCards}
              onResetCards={openResetCardsConfirm}
            />,
            toolbarMount,
          )
        : null}

      <WorkshopCardsPanel
        workshopPersisted={workshopFlat}
        onWorkshopPersistedChange={onWorkshopPersistedChange}
        researchData={researchData}
        labLevelOverrides={labLevelOverrides}
      />

      {resetCardsConfirmOpen
        ? cardsOverlayPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => setResetCardsConfirmOpen(false)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="reset-cards-confirm-title"
                aria-describedby="reset-cards-confirm-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id="reset-cards-confirm-title"
                  className="select-research__reset-confirm-title"
                >
                  {t('sr_reset_cards_confirm_title')}
                </h2>
                <p id="reset-cards-confirm-desc" className="select-research__reset-confirm-desc">
                  {t('sr_reset_cards_confirm_body')}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setResetCardsConfirmOpen(false)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    onClick={performResetCards}
                  >
                    {t('sr_reset_cards')}
                  </button>
                </div>
              </div>
            </div>,
          )
        : null}
    </div>
  )
}

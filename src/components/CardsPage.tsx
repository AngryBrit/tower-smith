import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { createPortal } from 'react-dom'
import { WorkshopCardsPanel } from './WorkshopCardsPanel'
import {
  maxWorkshopCardStars,
  resetWorkshopCards,
  type WorkshopPersistedV1,
} from '../labPresetsStorage'
import { useI18n } from '../i18n'
import type { ResearchData } from '../types/research'

type CardsPageProps = {
  embeddedInPanel?: boolean
  toolbarMount?: HTMLDivElement | null
  workshopPersisted: WorkshopPersistedV1
  onWorkshopPersistedChange: (next: WorkshopPersistedV1) => void
  onScratchWorkshopPersistedChange?: Dispatch<SetStateAction<WorkshopPersistedV1>>
  researchData: ResearchData | null
  labLevelOverrides: Record<string, number>
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
  workshopPersisted,
  onWorkshopPersistedChange,
  onScratchWorkshopPersistedChange,
  researchData,
  labLevelOverrides,
}: CardsPageProps) {
  const { t } = useI18n()
  const [resetCardsConfirmOpen, setResetCardsConfirmOpen] = useState(false)
  const workshopPersistedRef = useRef(workshopPersisted)

  useEffect(() => {
    workshopPersistedRef.current = workshopPersisted
  }, [workshopPersisted])

  const openResetCardsConfirm = useCallback(() => {
    setResetCardsConfirmOpen(true)
  }, [])

  const performResetCards = useCallback(() => {
    setResetCardsConfirmOpen(false)
    onWorkshopPersistedChange(resetWorkshopCards(workshopPersistedRef.current))
    onScratchWorkshopPersistedChange?.((prev) => resetWorkshopCards(prev))
  }, [onScratchWorkshopPersistedChange, onWorkshopPersistedChange])

  const maxAllCards = useCallback(() => {
    const next = maxWorkshopCardStars(workshopPersistedRef.current)
    onWorkshopPersistedChange(next)
    onScratchWorkshopPersistedChange?.((prev) => maxWorkshopCardStars(prev))
  }, [onScratchWorkshopPersistedChange, onWorkshopPersistedChange])

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
        workshopPersisted={workshopPersisted}
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
                <p
                  id="reset-cards-confirm-desc"
                  className="select-research__reset-confirm-desc"
                >
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

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { WorkshopRelicsPanel } from './WorkshopRelicsPanel'
import {
  type WorkshopPersistedV1,
} from '../labPresetsStorage'
import { useTowerBuildContext } from '../TowerBuildContext'
import { resetTowerBuildRelics, splitTowerBuild } from '../towerBuildStorage'
import { useI18n } from '../i18n'

type RelicsPageProps = {
  embeddedInPanel?: boolean
  toolbarMount?: HTMLDivElement | null
}

function relicsOverlayPortal(node: ReactNode) {
  return createPortal(node, document.body)
}

function RelicsToolbar({
  onResetRelics,
  search,
  onSearchChange,
  searchInputRef,
}: {
  onResetRelics: () => void
  search: string
  onSearchChange: (value: string) => void
  searchInputRef: RefObject<HTMLInputElement | null>
}) {
  const { t } = useI18n()
  const searchFieldId = 'relics-search'
  const searchSlashHintId = 'relics-search-slash-hint'
  return (
    <div className="select-research__toolbar">
      <div className="select-research__toolbar-quick select-research__toolbar-quick--relics-only">
        <button
          type="button"
          className="glow-btn glow-btn--danger glow-btn--block"
          onClick={onResetRelics}
          aria-label={t('sr_reset_relics_aria')}
        >
          {t('sr_reset_relics')}
        </button>
      </div>
      <label className="visually-hidden" htmlFor={searchFieldId}>
        {t('ws_relics_search_label_hidden')}
      </label>
      <input
        ref={searchInputRef}
        id={searchFieldId}
        className="select-research__search glow-input"
        type="search"
        placeholder={t('ws_relics_search_placeholder')}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        autoComplete="off"
        aria-describedby={searchSlashHintId}
      />
      <p id={searchSlashHintId} className="visually-hidden">
        {t('ws_relics_search_slash_hint')}
      </p>
    </div>
  )
}

export function RelicsPage({
  embeddedInPanel = false,
  toolbarMount = null,
}: RelicsPageProps) {
  const { t } = useI18n()
  const { workshopFlat, setTowerBuild, setScratchTowerBuild } = useTowerBuildContext()
  const [search, setSearch] = useState('')
  const [resetRelicsConfirmOpen, setResetRelicsConfirmOpen] = useState(false)
  const workshopPersistedRef = useRef(workshopFlat)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    workshopPersistedRef.current = workshopFlat
  }, [workshopFlat])

  const onWorkshopPersistedChange = useCallback(
    (next: WorkshopPersistedV1) => {
      setTowerBuild(splitTowerBuild(next))
    },
    [setTowerBuild],
  )

  const openResetRelicsConfirm = useCallback(() => {
    setResetRelicsConfirmOpen(true)
  }, [])

  const performResetRelics = useCallback(() => {
    setResetRelicsConfirmOpen(false)
    setTowerBuild((prev) => resetTowerBuildRelics(prev))
    setScratchTowerBuild((prev) => resetTowerBuildRelics(prev))
  }, [setScratchTowerBuild, setTowerBuild])

  useEffect(() => {
    if (!resetRelicsConfirmOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setResetRelicsConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resetRelicsConfirmOpen])

  useEffect(() => {
    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.repeat) return
      const panel = document.getElementById('inpanel-panel-relics')
      if (!panel || panel.hidden) return
      if (e.target === searchInputRef.current) return
      const target = e.target
      if (target instanceof HTMLElement && target.isContentEditable) return
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
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

  const toolbar = (
    <RelicsToolbar
      onResetRelics={openResetRelicsConfirm}
      search={search}
      onSearchChange={setSearch}
      searchInputRef={searchInputRef}
    />
  )

  return (
    <div
      className={embeddedInPanel ? 'workshop workshop--embedded' : 'workshop'}
      aria-label={t('ws_section_relics')}
    >
      {embeddedInPanel && toolbarMount
        ? createPortal(toolbar, toolbarMount)
        : toolbar}

      <WorkshopRelicsPanel
        workshopPersisted={workshopFlat}
        onWorkshopPersistedChange={onWorkshopPersistedChange}
        searchQuery={search}
      />

      {resetRelicsConfirmOpen
        ? relicsOverlayPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => setResetRelicsConfirmOpen(false)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="reset-relics-confirm-title"
                aria-describedby="reset-relics-confirm-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id="reset-relics-confirm-title"
                  className="select-research__reset-confirm-title"
                >
                  {t('sr_reset_relics_confirm_title')}
                </h2>
                <p
                  id="reset-relics-confirm-desc"
                  className="select-research__reset-confirm-desc"
                >
                  {t('sr_reset_relics_confirm_body')}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setResetRelicsConfirmOpen(false)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    onClick={performResetRelics}
                  >
                    {t('sr_reset_relics')}
                  </button>
                </div>
              </div>
            </div>,
          )
        : null}
    </div>
  )
}

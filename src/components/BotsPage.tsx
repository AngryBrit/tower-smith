import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { WorkshopBotCard } from './WorkshopBotCard'
import {
  WORKSHOP_BOT_ORDER,
  WORKSHOP_BOT_SPECIAL_BY_BOT,
  workshopBotActiveKey,
  workshopBotSpecialClampLevel,
  workshopBotSpecialLevel,
  workshopBotSpecialLevelKey,
  workshopBotSpecialStonePurchased,
  workshopAllBotsOwnedForPlus,
  workshopBotClampLevel,
  workshopBotIsActive,
  workshopBotIsOwned,
  workshopBotOwnedKey,
  workshopBotUnlockCostForBot,
  type WorkshopBotId,
  type WorkshopBotUpgradeKey,
} from '../data/workshopBots'
import {
  maxWorkshopBots,
  type WorkshopPersistedV1,
} from '../labPresetsStorage'
import { useTowerWorkspaceContext } from '../towerWorkspaceContext'
import { resetTowerBuildBots, splitTowerBuild } from '../towerBuildStorage'
import { useWorkspaceUndo } from '../lab/workspaceUndoContext'
import { useBudgetPanelsVisible } from '../budgetPanelsVisibility'
import { useI18n } from '../i18n'
import { buildWorkshopBotLabDisplayOpts } from '../data/workshopLabDisplayOpts'
import { enrichBotLabDisplayOpts } from '../data/workshopRelicWorkshopDisplay'
import type { ResearchData } from '../types/research'
import {
  computeWorkshopBotMedalAggregates,
  formatWorkshopBotMedalAggregates,
} from '../workshopBotBudgetAggregates'

const BOTS_BUDGET_COLLAPSED_STORAGE_KEY = 'tower-export-bots-budget-collapsed-v1'

type BotsPageProps = {
  embeddedInPanel?: boolean
  toolbarMount?: HTMLDivElement | null
  researchData?: ResearchData | null
}

function botsOverlayPortal(node: ReactNode) {
  return createPortal(node, document.body)
}

function BotsToolbar({
  onMaxAll,
  onResetBots,
}: {
  onMaxAll: () => void
  onResetBots: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="select-research__toolbar-quick select-research__toolbar-quick--bots-only">
      <button
        type="button"
        className="glow-btn glow-btn--block"
        onClick={onMaxAll}
        aria-label={t('sr_max_all_bots_aria')}
      >
        {t('sr_max_all')}
      </button>
      <button
        type="button"
        className="glow-btn glow-btn--danger glow-btn--block"
        onClick={onResetBots}
        aria-label={t('ws_reset_bots_demo')}
      >
        {t('ws_reset_bots_demo')}
      </button>
    </div>
  )
}

export function BotsPage({
  embeddedInPanel = false,
  toolbarMount = null,
  researchData = null,
}: BotsPageProps) {
  const { t, fmt } = useI18n()
  const [budgetPanelsVisible] = useBudgetPanelsVisible()
  const botsBudgetTitleId = useId().replace(/:/g, '')
  const botsBudgetBodyId = useId().replace(/:/g, '')
  const [botsBudgetCollapsed, setBotsBudgetCollapsed] = useState(() => {
    try {
      return localStorage.getItem(BOTS_BUDGET_COLLAPSED_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const { pushUndoSnapshot } = useWorkspaceUndo()
  const { workshopFlat, setTowerBuild, labLevelOverrides } = useTowerWorkspaceContext()
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const workshopPersistedRef = useRef(workshopFlat)

  useEffect(() => {
    workshopPersistedRef.current = workshopFlat
  }, [workshopFlat])

  useEffect(() => {
    try {
      localStorage.setItem(
        BOTS_BUDGET_COLLAPSED_STORAGE_KEY,
        botsBudgetCollapsed ? '1' : '0',
      )
    } catch {
      /* ignore quota / private mode */
    }
  }, [botsBudgetCollapsed])

  const botsMedalAggregates = useMemo(
    () => computeWorkshopBotMedalAggregates(workshopFlat),
    [workshopFlat],
  )
  const botsMedalLabels = useMemo(
    () => formatWorkshopBotMedalAggregates(botsMedalAggregates),
    [botsMedalAggregates],
  )

  const onWorkshopPersistedChange = useCallback(
    (next: WorkshopPersistedV1) => {
      setTowerBuild(splitTowerBuild(next))
    },
    [setTowerBuild],
  )

  const relicOwnedSet = useMemo(
    () => new Set(workshopFlat.relicOwnedIds),
    [workshopFlat.relicOwnedIds],
  )

  const botLabDisplayOpts = useMemo(
    () =>
      enrichBotLabDisplayOpts(
        buildWorkshopBotLabDisplayOpts(researchData, labLevelOverrides),
        relicOwnedSet,
      ),
    [researchData, labLevelOverrides, relicOwnedSet],
  )

  const bumpBot = useCallback(
    (key: WorkshopBotUpgradeKey, direction: -1 | 1) => {
      const ws = workshopPersistedRef.current
      const cur = ws[key] ?? 0
      const nv = workshopBotClampLevel(key, cur + direction)
      if (nv === cur) return
      onWorkshopPersistedChange({ ...ws, [key]: nv })
    },
    [onWorkshopPersistedChange],
  )

  const setBotLevel = useCallback(
    (key: WorkshopBotUpgradeKey, level: number) => {
      const ws = workshopPersistedRef.current
      const nv = workshopBotClampLevel(key, level)
      if (nv === (ws[key] ?? 0)) return
      onWorkshopPersistedChange({ ...ws, [key]: nv })
    },
    [onWorkshopPersistedChange],
  )

  const toggleBotActive = useCallback(
    (botId: WorkshopBotId) => {
      const ws = workshopPersistedRef.current
      const key = workshopBotActiveKey(botId)
      onWorkshopPersistedChange({
        ...ws,
        [key]: !workshopBotIsActive(ws, botId),
      })
    },
    [onWorkshopPersistedChange],
  )

  const unlockBot = useCallback(
    (botId: WorkshopBotId) => {
      const ws = workshopPersistedRef.current
      if (workshopBotIsOwned(ws, botId)) return
      if (workshopBotUnlockCostForBot(ws, botId) == null) return
      onWorkshopPersistedChange({
        ...ws,
        [workshopBotOwnedKey(botId)]: true,
      })
    },
    [onWorkshopPersistedChange],
  )

  const unlockBotSpecial = useCallback(
    (botId: WorkshopBotId) => {
      const ws = workshopPersistedRef.current
      if (!workshopAllBotsOwnedForPlus(ws)) return
      if (workshopBotSpecialStonePurchased(ws, botId)) return
      if (!workshopBotIsActive(ws, botId)) return
      const levelKey = workshopBotSpecialLevelKey(botId)
      const unlockKey = WORKSHOP_BOT_SPECIAL_BY_BOT[botId]
      onWorkshopPersistedChange({
        ...ws,
        [levelKey]: 0,
        [unlockKey]: true,
      })
    },
    [onWorkshopPersistedChange],
  )

  const bumpBotSpecial = useCallback(
    (botId: WorkshopBotId, direction: -1 | 1) => {
      const ws = workshopPersistedRef.current
      if (!workshopBotIsActive(ws, botId)) return
      const levelKey = workshopBotSpecialLevelKey(botId)
      const cur = workshopBotSpecialLevel(ws, botId)
      if (cur < 0) return
      const nv = workshopBotSpecialClampLevel(botId, cur + direction)
      if (nv === cur) return
      onWorkshopPersistedChange({ ...ws, [levelKey]: nv })
    },
    [onWorkshopPersistedChange],
  )

  const setBotSpecialLevel = useCallback(
    (botId: WorkshopBotId, level: number) => {
      const ws = workshopPersistedRef.current
      if (!workshopBotIsActive(ws, botId)) return
      const levelKey = workshopBotSpecialLevelKey(botId)
      const cur = workshopBotSpecialLevel(ws, botId)
      if (cur < 0) return
      const nv = workshopBotSpecialClampLevel(botId, level)
      if (nv === cur) return
      onWorkshopPersistedChange({ ...ws, [levelKey]: nv })
    },
    [onWorkshopPersistedChange],
  )

  const performReset = useCallback(() => {
    setResetConfirmOpen(false)
    pushUndoSnapshot()
    setTowerBuild((prev) => resetTowerBuildBots(prev))
  }, [pushUndoSnapshot, setTowerBuild])

  const maxAllBots = useCallback(() => {
    pushUndoSnapshot()
    onWorkshopPersistedChange(maxWorkshopBots(workshopPersistedRef.current))
  }, [onWorkshopPersistedChange, pushUndoSnapshot])

  useEffect(() => {
    if (!resetConfirmOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setResetConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [resetConfirmOpen])

  return (
    <div
      className={embeddedInPanel ? 'workshop workshop--embedded' : 'workshop'}
      aria-label={t('ws_section_bots')}
    >
      {embeddedInPanel && toolbarMount
        ? createPortal(
            <BotsToolbar
              onMaxAll={maxAllBots}
              onResetBots={() => setResetConfirmOpen(true)}
            />,
            toolbarMount,
          )
        : null}

      {budgetPanelsVisible ? (
        <div
          className={
            botsBudgetCollapsed
              ? 'select-research__budget select-research__budget--collapsed'
              : 'select-research__budget'
          }
          role="region"
          aria-labelledby={botsBudgetTitleId}
        >
          <div className="select-research__budget-head">
            <h2 id={botsBudgetTitleId} className="select-research__budget-title">
              {t('ws_bot_budget_title')}
            </h2>
            <button
              type="button"
              className="select-research__budget-toggle"
              aria-expanded={!botsBudgetCollapsed}
              aria-controls={botsBudgetBodyId}
              aria-label={
                botsBudgetCollapsed
                  ? t('ws_bot_budget_toggle_expand')
                  : t('ws_bot_budget_toggle_collapse')
              }
              onClick={() => setBotsBudgetCollapsed((c) => !c)}
            >
              <span className="select-research__budget-chevron" aria-hidden>
                ▼
              </span>
            </button>
          </div>
          <div
            id={botsBudgetBodyId}
            className="select-research__budget-body"
            hidden={botsBudgetCollapsed}
          >
            <p className="visually-hidden" aria-live="polite" aria-atomic="true">
              {fmt.botsBudgetAria(
                botsMedalLabels.spentLabel,
                botsMedalLabels.toMaxLabel,
                botsMedalLabels.nextVisibleLabel,
              )}
            </p>
            <dl className="select-research__budget-stats">
              <div className="select-research__budget-row">
                <dt>{t('ws_bot_budget_spent_dt')}</dt>
                <dd>{botsMedalLabels.spentLabel}</dd>
              </div>
              <div className="select-research__budget-row">
                <dt>{t('ws_bot_budget_to_max_dt')}</dt>
                <dd>{botsMedalLabels.toMaxLabel}</dd>
              </div>
              <div className="select-research__budget-row">
                <dt>{t('ws_bot_budget_next_dt')}</dt>
                <dd>{botsMedalLabels.nextVisibleLabel}</dd>
              </div>
            </dl>
            <p className="select-research__budget-footnote">
              {t('ws_bot_budget_footnote')}
            </p>
          </div>
        </div>
      ) : null}

      <div className="workshop__body">
        <ul className="workshop__grid workshop__grid--ultimate">
          {WORKSHOP_BOT_ORDER.map((botId) => (
            <WorkshopBotCard
              key={botId}
              botId={botId}
              levels={workshopFlat}
              workshop={workshopFlat}
              botLabDisplayOpts={botLabDisplayOpts}
              onBump={bumpBot}
              onSetLevel={setBotLevel}
              onToggleActive={toggleBotActive}
              onSpecialUnlock={unlockBotSpecial}
              onSpecialBump={bumpBotSpecial}
              onSetSpecialLevel={setBotSpecialLevel}
              onUnlockBot={unlockBot}
            />
          ))}
        </ul>
      </div>

      {resetConfirmOpen
        ? botsOverlayPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => setResetConfirmOpen(false)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="reset-bots-confirm-title"
                aria-describedby="reset-bots-confirm-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id="reset-bots-confirm-title"
                  className="select-research__reset-confirm-title"
                >
                  {t('ws_reset_bots_confirm_title')}
                </h2>
                <p
                  id="reset-bots-confirm-desc"
                  className="select-research__reset-confirm-desc"
                >
                  {t('ws_reset_bots_confirm_body')}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setResetConfirmOpen(false)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    onClick={performReset}
                  >
                    {t('ws_reset_bots_demo')}
                  </button>
                </div>
              </div>
            </div>,
          )
        : null}
    </div>
  )
}

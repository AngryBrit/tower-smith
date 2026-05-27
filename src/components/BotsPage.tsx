import {
  useCallback,
  useEffect,
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
import { useTowerWorkspaceContext } from '../TowerBuildContext'
import { resetTowerBuildBots, splitTowerBuild } from '../towerBuildStorage'
import { useI18n } from '../i18n'
import { buildWorkshopBotLabDisplayOpts } from '../data/workshopLabDisplayOpts'
import { enrichBotLabDisplayOpts } from '../data/workshopRelicWorkshopDisplay'
import type { ResearchData } from '../types/research'

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
  const { t } = useI18n()
  const { workshopFlat, setTowerBuild, labLevelOverrides } = useTowerWorkspaceContext()
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
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

  const performReset = useCallback(() => {
    setResetConfirmOpen(false)
    setTowerBuild((prev) => resetTowerBuildBots(prev))
  }, [setTowerBuild])

  const maxAllBots = useCallback(() => {
    onWorkshopPersistedChange(maxWorkshopBots(workshopPersistedRef.current))
  }, [onWorkshopPersistedChange])

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
              onToggleActive={toggleBotActive}
              onSpecialUnlock={unlockBotSpecial}
              onSpecialBump={bumpBotSpecial}
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

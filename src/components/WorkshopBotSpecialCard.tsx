import { MedalGlyph } from './MedalGlyph'
import { PowerStoneGlyph } from './PowerStoneGlyph'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import {
  workshopBotSpecialLevel,
  workshopBotSpecialStonePurchased,
  workshopBotSpecialMaxLevel,
  workshopBotSpecialNextMarginalMedals,
  workshopBotSpecialStatDisplay,
  workshopBotSpecialUnlockStones,
  type WorkshopBotId,
} from '../data/workshopBots'
import { formatPowerStoneAmount } from '../labCosts'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { WORKSHOP_BOT_SPECIAL_TITLE } from './workshopBotSpecialCardMeta'

const BOT_SPECIAL_STAT_LABEL: Record<WorkshopBotId, StringId> = {
  flame: 'ws_bot_special_stat_damageMult',
  thunder: 'ws_bot_special_stat_attackSpeed',
  golden: 'ws_bot_special_stat_cellsMult',
  amplify: 'ws_uw_stat_quantity',
  botBot: 'ws_bot_special_stat_powerMult',
}

export type WorkshopBotSpecialCardProps = {
  botId: WorkshopBotId
  workshop: WorkshopPersistedV1
  plusEnabled: boolean
  active: boolean
  onBump: (botId: WorkshopBotId, direction: -1 | 1) => void
  onUnlock: (botId: WorkshopBotId) => void
}

export function WorkshopBotSpecialCard({
  botId,
  workshop,
  plusEnabled,
  active,
  onBump,
  onUnlock,
}: WorkshopBotSpecialCardProps) {
  const { t } = useI18n()
  const title = t(WORKSHOP_BOT_SPECIAL_TITLE[botId])
  const stones = workshopBotSpecialUnlockStones()
  const prereqLocked = !plusEnabled
  const runLocked = !active
  const stonePurchased = workshopBotSpecialStonePurchased(workshop, botId)
  const level = workshopBotSpecialLevel(workshop, botId)
  const abilityUnlocked = stonePurchased
  const maxed = abilityUnlocked && level >= workshopBotSpecialMaxLevel(botId)
  const upgradeMedals = abilityUnlocked
    ? workshopBotSpecialNextMarginalMedals(botId, level)
    : undefined
  const statLabel = t(BOT_SPECIAL_STAT_LABEL[botId])
  const effectDisplay = abilityUnlocked ? workshopBotSpecialStatDisplay(botId, level) : '—'

  const barClass = [
    'workshop__uw-plus-bar',
    prereqLocked ? 'workshop__uw-plus-bar--locked' : '',
    !abilityUnlocked && !prereqLocked ? 'workshop__uw-plus-bar--pending' : '',
    abilityUnlocked ? 'workshop__uw-plus-bar--unlocked' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleUnlock = () => {
    if (prereqLocked || runLocked || stonePurchased) return
    onUnlock(botId)
  }

  const handleBump = (direction: -1 | 1) => {
    if (!abilityUnlocked || prereqLocked || runLocked) return
    if (direction < 0 && level <= 0) return
    if (direction > 0 && maxed) return
    onBump(botId, direction)
  }

  return (
    <div className={barClass}>
      <span className="workshop__uw-plus-name">{title}</span>

      {!abilityUnlocked ? (
        <>
          <button
            type="button"
            className="workshop__uw-plus-unlock"
            disabled={prereqLocked || runLocked}
            aria-label={`${title} — ${t('ws_bot_special_purchase_btn')}`}
            title={
              prereqLocked
                ? t('ws_bot_plus_locked_prereq')
                : runLocked
                  ? t('ws_bot_special_unlock_requires_active')
                  : undefined
            }
            onClick={handleUnlock}
          >
            {t('ws_bot_special_purchase_btn')}
          </button>
          <button
            type="button"
            className="workshop__uw-plus-cost"
            disabled={prereqLocked || runLocked}
            aria-label={`${title} — ${t('ws_bot_special_purchase_btn')} ${formatPowerStoneAmount(stones)}`}
            title={
              prereqLocked
                ? t('ws_bot_plus_locked_prereq')
                : t('ws_bot_special_unlock_cost_title')
            }
            onClick={handleUnlock}
          >
            <span>{formatPowerStoneAmount(stones)}</span>
            <PowerStoneGlyph className="workshop__uw-stone" />
          </button>
        </>
      ) : (
        <>
          <p className="workshop__uw-plus-meta">
            <span className="workshop__uw-plus-stat-label">{statLabel}:</span>
            <span className="workshop__uw-plus-effect">{effectDisplay}</span>
          </p>
          <div
            className={
              maxed
                ? 'workshop__uw-plus-controls workshop__uw-plus-controls--max'
                : 'workshop__uw-plus-controls'
            }
          >
            <button
              type="button"
              className="workshop__uw-level-step"
              aria-label={`${title} — ${t('ws_defense_level_down_aria')}`}
              disabled={!active || level <= 0}
              onClick={() => handleBump(-1)}
            >
              −
            </button>
            <div
              className={
                maxed
                  ? 'workshop__uw-plus-cost workshop__uw-plus-cost--display workshop__uw-plus-cost--max'
                  : 'workshop__uw-plus-cost workshop__uw-plus-cost--display'
              }
              title={maxed ? t('ws_max') : t('ws_bot_medal_cost_title')}
            >
              {maxed ? (
                <>
                  <span>{t('ws_max')}</span>
                  <MedalGlyph className="workshop__uw-medal" />
                </>
              ) : (
                <>
                  <span>{formatPowerStoneAmount(upgradeMedals ?? 0)}</span>
                  <MedalGlyph className="workshop__uw-medal" />
                </>
              )}
            </div>
            <button
              type="button"
              className="workshop__uw-level-step"
              aria-label={`${title} — ${t('ws_defense_level_up_aria')}`}
              disabled={!active || maxed}
              onClick={() => handleBump(1)}
            >
              +
            </button>
          </div>
        </>
      )}

      {prereqLocked ? (
        <div
          className="workshop__card-unlock-overlay workshop__uw-plus-prereq-overlay"
          role="status"
        >
          <span className="workshop__card-unlock-hint">{t('ws_bot_plus_locked_prereq')}</span>
        </div>
      ) : null}
    </div>
  )
}

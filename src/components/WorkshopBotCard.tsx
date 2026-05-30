import { MedalGlyph } from './MedalGlyph'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import {
  WORKSHOP_BOT_WEAPON_STATS,
  workshopBotIsActive,
  workshopBotIsOwned,
  workshopBotMaxLevel,
  workshopBotNextMarginalMedals,
  workshopAllBotsOwnedForPlus,
  workshopBotStatDisplay,
  workshopBotUnlockCostForBot,
  type WorkshopBotId,
  type WorkshopBotLabDisplayOpts,
  type WorkshopBotUpgradeKey,
} from '../data/workshopBots'
import { formatPowerStoneAmount } from '../labCosts'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { WORKSHOP_BOT_SPECIAL_TITLE } from './workshopBotSpecialCardMeta'
import { WorkshopBotSpecialCard } from './WorkshopBotSpecialCard'

const BOT_TITLE: Record<WorkshopBotId, StringId> = {
  flame: 'ws_bot_flame',
  thunder: 'ws_bot_thunder',
  golden: 'ws_bot_golden',
  amplify: 'ws_bot_amplify',
  botBot: 'ws_bot_botBot',
}

const BOT_STAT_LABEL: Record<string, StringId> = {
  duration: 'ws_uw_stat_duration',
  cooldown: 'ws_uw_stat_cooldown',
  linger: 'ws_bot_stat_linger',
  bonus: 'ws_uw_stat_bonus',
  damageReduction: 'ws_bot_stat_damageReduction',
  damage: 'ws_uw_stat_damage',
  range: 'ws_bot_stat_range',
}

const BOT_ICON_SRC: Record<WorkshopBotId, string> = {
  flame: '/bots/FlameBot.webp',
  thunder: '/bots/ThunderBot.webp',
  golden: '/bots/GoldenBot.webp',
  amplify: '/bots/AmplifyBot.webp',
  botBot: '/bots/Bot Bot.webp',
}

function BotIcon({ botId }: { botId: WorkshopBotId }) {
  return (
    <img
      src={BOT_ICON_SRC[botId]}
      alt=""
      width={28}
      height={28}
      className="workshop__uw-icon-svg"
      aria-hidden
    />
  )
}

export type WorkshopBotCardProps = {
  botId: WorkshopBotId
  levels: Record<WorkshopBotUpgradeKey, number>
  workshop: WorkshopPersistedV1
  botLabDisplayOpts?: WorkshopBotLabDisplayOpts
  onBump: (key: WorkshopBotUpgradeKey, direction: -1 | 1) => void
  onToggleActive: (botId: WorkshopBotId) => void
  onSpecialUnlock: (botId: WorkshopBotId) => void
  onSpecialBump: (botId: WorkshopBotId, direction: -1 | 1) => void
  onUnlockBot?: (botId: WorkshopBotId) => void
}

export function WorkshopBotCard({
  botId,
  levels,
  workshop,
  botLabDisplayOpts,
  onBump,
  onToggleActive,
  onSpecialUnlock,
  onSpecialBump,
  onUnlockBot,
}: WorkshopBotCardProps) {
  const { t } = useI18n()
  const stats = WORKSHOP_BOT_WEAPON_STATS[botId]
  const title = t(BOT_TITLE[botId])
  const owned = workshopBotIsOwned(workshop, botId)
  const runActive = owned && workshopBotIsActive(workshop, botId)
  const unlockMedals = workshopBotUnlockCostForBot(workshop, botId)

  const handleUnlockBot = () => {
    if (owned || onUnlockBot == null) return
    onUnlockBot(botId)
  }

  return (
    <li className="workshop__uw-stack">
      <div
        className={
          !owned
            ? 'workshop__uw-card workshop__uw-card--unowned'
            : runActive
              ? 'workshop__uw-card'
              : 'workshop__uw-card workshop__uw-card--inactive'
        }
      >
        <div className="workshop__uw-head workshop__uw-head--bot">
          <div className="workshop__uw-head-icon">
            <BotIcon botId={botId} />
          </div>
          <span className="workshop__uw-title">{title}</span>
          {owned ? (
            <button
              type="button"
              className={
                runActive
                  ? 'workshop__uw-active-toggle workshop__uw-active-toggle--on'
                  : 'workshop__uw-active-toggle'
              }
              aria-pressed={runActive}
              aria-label={
                runActive ? `${title} — ${t('ws_bot_toggle_off')}` : `${title} — ${t('ws_bot_toggle_on')}`
              }
              onClick={() => onToggleActive(botId)}
            >
              {runActive ? t('ws_bot_toggle_on') : t('ws_bot_toggle_off')}
            </button>
          ) : (
            <span
              className="workshop__uw-active-toggle workshop__uw-active-toggle--placeholder"
              aria-hidden
            >
              {t('ws_bot_toggle_on')}
            </span>
          )}
        </div>
        <div
          className={
            !owned
              ? 'workshop__uw-body workshop__uw-body--bots workshop__uw-body--unlock'
              : 'workshop__uw-body workshop__uw-body--bots'
          }
        >
          {!owned ? (
            <div
              className="workshop__uw-stats workshop__uw-stats--bots workshop__uw-stats--unlock"
              role="group"
            >
              <div className="workshop__uw-col workshop__uw-col--uw-unlock">
                <div className="workshop__uw-body-unlock">
                  <button
                    type="button"
                    className="workshop__uw-head-unlock-label"
                    aria-label={`${title} — ${t('ws_bot_unlock_bot')}`}
                    title={t('ws_bot_unlock_cost_title')}
                    onClick={handleUnlockBot}
                  >
                    {t('ws_bot_unlock')}
                  </button>
                  <button
                    type="button"
                    className="workshop__uw-head-unlock-cost"
                    aria-label={`${title} — ${t('ws_bot_unlock_bot')} ${formatPowerStoneAmount(unlockMedals ?? 0)}`}
                    title={t('ws_bot_unlock_cost_title')}
                    onClick={handleUnlockBot}
                  >
                    <span>{formatPowerStoneAmount(unlockMedals ?? 0)}</span>
                    <MedalGlyph className="workshop__uw-medal" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="workshop__uw-stats workshop__uw-stats--bots" role="group">
              {stats.map(({ key, stat }) => {
                const level = levels[key] ?? 0
                const max = workshopBotMaxLevel(key)
                const maxed = level >= max
                const nextMedals = workshopBotNextMarginalMedals(key, level)
                const labelId = BOT_STAT_LABEL[stat]
                const statName = labelId ? t(labelId) : stat

                return (
                  <div
                    key={key}
                    className={maxed ? 'workshop__uw-col workshop__uw-col--max' : 'workshop__uw-col'}
                  >
                    <div className="workshop__uw-col-top">
                      <span className="workshop__uw-stat-label" title={statName}>
                        {statName}
                      </span>
                      <span className="workshop__uw-stat-value">
                        {workshopBotStatDisplay(key, level, botLabDisplayOpts)}
                      </span>
                    </div>
                    <div className="workshop__uw-col-foot">
                      <button
                        type="button"
                        className="workshop__uw-level-step"
                        aria-label={`${statName} — ${t('ws_defense_level_down_aria')}`}
                        disabled={!runActive || level <= 0}
                        onClick={() => onBump(key, -1)}
                      >
                        −
                      </button>
                      <div
                        className={
                          maxed
                            ? 'workshop__uw-col-cost workshop__card-cost--max'
                            : 'workshop__uw-col-cost'
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
                            <span>{formatPowerStoneAmount(nextMedals ?? 0)}</span>
                            <MedalGlyph className="workshop__uw-medal" />
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        className="workshop__uw-level-step"
                        aria-label={`${statName} — ${t('ws_defense_level_up_aria')}`}
                        disabled={!runActive || maxed}
                        onClick={() => onBump(key, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {owned ? (
          <WorkshopBotSpecialCard
            botId={botId}
            workshop={workshop}
            plusEnabled={workshopAllBotsOwnedForPlus(workshop)}
            active={runActive}
            onUnlock={onSpecialUnlock}
            onBump={onSpecialBump}
          />
        ) : (
          <div
            className="workshop__uw-plus-bar workshop__uw-plus-bar--pending workshop__uw-plus-bar--uw-spacer"
            aria-hidden
          >
            <span className="workshop__uw-plus-name">{t(WORKSHOP_BOT_SPECIAL_TITLE[botId])}</span>
            <button type="button" className="workshop__uw-plus-unlock" tabIndex={-1} disabled>
              {t('ws_bot_special_purchase_btn')}
            </button>
            <button type="button" className="workshop__uw-plus-cost" tabIndex={-1} disabled>
              <span>0</span>
            </button>
          </div>
        )}
      </div>
    </li>
  )
}

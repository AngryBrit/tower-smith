import { PowerStoneGlyph } from './PowerStoneGlyph'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import {
  ULTIMATE_PLUS_MAX_LEVEL,
  workshopUltimatePlusIsUnlocked,
  workshopUltimatePlusNextMarginalStones,
  workshopUltimatePlusStatDisplay,
  workshopUltimatePlusStatLabelId,
  workshopUltimatePlusUnlockCostForAbility,
  workshopUltimatePlusLevelKey,
  type WorkshopUltimatePlusAbilityId,
} from '../data/workshopUltimatePlus'
import { formatPowerStoneAmount } from '../labCosts'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import {
  plusAbilityBarTitle,
  WORKSHOP_ULTIMATE_PLUS_TITLE,
} from './workshopUltimatePlusAbilityCardMeta'

const ULTIMATE_STAT_LABEL: Record<string, StringId> = {
  damage: 'ws_uw_stat_damage',
  quantity: 'ws_uw_stat_quantity',
  chance: 'ws_uw_stat_chance',
  cooldown: 'ws_uw_stat_cooldown',
  duration: 'ws_uw_stat_duration',
  slow: 'ws_uw_stat_slow',
  bonus: 'ws_uw_stat_bonus',
  size: 'ws_uw_stat_size',
  angle: 'ws_uw_stat_angle',
}

export type WorkshopUltimatePlusAbilityCardProps = {
  abilityId: WorkshopUltimatePlusAbilityId
  workshop: WorkshopPersistedV1
  plusEnabled: boolean
  onBump: (abilityId: WorkshopUltimatePlusAbilityId, direction: -1 | 1) => void
  onUnlock: (abilityId: WorkshopUltimatePlusAbilityId) => void
}

export function WorkshopUltimatePlusAbilityCard({
  abilityId,
  workshop,
  plusEnabled,
  onBump,
  onUnlock,
}: WorkshopUltimatePlusAbilityCardProps) {
  const { t } = useI18n()
  const levelKey = workshopUltimatePlusLevelKey(abilityId)
  const level = workshop[levelKey] ?? -1
  const abilityUnlocked = workshopUltimatePlusIsUnlocked(level)
  const fullTitle = t(WORKSHOP_ULTIMATE_PLUS_TITLE[abilityId])
  const barTitle = plusAbilityBarTitle(fullTitle)
  const prereqLocked = !plusEnabled
  const maxed = abilityUnlocked && level >= ULTIMATE_PLUS_MAX_LEVEL
  const unlockStones = workshopUltimatePlusUnlockCostForAbility(workshop, abilityId)
  const upgradeStones = abilityUnlocked
    ? workshopUltimatePlusNextMarginalStones(abilityId, level)
    : undefined
  const statKey = workshopUltimatePlusStatLabelId(abilityId)
  const statLabelId = ULTIMATE_STAT_LABEL[statKey]
  const statLabel = statLabelId ? t(statLabelId) : t('ws_uwp_effect')
  const effectDisplay = abilityUnlocked ? workshopUltimatePlusStatDisplay(abilityId, level) : '—'

  const barClass = [
    'workshop__uw-plus-bar',
    prereqLocked ? 'workshop__uw-plus-bar--locked' : '',
    !abilityUnlocked && !prereqLocked ? 'workshop__uw-plus-bar--pending' : '',
    abilityUnlocked ? 'workshop__uw-plus-bar--unlocked' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleUnlock = () => {
    if (prereqLocked || abilityUnlocked) return
    onUnlock(abilityId)
  }

  const handleBump = (direction: -1 | 1) => {
    if (!abilityUnlocked || prereqLocked) return
    if (direction < 0 && level <= 0) return
    if (direction > 0 && maxed) return
    onBump(abilityId, direction)
  }

  return (
    <div className={barClass}>
      <span className="workshop__uw-plus-name">{barTitle}</span>

      {!abilityUnlocked ? (
        <>
          <button
            type="button"
            className="workshop__uw-plus-unlock"
            disabled={prereqLocked}
            aria-label={`${barTitle} — ${t('ws_uwp_unlock')}`}
            title={prereqLocked ? t('ws_uwp_locked_prereq') : undefined}
            onClick={handleUnlock}
          >
            {t('ws_uwp_unlock')}
          </button>
          <button
            type="button"
            className="workshop__uw-plus-cost"
            disabled={prereqLocked}
            aria-label={`${barTitle} — ${t('ws_uwp_unlock')} ${formatPowerStoneAmount(unlockStones ?? 0)}`}
            title={prereqLocked ? t('ws_uwp_locked_prereq') : t('ws_uwp_unlock_cost_title')}
            onClick={handleUnlock}
          >
            <span>{formatPowerStoneAmount(unlockStones ?? 0)}</span>
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
              aria-label={`${barTitle} — ${t('ws_defense_level_down_aria')}`}
              disabled={level <= 0}
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
              title={maxed ? t('ws_max') : t('researchCard_cost_stones_title')}
            >
              {maxed ? (
                <>
                  <span>{t('ws_max')}</span>
                  <PowerStoneGlyph className="workshop__uw-stone" />
                </>
              ) : (
                <>
                  <span>{formatPowerStoneAmount(upgradeStones ?? 0)}</span>
                  <PowerStoneGlyph className="workshop__uw-stone" />
                </>
              )}
            </div>
            <button
              type="button"
              className="workshop__uw-level-step"
              aria-label={`${barTitle} — ${t('ws_defense_level_up_aria')}`}
              disabled={maxed}
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
          <span className="workshop__card-unlock-hint">{t('ws_uwp_locked_prereq')}</span>
        </div>
      ) : null}
    </div>
  )
}

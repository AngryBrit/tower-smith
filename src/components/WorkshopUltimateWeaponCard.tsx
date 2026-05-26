import { useMemo } from 'react'
import { PowerStoneGlyph } from './PowerStoneGlyph'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import {
  workshopUltimateMaxLevel,
  workshopUltimateNextMarginalStones,
  workshopUltimateStatDisplay,
  workshopUltimateUnlockCostForWeapon,
  workshopUltimateWeaponIsOwned,
  WORKSHOP_ULTIMATE_WEAPON_STATS,
  type WorkshopUltimateUpgradeKey,
  type WorkshopUltimateWeaponId,
} from '../data/workshopUltimate'
import {
  buildWorkshopSubmoduleBonuses,
  type WorkshopSubmoduleBonusContext,
} from '../data/workshopSubmoduleBonuses'
import { formatPowerStoneAmount } from '../labCosts'
import {
  workshopUltimatePlusAbilityForWeapon,
  type WorkshopUltimatePlusAbilityId,
} from '../data/workshopUltimatePlus'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import {
  plusAbilityBarTitle,
  WORKSHOP_ULTIMATE_PLUS_TITLE,
  WorkshopUltimatePlusAbilityCard,
} from './WorkshopUltimatePlusAbilityCard'

const ULTIMATE_WEAPON_TITLE: Record<WorkshopUltimateWeaponId, StringId> = {
  chainLightning: 'ws_uw_chainLightning',
  smartMissiles: 'ws_uw_smartMissiles',
  deathWave: 'ws_uw_deathWave',
  chronoField: 'ws_uw_chronoField',
  innerLandMines: 'ws_uw_innerLandMines',
  goldenTower: 'ws_uw_goldenTower',
  poisonSwamp: 'ws_uw_poisonSwamp',
  blackHole: 'ws_uw_blackHole',
  spotlight: 'ws_uw_spotlight',
}

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

const ULTIMATE_WEAPON_ICON_SRC: Record<WorkshopUltimateWeaponId, string> = {
  goldenTower: '/ultimate_weapons/weapon_goldenTower.webp',
  blackHole: '/ultimate_weapons/weapon_blackHole.webp',
  spotlight: '/ultimate_weapons/weapon_spotlight.webp',
  deathWave: '/ultimate_weapons/weapon_deathWave.webp',
  chainLightning: '/ultimate_weapons/weapon_chainLightning.webp',
  smartMissiles: '/ultimate_weapons/weapon_smartMissilies.webp',
  innerLandMines: '/ultimate_weapons/weapon_landMines.webp',
  poisonSwamp: '/ultimate_weapons/weapon_swamp.webp',
  chronoField: '/ultimate_weapons/weapon_chronoField.webp',
}

function UltimateWeaponIcon({ weaponId }: { weaponId: WorkshopUltimateWeaponId }) {
  const src = ULTIMATE_WEAPON_ICON_SRC[weaponId]
  if (!src) return null
  return (
    <img
      src={src}
      alt=""
      width={48}
      height={48}
      className="workshop__uw-icon-svg"
      aria-hidden
    />
  )
}

export type WorkshopUltimateWeaponCardProps = {
  weaponId: WorkshopUltimateWeaponId
  active: boolean
  levels: Record<WorkshopUltimateUpgradeKey, number>
  onBump: (key: WorkshopUltimateUpgradeKey, direction: -1 | 1) => void
  onToggleActive: (weaponId: WorkshopUltimateWeaponId) => void
  onUnlockWeapon?: (weaponId: WorkshopUltimateWeaponId) => void
  workshop?: WorkshopPersistedV1
  submoduleBonusContext?: WorkshopSubmoduleBonusContext
  plusEnabled?: boolean
  onPlusBump?: (abilityId: WorkshopUltimatePlusAbilityId, direction: -1 | 1) => void
  onPlusUnlock?: (abilityId: WorkshopUltimatePlusAbilityId) => void
}

export function WorkshopUltimateWeaponCard({
  weaponId,
  active,
  levels,
  onBump,
  onToggleActive,
  onUnlockWeapon,
  workshop,
  submoduleBonusContext,
  plusEnabled = false,
  onPlusBump,
  onPlusUnlock,
}: WorkshopUltimateWeaponCardProps) {
  const { t } = useI18n()
  const stats = WORKSHOP_ULTIMATE_WEAPON_STATS[weaponId]
  const title = t(ULTIMATE_WEAPON_TITLE[weaponId])
  const plusAbilityId = workshopUltimatePlusAbilityForWeapon(weaponId)
  const showPlus = workshop != null && onPlusBump != null && onPlusUnlock != null
  const owned = workshop != null && workshopUltimateWeaponIsOwned(workshop, weaponId)
  const runActive = owned && active
  const ultimateSubmoduleBonuses = useMemo(
    () =>
      workshop != null
        ? buildWorkshopSubmoduleBonuses(
            workshop.simSubmoduleSelections,
            submoduleBonusContext,
          ).ultimate
        : {},
    [workshop, submoduleBonusContext],
  )
  const unlockStones =
    workshop != null ? workshopUltimateUnlockCostForWeapon(workshop, weaponId) : null

  const handleUnlockWeapon = () => {
    if (owned || onUnlockWeapon == null) return
    onUnlockWeapon(weaponId)
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
        <div className="workshop__uw-head">
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
                runActive
                  ? `${title} — ${t('ws_bot_toggle_off')}`
                  : `${title} — ${t('ws_bot_toggle_on')}`
              }
              onClick={() => onToggleActive(weaponId)}
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
        {!owned ? (
          <div className="workshop__uw-body workshop__uw-body--unlock">
            <div
              className="workshop__uw-stats workshop__uw-stats--unlock"
              role="group"
            >
              <div className="workshop__uw-col workshop__uw-col--uw-unlock">
                <div className="workshop__uw-body-unlock">
                  <button
                    type="button"
                    className="workshop__uw-head-unlock-label"
                    aria-label={`${title} — ${t('ws_uw_unlock')}`}
                    title={t('ws_uw_unlock_cost_title')}
                    onClick={handleUnlockWeapon}
                  >
                    {t('ws_uw_unlock')}
                  </button>
                  <button
                    type="button"
                    className="workshop__uw-head-unlock-cost"
                    aria-label={`${title} — ${t('ws_uw_unlock')} ${formatPowerStoneAmount(unlockStones ?? 0)}`}
                    title={t('ws_uw_unlock_cost_title')}
                    onClick={handleUnlockWeapon}
                  >
                    <span>{formatPowerStoneAmount(unlockStones ?? 0)}</span>
                    <PowerStoneGlyph className="workshop__uw-stone" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="workshop__uw-body">
            <div className="workshop__uw-icon-wrap">
              <UltimateWeaponIcon weaponId={weaponId} />
            </div>
            <div className="workshop__uw-stats" role="group">
              {stats.map(({ key, stat }) => {
                const level = levels[key] ?? 0
                const max = workshopUltimateMaxLevel(key)
                const maxed = level >= max
                const nextStones = workshopUltimateNextMarginalStones(key, level)
                const labelId = ULTIMATE_STAT_LABEL[stat]
                const statName = labelId ? t(labelId) : stat

                return (
                  <div
                    key={key}
                    className={maxed ? 'workshop__uw-col workshop__uw-col--max' : 'workshop__uw-col'}
                  >
                    <div className="workshop__uw-col-top">
                      <span className="workshop__uw-stat-label">{statName}</span>
                      <span className="workshop__uw-stat-value">
                        {workshopUltimateStatDisplay(
                          key,
                          level,
                          ultimateSubmoduleBonuses[key] ?? 0,
                        )}
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
                        title={
                          maxed ? t('ws_max') : t('researchCard_cost_stones_title')
                        }
                      >
                        {maxed ? (
                          <>
                            <span>{t('ws_max')}</span>
                            <PowerStoneGlyph className="workshop__uw-stone" />
                          </>
                        ) : (
                          <>
                            <span>{formatPowerStoneAmount(nextStones ?? 0)}</span>
                            <PowerStoneGlyph className="workshop__uw-stone" />
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
          </div>
        )}
        {showPlus ? (
          owned ? (
            <WorkshopUltimatePlusAbilityCard
              abilityId={plusAbilityId}
              workshop={workshop}
              plusEnabled={plusEnabled}
              onBump={onPlusBump}
              onUnlock={onPlusUnlock}
            />
          ) : (
            <div
              className="workshop__uw-plus-bar workshop__uw-plus-bar--pending workshop__uw-plus-bar--uw-spacer"
              aria-hidden
            >
              <span className="workshop__uw-plus-name">
                {plusAbilityBarTitle(t(WORKSHOP_ULTIMATE_PLUS_TITLE[plusAbilityId]))}
              </span>
              <button type="button" className="workshop__uw-plus-unlock" tabIndex={-1} disabled>
                {t('ws_uwp_unlock')}
              </button>
              <button type="button" className="workshop__uw-plus-cost" tabIndex={-1} disabled>
                <span>0</span>
              </button>
            </div>
          )
        ) : null}
      </div>
    </li>
  )
}

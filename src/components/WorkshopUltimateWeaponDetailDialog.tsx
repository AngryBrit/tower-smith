import { useEffect, useId, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import {
  workshopUltimatePlusAbilityForWeapon,
  workshopUltimatePlusIsUnlocked,
  workshopUltimatePlusLevelKey,
  workshopUltimatePlusStatDisplay,
} from '../data/workshopUltimatePlus'
import {
  ultimateWeaponEnhancementRows,
  workshopUltimateWeaponDescriptionLine,
  workshopUltimateWeaponInGameDamageDisplay,
  workshopUltimateWeaponStatDetailRows,
  WORKSHOP_ULTIMATE_WEAPON_DETAIL,
} from '../data/workshopUltimateWeaponDetail'
import type { WorkshopUltimateUpgradeKey, WorkshopUltimateWeaponId } from '../data/workshopUltimate'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { ResearchData } from '../types/research'
import {
  plusAbilityBarTitle,
  WORKSHOP_ULTIMATE_PLUS_TITLE,
} from './workshopUltimatePlusAbilityCardMeta'

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

export type WorkshopUltimateWeaponDetailDialogProps = {
  weaponId: WorkshopUltimateWeaponId
  levels: Partial<Record<WorkshopUltimateUpgradeKey, number>>
  workshop: WorkshopPersistedV1
  researchData: ResearchData | null
  labLevelOverrides: Record<string, number>
  submoduleBonuses?: Partial<Record<WorkshopUltimateUpgradeKey, number>>
  gameResearchLevel?: readonly number[] | null
  onClose: () => void
}

export function WorkshopUltimateWeaponDetailDialog({
  weaponId,
  levels,
  workshop,
  researchData,
  labLevelOverrides,
  submoduleBonuses = {},
  gameResearchLevel,
  onClose,
}: WorkshopUltimateWeaponDetailDialogProps) {
  const { t, researchLabel } = useI18n()
  const titleId = useId()
  const title = t(ULTIMATE_WEAPON_TITLE[weaponId])
  const iconSrc = ULTIMATE_WEAPON_ICON_SRC[weaponId]

  const descriptionLine = useMemo(() => {
    const damageStatKey = WORKSHOP_ULTIMATE_WEAPON_DETAIL[weaponId].damageStatKey
    const statDisplayOverrides: Partial<Record<WorkshopUltimateUpgradeKey, string>> = {}
    if (damageStatKey) {
      statDisplayOverrides[damageStatKey] = workshopUltimateWeaponInGameDamageDisplay(
        damageStatKey,
        levels[damageStatKey] ?? 0,
        submoduleBonuses[damageStatKey] ?? 0,
        workshop,
        researchData,
        labLevelOverrides,
        gameResearchLevel,
      )
    }
    return workshopUltimateWeaponDescriptionLine(
      weaponId,
      levels,
      t(`ws_uw_desc_${weaponId}` as StringId),
      statDisplayOverrides,
    )
  }, [weaponId, levels, workshop, researchData, labLevelOverrides, submoduleBonuses, gameResearchLevel, t])

  const statRows = useMemo(
    () => workshopUltimateWeaponStatDetailRows(weaponId, levels, submoduleBonuses),
    [weaponId, levels, submoduleBonuses],
  )

  const enhancementRows = useMemo(
    () => ultimateWeaponEnhancementRows(weaponId, researchData, labLevelOverrides),
    [weaponId, researchData, labLevelOverrides],
  )

  const plusAbilityId = workshopUltimatePlusAbilityForWeapon(weaponId)
  const plusLevelKey = workshopUltimatePlusLevelKey(plusAbilityId)
  const plusLevel = workshop[plusLevelKey] ?? -1
  const plusUnlocked = workshopUltimatePlusIsUnlocked(plusLevel)
  const plusTitle = plusAbilityBarTitle(t(WORKSHOP_ULTIMATE_PLUS_TITLE[plusAbilityId]))
  const plusValue = plusUnlocked
    ? workshopUltimatePlusStatDisplay(plusAbilityId, plusLevel)
    : '—'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="modules-picker__backdrop cards-detail__backdrop workshop__uw-detail-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="modules-picker__dialog modules-picker__dialog--detail cards-detail workshop__uw-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modules-picker__close"
          onClick={onClose}
          aria-label={t('ws_uw_detail_close_aria')}
        >
          ×
        </button>

        <div className="workshop__uw-detail-hero">
          <div className="workshop__uw-detail-icon-wrap">
            {iconSrc ? (
              <img
                src={iconSrc}
                alt=""
                width={72}
                height={72}
                className="workshop__uw-icon-svg workshop__uw-detail-icon"
                aria-hidden
              />
            ) : null}
          </div>
          <h2 id={titleId} className="workshop__uw-detail-title">
            {title}
          </h2>
        </div>

        <p className="modules-picker__hero-stat cards-detail__summary workshop__uw-detail-desc">
          {descriptionLine}
        </p>

        <section className="modules-picker__section workshop__uw-detail-stats" aria-label={t('ws_uw_detail_stats_title')}>
          <h3 className="modules-picker__section-title modules-picker__section-title--center">
            {t('ws_uw_detail_stats_title')}
          </h3>
          <ol className="cards-detail__levels workshop__uw-detail-stat-list">
            {statRows.map((row) => {
              const labelId = ULTIMATE_STAT_LABEL[row.stat]
              const statName = labelId ? t(labelId) : row.stat
              return (
                <li
                  key={row.key}
                  className={
                    row.maxed
                      ? 'cards-detail__level cards-detail__level--active workshop__uw-detail-stat'
                      : 'cards-detail__level workshop__uw-detail-stat'
                  }
                >
                  <span className="cards-detail__level-label">{statName}</span>
                  <span className="cards-detail__level-value">
                    {row.maxed ? (
                      <>
                        {row.current}
                        <span className="workshop__uw-detail-max"> ({t('ws_uw_detail_max')})</span>
                      </>
                    ) : (
                      <>
                        {row.current}
                        <span className="workshop__uw-detail-next-sep" aria-hidden>
                          {' '}
                          {t('ws_uw_detail_next_sep')}{' '}
                        </span>
                        {row.next}
                      </>
                    )}
                  </span>
                </li>
              )
            })}
          </ol>
        </section>

        <section
          className="modules-picker__section cards-detail__lab-enhancements workshop__uw-detail-enhancements"
          aria-label={t('ws_uw_detail_enhancements_title')}
        >
          <h3 className="modules-picker__section-title modules-picker__section-title--center cards-detail__lab-enhancements-title">
            {t('ws_uw_detail_enhancements_title')}
          </h3>
          {enhancementRows.map((row) => (
            <div
              key={row.labName}
              className={
                row.locked
                  ? 'cards-detail__lab-enhancement-row workshop__uw-detail-enhancement-row workshop__uw-detail-enhancement-row--locked'
                  : 'cards-detail__lab-enhancement-row workshop__uw-detail-enhancement-row'
              }
            >
              <div className="cards-detail__lab-enhancement-main">
                <span className="cards-detail__lab-enhancement-title">
                  {researchLabel(
                    'ultimate-weapon-research',
                    row.itemIndex,
                    row.labName,
                    'item',
                  )}
                </span>
              </div>
              <span className="cards-detail__lab-enhancement-value">{row.value}</span>
            </div>
          ))}
          <div className="cards-detail__lab-enhancement-row workshop__uw-detail-enhancement-row workshop__uw-detail-enhancement-row--plus">
            <div className="cards-detail__lab-enhancement-main">
              <span className="cards-detail__lab-enhancement-title">{plusTitle}</span>
            </div>
            <span className="cards-detail__lab-enhancement-value">{plusValue}</span>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  )
}

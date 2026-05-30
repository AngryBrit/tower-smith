import { useCallback, useEffect, useMemo, useState } from 'react'
import { CoinGlyph } from './CoinGlyph'
import {
  WORKSHOP_ENHANCE_ATTACK_UPGRADE_ORDER,
  workshopEnhanceAttackClampLevel,
  workshopEnhanceAttackMaxLevel,
  workshopEnhanceAttackNextMarginalCoins,
  workshopEnhanceAttackStatDisplay,
  type WorkshopEnhanceAttackUpgradeKey,
} from '../data/workshopEnhanceAttack'
import { formatCoinAbbrev, formatCoinAbbrevPreferT } from '../labCosts'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { workshopStatDomId } from '../appDeepLink'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import { applyWorkshopDiscountToCoins } from '../types/research'
import {
  workshopEnhanceAttackIsUnlocked,
  workshopEnhanceAttackUnlockRemainingCoins,
  workshopEnhanceAttackUnlockRequiredCoins,
  workshopEnhanceAttackUnlockSpentCoins,
} from '../data/workshopEnhanceUnlock'

const ENHANCE_ATTACK_LABEL: Record<WorkshopEnhanceAttackUpgradeKey, StringId> = {
  enhanceDamageLevel: 'ws_stat_enhanceDamage',
  enhanceRendArmorLevel: 'ws_stat_enhanceRendArmor',
  enhanceCritFactorLevel: 'ws_stat_enhanceCritFactor',
  enhanceDamagePerMeterLevel: 'ws_stat_enhanceDamagePerMeter',
  enhanceSuperCritMultLevel: 'ws_stat_enhanceSuperCritMult',
  enhanceAttackSpeedLevel: 'ws_stat_enhanceAttackSpeed',
}

const ENHANCE_ATTACK_LEVEL_ARIA: Record<WorkshopEnhanceAttackUpgradeKey, StringId> = {
  enhanceDamageLevel: 'ws_enhance_damage_level_input_aria',
  enhanceRendArmorLevel: 'ws_enhance_rend_armor_level_input_aria',
  enhanceCritFactorLevel: 'ws_enhance_crit_factor_level_input_aria',
  enhanceDamagePerMeterLevel: 'ws_enhance_damage_per_meter_level_input_aria',
  enhanceSuperCritMultLevel: 'ws_enhance_super_crit_mult_level_input_aria',
  enhanceAttackSpeedLevel: 'ws_enhance_attack_speed_level_input_aria',
}

type WorkshopMultiplier = WorkshopPersistedV1['multiplier']

function discountedMarginal(
  raw: number | undefined,
  discountPercent: number,
): number | undefined {
  if (raw == null) return undefined
  if (!(discountPercent > 0)) return raw
  return applyWorkshopDiscountToCoins(raw, discountPercent)
}

function attackUnlockHint(
  t: (id: StringId) => string,
  upgradeKey: WorkshopEnhanceAttackUpgradeKey,
  remaining: number,
  required: number,
): string {
  const id: StringId =
    upgradeKey === 'enhanceRendArmorLevel'
      ? 'ws_enhance_locked_attack_damage'
      : 'ws_enhance_locked_attack'
  return t(id)
    .replace('{remaining}', formatCoinAbbrevPreferT(remaining))
    .replace('{required}', formatCoinAbbrevPreferT(required))
}

function WorkshopEnhanceAttackCard({
  upgradeKey,
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  bulkStep,
  coinDiscountPercent,
  locked,
  labLocked,
  unlockRemainingCoins,
  unlockRequiredCoins,
}: {
  upgradeKey: WorkshopEnhanceAttackUpgradeKey
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  bulkStep: WorkshopMultiplier
  coinDiscountPercent: number
  locked: boolean
  labLocked: boolean
  unlockRemainingCoins: number
  unlockRequiredCoins: number
}) {
  const { t } = useI18n()
  const max = workshopEnhanceAttackMaxLevel(upgradeKey)
  const maxed = level >= max
  const nextCoins = discountedMarginal(
    workshopEnhanceAttackNextMarginalCoins(upgradeKey, level),
    coinDiscountPercent,
  )
  const statLabel = workshopEnhanceAttackStatDisplay(upgradeKey, level)
  const stepHint = `×${bulkStep}`

  const cardClass = locked
    ? 'workshop__card workshop__card--locked'
    : maxed
      ? 'workshop__card workshop__card--max'
      : 'workshop__card workshop__card--active'

  return (
    <li id={workshopStatDomId(upgradeKey)} className={cardClass}>
      <div className="workshop__card-body" aria-hidden={locked || undefined}>
        <div className="workshop__card-damage-head">
          <span className="workshop__card-name">{t(ENHANCE_ATTACK_LABEL[upgradeKey])}</span>
          <span className="workshop__card-value">{statLabel}</span>
        </div>
        <div className="workshop__card-level-row">
        <button
          type="button"
          className="workshop__level-step"
          aria-label={`${t('ws_enhance_level_down_aria')} (${stepHint})`}
          disabled={level <= 0}
          onClick={() => onBump(-1)}
        >
          −
        </button>
        <div className="workshop__level-field">
          <input
            className="workshop__level-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            aria-label={t(ENHANCE_ATTACK_LEVEL_ARIA[upgradeKey])}
            value={draft}
            readOnly={locked}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onCommitDraft()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onCommitDraft()
                ;(e.target as HTMLInputElement).blur()
              }
            }}
          />
        </div>
        <button
          type="button"
          className="workshop__level-step"
          aria-label={`${t('ws_enhance_level_up_aria')} (${stepHint})`}
          disabled={locked || level >= max}
          onClick={() => onBump(1)}
        >
          +
        </button>
        </div>
        <div className="workshop__card-damage-footer">
          <span className="workshop__damage-max-caps">
            {t('ws_damage_max_label')} {max}
          </span>
          {!locked ? (
            <div className="workshop__card-damage-cost">
              {maxed || nextCoins == null ? (
                <span className="workshop__card-cost workshop__card-cost--max">
                  {t('ws_max')}
                  <CoinGlyph className="workshop__card-coin" />
                </span>
              ) : (
                <span className="workshop__card-cost" title={t('researchCard_cost_coins_title')}>
                  {formatCoinAbbrev(nextCoins)}
                  <CoinGlyph className="workshop__card-coin" />
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>
      {locked ? (
        <div className="workshop__card-unlock-overlay" role="status">
          <span className="workshop__card-unlock-hint">
            {labLocked
              ? t('ws_enhance_locked_lab')
              : attackUnlockHint(t, upgradeKey, unlockRemainingCoins, unlockRequiredCoins)}
          </span>
        </div>
      ) : null}
    </li>
  )
}

type WorkshopEnhanceAttackPanelProps = {
  workshopPersisted: WorkshopPersistedV1
  onWorkshopPersistedChange: (next: WorkshopPersistedV1) => void
  hideMaxed: boolean
  multiplier: WorkshopMultiplier
  enhancementAttackDiscountPercent: number
  workshopEnhancementsLabUnlocked: boolean
}

export function WorkshopEnhanceAttackPanel({
  workshopPersisted,
  onWorkshopPersistedChange,
  hideMaxed,
  multiplier,
  enhancementAttackDiscountPercent,
  workshopEnhancementsLabUnlocked,
}: WorkshopEnhanceAttackPanelProps) {
  const initialDrafts = useMemo(
    () =>
      Object.fromEntries(
        WORKSHOP_ENHANCE_ATTACK_UPGRADE_ORDER.map((k) => [
          k,
          String(workshopPersisted[k]),
        ]),
      ) as Record<WorkshopEnhanceAttackUpgradeKey, string>,
    [workshopPersisted],
  )

  const [drafts, setDrafts] =
    useState<Record<WorkshopEnhanceAttackUpgradeKey, string>>(initialDrafts)

  useEffect(() => {
    setDrafts(initialDrafts)
  }, [initialDrafts])

  const commitDraft = useCallback(
    (key: WorkshopEnhanceAttackUpgradeKey) => {
      const level = workshopPersisted[key]
      const unlockSpent = workshopEnhanceAttackUnlockSpentCoins(key, workshopPersisted)
      const locked = !workshopEnhanceAttackIsUnlocked(
        key,
        unlockSpent,
        workshopEnhancementsLabUnlocked,
      )
      const raw = drafts[key].trim().replace(/,/g, '')
      if (raw === '') {
        setDrafts((d) => ({ ...d, [key]: String(level) }))
        return
      }
      const parsed = Number(raw)
      if (!Number.isFinite(parsed)) {
        setDrafts((d) => ({ ...d, [key]: String(level) }))
        return
      }
      let c = workshopEnhanceAttackClampLevel(key, parsed)
      if (locked && c > level) c = level
      if (c === level) {
        setDrafts((d) => ({ ...d, [key]: String(level) }))
        return
      }
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: c })
    },
    [
      drafts,
      enhancementAttackDiscountPercent,
      onWorkshopPersistedChange,
      workshopEnhancementsLabUnlocked,
      workshopPersisted,
    ],
  )

  const bump = useCallback(
    (key: WorkshopEnhanceAttackUpgradeKey, direction: -1 | 1) => {
      if (
        direction === 1 &&
        !workshopEnhanceAttackIsUnlocked(
          key,
          workshopEnhanceAttackUnlockSpentCoins(key, workshopPersisted),
          workshopEnhancementsLabUnlocked,
        )
      ) {
        return
      }
      const level = workshopPersisted[key]
      const nv = workshopEnhanceAttackClampLevel(
        key,
        level + direction * multiplier,
      )
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: nv })
    },
    [
      enhancementAttackDiscountPercent,
      multiplier,
      onWorkshopPersistedChange,
      workshopEnhancementsLabUnlocked,
      workshopPersisted,
    ],
  )

  const visibleKeys = WORKSHOP_ENHANCE_ATTACK_UPGRADE_ORDER.filter((key) => {
    if (!hideMaxed) return true
    return workshopPersisted[key] < workshopEnhanceAttackMaxLevel(key)
  })

  return (
    <>
      {visibleKeys.map((key) => {
        const unlockSpent = workshopEnhanceAttackUnlockSpentCoins(key, workshopPersisted)
        const locked = !workshopEnhanceAttackIsUnlocked(
          key,
          unlockSpent,
          workshopEnhancementsLabUnlocked,
        )
        return (
          <WorkshopEnhanceAttackCard
            key={key}
            upgradeKey={key}
            level={workshopPersisted[key]}
            draft={drafts[key]}
            setDraft={(s) => setDrafts((d) => ({ ...d, [key]: s }))}
            onBump={(dir) => bump(key, dir)}
            onCommitDraft={() => commitDraft(key)}
            bulkStep={multiplier}
            coinDiscountPercent={enhancementAttackDiscountPercent}
            locked={locked}
            labLocked={!workshopEnhancementsLabUnlocked}
            unlockRemainingCoins={workshopEnhanceAttackUnlockRemainingCoins(key, unlockSpent)}
            unlockRequiredCoins={workshopEnhanceAttackUnlockRequiredCoins(key)}
          />
        )
      })}
    </>
  )
}

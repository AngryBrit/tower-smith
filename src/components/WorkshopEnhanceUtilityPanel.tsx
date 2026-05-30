import { useCallback, useEffect, useMemo, useState } from 'react'
import { CoinGlyph } from './CoinGlyph'
import {
  WORKSHOP_ENHANCE_UTILITY_UPGRADE_ORDER,
  workshopEnhanceUtilityClampLevel,
  workshopEnhanceUtilityMaxLevel,
  workshopEnhanceUtilityNextMarginalCoins,
  workshopEnhanceUtilityStatDisplay,
  type WorkshopEnhanceUtilityUpgradeKey,
} from '../data/workshopEnhanceUtility'
import { formatCoinAbbrev, formatCoinAbbrevPreferT } from '../labCosts'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { workshopStatDomId } from '../appDeepLink'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import { applyWorkshopDiscountToCoins } from '../types/research'
import {
  workshopEnhanceUtilityCategorySpentCoins,
  workshopEnhanceUtilityIsUnlocked,
  workshopEnhanceUtilityUnlockRemainingCoins,
  workshopEnhanceUtilityUnlockRequiredCoins,
} from '../data/workshopEnhanceUnlock'

const ENHANCE_UTILITY_LABEL: Record<WorkshopEnhanceUtilityUpgradeKey, StringId> = {
  enhanceCashBonusLevel: 'ws_stat_enhanceCashBonus',
  enhanceCoinBonusLevel: 'ws_stat_enhanceCoinBonus',
  enhanceCellsKillBonusLevel: 'ws_stat_enhanceCellsKillBonus',
  enhanceFreeUpgradesLevel: 'ws_stat_enhanceFreeUpgrades',
  enhanceRecoveryPackageLevel: 'ws_stat_enhanceRecoveryPackage',
  enhanceEnemyLevelSkipLevel: 'ws_stat_enhanceEnemyLevelSkip',
}

const ENHANCE_UTILITY_LEVEL_ARIA: Record<WorkshopEnhanceUtilityUpgradeKey, StringId> = {
  enhanceCashBonusLevel: 'ws_enhance_cash_bonus_level_input_aria',
  enhanceCoinBonusLevel: 'ws_enhance_coin_bonus_level_input_aria',
  enhanceCellsKillBonusLevel: 'ws_enhance_cells_kill_bonus_level_input_aria',
  enhanceFreeUpgradesLevel: 'ws_enhance_free_upgrades_level_input_aria',
  enhanceRecoveryPackageLevel: 'ws_enhance_recovery_package_level_input_aria',
  enhanceEnemyLevelSkipLevel: 'ws_enhance_enemy_level_skip_level_input_aria',
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

function utilityUnlockHint(
  t: (id: StringId) => string,
  remaining: number,
  required: number,
): string {
  return t('ws_enhance_locked_utility')
    .replace('{remaining}', formatCoinAbbrevPreferT(remaining))
    .replace('{required}', formatCoinAbbrevPreferT(required))
}

function WorkshopEnhanceUtilityCard({
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
  upgradeKey: WorkshopEnhanceUtilityUpgradeKey
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
  const max = workshopEnhanceUtilityMaxLevel(upgradeKey)
  const maxed = level >= max
  const nextCoins = discountedMarginal(
    workshopEnhanceUtilityNextMarginalCoins(upgradeKey, level),
    coinDiscountPercent,
  )
  const statLabel = workshopEnhanceUtilityStatDisplay(upgradeKey, level)
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
        <span className="workshop__card-name">{t(ENHANCE_UTILITY_LABEL[upgradeKey])}</span>
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
            aria-label={t(ENHANCE_UTILITY_LEVEL_ARIA[upgradeKey])}
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
              : utilityUnlockHint(t, unlockRemainingCoins, unlockRequiredCoins)}
          </span>
        </div>
      ) : null}
    </li>
  )
}

type WorkshopEnhanceUtilityPanelProps = {
  workshopPersisted: WorkshopPersistedV1
  onWorkshopPersistedChange: (next: WorkshopPersistedV1) => void
  hideMaxed: boolean
  multiplier: WorkshopMultiplier
  enhancementUtilityDiscountPercent: number
  workshopEnhancementsLabUnlocked: boolean
}

export function WorkshopEnhanceUtilityPanel({
  workshopPersisted,
  onWorkshopPersistedChange,
  hideMaxed,
  multiplier,
  enhancementUtilityDiscountPercent,
  workshopEnhancementsLabUnlocked,
}: WorkshopEnhanceUtilityPanelProps) {
  const categorySpentCoins = useMemo(
    () =>
      workshopEnhanceUtilityCategorySpentCoins(workshopPersisted),
    [workshopPersisted],
  )

  const initialDrafts = useMemo(
    () =>
      Object.fromEntries(
        WORKSHOP_ENHANCE_UTILITY_UPGRADE_ORDER.map((k) => [
          k,
          String(workshopPersisted[k]),
        ]),
      ) as Record<WorkshopEnhanceUtilityUpgradeKey, string>,
    [workshopPersisted],
  )

  const [drafts, setDrafts] =
    useState<Record<WorkshopEnhanceUtilityUpgradeKey, string>>(initialDrafts)

  useEffect(() => {
    setDrafts(initialDrafts)
  }, [initialDrafts])

  const commitDraft = useCallback(
    (key: WorkshopEnhanceUtilityUpgradeKey) => {
      const level = workshopPersisted[key]
      const locked = !workshopEnhanceUtilityIsUnlocked(
        key,
        categorySpentCoins,
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
      let c = workshopEnhanceUtilityClampLevel(key, parsed)
      if (locked && c > level) c = level
      if (c === level) {
        setDrafts((d) => ({ ...d, [key]: String(level) }))
        return
      }
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: c })
    },
    [
      categorySpentCoins,
      drafts,
      onWorkshopPersistedChange,
      workshopEnhancementsLabUnlocked,
      workshopPersisted,
    ],
  )

  const bump = useCallback(
    (key: WorkshopEnhanceUtilityUpgradeKey, direction: -1 | 1) => {
      if (
        direction === 1 &&
        !workshopEnhanceUtilityIsUnlocked(
          key,
          categorySpentCoins,
          workshopEnhancementsLabUnlocked,
        )
      ) {
        return
      }
      const level = workshopPersisted[key]
      const nv = workshopEnhanceUtilityClampLevel(
        key,
        level + direction * multiplier,
      )
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: nv })
    },
    [
      categorySpentCoins,
      multiplier,
      onWorkshopPersistedChange,
      workshopEnhancementsLabUnlocked,
      workshopPersisted,
    ],
  )

  const visibleKeys = WORKSHOP_ENHANCE_UTILITY_UPGRADE_ORDER.filter((key) => {
    if (!hideMaxed) return true
    return workshopPersisted[key] < workshopEnhanceUtilityMaxLevel(key)
  })

  return (
    <>
      {visibleKeys.map((key) => {
        const locked = !workshopEnhanceUtilityIsUnlocked(
          key,
          categorySpentCoins,
          workshopEnhancementsLabUnlocked,
        )
        return (
          <WorkshopEnhanceUtilityCard
            key={key}
            upgradeKey={key}
            level={workshopPersisted[key]}
            draft={drafts[key]}
            setDraft={(s) => setDrafts((d) => ({ ...d, [key]: s }))}
            onBump={(dir) => bump(key, dir)}
            onCommitDraft={() => commitDraft(key)}
            bulkStep={multiplier}
            coinDiscountPercent={enhancementUtilityDiscountPercent}
            locked={locked}
            labLocked={!workshopEnhancementsLabUnlocked}
            unlockRemainingCoins={workshopEnhanceUtilityUnlockRemainingCoins(
              key,
              categorySpentCoins,
            )}
            unlockRequiredCoins={workshopEnhanceUtilityUnlockRequiredCoins(key)}
          />
        )
      })}
    </>
  )
}

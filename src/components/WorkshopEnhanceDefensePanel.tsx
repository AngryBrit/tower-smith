import { useCallback, useEffect, useMemo, useState } from 'react'
import { deferInEffect } from '../deferInEffect'
import { CoinGlyph } from './CoinGlyph'
import { WorkshopLevelStepRow } from './WorkshopLevelStepRow'
import {
  WORKSHOP_ENHANCE_DEFENSE_UPGRADE_ORDER,
  workshopEnhanceDefenseClampLevel,
  workshopEnhanceDefenseMaxLevel,
  workshopEnhanceDefenseNextMarginalCoins,
  workshopEnhanceDefenseStatDisplay,
  type WorkshopEnhanceDefenseUpgradeKey,
} from '../data/workshopEnhanceDefense'
import { formatCoinAbbrev } from '../labCosts'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { workshopStatDomId } from '../appDeepLink'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import {
  discountedWorkshopBulkMarginal,
  formatWorkshopBulkStepLabel,
  workshopBulkBumpDelta,
} from '../data/workshopBulkMarginal'
import {
  workshopEnhanceDefenseCategorySpentCoins,
  workshopEnhanceDefenseIsUnlocked,
  workshopEnhanceDefenseUnlockRemainingCoins,
  workshopEnhanceDefenseUnlockRequiredCoins,
} from '../data/workshopEnhanceUnlock'

const ENHANCE_DEFENSE_LABEL: Record<WorkshopEnhanceDefenseUpgradeKey, StringId> = {
  enhanceHealthLevel: 'ws_stat_enhanceHealth',
  enhanceHealthRegenLevel: 'ws_stat_enhanceHealthRegen',
  enhanceDefenseAbsoluteLevel: 'ws_stat_enhanceDefenseAbsolute',
  enhanceLandMineDamageLevel: 'ws_stat_enhanceLandMineDamage',
  enhanceWallHealthLevel: 'ws_stat_enhanceWallHealth',
  enhanceOrbSizeLevel: 'ws_stat_enhanceOrbSize',
}

const ENHANCE_DEFENSE_LEVEL_ARIA: Record<WorkshopEnhanceDefenseUpgradeKey, StringId> = {
  enhanceHealthLevel: 'ws_enhance_health_level_input_aria',
  enhanceHealthRegenLevel: 'ws_enhance_health_regen_level_input_aria',
  enhanceDefenseAbsoluteLevel: 'ws_enhance_defense_absolute_level_input_aria',
  enhanceLandMineDamageLevel: 'ws_enhance_land_mine_damage_level_input_aria',
  enhanceWallHealthLevel: 'ws_enhance_wall_health_level_input_aria',
  enhanceOrbSizeLevel: 'ws_enhance_orb_size_level_input_aria',
}

type WorkshopMultiplier = WorkshopPersistedV1['multiplier']

function defenseUnlockHint(
  t: (id: StringId) => string,
  remaining: number,
  required: number,
): string {
  return t('ws_enhance_locked_defense')
    .replace('{remaining}', formatCoinAbbrev(remaining))
    .replace('{required}', formatCoinAbbrev(required))
}

function WorkshopEnhanceDefenseCard({
  upgradeKey,
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
  coinDiscountPercent,
  locked,
  labLocked,
  unlockRemainingCoins,
  unlockRequiredCoins,
}: {
  upgradeKey: WorkshopEnhanceDefenseUpgradeKey
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
  coinDiscountPercent: number
  locked: boolean
  labLocked: boolean
  unlockRemainingCoins: number
  unlockRequiredCoins: number
}) {
  const { t } = useI18n()
  const max = workshopEnhanceDefenseMaxLevel(upgradeKey)
  const maxed = level >= max
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    max,
    bulkStep,
    (L) => workshopEnhanceDefenseNextMarginalCoins(upgradeKey, L),
    coinDiscountPercent,
  )
  const statLabel = workshopEnhanceDefenseStatDisplay(upgradeKey, level)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  const cardClass = locked
    ? 'workshop__card workshop__card--locked'
    : maxed
      ? 'workshop__card workshop__card--max'
      : 'workshop__card workshop__card--active'

  return (
    <li id={workshopStatDomId(upgradeKey)} className={cardClass}>
      <div className="workshop__card-body" aria-hidden={locked || undefined}>
        <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t(ENHANCE_DEFENSE_LABEL[upgradeKey])}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
      <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={max}
          downAriaLabel={`${t('ws_enhance_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_enhance_level_up_aria')} (${stepHint})`}
          downDisabled={locked || level <= 0}
          upDisabled={locked || level >= max}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
            <input
              className="workshop__level-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label={t(ENHANCE_DEFENSE_LEVEL_ARIA[upgradeKey])}
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
        </WorkshopLevelStepRow>
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
              : defenseUnlockHint(t, unlockRemainingCoins, unlockRequiredCoins)}
          </span>
        </div>
      ) : null}
    </li>
  )
}

type WorkshopEnhanceDefensePanelProps = {
  workshopPersisted: WorkshopPersistedV1
  onWorkshopPersistedChange: (next: WorkshopPersistedV1) => void
  hideMaxed: boolean
  multiplier: WorkshopMultiplier
  enhancementDefenseDiscountPercent: number
  workshopEnhancementsLabUnlocked: boolean
}

export function WorkshopEnhanceDefensePanel({
  workshopPersisted,
  onWorkshopPersistedChange,
  hideMaxed,
  multiplier,
  enhancementDefenseDiscountPercent,
  workshopEnhancementsLabUnlocked,
}: WorkshopEnhanceDefensePanelProps) {
  const categorySpentCoins = useMemo(
    () =>
      workshopEnhanceDefenseCategorySpentCoins(workshopPersisted),
    [workshopPersisted],
  )

  const initialDrafts = useMemo(
    () =>
      Object.fromEntries(
        WORKSHOP_ENHANCE_DEFENSE_UPGRADE_ORDER.map((k) => [
          k,
          String(workshopPersisted[k]),
        ]),
      ) as Record<WorkshopEnhanceDefenseUpgradeKey, string>,
    [workshopPersisted],
  )

  const [drafts, setDrafts] =
    useState<Record<WorkshopEnhanceDefenseUpgradeKey, string>>(initialDrafts)

  useEffect(() => {
    deferInEffect(() => setDrafts(initialDrafts))
  }, [initialDrafts])

  const commitDraft = useCallback(
    (key: WorkshopEnhanceDefenseUpgradeKey) => {
      const level = workshopPersisted[key]
      const locked = !workshopEnhanceDefenseIsUnlocked(
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
      let c = workshopEnhanceDefenseClampLevel(key, parsed)
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
    (key: WorkshopEnhanceDefenseUpgradeKey, direction: -1 | 1) => {
      if (
        direction === 1 &&
        !workshopEnhanceDefenseIsUnlocked(
          key,
          categorySpentCoins,
          workshopEnhancementsLabUnlocked,
        )
      ) {
        return
      }
      const level = workshopPersisted[key]
      const nv = workshopEnhanceDefenseClampLevel(
        key,
        level +
          workshopBulkBumpDelta(direction, multiplier, level, workshopEnhanceDefenseMaxLevel(key)),
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

  const visibleKeys = WORKSHOP_ENHANCE_DEFENSE_UPGRADE_ORDER.filter((key) => {
    if (!hideMaxed) return true
    return workshopPersisted[key] < workshopEnhanceDefenseMaxLevel(key)
  })

  return (
    <>
      {visibleKeys.map((key) => {
        const locked = !workshopEnhanceDefenseIsUnlocked(
          key,
          categorySpentCoins,
          workshopEnhancementsLabUnlocked,
        )
        return (
          <WorkshopEnhanceDefenseCard
            key={key}
            upgradeKey={key}
            level={workshopPersisted[key]}
            draft={drafts[key]}
            setDraft={(s) => setDrafts((d) => ({ ...d, [key]: s }))}
            onBump={(dir) => bump(key, dir)}
            onCommitDraft={() => commitDraft(key)}
            onSetLevel={(n) =>
              onWorkshopPersistedChange({
                ...workshopPersisted,
                [key]: workshopEnhanceDefenseClampLevel(key, n),
              })}
            bulkStep={multiplier}
            coinDiscountPercent={enhancementDefenseDiscountPercent}
            locked={locked}
            labLocked={!workshopEnhancementsLabUnlocked}
            unlockRemainingCoins={workshopEnhanceDefenseUnlockRemainingCoins(
              key,
              categorySpentCoins,
            )}
            unlockRequiredCoins={workshopEnhanceDefenseUnlockRequiredCoins(key)}
          />
        )
      })}
    </>
  )
}

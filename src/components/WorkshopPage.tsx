import type { ReactNode, RefObject } from 'react'
import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  parseAppDeepLinkFromUrl,
  resolveWorkshopDeepLinkNav,
  subscribeAppDeepLink,
  workshopStatDomId,
} from '../appDeepLink'
import { CoinGlyph } from './CoinGlyph'
import { WorkshopLevelStepRow } from './WorkshopLevelStepRow'
import { WorkshopDemoToolbar } from './workshop/WorkshopDemoToolbar'
import {
  workshopAttackStatDisplay,
} from '../data/workshopAttack'
import {
  WORKSHOP_ATTACK_RANGE_MAX_LEVEL,
  workshopAttackRangeNextMarginalCoins,
} from '../data/workshopAttackRange'
import {
  WORKSHOP_ATTACK_SPEED_MAX_LEVEL,
  workshopAttackSpeedNextMarginalCoins,
} from '../data/workshopAttackSpeed'
import {
  WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL,
  workshopCriticalChanceNextMarginalCoins,
} from '../data/workshopCriticalChance'
import {
  WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL,
  workshopCriticalFactorNextMarginalCoins,
  workshopDisplayedCritFactorEnhancementMultiplier,
} from '../data/workshopCriticalFactor'
import {
  discountedWorkshopBulkMarginal,
  formatWorkshopBulkStepLabel,
  workshopBulkBumpDelta,
} from '../data/workshopBulkMarginal'
import {
  WORKSHOP_DAMAGE_MAX_LEVEL,
  workshopDamageNextMarginalCoins,
  formatWorkshopDisplayedDamageBreakdown,
  type WorkshopDamageDisplayOpts,
} from '../data/workshopDamage'
import {
  WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL,
  workshopDamagePerMeterNextMarginalCoins,
} from '../data/workshopDamagePerMeter'
import {
  WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL,
  workshopMultishotChanceNextMarginalCoins,
} from '../data/workshopMultishotChance'
import {
  WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL,
  workshopMultishotTargetsNextMarginalCoins,
} from '../data/workshopMultishotTargets'
import {
  WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL,
  WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL,
  workshopRapidFireChanceNextMarginalCoins,
  workshopRapidFireDurationNextMarginalCoins,
} from '../data/workshopRapidFire'
import {
  WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL,
  workshopBounceShotChanceNextMarginalCoins,
} from '../data/workshopBounceShotChance'
import {
  WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL,
  workshopBounceShotRangeNextMarginalCoins,
} from '../data/workshopBounceShotRange'
import {
  WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL,
  workshopBounceShotTargetsNextMarginalCoins,
} from '../data/workshopBounceShotTargets'
import {
  WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL,
  workshopSuperCritChanceNextMarginalCoins,
} from '../data/workshopSuperCritChance'
import {
  WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL,
  workshopDisplayedSuperCritMultEnhancementMultiplier,
  workshopSuperCritMultNextMarginalCoins,
} from '../data/workshopSuperCritMult'
import {
  WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL,
  WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL,
  workshopRendArmorChanceNextMarginalCoins,
  workshopDisplayedRendArmorChanceEnhancementMultiplier,
  workshopDisplayedRendArmorMultEnhancementMultiplier,
  workshopRendArmorMultNextMarginalCoins,
} from '../data/workshopRendArmor'
import {
  WORKSHOP_DEFENSE_UPGRADE_ORDER,
  workshopDefenseClampLevel,
  workshopDefenseMaxLevel,
  workshopDefenseNextMarginalCoins,
  workshopDefenseStatDisplay,
  type WorkshopDefenseStatDisplayOpts,
  type WorkshopDefenseUpgradeKey,
} from '../data/workshopDefense'
import {
  workshopDisplayedHealthEnhancementMultiplier,
  workshopHealthRelicsBonusFraction,
} from '../data/workshopDisplayedHealth'
import {
  workshopDisplayedHealthRegenEnhancementMultiplier,
  workshopHealthRegenRelicsBonusFraction,
} from '../data/workshopDisplayedHealthRegen'
import { workshopDisplayedLandMineDamageEnhancementMultiplier } from '../data/workshopLandMineDamage'
import { workshopDisplayedCashBonusEnhancementMultiplier } from '../data/workshopCashBonus'
import { workshopDisplayedCoinsKillBonusEnhancementMultiplier } from '../data/workshopCoinsKillBonus'
import { workshopDisplayedWallHealthEnhancementMultiplier } from '../data/workshopWallHealth'
import { workshopDisplayedRecoveryAmountEnhancementMultiplier } from '../data/workshopRecoveryAmount'
import { workshopDisplayedMaxRecoveryEnhancementMultiplier } from '../data/workshopMaxRecovery'
import { workshopDisplayedEnemyLevelSkipEnhancementMultiplier } from '../data/workshopEnemyAttackLevelSkip'
import {
  WORKSHOP_UTILITY_UPGRADE_ORDER,
  workshopUtilityClampLevel,
  workshopUtilityMaxLevel,
  workshopUtilityNextMarginalCoins,
  workshopUtilityStatDisplay,
  type WorkshopUtilityLabDisplayOpts,
  type WorkshopUtilityUpgradeKey,
} from '../data/workshopUtility'
import {
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  workshopUltimateActiveKey,
  workshopUltimateClampLevel,
  workshopUltimateIsActive,
  workshopUltimateOwnedKey,
  workshopUltimateUnlockCostForWeapon,
  workshopUltimateWeaponAllMaxed,
  workshopUltimateWeaponIsOwned,
  type WorkshopUltimateUpgradeKey,
  type WorkshopUltimateWeaponId,
} from '../data/workshopUltimate'
import {
  workshopAllUltimateWeaponsReadyForPlus,
  workshopUltimatePlusClampLevel,
  workshopUltimatePlusIsUnlocked,
  workshopUltimatePlusLevelKey,
  type WorkshopUltimatePlusAbilityId,
} from '../data/workshopUltimatePlus'
import { WorkshopUltimateWeaponCard } from './WorkshopUltimateWeaponCard'
import { workshopAttackSpeedDisplayOptsFromPersisted } from '../data/workshopDisplayedAttackSpeed'
import { workshopDamageDisplayOptsFromPersisted } from '../data/workshopDisplayedDamage'
import { mergeLabOverridesForDisplayedDamage } from '../data/workshopLabOverridesForDamage'
import type { WorkshopAttackSpeedDisplayOpts } from '../data/workshopAttackSpeed'
import { workshopEnhancementsLabUnlocked } from '../data/workshopEnhanceResearch'
const WorkshopEnhanceAttackPanel = lazy(() =>
  import('./WorkshopEnhanceAttackPanel').then((m) => ({ default: m.WorkshopEnhanceAttackPanel })),
)
const WorkshopEnhanceDefensePanel = lazy(() =>
  import('./WorkshopEnhanceDefensePanel').then((m) => ({ default: m.WorkshopEnhanceDefensePanel })),
)
const WorkshopEnhanceUtilityPanel = lazy(() =>
  import('./WorkshopEnhanceUtilityPanel').then((m) => ({ default: m.WorkshopEnhanceUtilityPanel })),
)
import { useWorkspaceUndo } from '../lab/workspaceUndoContext'
import { deferInEffect } from '../deferInEffect'
import { formatCoinAbbrev } from '../labCosts'
import {
  resetWorkshopUltimates,
  resetWorkshopUpgradeLevels,
  type WorkshopPersistedV1,
} from '../labPresetsStorage'
import { useTowerWorkspaceContext } from '../towerWorkspaceContext'
import { splitTowerBuild } from '../towerBuildStorage'
import {
  applyWorkshopMaxAllVisible,
  computeWorkshopCoinAggregates,
  computeWorkshopStoneAggregates,
  formatWorkshopCoinAggregates,
  formatWorkshopStoneAggregates,
  type WorkshopCoinDiscountOpts,
} from '../workshopBudgetAggregates'
import { useBudgetPanelsVisible } from '../budgetPanelsVisibility'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import {
  workshopCardAddPercentPoints,
  workshopCardMultProduct,
  mergeLabAndCardMult,
} from '../data/workshopCardWorkshopDisplay'
import {
  buildWorkshopAttackLabDisplayOpts,
  buildWorkshopDefenseLabDisplayOpts,
  buildWorkshopUtilityLabDisplayOpts,
  type WorkshopAttackLabDisplayOpts,
} from '../data/workshopLabDisplayOpts'
import {
  enrichAttackLabDisplayOpts,
  enrichDefenseStatDisplayOpts,
  enrichUtilityLabDisplayOpts,
} from '../data/workshopRelicWorkshopDisplay'
import {
  enrichAttackLabDisplayOptsWithSubmodules,
  enrichDefenseStatDisplayOptsWithSubmodules,
  enrichUtilityLabDisplayOptsWithSubmodules,
} from '../data/workshopSubmoduleWorkshopDisplay'
import { workshopChassisModuleHeroStatMultiplier } from '../data/workshopChassisModuleHeroStatWorkshop'
import type { WorkshopSubmoduleBonusContext } from '../data/workshopAssistSubmoduleScale'
import { totalCannonAttackSpeedFromSelections } from '../data/workshopSubmoduleSelection'
import type { WorkshopGameCardId } from '../data/workshopGameCards'
import {
  resolveEnhancementAttackDiscountPercent,
  resolveEnhancementDefenseDiscountPercent,
  resolveEnhancementUtilityDiscountPercent,
  resolveWorkshopAttackDiscountPercent,
  resolveWorkshopDefenseDiscountPercent,
  resolveWorkshopUtilityDiscountPercent,
  type ResearchData,
} from '../types/research'

type WorkshopCategory = 'attack' | 'defense' | 'utility' | 'ultimate'

const SECTION_TITLE: Record<WorkshopCategory, StringId> = {
  attack: 'ws_section_attack',
  defense: 'ws_section_defense',
  utility: 'ws_section_utility',
  ultimate: 'ws_section_ultimate',
}

const CATEGORY_ARIA: Record<WorkshopCategory, StringId> = {
  attack: 'ws_cat_attack_aria',
  defense: 'ws_cat_defense_aria',
  utility: 'ws_cat_utility_aria',
  ultimate: 'ws_cat_ultimate_aria',
}

const WORKSHOP_CATEGORY_ORDER: readonly WorkshopCategory[] = [
  'attack',
  'defense',
  'utility',
  'ultimate',
]

const WORKSHOP_CATEGORY_ICON_SRC: Record<WorkshopCategory, string> = {
  attack: '/icons/sword.webp',
  defense: '/icons/shield.webp',
  utility: '/icons/star.webp',
  ultimate: '/icons/icon_ultimate.webp',
}

const BULK_MULTIPLIERS = [100, 10, 5, 1] as const
type WorkshopMultiplier = WorkshopPersistedV1['multiplier']

function WorkshopMultiplierRail({
  railRef,
  open,
  multiplier,
  onSelectMultiplier,
  onAnchorClick,
}: {
  railRef: RefObject<HTMLDivElement | null>
  open: boolean
  multiplier: WorkshopMultiplier
  onSelectMultiplier: (m: WorkshopMultiplier) => void
  onAnchorClick: () => void
}) {
  const { t } = useI18n()
  const anchorLabel = multiplier === 'max' ? 'MAX' : `×${multiplier}`

  return (
    <div ref={railRef} className={open ? 'workshop__mult workshop__mult--open' : 'workshop__mult'}>
      <div
        className="workshop__mult-rail"
        role="group"
        aria-label={t('ws_multiplier_group_aria')}
      >
        <div className="workshop__mult-track">
          <div className="workshop__mult-opts" aria-hidden={!open}>
            <button
              type="button"
              className={
                multiplier === 'max'
                  ? 'workshop__mult-chip workshop__mult-chip--selected'
                  : 'workshop__mult-chip'
              }
              tabIndex={open ? 0 : -1}
              aria-pressed={multiplier === 'max'}
              onClick={() => onSelectMultiplier('max')}
            >
              MAX
            </button>
            {BULK_MULTIPLIERS.map((m) => (
              <button
                key={m}
                type="button"
                className={
                  multiplier === m
                    ? 'workshop__mult-chip workshop__mult-chip--selected'
                    : 'workshop__mult-chip'
                }
                tabIndex={open ? 0 : -1}
                aria-pressed={multiplier === m}
                onClick={() => onSelectMultiplier(m)}
              >
                ×{m}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="workshop__mult-anchor"
            aria-expanded={open}
            aria-label={
              open ? t('ws_multiplier_toggle_collapse') : t('ws_multiplier_toggle_expand')
            }
            onClick={onAnchorClick}
          >
            {anchorLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

type DemoRow = {
  labelId: StringId
  value: string
  cost: string | null
  maxed: boolean
}

const DEMO_ROWS: readonly DemoRow[] = []

const DEMO_ROWS_BY_CATEGORY: Record<WorkshopCategory, readonly DemoRow[]> = {
  attack: DEMO_ROWS,
  defense: DEMO_ROWS,
  utility: DEMO_ROWS,
  ultimate: DEMO_ROWS,
}

function workshopOverlayPortal(node: ReactNode) {
  return createPortal(node, document.body)
}

function clampWorkshopDamageLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_DAMAGE_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopAttackSpeedLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_ATTACK_SPEED_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopCriticalChanceLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopCriticalFactorLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopAttackRangeLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_ATTACK_RANGE_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopDamagePerMeterLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopMultishotChanceLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopMultishotTargetsLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopRapidFireChanceLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopRapidFireDurationLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopBounceShotChanceLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopBounceShotTargetsLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopBounceShotRangeLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopSuperCritChanceLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopSuperCritMultLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopRendArmorChanceLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL, Math.trunc(n)))
}

function clampWorkshopRendArmorMultLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL, Math.trunc(n)))
}

type WorkshopCoinDiscountContextValue = {
  attack: number
  defense: number
  utility: number
}

const WorkshopCoinDiscountContext = createContext<WorkshopCoinDiscountContextValue>({
  attack: 0,
  defense: 0,
  utility: 0,
})

function useAttackWorkshopCoinDiscount(): number {
  return useContext(WorkshopCoinDiscountContext).attack
}

function useDefenseWorkshopCoinDiscount(): number {
  return useContext(WorkshopCoinDiscountContext).defense
}

function useUtilityWorkshopCoinDiscount(): number {
  return useContext(WorkshopCoinDiscountContext).utility
}

const WorkshopAttackLabDisplayContext = createContext<
  WorkshopAttackLabDisplayOpts | undefined
>(undefined)

function useWorkshopAttackLabDisplayOpts(): WorkshopAttackLabDisplayOpts | undefined {
  return useContext(WorkshopAttackLabDisplayContext)
}

function WorkshopDamageCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
  damageDisplayOpts,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  /** Direction only; parent applies `bulkStep` from the workshop multiplier. */
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
  /** Wiki displayed-damage factors (always full product). */
  damageDisplayOpts: WorkshopDamageDisplayOpts
}) {
  const { t } = useI18n()
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const maxed = level >= WORKSHOP_DAMAGE_MAX_LEVEL
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_DAMAGE_MAX_LEVEL,
    bulkStep,
    workshopDamageNextMarginalCoins,
    coinDiscountPercent,
  )
  const statLabel = workshopAttackStatDisplay('damageLevel', level, damageDisplayOpts)
  const breakdownTitle = formatWorkshopDisplayedDamageBreakdown(damageDisplayOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('damageLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_damage')}</span>
        <span className="workshop__card-value" title={breakdownTitle}>
          {statLabel}
        </span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_DAMAGE_MAX_LEVEL}
          downAriaLabel={`${t('ws_damage_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_damage_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_damage_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_DAMAGE_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopAttackSpeedCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
  attackSpeedDisplayOpts,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
  attackSpeedDisplayOpts?: WorkshopAttackSpeedDisplayOpts
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_ATTACK_SPEED_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_ATTACK_SPEED_MAX_LEVEL,
    bulkStep,
    workshopAttackSpeedNextMarginalCoins,
    coinDiscountPercent,
  )
  const statLabel = workshopAttackStatDisplay('attackSpeedLevel', level, attackSpeedDisplayOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('attackSpeedLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_attackSpeed')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_ATTACK_SPEED_MAX_LEVEL}
          downAriaLabel={`${t('ws_attack_speed_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_attack_speed_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_attack_speed_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_ATTACK_SPEED_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopCriticalChanceCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL,
    bulkStep,
    workshopCriticalChanceNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('critChanceLevel', level, attackLabOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('critChanceLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_critChance')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL}
          downAriaLabel={`${t('ws_crit_chance_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_crit_chance_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_crit_chance_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopCriticalFactorCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
  enhancementMultiplier = 1,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
  enhancementMultiplier?: number
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL,
    bulkStep,
    workshopCriticalFactorNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('critFactorLevel', level, {
    ...attackLabOpts,
    critFactorEnhancementMultiplier: enhancementMultiplier,
  })
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('critFactorLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_critFactor')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL}
          downAriaLabel={`${t('ws_crit_factor_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_crit_factor_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_crit_factor_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopAttackRangeCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_ATTACK_RANGE_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_ATTACK_RANGE_MAX_LEVEL,
    bulkStep,
    workshopAttackRangeNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('attackRangeLevel', level, attackLabOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('attackRangeLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_attackRange')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_ATTACK_RANGE_MAX_LEVEL}
          downAriaLabel={`${t('ws_attack_range_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_attack_range_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_attack_range_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_ATTACK_RANGE_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopDamagePerMeterCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
  damagePerMeterLabMultiplier,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
  /** Attack **Damage / Meter** lab × relic (no sub-module on this card). */
  damagePerMeterLabMultiplier?: number
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL,
    bulkStep,
    workshopDamagePerMeterNextMarginalCoins,
    coinDiscountPercent,
  )
  const statLabel = workshopAttackStatDisplay('damagePerMeterLevel', level, {
    damagePerMeterLabMultiplier,
  })
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('damagePerMeterLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_damagePerMeter')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL}
          downAriaLabel={`${t('ws_damage_per_meter_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_damage_per_meter_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_damage_per_meter_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopMultishotChanceCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL,
    bulkStep,
    workshopMultishotChanceNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('multishotChanceLevel', level, attackLabOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('multishotChanceLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_multishotChance')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL}
          downAriaLabel={`${t('ws_multishot_chance_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_multishot_chance_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_multishot_chance_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopMultishotTargetsCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL,
    bulkStep,
    workshopMultishotTargetsNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('multishotTargetsLevel', level, attackLabOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('multishotTargetsLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_multishotTargets')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL}
          downAriaLabel={`${t('ws_multishot_targets_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_multishot_targets_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_multishot_targets_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopRapidFireChanceCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL,
    bulkStep,
    workshopRapidFireChanceNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('rapidFireChanceLevel', level, attackLabOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('rapidFireChanceLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_rapidFireChance')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL}
          downAriaLabel={`${t('ws_rapid_fire_chance_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_rapid_fire_chance_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_rapid_fire_chance_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopRapidFireDurationCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL,
    bulkStep,
    workshopRapidFireDurationNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('rapidFireDurationLevel', level, attackLabOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('rapidFireDurationLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_rapidFireDuration')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL}
          downAriaLabel={`${t('ws_rapid_fire_duration_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_rapid_fire_duration_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_rapid_fire_duration_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopBounceShotChanceCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL,
    bulkStep,
    workshopBounceShotChanceNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('bounceShotChanceLevel', level, attackLabOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('bounceShotChanceLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_bounceChance')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL}
          downAriaLabel={`${t('ws_bounce_shot_chance_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_bounce_shot_chance_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_bounce_shot_chance_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopBounceShotTargetsCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL,
    bulkStep,
    workshopBounceShotTargetsNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('bounceShotTargetsLevel', level, attackLabOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('bounceShotTargetsLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_bounceTargets')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL}
          downAriaLabel={`${t('ws_bounce_shot_targets_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_bounce_shot_targets_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_bounce_shot_targets_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopBounceShotRangeCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL,
    bulkStep,
    workshopBounceShotRangeNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('bounceShotRangeLevel', level, attackLabOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('bounceShotRangeLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_bounceShotRange')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL}
          downAriaLabel={`${t('ws_bounce_shot_range_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_bounce_shot_range_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_bounce_shot_range_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopSuperCritChanceCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL,
    bulkStep,
    workshopSuperCritChanceNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('superCritChanceLevel', level, attackLabOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('superCritChanceLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_superCritChance')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL}
          downAriaLabel={`${t('ws_super_crit_chance_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_super_crit_chance_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_super_crit_chance_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopSuperCritMultCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
  enhancementMultiplier,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
  enhancementMultiplier: number
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL,
    bulkStep,
    workshopSuperCritMultNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('superCritMultLevel', level, {
    ...attackLabOpts,
    superCritMultEnhancementMultiplier: enhancementMultiplier,
  })
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('superCritMultLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_superCritMult')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL}
          downAriaLabel={`${t('ws_super_crit_mult_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_super_crit_mult_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_super_crit_mult_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopRendArmorChanceCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
  enhancementMultiplier = 1,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
  enhancementMultiplier?: number
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL,
    bulkStep,
    workshopRendArmorChanceNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('rendArmorChanceLevel', level, {
    ...attackLabOpts,
    rendArmorChanceEnhancementMultiplier: enhancementMultiplier,
  })
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('rendArmorChanceLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_rendArmorChance')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL}
          downAriaLabel={`${t('ws_rend_armor_chance_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_rend_armor_chance_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_rend_armor_chance_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

function WorkshopRendArmorMultCard({
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
  enhancementMultiplier = 1,
}: {
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
  enhancementMultiplier?: number
}) {
  const { t } = useI18n()
  const maxed = level >= WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL
  const coinDiscountPercent = useAttackWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL,
    bulkStep,
    workshopRendArmorMultNextMarginalCoins,
    coinDiscountPercent,
  )
  const attackLabOpts = useWorkshopAttackLabDisplayOpts()
  const statLabel = workshopAttackStatDisplay('rendArmorMultLevel', level, {
    ...attackLabOpts,
    rendArmorMultEnhancementMultiplier: enhancementMultiplier,
  })
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)

  return (
    <li
      id={workshopStatDomId('rendArmorMultLevel')}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{t('ws_stat_rendArmorMult')}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL}
          downAriaLabel={`${t('ws_rend_armor_mult_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${t('ws_rend_armor_mult_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={t('ws_rend_armor_mult_level_input_aria')}
                      value={draft}
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
          {t('ws_damage_max_label')} {WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL}
        </span>
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
      </div>
    </li>
  )
}

const DEFENSE_CARD_TITLE: Record<WorkshopDefenseUpgradeKey, StringId> = {
  healthLevel: 'ws_stat_defHealth',
  healthRegenLevel: 'ws_stat_defHealthRegen',
  defensePercentLevel: 'ws_stat_defDefensePct',
  defenseAbsoluteLevel: 'ws_stat_defDefenseAbs',
  thornDamageLevel: 'ws_stat_defThornDamage',
  lifestealLevel: 'ws_stat_defLifesteal',
  knockbackChanceLevel: 'ws_stat_defKnockbackChance',
  knockbackForceLevel: 'ws_stat_defKnockbackForce',
  orbSpeedLevel: 'ws_stat_defOrbSpeed',
  orbsLevel: 'ws_stat_defOrbs',
  shockwaveSizeLevel: 'ws_stat_defShockwaveSize',
  shockwaveFrequencyLevel: 'ws_stat_defShockwaveFreq',
  landMineChanceLevel: 'ws_stat_defLandMineChance',
  landMineDamageLevel: 'ws_stat_defLandMineDamage',
  landMineRadiusLevel: 'ws_stat_defLandMineRadius',
  deathDefyLevel: 'ws_stat_defDeathDefy',
  wallHealthLevel: 'ws_stat_defWallHealth',
  wallRebuildLevel: 'ws_stat_defWallRebuild',
}

const UTILITY_CARD_TITLE: Record<WorkshopUtilityUpgradeKey, StringId> = {
  cashBonusLevel: 'ws_stat_utilCashBonus',
  cashPerWaveLevel: 'ws_stat_utilCashPerWave',
  coinsKillBonusLevel: 'ws_stat_utilCoinsKillBonus',
  coinsWaveLevel: 'ws_stat_utilCoinsWave',
  freeAttackUpgradeLevel: 'ws_stat_utilFreeAttackUpgrade',
  freeDefenseUpgradeLevel: 'ws_stat_utilFreeDefenseUpgrade',
  freeUtilityUpgradeLevel: 'ws_stat_utilFreeUtilityUpgrade',
  interestPerWaveLevel: 'ws_stat_utilInterestPerWave',
  recoveryAmountLevel: 'ws_stat_utilRecoveryAmount',
  maxRecoveryLevel: 'ws_stat_utilMaxRecovery',
  packageChanceLevel: 'ws_stat_utilPackageChance',
  enemyAttackLevelSkipLevel: 'ws_stat_utilEnemyAttackLevelSkip',
  enemyHealthLevelSkipLevel: 'ws_stat_utilEnemyHealthLevelSkip',
}

function WorkshopDefenseUpgradeCard({
  fieldKey,
  titleId,
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
  statDisplayOpts,
}: {
  fieldKey: WorkshopDefenseUpgradeKey
  titleId: StringId
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
  statDisplayOpts?: WorkshopDefenseStatDisplayOpts
}) {
  const { t } = useI18n()
  const max = workshopDefenseMaxLevel(fieldKey)
  const maxed = level >= max
  const coinDiscountPercent = useDefenseWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    max,
    bulkStep,
    (L) => workshopDefenseNextMarginalCoins(fieldKey, L),
    coinDiscountPercent,
  )
  const statLabel = workshopDefenseStatDisplay(fieldKey, level, statDisplayOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)
  const statName = t(titleId)

  return (
    <li
      id={workshopStatDomId(fieldKey)}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{statName}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={max}
          downAriaLabel={`${statName} — ${t('ws_defense_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${statName} — ${t('ws_defense_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={`${statName} — ${t('ws_defense_level_input_aria')}`}
                      value={draft}
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
      </div>
    </li>
  )
}

function WorkshopUtilityUpgradeCard({
  fieldKey,
  titleId,
  level,
  draft,
  setDraft,
  onBump,
  onCommitDraft,
  onSetLevel,
  bulkStep,
  statDisplayOpts,
}: {
  fieldKey: WorkshopUtilityUpgradeKey
  titleId: StringId
  level: number
  draft: string
  setDraft: (s: string) => void
  onBump: (direction: -1 | 1) => void
  onCommitDraft: () => void
  onSetLevel: (level: number) => void
  bulkStep: WorkshopMultiplier
  statDisplayOpts?: WorkshopUtilityLabDisplayOpts
}) {
  const { t } = useI18n()
  const max = workshopUtilityMaxLevel(fieldKey)
  const maxed = level >= max
  const coinDiscountPercent = useUtilityWorkshopCoinDiscount()
  const nextCoins = discountedWorkshopBulkMarginal(
    level,
    max,
    bulkStep,
    (L) => workshopUtilityNextMarginalCoins(fieldKey, L),
    coinDiscountPercent,
  )
  const statLabel = workshopUtilityStatDisplay(fieldKey, level, statDisplayOpts)
  const stepHint = formatWorkshopBulkStepLabel(bulkStep)
  const statName = t(titleId)

  return (
    <li
      id={workshopStatDomId(fieldKey)}
      
      className={maxed ? 'workshop__card workshop__card--max' : 'workshop__card workshop__card--active'}
    >
      <div className="workshop__card-damage-head">
        <span className="workshop__card-name">{statName}</span>
        <span className="workshop__card-value">{statLabel}</span>
      </div>
            <div className="workshop__card-level-row">
        <WorkshopLevelStepRow
          level={level}
          max={max}
          downAriaLabel={`${statName} — ${t('ws_defense_level_down_aria')} (${stepHint})`}
          upAriaLabel={`${statName} — ${t('ws_defense_level_up_aria')} (${stepHint})`}
          onBump={onBump}
          onSetLevel={onSetLevel}
        >
          <div className="workshop__level-field">
                    <input
                      className="workshop__level-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={`${statName} — ${t('ws_defense_level_input_aria')}`}
                      value={draft}
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
      </div>
    </li>
  )
}

const WORKSHOP_BUDGET_COLLAPSED_STORAGE_KEY = 'tower-export-workshop-budget-collapsed-v1'

type WorkshopPageProps = {
  embeddedInPanel?: boolean
  /** In-panel: mount node between app tabs and workshop panel (shared chrome). */
  toolbarMount?: HTMLElement | null
  /** When set, defense **Health** / **Health Regen** workshop values include simulated lab multipliers. */
  researchData?: ResearchData | null
}

export function WorkshopPage({
  embeddedInPanel = false,
  toolbarMount = null,
  researchData = null,
}: WorkshopPageProps) {
  const { t, fmt } = useI18n()
  const { workshopFlat, setTowerBuild, labLevelOverrides, gameResearchLevel } =
    useTowerWorkspaceContext()
  const workshopPersisted = workshopFlat
  const onWorkshopPersistedChange = useCallback(
    (next: WorkshopPersistedV1) => {
      setTowerBuild(splitTowerBuild(next))
    },
    [setTowerBuild],
  )
  const [budgetPanelsVisible] = useBudgetPanelsVisible()
  const headingId = useId()
  const workshopBudgetTitleId = useId().replace(/:/g, '')
  const workshopBudgetBodyId = useId().replace(/:/g, '')
  const {
    hideMaxed,
    mainTab,
    category,
    multiplier,
    damageLevel,
    attackSpeedLevel,
    critChanceLevel,
    critFactorLevel,
    attackRangeLevel,
    damagePerMeterLevel,
    multishotChanceLevel,
    multishotTargetsLevel,
    rapidFireChanceLevel,
    rapidFireDurationLevel,
    bounceShotChanceLevel,
    bounceShotTargetsLevel,
    bounceShotRangeLevel,
    superCritChanceLevel,
    superCritMultLevel,
    rendArmorChanceLevel,
    rendArmorMultLevel,
  } = workshopPersisted

  const workshopMainTab =
    mainTab === 'modules' || mainTab === 'cards' ? 'upgrade' : mainTab

  const relicOwnedSet = useMemo(
    () => new Set(workshopPersisted.relicOwnedIds),
    [workshopPersisted.relicOwnedIds],
  )

  const mergedLabLevelOverrides = useMemo(
    () =>
      researchData != null
        ? mergeLabOverridesForDisplayedDamage(
            researchData,
            labLevelOverrides,
            gameResearchLevel,
          )
        : labLevelOverrides,
    [researchData, labLevelOverrides, gameResearchLevel],
  )

  const submoduleBonusContext = useMemo(
    (): WorkshopSubmoduleBonusContext => ({
      ws: workshopPersisted,
      research: researchData,
      labOverrides: mergedLabLevelOverrides,
    }),
    [workshopPersisted, researchData, mergedLabLevelOverrides],
  )

  const defenseStatLabDisplayOpts = useMemo((): WorkshopDefenseStatDisplayOpts | undefined => {
    const lab = buildWorkshopDefenseLabDisplayOpts(researchData, labLevelOverrides)
    const cardMult = (id: WorkshopGameCardId) =>
      workshopCardMultProduct(workshopPersisted, researchData, labLevelOverrides, id)
    const cardAdd = (id: WorkshopGameCardId) =>
      workshopCardAddPercentPoints(workshopPersisted, researchData, labLevelOverrides, id)
    const extraDefense = cardAdd('extraDefense')
    const armorChassis = workshopChassisModuleHeroStatMultiplier(workshopPersisted, 'armor')
    const chassisDefense: Pick<WorkshopDefenseStatDisplayOpts, 'armorTowerHealthMultiplier'> =
      armorChassis > 1 + 1e-9 ? { armorTowerHealthMultiplier: armorChassis } : {}
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(
      researchData,
      labLevelOverrides,
    )
    const healthEnhanceMult = workshopDisplayedHealthEnhancementMultiplier(
      workshopPersisted.enhanceHealthLevel,
      enhancementsUnlocked,
    )
    const healthRelicsBonus = workshopHealthRelicsBonusFraction(relicOwnedSet)
    const healthRegenEnhanceMult = workshopDisplayedHealthRegenEnhancementMultiplier(
      workshopPersisted.enhanceHealthRegenLevel,
      enhancementsUnlocked,
    )
    const healthRegenRelicsBonus = workshopHealthRegenRelicsBonusFraction(relicOwnedSet)
    const landMineEnhanceMult = workshopDisplayedLandMineDamageEnhancementMultiplier(
      workshopPersisted.enhanceLandMineDamageLevel,
      enhancementsUnlocked,
    )
    const wallHealthEnhanceMult = workshopDisplayedWallHealthEnhancementMultiplier(
      workshopPersisted.enhanceWallHealthLevel,
      enhancementsUnlocked,
    )
    const healthCard = cardMult('health')
    const healthRegenCard = cardMult('healthRegen')
    const healthLab =
      lab?.healthLabMultiplier != null && lab.healthLabMultiplier > 1 + 1e-9
        ? lab.healthLabMultiplier
        : undefined
    const enriched: WorkshopDefenseStatDisplayOpts = {
      ...(lab ?? {}),
      ...chassisDefense,
      healthLabMultiplier: healthLab,
      healthCardMultiplier: healthCard > 1 + 1e-9 ? healthCard : undefined,
      healthRelicsBonus: healthRelicsBonus > 0 ? healthRelicsBonus : undefined,
      healthEnhancementsMultiplier:
        healthEnhanceMult > 1 + 1e-9 ? healthEnhanceMult : undefined,
      healthRegenCardMultiplier:
        healthRegenCard > 1 + 1e-9 ? healthRegenCard : undefined,
      healthRegenRelicsBonus:
        healthRegenRelicsBonus > 0 ? healthRegenRelicsBonus : undefined,
      healthRegenEnhancementsMultiplier:
        healthRegenEnhanceMult > 1 + 1e-9 ? healthRegenEnhanceMult : undefined,
      landMineDamageEnhancementsMultiplier:
        landMineEnhanceMult > 1 + 1e-9 ? landMineEnhanceMult : undefined,
      wallHealthEnhancementsMultiplier:
        wallHealthEnhanceMult > 1 + 1e-9 ? wallHealthEnhanceMult : undefined,
      defenseAbsoluteLabMultiplier: mergeLabAndCardMult(
        lab?.defenseAbsoluteLabMultiplier,
        cardMult('fortress'),
      ),
      defensePercentCardPercentPoints: extraDefense > 0 ? extraDefense : undefined,
    }
    if (
      lab == null &&
      healthCard === 1 &&
      healthRelicsBonus <= 0 &&
      healthEnhanceMult <= 1 + 1e-9 &&
      healthRegenRelicsBonus <= 0 &&
      healthRegenEnhanceMult <= 1 + 1e-9 &&
      landMineEnhanceMult <= 1 + 1e-9 &&
      wallHealthEnhanceMult <= 1 + 1e-9 &&
      healthRegenCard === 1 &&
      cardMult('fortress') === 1 &&
      extraDefense === 0 &&
      Object.keys(chassisDefense).length === 0
    ) {
      return enrichDefenseStatDisplayOpts(
        enrichDefenseStatDisplayOptsWithSubmodules(
          undefined,
          workshopPersisted.simSubmoduleSelections,
          submoduleBonusContext,
        ),
        relicOwnedSet,
      )
    }
    return enrichDefenseStatDisplayOpts(
      enrichDefenseStatDisplayOptsWithSubmodules(
        enriched,
        workshopPersisted.simSubmoduleSelections,
        submoduleBonusContext,
      ),
      relicOwnedSet,
    )
  }, [researchData, labLevelOverrides, workshopPersisted, relicOwnedSet, submoduleBonusContext])

  const attackStatLabDisplayOpts = useMemo((): WorkshopAttackLabDisplayOpts | undefined => {
    const lab = buildWorkshopAttackLabDisplayOpts(researchData, labLevelOverrides)
    const cardMult = (id: WorkshopGameCardId) =>
      workshopCardMultProduct(workshopPersisted, researchData, labLevelOverrides, id)
    const critCard = workshopCardAddPercentPoints(
      workshopPersisted,
      researchData,
      labLevelOverrides,
      'criticalChance',
    )
    const rangeMult = mergeLabAndCardMult(lab?.attackRangeLabMultiplier, cardMult('range'))
    if (lab == null && critCard === 0 && rangeMult === undefined) {
      return enrichAttackLabDisplayOpts(
        enrichAttackLabDisplayOptsWithSubmodules(
          undefined,
          workshopPersisted.simSubmoduleSelections,
          submoduleBonusContext,
        ),
        relicOwnedSet,
      )
    }
    return enrichAttackLabDisplayOpts(
      enrichAttackLabDisplayOptsWithSubmodules(
        {
          ...(lab ?? {}),
          attackRangeLabMultiplier: rangeMult,
          criticalChanceCardPercentPoints: critCard > 0 ? critCard : undefined,
        },
        workshopPersisted.simSubmoduleSelections,
        submoduleBonusContext,
      ),
      relicOwnedSet,
    )
  }, [researchData, labLevelOverrides, workshopPersisted, relicOwnedSet, submoduleBonusContext])

  const utilityStatLabDisplayOpts = useMemo((): WorkshopUtilityLabDisplayOpts | undefined => {
    const lab = buildWorkshopUtilityLabDisplayOpts(researchData, labLevelOverrides)
    const cardMult = (id: WorkshopGameCardId) =>
      workshopCardMultProduct(workshopPersisted, researchData, labLevelOverrides, id)
    const cardAdd = (id: WorkshopGameCardId) =>
      workshopCardAddPercentPoints(workshopPersisted, researchData, labLevelOverrides, id)
    const cash = cardMult('cash')
    const freeUpgrades = cardAdd('freeUpgrades')
    const packageChance = cardAdd('recoveryPackageChance')
    const enhancementsUnlocked = workshopEnhancementsLabUnlocked(
      researchData,
      labLevelOverrides,
    )
    const cashBonusEnhanceMult = workshopDisplayedCashBonusEnhancementMultiplier(
      workshopPersisted.enhanceCashBonusLevel,
      enhancementsUnlocked,
    )
    const coinBonusEnhanceMult = workshopDisplayedCoinsKillBonusEnhancementMultiplier(
      workshopPersisted.enhanceCoinBonusLevel,
      enhancementsUnlocked,
    )
    const recoveryAmountEnhanceMult = workshopDisplayedRecoveryAmountEnhancementMultiplier(
      workshopPersisted.enhanceRecoveryPackageLevel,
      enhancementsUnlocked,
    )
    const maxRecoveryEnhanceMult = workshopDisplayedMaxRecoveryEnhancementMultiplier(
      workshopPersisted.enhanceRecoveryPackageLevel,
      enhancementsUnlocked,
    )
    const enemyLevelSkipEnhanceMult = workshopDisplayedEnemyLevelSkipEnhancementMultiplier(
      workshopPersisted.enhanceEnemyLevelSkipLevel,
      enhancementsUnlocked,
    )
    const enriched: WorkshopUtilityLabDisplayOpts = {
      ...(lab ?? {}),
      cashBonusLabMultiplier: mergeLabAndCardMult(lab?.cashBonusLabMultiplier, cash),
      cashPerWaveLabMultiplier: mergeLabAndCardMult(lab?.cashPerWaveLabMultiplier, cash),
      coinsKillBonusEnhanceMultiplier:
        coinBonusEnhanceMult > 1 + 1e-9 ? coinBonusEnhanceMult : undefined,
      freeUpgradesCardPercentPoints: freeUpgrades > 0 ? freeUpgrades : undefined,
      packageChanceCardPercentPoints: packageChance > 0 ? packageChance : undefined,
      cashBonusEnhanceMultiplier:
        cashBonusEnhanceMult > 1 + 1e-9 ? cashBonusEnhanceMult : undefined,
      recoveryAmountEnhancementsMultiplier:
        recoveryAmountEnhanceMult > 1 + 1e-9 ? recoveryAmountEnhanceMult : undefined,
      maxRecoveryEnhancementsMultiplier:
        maxRecoveryEnhanceMult > 1 + 1e-9 ? maxRecoveryEnhanceMult : undefined,
      enemyLevelSkipEnhancementsMultiplier:
        enemyLevelSkipEnhanceMult > 1 + 1e-9 ? enemyLevelSkipEnhanceMult : undefined,
      enhanceFreeUpgradesLevel: workshopPersisted.enhanceFreeUpgradesLevel,
      workshopEnhancementsLabUnlocked: enhancementsUnlocked,
    }
    if (
      lab == null &&
      cash === 1 &&
      freeUpgrades === 0 &&
      packageChance === 0 &&
      cashBonusEnhanceMult <= 1 + 1e-9 &&
      coinBonusEnhanceMult <= 1 + 1e-9 &&
      recoveryAmountEnhanceMult <= 1 + 1e-9 &&
      maxRecoveryEnhanceMult <= 1 + 1e-9 &&
      enemyLevelSkipEnhanceMult <= 1 + 1e-9 &&
      workshopPersisted.enhanceFreeUpgradesLevel <= 0
    ) {
      return enrichUtilityLabDisplayOpts(
        enrichUtilityLabDisplayOptsWithSubmodules(
          undefined,
          workshopPersisted.simSubmoduleSelections,
          submoduleBonusContext,
        ),
        relicOwnedSet,
      )
    }
    return enrichUtilityLabDisplayOpts(
      enrichUtilityLabDisplayOptsWithSubmodules(
        enriched,
        workshopPersisted.simSubmoduleSelections,
        submoduleBonusContext,
      ),
      relicOwnedSet,
    )
  }, [researchData, labLevelOverrides, workshopPersisted, relicOwnedSet, submoduleBonusContext])

  const damageDisplayOpts = useMemo(
    (): WorkshopDamageDisplayOpts =>
      workshopDamageDisplayOptsFromPersisted(
        workshopPersisted,
        researchData,
        labLevelOverrides,
        gameResearchLevel,
      ),
    [researchData, labLevelOverrides, gameResearchLevel, workshopPersisted],
  )

  const attackSpeedDisplayOpts = useMemo((): WorkshopAttackSpeedDisplayOpts | undefined => {
    const opts = workshopAttackSpeedDisplayOptsFromPersisted(
      workshopPersisted,
      researchData,
      labLevelOverrides,
      gameResearchLevel,
    )
    if (opts == null) return undefined
    return {
      ...opts,
      moduleSubEffect: totalCannonAttackSpeedFromSelections(
        workshopPersisted.simSubmoduleSelections,
        submoduleBonusContext,
      ),
    }
  }, [researchData, labLevelOverrides, gameResearchLevel, workshopPersisted, submoduleBonusContext])

  const workshopEnhancementsLabUnlockedFlag = useMemo(
    () => workshopEnhancementsLabUnlocked(researchData, labLevelOverrides),
    [researchData, labLevelOverrides],
  )

  const critFactorEnhancementMultiplier = useMemo(
    () =>
      workshopDisplayedCritFactorEnhancementMultiplier(
        workshopPersisted.enhanceCritFactorLevel,
        workshopEnhancementsLabUnlockedFlag,
      ),
    [workshopEnhancementsLabUnlockedFlag, workshopPersisted.enhanceCritFactorLevel],
  )

  const superCritMultEnhancementMultiplier = useMemo(
    () =>
      workshopDisplayedSuperCritMultEnhancementMultiplier(
        workshopPersisted.enhanceSuperCritMultLevel,
        workshopEnhancementsLabUnlockedFlag,
      ),
    [workshopEnhancementsLabUnlockedFlag, workshopPersisted.enhanceSuperCritMultLevel],
  )

  const rendArmorChanceEnhancementMultiplier = useMemo(
    () =>
      workshopDisplayedRendArmorChanceEnhancementMultiplier(
        workshopPersisted.enhanceRendArmorLevel,
        workshopEnhancementsLabUnlockedFlag,
      ),
    [workshopEnhancementsLabUnlockedFlag, workshopPersisted.enhanceRendArmorLevel],
  )

  const rendArmorMultEnhancementMultiplier = useMemo(
    () =>
      workshopDisplayedRendArmorMultEnhancementMultiplier(
        workshopPersisted.enhanceRendArmorLevel,
        workshopEnhancementsLabUnlockedFlag,
      ),
    [workshopEnhancementsLabUnlockedFlag, workshopPersisted.enhanceRendArmorLevel],
  )

  const workshopCoinDiscountOpts = useMemo((): WorkshopCoinDiscountOpts => {
    if (researchData == null) {
      return {
        attackDiscountPercent: 0,
        defenseDiscountPercent: 0,
        utilityDiscountPercent: 0,
        enhancementAttackDiscountPercent: 0,
        enhancementDefenseDiscountPercent: 0,
        enhancementUtilityDiscountPercent: 0,
        workshopEnhancementsLabUnlocked: false,
      }
    }
    return {
      attackDiscountPercent: resolveWorkshopAttackDiscountPercent(
        researchData,
        labLevelOverrides,
      ),
      defenseDiscountPercent: resolveWorkshopDefenseDiscountPercent(
        researchData,
        labLevelOverrides,
      ),
      utilityDiscountPercent: resolveWorkshopUtilityDiscountPercent(
        researchData,
        labLevelOverrides,
      ),
      enhancementAttackDiscountPercent: resolveEnhancementAttackDiscountPercent(
        researchData,
        labLevelOverrides,
      ),
      enhancementDefenseDiscountPercent: resolveEnhancementDefenseDiscountPercent(
        researchData,
        labLevelOverrides,
      ),
      enhancementUtilityDiscountPercent: resolveEnhancementUtilityDiscountPercent(
        researchData,
        labLevelOverrides,
      ),
      workshopEnhancementsLabUnlocked: workshopEnhancementsLabUnlockedFlag,
    }
  }, [researchData, labLevelOverrides, workshopEnhancementsLabUnlockedFlag])

  const workshopCoinDiscountContext = useMemo(
    (): WorkshopCoinDiscountContextValue => ({
      attack: workshopCoinDiscountOpts.attackDiscountPercent ?? 0,
      defense: workshopCoinDiscountOpts.defenseDiscountPercent ?? 0,
      utility: workshopCoinDiscountOpts.utilityDiscountPercent ?? 0,
    }),
    [workshopCoinDiscountOpts],
  )

  const [multiplierOpen, setMultiplierOpen] = useState(false)
  const [workshopBudgetCollapsed, setWorkshopBudgetCollapsed] = useState(() => {
    try {
      return localStorage.getItem(WORKSHOP_BUDGET_COLLAPSED_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(
        WORKSHOP_BUDGET_COLLAPSED_STORAGE_KEY,
        workshopBudgetCollapsed ? '1' : '0',
      )
    } catch {
      /* ignore quota / private mode */
    }
  }, [workshopBudgetCollapsed])
  const [damageDraft, setDamageDraft] = useState('0')
  const [attackSpeedDraft, setAttackSpeedDraft] = useState('0')
  const [critChanceDraft, setCritChanceDraft] = useState('0')
  const [critFactorDraft, setCritFactorDraft] = useState('0')
  const [attackRangeDraft, setAttackRangeDraft] = useState('0')
  const [damagePerMeterDraft, setDamagePerMeterDraft] = useState('0')
  const [multishotChanceDraft, setMultishotChanceDraft] = useState('0')
  const [multishotTargetsDraft, setMultishotTargetsDraft] = useState('0')
  const [rapidFireChanceDraft, setRapidFireChanceDraft] = useState('0')
  const [rapidFireDurationDraft, setRapidFireDurationDraft] = useState('0')
  const [bounceShotChanceDraft, setBounceShotChanceDraft] = useState('0')
  const [bounceShotTargetsDraft, setBounceShotTargetsDraft] = useState('0')
  const [bounceShotRangeDraft, setBounceShotRangeDraft] = useState('0')
  const [superCritChanceDraft, setSuperCritChanceDraft] = useState('0')
  const [superCritMultDraft, setSuperCritMultDraft] = useState('0')
  const [rendArmorChanceDraft, setRendArmorChanceDraft] = useState('0')
  const [rendArmorMultDraft, setRendArmorMultDraft] = useState('0')
  const [defenseDrafts, setDefenseDrafts] = useState<Record<WorkshopDefenseUpgradeKey, string>>(
    () =>
      Object.fromEntries(WORKSHOP_DEFENSE_UPGRADE_ORDER.map((k) => [k, '0'])) as Record<
        WorkshopDefenseUpgradeKey,
        string
      >,
  )
  const [utilityDrafts, setUtilityDrafts] = useState<Record<WorkshopUtilityUpgradeKey, string>>(
    () =>
      Object.fromEntries(WORKSHOP_UTILITY_UPGRADE_ORDER.map((k) => [k, '0'])) as Record<
        WorkshopUtilityUpgradeKey,
        string
      >,
  )
  const [resetWorkshopConfirmOpen, setResetWorkshopConfirmOpen] = useState(false)
  const pendingWorkshopScrollDomId = useRef<string | null>(null)
  const [workshopScrollLayoutGen, setWorkshopScrollLayoutGen] = useState(0)
  const multRailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- keep numeric draft inputs aligned with persisted workshop snapshot (presets, import, reset, steppers). */
    setDamageDraft(String(workshopPersisted.damageLevel))
    setAttackSpeedDraft(String(workshopPersisted.attackSpeedLevel))
    setCritChanceDraft(String(workshopPersisted.critChanceLevel))
    setCritFactorDraft(String(workshopPersisted.critFactorLevel))
    setAttackRangeDraft(String(workshopPersisted.attackRangeLevel))
    setDamagePerMeterDraft(String(workshopPersisted.damagePerMeterLevel))
    setMultishotChanceDraft(String(workshopPersisted.multishotChanceLevel))
    setMultishotTargetsDraft(String(workshopPersisted.multishotTargetsLevel))
    setRapidFireChanceDraft(String(workshopPersisted.rapidFireChanceLevel))
    setRapidFireDurationDraft(String(workshopPersisted.rapidFireDurationLevel))
    setBounceShotChanceDraft(String(workshopPersisted.bounceShotChanceLevel))
    setBounceShotTargetsDraft(String(workshopPersisted.bounceShotTargetsLevel))
    setBounceShotRangeDraft(String(workshopPersisted.bounceShotRangeLevel))
    setSuperCritChanceDraft(String(workshopPersisted.superCritChanceLevel))
    setSuperCritMultDraft(String(workshopPersisted.superCritMultLevel))
    setRendArmorChanceDraft(String(workshopPersisted.rendArmorChanceLevel))
    setRendArmorMultDraft(String(workshopPersisted.rendArmorMultLevel))
    setDefenseDrafts(
      Object.fromEntries(
        WORKSHOP_DEFENSE_UPGRADE_ORDER.map((k) => [k, String(workshopPersisted[k])]),
      ) as Record<WorkshopDefenseUpgradeKey, string>,
    )
    setUtilityDrafts(
      Object.fromEntries(
        WORKSHOP_UTILITY_UPGRADE_ORDER.map((k) => [k, String(workshopPersisted[k])]),
      ) as Record<WorkshopUtilityUpgradeKey, string>,
    )
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps -- list only level fields; workshop object identity may change without level edits
  }, [
    workshopPersisted.damageLevel,
    workshopPersisted.attackSpeedLevel,
    workshopPersisted.critChanceLevel,
    workshopPersisted.critFactorLevel,
    workshopPersisted.attackRangeLevel,
    workshopPersisted.damagePerMeterLevel,
    workshopPersisted.multishotChanceLevel,
    workshopPersisted.multishotTargetsLevel,
    workshopPersisted.rapidFireChanceLevel,
    workshopPersisted.rapidFireDurationLevel,
    workshopPersisted.bounceShotChanceLevel,
    workshopPersisted.bounceShotTargetsLevel,
    workshopPersisted.bounceShotRangeLevel,
    workshopPersisted.superCritChanceLevel,
    workshopPersisted.superCritMultLevel,
    workshopPersisted.rendArmorChanceLevel,
    workshopPersisted.rendArmorMultLevel,
    workshopPersisted.healthLevel,
    workshopPersisted.healthRegenLevel,
    workshopPersisted.defensePercentLevel,
    workshopPersisted.defenseAbsoluteLevel,
    workshopPersisted.thornDamageLevel,
    workshopPersisted.lifestealLevel,
    workshopPersisted.knockbackChanceLevel,
    workshopPersisted.knockbackForceLevel,
    workshopPersisted.orbSpeedLevel,
    workshopPersisted.orbsLevel,
    workshopPersisted.shockwaveSizeLevel,
    workshopPersisted.shockwaveFrequencyLevel,
    workshopPersisted.landMineChanceLevel,
    workshopPersisted.landMineDamageLevel,
    workshopPersisted.landMineRadiusLevel,
    workshopPersisted.deathDefyLevel,
    workshopPersisted.wallHealthLevel,
    workshopPersisted.wallRebuildLevel,
    workshopPersisted.cashBonusLevel,
    workshopPersisted.cashPerWaveLevel,
    workshopPersisted.coinsKillBonusLevel,
    workshopPersisted.coinsWaveLevel,
    workshopPersisted.freeAttackUpgradeLevel,
    workshopPersisted.freeDefenseUpgradeLevel,
    workshopPersisted.freeUtilityUpgradeLevel,
    workshopPersisted.interestPerWaveLevel,
    workshopPersisted.recoveryAmountLevel,
    workshopPersisted.maxRecoveryLevel,
    workshopPersisted.packageChanceLevel,
    workshopPersisted.enemyAttackLevelSkipLevel,
    workshopPersisted.enemyHealthLevelSkipLevel,
  ])

  const sectionTitleId: StringId =
    workshopMainTab === 'enhance' && category === 'attack'
        ? 'ws_section_attack_enhance'
        : workshopMainTab === 'enhance' && category === 'defense'
          ? 'ws_section_defense_enhance'
          : workshopMainTab === 'enhance' && category === 'utility'
            ? 'ws_section_utility_enhance'
            : SECTION_TITLE[category]

  const showWorkshopBudget =
    budgetPanelsVisible &&
    (workshopMainTab === 'upgrade' || workshopMainTab === 'enhance')
  const showCategoryBar = workshopMainTab === 'upgrade' || workshopMainTab === 'enhance'

  const enhancementAttackDiscountPercent =
    workshopCoinDiscountOpts.enhancementAttackDiscountPercent ?? 0
  const enhancementDefenseDiscountPercent =
    workshopCoinDiscountOpts.enhancementDefenseDiscountPercent ?? 0
  const enhancementUtilityDiscountPercent =
    workshopCoinDiscountOpts.enhancementUtilityDiscountPercent ?? 0

  const commitDamageDraft = useCallback(() => {
    const raw = damageDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setDamageDraft(String(damageLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setDamageDraft(String(damageLevel))
      return
    }
    const c = clampWorkshopDamageLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, damageLevel: c })
  }, [damageDraft, damageLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpDamage = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopDamageLevel(
        damageLevel +
          workshopBulkBumpDelta(direction, multiplier, damageLevel, WORKSHOP_DAMAGE_MAX_LEVEL),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, damageLevel: nv })
    },
    [damageLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitAttackSpeedDraft = useCallback(() => {
    const raw = attackSpeedDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setAttackSpeedDraft(String(attackSpeedLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setAttackSpeedDraft(String(attackSpeedLevel))
      return
    }
    const c = clampWorkshopAttackSpeedLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, attackSpeedLevel: c })
  }, [attackSpeedDraft, attackSpeedLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpAttackSpeed = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopAttackSpeedLevel(
        attackSpeedLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            attackSpeedLevel,
            WORKSHOP_ATTACK_SPEED_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, attackSpeedLevel: nv })
    },
    [attackSpeedLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitCritChanceDraft = useCallback(() => {
    const raw = critChanceDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setCritChanceDraft(String(critChanceLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setCritChanceDraft(String(critChanceLevel))
      return
    }
    const c = clampWorkshopCriticalChanceLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, critChanceLevel: c })
  }, [critChanceDraft, critChanceLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpCritChance = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopCriticalChanceLevel(
        critChanceLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            critChanceLevel,
            WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, critChanceLevel: nv })
    },
    [critChanceLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitCritFactorDraft = useCallback(() => {
    const raw = critFactorDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setCritFactorDraft(String(critFactorLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setCritFactorDraft(String(critFactorLevel))
      return
    }
    const c = clampWorkshopCriticalFactorLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, critFactorLevel: c })
  }, [critFactorDraft, critFactorLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpCritFactor = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopCriticalFactorLevel(
        critFactorLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            critFactorLevel,
            WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, critFactorLevel: nv })
    },
    [critFactorLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitAttackRangeDraft = useCallback(() => {
    const raw = attackRangeDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setAttackRangeDraft(String(attackRangeLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setAttackRangeDraft(String(attackRangeLevel))
      return
    }
    const c = clampWorkshopAttackRangeLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, attackRangeLevel: c })
  }, [attackRangeDraft, attackRangeLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpAttackRange = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopAttackRangeLevel(
        attackRangeLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            attackRangeLevel,
            WORKSHOP_ATTACK_RANGE_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, attackRangeLevel: nv })
    },
    [attackRangeLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitDamagePerMeterDraft = useCallback(() => {
    const raw = damagePerMeterDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setDamagePerMeterDraft(String(damagePerMeterLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setDamagePerMeterDraft(String(damagePerMeterLevel))
      return
    }
    const c = clampWorkshopDamagePerMeterLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, damagePerMeterLevel: c })
  }, [damagePerMeterDraft, damagePerMeterLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpDamagePerMeter = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopDamagePerMeterLevel(
        damagePerMeterLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            damagePerMeterLevel,
            WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, damagePerMeterLevel: nv })
    },
    [damagePerMeterLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitMultishotChanceDraft = useCallback(() => {
    const raw = multishotChanceDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setMultishotChanceDraft(String(multishotChanceLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setMultishotChanceDraft(String(multishotChanceLevel))
      return
    }
    const c = clampWorkshopMultishotChanceLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, multishotChanceLevel: c })
  }, [multishotChanceDraft, multishotChanceLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpMultishotChance = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopMultishotChanceLevel(
        multishotChanceLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            multishotChanceLevel,
            WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, multishotChanceLevel: nv })
    },
    [multishotChanceLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitMultishotTargetsDraft = useCallback(() => {
    const raw = multishotTargetsDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setMultishotTargetsDraft(String(multishotTargetsLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setMultishotTargetsDraft(String(multishotTargetsLevel))
      return
    }
    const c = clampWorkshopMultishotTargetsLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, multishotTargetsLevel: c })
  }, [multishotTargetsDraft, multishotTargetsLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpMultishotTargets = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopMultishotTargetsLevel(
        multishotTargetsLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            multishotTargetsLevel,
            WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, multishotTargetsLevel: nv })
    },
    [multishotTargetsLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitRapidFireChanceDraft = useCallback(() => {
    const raw = rapidFireChanceDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setRapidFireChanceDraft(String(rapidFireChanceLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setRapidFireChanceDraft(String(rapidFireChanceLevel))
      return
    }
    const c = clampWorkshopRapidFireChanceLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, rapidFireChanceLevel: c })
  }, [rapidFireChanceDraft, rapidFireChanceLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpRapidFireChance = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopRapidFireChanceLevel(
        rapidFireChanceLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            rapidFireChanceLevel,
            WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, rapidFireChanceLevel: nv })
    },
    [rapidFireChanceLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitRapidFireDurationDraft = useCallback(() => {
    const raw = rapidFireDurationDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setRapidFireDurationDraft(String(rapidFireDurationLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setRapidFireDurationDraft(String(rapidFireDurationLevel))
      return
    }
    const c = clampWorkshopRapidFireDurationLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, rapidFireDurationLevel: c })
  }, [rapidFireDurationDraft, rapidFireDurationLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpRapidFireDuration = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopRapidFireDurationLevel(
        rapidFireDurationLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            rapidFireDurationLevel,
            WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, rapidFireDurationLevel: nv })
    },
    [rapidFireDurationLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitBounceShotChanceDraft = useCallback(() => {
    const raw = bounceShotChanceDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setBounceShotChanceDraft(String(bounceShotChanceLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setBounceShotChanceDraft(String(bounceShotChanceLevel))
      return
    }
    const c = clampWorkshopBounceShotChanceLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, bounceShotChanceLevel: c })
  }, [bounceShotChanceDraft, bounceShotChanceLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpBounceShotChance = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopBounceShotChanceLevel(
        bounceShotChanceLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            bounceShotChanceLevel,
            WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, bounceShotChanceLevel: nv })
    },
    [bounceShotChanceLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitBounceShotTargetsDraft = useCallback(() => {
    const raw = bounceShotTargetsDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setBounceShotTargetsDraft(String(bounceShotTargetsLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setBounceShotTargetsDraft(String(bounceShotTargetsLevel))
      return
    }
    const c = clampWorkshopBounceShotTargetsLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, bounceShotTargetsLevel: c })
  }, [bounceShotTargetsDraft, bounceShotTargetsLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpBounceShotTargets = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopBounceShotTargetsLevel(
        bounceShotTargetsLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            bounceShotTargetsLevel,
            WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, bounceShotTargetsLevel: nv })
    },
    [bounceShotTargetsLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitBounceShotRangeDraft = useCallback(() => {
    const raw = bounceShotRangeDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setBounceShotRangeDraft(String(bounceShotRangeLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setBounceShotRangeDraft(String(bounceShotRangeLevel))
      return
    }
    const c = clampWorkshopBounceShotRangeLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, bounceShotRangeLevel: c })
  }, [bounceShotRangeDraft, bounceShotRangeLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpBounceShotRange = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopBounceShotRangeLevel(
        bounceShotRangeLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            bounceShotRangeLevel,
            WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, bounceShotRangeLevel: nv })
    },
    [bounceShotRangeLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitSuperCritChanceDraft = useCallback(() => {
    const raw = superCritChanceDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setSuperCritChanceDraft(String(superCritChanceLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setSuperCritChanceDraft(String(superCritChanceLevel))
      return
    }
    const c = clampWorkshopSuperCritChanceLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, superCritChanceLevel: c })
  }, [superCritChanceDraft, superCritChanceLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpSuperCritChance = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopSuperCritChanceLevel(
        superCritChanceLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            superCritChanceLevel,
            WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, superCritChanceLevel: nv })
    },
    [superCritChanceLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitSuperCritMultDraft = useCallback(() => {
    const raw = superCritMultDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setSuperCritMultDraft(String(superCritMultLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setSuperCritMultDraft(String(superCritMultLevel))
      return
    }
    const c = clampWorkshopSuperCritMultLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, superCritMultLevel: c })
  }, [superCritMultDraft, superCritMultLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpSuperCritMult = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopSuperCritMultLevel(
        superCritMultLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            superCritMultLevel,
            WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, superCritMultLevel: nv })
    },
    [superCritMultLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitRendArmorChanceDraft = useCallback(() => {
    const raw = rendArmorChanceDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setRendArmorChanceDraft(String(rendArmorChanceLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setRendArmorChanceDraft(String(rendArmorChanceLevel))
      return
    }
    const c = clampWorkshopRendArmorChanceLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, rendArmorChanceLevel: c })
  }, [
    rendArmorChanceDraft,
    rendArmorChanceLevel,
    onWorkshopPersistedChange,
    workshopPersisted,
  ])

  const bumpRendArmorChance = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopRendArmorChanceLevel(
        rendArmorChanceLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            rendArmorChanceLevel,
            WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, rendArmorChanceLevel: nv })
    },
    [rendArmorChanceLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitRendArmorMultDraft = useCallback(() => {
    const raw = rendArmorMultDraft.trim().replace(/,/g, '')
    if (raw === '') {
      setRendArmorMultDraft(String(rendArmorMultLevel))
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) {
      setRendArmorMultDraft(String(rendArmorMultLevel))
      return
    }
    const c = clampWorkshopRendArmorMultLevel(n)
    onWorkshopPersistedChange({ ...workshopPersisted, rendArmorMultLevel: c })
  }, [rendArmorMultDraft, rendArmorMultLevel, onWorkshopPersistedChange, workshopPersisted])

  const bumpRendArmorMult = useCallback(
    (direction: -1 | 1) => {
      const nv = clampWorkshopRendArmorMultLevel(
        rendArmorMultLevel +
          workshopBulkBumpDelta(
            direction,
            multiplier,
            rendArmorMultLevel,
            WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL,
          ),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, rendArmorMultLevel: nv })
    },
    [rendArmorMultLevel, multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const bumpDefense = useCallback(
    (key: WorkshopDefenseUpgradeKey, direction: -1 | 1) => {
      const cur = workshopPersisted[key]
      const nv = workshopDefenseClampLevel(
        key,
        cur + workshopBulkBumpDelta(direction, multiplier, cur, workshopDefenseMaxLevel(key)),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: nv })
    },
    [multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const commitDefenseDraft = useCallback(
    (key: WorkshopDefenseUpgradeKey) => {
      const raw = defenseDrafts[key].trim().replace(/,/g, '')
      if (raw === '') {
        setDefenseDrafts((d) => ({ ...d, [key]: String(workshopPersisted[key]) }))
        return
      }
      const n = Number(raw)
      if (!Number.isFinite(n)) {
        setDefenseDrafts((d) => ({ ...d, [key]: String(workshopPersisted[key]) }))
        return
      }
      const c = workshopDefenseClampLevel(key, n)
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: c })
    },
    [defenseDrafts, onWorkshopPersistedChange, workshopPersisted],
  )

  const bumpUtility = useCallback(
    (key: WorkshopUtilityUpgradeKey, direction: -1 | 1) => {
      const cur = workshopPersisted[key]
      const nv = workshopUtilityClampLevel(
        key,
        cur + workshopBulkBumpDelta(direction, multiplier, cur, workshopUtilityMaxLevel(key)),
      )
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: nv })
    },
    [multiplier, onWorkshopPersistedChange, workshopPersisted],
  )

  const bumpUltimate = useCallback(
    (key: WorkshopUltimateUpgradeKey, direction: -1 | 1) => {
      const cur = workshopPersisted[key]
      const nv = workshopUltimateClampLevel(key, cur + direction)
      if (nv === cur) return
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: nv })
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const setUltimateLevel = useCallback(
    (key: WorkshopUltimateUpgradeKey, level: number) => {
      const nv = workshopUltimateClampLevel(key, level)
      if (nv === workshopPersisted[key]) return
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: nv })
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const toggleUltimateActive = useCallback(
    (weaponId: WorkshopUltimateWeaponId) => {
      if (!workshopUltimateWeaponIsOwned(workshopPersisted, weaponId)) return
      const key = workshopUltimateActiveKey(weaponId)
      onWorkshopPersistedChange({
        ...workshopPersisted,
        [key]: !workshopUltimateIsActive(workshopPersisted, weaponId),
      })
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const unlockUltimateWeapon = useCallback(
    (weaponId: WorkshopUltimateWeaponId) => {
      if (workshopUltimateWeaponIsOwned(workshopPersisted, weaponId)) return
      if (workshopUltimateUnlockCostForWeapon(workshopPersisted, weaponId) == null) return
      const ownedKey = workshopUltimateOwnedKey(weaponId)
      const activeKey = workshopUltimateActiveKey(weaponId)
      onWorkshopPersistedChange({
        ...workshopPersisted,
        [ownedKey]: true,
        [activeKey]: true,
      })
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const plusEnabled = workshopAllUltimateWeaponsReadyForPlus(workshopPersisted)

  const bumpUltimatePlus = useCallback(
    (abilityId: WorkshopUltimatePlusAbilityId, direction: -1 | 1) => {
      const key = workshopUltimatePlusLevelKey(abilityId)
      const cur = workshopPersisted[key] ?? -1
      if (!workshopUltimatePlusIsUnlocked(cur)) return
      const nv = workshopUltimatePlusClampLevel(abilityId, cur + direction)
      if (nv === cur) return
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: nv })
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const setUltimatePlusLevel = useCallback(
    (abilityId: WorkshopUltimatePlusAbilityId, level: number) => {
      const key = workshopUltimatePlusLevelKey(abilityId)
      const cur = workshopPersisted[key] ?? -1
      if (!workshopUltimatePlusIsUnlocked(cur)) return
      const nv = workshopUltimatePlusClampLevel(abilityId, level)
      if (nv === cur) return
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: nv })
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const unlockUltimatePlus = useCallback(
    (abilityId: WorkshopUltimatePlusAbilityId) => {
      const key = workshopUltimatePlusLevelKey(abilityId)
      const cur = workshopPersisted[key] ?? -1
      if (workshopUltimatePlusIsUnlocked(cur)) return
      if (!workshopAllUltimateWeaponsReadyForPlus(workshopPersisted)) return
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: 0 })
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const commitUtilityDraft = useCallback(
    (key: WorkshopUtilityUpgradeKey) => {
      const raw = utilityDrafts[key].trim().replace(/,/g, '')
      if (raw === '') {
        setUtilityDrafts((d) => ({ ...d, [key]: String(workshopPersisted[key]) }))
        return
      }
      const n = Number(raw)
      if (!Number.isFinite(n)) {
        setUtilityDrafts((d) => ({ ...d, [key]: String(workshopPersisted[key]) }))
        return
      }
      const c = workshopUtilityClampLevel(key, n)
      onWorkshopPersistedChange({ ...workshopPersisted, [key]: c })
    },
    [utilityDrafts, onWorkshopPersistedChange, workshopPersisted],
  )

  const visibleDemoRows = useMemo(() => {
    const base = DEMO_ROWS_BY_CATEGORY[category]
    return hideMaxed ? base.filter((r) => !r.maxed) : [...base]
  }, [category, hideMaxed])

  const visibleUltimateWeapons = useMemo(() => {
    if (category !== 'ultimate') return []
    return WORKSHOP_ULTIMATE_WEAPON_ORDER.filter(
      (weaponId) => !hideMaxed || !workshopUltimateWeaponAllMaxed(workshopPersisted, weaponId),
    )
  }, [category, hideMaxed, workshopPersisted])

  const showDamageCard =
    category === 'attack' &&
    (!hideMaxed || damageLevel < WORKSHOP_DAMAGE_MAX_LEVEL)
  const showAttackSpeedCard =
    category === 'attack' &&
    (!hideMaxed || attackSpeedLevel < WORKSHOP_ATTACK_SPEED_MAX_LEVEL)
  const showCritChanceCard =
    category === 'attack' &&
    (!hideMaxed || critChanceLevel < WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL)
  const showCritFactorCard =
    category === 'attack' &&
    (!hideMaxed || critFactorLevel < WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL)
  const showAttackRangeCard =
    category === 'attack' &&
    (!hideMaxed || attackRangeLevel < WORKSHOP_ATTACK_RANGE_MAX_LEVEL)
  const showDamagePerMeterCard =
    category === 'attack' &&
    (!hideMaxed || damagePerMeterLevel < WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL)
  const showMultishotChanceCard =
    category === 'attack' &&
    (!hideMaxed || multishotChanceLevel < WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL)
  const showMultishotTargetsCard =
    category === 'attack' &&
    (!hideMaxed || multishotTargetsLevel < WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL)
  const showRapidFireChanceCard =
    category === 'attack' &&
    (!hideMaxed || rapidFireChanceLevel < WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL)
  const showRapidFireDurationCard =
    category === 'attack' &&
    (!hideMaxed || rapidFireDurationLevel < WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL)
  const showBounceShotChanceCard =
    category === 'attack' &&
    (!hideMaxed || bounceShotChanceLevel < WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL)
  const showBounceShotTargetsCard =
    category === 'attack' &&
    (!hideMaxed || bounceShotTargetsLevel < WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL)
  const showBounceShotRangeCard =
    category === 'attack' &&
    (!hideMaxed || bounceShotRangeLevel < WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL)
  const showSuperCritChanceCard =
    category === 'attack' &&
    (!hideMaxed || superCritChanceLevel < WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL)
  const showSuperCritMultCard =
    category === 'attack' &&
    (!hideMaxed || superCritMultLevel < WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL)
  const showRendArmorChanceCard =
    category === 'attack' &&
    (!hideMaxed || rendArmorChanceLevel < WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL)
  const showRendArmorMultCard =
    category === 'attack' &&
    (!hideMaxed || rendArmorMultLevel < WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL)

  const resetWorkshopDemo = useCallback(
    () =>
      category === 'ultimate'
        ? resetWorkshopUltimates(workshopPersisted)
        : resetWorkshopUpgradeLevels(workshopPersisted),
    [category, workshopPersisted],
  )

  const { pushUndoSnapshot } = useWorkspaceUndo()

  const performResetWorkshopDemo = useCallback(() => {
    setResetWorkshopConfirmOpen(false)
    pushUndoSnapshot()
    onWorkshopPersistedChange(resetWorkshopDemo())
    setMultiplierOpen(false)
  }, [onWorkshopPersistedChange, pushUndoSnapshot, resetWorkshopDemo])

  const openResetWorkshopConfirm = useCallback(() => {
    setMultiplierOpen(false)
    setResetWorkshopConfirmOpen(true)
  }, [])

  useEffect(() => {
    if (!resetWorkshopConfirmOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setResetWorkshopConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [resetWorkshopConfirmOpen])

  useEffect(() => {
    if (!multiplierOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const el = multRailRef.current
      if (el && !el.contains(e.target as Node)) setMultiplierOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMultiplierOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [multiplierOpen])

  useEffect(() => {
    if (category === 'ultimate') deferInEffect(() => setMultiplierOpen(false))
  }, [category])

  const enhanceTabDisabled = category === 'ultimate'

  useEffect(() => {
    if (!enhanceTabDisabled || mainTab !== 'enhance') return
    deferInEffect(() =>
      onWorkshopPersistedChange({ ...workshopPersisted, mainTab: 'upgrade' }),
    )
  }, [enhanceTabDisabled, mainTab, onWorkshopPersistedChange, workshopPersisted])

  const setHideMaxed = useCallback(
    (v: boolean) => onWorkshopPersistedChange({ ...workshopPersisted, hideMaxed: v }),
    [onWorkshopPersistedChange, workshopPersisted],
  )

  const requestWorkshopDeepLink = useCallback(
    (target: string) => {
      const nav = resolveWorkshopDeepLinkNav(target)
      if (!nav) return
      pendingWorkshopScrollDomId.current = nav.domId
      onWorkshopPersistedChange({
        ...workshopPersisted,
        category: nav.category,
        mainTab: nav.mainTab,
        hideMaxed: false,
      })
      setWorkshopScrollLayoutGen((g) => g + 1)
    },
    [onWorkshopPersistedChange, workshopPersisted],
  )

  useLayoutEffect(() => {
    const domId = pendingWorkshopScrollDomId.current
    if (!domId) return
    const el = document.getElementById(domId)
    if (!el) return
    pendingWorkshopScrollDomId.current = null
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [
    category,
    workshopMainTab,
    hideMaxed,
    workshopScrollLayoutGen,
    showDamageCard,
    showAttackSpeedCard,
    showCritChanceCard,
    showCritFactorCard,
    showAttackRangeCard,
    showDamagePerMeterCard,
    showMultishotChanceCard,
    showMultishotTargetsCard,
    showRapidFireChanceCard,
    showRapidFireDurationCard,
    showBounceShotChanceCard,
    showBounceShotTargetsCard,
    showBounceShotRangeCard,
    showSuperCritChanceCard,
    showSuperCritMultCard,
    showRendArmorChanceCard,
    showRendArmorMultCard,
    visibleDemoRows,
    visibleUltimateWeapons,
  ])

  useEffect(() => {
    return subscribeAppDeepLink((link) => {
      if (link.kind !== 'workshop') return
      requestWorkshopDeepLink(link.target)
    })
  }, [requestWorkshopDeepLink])

  useEffect(() => {
    const link = parseAppDeepLinkFromUrl()
    if (link?.kind === 'workshop') deferInEffect(() => requestWorkshopDeepLink(link.target))
  }, [requestWorkshopDeepLink])

  const maxAllWorkshopVisible = useCallback(() => {
    setMultiplierOpen(false)
    pushUndoSnapshot()
    onWorkshopPersistedChange(applyWorkshopMaxAllVisible(workshopPersisted))
  }, [onWorkshopPersistedChange, pushUndoSnapshot, workshopPersisted])

  const workshopCoinAggregates = useMemo(
    () => computeWorkshopCoinAggregates(workshopPersisted, workshopCoinDiscountOpts),
    [workshopPersisted, workshopCoinDiscountOpts],
  )
  const workshopCoinLabels = useMemo(
    () => formatWorkshopCoinAggregates(workshopCoinAggregates),
    [workshopCoinAggregates],
  )
  const workshopStoneAggregates = useMemo(
    () => computeWorkshopStoneAggregates(workshopPersisted),
    [workshopPersisted],
  )
  const workshopStoneLabels = useMemo(
    () => formatWorkshopStoneAggregates(workshopStoneAggregates),
    [workshopStoneAggregates],
  )
  const budgetUsesStones = category === 'ultimate'
  const workshopBudgetLabels = budgetUsesStones ? workshopStoneLabels : workshopCoinLabels

  return (
    <div
      className={
        embeddedInPanel
          ? 'workshop workshop--embedded'
          : 'workshop'
      }
      aria-labelledby={embeddedInPanel ? undefined : headingId}
      aria-label={embeddedInPanel ? t('ws_title') : undefined}
    >
      {!embeddedInPanel ? (
        <header className="workshop__header">
          <div className="workshop__title-row">
            <h1 id={headingId} className="workshop__title">
              {t('ws_title').toLocaleUpperCase()}
            </h1>
          </div>
        </header>
      ) : null}

      {embeddedInPanel && toolbarMount
        ? createPortal(
            <WorkshopDemoToolbar
              hideMaxed={hideMaxed}
              setHideMaxed={setHideMaxed}
              onMaxAll={maxAllWorkshopVisible}
              onResetDemo={openResetWorkshopConfirm}
              workshopCategory={category}
            />,
            toolbarMount,
          )
        : null}

      {!embeddedInPanel ? (
        <div className="workshop__demo-toolbar">
          <WorkshopDemoToolbar
            hideMaxed={hideMaxed}
            setHideMaxed={setHideMaxed}
            onMaxAll={maxAllWorkshopVisible}
            onResetDemo={openResetWorkshopConfirm}
            workshopCategory={category}
          />
        </div>
      ) : null}

      <div className="workshop__tabs" role="tablist" aria-label={t('ws_title')}>
        <button
          type="button"
          role="tab"
          aria-selected={workshopMainTab === 'upgrade'}
          className={
            workshopMainTab === 'upgrade' ? 'workshop__tab workshop__tab--on' : 'workshop__tab'
          }
          onClick={() =>
            onWorkshopPersistedChange({ ...workshopPersisted, mainTab: 'upgrade' })
          }
        >
          {t('ws_tab_upgrade')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!enhanceTabDisabled && workshopMainTab === 'enhance'}
          aria-disabled={enhanceTabDisabled}
          disabled={enhanceTabDisabled}
          className={
            enhanceTabDisabled
              ? 'workshop__tab workshop__tab--disabled'
              : workshopMainTab === 'enhance'
                ? 'workshop__tab workshop__tab--on'
                : 'workshop__tab'
          }
          aria-label={enhanceTabDisabled ? t('ws_tab_enhance_unavailable_aria') : undefined}
          onClick={() =>
            onWorkshopPersistedChange({ ...workshopPersisted, mainTab: 'enhance' })
          }
        >
          {t('ws_tab_enhance')}
        </button>
      </div>

      {showWorkshopBudget ? (
      <div
        className={
          workshopBudgetCollapsed
            ? 'select-research__budget select-research__budget--collapsed'
            : 'select-research__budget'
        }
        role="region"
        aria-labelledby={workshopBudgetTitleId}
      >
        <div className="select-research__budget-head">
          <h2 id={workshopBudgetTitleId} className="select-research__budget-title">
            {t(budgetUsesStones ? 'ws_budget_stones_title' : 'ws_budget_title')}
          </h2>
          <button
            type="button"
            className="select-research__budget-toggle"
            aria-expanded={!workshopBudgetCollapsed}
            aria-controls={workshopBudgetBodyId}
            aria-label={
              workshopBudgetCollapsed
                ? t('ws_budget_toggle_expand')
                : t('ws_budget_toggle_collapse')
            }
            onClick={() => setWorkshopBudgetCollapsed((c) => !c)}
          >
            <span className="select-research__budget-chevron" aria-hidden>
              ▼
            </span>
          </button>
        </div>
        <div
          id={workshopBudgetBodyId}
          className="select-research__budget-body"
          hidden={workshopBudgetCollapsed}
        >
        <p className="visually-hidden" aria-live="polite" aria-atomic="true">
          {budgetUsesStones
            ? fmt.workshopStoneBudgetAria(
                workshopBudgetLabels.spentLabel,
                workshopBudgetLabels.toMaxLabel,
                workshopBudgetLabels.nextVisibleLabel,
              )
            : fmt.workshopBudgetAria(
                workshopBudgetLabels.spentLabel,
                workshopBudgetLabels.toMaxLabel,
                workshopBudgetLabels.nextVisibleLabel,
              )}
        </p>
        <dl className="select-research__budget-stats">
          <div className="select-research__budget-row">
            <dt>{t(budgetUsesStones ? 'ws_budget_stones_spent_dt' : 'ws_budget_spent_dt')}</dt>
            <dd>{workshopBudgetLabels.spentLabel}</dd>
          </div>
          <div className="select-research__budget-row">
            <dt>{t(budgetUsesStones ? 'ws_budget_stones_to_max_dt' : 'ws_budget_to_max_dt')}</dt>
            <dd>{workshopBudgetLabels.toMaxLabel}</dd>
          </div>
          <div className="select-research__budget-row">
            <dt>{t(budgetUsesStones ? 'ws_budget_stones_next_dt' : 'ws_budget_next_dt')}</dt>
            <dd>{workshopBudgetLabels.nextVisibleLabel}</dd>
          </div>
        </dl>
        <p className="select-research__budget-footnote">
          {t(budgetUsesStones ? 'ws_budget_stones_footnote' : 'ws_budget_footnote')}
        </p>
        </div>
      </div>
      ) : null}

      {showCategoryBar ? (
      <div className="workshop__categories" role="toolbar" aria-label={t('ws_title')}>
        {WORKSHOP_CATEGORY_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            className={
              category === key
                ? `workshop__cat workshop__cat--${key}`
                : `workshop__cat workshop__cat--idle workshop__cat--${key}`
            }
            onClick={() =>
              onWorkshopPersistedChange({
                ...workshopPersisted,
                category: key,
                ...(key === 'ultimate' && workshopPersisted.mainTab === 'enhance'
                  ? { mainTab: 'upgrade' as const }
                  : {}),
              })
            }
            aria-label={t(CATEGORY_ARIA[key])}
            aria-pressed={category === key}
          >
            <img
              src={WORKSHOP_CATEGORY_ICON_SRC[key]}
              alt=""
              width={22}
              height={22}
              className="workshop__cat-icon-img"
              aria-hidden
            />
          </button>
        ))}
      </div>
      ) : null}

      <div className="workshop__body">
      {workshopMainTab === 'enhance' ? (
        category === 'attack' || category === 'defense' || category === 'utility' ? (
          <>
            <div className="workshop__section-head">
              <h2 className="workshop__section-title">{t(sectionTitleId)}</h2>
              <WorkshopMultiplierRail
                railRef={multRailRef}
                open={multiplierOpen}
                multiplier={multiplier}
                onSelectMultiplier={(m) => {
                  onWorkshopPersistedChange({ ...workshopPersisted, multiplier: m })
                  setMultiplierOpen(false)
                }}
                onAnchorClick={() => setMultiplierOpen((o) => !o)}
              />
            </div>
            <ul className="workshop__grid">
              <Suspense fallback={null}>
                {category === 'attack' ? (
                  <WorkshopEnhanceAttackPanel
                    workshopPersisted={workshopPersisted}
                    onWorkshopPersistedChange={onWorkshopPersistedChange}
                    hideMaxed={hideMaxed}
                    multiplier={multiplier}
                    enhancementAttackDiscountPercent={enhancementAttackDiscountPercent}
                    workshopEnhancementsLabUnlocked={workshopEnhancementsLabUnlockedFlag}
                  />
                ) : category === 'defense' ? (
                  <WorkshopEnhanceDefensePanel
                    workshopPersisted={workshopPersisted}
                    onWorkshopPersistedChange={onWorkshopPersistedChange}
                    hideMaxed={hideMaxed}
                    multiplier={multiplier}
                    enhancementDefenseDiscountPercent={enhancementDefenseDiscountPercent}
                    workshopEnhancementsLabUnlocked={workshopEnhancementsLabUnlockedFlag}
                  />
                ) : (
                  <WorkshopEnhanceUtilityPanel
                    workshopPersisted={workshopPersisted}
                    onWorkshopPersistedChange={onWorkshopPersistedChange}
                    hideMaxed={hideMaxed}
                    multiplier={multiplier}
                    enhancementUtilityDiscountPercent={enhancementUtilityDiscountPercent}
                    workshopEnhancementsLabUnlocked={workshopEnhancementsLabUnlockedFlag}
                  />
                )}
              </Suspense>
            </ul>
          </>
        ) : (
          <div className="workshop__enhance-placeholder">
            <p>{t('ws_enhance_empty')}</p>
          </div>
        )
      ) : (
        <WorkshopCoinDiscountContext.Provider value={workshopCoinDiscountContext}>
        <WorkshopAttackLabDisplayContext.Provider value={attackStatLabDisplayOpts}>
        <>
          <div className="workshop__section-head">
            <h2 className="workshop__section-title">{t(sectionTitleId)}</h2>
            {category !== 'ultimate' ? (
            <WorkshopMultiplierRail
              railRef={multRailRef}
              open={multiplierOpen}
              multiplier={multiplier}
              onSelectMultiplier={(m) => {
                onWorkshopPersistedChange({ ...workshopPersisted, multiplier: m })
                setMultiplierOpen(false)
              }}
              onAnchorClick={() => setMultiplierOpen((o) => !o)}
            />
            ) : (
              <div className="workshop__mult-spacer" aria-hidden />
            )}
          </div>

          <ul
            className={
              category === 'ultimate' ? 'workshop__grid workshop__grid--ultimate' : 'workshop__grid'
            }
          >
            {category === 'ultimate'
              ? visibleUltimateWeapons.map((weaponId) => (
                  <WorkshopUltimateWeaponCard
                    key={weaponId}
                    weaponId={weaponId}
                    active={workshopUltimateIsActive(workshopPersisted, weaponId)}
                    levels={workshopPersisted}
                    onBump={bumpUltimate}
                    onSetLevel={setUltimateLevel}
                    onToggleActive={toggleUltimateActive}
                    onUnlockWeapon={unlockUltimateWeapon}
                    workshop={workshopPersisted}
                    submoduleBonusContext={submoduleBonusContext}
                    plusEnabled={plusEnabled}
                    onPlusBump={bumpUltimatePlus}
                    onSetPlusLevel={setUltimatePlusLevel}
                    onPlusUnlock={unlockUltimatePlus}
                    researchData={researchData}
                    labLevelOverrides={mergedLabLevelOverrides}
                    gameResearchLevel={gameResearchLevel}
                  />
                ))
              : null}
            {showDamageCard ? (
              <WorkshopDamageCard
                level={damageLevel}
                draft={damageDraft}
                setDraft={setDamageDraft}
                bulkStep={multiplier}
                onBump={bumpDamage}
                onCommitDraft={commitDamageDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    damageLevel: clampWorkshopDamageLevel(n),
                  })}
                damageDisplayOpts={damageDisplayOpts}
              />
            ) : null}
            {showAttackSpeedCard ? (
              <WorkshopAttackSpeedCard
                level={attackSpeedLevel}
                draft={attackSpeedDraft}
                setDraft={setAttackSpeedDraft}
                bulkStep={multiplier}
                onBump={bumpAttackSpeed}
                onCommitDraft={commitAttackSpeedDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    attackSpeedLevel: clampWorkshopAttackSpeedLevel(n),
                  })}
                attackSpeedDisplayOpts={attackSpeedDisplayOpts}
              />
            ) : null}
            {showCritChanceCard ? (
              <WorkshopCriticalChanceCard
                level={critChanceLevel}
                draft={critChanceDraft}
                setDraft={setCritChanceDraft}
                bulkStep={multiplier}
                onBump={bumpCritChance}
                onCommitDraft={commitCritChanceDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    critChanceLevel: clampWorkshopCriticalChanceLevel(n),
                  })}
              />
            ) : null}
            {showCritFactorCard ? (
              <WorkshopCriticalFactorCard
                level={critFactorLevel}
                draft={critFactorDraft}
                setDraft={setCritFactorDraft}
                bulkStep={multiplier}
                onBump={bumpCritFactor}
                onCommitDraft={commitCritFactorDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    critFactorLevel: clampWorkshopCriticalFactorLevel(n),
                  })}
                enhancementMultiplier={critFactorEnhancementMultiplier}
              />
            ) : null}
            {showAttackRangeCard ? (
              <WorkshopAttackRangeCard
                level={attackRangeLevel}
                draft={attackRangeDraft}
                setDraft={setAttackRangeDraft}
                bulkStep={multiplier}
                onBump={bumpAttackRange}
                onCommitDraft={commitAttackRangeDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    attackRangeLevel: clampWorkshopAttackRangeLevel(n),
                  })}
              />
            ) : null}
            {showDamagePerMeterCard ? (
              <WorkshopDamagePerMeterCard
                level={damagePerMeterLevel}
                draft={damagePerMeterDraft}
                setDraft={setDamagePerMeterDraft}
                bulkStep={multiplier}
                onBump={bumpDamagePerMeter}
                onCommitDraft={commitDamagePerMeterDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    damagePerMeterLevel: clampWorkshopDamagePerMeterLevel(n),
                  })}
                damagePerMeterLabMultiplier={
                  attackStatLabDisplayOpts?.damagePerMeterLabMultiplier
                }
              />
            ) : null}
            {showMultishotChanceCard ? (
              <WorkshopMultishotChanceCard
                level={multishotChanceLevel}
                draft={multishotChanceDraft}
                setDraft={setMultishotChanceDraft}
                bulkStep={multiplier}
                onBump={bumpMultishotChance}
                onCommitDraft={commitMultishotChanceDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    multishotChanceLevel: clampWorkshopMultishotChanceLevel(n),
                  })}
              />
            ) : null}
            {showMultishotTargetsCard ? (
              <WorkshopMultishotTargetsCard
                level={multishotTargetsLevel}
                draft={multishotTargetsDraft}
                setDraft={setMultishotTargetsDraft}
                bulkStep={multiplier}
                onBump={bumpMultishotTargets}
                onCommitDraft={commitMultishotTargetsDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    multishotTargetsLevel: clampWorkshopMultishotTargetsLevel(n),
                  })}
              />
            ) : null}
            {showRapidFireChanceCard ? (
              <WorkshopRapidFireChanceCard
                level={rapidFireChanceLevel}
                draft={rapidFireChanceDraft}
                setDraft={setRapidFireChanceDraft}
                bulkStep={multiplier}
                onBump={bumpRapidFireChance}
                onCommitDraft={commitRapidFireChanceDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    rapidFireChanceLevel: clampWorkshopRapidFireChanceLevel(n),
                  })}
              />
            ) : null}
            {showRapidFireDurationCard ? (
              <WorkshopRapidFireDurationCard
                level={rapidFireDurationLevel}
                draft={rapidFireDurationDraft}
                setDraft={setRapidFireDurationDraft}
                bulkStep={multiplier}
                onBump={bumpRapidFireDuration}
                onCommitDraft={commitRapidFireDurationDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    rapidFireDurationLevel: clampWorkshopRapidFireDurationLevel(n),
                  })}
              />
            ) : null}
            {showBounceShotChanceCard ? (
              <WorkshopBounceShotChanceCard
                level={bounceShotChanceLevel}
                draft={bounceShotChanceDraft}
                setDraft={setBounceShotChanceDraft}
                bulkStep={multiplier}
                onBump={bumpBounceShotChance}
                onCommitDraft={commitBounceShotChanceDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    bounceShotChanceLevel: clampWorkshopBounceShotChanceLevel(n),
                  })}
              />
            ) : null}
            {showBounceShotTargetsCard ? (
              <WorkshopBounceShotTargetsCard
                level={bounceShotTargetsLevel}
                draft={bounceShotTargetsDraft}
                setDraft={setBounceShotTargetsDraft}
                bulkStep={multiplier}
                onBump={bumpBounceShotTargets}
                onCommitDraft={commitBounceShotTargetsDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    bounceShotTargetsLevel: clampWorkshopBounceShotTargetsLevel(n),
                  })}
              />
            ) : null}
            {showBounceShotRangeCard ? (
              <WorkshopBounceShotRangeCard
                level={bounceShotRangeLevel}
                draft={bounceShotRangeDraft}
                setDraft={setBounceShotRangeDraft}
                bulkStep={multiplier}
                onBump={bumpBounceShotRange}
                onCommitDraft={commitBounceShotRangeDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    bounceShotRangeLevel: clampWorkshopBounceShotRangeLevel(n),
                  })}
              />
            ) : null}
            {showSuperCritChanceCard ? (
              <WorkshopSuperCritChanceCard
                level={superCritChanceLevel}
                draft={superCritChanceDraft}
                setDraft={setSuperCritChanceDraft}
                bulkStep={multiplier}
                onBump={bumpSuperCritChance}
                onCommitDraft={commitSuperCritChanceDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    superCritChanceLevel: clampWorkshopSuperCritChanceLevel(n),
                  })}
              />
            ) : null}
            {showSuperCritMultCard ? (
              <WorkshopSuperCritMultCard
                level={superCritMultLevel}
                draft={superCritMultDraft}
                setDraft={setSuperCritMultDraft}
                bulkStep={multiplier}
                onBump={bumpSuperCritMult}
                onCommitDraft={commitSuperCritMultDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    superCritMultLevel: clampWorkshopSuperCritMultLevel(n),
                  })}
                enhancementMultiplier={superCritMultEnhancementMultiplier}
              />
            ) : null}
            {showRendArmorChanceCard ? (
              <WorkshopRendArmorChanceCard
                level={rendArmorChanceLevel}
                draft={rendArmorChanceDraft}
                setDraft={setRendArmorChanceDraft}
                bulkStep={multiplier}
                onBump={bumpRendArmorChance}
                onCommitDraft={commitRendArmorChanceDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    rendArmorChanceLevel: clampWorkshopRendArmorChanceLevel(n),
                  })}
                enhancementMultiplier={rendArmorChanceEnhancementMultiplier}
              />
            ) : null}
            {showRendArmorMultCard ? (
              <WorkshopRendArmorMultCard
                level={rendArmorMultLevel}
                draft={rendArmorMultDraft}
                setDraft={setRendArmorMultDraft}
                bulkStep={multiplier}
                onBump={bumpRendArmorMult}
                onCommitDraft={commitRendArmorMultDraft}
                onSetLevel={(n) =>
                  onWorkshopPersistedChange({
                    ...workshopPersisted,
                    rendArmorMultLevel: clampWorkshopRendArmorMultLevel(n),
                  })}
                enhancementMultiplier={rendArmorMultEnhancementMultiplier}
              />
            ) : null}
            {category === 'defense'
              ? WORKSHOP_DEFENSE_UPGRADE_ORDER.map((key) => {
                  const max = workshopDefenseMaxLevel(key)
                  const level = workshopPersisted[key]
                  if (hideMaxed && level >= max) return null
                  return (
                    <WorkshopDefenseUpgradeCard
                      key={key}
                      fieldKey={key}
                      titleId={DEFENSE_CARD_TITLE[key]}
                      level={level}
                      draft={defenseDrafts[key]}
                      setDraft={(s) => setDefenseDrafts((prev) => ({ ...prev, [key]: s }))}
                      bulkStep={multiplier}
                      onBump={(dir) => bumpDefense(key, dir)}
                      onCommitDraft={() => commitDefenseDraft(key)}
                      onSetLevel={(n) =>
                        onWorkshopPersistedChange({
                          ...workshopPersisted,
                          [key]: workshopDefenseClampLevel(key, n),
                        })}
                      statDisplayOpts={defenseStatLabDisplayOpts}
                    />
                  )
                })
              : null}
            {category === 'utility'
              ? WORKSHOP_UTILITY_UPGRADE_ORDER.map((key) => {
                  const max = workshopUtilityMaxLevel(key)
                  const level = workshopPersisted[key]
                  if (hideMaxed && level >= max) return null
                  return (
                    <WorkshopUtilityUpgradeCard
                      key={key}
                      fieldKey={key}
                      titleId={UTILITY_CARD_TITLE[key]}
                      level={level}
                      draft={utilityDrafts[key]}
                      setDraft={(s) => setUtilityDrafts((prev) => ({ ...prev, [key]: s }))}
                      bulkStep={multiplier}
                      onBump={(dir) => bumpUtility(key, dir)}
                      onCommitDraft={() => commitUtilityDraft(key)}
                      onSetLevel={(n) =>
                        onWorkshopPersistedChange({
                          ...workshopPersisted,
                          [key]: workshopUtilityClampLevel(key, n),
                        })}
                      statDisplayOpts={utilityStatLabDisplayOpts}
                    />
                  )
                })
              : null}
            {visibleDemoRows.map((row) => (
              <li
                key={row.labelId}
                className={
                  row.maxed
                    ? 'workshop__card workshop__card--max'
                    : 'workshop__card workshop__card--active'
                }
              >
                <div className="workshop__card-damage-head">
                  <span className="workshop__card-name">{t(row.labelId)}</span>
                  <span className="workshop__card-value">{row.value}</span>
                </div>
                <div className="workshop__card-level-row workshop__card-level-row--empty" aria-hidden />
                <div className="workshop__card-damage-footer workshop__card-damage-footer--simple">
                  <div className="workshop__card-damage-cost">
                    {row.maxed || row.cost === null ? (
                      <span className="workshop__card-cost workshop__card-cost--max">
                        {t('ws_max')}
                        <CoinGlyph className="workshop__card-coin" />
                      </span>
                    ) : (
                      <span
                        className="workshop__card-cost"
                        title={t('researchCard_cost_coins_title')}
                      >
                        {row.cost}
                        <CoinGlyph className="workshop__card-coin" />
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
        </WorkshopAttackLabDisplayContext.Provider>
        </WorkshopCoinDiscountContext.Provider>
      )}
      </div>

      {resetWorkshopConfirmOpen
        ? workshopOverlayPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => setResetWorkshopConfirmOpen(false)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="reset-workshop-confirm-title"
                aria-describedby="reset-workshop-confirm-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id="reset-workshop-confirm-title"
                  className="select-research__reset-confirm-title"
                >
                  {category === 'ultimate'
                    ? t('ws_reset_ultimate_confirm_title')
                    : t('ws_reset_confirm_title')}
                </h2>
                <p
                  id="reset-workshop-confirm-desc"
                  className="select-research__reset-confirm-desc"
                >
                  {category === 'ultimate'
                    ? t('ws_reset_ultimate_confirm_body')
                    : t('ws_reset_confirm_body')}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setResetWorkshopConfirmOpen(false)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    onClick={performResetWorkshopDemo}
                  >
                    {t(
                      category === 'ultimate' ? 'ws_reset_ultimate_demo' : 'ws_reset_demo',
                    )}
                  </button>
                </div>
              </div>
            </div>,
          )
        : null}
    </div>
  )
}

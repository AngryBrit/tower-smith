import { WORKSHOP_ATTACK_RANGE_MAX_LEVEL } from './data/workshopAttackRange'
import { WORKSHOP_ATTACK_SPEED_MAX_LEVEL } from './data/workshopAttackSpeed'
import { WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL } from './data/workshopCriticalChance'
import { WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL } from './data/workshopCriticalFactor'
import { WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL } from './data/workshopDamagePerMeter'
import { WORKSHOP_DAMAGE_MAX_LEVEL } from './data/workshopDamage'
import { WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL } from './data/workshopMultishotChance'
import { WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL } from './data/workshopMultishotTargets'
import {
  WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL,
  WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL,
} from './data/workshopRapidFire'
import { WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL } from './data/workshopBounceShotChance'
import { WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL } from './data/workshopBounceShotRange'
import { WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL } from './data/workshopBounceShotTargets'
import { WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL } from './data/workshopSuperCritChance'
import { WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL } from './data/workshopSuperCritMult'
import {
  WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL,
  WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL,
} from './data/workshopRendArmor'
import { workshopDefenseClampLevel } from './data/workshopDefense'
import {
  WORKSHOP_ULTIMATE_ACTIVE_ORDER,
  WORKSHOP_ULTIMATE_OWNED_ORDER,
  WORKSHOP_ULTIMATE_UPGRADE_ORDER,
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  workshopUltimateClampLevel,
  workshopUltimateOwnedKey,
  workshopUltimateWeaponIsOwned,
  type WorkshopUltimateActiveKey,
  type WorkshopUltimateOwnedKey,
  type WorkshopUltimateUpgradeKey,
} from './data/workshopUltimate'
import {
  WORKSHOP_BOT_ACTIVE_ORDER,
  WORKSHOP_BOT_SPECIAL_BY_BOT,
  WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED,
  WORKSHOP_BOT_SPECIAL_LEVEL_ORDER,
  workshopBotSpecialStonePurchased,
  WORKSHOP_BOT_UPGRADE_ORDER,
  WORKSHOP_BOT_ORDER,
  WORKSHOP_BOT_OWNED_ORDER,
  workshopBotActiveKey,
  workshopBotClampLevel,
  workshopBotIsOwned,
  workshopBotMaxLevel,
  workshopBotOwnedKey,
  workshopBotSpecialClampLevel,
  workshopBotSpecialLevelKey,
  workshopBotSpecialMaxLevel,
  workshopBotUpgradeKeys,
  type WorkshopBotActiveKey,
  type WorkshopBotOwnedKey,
  type WorkshopBotSpecialKey,
  type WorkshopBotSpecialLevelKey,
  type WorkshopBotUpgradeKey,
} from './data/workshopBots'
import {
  defaultUltimatePlusLevels,
  workshopUltimatePlusLevelsFromPersisted,
  type WorkshopUltimatePlusLevelKey,
} from './data/workshopUltimatePlus'
import { workshopUtilityClampLevel } from './data/workshopUtility'
import {
  WORKSHOP_ENHANCE_ATTACK_UPGRADE_ORDER,
  workshopEnhanceAttackClampLevel,
} from './data/workshopEnhanceAttack'
import {
  WORKSHOP_ENHANCE_DEFENSE_UPGRADE_ORDER,
  workshopEnhanceDefenseClampLevel,
} from './data/workshopEnhanceDefense'
import {
  WORKSHOP_ENHANCE_UTILITY_UPGRADE_ORDER,
  workshopEnhanceUtilityClampLevel,
} from './data/workshopEnhanceUtility'
import {
  sanitizeChassisModuleId,
  sanitizeChassisModuleMergeTier,
} from './data/workshopChassisModuleSelection'
import { parseRelicOwnedIdsJson } from './data/workshopRelics'
import {
  assistMainStoneEfficiencyFromPersisted,
  assistSubStoneEfficiencyFromPersisted,
  assistUniqueRarityFromPersisted,
  clampAssistStoneEfficiency,
  type WorkshopAssistChassisPersisted,
} from './data/workshopAssistChassisModule'
import {
  totalCannonAttackSpeedFromSelections,
  parseSubmoduleSelectionsJson,
  type WorkshopSubmoduleSelections,
} from './data/workshopSubmoduleSelection'
import {
  coerceChassisMergeTierForModuleLevel,
  type WorkshopChassisModuleEffectTier,
  type WorkshopChassisModuleMergeTier,
} from './data/workshopChassisModuleShared'
import {
  clampWorkshopAssistModuleLevel,
  type WorkshopAssistModuleSlot,
} from './data/workshopSimModules'
import {
  clampWorkshopCardActivePresetIndex,
  defaultWorkshopCardStars,
  WORKSHOP_GAME_CARD_ORDER,
  workshopCardStarMirrorsForPersisted,
  workshopCardStarsFromLegacy,
  workshopGameCardMaxStars,
  type WorkshopCardStarsState,
  type WorkshopGameCardId,
} from './data/workshopGameCards'
import {
  clampWorkshopModuleActivePresetIndex,
  defaultModulePresetSnapshots,
  defaultWorkshopModulesPersistedFields,
  extractWorkshopModulePresetSnapshot,
  sanitizeModulePresetSnapshots,
  workshopPersistedWithModulePresets,
  type WorkshopModulePresetSnapshot,
} from './data/workshopModulePresets'
import {
  clampWorkshopCardEquipSlots,
  defaultCardPresetLoadouts,
  sanitizeCardPresetLoadouts,
  WORKSHOP_CARD_DEFAULT_EQUIP_SLOTS,
} from './data/workshopGameCardWiki'
import {
  sanitizeThemeOwnedIds,
  sanitizeThemeSelection,
  type TowerThemesSnapshot,
} from './towerDataThemes'
import type { TowerBuildPersistedV1 } from './towerBuildStorage'
import type { TowerWorkspaceV1 } from './towerWorkspaceStorage'

type WorkshopUltimateLevels = { [K in WorkshopUltimateUpgradeKey]: number }

function defaultUltimateLevels(): WorkshopUltimateLevels {
  return Object.fromEntries(
    WORKSHOP_ULTIMATE_UPGRADE_ORDER.map((key) => [key, 0]),
  ) as WorkshopUltimateLevels
}

type WorkshopUltimateActiveFlags = { [K in WorkshopUltimateActiveKey]: boolean }

function defaultUltimateActive(): WorkshopUltimateActiveFlags {
  return Object.fromEntries(
    WORKSHOP_ULTIMATE_WEAPON_ORDER.map((id) => [`${id}Active`, false]),
  ) as WorkshopUltimateActiveFlags
}

type WorkshopUltimateOwnedFlags = { [K in WorkshopUltimateOwnedKey]: boolean }

function defaultUltimateOwned(): WorkshopUltimateOwnedFlags {
  return Object.fromEntries(
    WORKSHOP_ULTIMATE_WEAPON_ORDER.map((id) => [workshopUltimateOwnedKey(id), false]),
  ) as WorkshopUltimateOwnedFlags
}

type WorkshopBotLevels = { [K in WorkshopBotUpgradeKey]: number }

function defaultBotLevels(): WorkshopBotLevels {
  return Object.fromEntries(
    WORKSHOP_BOT_UPGRADE_ORDER.map((key) => [key, 0]),
  ) as WorkshopBotLevels
}

type WorkshopBotActiveFlags = { [K in WorkshopBotActiveKey]: boolean }

function defaultBotActive(): WorkshopBotActiveFlags {
  return Object.fromEntries(
    WORKSHOP_BOT_ORDER.map((id) => [workshopBotActiveKey(id), true]),
  ) as WorkshopBotActiveFlags
}

type WorkshopBotSpecialFlags = { [K in WorkshopBotSpecialKey]: boolean }

function defaultBotSpecial(): WorkshopBotSpecialFlags {
  return Object.fromEntries(
    WORKSHOP_BOT_ORDER.map((id) => [WORKSHOP_BOT_SPECIAL_BY_BOT[id], false]),
  ) as WorkshopBotSpecialFlags
}

type WorkshopBotSpecialLevels = { [K in WorkshopBotSpecialLevelKey]: number }

function defaultBotSpecialLevels(): WorkshopBotSpecialLevels {
  return Object.fromEntries(
    WORKSHOP_BOT_SPECIAL_LEVEL_ORDER.map((key) => [key, WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED]),
  ) as WorkshopBotSpecialLevels
}

function workshopBotSpecialLevelsFromPersisted(
  o: Record<string, unknown>,
): WorkshopBotSpecialLevels {
  return Object.fromEntries(
    WORKSHOP_BOT_ORDER.map((id) => {
      const key = workshopBotSpecialLevelKey(id)
      const raw = Number(o[key])
      const stonePurchased = workshopBotSpecialStonePurchased(
        o as Partial<Record<WorkshopBotSpecialKey, boolean>>,
        id,
      )
      let level = Number.isFinite(raw)
        ? workshopBotSpecialClampLevel(id, raw)
        : WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED
      if (!stonePurchased) level = WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED
      else if (level < 0) level = 0
      return [key, level]
    }),
  ) as WorkshopBotSpecialLevels
}

type WorkshopBotOwnedFlags = { [K in WorkshopBotOwnedKey]: boolean }

function defaultBotOwned(): WorkshopBotOwnedFlags {
  return Object.fromEntries(
    WORKSHOP_BOT_ORDER.map((id) => [workshopBotOwnedKey(id), false]),
  ) as WorkshopBotOwnedFlags
}

function applyLegacyBotOwned(ws: WorkshopPersistedV1): WorkshopPersistedV1 {
  const patch: Partial<WorkshopBotOwnedFlags> = {}
  for (const id of WORKSHOP_BOT_ORDER) {
    const key = workshopBotOwnedKey(id)
    if (ws[key] !== true && workshopBotIsOwned(ws, id)) {
      patch[key] = true
    }
  }
  return Object.keys(patch).length > 0 ? { ...ws, ...patch } : ws
}

function applyLegacyUltimateOwned(ws: WorkshopPersistedV1): WorkshopPersistedV1 {
  const patch: Partial<WorkshopUltimateOwnedFlags> = {}
  for (const id of WORKSHOP_ULTIMATE_WEAPON_ORDER) {
    const key = workshopUltimateOwnedKey(id)
    if (ws[key] !== true && workshopUltimateWeaponIsOwned(ws, id)) {
      patch[key] = true
    }
  }
  return Object.keys(patch).length > 0 ? { ...ws, ...patch } : ws
}

export type WorkshopCategoryPersisted = 'attack' | 'defense' | 'utility' | 'ultimate'

export type WorkshopMainTab = 'upgrade' | 'enhance' | 'modules' | 'cards'

export type WorkshopPersistedV1 = {
  hideMaxed: boolean
  mainTab: WorkshopMainTab
  category: WorkshopCategoryPersisted
  multiplier: 1 | 5 | 10 | 100
  damageLevel: number
  attackSpeedLevel: number
  critChanceLevel: number
  critFactorLevel: number
  attackRangeLevel: number
  damagePerMeterLevel: number
  multishotChanceLevel: number
  multishotTargetsLevel: number
  rapidFireChanceLevel: number
  rapidFireDurationLevel: number
  bounceShotChanceLevel: number
  bounceShotTargetsLevel: number
  bounceShotRangeLevel: number
  superCritChanceLevel: number
  superCritMultLevel: number
  rendArmorChanceLevel: number
  rendArmorMultLevel: number
  healthLevel: number
  healthRegenLevel: number
  defensePercentLevel: number
  defenseAbsoluteLevel: number
  thornDamageLevel: number
  lifestealLevel: number
  knockbackChanceLevel: number
  knockbackForceLevel: number
  orbSpeedLevel: number
  orbsLevel: number
  shockwaveSizeLevel: number
  shockwaveFrequencyLevel: number
  landMineChanceLevel: number
  landMineDamageLevel: number
  landMineRadiusLevel: number
  deathDefyLevel: number
  wallHealthLevel: number
  wallRebuildLevel: number
  cashBonusLevel: number
  cashPerWaveLevel: number
  coinsKillBonusLevel: number
  coinsWaveLevel: number
  freeAttackUpgradeLevel: number
  freeDefenseUpgradeLevel: number
  freeUtilityUpgradeLevel: number
  interestPerWaveLevel: number
  recoveryAmountLevel: number
  maxRecoveryLevel: number
  packageChanceLevel: number
  enemyAttackLevelSkipLevel: number
  enemyHealthLevelSkipLevel: number
  enhanceDamageLevel: number
  enhanceRendArmorLevel: number
  enhanceCritFactorLevel: number
  enhanceDamagePerMeterLevel: number
  enhanceSuperCritMultLevel: number
  enhanceAttackSpeedLevel: number
  enhanceHealthLevel: number
  enhanceHealthRegenLevel: number
  enhanceDefenseAbsoluteLevel: number
  enhanceLandMineDamageLevel: number
  enhanceWallHealthLevel: number
  enhanceOrbSizeLevel: number
  enhanceCashBonusLevel: number
  enhanceCoinBonusLevel: number
  enhanceCellsKillBonusLevel: number
  enhanceFreeUpgradesLevel: number
  enhanceRecoveryPackageLevel: number
  enhanceEnemyLevelSkipLevel: number
  /** Star level for each of the 31 in-game cards (0 = none, 7 = max). */
  cardStars: WorkshopCardStarsState
  /** Equipped card ids per preset tab (Preset 1…5). */
  cardPresetLoadouts: WorkshopGameCardId[][]
  /** Preset tab used for workshop displayed-damage / attack-speed card sim. */
  cardActivePresetIndex: number
  /** Max cards equippable at once (wiki: up to 28 with Harmony keys). */
  cardEquipSlots: number
  /** Active-preset Damage card stars (0 if not equipped). */
  simDamageCardStars: number
  /** Active-preset Attack Speed card stars (0 if not equipped). */
  simAttackSpeedCardStars: number
  /** Cannon submodule flat attack speed add (wiki Sub-Module Effects). */
  simAttackSpeedModuleSubEffect: number
  /** Cards/Berserker equipped stars (0 = none). */
  simBerserkerCardStars: number
  /** Damage taken this round for Berserker flat bonus. */
  simBerserkerDamageTaken: number
  /** Owned relic ids (wiki catalog); drives **simRelicsBonusFraction** when toggled. */
  relicOwnedIds: string[]
  /** Relic sum inside **(1 + Relics)** as a fraction (0.5 = +50%). */
  simRelicsBonusFraction: number
  /** Damage perk count for displayed-damage Perk term. */
  simPerkDamageQuantity: number
  /** Active assist module chassis for cannon % sim. */
  simAssistModuleSlot: WorkshopAssistModuleSlot
  /** In-game assist module levels (hub UI). */
  simCannonModuleLevel: number
  simArmorModuleLevel: number
  simGeneratorModuleLevel: number
  simCoreModuleLevel: number
  /** Equipped cannon chassis module id (`''` = none). */
  simCannonChassisModuleId: string
  simArmorChassisModuleId: string
  simGeneratorChassisModuleId: string
  simCoreChassisModuleId: string
  simCannonChassisModuleRarity: WorkshopChassisModuleMergeTier
  simArmorChassisModuleRarity: WorkshopChassisModuleMergeTier
  simGeneratorChassisModuleRarity: WorkshopChassisModuleMergeTier
  simCoreChassisModuleRarity: WorkshopChassisModuleMergeTier
  /** Equipped sub-module effect picks per chassis slot. */
  simSubmoduleSelections: WorkshopSubmoduleSelections
  /** Assist chassis slot unlocked (stones). */
  simCannonAssistUnlocked: boolean
  simArmorAssistUnlocked: boolean
  simGeneratorAssistUnlocked: boolean
  simCoreAssistUnlocked: boolean
  /** Equipped assist chassis module id (`''` = none). */
  simCannonAssistChassisModuleId: string
  simArmorAssistChassisModuleId: string
  simGeneratorAssistChassisModuleId: string
  simCoreAssistChassisModuleId: string
  simCannonAssistChassisModuleRarity: WorkshopChassisModuleMergeTier
  simArmorAssistChassisModuleRarity: WorkshopChassisModuleMergeTier
  simGeneratorAssistChassisModuleRarity: WorkshopChassisModuleMergeTier
  simCoreAssistChassisModuleRarity: WorkshopChassisModuleMergeTier
  simCannonAssistUniqueRarity: WorkshopChassisModuleEffectTier
  simArmorAssistUniqueRarity: WorkshopChassisModuleEffectTier
  simGeneratorAssistUniqueRarity: WorkshopChassisModuleEffectTier
  simCoreAssistUniqueRarity: WorkshopChassisModuleEffectTier
  /** Assist main/sub stone efficiency (0–70%). */
  simCannonAssistStoneEfficiency: number
  simArmorAssistStoneEfficiency: number
  simGeneratorAssistStoneEfficiency: number
  simCoreAssistStoneEfficiency: number
  simCannonAssistMainStoneEfficiency: number
  simArmorAssistMainStoneEfficiency: number
  simGeneratorAssistMainStoneEfficiency: number
  simCoreAssistMainStoneEfficiency: number
  simCannonAssistSubStoneEfficiency: number
  simArmorAssistSubStoneEfficiency: number
  simGeneratorAssistSubStoneEfficiency: number
  simCoreAssistSubStoneEfficiency: number
  /** Full module hub snapshot per preset tab (Preset 1…5). */
  modulePresetSnapshots: WorkshopModulePresetSnapshot[]
  /** Active module preset tab (drives sim* module fields). */
  moduleActivePresetIndex: number
} & WorkshopUltimateLevels &
  WorkshopUltimateActiveFlags &
  WorkshopUltimateOwnedFlags &
  { [K in WorkshopUltimatePlusLevelKey]: number } &
  WorkshopBotLevels &
  WorkshopBotActiveFlags &
  WorkshopBotSpecialFlags &
  WorkshopBotSpecialLevels &
  WorkshopBotOwnedFlags

const WORKSHOP_MULTIPLIERS = new Set<number>([1, 5, 10, 100])

/**
 * Reset workshop upgrade / enhance / ultimate levels only.
 * Preserves cards, modules sim, and UI prefs (tab, category, hide maxed).
 */
/**
 * Reset card stars, preset loadouts, and equip slots only.
 * Preserves workshop upgrade / enhance / ultimate levels and module sim fields.
 */
/**
 * Reset relic ownership and displayed-damage relic bonus.
 * Preserves cards, modules, workshop levels, and other sim fields.
 */
export function resetWorkshopRelics(current: WorkshopPersistedV1): WorkshopPersistedV1 {
  return {
    ...current,
    relicOwnedIds: [],
    simRelicsBonusFraction: 0,
  }
}

export function resetWorkshopCards(current: WorkshopPersistedV1): WorkshopPersistedV1 {
  const cardStars = defaultWorkshopCardStars()
  const cardPresetLoadouts = defaultCardPresetLoadouts()
  const cardActivePresetIndex = 0
  return {
    ...current,
    cardStars,
    cardPresetLoadouts,
    cardActivePresetIndex,
    cardEquipSlots: WORKSHOP_CARD_DEFAULT_EQUIP_SLOTS,
    ...workshopCardStarMirrorsForPersisted({
      cardStars,
      cardPresetLoadouts,
      cardActivePresetIndex,
    }),
  }
}

/** Set every in-game card to its maximum star level (preserves loadouts and equip slots). */
export function maxWorkshopCardStars(current: WorkshopPersistedV1): WorkshopPersistedV1 {
  const cardStars = {
    ...current.cardStars,
    ...Object.fromEntries(
      WORKSHOP_GAME_CARD_ORDER.map((id) => [id, workshopGameCardMaxStars(id)]),
    ),
  } as WorkshopCardStarsState
  return {
    ...current,
    cardStars,
    ...workshopCardStarMirrorsForPersisted({
      cardStars,
      cardPresetLoadouts: current.cardPresetLoadouts,
      cardActivePresetIndex: current.cardActivePresetIndex,
    }),
  }
}

/**
 * Reset assist module levels, chassis modules, and sub-module effect picks only.
 * Preserves workshop upgrade / enhance / ultimate levels, cards, and other sim fields.
 */
export function resetWorkshopModules(current: WorkshopPersistedV1): WorkshopPersistedV1 {
  return {
    ...current,
    ...defaultWorkshopModulesPersistedFields(),
  }
}

/**
 * Reset ultimate weapon levels, ownership, active flags, and plus abilities only.
 * Preserves workshop upgrade / enhance levels, cards, modules, and other sim fields.
 */
export function resetWorkshopUltimates(current: WorkshopPersistedV1): WorkshopPersistedV1 {
  return {
    ...current,
    ...defaultUltimateLevels(),
    ...defaultUltimateActive(),
    ...defaultUltimateOwned(),
    ...defaultUltimatePlusLevels(),
  }
}

export function resetWorkshopBots(current: WorkshopPersistedV1): WorkshopPersistedV1 {
  return {
    ...current,
    ...defaultBotLevels(),
    ...defaultBotActive(),
    ...defaultBotSpecial(),
    ...defaultBotSpecialLevels(),
    ...defaultBotOwned(),
  }
}

/**
 * Reset the full in-browser tower build model by clearing each domain separately:
 * workshop upgrade/enhance/ultimate levels, cards, modules, relics, and bots.
 * Preserves workshop UI prefs (tab, category, multiplier, hide maxed).
 */
export function clearBuildWorkspace(current: WorkshopPersistedV1): WorkshopPersistedV1 {
  return resetWorkshopRelics(
    resetWorkshopModules(
      resetWorkshopCards(resetWorkshopUpgradeLevels(current)),
    ),
  )
}

/** Own all bots, activate them, max basic upgrades, and max Bot+ ability levels. */
export function maxWorkshopBots(current: WorkshopPersistedV1): WorkshopPersistedV1 {
  const patch: Partial<WorkshopPersistedV1> = {}
  for (const botId of WORKSHOP_BOT_ORDER) {
    patch[workshopBotOwnedKey(botId)] = true
    patch[workshopBotActiveKey(botId)] = true
    for (const key of workshopBotUpgradeKeys(botId)) {
      patch[key] = workshopBotClampLevel(key, workshopBotMaxLevel(key))
    }
    patch[WORKSHOP_BOT_SPECIAL_BY_BOT[botId]] = true
    patch[workshopBotSpecialLevelKey(botId)] = workshopBotSpecialClampLevel(
      botId,
      workshopBotSpecialMaxLevel(botId),
    )
  }
  return { ...current, ...patch }
}

export function resetWorkshopUpgradeLevels(
  current: WorkshopPersistedV1,
): WorkshopPersistedV1 {
  const d = defaultWorkshopPersisted()
  return {
    ...d,
    hideMaxed: current.hideMaxed,
    mainTab: current.mainTab,
    category: current.category,
    multiplier: current.multiplier,
    cardStars: current.cardStars,
    cardPresetLoadouts: current.cardPresetLoadouts,
    cardActivePresetIndex: current.cardActivePresetIndex,
    cardEquipSlots: current.cardEquipSlots,
    simAttackSpeedModuleSubEffect: current.simAttackSpeedModuleSubEffect,
    simAssistModuleSlot: current.simAssistModuleSlot,
    simCannonModuleLevel: current.simCannonModuleLevel,
    simArmorModuleLevel: current.simArmorModuleLevel,
    simGeneratorModuleLevel: current.simGeneratorModuleLevel,
    simCoreModuleLevel: current.simCoreModuleLevel,
    simCannonChassisModuleId: current.simCannonChassisModuleId,
    simArmorChassisModuleId: current.simArmorChassisModuleId,
    simGeneratorChassisModuleId: current.simGeneratorChassisModuleId,
    simCoreChassisModuleId: current.simCoreChassisModuleId,
    simCannonChassisModuleRarity: current.simCannonChassisModuleRarity,
    simArmorChassisModuleRarity: current.simArmorChassisModuleRarity,
    simGeneratorChassisModuleRarity: current.simGeneratorChassisModuleRarity,
    simCoreChassisModuleRarity: current.simCoreChassisModuleRarity,
    simSubmoduleSelections: current.simSubmoduleSelections,
    simCannonAssistUnlocked: current.simCannonAssistUnlocked,
    simArmorAssistUnlocked: current.simArmorAssistUnlocked,
    simGeneratorAssistUnlocked: current.simGeneratorAssistUnlocked,
    simCoreAssistUnlocked: current.simCoreAssistUnlocked,
    simCannonAssistChassisModuleId: current.simCannonAssistChassisModuleId,
    simArmorAssistChassisModuleId: current.simArmorAssistChassisModuleId,
    simGeneratorAssistChassisModuleId: current.simGeneratorAssistChassisModuleId,
    simCoreAssistChassisModuleId: current.simCoreAssistChassisModuleId,
    simCannonAssistChassisModuleRarity: current.simCannonAssistChassisModuleRarity,
    simArmorAssistChassisModuleRarity: current.simArmorAssistChassisModuleRarity,
    simGeneratorAssistChassisModuleRarity: current.simGeneratorAssistChassisModuleRarity,
    simCoreAssistChassisModuleRarity: current.simCoreAssistChassisModuleRarity,
    simCannonAssistUniqueRarity: current.simCannonAssistUniqueRarity,
    simArmorAssistUniqueRarity: current.simArmorAssistUniqueRarity,
    simGeneratorAssistUniqueRarity: current.simGeneratorAssistUniqueRarity,
    simCoreAssistUniqueRarity: current.simCoreAssistUniqueRarity,
    simCannonAssistStoneEfficiency: current.simCannonAssistStoneEfficiency,
    simArmorAssistStoneEfficiency: current.simArmorAssistStoneEfficiency,
    simGeneratorAssistStoneEfficiency: current.simGeneratorAssistStoneEfficiency,
    simCoreAssistStoneEfficiency: current.simCoreAssistStoneEfficiency,
    modulePresetSnapshots: current.modulePresetSnapshots,
    moduleActivePresetIndex: current.moduleActivePresetIndex,
    relicOwnedIds: current.relicOwnedIds,
    simRelicsBonusFraction: current.simRelicsBonusFraction,
    simPerkDamageQuantity: current.simPerkDamageQuantity,
    simBerserkerDamageTaken: current.simBerserkerDamageTaken,
    ...workshopCardStarMirrorsForPersisted({
      cardStars: current.cardStars,
      cardPresetLoadouts: current.cardPresetLoadouts,
      cardActivePresetIndex: current.cardActivePresetIndex,
    }),
  }
}

export function defaultWorkshopPersisted(): WorkshopPersistedV1 {
  const cardStars = defaultWorkshopCardStars()
  const cardPresetLoadouts = defaultCardPresetLoadouts()
  const cardActivePresetIndex = 0
  return {
    hideMaxed: false,
    mainTab: 'upgrade',
    category: 'attack',
    multiplier: 10,
    damageLevel: 0,
    attackSpeedLevel: 0,
    critChanceLevel: 0,
    critFactorLevel: 0,
    attackRangeLevel: 0,
    damagePerMeterLevel: 0,
    multishotChanceLevel: 0,
    multishotTargetsLevel: 0,
    rapidFireChanceLevel: 0,
    rapidFireDurationLevel: 0,
    bounceShotChanceLevel: 0,
    bounceShotTargetsLevel: 0,
    bounceShotRangeLevel: 0,
    superCritChanceLevel: 0,
    superCritMultLevel: 0,
    rendArmorChanceLevel: 0,
    rendArmorMultLevel: 0,
    healthLevel: 0,
    healthRegenLevel: 0,
    defensePercentLevel: 0,
    defenseAbsoluteLevel: 0,
    thornDamageLevel: 0,
    lifestealLevel: 0,
    knockbackChanceLevel: 0,
    knockbackForceLevel: 0,
    orbSpeedLevel: 0,
    orbsLevel: 0,
    shockwaveSizeLevel: 0,
    shockwaveFrequencyLevel: 0,
    landMineChanceLevel: 0,
    landMineDamageLevel: 0,
    landMineRadiusLevel: 0,
    deathDefyLevel: 0,
    wallHealthLevel: 0,
    wallRebuildLevel: 0,
    cashBonusLevel: 0,
    cashPerWaveLevel: 0,
    coinsKillBonusLevel: 0,
    coinsWaveLevel: 0,
    freeAttackUpgradeLevel: 0,
    freeDefenseUpgradeLevel: 0,
    freeUtilityUpgradeLevel: 0,
    interestPerWaveLevel: 0,
    recoveryAmountLevel: 0,
    maxRecoveryLevel: 0,
    packageChanceLevel: 0,
    enemyAttackLevelSkipLevel: 0,
    enemyHealthLevelSkipLevel: 0,
    enhanceDamageLevel: 0,
    enhanceRendArmorLevel: 0,
    enhanceCritFactorLevel: 0,
    enhanceDamagePerMeterLevel: 0,
    enhanceSuperCritMultLevel: 0,
    enhanceAttackSpeedLevel: 0,
    enhanceHealthLevel: 0,
    enhanceHealthRegenLevel: 0,
    enhanceDefenseAbsoluteLevel: 0,
    enhanceLandMineDamageLevel: 0,
    enhanceWallHealthLevel: 0,
    enhanceOrbSizeLevel: 0,
    enhanceCashBonusLevel: 0,
    enhanceCoinBonusLevel: 0,
    enhanceCellsKillBonusLevel: 0,
    enhanceFreeUpgradesLevel: 0,
    enhanceRecoveryPackageLevel: 0,
    enhanceEnemyLevelSkipLevel: 0,
    cardStars,
    cardPresetLoadouts,
    cardActivePresetIndex,
    cardEquipSlots: WORKSHOP_CARD_DEFAULT_EQUIP_SLOTS,
    ...workshopCardStarMirrorsForPersisted({
      cardStars,
      cardPresetLoadouts,
      cardActivePresetIndex,
    }),
    simBerserkerDamageTaken: 0,
    relicOwnedIds: [],
    simRelicsBonusFraction: 0,
    simPerkDamageQuantity: 0,
    ...defaultWorkshopModulesPersistedFields(),
    ...defaultUltimateLevels(),
    ...defaultUltimateActive(),
    ...defaultUltimateOwned(),
    ...defaultUltimatePlusLevels(),
    ...defaultBotLevels(),
    ...defaultBotActive(),
    ...defaultBotSpecial(),
    ...defaultBotSpecialLevels(),
    ...defaultBotOwned(),
  }
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, Math.trunc(n)))
}

export function sanitizeWorkshopPersisted(raw: unknown): WorkshopPersistedV1 {
  const d = defaultWorkshopPersisted()
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return d
  const o = raw as Record<string, unknown>

  const hideMaxed = o.hideMaxed === true
  const mt = o.mainTab
  const mainTab: WorkshopMainTab =
    mt === 'enhance'
      ? 'enhance'
      : mt === 'modules'
        ? 'modules'
        : mt === 'cards'
          ? 'cards'
          : 'upgrade'
  const slotRaw = o.simAssistModuleSlot
  const simAssistModuleSlot: WorkshopAssistModuleSlot =
    slotRaw === 'armor' || slotRaw === 'generator' || slotRaw === 'core'
      ? slotRaw
      : 'cannon'
  const cat = o.category
  const category: WorkshopCategoryPersisted =
    cat === 'defense' || cat === 'utility' || cat === 'ultimate' ? cat : 'attack'

  const m = o.multiplier
  const multiplier = WORKSHOP_MULTIPLIERS.has(Number(m))
    ? (Number(m) as WorkshopPersistedV1['multiplier'])
    : d.multiplier

  const base = {
    hideMaxed,
    mainTab,
    category,
    multiplier,
    damageLevel: clampInt(Number(o.damageLevel), 0, WORKSHOP_DAMAGE_MAX_LEVEL),
    attackSpeedLevel: clampInt(Number(o.attackSpeedLevel), 0, WORKSHOP_ATTACK_SPEED_MAX_LEVEL),
    critChanceLevel: clampInt(Number(o.critChanceLevel), 0, WORKSHOP_CRITICAL_CHANCE_MAX_LEVEL),
    critFactorLevel: clampInt(Number(o.critFactorLevel), 0, WORKSHOP_CRITICAL_FACTOR_MAX_LEVEL),
    attackRangeLevel: clampInt(Number(o.attackRangeLevel), 0, WORKSHOP_ATTACK_RANGE_MAX_LEVEL),
    damagePerMeterLevel: clampInt(
      Number(o.damagePerMeterLevel),
      0,
      WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL,
    ),
    multishotChanceLevel: clampInt(
      Number(o.multishotChanceLevel),
      0,
      WORKSHOP_MULTISHOT_CHANCE_MAX_LEVEL,
    ),
    multishotTargetsLevel: clampInt(
      Number(o.multishotTargetsLevel),
      0,
      WORKSHOP_MULTISHOT_TARGETS_MAX_LEVEL,
    ),
    rapidFireChanceLevel: clampInt(
      Number(o.rapidFireChanceLevel),
      0,
      WORKSHOP_RAPID_FIRE_CHANCE_MAX_LEVEL,
    ),
    rapidFireDurationLevel: clampInt(
      Number(o.rapidFireDurationLevel),
      0,
      WORKSHOP_RAPID_FIRE_DURATION_MAX_LEVEL,
    ),
    bounceShotChanceLevel: clampInt(
      Number(o.bounceShotChanceLevel),
      0,
      WORKSHOP_BOUNCE_SHOT_CHANCE_MAX_LEVEL,
    ),
    bounceShotTargetsLevel: clampInt(
      Number(o.bounceShotTargetsLevel),
      0,
      WORKSHOP_BOUNCE_SHOT_TARGETS_MAX_LEVEL,
    ),
    bounceShotRangeLevel: clampInt(
      Number(o.bounceShotRangeLevel),
      0,
      WORKSHOP_BOUNCE_SHOT_RANGE_MAX_LEVEL,
    ),
    superCritChanceLevel: clampInt(
      Number(o.superCritChanceLevel),
      0,
      WORKSHOP_SUPER_CRIT_CHANCE_MAX_LEVEL,
    ),
    superCritMultLevel: clampInt(Number(o.superCritMultLevel), 0, WORKSHOP_SUPER_CRIT_MULT_MAX_LEVEL),
    rendArmorChanceLevel: clampInt(
      Number(o.rendArmorChanceLevel),
      0,
      WORKSHOP_REND_ARMOR_CHANCE_MAX_LEVEL,
    ),
    rendArmorMultLevel: clampInt(
      Number(o.rendArmorMultLevel),
      0,
      WORKSHOP_REND_ARMOR_MULT_MAX_LEVEL,
    ),
    healthLevel: workshopDefenseClampLevel('healthLevel', Number(o.healthLevel)),
    healthRegenLevel: workshopDefenseClampLevel('healthRegenLevel', Number(o.healthRegenLevel)),
    defensePercentLevel: workshopDefenseClampLevel(
      'defensePercentLevel',
      Number(o.defensePercentLevel),
    ),
    defenseAbsoluteLevel: workshopDefenseClampLevel(
      'defenseAbsoluteLevel',
      Number(o.defenseAbsoluteLevel),
    ),
    thornDamageLevel: workshopDefenseClampLevel('thornDamageLevel', Number(o.thornDamageLevel)),
    lifestealLevel: workshopDefenseClampLevel('lifestealLevel', Number(o.lifestealLevel)),
    knockbackChanceLevel: workshopDefenseClampLevel(
      'knockbackChanceLevel',
      Number(o.knockbackChanceLevel),
    ),
    knockbackForceLevel: workshopDefenseClampLevel(
      'knockbackForceLevel',
      Number(o.knockbackForceLevel),
    ),
    orbSpeedLevel: workshopDefenseClampLevel('orbSpeedLevel', Number(o.orbSpeedLevel)),
    orbsLevel: workshopDefenseClampLevel('orbsLevel', Number(o.orbsLevel)),
    shockwaveSizeLevel: workshopDefenseClampLevel(
      'shockwaveSizeLevel',
      Number(o.shockwaveSizeLevel),
    ),
    shockwaveFrequencyLevel: workshopDefenseClampLevel(
      'shockwaveFrequencyLevel',
      Number(o.shockwaveFrequencyLevel),
    ),
    landMineChanceLevel: workshopDefenseClampLevel(
      'landMineChanceLevel',
      Number(o.landMineChanceLevel),
    ),
    landMineDamageLevel: workshopDefenseClampLevel(
      'landMineDamageLevel',
      Number(o.landMineDamageLevel),
    ),
    landMineRadiusLevel: workshopDefenseClampLevel(
      'landMineRadiusLevel',
      Number(o.landMineRadiusLevel),
    ),
    deathDefyLevel: workshopDefenseClampLevel('deathDefyLevel', Number(o.deathDefyLevel)),
    wallHealthLevel: workshopDefenseClampLevel('wallHealthLevel', Number(o.wallHealthLevel)),
    wallRebuildLevel: workshopDefenseClampLevel('wallRebuildLevel', Number(o.wallRebuildLevel)),
    cashBonusLevel: workshopUtilityClampLevel('cashBonusLevel', Number(o.cashBonusLevel)),
    cashPerWaveLevel: workshopUtilityClampLevel('cashPerWaveLevel', Number(o.cashPerWaveLevel)),
    coinsKillBonusLevel: workshopUtilityClampLevel(
      'coinsKillBonusLevel',
      Number(o.coinsKillBonusLevel),
    ),
    coinsWaveLevel: workshopUtilityClampLevel('coinsWaveLevel', Number(o.coinsWaveLevel)),
    freeAttackUpgradeLevel: workshopUtilityClampLevel(
      'freeAttackUpgradeLevel',
      Number(o.freeAttackUpgradeLevel),
    ),
    freeDefenseUpgradeLevel: workshopUtilityClampLevel(
      'freeDefenseUpgradeLevel',
      Number(o.freeDefenseUpgradeLevel),
    ),
    freeUtilityUpgradeLevel: workshopUtilityClampLevel(
      'freeUtilityUpgradeLevel',
      Number(o.freeUtilityUpgradeLevel),
    ),
    interestPerWaveLevel: workshopUtilityClampLevel(
      'interestPerWaveLevel',
      Number(o.interestPerWaveLevel),
    ),
    recoveryAmountLevel: workshopUtilityClampLevel(
      'recoveryAmountLevel',
      Number(o.recoveryAmountLevel),
    ),
    maxRecoveryLevel: workshopUtilityClampLevel('maxRecoveryLevel', Number(o.maxRecoveryLevel)),
    packageChanceLevel: workshopUtilityClampLevel(
      'packageChanceLevel',
      Number(o.packageChanceLevel),
    ),
    enemyAttackLevelSkipLevel: workshopUtilityClampLevel(
      'enemyAttackLevelSkipLevel',
      Number(o.enemyAttackLevelSkipLevel),
    ),
    enemyHealthLevelSkipLevel: workshopUtilityClampLevel(
      'enemyHealthLevelSkipLevel',
      Number(o.enemyHealthLevelSkipLevel),
    ),
    ...Object.fromEntries(
      WORKSHOP_ENHANCE_ATTACK_UPGRADE_ORDER.map((key) => [
        key,
        workshopEnhanceAttackClampLevel(key, Number(o[key])),
      ]),
    ),
    ...Object.fromEntries(
      WORKSHOP_ENHANCE_DEFENSE_UPGRADE_ORDER.map((key) => [
        key,
        workshopEnhanceDefenseClampLevel(key, Number(o[key])),
      ]),
    ),
    ...Object.fromEntries(
      WORKSHOP_ENHANCE_UTILITY_UPGRADE_ORDER.map((key) => [
        key,
        workshopEnhanceUtilityClampLevel(key, Number(o[key])),
      ]),
    ),
    ...Object.fromEntries(
      WORKSHOP_ULTIMATE_UPGRADE_ORDER.map((key) => {
        const legacy =
          key === 'poisonSwampCooldownLevel'
            ? (o as Record<string, unknown>).poisonSwampChanceLevel
            : undefined
        const raw = o[key] ?? legacy
        return [key, workshopUltimateClampLevel(key, Number(raw))]
      }),
    ),
    ...Object.fromEntries(
      WORKSHOP_ULTIMATE_ACTIVE_ORDER.map((key) => [
        key,
        (o as Record<string, unknown>)[key] === true ? true : false,
      ]),
    ),
    ...Object.fromEntries(
      WORKSHOP_ULTIMATE_OWNED_ORDER.map((key) => [
        key,
        (o as Record<string, unknown>)[key] === true ? true : false,
      ]),
    ),
    ...workshopUltimatePlusLevelsFromPersisted(o),
    ...Object.fromEntries(
      WORKSHOP_BOT_UPGRADE_ORDER.map((key) => {
        const raw = Number(o[key])
        return [key, workshopBotClampLevel(key, Number.isFinite(raw) ? raw : 0)]
      }),
    ),
    ...Object.fromEntries(
      WORKSHOP_BOT_ACTIVE_ORDER.map((key) => [
        key,
        (o as Record<string, unknown>)[key] !== false,
      ]),
    ),
    ...Object.fromEntries(
      WORKSHOP_BOT_ORDER.map((id) => [
        WORKSHOP_BOT_SPECIAL_BY_BOT[id],
        (o as Record<string, unknown>)[WORKSHOP_BOT_SPECIAL_BY_BOT[id]] === true,
      ]),
    ),
    ...workshopBotSpecialLevelsFromPersisted(o as Record<string, unknown>),
    ...Object.fromEntries(
      WORKSHOP_BOT_OWNED_ORDER.map((key) => [
        key,
        (o as Record<string, unknown>)[key] === true ? true : false,
      ]),
    ),
    ...(() => {
      const cardStars = workshopCardStarsFromLegacy(o)
      const cardPresetLoadouts = sanitizeCardPresetLoadouts(o.cardPresetLoadouts)
      const cardActivePresetIndex = clampWorkshopCardActivePresetIndex(
        Number(o.cardActivePresetIndex),
      )
      const cardEquipSlots = clampWorkshopCardEquipSlots(
        o.cardEquipSlots != null && o.cardEquipSlots !== ''
          ? Number(o.cardEquipSlots)
          : WORKSHOP_CARD_DEFAULT_EQUIP_SLOTS,
      )
      return {
        cardStars,
        cardPresetLoadouts,
        cardActivePresetIndex,
        cardEquipSlots,
        ...workshopCardStarMirrorsForPersisted({
          cardStars,
          cardPresetLoadouts,
          cardActivePresetIndex,
          cardEquipSlots,
        }),
      }
    })(),
    ...(() => {
      const simSubmoduleSelections = parseSubmoduleSelectionsJson(o.simSubmoduleSelections)
      const attackFromSub = totalCannonAttackSpeedFromSelections(simSubmoduleSelections)
      const simAttackSpeedModuleSubEffect =
        attackFromSub > 0
          ? attackFromSub
          : Math.max(0, Number(o.simAttackSpeedModuleSubEffect) || 0)
      return { simSubmoduleSelections, simAttackSpeedModuleSubEffect }
    })(),
    simBerserkerDamageTaken: Math.max(0, Number(o.simBerserkerDamageTaken) || 0),
    relicOwnedIds: parseRelicOwnedIdsJson(o.relicOwnedIds),
    simRelicsBonusFraction: Math.max(0, Number(o.simRelicsBonusFraction) || 0),
    simPerkDamageQuantity: clampInt(Number(o.simPerkDamageQuantity), 0, 99),
    simAssistModuleSlot,
    simCannonModuleLevel: clampWorkshopAssistModuleLevel(Number(o.simCannonModuleLevel)),
    simArmorModuleLevel: clampWorkshopAssistModuleLevel(Number(o.simArmorModuleLevel)),
    simGeneratorModuleLevel: clampWorkshopAssistModuleLevel(Number(o.simGeneratorModuleLevel)),
    simCoreModuleLevel: clampWorkshopAssistModuleLevel(Number(o.simCoreModuleLevel)),
    simCannonChassisModuleId:
      sanitizeChassisModuleId('cannon', o.simCannonChassisModuleId) ?? '',
    simArmorChassisModuleId:
      sanitizeChassisModuleId('armor', o.simArmorChassisModuleId) ?? '',
    simGeneratorChassisModuleId:
      sanitizeChassisModuleId('generator', o.simGeneratorChassisModuleId) ?? '',
    simCoreChassisModuleId: sanitizeChassisModuleId('core', o.simCoreChassisModuleId) ?? '',
    simCannonChassisModuleRarity: coerceChassisMergeTierForModuleLevel(
      sanitizeChassisModuleMergeTier(o.simCannonChassisModuleRarity),
      clampWorkshopAssistModuleLevel(Number(o.simCannonModuleLevel)),
    ),
    simArmorChassisModuleRarity: coerceChassisMergeTierForModuleLevel(
      sanitizeChassisModuleMergeTier(o.simArmorChassisModuleRarity),
      clampWorkshopAssistModuleLevel(Number(o.simArmorModuleLevel)),
    ),
    simGeneratorChassisModuleRarity: coerceChassisMergeTierForModuleLevel(
      sanitizeChassisModuleMergeTier(o.simGeneratorChassisModuleRarity),
      clampWorkshopAssistModuleLevel(Number(o.simGeneratorModuleLevel)),
    ),
    simCoreChassisModuleRarity: coerceChassisMergeTierForModuleLevel(
      sanitizeChassisModuleMergeTier(o.simCoreChassisModuleRarity),
      clampWorkshopAssistModuleLevel(Number(o.simCoreModuleLevel)),
    ),
    simCannonAssistUnlocked: o.simCannonAssistUnlocked === true,
    simArmorAssistUnlocked: o.simArmorAssistUnlocked === true,
    simGeneratorAssistUnlocked: o.simGeneratorAssistUnlocked === true,
    simCoreAssistUnlocked: o.simCoreAssistUnlocked === true,
    simCannonAssistChassisModuleId:
      sanitizeChassisModuleId('cannon', o.simCannonAssistChassisModuleId) ?? '',
    simArmorAssistChassisModuleId:
      sanitizeChassisModuleId('armor', o.simArmorAssistChassisModuleId) ?? '',
    simGeneratorAssistChassisModuleId:
      sanitizeChassisModuleId('generator', o.simGeneratorAssistChassisModuleId) ?? '',
    simCoreAssistChassisModuleId:
      sanitizeChassisModuleId('core', o.simCoreAssistChassisModuleId) ?? '',
    simCannonAssistChassisModuleRarity: coerceChassisMergeTierForModuleLevel(
      sanitizeChassisModuleMergeTier(o.simCannonAssistChassisModuleRarity),
      clampWorkshopAssistModuleLevel(Number(o.simCannonModuleLevel)),
    ),
    simArmorAssistChassisModuleRarity: coerceChassisMergeTierForModuleLevel(
      sanitizeChassisModuleMergeTier(o.simArmorAssistChassisModuleRarity),
      clampWorkshopAssistModuleLevel(Number(o.simArmorModuleLevel)),
    ),
    simGeneratorAssistChassisModuleRarity: coerceChassisMergeTierForModuleLevel(
      sanitizeChassisModuleMergeTier(o.simGeneratorAssistChassisModuleRarity),
      clampWorkshopAssistModuleLevel(Number(o.simGeneratorModuleLevel)),
    ),
    simCoreAssistChassisModuleRarity: coerceChassisMergeTierForModuleLevel(
      sanitizeChassisModuleMergeTier(o.simCoreAssistChassisModuleRarity),
      clampWorkshopAssistModuleLevel(Number(o.simCoreModuleLevel)),
    ),
    simCannonAssistUniqueRarity: assistUniqueRarityFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'cannon',
    ),
    simArmorAssistUniqueRarity: assistUniqueRarityFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'armor',
    ),
    simGeneratorAssistUniqueRarity: assistUniqueRarityFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'generator',
    ),
    simCoreAssistUniqueRarity: assistUniqueRarityFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'core',
    ),
    simCannonAssistStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simCannonAssistStoneEfficiency),
    ),
    simArmorAssistStoneEfficiency: clampAssistStoneEfficiency(Number(o.simArmorAssistStoneEfficiency)),
    simGeneratorAssistStoneEfficiency: clampAssistStoneEfficiency(
      Number(o.simGeneratorAssistStoneEfficiency),
    ),
    simCoreAssistStoneEfficiency: clampAssistStoneEfficiency(Number(o.simCoreAssistStoneEfficiency)),
    simCannonAssistMainStoneEfficiency: assistMainStoneEfficiencyFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'cannon',
    ),
    simArmorAssistMainStoneEfficiency: assistMainStoneEfficiencyFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'armor',
    ),
    simGeneratorAssistMainStoneEfficiency: assistMainStoneEfficiencyFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'generator',
    ),
    simCoreAssistMainStoneEfficiency: assistMainStoneEfficiencyFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'core',
    ),
    simCannonAssistSubStoneEfficiency: assistSubStoneEfficiencyFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'cannon',
    ),
    simArmorAssistSubStoneEfficiency: assistSubStoneEfficiencyFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'armor',
    ),
    simGeneratorAssistSubStoneEfficiency: assistSubStoneEfficiencyFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'generator',
    ),
    simCoreAssistSubStoneEfficiency: assistSubStoneEfficiencyFromPersisted(
      o as WorkshopAssistChassisPersisted,
      'core',
    ),
  } as WorkshopPersistedV1

  const moduleActivePresetIndex = clampWorkshopModuleActivePresetIndex(
    Number(o.moduleActivePresetIndex),
  )

  if (o.modulePresetSnapshots != null) {
    return applyLegacyBotOwned(
      applyLegacyUltimateOwned(
        workshopPersistedWithModulePresets(
          base,
          sanitizeModulePresetSnapshots(o.modulePresetSnapshots, base),
          moduleActivePresetIndex,
        ),
      ),
    )
  }

  const modulePresetSnapshots = defaultModulePresetSnapshots()
  modulePresetSnapshots[0] = extractWorkshopModulePresetSnapshot(base)
  return applyLegacyBotOwned(
    applyLegacyUltimateOwned({
      ...base,
      moduleActivePresetIndex,
      modulePresetSnapshots,
    }),
  )
}

export type LabPreset = {
  id: string
  name: string
  levelOverrides: Record<string, number>
  /** Full workspace snapshot (lab + build + themes). */
  workspace?: TowerWorkspaceV1
  /** Nested tower build snapshot (workshop, cards, modules, relics, bots, ultimates). */
  build?: TowerBuildPersistedV1
  /** Legacy flat snapshot; read when `build` is absent. */
  workshop?: WorkshopPersistedV1
}

export type LabPresetsFileV1 = {
  v: 1
  activePresetId: string | null
  presets: LabPreset[]
  /** Last scratch workspace when a named preset is active; current levels when scratch is active. */
  scratchOverrides: Record<string, number>
  /** Full scratch workspace while a named preset is active. */
  scratchWorkspace?: TowerWorkspaceV1
  /**
   * Nested tower build for the scratch workspace while a named preset is active.
   */
  scratchBuild?: TowerBuildPersistedV1
  /**
   * Workshop snapshot for the scratch build while a named preset is active;
   * when scratch is active, mirrors the persisted workshop row (same as lab scratch pattern).
   */
  scratchWorkshop?: WorkshopPersistedV1
  /** Active theme picks (tower, background, music, …). */
  themeSelection?: TowerThemesSnapshot['selection']
  /** Owned theme catalog ids. */
  themeOwnedIds?: string[]
}

export function newPresetId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function isLabPreset(x: unknown): x is LabPreset {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.name !== 'string') return false
  const lo = o.levelOverrides
  if (!lo || typeof lo !== 'object' || Array.isArray(lo)) return false
  return true
}

export function parseLabPresetsFile(raw: unknown): LabPresetsFileV1 | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (o.v !== 1) return null
  if (!Array.isArray(o.presets) || !o.presets.every(isLabPreset)) return null
  const scratch = o.scratchOverrides
  if (
    scratch !== undefined &&
    (typeof scratch !== 'object' || scratch === null || Array.isArray(scratch))
  ) {
    return null
  }
  const active = o.activePresetId
  if (active !== null && active !== undefined && typeof active !== 'string') {
    return null
  }
  const sw = o.scratchWorkshop
  const scratchWorkshop =
    sw !== undefined && sw !== null ? sanitizeWorkshopPersisted(sw) : undefined

  const presets = (o.presets as LabPreset[]).map((p) => {
    const base: LabPreset = {
      id: p.id,
      name: p.name,
      levelOverrides: p.levelOverrides,
    }
    if (p.workshop !== undefined && p.workshop !== null) {
      return { ...base, workshop: sanitizeWorkshopPersisted(p.workshop) }
    }
    return base
  })

  const themeSelection =
    o.themeSelection !== undefined && o.themeSelection !== null
      ? sanitizeThemeSelection(o.themeSelection)
      : undefined
  const themeOwnedIds =
    o.themeOwnedIds !== undefined && o.themeOwnedIds !== null
      ? sanitizeThemeOwnedIds(o.themeOwnedIds)
      : undefined

  return {
    v: 1,
    activePresetId: typeof active === 'string' ? active : null,
    presets,
    scratchOverrides:
      scratch && typeof scratch === 'object' && !Array.isArray(scratch)
        ? (scratch as Record<string, number>)
        : {},
    ...(scratchWorkshop !== undefined ? { scratchWorkshop } : {}),
    ...(themeSelection !== undefined ? { themeSelection } : {}),
    ...(themeOwnedIds !== undefined ? { themeOwnedIds } : {}),
  }
}

/** Read workspace fields from a v1 presets file (ignores named preset slots). */
export function extractLabWorkspaceFromPresetsFile(parsed: LabPresetsFileV1): {
  levelOverrides: Record<string, number>
  workshopPersisted: WorkshopPersistedV1
  scratchWorkshopPersisted: WorkshopPersistedV1
  themeSelection?: TowerThemesSnapshot['selection']
  themeOwnedIds?: string[]
} {
  const active = parsed.activePresetId
    ? parsed.presets.find((p) => p.id === parsed.activePresetId)
    : undefined
  const levelOverrides = active
    ? { ...active.levelOverrides }
    : { ...parsed.scratchOverrides }
  const scratchWorkshopPersisted = sanitizeWorkshopPersisted(parsed.scratchWorkshop)
  const workshopPersisted = active
    ? sanitizeWorkshopPersisted(active.workshop)
    : scratchWorkshopPersisted
  return {
    levelOverrides,
    workshopPersisted,
    scratchWorkshopPersisted,
    ...(parsed.themeSelection !== undefined
      ? { themeSelection: parsed.themeSelection }
      : {}),
    ...(parsed.themeOwnedIds !== undefined
      ? { themeOwnedIds: parsed.themeOwnedIds }
      : {}),
  }
}

/** Build the object to persist; merges current `levelOverrides` into the active preset entry. */
export function buildLabPresetsPayload(
  activePresetId: string | null,
  presets: readonly LabPreset[],
  levelOverrides: Record<string, number>,
  scratchSnapshot: Record<string, number>,
  workshopPersisted: WorkshopPersistedV1,
  scratchWorkshopPersisted: WorkshopPersistedV1,
  themes?: TowerThemesSnapshot,
): LabPresetsFileV1 {
  const mergedPresets = activePresetId
    ? presets.map((p) =>
        p.id === activePresetId
          ? {
              ...p,
              levelOverrides: { ...levelOverrides },
              workshop: { ...workshopPersisted },
            }
          : p,
      )
    : [...presets]

  return {
    v: 1,
    activePresetId,
    presets: mergedPresets,
    scratchOverrides: activePresetId ? { ...scratchSnapshot } : { ...levelOverrides },
    scratchWorkshop:
      activePresetId != null
        ? { ...scratchWorkshopPersisted }
        : { ...workshopPersisted },
    ...(themes
      ? {
          ...(themes.selection ? { themeSelection: { ...themes.selection } } : {}),
          themeOwnedIds: [...themes.ownedIds],
        }
      : {}),
  }
}

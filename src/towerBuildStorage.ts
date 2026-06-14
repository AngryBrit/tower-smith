import {
  WORKSHOP_ULTIMATE_UPGRADE_ORDER,
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  workshopUltimateOwnedKey,
  type WorkshopUltimateActiveKey,
  type WorkshopUltimateOwnedKey,
  type WorkshopUltimateUpgradeKey,
} from './data/workshopUltimate'
import {
  WORKSHOP_BOT_ORDER,
  WORKSHOP_BOT_SPECIAL_BY_BOT,
  WORKSHOP_BOT_UPGRADE_ORDER,
  workshopBotActiveKey,
  workshopBotOwnedKey,
  workshopBotSpecialLevelKey,
  type WorkshopBotActiveKey,
  type WorkshopBotOwnedKey,
  type WorkshopBotSpecialKey,
  type WorkshopBotSpecialLevelKey,
  type WorkshopBotUpgradeKey,
} from './data/workshopBots'
import type { WorkshopUltimatePlusLevelKey } from './data/workshopUltimatePlus'
import { WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER } from './data/workshopUltimatePlusData'
import type { WorkshopModulePresetSnapshot } from './data/workshopModulePresets'
import {
  clearBuildWorkspace as clearFlatBuildWorkspace,
  defaultWorkshopPersisted,
  resetWorkshopBots,
  resetWorkshopCards,
  resetWorkshopModules,
  resetWorkshopRelics,
  resetWorkshopUltimates,
  resetWorkshopUpgradeLevels,
  sanitizeWorkshopPersisted,
  type WorkshopPersistedV1,
} from './labPresetsStorage'

const WORKSHOP_UPGRADES_KEYS = [
  'hideMaxed',
  'mainTab',
  'category',
  'multiplier',
  'damageLevel',
  'attackSpeedLevel',
  'critChanceLevel',
  'critFactorLevel',
  'attackRangeLevel',
  'damagePerMeterLevel',
  'multishotChanceLevel',
  'multishotTargetsLevel',
  'rapidFireChanceLevel',
  'rapidFireDurationLevel',
  'bounceShotChanceLevel',
  'bounceShotTargetsLevel',
  'bounceShotRangeLevel',
  'superCritChanceLevel',
  'superCritMultLevel',
  'rendArmorChanceLevel',
  'rendArmorMultLevel',
  'healthLevel',
  'healthRegenLevel',
  'defensePercentLevel',
  'defenseAbsoluteLevel',
  'thornDamageLevel',
  'lifestealLevel',
  'knockbackChanceLevel',
  'knockbackForceLevel',
  'orbSpeedLevel',
  'orbsLevel',
  'shockwaveSizeLevel',
  'shockwaveFrequencyLevel',
  'landMineChanceLevel',
  'landMineDamageLevel',
  'landMineRadiusLevel',
  'deathDefyLevel',
  'wallHealthLevel',
  'wallRebuildLevel',
  'cashBonusLevel',
  'cashPerWaveLevel',
  'coinsKillBonusLevel',
  'coinsWaveLevel',
  'freeAttackUpgradeLevel',
  'freeDefenseUpgradeLevel',
  'freeUtilityUpgradeLevel',
  'interestPerWaveLevel',
  'recoveryAmountLevel',
  'maxRecoveryLevel',
  'packageChanceLevel',
  'enemyAttackLevelSkipLevel',
  'enemyHealthLevelSkipLevel',
  'enhanceDamageLevel',
  'enhanceRendArmorLevel',
  'enhanceCritFactorLevel',
  'enhanceDamagePerMeterLevel',
  'enhanceSuperCritMultLevel',
  'enhanceAttackSpeedLevel',
  'enhanceHealthLevel',
  'enhanceHealthRegenLevel',
  'enhanceDefenseAbsoluteLevel',
  'enhanceLandMineDamageLevel',
  'enhanceWallHealthLevel',
  'enhanceOrbSizeLevel',
  'enhanceCashBonusLevel',
  'enhanceCoinBonusLevel',
  'enhanceCellsKillBonusLevel',
  'enhanceFreeUpgradesLevel',
  'enhanceRecoveryPackageLevel',
  'enhanceEnemyLevelSkipLevel',
  'simPerkDamageQuantity',
] as const satisfies readonly (keyof WorkshopPersistedV1)[]

export type WorkshopUpgradePersistedKey = (typeof WORKSHOP_UPGRADES_KEYS)[number]

const CARDS_KEYS = [
  'cardStars',
  'cardPresetLoadouts',
  'cardPresetLabels',
  'cardActivePresetIndex',
  'cardEquipSlots',
  'simDamageCardStars',
  'simAttackSpeedCardStars',
  'simBerserkerCardStars',
  'simBerserkerDamageTaken',
] as const satisfies readonly (keyof WorkshopPersistedV1)[]

const MODULES_KEYS = [
  'simAssistModuleSlot',
  'simCannonModuleLevel',
  'simArmorModuleLevel',
  'simGeneratorModuleLevel',
  'simCoreModuleLevel',
  'simCannonChassisModuleLevel',
  'simArmorChassisModuleLevel',
  'simGeneratorChassisModuleLevel',
  'simCoreChassisModuleLevel',
  'simCannonChassisModuleId',
  'simArmorChassisModuleId',
  'simGeneratorChassisModuleId',
  'simCoreChassisModuleId',
  'simCannonChassisModuleRarity',
  'simArmorChassisModuleRarity',
  'simGeneratorChassisModuleRarity',
  'simCoreChassisModuleRarity',
  'simSubmoduleSelections',
  'simAttackSpeedModuleSubEffect',
  'simCannonAssistUnlocked',
  'simArmorAssistUnlocked',
  'simGeneratorAssistUnlocked',
  'simCoreAssistUnlocked',
  'simCannonAssistChassisModuleId',
  'simArmorAssistChassisModuleId',
  'simGeneratorAssistChassisModuleId',
  'simCoreAssistChassisModuleId',
  'simCannonAssistChassisModuleRarity',
  'simArmorAssistChassisModuleRarity',
  'simGeneratorAssistChassisModuleRarity',
  'simCoreAssistChassisModuleRarity',
  'simCannonAssistUniqueRarity',
  'simArmorAssistUniqueRarity',
  'simGeneratorAssistUniqueRarity',
  'simCoreAssistUniqueRarity',
  'simCannonAssistStoneEfficiency',
  'simArmorAssistStoneEfficiency',
  'simGeneratorAssistStoneEfficiency',
  'simCoreAssistStoneEfficiency',
  'simCannonAssistMainStoneEfficiency',
  'simArmorAssistMainStoneEfficiency',
  'simGeneratorAssistMainStoneEfficiency',
  'simCoreAssistMainStoneEfficiency',
  'simCannonAssistSubStoneEfficiency',
  'simArmorAssistSubStoneEfficiency',
  'simGeneratorAssistSubStoneEfficiency',
  'simCoreAssistSubStoneEfficiency',
  'modulePresetSnapshots',
  'modulePresetLabels',
  'moduleActivePresetIndex',
] as const satisfies readonly (keyof WorkshopPersistedV1)[]

const RELICS_KEYS = [
  'relicOwnedIds',
  'simRelicsBonusFraction',
] as const satisfies readonly (keyof WorkshopPersistedV1)[]

type UltimatePlusKeys = { [K in WorkshopUltimatePlusLevelKey]: number }
type UltimateUpgradeKeys = { [K in WorkshopUltimateUpgradeKey]: number }
type UltimateActiveKeys = { [K in WorkshopUltimateActiveKey]: boolean }
type UltimateOwnedKeys = { [K in WorkshopUltimateOwnedKey]: boolean }
type BotUpgradeKeys = { [K in WorkshopBotUpgradeKey]: number }
type BotActiveKeys = { [K in WorkshopBotActiveKey]: boolean }
type BotOwnedKeys = { [K in WorkshopBotOwnedKey]: boolean }
type BotSpecialKeys = { [K in WorkshopBotSpecialKey]: boolean }
type BotSpecialLevelKeys = { [K in WorkshopBotSpecialLevelKey]: number }

export type WorkshopUpgradesPersistedV1 = Pick<
  WorkshopPersistedV1,
  (typeof WORKSHOP_UPGRADES_KEYS)[number]
>
export type CardsPersistedV1 = Pick<WorkshopPersistedV1, (typeof CARDS_KEYS)[number]>
export type ModulesPersistedV1 = Pick<WorkshopPersistedV1, (typeof MODULES_KEYS)[number]>
export type RelicsPersistedV1 = Pick<WorkshopPersistedV1, (typeof RELICS_KEYS)[number]>
export type UltimatesPersistedV1 = UltimateUpgradeKeys &
  UltimateActiveKeys &
  UltimateOwnedKeys &
  UltimatePlusKeys
export type BotsPersistedV1 = BotUpgradeKeys &
  BotActiveKeys &
  BotOwnedKeys &
  BotSpecialKeys &
  BotSpecialLevelKeys

export type TowerBuildPersistedV1 = {
  workshop: WorkshopUpgradesPersistedV1
  cards: CardsPersistedV1
  modules: ModulesPersistedV1
  relics: RelicsPersistedV1
  ultimates: UltimatesPersistedV1
  bots: BotsPersistedV1
}

function pickKeys<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> {
  const out = {} as Pick<T, K>
  for (const key of keys) out[key] = obj[key]
  return out
}

function pickUltimates(flat: WorkshopPersistedV1): UltimatesPersistedV1 {
  const out: Record<string, unknown> = {}
  for (const key of WORKSHOP_ULTIMATE_UPGRADE_ORDER) out[key] = flat[key]
  for (const id of WORKSHOP_ULTIMATE_WEAPON_ORDER) {
    out[`${id}Active`] = flat[`${id}Active` as keyof WorkshopPersistedV1]
    out[workshopUltimateOwnedKey(id)] = flat[workshopUltimateOwnedKey(id)]
  }
  for (const key of WORKSHOP_ULTIMATE_PLUS_LEVEL_ORDER) {
    out[key] = flat[key]
  }
  return out as UltimatesPersistedV1
}

function pickBots(flat: WorkshopPersistedV1): BotsPersistedV1 {
  const out: Record<string, unknown> = {}
  for (const key of WORKSHOP_BOT_UPGRADE_ORDER) out[key] = flat[key]
  for (const id of WORKSHOP_BOT_ORDER) {
    out[workshopBotActiveKey(id)] = flat[workshopBotActiveKey(id)]
    out[workshopBotOwnedKey(id)] = flat[workshopBotOwnedKey(id)]
    out[WORKSHOP_BOT_SPECIAL_BY_BOT[id]] = flat[WORKSHOP_BOT_SPECIAL_BY_BOT[id]]
    out[workshopBotSpecialLevelKey(id)] = flat[workshopBotSpecialLevelKey(id)]
  }
  return out as BotsPersistedV1
}

export function splitTowerBuild(flat: WorkshopPersistedV1): TowerBuildPersistedV1 {
  return {
    workshop: pickKeys(flat, WORKSHOP_UPGRADES_KEYS),
    cards: pickKeys(flat, CARDS_KEYS),
    modules: pickKeys(flat, MODULES_KEYS),
    relics: pickKeys(flat, RELICS_KEYS),
    ultimates: pickUltimates(flat),
    bots: pickBots(flat),
  }
}

export function flattenTowerBuild(build: TowerBuildPersistedV1): WorkshopPersistedV1 {
  return sanitizeWorkshopPersisted({
    ...build.workshop,
    ...build.cards,
    ...build.modules,
    ...build.relics,
    ...build.ultimates,
    ...build.bots,
  })
}

function isNestedTowerBuild(raw: unknown): raw is TowerBuildPersistedV1 {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false
  const o = raw as Record<string, unknown>
  return (
    typeof o.workshop === 'object' &&
    o.workshop != null &&
    typeof o.cards === 'object' &&
    o.cards != null &&
    typeof o.modules === 'object' &&
    o.modules != null &&
    typeof o.relics === 'object' &&
    o.relics != null &&
    typeof o.ultimates === 'object' &&
    o.ultimates != null &&
    typeof o.bots === 'object' &&
    o.bots != null
  )
}

function sanitizeDomain<K extends keyof WorkshopPersistedV1>(
  raw: unknown,
  keys: readonly K[],
): Pick<WorkshopPersistedV1, K> {
  const merged =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? { ...defaultWorkshopPersisted(), ...(raw as Record<string, unknown>) }
      : defaultWorkshopPersisted()
  return pickKeys(sanitizeWorkshopPersisted(merged), keys)
}

function sanitizeUltimates(raw: unknown): UltimatesPersistedV1 {
  const merged =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? { ...defaultWorkshopPersisted(), ...(raw as Record<string, unknown>) }
      : defaultWorkshopPersisted()
  return pickUltimates(sanitizeWorkshopPersisted(merged))
}

function sanitizeBots(raw: unknown): BotsPersistedV1 {
  const merged =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? { ...defaultWorkshopPersisted(), ...(raw as Record<string, unknown>) }
      : defaultWorkshopPersisted()
  return pickBots(sanitizeWorkshopPersisted(merged))
}

export function sanitizeTowerBuild(raw: unknown): TowerBuildPersistedV1 {
  if (isNestedTowerBuild(raw)) {
    return {
      workshop: sanitizeDomain(raw.workshop, WORKSHOP_UPGRADES_KEYS),
      cards: sanitizeDomain(raw.cards, CARDS_KEYS),
      modules: sanitizeDomain(raw.modules, MODULES_KEYS),
      relics: sanitizeDomain(raw.relics, RELICS_KEYS),
      ultimates: sanitizeUltimates(raw.ultimates),
      bots: sanitizeBots(raw.bots),
    }
  }
  return splitTowerBuild(sanitizeWorkshopPersisted(raw))
}

export function defaultTowerBuild(): TowerBuildPersistedV1 {
  return splitTowerBuild(defaultWorkshopPersisted())
}

export function mergeTowerBuildDomain<K extends keyof TowerBuildPersistedV1>(
  build: TowerBuildPersistedV1,
  domain: K,
  next: TowerBuildPersistedV1[K],
): TowerBuildPersistedV1 {
  return sanitizeTowerBuild({ ...build, [domain]: next })
}

export function clearTowerBuild(build: TowerBuildPersistedV1): TowerBuildPersistedV1 {
  return splitTowerBuild(clearFlatBuildWorkspace(flattenTowerBuild(build)))
}

export function resetTowerBuildCards(build: TowerBuildPersistedV1): TowerBuildPersistedV1 {
  return splitTowerBuild(resetWorkshopCards(flattenTowerBuild(build)))
}

export function resetTowerBuildModules(build: TowerBuildPersistedV1): TowerBuildPersistedV1 {
  return splitTowerBuild(resetWorkshopModules(flattenTowerBuild(build)))
}

export function resetTowerBuildRelics(build: TowerBuildPersistedV1): TowerBuildPersistedV1 {
  return splitTowerBuild(resetWorkshopRelics(flattenTowerBuild(build)))
}

export function resetTowerBuildBots(build: TowerBuildPersistedV1): TowerBuildPersistedV1 {
  return splitTowerBuild(resetWorkshopBots(flattenTowerBuild(build)))
}

export function resetTowerBuildUltimates(build: TowerBuildPersistedV1): TowerBuildPersistedV1 {
  return splitTowerBuild(resetWorkshopUltimates(flattenTowerBuild(build)))
}

export function resetTowerBuildWorkshopUpgrades(
  build: TowerBuildPersistedV1,
): TowerBuildPersistedV1 {
  return splitTowerBuild(resetWorkshopUpgradeLevels(flattenTowerBuild(build)))
}

/** @deprecated Use flattenTowerBuild for explicit domain composition. */
export function towerBuildToWorkshopFlat(build: TowerBuildPersistedV1): WorkshopPersistedV1 {
  return flattenTowerBuild(build)
}

export type { WorkshopModulePresetSnapshot }

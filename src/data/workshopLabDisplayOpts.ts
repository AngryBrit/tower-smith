import type { ResearchData } from '../types/research'
import {
  botsResearchCooldownSecondsReduction,
  botsResearchDurationBonusSeconds,
  botsResearchThunderLingerLabPercentPoints,
  attackResearchDamageStyleLabMultiplier,
  attackResearchHealthStyleLabMultiplier,
  attackResearchSuperCritChanceLabPercentPoints,
  defenseResearchDefensePercentLabPercentPoints,
  defenseResearchExtraExtraOrbsBonus,
  defenseResearchHealthStyleLabMultiplierByName,
  defenseResearchHealthStyleMultiplier,
  defenseResearchLandMineDamageLabPercentPoints,
  defenseResearchOrbsSpeedLabPlus,
  defenseResearchShockwaveSizeLabPlus,
  defenseResearchWallHealthLabPercentPoints,
  defenseResearchWallRebuildLabSecondsReduction,
  utilityResearchDamageStyleLabMultiplier,
  utilityResearchIncludePercentLabPoints,
} from '../types/research'
import type { WorkshopDefenseStatDisplayOpts } from './workshopDefense'
import type {
  WorkshopAttackSubmoduleExtras,
  WorkshopUtilitySubmoduleExtras,
} from './workshopSubmoduleBonuses'
import type { WorkshopBotUpgradeKey } from './workshopBotsData'

export type WorkshopBotLabDisplayOpts = {
  cooldownReduction?: Partial<Record<WorkshopBotUpgradeKey, number>>
  durationBonus?: Partial<Record<WorkshopBotUpgradeKey, number>>
  thunderLingerLabPercentPoints?: number
  /** Sum of owned relic bot-range bonuses (meters), applied to every bot range row. */
  botRangeRelicMeters?: number
}

const BOT_COOLDOWN_LAB_NAMES: Partial<Record<WorkshopBotUpgradeKey, string>> = {
  flameBotCooldownLevel: 'Flame Bot - Cooldown',
  thunderBotCooldownLevel: 'Thunder Bot - Cooldown',
  goldenBotCooldownLevel: 'Golden Bot - Cooldown',
  amplifyBotCooldownLevel: 'Amplify Bot - Cooldown',
  botBotCooldownLevel: 'Bot Bot - Cooldown',
}

const BOT_DURATION_LAB_NAMES: Partial<Record<WorkshopBotUpgradeKey, string>> = {
  goldenBotDurationLevel: 'Golden Bot - Duration',
  amplifyBotDurationLevel: 'Amplify Bot - Duration',
  botBotDurationLevel: 'Bot Bot - Duration',
}

export function buildWorkshopBotLabDisplayOpts(
  research: ResearchData | null | undefined,
  labOverrides: Record<string, number>,
): WorkshopBotLabDisplayOpts | undefined {
  if (research == null) return undefined

  const cooldownReduction: Partial<Record<WorkshopBotUpgradeKey, number>> = {}
  for (const [key, labName] of Object.entries(BOT_COOLDOWN_LAB_NAMES) as [
    WorkshopBotUpgradeKey,
    string,
  ][]) {
    const red = botsResearchCooldownSecondsReduction(research, labOverrides, labName)
    if (red > 0) cooldownReduction[key] = red
  }

  const durationBonus: Partial<Record<WorkshopBotUpgradeKey, number>> = {}
  for (const [key, labName] of Object.entries(BOT_DURATION_LAB_NAMES) as [
    WorkshopBotUpgradeKey,
    string,
  ][]) {
    const add = botsResearchDurationBonusSeconds(research, labOverrides, labName)
    if (add > 0) durationBonus[key] = add
  }

  const thunderLingerLabPercentPoints = botsResearchThunderLingerLabPercentPoints(
    research,
    labOverrides,
  )

  return {
    cooldownReduction,
    durationBonus,
    thunderLingerLabPercentPoints:
      thunderLingerLabPercentPoints > 0 ? thunderLingerLabPercentPoints : undefined,
  }
}

export type WorkshopAttackLabDisplayOpts = {
  criticalFactorLabMultiplier?: number
  /**
   * Owned **Critical Factor** relic factor `(1 + Σ%)`, kept separate from the lab
   * multiplier: relics boost only the workshop-derived stat, not the flat sub-module add.
   */
  criticalFactorRelicMultiplier?: number
  attackRangeLabMultiplier?: number
  damagePerMeterLabMultiplier?: number
  superCritChanceLabPercentPoints?: number
  superCritMultLabMultiplier?: number
  /** Owned **Super Crit Mult** relic factor `(1 + Σ%)`, separate from lab. */
  superCritMultRelicMultiplier?: number
  /** Equipped Critical Chance card (additive % points). */
  criticalChanceCardPercentPoints?: number
  /** Owned relic rend armor mult % (multiplicative on workshop mult). */
  rendArmorMultLabMultiplier?: number
  /** Owned **Rend Armor Mult** relic factor `(1 + Σ%)`, separate from lab. */
  rendArmorMultRelicMultiplier?: number
  /** Equipped cannon sub-module effects (additive; merged into rows in display). */
  submodule?: WorkshopAttackSubmoduleExtras
}

export type WorkshopUtilityLabDisplayOpts = {
  cashBonusLabMultiplier?: number
  /** **Cash Bonus +** multiplicative × on the main workshop card (omitted when 1). */
  cashBonusEnhanceMultiplier?: number
  cashPerWaveLabMultiplier?: number
  coinsKillBonusLabMultiplier?: number
  /** **Coin Bonus +** multiplicative × on the Coins / Kill Bonus card (omitted when 1). */
  coinsKillBonusEnhanceMultiplier?: number
  coinsWaveLabMultiplier?: number
  recoveryAmountLabPercentPoints?: number
  /** **Recovery Package +** × on Recovery Amount card. */
  recoveryAmountEnhancementsMultiplier?: number
  /** **(1 + recovery relic %)** final × on Recovery Amount card (applied after enhancement). */
  recoveryAmountRelicMultiplier?: number
  /** **Recovery Package +** × on Max Recovery card. */
  maxRecoveryEnhancementsMultiplier?: number
  maxRecoveryLabMultiplier?: number
  packageChanceLabPercentPoints?: number
  enemyAttackLevelSkipLabPercentPoints?: number
  enemyHealthLevelSkipLabPercentPoints?: number
  /** **Enemy Level Skip +** × on both level-skip cards (applied after lab/relic, omitted when 1). */
  enemyLevelSkipEnhancementsMultiplier?: number
  /** Equipped Free Upgrades card (additive % to all free-upgrade rows). */
  freeUpgradesCardPercentPoints?: number
  /** Equipped Recovery Package Chance card (additive % points). */
  packageChanceCardPercentPoints?: number
  /** Simulated **Free Upgrades +** enhancement level (Main Research lab gate). */
  enhanceFreeUpgradesLevel?: number
  /** Main Research **Workshop Enhancements** unlocked. */
  workshopEnhancementsLabUnlocked?: boolean
  freeAttackUpgradeRelicPercentPoints?: number
  freeDefenseUpgradeRelicPercentPoints?: number
  freeUtilityUpgradeRelicPercentPoints?: number
  /** Equipped generator sub-module effects. */
  submodule?: WorkshopUtilitySubmoduleExtras
}

export function buildWorkshopDefenseLabDisplayOpts(
  research: ResearchData | null | undefined,
  labOverrides: Record<string, number>,
): WorkshopDefenseStatDisplayOpts | undefined {
  if (research == null) return undefined
  return {
    healthLabMultiplier: defenseResearchHealthStyleMultiplier(
      research,
      labOverrides,
      'Health',
    ),
    healthRegenLabMultiplier: defenseResearchHealthStyleMultiplier(
      research,
      labOverrides,
      'Health Regen',
    ),
    defensePercentLabPercentPoints: defenseResearchDefensePercentLabPercentPoints(
      research,
      labOverrides,
    ),
    defenseAbsoluteLabMultiplier: defenseResearchHealthStyleLabMultiplierByName(
      research,
      labOverrides,
      'Defense Absolute',
    ),
    orbSpeedLabPlus: defenseResearchOrbsSpeedLabPlus(research, labOverrides),
    orbsLabBonus: defenseResearchExtraExtraOrbsBonus(research, labOverrides),
    shockwaveSizeLabPlus: defenseResearchShockwaveSizeLabPlus(research, labOverrides),
    landMineDamageLabPercentPoints: defenseResearchLandMineDamageLabPercentPoints(
      research,
      labOverrides,
    ),
    wallHealthLabPercentPoints: defenseResearchWallHealthLabPercentPoints(
      research,
      labOverrides,
    ),
    wallRebuildLabSecondsReduction: defenseResearchWallRebuildLabSecondsReduction(
      research,
      labOverrides,
    ),
  }
}

export function buildWorkshopAttackLabDisplayOpts(
  research: ResearchData | null | undefined,
  labOverrides: Record<string, number>,
): WorkshopAttackLabDisplayOpts | undefined {
  if (research == null) return undefined
  return {
    criticalFactorLabMultiplier: attackResearchHealthStyleLabMultiplier(
      research,
      labOverrides,
      'Critical Factor',
    ),
    attackRangeLabMultiplier: attackResearchDamageStyleLabMultiplier(
      research,
      labOverrides,
      'Range',
    ),
    damagePerMeterLabMultiplier: attackResearchDamageStyleLabMultiplier(
      research,
      labOverrides,
      'Damage / Meter',
    ),
    superCritChanceLabPercentPoints: attackResearchSuperCritChanceLabPercentPoints(
      research,
      labOverrides,
    ),
    superCritMultLabMultiplier: attackResearchDamageStyleLabMultiplier(
      research,
      labOverrides,
      'Super Crit Mult',
    ),
  }
}

export function buildWorkshopUtilityLabDisplayOpts(
  research: ResearchData | null | undefined,
  labOverrides: Record<string, number>,
): WorkshopUtilityLabDisplayOpts | undefined {
  if (research == null) return undefined
  return {
    cashBonusLabMultiplier: utilityResearchDamageStyleLabMultiplier(
      research,
      labOverrides,
      'Cash Bonus',
    ),
    cashPerWaveLabMultiplier: utilityResearchDamageStyleLabMultiplier(
      research,
      labOverrides,
      'Cash / Wave',
    ),
    coinsKillBonusLabMultiplier: utilityResearchDamageStyleLabMultiplier(
      research,
      labOverrides,
      'Coins / Kill Bonus',
    ),
    coinsWaveLabMultiplier: utilityResearchDamageStyleLabMultiplier(
      research,
      labOverrides,
      'Coins / Wave',
    ),
    recoveryAmountLabPercentPoints: utilityResearchIncludePercentLabPoints(
      research,
      labOverrides,
      'Recovery Package Amount',
      0.4,
    ),
    maxRecoveryLabMultiplier: utilityResearchDamageStyleLabMultiplier(
      research,
      labOverrides,
      'Recovery Package Max',
    ),
    packageChanceLabPercentPoints: utilityResearchIncludePercentLabPoints(
      research,
      labOverrides,
      'Recovery Package Chance',
      0.2,
    ),
    enemyAttackLevelSkipLabPercentPoints: utilityResearchIncludePercentLabPoints(
      research,
      labOverrides,
      'Enemy Attack Level Skip',
      0.1,
    ),
    enemyHealthLevelSkipLabPercentPoints: utilityResearchIncludePercentLabPoints(
      research,
      labOverrides,
      'Enemy Health Level Skip',
      0.1,
    ),
  }
}

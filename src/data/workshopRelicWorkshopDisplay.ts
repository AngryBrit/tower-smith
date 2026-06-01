/**
 * Apply owned relic bonuses to workshop stat display opts (wiki-style **(1 + Relics)** on
 * multiplicative stats; additive % where workshop rows sum percent points).
 */

import type { WorkshopAttackSpeedDisplayOpts } from './workshopDisplayedAttackSpeed'
import type { WorkshopDamageDisplayOpts } from './workshopDisplayedDamage'
import type {
  WorkshopAttackLabDisplayOpts,
  WorkshopBotLabDisplayOpts,
  WorkshopUtilityLabDisplayOpts,
} from './workshopLabDisplayOpts'
import type { WorkshopDefenseStatDisplayOpts } from './workshopDefense'
import {
  workshopRelicsActiveBonus,
  workshopRelicsActiveBonusPercent,
  workshopRelicsDisplayedDamageBonusFraction,
} from './workshopRelicStats'

export function mergeRelicMultiplier(
  existing: number | undefined,
  relicPercentBonus: number,
): number | undefined {
  if (!Number.isFinite(relicPercentBonus) || relicPercentBonus <= 0) return existing
  const relicMult = 1 + relicPercentBonus / 100
  if (existing === undefined) return relicMult
  return existing * relicMult
}

export function mergeRelicPercentPoints(
  existing: number | undefined,
  relicPercentBonus: number,
): number | undefined {
  if (!Number.isFinite(relicPercentBonus) || relicPercentBonus === 0) return existing
  if (existing === undefined) return relicPercentBonus
  return existing + relicPercentBonus
}

export function mergeRelicSecondsReduction(
  existing: number | undefined,
  relicSeconds: number,
): number | undefined {
  if (!Number.isFinite(relicSeconds) || relicSeconds === 0) return existing
  const reduction = Math.max(0, -relicSeconds)
  if (reduction <= 0) return existing
  if (existing === undefined) return reduction
  return existing + reduction
}

export function enrichDefenseStatDisplayOpts(
  opts: WorkshopDefenseStatDisplayOpts | undefined,
  ownedIds: ReadonlySet<string>,
): WorkshopDefenseStatDisplayOpts | undefined {
  const health = workshopRelicsActiveBonusPercent(ownedIds, 'health')
  const healthRegen = workshopRelicsActiveBonusPercent(ownedIds, 'healthRegen')
  const defenseAbsolute = workshopRelicsActiveBonusPercent(ownedIds, 'defenseAbsolute')
  const defensePercent = workshopRelicsActiveBonusPercent(ownedIds, 'defensePercent')
  const thorns = workshopRelicsActiveBonusPercent(ownedIds, 'thorns')
  const knockbackForce = workshopRelicsActiveBonusPercent(ownedIds, 'knockbackForce')
  const orbSpeed = workshopRelicsActiveBonusPercent(ownedIds, 'orbSpeed')
  const landMineDamage = workshopRelicsActiveBonusPercent(ownedIds, 'landMineDamage')
  const wallHealth = workshopRelicsActiveBonusPercent(ownedIds, 'wallHealth')
  const wallRebuildSec = workshopRelicsActiveBonus(ownedIds, 'wallRebuild')

  if (
    health <= 0 &&
    healthRegen <= 0 &&
    defenseAbsolute <= 0 &&
    defensePercent <= 0 &&
    thorns <= 0 &&
    knockbackForce <= 0 &&
    orbSpeed <= 0 &&
    landMineDamage <= 0 &&
    wallHealth <= 0 &&
    wallRebuildSec >= 0 &&
    opts == null
  ) {
    return undefined
  }

  const base = opts ?? {}
  return {
    ...base,
    healthLabMultiplier: mergeRelicMultiplier(base.healthLabMultiplier, health),
    healthRegenLabMultiplier: mergeRelicMultiplier(base.healthRegenLabMultiplier, healthRegen),
    defenseAbsoluteLabMultiplier: mergeRelicMultiplier(
      base.defenseAbsoluteLabMultiplier,
      defenseAbsolute,
    ),
    defensePercentLabPercentPoints: mergeRelicPercentPoints(
      base.defensePercentLabPercentPoints,
      defensePercent,
    ),
    thornDamageLabPercentPoints: mergeRelicPercentPoints(
      base.thornDamageLabPercentPoints,
      thorns,
    ),
    knockbackForceRelicPercentPoints:
      knockbackForce > 0 ? knockbackForce : base.knockbackForceRelicPercentPoints,
    orbSpeedRelicPercentPoints:
      orbSpeed > 0 ? orbSpeed : base.orbSpeedRelicPercentPoints,
    landMineDamageLabPercentPoints: mergeRelicPercentPoints(
      base.landMineDamageLabPercentPoints,
      landMineDamage,
    ),
    wallHealthLabPercentPoints: mergeRelicPercentPoints(
      base.wallHealthLabPercentPoints,
      wallHealth,
    ),
    wallRebuildLabSecondsReduction: mergeRelicSecondsReduction(
      base.wallRebuildLabSecondsReduction,
      wallRebuildSec,
    ),
  }
}

export function enrichAttackLabDisplayOpts(
  opts: WorkshopAttackLabDisplayOpts | undefined,
  ownedIds: ReadonlySet<string>,
): WorkshopAttackLabDisplayOpts | undefined {
  const critChance = workshopRelicsActiveBonusPercent(ownedIds, 'critChance')
  const critFactor = workshopRelicsActiveBonusPercent(ownedIds, 'critFactor')
  const dpm = workshopRelicsActiveBonusPercent(ownedIds, 'damagePerMeter')
  const superCritChance = workshopRelicsActiveBonusPercent(ownedIds, 'superCritChance')
  const superCritMult = workshopRelicsActiveBonusPercent(ownedIds, 'superCritMult')
  const rendArmorMult = workshopRelicsActiveBonusPercent(ownedIds, 'rendArmorMult')

  if (
    critChance <= 0 &&
    critFactor <= 0 &&
    dpm <= 0 &&
    superCritChance <= 0 &&
    superCritMult <= 0 &&
    rendArmorMult <= 0 &&
    opts == null
  ) {
    return undefined
  }

  const base = opts ?? {}
  return {
    ...base,
    criticalChanceCardPercentPoints: mergeRelicPercentPoints(
      base.criticalChanceCardPercentPoints,
      critChance,
    ),
    criticalFactorLabMultiplier: mergeRelicMultiplier(
      base.criticalFactorLabMultiplier,
      critFactor,
    ),
    damagePerMeterLabMultiplier: mergeRelicMultiplier(
      base.damagePerMeterLabMultiplier,
      dpm,
    ),
    superCritChanceLabPercentPoints: mergeRelicPercentPoints(
      base.superCritChanceLabPercentPoints,
      superCritChance,
    ),
    superCritMultLabMultiplier: mergeRelicMultiplier(
      base.superCritMultLabMultiplier,
      superCritMult,
    ),
    rendArmorMultLabMultiplier: mergeRelicMultiplier(
      base.rendArmorMultLabMultiplier,
      rendArmorMult,
    ),
  }
}

export function enrichUtilityLabDisplayOpts(
  opts: WorkshopUtilityLabDisplayOpts | undefined,
  ownedIds: ReadonlySet<string>,
): WorkshopUtilityLabDisplayOpts | undefined {
  const cash = workshopRelicsActiveBonusPercent(ownedIds, 'cash')
  const coins = workshopRelicsActiveBonusPercent(ownedIds, 'coins')
  const freeAttack = workshopRelicsActiveBonusPercent(ownedIds, 'freeAttackUpgrade')
  const freeDefense = workshopRelicsActiveBonusPercent(ownedIds, 'freeDefenseUpgrade')
  const freeUtility = workshopRelicsActiveBonusPercent(ownedIds, 'freeUtilityUpgrade')
  const recovery = workshopRelicsActiveBonusPercent(ownedIds, 'recoveryAmount')
  const enemyAttackSkip = workshopRelicsActiveBonusPercent(ownedIds, 'enemyAttackSkip')
  const enemyHealthSkip = workshopRelicsActiveBonusPercent(ownedIds, 'enemyHealthSkip')

  if (
    cash <= 0 &&
    coins <= 0 &&
    freeAttack <= 0 &&
    freeDefense <= 0 &&
    freeUtility <= 0 &&
    recovery <= 0 &&
    enemyAttackSkip <= 0 &&
    enemyHealthSkip <= 0 &&
    opts == null
  ) {
    return undefined
  }

  const base = opts ?? {}
  return {
    ...base,
    cashBonusLabMultiplier: mergeRelicMultiplier(base.cashBonusLabMultiplier, cash),
    cashPerWaveLabMultiplier: mergeRelicMultiplier(base.cashPerWaveLabMultiplier, cash),
    coinsKillBonusLabMultiplier: mergeRelicMultiplier(base.coinsKillBonusLabMultiplier, coins),
    coinsWaveLabMultiplier: mergeRelicMultiplier(base.coinsWaveLabMultiplier, coins),
    freeAttackUpgradeRelicPercentPoints:
      freeAttack > 0 ? freeAttack : base.freeAttackUpgradeRelicPercentPoints,
    freeDefenseUpgradeRelicPercentPoints:
      freeDefense > 0 ? freeDefense : base.freeDefenseUpgradeRelicPercentPoints,
    freeUtilityUpgradeRelicPercentPoints:
      freeUtility > 0 ? freeUtility : base.freeUtilityUpgradeRelicPercentPoints,
    recoveryAmountLabPercentPoints: mergeRelicPercentPoints(
      base.recoveryAmountLabPercentPoints,
      recovery,
    ),
    enemyAttackLevelSkipLabPercentPoints: mergeRelicPercentPoints(
      base.enemyAttackLevelSkipLabPercentPoints,
      enemyAttackSkip,
    ),
    enemyHealthLevelSkipLabPercentPoints: mergeRelicPercentPoints(
      base.enemyHealthLevelSkipLabPercentPoints,
      enemyHealthSkip,
    ),
  }
}

/**
 * Relic lab-speed factor: **(1 + Σ owned lab-speed relic %)**.
 * Multiple lab-speed relics sum their % before this factor is applied.
 */
export function workshopRelicsLabSpeedMultiplier(ownedIds: ReadonlySet<string>): number {
  const pct = workshopRelicsActiveBonusPercent(ownedIds, 'labSpeed')
  if (pct <= 0) return 1
  return 1 + pct / 100
}

/**
 * Wiki **Lab Speed Bonus** for research times on labs other than **Labs Speed**:
 * **(Labs Speed research multiplier) × (relic lab-speed multiplier)** — multiplicative, not additive.
 * Example: **×2.98** research and **×1.25** relics → **×3.725** total (not ×3.23).
 */
export function combinedLabsSpeedMultiplier(
  labsSpeedResearchMultiplier: number,
  ownedRelicIds: ReadonlySet<string>,
): number {
  const research =
    Number.isFinite(labsSpeedResearchMultiplier) && labsSpeedResearchMultiplier > 0
      ? labsSpeedResearchMultiplier
      : 1
  return research * workshopRelicsLabSpeedMultiplier(ownedRelicIds)
}

export function enrichBotLabDisplayOpts(
  opts: WorkshopBotLabDisplayOpts | undefined,
  ownedIds: ReadonlySet<string>,
): WorkshopBotLabDisplayOpts | undefined {
  const botRangeM = workshopRelicsActiveBonus(ownedIds, 'botRange')
  if (botRangeM <= 0 && opts == null) return undefined
  const base = opts ?? {}
  return {
    ...base,
    botRangeRelicMeters: botRangeM > 0 ? botRangeM : base.botRangeRelicMeters,
  }
}

export function enrichAttackSpeedDisplayOpts(
  opts: WorkshopAttackSpeedDisplayOpts | undefined,
  ownedIds: ReadonlySet<string>,
): WorkshopAttackSpeedDisplayOpts | undefined {
  const attackSpeed = workshopRelicsActiveBonusPercent(ownedIds, 'attackSpeed')
  if (attackSpeed <= 0 && opts == null) return undefined
  const base = opts ?? {}
  const mult = mergeRelicMultiplier(1, attackSpeed)
  if (mult === undefined) return opts
  return {
    ...base,
    relicMultiplier: mult,
  }
}

/** Always returns opts (never drops the wiki formula factors). */
export function enrichDamageDisplayOpts(
  opts: WorkshopDamageDisplayOpts | undefined,
  ownedIds: ReadonlySet<string>,
): WorkshopDamageDisplayOpts {
  const fraction = workshopRelicsDisplayedDamageBonusFraction(ownedIds)
  const base = opts ?? {}
  const relicsBonus =
    ownedIds.size > 0 ? fraction : (base.relicsBonus ?? fraction)
  return {
    ...base,
    relicsBonus,
  }
}

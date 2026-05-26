/**
 * Merge equipped sub-module bonuses into workshop stat display opts (wiki additive sub-effects).
 */

import type { WorkshopSubmoduleSelections } from './workshopSubmoduleSelection'
import type { WorkshopSubmoduleBonusContext } from './workshopAssistSubmoduleScale'
import {
  buildWorkshopSubmoduleBonuses,
  type WorkshopAttackSubmoduleExtras,
  type WorkshopDefenseSubmoduleExtras,
  type WorkshopUtilitySubmoduleExtras,
} from './workshopSubmoduleBonuses'
import type { WorkshopAttackLabDisplayOpts } from './workshopLabDisplayOpts'
import type { WorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import type { WorkshopDefenseStatDisplayOpts } from './workshopDefense'
import { mergeRelicMultiplier, mergeRelicPercentPoints } from './workshopRelicWorkshopDisplay'

function hasAttackSubmodule(ex: WorkshopAttackSubmoduleExtras): boolean {
  return Object.values(ex).some((v) => v != null && v !== 0)
}

function hasDefenseSubmodule(ex: WorkshopDefenseSubmoduleExtras): boolean {
  return Object.values(ex).some((v) => v != null && v !== 0)
}

function hasUtilitySubmodule(ex: WorkshopUtilitySubmoduleExtras): boolean {
  return Object.values(ex).some((v) => v != null && v !== 0)
}

export function enrichAttackLabDisplayOptsWithSubmodules(
  opts: WorkshopAttackLabDisplayOpts | undefined,
  selections: WorkshopSubmoduleSelections,
  ctx?: WorkshopSubmoduleBonusContext,
): WorkshopAttackLabDisplayOpts | undefined {
  const sub = buildWorkshopSubmoduleBonuses(selections, ctx).attack
  if (!hasAttackSubmodule(sub) && opts == null) return undefined
  const base = opts ?? {}
  return {
    ...base,
    criticalChanceCardPercentPoints: mergeRelicPercentPoints(
      base.criticalChanceCardPercentPoints,
      sub.critChancePercentPoints ?? 0,
    ),
    criticalFactorLabMultiplier: base.criticalFactorLabMultiplier,
    attackRangeLabMultiplier: base.attackRangeLabMultiplier,
    damagePerMeterLabMultiplier: base.damagePerMeterLabMultiplier,
    superCritChanceLabPercentPoints: mergeRelicPercentPoints(
      base.superCritChanceLabPercentPoints,
      sub.superCritChancePercentPoints ?? 0,
    ),
    superCritMultLabMultiplier: base.superCritMultLabMultiplier,
    rendArmorMultLabMultiplier: base.rendArmorMultLabMultiplier,
    submodule: sub,
  }
}

export function enrichDefenseStatDisplayOptsWithSubmodules(
  opts: WorkshopDefenseStatDisplayOpts | undefined,
  selections: WorkshopSubmoduleSelections,
  ctx?: WorkshopSubmoduleBonusContext,
): WorkshopDefenseStatDisplayOpts | undefined {
  const sub = buildWorkshopSubmoduleBonuses(selections, ctx).defense
  if (!hasDefenseSubmodule(sub) && opts == null) return undefined
  const base = opts ?? {}
  return {
    ...base,
    healthRegenLabMultiplier: mergeRelicMultiplier(
      base.healthRegenLabMultiplier,
      sub.healthRegenPercentBonus ?? 0,
    ),
    defensePercentLabPercentPoints: mergeRelicPercentPoints(
      base.defensePercentLabPercentPoints,
      sub.defensePercentPoints ?? 0,
    ),
    defenseAbsoluteLabMultiplier: mergeRelicMultiplier(
      base.defenseAbsoluteLabMultiplier,
      sub.defenseAbsolutePercentBonus ?? 0,
    ),
    thornDamageLabPercentPoints: mergeRelicPercentPoints(
      base.thornDamageLabPercentPoints,
      sub.thornDamagePercentPoints ?? 0,
    ),
    orbSpeedLabPlus:
      sub.orbSpeedAdd != null && sub.orbSpeedAdd !== 0
        ? (base.orbSpeedLabPlus ?? 0) + sub.orbSpeedAdd
        : base.orbSpeedLabPlus,
    orbsLabBonus:
      sub.orbsCount != null && sub.orbsCount !== 0
        ? (base.orbsLabBonus ?? 0) + sub.orbsCount
        : base.orbsLabBonus,
    shockwaveSizeLabPlus:
      sub.shockwaveSizeAdd != null && sub.shockwaveSizeAdd !== 0
        ? (base.shockwaveSizeLabPlus ?? 0) + sub.shockwaveSizeAdd
        : base.shockwaveSizeLabPlus,
    landMineDamageLabPercentPoints: mergeRelicPercentPoints(
      base.landMineDamageLabPercentPoints,
      sub.landMineDamagePercentPoints ?? 0,
    ),
    wallHealthLabPercentPoints: mergeRelicPercentPoints(
      base.wallHealthLabPercentPoints,
      sub.wallHealthPercentPoints ?? 0,
    ),
    wallRebuildLabSecondsReduction:
      sub.wallRebuildSecondsReduction != null && sub.wallRebuildSecondsReduction !== 0
        ? (base.wallRebuildLabSecondsReduction ?? 0) + sub.wallRebuildSecondsReduction
        : base.wallRebuildLabSecondsReduction,
    submodule: sub,
  }
}

export function enrichUtilityLabDisplayOptsWithSubmodules(
  opts: WorkshopUtilityLabDisplayOpts | undefined,
  selections: WorkshopSubmoduleSelections,
  ctx?: WorkshopSubmoduleBonusContext,
): WorkshopUtilityLabDisplayOpts | undefined {
  const sub = buildWorkshopSubmoduleBonuses(selections, ctx).utility
  if (!hasUtilitySubmodule(sub) && opts == null) return undefined
  const base = opts ?? {}
  const cashAdd = sub.cashBonusAdd ?? 0
  return {
    ...base,
    cashBonusLabMultiplier:
      cashAdd !== 0 ? (base.cashBonusLabMultiplier ?? 1) + cashAdd : base.cashBonusLabMultiplier,
    freeAttackUpgradeRelicPercentPoints: mergeRelicPercentPoints(
      base.freeAttackUpgradeRelicPercentPoints,
      sub.freeAttackUpgradePercentPoints ?? 0,
    ),
    freeDefenseUpgradeRelicPercentPoints: mergeRelicPercentPoints(
      base.freeDefenseUpgradeRelicPercentPoints,
      sub.freeDefenseUpgradePercentPoints ?? 0,
    ),
    freeUtilityUpgradeRelicPercentPoints: mergeRelicPercentPoints(
      base.freeUtilityUpgradeRelicPercentPoints,
      sub.freeUtilityUpgradePercentPoints ?? 0,
    ),
    interestPerWaveLabMultiplier:
      sub.interestPerWavePercentPoints != null && sub.interestPerWavePercentPoints !== 0
        ? (base.interestPerWaveLabMultiplier ?? 1) + sub.interestPerWavePercentPoints / 100
        : base.interestPerWaveLabMultiplier,
    recoveryAmountLabPercentPoints: mergeRelicPercentPoints(
      base.recoveryAmountLabPercentPoints,
      sub.recoveryAmountPercentPoints ?? 0,
    ),
    maxRecoveryLabMultiplier:
      sub.maxRecoveryAdd != null && sub.maxRecoveryAdd !== 0
        ? (base.maxRecoveryLabMultiplier ?? 1) + sub.maxRecoveryAdd
        : base.maxRecoveryLabMultiplier,
    packageChanceLabPercentPoints: mergeRelicPercentPoints(
      base.packageChanceLabPercentPoints,
      sub.packageChancePercentPoints ?? 0,
    ),
    enemyAttackLevelSkipLabPercentPoints: mergeRelicPercentPoints(
      base.enemyAttackLevelSkipLabPercentPoints,
      sub.enemyAttackSkipPercentPoints ?? 0,
    ),
    enemyHealthLevelSkipLabPercentPoints: mergeRelicPercentPoints(
      base.enemyHealthLevelSkipLabPercentPoints,
      sub.enemyHealthSkipPercentPoints ?? 0,
    ),
    submodule: sub,
  }
}

/**
 * Workshop **defense** upgrades: stat display helpers per upgrade; values and costs from `tables/workshop/defense/`.
 */

import {
  formatAdditiveCount,
  formatAdditiveNumeric,
  formatAdditivePercentPoints,
  formatPercentAfterLabAddition,
  formatPercentAfterLabAdditionAndMultiplier,
  formatWorkshopPercentDisplay,
  formatSecondsAfterLabReduction,
  formatWithDamageStyleLabMultiplier,
  formatWithHealthStyleLabMultiplier,
} from './workshopLabDisplayHelpers'
import type { WorkshopDefenseSubmoduleExtras } from './workshopSubmoduleBonuses'
import { workshopDefenseAbsoluteStatValue } from './workshopDefenseAbsolute'
import { workshopOrbSpeedStatMultiplier } from './workshopOrbSpeed'
import { workshopOrbsStatCount } from './workshopOrbs'
import { workshopShockwaveSizeStatMultiplier } from './workshopShockwaveSize'
import { workshopWallHealthStatPercent } from './workshopWallHealth'
import { workshopWallRebuildStatSeconds } from './workshopWallRebuild'
import { WORKSHOP_DEFENSE_GOD_NAMES, workshopToolkitMarginalCoins } from '../workshopCosts'
import { workshopDisplayedHealthStatDisplay } from './workshopDisplayedHealth'
import { workshopDisplayedHealthRegenStatDisplay } from './workshopDisplayedHealthRegen'
import {
  WORKSHOP_HEALTH_REGEN_MAX_LEVEL,
  formatWorkshopHealthRegenPerSec,
  workshopHealthRegenNextMarginalCoins,
  workshopHealthRegenStatDisplay,
  workshopHealthRegenStatValue,
} from './workshopHealthRegen'
import {
  WORKSHOP_HEALTH_MAX_LEVEL,
  workshopHealthNextMarginalCoins,
  workshopHealthStatDisplay,
  workshopHealthStatValue,
} from './workshopHealth'
import {
  WORKSHOP_DEFENSE_PERCENT_MAX_LEVEL,
  workshopDefensePercentNextMarginalCoins,
  workshopDefensePercentStatDisplay,
  workshopDefensePercentStatPercentPoints,
} from './workshopDefensePercent'
import {
  WORKSHOP_DEFENSE_ABSOLUTE_MAX_LEVEL,
  workshopDefenseAbsoluteNextMarginalCoins,
  workshopDefenseAbsoluteStatDisplay,
} from './workshopDefenseAbsolute'
import {
  WORKSHOP_THORN_DAMAGE_MAX_LEVEL,
  workshopThornDamageNextMarginalCoins,
  workshopThornDamageStatDisplay,
  workshopThornDamageStatPercentPoints,
} from './workshopThornDamage'
import {
  WORKSHOP_LIFESTEAL_MAX_LEVEL,
  workshopLifestealNextMarginalCoins,
  workshopLifestealStatDisplay,
  workshopLifestealStatPercentPoints,
} from './workshopLifesteal'
import {
  WORKSHOP_KNOCKBACK_CHANCE_MAX_LEVEL,
  workshopKnockbackChanceNextMarginalCoins,
  workshopKnockbackChanceStatDisplay,
  workshopKnockbackChanceStatPercentPoints,
} from './workshopKnockbackChance'
import {
  WORKSHOP_KNOCKBACK_FORCE_MAX_LEVEL,
  workshopKnockbackForceNextMarginalCoins,
  workshopKnockbackForceStatDisplay,
  workshopKnockbackForceStatMultiplier,
} from './workshopKnockbackForce'
import {
  WORKSHOP_ORB_SPEED_MAX_LEVEL,
  workshopOrbSpeedNextMarginalCoins,
  workshopOrbSpeedStatDisplay,
} from './workshopOrbSpeed'
import {
  WORKSHOP_ORBS_MAX_LEVEL,
  workshopOrbsNextMarginalCoins,
  workshopOrbsStatDisplay,
} from './workshopOrbs'
import {
  WORKSHOP_SHOCKWAVE_SIZE_MAX_LEVEL,
  workshopShockwaveSizeNextMarginalCoins,
  workshopShockwaveSizeStatDisplay,
} from './workshopShockwaveSize'
import {
  WORKSHOP_SHOCKWAVE_FREQUENCY_MAX_LEVEL,
  workshopShockwaveFrequencyNextMarginalCoins,
  workshopShockwaveFrequencyStatDisplay,
  workshopShockwaveFrequencyStatSeconds,
} from './workshopShockwaveFrequency'
import {
  WORKSHOP_LAND_MINE_CHANCE_MAX_LEVEL,
  workshopLandMineChanceNextMarginalCoins,
  workshopLandMineChanceStatDisplay,
  workshopLandMineChanceStatPercentPoints,
} from './workshopLandMineChance'
import {
  WORKSHOP_LAND_MINE_DAMAGE_MAX_LEVEL,
  formatWorkshopLandMineDamageMultiplier,
  workshopLandMineDamageNextMarginalCoins,
  workshopLandMineDamageStatDisplay,
  workshopLandMineDamageStatPercent,
} from './workshopLandMineDamage'
import {
  WORKSHOP_LAND_MINE_RADIUS_MAX_LEVEL,
  workshopLandMineRadiusNextMarginalCoins,
  workshopLandMineRadiusStatDisplay,
  workshopLandMineRadiusStatValue,
} from './workshopLandMineRadius'
import {
  WORKSHOP_DEATH_DEFY_MAX_LEVEL,
  workshopDeathDefyNextMarginalCoins,
  workshopDeathDefyStatDisplay,
  workshopDeathDefyStatPercent,
} from './workshopDeathDefy'
import {
  WORKSHOP_WALL_HEALTH_MAX_LEVEL,
  workshopWallHealthNextMarginalCoins,
  workshopWallHealthStatDisplay,
} from './workshopWallHealth'
import {
  WORKSHOP_WALL_REBUILD_MAX_LEVEL,
  workshopWallRebuildNextMarginalCoins,
  workshopWallRebuildStatDisplay,
} from './workshopWallRebuild'

export type WorkshopDefenseUpgradeKey =
  | 'healthLevel'
  | 'healthRegenLevel'
  | 'defensePercentLevel'
  | 'defenseAbsoluteLevel'
  | 'thornDamageLevel'
  | 'lifestealLevel'
  | 'knockbackChanceLevel'
  | 'knockbackForceLevel'
  | 'orbSpeedLevel'
  | 'orbsLevel'
  | 'shockwaveSizeLevel'
  | 'shockwaveFrequencyLevel'
  | 'landMineChanceLevel'
  | 'landMineDamageLevel'
  | 'landMineRadiusLevel'
  | 'deathDefyLevel'
  | 'wallHealthLevel'
  | 'wallRebuildLevel'

export const WORKSHOP_DEFENSE_UPGRADE_ORDER: readonly WorkshopDefenseUpgradeKey[] = [
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
]

function cap(level: number, max: number): number {
  if (!Number.isFinite(level)) return 0
  return Math.min(Math.max(0, Math.trunc(level)), max)
}

/** Max workshop level per defense row (aligned with defense / utility labs where applicable). */
export function workshopDefenseMaxLevel(key: WorkshopDefenseUpgradeKey): number {
  switch (key) {
    case 'healthLevel':
      return WORKSHOP_HEALTH_MAX_LEVEL
    case 'healthRegenLevel':
      return WORKSHOP_HEALTH_REGEN_MAX_LEVEL
    case 'defenseAbsoluteLevel':
      return WORKSHOP_DEFENSE_ABSOLUTE_MAX_LEVEL
    case 'defensePercentLevel':
      return WORKSHOP_DEFENSE_PERCENT_MAX_LEVEL
    case 'thornDamageLevel':
      return WORKSHOP_THORN_DAMAGE_MAX_LEVEL
    case 'lifestealLevel':
      return WORKSHOP_LIFESTEAL_MAX_LEVEL
    case 'knockbackChanceLevel':
      return WORKSHOP_KNOCKBACK_CHANCE_MAX_LEVEL
    case 'knockbackForceLevel':
      return WORKSHOP_KNOCKBACK_FORCE_MAX_LEVEL
    case 'orbSpeedLevel':
      return WORKSHOP_ORB_SPEED_MAX_LEVEL
    case 'shockwaveSizeLevel':
      return WORKSHOP_SHOCKWAVE_SIZE_MAX_LEVEL
    case 'shockwaveFrequencyLevel':
      return WORKSHOP_SHOCKWAVE_FREQUENCY_MAX_LEVEL
    case 'landMineDamageLevel':
      return WORKSHOP_LAND_MINE_DAMAGE_MAX_LEVEL
    case 'landMineRadiusLevel':
      return WORKSHOP_LAND_MINE_RADIUS_MAX_LEVEL
    case 'wallRebuildLevel':
      return WORKSHOP_WALL_REBUILD_MAX_LEVEL
    case 'orbsLevel':
      return WORKSHOP_ORBS_MAX_LEVEL
    case 'landMineChanceLevel':
      return WORKSHOP_LAND_MINE_CHANCE_MAX_LEVEL
    case 'deathDefyLevel':
      return WORKSHOP_DEATH_DEFY_MAX_LEVEL
    case 'wallHealthLevel':
      return WORKSHOP_WALL_HEALTH_MAX_LEVEL
  }
}

export function workshopDefenseClampLevel(key: WorkshopDefenseUpgradeKey, n: number): number {
  return cap(n, workshopDefenseMaxLevel(key))
}

/** Optional simulated Defense labs for workshop **Value** display (coin costs unchanged). */
export type WorkshopDefenseStatDisplayOpts = {
  /** Equipped armor chassis main effect (Tower Health). */
  armorTowerHealthMultiplier?: number
  healthLabMultiplier?: number
  healthCardMultiplier?: number
  /** Summed **Health** + **Health Regen** relic fraction for **(1 + Relics)**. */
  healthRelicsBonus?: number
  /** **Health +** + partial **Health Regen +** enhancement tier (omitted when ×1). */
  healthEnhancementsMultiplier?: number
  healthRegenLabMultiplier?: number
  healthRegenCardMultiplier?: number
  /** Summed **Health** + **Health Regen** relic fraction for regen **(1 + Relics)**. */
  healthRegenRelicsBonus?: number
  /** Partial **Health Regen +** enhancement tier (omitted when ×1). */
  healthRegenEnhancementsMultiplier?: number
  /** Owned **Thorns** relic % (percent points) on the workshop Thorn Damage card. */
  thornDamageRelicsPercentPoints?: number
  /** Additive **Defense %** lab (percent points), summed with workshop Defense %. */
  defensePercentLabPercentPoints?: number
  defenseAbsoluteLabMultiplier?: number
  orbSpeedLabPlus?: number
  orbsLabBonus?: number
  shockwaveSizeLabPlus?: number
  landMineDamageLabPercentPoints?: number
  /** **Land Mine Damage +** enhancement tier (omitted when ×1). */
  landMineDamageEnhancementsMultiplier?: number
  wallHealthLabPercentPoints?: number
  /** **Wall Health +** enhancement tier (omitted when ×1). */
  wallHealthEnhancementsMultiplier?: number
  wallRebuildLabSecondsReduction?: number
  /** Equipped Extra Defense card (additive % points). */
  defensePercentCardPercentPoints?: number
  /** Owned relic knockback force % (multiplicative on workshop value). */
  knockbackForceRelicPercentPoints?: number
  /** Owned relic orb speed % (multiplicative on workshop multiplier). */
  orbSpeedRelicPercentPoints?: number
  /** Equipped armor sub-module effects. */
  submodule?: WorkshopDefenseSubmoduleExtras
}

function defenseSub(opts: WorkshopDefenseStatDisplayOpts | undefined): WorkshopDefenseSubmoduleExtras {
  return opts?.submodule ?? {}
}

export function workshopDefenseStatDisplay(
  key: WorkshopDefenseUpgradeKey,
  completedLevels: number,
  opts?: WorkshopDefenseStatDisplayOpts,
): string {
  switch (key) {
    case 'healthLevel': {
      const lab = opts?.healthLabMultiplier
      const card = opts?.healthCardMultiplier
      const relics = opts?.healthRelicsBonus
      const enhance = opts?.healthEnhancementsMultiplier
      const chassis = opts?.armorTowerHealthMultiplier
      if (
        (lab !== undefined && Number.isFinite(lab) && lab > 0) ||
        (card !== undefined && Number.isFinite(card) && card > 1 + 1e-9) ||
        (relics !== undefined && relics > 0) ||
        (enhance !== undefined && enhance > 1 + 1e-9) ||
        (chassis !== undefined && chassis > 1 + 1e-9)
      ) {
        return workshopDisplayedHealthStatDisplay(completedLevels, {
          armorTowerHealthMultiplier: chassis,
          healthLabMultiplier: lab,
          healthCardMultiplier: card,
          relicsBonus: relics,
          healthEnhancementsMultiplier: enhance,
        })
      }
      return workshopHealthStatDisplay(completedLevels)
    }
    case 'healthRegenLevel': {
      const card = opts?.healthRegenCardMultiplier
      const relics = opts?.healthRegenRelicsBonus
      const enhance = opts?.healthRegenEnhancementsMultiplier
      if (
        (card !== undefined && Number.isFinite(card) && card > 1 + 1e-9) ||
        (relics !== undefined && relics > 0) ||
        (enhance !== undefined && enhance > 1 + 1e-9)
      ) {
        return workshopDisplayedHealthRegenStatDisplay(completedLevels, {
          healthRegenCardMultiplier: card,
          relicsBonus: relics,
          healthRegenEnhancementsMultiplier: enhance,
        })
      }
      return workshopHealthRegenStatDisplay(completedLevels)
    }
    case 'defenseAbsoluteLevel': {
      const m = opts?.defenseAbsoluteLabMultiplier
      if (m !== undefined && Number.isFinite(m) && m > 1 + 1e-9) {
        return formatWithHealthStyleLabMultiplier(
          workshopDefenseAbsoluteStatValue(completedLevels),
          m,
        )
      }
      return workshopDefenseAbsoluteStatDisplay(completedLevels)
    }
    case 'defensePercentLevel': {
      const labPts = opts?.defensePercentLabPercentPoints ?? 0
      const cardPts = opts?.defensePercentCardPercentPoints ?? 0
      if (labPts !== 0 || cardPts !== 0) {
        const w = workshopDefensePercentStatPercentPoints(completedLevels)
        return `${(w + labPts + cardPts).toFixed(2)}%`
      }
      return workshopDefensePercentStatDisplay(completedLevels)
    }
    case 'thornDamageLevel': {
      const relicPts = opts?.thornDamageRelicsPercentPoints ?? 0
      if (relicPts !== 0) {
        const w = workshopThornDamageStatPercentPoints(completedLevels)
        return formatWorkshopPercentDisplay(w + relicPts)
      }
      return workshopThornDamageStatDisplay(completedLevels)
    }
    case 'lifestealLevel': {
      const sub = defenseSub(opts).lifestealPercentPoints ?? 0
      if (sub > 0) {
        return formatPercentAfterLabAddition(
          workshopLifestealStatPercentPoints(completedLevels),
          sub,
        )
      }
      return workshopLifestealStatDisplay(completedLevels)
    }
    case 'knockbackChanceLevel': {
      const sub = defenseSub(opts).knockbackChancePercentPoints ?? 0
      if (sub > 0) {
        return formatPercentAfterLabAddition(
          workshopKnockbackChanceStatPercentPoints(completedLevels),
          sub,
        )
      }
      return workshopKnockbackChanceStatDisplay(completedLevels)
    }
    case 'knockbackForceLevel': {
      const subAdd = defenseSub(opts).knockbackForceAdd ?? 0
      const relicPct = opts?.knockbackForceRelicPercentPoints ?? 0
      let base = workshopKnockbackForceStatMultiplier(completedLevels)
      if (subAdd > 0) base += subAdd
      if (relicPct > 0) {
        return formatWithDamageStyleLabMultiplier(base, 1 + relicPct / 100, (v) =>
          v.toFixed(2),
        )
      }
      if (subAdd > 0) return base.toFixed(2)
      return workshopKnockbackForceStatDisplay(completedLevels)
    }
    case 'orbSpeedLevel': {
      const lab = opts?.orbSpeedLabPlus
      const relicPct = opts?.orbSpeedRelicPercentPoints ?? 0
      const base = workshopOrbSpeedStatMultiplier(completedLevels)
      const withLab =
        lab !== undefined && Number.isFinite(lab) && lab > 0
          ? base + lab
          : base
      if (relicPct > 0) {
        return formatWithDamageStyleLabMultiplier(withLab, 1 + relicPct / 100, (v) =>
          v.toFixed(2),
        )
      }
      if (lab !== undefined && Number.isFinite(lab) && lab > 0) {
        return formatAdditiveNumeric(base, lab)
      }
      return workshopOrbSpeedStatDisplay(completedLevels)
    }
    case 'orbsLevel': {
      const lab = opts?.orbsLabBonus
      if (lab !== undefined && Number.isFinite(lab) && lab > 0) {
        return formatAdditiveCount(workshopOrbsStatCount(completedLevels), lab)
      }
      return workshopOrbsStatDisplay(completedLevels)
    }
    case 'shockwaveSizeLevel': {
      const lab = opts?.shockwaveSizeLabPlus
      if (lab !== undefined && Number.isFinite(lab) && lab > 0) {
        return formatAdditiveNumeric(workshopShockwaveSizeStatMultiplier(completedLevels), lab)
      }
      return workshopShockwaveSizeStatDisplay(completedLevels)
    }
    case 'shockwaveFrequencyLevel': {
      const red = defenseSub(opts).shockwaveFrequencySecondsReduction ?? 0
      if (red > 0) {
        return formatSecondsAfterLabReduction(
          workshopShockwaveFrequencyStatSeconds(completedLevels),
          red,
        )
      }
      return workshopShockwaveFrequencyStatDisplay(completedLevels)
    }
    case 'landMineChanceLevel': {
      const sub = defenseSub(opts).landMineChancePercentPoints ?? 0
      if (sub > 0) {
        return formatPercentAfterLabAddition(
          workshopLandMineChanceStatPercentPoints(completedLevels),
          sub,
        )
      }
      return workshopLandMineChanceStatDisplay(completedLevels)
    }
    case 'landMineDamageLevel': {
      const labPts = opts?.landMineDamageLabPercentPoints ?? 0
      const enhance = opts?.landMineDamageEnhancementsMultiplier ?? 1
      const totalMult = (1 + (labPts > 0 ? labPts / 100 : 0)) * enhance
      if (labPts > 0 || enhance > 1 + 1e-9) {
        return formatWithDamageStyleLabMultiplier(
          workshopLandMineDamageStatPercent(completedLevels),
          totalMult,
          formatWorkshopLandMineDamageMultiplier,
        )
      }
      return workshopLandMineDamageStatDisplay(completedLevels)
    }
    case 'landMineRadiusLevel': {
      const sub = defenseSub(opts).landMineRadiusAdd ?? 0
      if (sub > 0) {
        return formatAdditiveNumeric(workshopLandMineRadiusStatValue(completedLevels), sub)
      }
      return workshopLandMineRadiusStatDisplay(completedLevels)
    }
    case 'deathDefyLevel': {
      const sub = defenseSub(opts).deathDefyPercentPoints ?? 0
      if (sub > 0) {
        return formatPercentAfterLabAddition(workshopDeathDefyStatPercent(completedLevels), sub)
      }
      return workshopDeathDefyStatDisplay(completedLevels)
    }
    case 'wallHealthLevel': {
      const labPts = opts?.wallHealthLabPercentPoints ?? 0
      const enhance = opts?.wallHealthEnhancementsMultiplier ?? 1
      const base = workshopWallHealthStatPercent(completedLevels)
      if (labPts > 0 || enhance > 1 + 1e-9) {
        return formatPercentAfterLabAdditionAndMultiplier(base, labPts, enhance)
      }
      return workshopWallHealthStatDisplay(completedLevels)
    }
    case 'wallRebuildLevel': {
      const lab = opts?.wallRebuildLabSecondsReduction
      if (lab !== undefined && Number.isFinite(lab) && lab > 0) {
        return formatSecondsAfterLabReduction(
          workshopWallRebuildStatSeconds(completedLevels),
          lab,
        )
      }
      return workshopWallRebuildStatDisplay(completedLevels)
    }
  }
}

/** Coins for the next purchase when `completedLevels` upgrades are already done (GOD tables). */
export function workshopDefenseNextMarginalCoins(
  key: WorkshopDefenseUpgradeKey,
  completedLevels: number,
): number | undefined {
  return workshopToolkitMarginalCoins(WORKSHOP_DEFENSE_GOD_NAMES[key], completedLevels)
}

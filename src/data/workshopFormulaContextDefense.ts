/**
 * Defense workshop formula operand resolution and display entry.
 *
 * Mirrors `workshopFormulaContextAttack.ts`: resolves each declarative operand in
 * `tables/workshop/formulas/defense/*.json` to a number, evaluates the pipeline, and
 * formats. Parity target is the legacy `workshopDefenseStatDisplay` switch.
 */

import { evaluateWorkshopFormula } from './workshopFormulaEval'
import { getWorkshopDefenseFormulaSpec } from './workshopFormulaTables'
import type { WorkshopFormulaOperand, WorkshopFormulaSpec } from './workshopFormulaTypes'
import type {
  WorkshopDefenseStatDisplayOpts,
  WorkshopDefenseUpgradeKey,
} from './workshopDefense'

import { workshopHealthStatValue, workshopHealthStatDisplay } from './workshopHealth'
import {
  workshopHealthRegenStatValue,
  workshopHealthRegenStatDisplay,
} from './workshopHealthRegen'
import { workshopDisplayedHealthSubmoduleMultiplier } from './workshopDisplayedHealth'
import {
  workshopDefensePercentStatDisplay,
  workshopDefensePercentStatPercentPoints,
} from './workshopDefensePercent'
import {
  workshopDefenseAbsoluteStatDisplay,
  workshopDefenseAbsoluteStatValue,
} from './workshopDefenseAbsolute'
import {
  workshopThornDamageStatDisplay,
  workshopThornDamageStatPercentPoints,
} from './workshopThornDamage'
import {
  workshopLifestealStatDisplay,
  workshopLifestealStatPercentPoints,
} from './workshopLifesteal'
import {
  workshopKnockbackChanceStatDisplay,
  workshopKnockbackChanceStatPercentPoints,
} from './workshopKnockbackChance'
import {
  workshopKnockbackForceStatDisplay,
  workshopKnockbackForceStatMultiplier,
} from './workshopKnockbackForce'
import { workshopOrbSpeedStatDisplay, workshopOrbSpeedStatMultiplier } from './workshopOrbSpeed'
import { workshopOrbsStatDisplay, workshopOrbsStatCount } from './workshopOrbs'
import {
  workshopShockwaveSizeStatDisplay,
  workshopShockwaveSizeStatMultiplier,
} from './workshopShockwaveSize'
import {
  workshopShockwaveFrequencyStatDisplay,
  workshopShockwaveFrequencyStatSeconds,
} from './workshopShockwaveFrequency'
import {
  workshopLandMineChanceStatDisplay,
  workshopLandMineChanceStatPercentPoints,
} from './workshopLandMineChance'
import {
  workshopLandMineDamageStatDisplay,
  workshopLandMineDamageStatPercent,
} from './workshopLandMineDamage'
import {
  workshopLandMineRadiusStatDisplay,
  workshopLandMineRadiusStatValue,
} from './workshopLandMineRadius'
import {
  workshopDeathDefyStatDisplay,
  workshopDeathDefyStatPercent,
} from './workshopDeathDefy'
import {
  workshopWallHealthStatDisplay,
  workshopWallHealthStatPercent,
} from './workshopWallHealth'
import {
  workshopWallRebuildStatDisplay,
  workshopWallRebuildStatSeconds,
} from './workshopWallRebuild'

export type WorkshopDefenseFormulaOpts = WorkshopDefenseStatDisplayOpts

export type WorkshopDefenseFormulaEvaluationInput = {
  spec: WorkshopFormulaSpec
  operandValues: Record<string, number>
  plainDisplay: string
  definedAboveOneFields: Set<string>
}

function readOptsNumber(
  opts: WorkshopDefenseFormulaOpts | undefined,
  field: string,
  defaultValue: number,
): number {
  const raw = opts?.[field as keyof WorkshopDefenseFormulaOpts]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : defaultValue
}

function readSubmoduleNumber(
  opts: WorkshopDefenseFormulaOpts | undefined,
  field: string,
  defaultValue: number,
): number {
  const sub = opts?.submodule
  if (sub == null) return defaultValue
  const raw = sub[field as keyof typeof sub]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : defaultValue
}

function resolveDefenseOperand(
  ref: string,
  op: WorkshopFormulaOperand,
  opts: WorkshopDefenseFormulaOpts | undefined,
  baseValue: number,
): number {
  // Health card armor sub-module: convert Health Regen[%] points to its partial multiplier.
  if (ref === 'submodule' && op.field === 'healthRegenPercentBonus') {
    return workshopDisplayedHealthSubmoduleMultiplier(
      readSubmoduleNumber(opts, 'healthRegenPercentBonus', 0) || undefined,
    )
  }
  switch (op.kind) {
    case 'base':
      return baseValue
    case 'const':
      return op.value ?? op.default ?? 0
    case 'optsNumber':
      return readOptsNumber(opts, op.field ?? '', op.default ?? 0)
    case 'optsMultiplier':
      return readOptsNumber(opts, op.field ?? '', op.default ?? 1)
    case 'relicPercentToMultiplier': {
      const pct = readOptsNumber(opts, op.field ?? '', 0)
      return pct > 0 ? 1 + pct / 100 : 1
    }
    case 'relicMultiplierField':
      return readOptsNumber(opts, op.field ?? '', op.default ?? 1)
    case 'onePlusOptsFraction':
      return 1 + readOptsNumber(opts, op.field ?? '', 0)
    case 'submoduleNumber':
      return readSubmoduleNumber(opts, op.field ?? '', op.default ?? 0)
    default:
      return op.default ?? 0
  }
}

function plainDisplayForKey(
  key: WorkshopDefenseUpgradeKey,
  completedLevels: number,
): { plainDisplay: string; baseValue: number } {
  switch (key) {
    case 'healthLevel':
      return {
        plainDisplay: workshopHealthStatDisplay(completedLevels),
        baseValue: workshopHealthStatValue(completedLevels),
      }
    case 'healthRegenLevel':
      return {
        plainDisplay: workshopHealthRegenStatDisplay(completedLevels),
        baseValue: workshopHealthRegenStatValue(completedLevels),
      }
    case 'defensePercentLevel':
      return {
        plainDisplay: workshopDefensePercentStatDisplay(completedLevels),
        baseValue: workshopDefensePercentStatPercentPoints(completedLevels),
      }
    case 'defenseAbsoluteLevel':
      return {
        plainDisplay: workshopDefenseAbsoluteStatDisplay(completedLevels),
        baseValue: workshopDefenseAbsoluteStatValue(completedLevels),
      }
    case 'thornDamageLevel':
      return {
        plainDisplay: workshopThornDamageStatDisplay(completedLevels),
        baseValue: workshopThornDamageStatPercentPoints(completedLevels),
      }
    case 'lifestealLevel':
      return {
        plainDisplay: workshopLifestealStatDisplay(completedLevels),
        baseValue: workshopLifestealStatPercentPoints(completedLevels),
      }
    case 'knockbackChanceLevel':
      return {
        plainDisplay: workshopKnockbackChanceStatDisplay(completedLevels),
        baseValue: workshopKnockbackChanceStatPercentPoints(completedLevels),
      }
    case 'knockbackForceLevel':
      return {
        plainDisplay: workshopKnockbackForceStatDisplay(completedLevels),
        baseValue: workshopKnockbackForceStatMultiplier(completedLevels),
      }
    case 'orbSpeedLevel':
      return {
        plainDisplay: workshopOrbSpeedStatDisplay(completedLevels),
        baseValue: workshopOrbSpeedStatMultiplier(completedLevels),
      }
    case 'orbsLevel':
      return {
        plainDisplay: workshopOrbsStatDisplay(completedLevels),
        baseValue: workshopOrbsStatCount(completedLevels),
      }
    case 'shockwaveSizeLevel':
      return {
        plainDisplay: workshopShockwaveSizeStatDisplay(completedLevels),
        baseValue: workshopShockwaveSizeStatMultiplier(completedLevels),
      }
    case 'shockwaveFrequencyLevel':
      return {
        plainDisplay: workshopShockwaveFrequencyStatDisplay(completedLevels),
        baseValue: workshopShockwaveFrequencyStatSeconds(completedLevels),
      }
    case 'landMineChanceLevel':
      return {
        plainDisplay: workshopLandMineChanceStatDisplay(completedLevels),
        baseValue: workshopLandMineChanceStatPercentPoints(completedLevels),
      }
    case 'landMineDamageLevel':
      return {
        plainDisplay: workshopLandMineDamageStatDisplay(completedLevels),
        baseValue: workshopLandMineDamageStatPercent(completedLevels),
      }
    case 'landMineRadiusLevel':
      return {
        plainDisplay: workshopLandMineRadiusStatDisplay(completedLevels),
        baseValue: workshopLandMineRadiusStatValue(completedLevels),
      }
    case 'deathDefyLevel':
      return {
        plainDisplay: workshopDeathDefyStatDisplay(completedLevels),
        baseValue: workshopDeathDefyStatPercent(completedLevels),
      }
    case 'wallHealthLevel':
      return {
        plainDisplay: workshopWallHealthStatDisplay(completedLevels),
        baseValue: workshopWallHealthStatPercent(completedLevels),
      }
    case 'wallRebuildLevel':
      return {
        plainDisplay: workshopWallRebuildStatDisplay(completedLevels),
        baseValue: workshopWallRebuildStatSeconds(completedLevels),
      }
  }
}

/**
 * Health Regen and Defense Absolute show a `… ×m` multiplier preview at workshop level 0
 * (base value 0). That conditional suffix is not expressible in the numeric→format model,
 * so defer to the legacy display for those level-0 previews.
 */
function defersToLegacyAtBaseZero(
  key: WorkshopDefenseUpgradeKey,
  baseValue: number,
): boolean {
  return (
    baseValue === 0 &&
    (key === 'healthRegenLevel' || key === 'defenseAbsoluteLevel')
  )
}

export function buildWorkshopDefenseFormulaInput(
  key: WorkshopDefenseUpgradeKey,
  completedLevels: number,
  opts?: WorkshopDefenseFormulaOpts,
): WorkshopDefenseFormulaEvaluationInput | undefined {
  const spec = getWorkshopDefenseFormulaSpec(key)
  if (spec == null) return undefined

  const { plainDisplay, baseValue } = plainDisplayForKey(key, completedLevels)
  if (defersToLegacyAtBaseZero(key, baseValue)) return undefined

  const operandValues: Record<string, number> = {}
  const definedAboveOneFields = new Set<string>()

  for (const [ref, op] of Object.entries(spec.operands)) {
    operandValues[ref] = resolveDefenseOperand(ref, op, opts, baseValue)
    if (op.activeRule === 'definedAboveOne' && op.field) {
      const raw = opts?.[op.field as keyof WorkshopDefenseFormulaOpts]
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        definedAboveOneFields.add(op.field)
      }
    }
  }

  return { spec, operandValues, plainDisplay, definedAboveOneFields }
}

export function workshopDefenseFormulaStatDisplay(
  key: WorkshopDefenseUpgradeKey,
  completedLevels: number,
  opts?: WorkshopDefenseFormulaOpts,
): string | undefined {
  const input = buildWorkshopDefenseFormulaInput(key, completedLevels, opts)
  if (input == null) return undefined
  return evaluateWorkshopFormula(
    input.spec,
    input.operandValues,
    input.plainDisplay,
    input.definedAboveOneFields,
  )
}

/**
 * Attack workshop formula operand resolution and display entry.
 */

import { workshopAttackRangeMeters, workshopAttackRangeStatDisplay } from './workshopAttackRange'
import { workshopAttackSpeedStatValue, workshopAttackSpeedStatDisplay } from './workshopAttackSpeed'
import { workshopBounceShotChancePercent, workshopBounceShotChanceStatDisplay } from './workshopBounceShotChance'
import { workshopBounceShotRangeMeters, workshopBounceShotRangeStatDisplay } from './workshopBounceShotRange'
import { workshopBounceShotTargetsCount, workshopBounceShotTargetsStatDisplay } from './workshopBounceShotTargets'
import { workshopCriticalChancePercent, workshopCriticalChanceStatDisplay } from './workshopCriticalChance'
import {
  workshopCriticalFactorStatDisplay,
  workshopCriticalFactorStatValue,
} from './workshopCriticalFactor'
import { workshopDamageStatAtLevel, workshopDamageStatDisplay } from './workshopDamage'
import {
  WORKSHOP_DAMAGE_PER_METER_LAB_EXCESS_FRACTION,
  workshopDamagePerMeterResearchLabDisplayAdd,
  workshopDamagePerMeterStatDisplay,
  workshopDamagePerMeterStatMultiplier,
} from './workshopDamagePerMeter'
import { workshopDisplayedDamagePerkMultiplier } from './workshopDisplayedDamage'
import type { WorkshopDamageDisplayOpts } from './workshopDisplayedDamage'
import type { WorkshopAttackSpeedDisplayOpts } from './workshopDisplayedAttackSpeed'
import { workshopDisplayedRendArmorChanceEnhancementMultiplier } from './workshopRendArmor'
import { evaluateWorkshopFormula } from './workshopFormulaEval'
import { getWorkshopAttackFormulaSpec } from './workshopFormulaTables'
import type { WorkshopFormulaOperand, WorkshopFormulaSpec } from './workshopFormulaTypes'
import type { WorkshopAttackLabDisplayOpts } from './workshopLabDisplayOpts'
import { workshopMultishotChancePercent, workshopMultishotChanceStatDisplay } from './workshopMultishotChance'
import { workshopMultishotTargetsCount, workshopMultishotTargetsStatDisplay } from './workshopMultishotTargets'
import {
  workshopRapidFireChancePercent,
  workshopRapidFireChanceStatDisplay,
  workshopRapidFireDurationSeconds,
  workshopRapidFireDurationStatDisplay,
} from './workshopRapidFire'
import {
  workshopRendArmorChancePercent,
  workshopRendArmorChanceStatDisplay,
  workshopRendArmorMultStatDisplay,
  workshopRendArmorMultValue,
} from './workshopRendArmor'
import { workshopSuperCritChancePercent, workshopSuperCritChanceStatDisplay } from './workshopSuperCritChance'
import {
  workshopSuperCritMultStatDisplay,
  workshopSuperCritMultValue,
} from './workshopSuperCritMult'

export type WorkshopAttackUpgradeKey =
  | 'damageLevel'
  | 'attackSpeedLevel'
  | 'critChanceLevel'
  | 'critFactorLevel'
  | 'attackRangeLevel'
  | 'damagePerMeterLevel'
  | 'multishotChanceLevel'
  | 'multishotTargetsLevel'
  | 'rapidFireChanceLevel'
  | 'rapidFireDurationLevel'
  | 'bounceShotChanceLevel'
  | 'bounceShotTargetsLevel'
  | 'bounceShotRangeLevel'
  | 'superCritChanceLevel'
  | 'superCritMultLevel'
  | 'rendArmorChanceLevel'
  | 'rendArmorMultLevel'

/** Superset of attack display operands for formula evaluation. */
export type WorkshopAttackFormulaOpts = WorkshopAttackLabDisplayOpts &
  WorkshopAttackSpeedDisplayOpts &
  WorkshopDamageDisplayOpts & {
    /** Pre-resolved half-rate enhancement for rend armor chance. */
    rendArmorChanceEnhancementMultiplier?: number
    /** Pre-resolved tier-400 enhancement for crit factor. */
    critFactorEnhancementMultiplier?: number
    /** Pre-resolved tier-400 enhancement for super crit mult. */
    superCritMultEnhancementMultiplier?: number
    /** Pre-resolved tier-400 enhancement for rend armor mult. */
    rendArmorMultEnhancementMultiplier?: number
    /** Submodule seconds add for rapid fire duration. */
    rapidFireDurationSubmoduleSeconds?: number
    /** Submodule meters add for bounce shot range. */
    bounceShotRangeSubmoduleMeters?: number
    /** Submodule count add for multishot/bounce targets. */
    multishotTargetsExtra?: number
    bounceShotTargetsExtra?: number
  }

export type WorkshopAttackFormulaEvaluationInput = {
  spec: WorkshopFormulaSpec
  operandValues: Record<string, number>
  plainDisplay: string
  definedAboveOneFields: Set<string>
}

function attackSub(opts: WorkshopAttackFormulaOpts | undefined) {
  return opts?.submodule ?? {}
}

function readOptsNumber(
  opts: WorkshopAttackFormulaOpts | undefined,
  field: string,
  defaultValue: number,
): number {
  const raw = opts?.[field as keyof WorkshopAttackFormulaOpts]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : defaultValue
}

function readSubmoduleNumber(
  opts: WorkshopAttackFormulaOpts | undefined,
  field: string,
  defaultValue: number,
): number {
  const sub = attackSub(opts)
  const raw = sub[field as keyof typeof sub]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : defaultValue
}

function resolveOperand(
  _ref: string,
  op: WorkshopFormulaOperand,
  opts: WorkshopAttackFormulaOpts | undefined,
  baseValue: number,
): number {
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
    case 'onePlusRelicFraction':
      return 1 + (opts?.relicsBonus ?? 0)
    case 'submoduleNumber':
      return readSubmoduleNumber(opts, op.field ?? '', op.default ?? 0)
    case 'perkMultiplier':
      return opts != null ? workshopDisplayedDamagePerkMultiplier(opts) : 1
    case 'berserkerAdd':
      return opts?.berserkerDamageAdd ?? 0
    case 'enhanceHalfRate':
      return opts?.rendArmorChanceEnhancementMultiplier ?? 1
    case 'damagePerMeterLabExcess':
      return workshopDamagePerMeterResearchLabDisplayAdd(opts?.damagePerMeterLabMultiplier)
    default:
      return op.default ?? 0
  }
}

function plainDisplayForKey(
  key: WorkshopAttackUpgradeKey,
  completedLevels: number,
): { plainDisplay: string; baseValue: number } {
  switch (key) {
    case 'damageLevel':
      return {
        plainDisplay: workshopDamageStatDisplay(completedLevels),
        baseValue: workshopDamageStatAtLevel(completedLevels),
      }
    case 'attackSpeedLevel':
      return {
        plainDisplay: workshopAttackSpeedStatDisplay(completedLevels),
        baseValue: workshopAttackSpeedStatValue(completedLevels),
      }
    case 'critChanceLevel':
      return {
        plainDisplay: workshopCriticalChanceStatDisplay(completedLevels),
        baseValue: workshopCriticalChancePercent(completedLevels),
      }
    case 'critFactorLevel':
      return {
        plainDisplay: workshopCriticalFactorStatDisplay(completedLevels),
        baseValue: workshopCriticalFactorStatValue(completedLevels),
      }
    case 'attackRangeLevel':
      return {
        plainDisplay: workshopAttackRangeStatDisplay(completedLevels),
        baseValue: workshopAttackRangeMeters(completedLevels),
      }
    case 'damagePerMeterLevel':
      return {
        plainDisplay: workshopDamagePerMeterStatDisplay(completedLevels),
        baseValue: workshopDamagePerMeterStatMultiplier(completedLevels),
      }
    case 'multishotChanceLevel':
      return {
        plainDisplay: workshopMultishotChanceStatDisplay(completedLevels),
        baseValue: workshopMultishotChancePercent(completedLevels),
      }
    case 'multishotTargetsLevel':
      return {
        plainDisplay: workshopMultishotTargetsStatDisplay(completedLevels),
        baseValue: workshopMultishotTargetsCount(completedLevels),
      }
    case 'rapidFireChanceLevel':
      return {
        plainDisplay: workshopRapidFireChanceStatDisplay(completedLevels),
        baseValue: workshopRapidFireChancePercent(completedLevels),
      }
    case 'rapidFireDurationLevel':
      return {
        plainDisplay: workshopRapidFireDurationStatDisplay(completedLevels),
        baseValue: workshopRapidFireDurationSeconds(completedLevels),
      }
    case 'bounceShotChanceLevel':
      return {
        plainDisplay: workshopBounceShotChanceStatDisplay(completedLevels),
        baseValue: workshopBounceShotChancePercent(completedLevels),
      }
    case 'bounceShotTargetsLevel':
      return {
        plainDisplay: workshopBounceShotTargetsStatDisplay(completedLevels),
        baseValue: workshopBounceShotTargetsCount(completedLevels),
      }
    case 'bounceShotRangeLevel':
      return {
        plainDisplay: workshopBounceShotRangeStatDisplay(completedLevels),
        baseValue: workshopBounceShotRangeMeters(completedLevels),
      }
    case 'superCritChanceLevel':
      return {
        plainDisplay: workshopSuperCritChanceStatDisplay(completedLevels),
        baseValue: workshopSuperCritChancePercent(completedLevels),
      }
    case 'superCritMultLevel':
      return {
        plainDisplay: workshopSuperCritMultStatDisplay(completedLevels),
        baseValue: workshopSuperCritMultValue(completedLevels),
      }
    case 'rendArmorChanceLevel':
      return {
        plainDisplay: workshopRendArmorChanceStatDisplay(completedLevels),
        baseValue: workshopRendArmorChancePercent(completedLevels),
      }
    case 'rendArmorMultLevel':
      return {
        plainDisplay: workshopRendArmorMultStatDisplay(completedLevels),
        baseValue: workshopRendArmorMultValue(completedLevels),
      }
  }
}

/** Resolve rend-armor-mult submodule percent points to a fractional add. */
function resolveAttackOperand(
  ref: string,
  op: WorkshopFormulaOperand,
  opts: WorkshopAttackFormulaOpts | undefined,
  baseValue: number,
): number {
  if (ref === 'sub' && op.field === 'rendArmorMultAdd') {
    return readSubmoduleNumber(opts, 'rendArmorMultAdd', 0) / 100
  }
  if (ref === 'sub' && op.field === 'rapidFireDurationSeconds') {
    return opts?.rapidFireDurationSubmoduleSeconds ?? readSubmoduleNumber(opts, 'rapidFireDurationSeconds', 0)
  }
  if (ref === 'sub' && op.field === 'bounceShotRangeMeters') {
    return opts?.bounceShotRangeSubmoduleMeters ?? readSubmoduleNumber(opts, 'bounceShotRangeMeters', 0)
  }
  if (ref === 'labPts' && op.field === 'multishotTargetsCount') {
    return opts?.multishotTargetsExtra ?? readSubmoduleNumber(opts, 'multishotTargetsCount', 0)
  }
  if (ref === 'labPts' && op.field === 'bounceShotTargetsCount') {
    return opts?.bounceShotTargetsExtra ?? readSubmoduleNumber(opts, 'bounceShotTargetsCount', 0)
  }
  if (ref === 'enhance' && op.field === 'critFactorEnhancement') {
    return opts?.critFactorEnhancementMultiplier ?? 1
  }
  if (ref === 'enhance' && op.field === 'superCritMultEnhancement') {
    return opts?.superCritMultEnhancementMultiplier ?? 1
  }
  if (ref === 'enhance' && op.field === 'rendArmorMultEnhancement') {
    return opts?.rendArmorMultEnhancementMultiplier ?? 1
  }
  if (ref === 'chassisMult') {
    return opts?.chassisTowerDamageMultiplier ?? 1
  }
  if (ref === 'cannonMult') {
    return 1 + (opts?.cannonModulePercent ?? 0)
  }
  if (ref === 'labAdd' && op.kind === 'damagePerMeterLabExcess') {
    return workshopDamagePerMeterResearchLabDisplayAdd(opts?.damagePerMeterLabMultiplier)
  }
  return resolveOperand(ref, op, opts, baseValue)
}

export function buildWorkshopAttackFormulaInput(
  key: WorkshopAttackUpgradeKey,
  completedLevels: number,
  opts?: WorkshopAttackFormulaOpts,
): WorkshopAttackFormulaEvaluationInput | undefined {
  const spec = getWorkshopAttackFormulaSpec(key)
  if (spec == null) return undefined

  const { plainDisplay, baseValue } = plainDisplayForKey(key, completedLevels)
  const operandValues: Record<string, number> = {}
  const definedAboveOneFields = new Set<string>()

  for (const [ref, op] of Object.entries(spec.operands)) {
    operandValues[ref] = resolveAttackOperand(ref, op, opts, baseValue)
    if (op.activeRule === 'definedAboveOne' && op.field) {
      const raw = opts?.[op.field as keyof WorkshopAttackFormulaOpts]
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        definedAboveOneFields.add(op.field)
      }
    }
  }

  return { spec, operandValues, plainDisplay, definedAboveOneFields }
}

export function workshopAttackFormulaStatDisplay(
  key: WorkshopAttackUpgradeKey,
  completedLevels: number,
  opts?: WorkshopAttackFormulaOpts,
): string | undefined {
  const input = buildWorkshopAttackFormulaInput(key, completedLevels, opts)
  if (input == null) return undefined
  return evaluateWorkshopFormula(
    input.spec,
    input.operandValues,
    input.plainDisplay,
    input.definedAboveOneFields,
  )
}

/** Legacy display parity helpers (pre-formula implementations). */
export function workshopAttackLegacyStatDisplay(
  key: WorkshopAttackUpgradeKey,
  completedLevels: number,
  opts?: WorkshopAttackFormulaOpts,
): string {
  switch (key) {
    case 'damageLevel':
      return workshopDamageStatDisplay(completedLevels, opts)
    case 'attackSpeedLevel':
      return workshopAttackSpeedStatDisplay(completedLevels, opts)
    case 'critChanceLevel':
      return workshopCriticalChanceStatDisplay(
        completedLevels,
        opts?.criticalChanceCardPercentPoints ?? 0,
      )
    case 'critFactorLevel':
      return workshopCriticalFactorStatDisplay(
        completedLevels,
        opts?.criticalFactorLabMultiplier,
        opts?.submodule?.critFactorAdd ?? 0,
        opts?.critFactorEnhancementMultiplier ?? 1,
        opts?.criticalFactorRelicMultiplier ?? 1,
      )
    case 'attackRangeLevel':
      return workshopAttackRangeStatDisplay(
        completedLevels,
        opts?.attackRangeLabMultiplier,
        opts?.submodule?.attackRangeMetersAdd ?? 0,
      )
    case 'damagePerMeterLevel':
      return workshopDamagePerMeterStatDisplay(completedLevels, opts?.damagePerMeterLabMultiplier)
    case 'multishotChanceLevel':
      return workshopMultishotChanceStatDisplay(
        completedLevels,
        opts?.submodule?.multishotChancePercentPoints ?? 0,
      )
    case 'multishotTargetsLevel':
      return workshopMultishotTargetsStatDisplay(
        completedLevels,
        opts?.multishotTargetsExtra ?? opts?.submodule?.multishotTargetsCount ?? 0,
      )
    case 'rapidFireChanceLevel':
      return workshopRapidFireChanceStatDisplay(
        completedLevels,
        opts?.submodule?.rapidFireChancePercentPoints ?? 0,
      )
    case 'rapidFireDurationLevel':
      return workshopRapidFireDurationStatDisplay(
        completedLevels,
        opts?.rapidFireDurationSubmoduleSeconds ?? opts?.submodule?.rapidFireDurationSeconds ?? 0,
      )
    case 'bounceShotChanceLevel':
      return workshopBounceShotChanceStatDisplay(
        completedLevels,
        opts?.submodule?.bounceShotChancePercentPoints ?? 0,
      )
    case 'bounceShotTargetsLevel':
      return workshopBounceShotTargetsStatDisplay(
        completedLevels,
        opts?.bounceShotTargetsExtra ?? opts?.submodule?.bounceShotTargetsCount ?? 0,
      )
    case 'bounceShotRangeLevel':
      return workshopBounceShotRangeStatDisplay(
        completedLevels,
        opts?.bounceShotRangeSubmoduleMeters ?? opts?.submodule?.bounceShotRangeMeters ?? 0,
      )
    case 'superCritChanceLevel':
      return workshopSuperCritChanceStatDisplay(
        completedLevels,
        opts?.superCritChanceLabPercentPoints,
      )
    case 'superCritMultLevel':
      return workshopSuperCritMultStatDisplay(
        completedLevels,
        opts?.superCritMultLabMultiplier,
        opts?.submodule?.superCritMultAdd ?? 0,
        opts?.superCritMultRelicMultiplier ?? 1,
        opts?.superCritMultEnhancementMultiplier ?? 1,
      )
    case 'rendArmorChanceLevel':
      return workshopRendArmorChanceStatDisplay(
        completedLevels,
        opts?.submodule?.rendArmorChancePercentPoints ?? 0,
        opts?.rendArmorChanceEnhancementMultiplier ?? 1,
      )
    case 'rendArmorMultLevel':
      return workshopRendArmorMultStatDisplay(
        completedLevels,
        opts?.rendArmorMultLabMultiplier,
        opts?.submodule?.rendArmorMultAdd ?? 0,
        opts?.rendArmorMultEnhancementMultiplier ?? 1,
        opts?.rendArmorMultRelicMultiplier ?? 1,
      )
  }
}

export { WORKSHOP_DAMAGE_PER_METER_LAB_EXCESS_FRACTION, workshopDisplayedRendArmorChanceEnhancementMultiplier }

import { workshopCashBonusStatDisplay, workshopCashBonusStatMultiplier } from './workshopCashBonus'
import { workshopCashPerWaveStatAmount, workshopCashPerWaveStatDisplay } from './workshopCashPerWave'
import { workshopCoinsKillBonusStatDisplay, workshopCoinsKillBonusStatMultiplier } from './workshopCoinsKillBonus'
import { workshopCoinsWaveStatAmount, workshopCoinsWaveStatDisplay } from './workshopCoinsWave'
import {
  workshopEnemyAttackLevelSkipStatDisplay,
  workshopEnemyAttackLevelSkipStatPercent,
} from './workshopEnemyAttackLevelSkip'
import {
  workshopEnemyHealthLevelSkipStatDisplay,
  workshopEnemyHealthLevelSkipStatPercent,
} from './workshopEnemyHealthLevelSkip'
import { workshopFreeUpgradesEnhancementMultiplier } from './workshopEnhanceFreeUpgrades'
import {
  workshopFreeAttackUpgradeStatDisplay,
  workshopFreeAttackUpgradeStatPercentPoints,
} from './workshopFreeAttackUpgrade'
import {
  workshopFreeDefenseUpgradeStatDisplay,
  workshopFreeDefenseUpgradeStatPercentPoints,
} from './workshopFreeDefenseUpgrade'
import {
  workshopFreeUtilityUpgradeStatDisplay,
  workshopFreeUtilityUpgradeStatPercentPoints,
} from './workshopFreeUtilityUpgrade'
import { evaluateWorkshopFormula } from './workshopFormulaEval'
import type { WorkshopFormulaOperand, WorkshopFormulaSpec } from './workshopFormulaTypes'
import { getWorkshopFormulaSpec } from './workshopFormulaTables'
import { workshopInterestPerWaveStatDisplay, workshopInterestPerWaveStatPercentPoints } from './workshopInterestPerWave'
import type { WorkshopUtilityLabDisplayOpts } from './workshopLabDisplayOpts'
import { workshopMaxRecoveryStatDisplay, workshopMaxRecoveryStatMultiplier } from './workshopMaxRecovery'
import { workshopPackageChanceStatDisplay, workshopPackageChanceStatPercent } from './workshopPackageChance'
import { workshopRecoveryAmountStatDisplay, workshopRecoveryAmountStatPercent } from './workshopRecoveryAmount'
import type { WorkshopUtilityUpgradeKey } from './workshopUtility'
import type { WorkshopUtilitySubmoduleExtras } from './workshopSubmoduleBonuses'

export type WorkshopFormulaEvaluationInput = {
  spec: WorkshopFormulaSpec
  operandValues: Record<string, number>
  plainDisplay: string
  definedAboveOneFields: Set<string>
}

function utilitySub(opts: WorkshopUtilityLabDisplayOpts | undefined): WorkshopUtilitySubmoduleExtras {
  return opts?.submodule ?? {}
}

function readOptsNumber(
  opts: WorkshopUtilityLabDisplayOpts | undefined,
  field: string,
  defaultValue: number,
): number {
  const raw = opts?.[field as keyof WorkshopUtilityLabDisplayOpts]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : defaultValue
}

function readSubmoduleNumber(
  opts: WorkshopUtilityLabDisplayOpts | undefined,
  field: string,
  defaultValue: number,
): number {
  const sub = utilitySub(opts)
  const raw = sub[field as keyof WorkshopUtilitySubmoduleExtras]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : defaultValue
}

function resolveOperand(
  _ref: string,
  op: WorkshopFormulaOperand,
  opts: WorkshopUtilityLabDisplayOpts | undefined,
  baseValue: number,
): number {
  switch (op.kind) {
    case 'base':
      return baseValue
    case 'optsNumber':
      return readOptsNumber(opts, op.field ?? '', op.default ?? 0)
    case 'optsMultiplier':
      return readOptsNumber(opts, op.field ?? '', op.default ?? 1)
    case 'relicPercentToMultiplier': {
      const pct = readOptsNumber(opts, op.field ?? '', 0)
      return pct > 0 ? 1 + pct / 100 : 1
    }
    case 'freeUpgradesEnhancement':
      return workshopFreeUpgradesEnhancementMultiplier(
        opts?.enhanceFreeUpgradesLevel ?? 0,
        opts?.workshopEnhancementsLabUnlocked ?? false,
      )
    case 'submoduleNumber':
      return readSubmoduleNumber(opts, op.field ?? '', op.default ?? 0)
    default:
      return op.default ?? 0
  }
}

function plainDisplayForKey(
  key: WorkshopUtilityUpgradeKey,
  completedLevels: number,
): { plainDisplay: string; baseValue: number } {
  switch (key) {
    case 'cashBonusLevel':
      return {
        plainDisplay: workshopCashBonusStatDisplay(completedLevels),
        baseValue: workshopCashBonusStatMultiplier(completedLevels),
      }
    case 'coinsKillBonusLevel':
      return {
        plainDisplay: workshopCoinsKillBonusStatDisplay(completedLevels),
        baseValue: workshopCoinsKillBonusStatMultiplier(completedLevels),
      }
    case 'interestPerWaveLevel':
      return {
        plainDisplay: workshopInterestPerWaveStatDisplay(completedLevels),
        baseValue: workshopInterestPerWaveStatPercentPoints(completedLevels),
      }
    case 'recoveryAmountLevel':
      return {
        plainDisplay: workshopRecoveryAmountStatDisplay(completedLevels),
        baseValue: workshopRecoveryAmountStatPercent(completedLevels),
      }
    case 'freeAttackUpgradeLevel':
      return {
        plainDisplay: workshopFreeAttackUpgradeStatDisplay(completedLevels),
        baseValue: workshopFreeAttackUpgradeStatPercentPoints(completedLevels),
      }
    case 'freeDefenseUpgradeLevel':
      return {
        plainDisplay: workshopFreeDefenseUpgradeStatDisplay(completedLevels),
        baseValue: workshopFreeDefenseUpgradeStatPercentPoints(completedLevels),
      }
    case 'freeUtilityUpgradeLevel':
      return {
        plainDisplay: workshopFreeUtilityUpgradeStatDisplay(completedLevels),
        baseValue: workshopFreeUtilityUpgradeStatPercentPoints(completedLevels),
      }
    case 'cashPerWaveLevel':
      return {
        plainDisplay: workshopCashPerWaveStatDisplay(completedLevels),
        baseValue: workshopCashPerWaveStatAmount(completedLevels),
      }
    case 'coinsWaveLevel':
      return {
        plainDisplay: workshopCoinsWaveStatDisplay(completedLevels),
        baseValue: workshopCoinsWaveStatAmount(completedLevels),
      }
    case 'maxRecoveryLevel':
      return {
        plainDisplay: workshopMaxRecoveryStatDisplay(completedLevels),
        baseValue: workshopMaxRecoveryStatMultiplier(completedLevels),
      }
    case 'packageChanceLevel':
      return {
        plainDisplay: workshopPackageChanceStatDisplay(completedLevels),
        baseValue: workshopPackageChanceStatPercent(completedLevels),
      }
    case 'enemyAttackLevelSkipLevel':
      return {
        plainDisplay: workshopEnemyAttackLevelSkipStatDisplay(completedLevels),
        baseValue: workshopEnemyAttackLevelSkipStatPercent(completedLevels),
      }
    case 'enemyHealthLevelSkipLevel':
      return {
        plainDisplay: workshopEnemyHealthLevelSkipStatDisplay(completedLevels),
        baseValue: workshopEnemyHealthLevelSkipStatPercent(completedLevels),
      }
    default:
      throw new Error(`No formula plain display for ${key}`)
  }
}

export function buildWorkshopFormulaEvaluationInput(
  key: WorkshopUtilityUpgradeKey,
  completedLevels: number,
  opts?: WorkshopUtilityLabDisplayOpts,
): WorkshopFormulaEvaluationInput | undefined {
  const spec = getWorkshopFormulaSpec(key)
  if (spec == null || spec.category !== 'utility') return undefined

  const { plainDisplay, baseValue } = plainDisplayForKey(key, completedLevels)
  const operandValues: Record<string, number> = {}
  const definedAboveOneFields = new Set<string>()

  for (const [ref, op] of Object.entries(spec.operands)) {
    operandValues[ref] = resolveOperand(ref, op, opts, baseValue)
    if (op.activeRule === 'definedAboveOne' && op.field) {
      const raw = opts?.[op.field as keyof WorkshopUtilityLabDisplayOpts]
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        definedAboveOneFields.add(op.field)
      }
    }
  }

  return { spec, operandValues, plainDisplay, definedAboveOneFields }
}

export function workshopUtilityFormulaStatDisplay(
  key: WorkshopUtilityUpgradeKey,
  completedLevels: number,
  opts?: WorkshopUtilityLabDisplayOpts,
): string | undefined {
  const input = buildWorkshopFormulaEvaluationInput(key, completedLevels, opts)
  if (input == null) return undefined
  return evaluateWorkshopFormula(
    input.spec,
    input.operandValues,
    input.plainDisplay,
    input.definedAboveOneFields,
  )
}

import { describe, expect, it } from 'vitest'
import {
  evaluateWorkshopFormula,
  evaluateWorkshopFormulaNumeric,
  formatWorkshopFormulaValue,
  workshopFormulaHasActiveBonuses,
} from './workshopFormulaEval'
import { buildWorkshopFormulaEvaluationInput } from './workshopFormulaContext'
import { getWorkshopFormulaSpec } from './workshopFormulaTables'

describe('workshopFormulaEval', () => {
  const recovery = getWorkshopFormulaSpec('recoveryAmountLevel')!

  it('formats percent and multiplier styles', () => {
    expect(formatWorkshopFormulaValue(220.86, 'percent2')).toBe('220.86%')
    expect(formatWorkshopFormulaValue(6.71, 'multiplierX2')).toBe('x6.71')
    expect(formatWorkshopFormulaValue(228.4, 'integerRound')).toBe('228')
  })

  it('evaluates recovery amount numeric pipeline', () => {
    const values = { base: 134, labPts: 2, enhanceMult: 1.4, relicMult: 1.16 }
    expect(evaluateWorkshopFormulaNumeric(recovery, values)).toBeCloseTo(220.864, 3)
    expect(
      evaluateWorkshopFormula(recovery, values, '134.00%', new Set()),
    ).toBe('220.86%')
  })

  it('falls back to plain display when no active bonuses', () => {
    const values = { base: 134, labPts: 0, enhanceMult: 1, relicMult: 1 }
    expect(workshopFormulaHasActiveBonuses(recovery, values)).toBe(false)
    expect(evaluateWorkshopFormula(recovery, values, '134.00%')).toBe('134.00%')
  })

  it('respects definedAboveOne for cash bonus lab multiplier', () => {
    const cash = getWorkshopFormulaSpec('cashBonusLevel')!
    const values = { base: 2.49, labMult: 1.925, enhanceMult: 1 }
    expect(
      workshopFormulaHasActiveBonuses(cash, values, new Set(['cashBonusLabMultiplier'])),
    ).toBe(true)
    expect(
      evaluateWorkshopFormula(cash, values, 'x2.49', new Set(['cashBonusLabMultiplier'])),
    ).toBe('x4.79')
  })
})

describe('buildWorkshopFormulaEvaluationInput', () => {
  it('matches free attack calibration from unit tests', () => {
    const input = buildWorkshopFormulaEvaluationInput('freeAttackUpgradeLevel', 99, {
      freeUpgradesCardPercentPoints: 10,
      freeAttackUpgradeRelicPercentPoints: 6,
      submodule: { freeAttackUpgradePercentPoints: 6 },
      enhanceFreeUpgradesLevel: 10,
      workshopEnhancementsLabUnlocked: true,
    })
    expect(input).toBeDefined()
    expect(
      evaluateWorkshopFormula(
        input!.spec,
        input!.operandValues,
        input!.plainDisplay,
        input!.definedAboveOneFields,
      ),
    ).toBe('76.37%')
  })
})

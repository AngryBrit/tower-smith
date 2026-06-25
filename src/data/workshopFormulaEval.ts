import type {
  WorkshopFormulaFormat,
  WorkshopFormulaOperandActiveRule,
  WorkshopFormulaSpec,
} from './workshopFormulaTypes'

const EPS = 1e-9

export function formatWorkshopFormulaValue(value: number, format: WorkshopFormulaFormat): string {
  switch (format) {
    case 'percent2':
      return `${value.toFixed(2)}%`
    case 'multiplierX2':
      return `x${value.toFixed(2)}`
    case 'integerRound':
      return String(Math.round(value))
  }
}

function isOperandActive(value: number, rule: WorkshopFormulaOperandActiveRule | undefined): boolean {
  if (rule === undefined) return false
  switch (rule) {
    case 'multiplierAboveOne':
      return Number.isFinite(value) && value > 1 + EPS
    case 'positive':
      return Number.isFinite(value) && value > EPS
    case 'definedAboveOne':
      return Number.isFinite(value) && value > 1 + EPS
  }
}

/** True when any operand marked with `activeRule` is non-default. */
export function workshopFormulaHasActiveBonuses(
  spec: WorkshopFormulaSpec,
  operandValues: Readonly<Record<string, number>>,
  definedAboveOneFields?: ReadonlySet<string>,
): boolean {
  for (const [ref, op] of Object.entries(spec.operands)) {
    if (!op.activeRule) continue
    const value = operandValues[ref] ?? op.default ?? 0
    if (op.activeRule === 'definedAboveOne') {
      if (definedAboveOneFields?.has(op.field ?? '') && isOperandActive(value, op.activeRule)) {
        return true
      }
      continue
    }
    if (isOperandActive(value, op.activeRule)) return true
  }
  return false
}

export function evaluateWorkshopFormulaNumeric(
  spec: WorkshopFormulaSpec,
  operandValues: Readonly<Record<string, number>>,
): number {
  let sum = 0
  for (const ref of spec.additiveTerms) {
    sum += operandValues[ref] ?? spec.operands[ref]?.default ?? 0
  }
  let product = 1
  for (const ref of spec.multiplicativeFactors) {
    product *= operandValues[ref] ?? spec.operands[ref]?.default ?? 1
  }
  const value = sum * product
  if (typeof spec.clampMax === 'number' && value > spec.clampMax) return spec.clampMax
  return value
}

export function evaluateWorkshopFormula(
  spec: WorkshopFormulaSpec,
  operandValues: Readonly<Record<string, number>>,
  plainDisplay: string,
  definedAboveOneFields?: ReadonlySet<string>,
): string {
  if (
    !workshopFormulaHasActiveBonuses(spec, operandValues, definedAboveOneFields)
  ) {
    return plainDisplay
  }
  return formatWorkshopFormulaValue(
    evaluateWorkshopFormulaNumeric(spec, operandValues),
    spec.format,
  )
}

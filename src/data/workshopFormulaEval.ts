import { formatCoinAbbrev } from '../labCosts'
import type {
  WorkshopFormulaFormat,
  WorkshopFormulaOperandActiveRule,
  WorkshopFormulaSpec,
  WorkshopFormulaStep,
} from './workshopFormulaTypes'

const EPS = 1e-9

function operandDefault(spec: WorkshopFormulaSpec, ref: string, forMul: boolean): number {
  const op = spec.operands[ref]
  if (forMul) return op?.default ?? 1
  return op?.default ?? 0
}

function resolveRef(
  spec: WorkshopFormulaSpec,
  ref: string,
  operandValues: Readonly<Record<string, number>>,
  forMul: boolean,
): number {
  return operandValues[ref] ?? operandDefault(spec, ref, forMul)
}

function productRefs(
  spec: WorkshopFormulaSpec,
  refs: string[],
  operandValues: Readonly<Record<string, number>>,
): number {
  let p = 1
  for (const ref of refs) {
    p *= resolveRef(spec, ref, operandValues, true)
  }
  return p
}

function sumRefs(
  spec: WorkshopFormulaSpec,
  refs: string[],
  operandValues: Readonly<Record<string, number>>,
): number {
  let s = 0
  for (const ref of refs) {
    s += resolveRef(spec, ref, operandValues, false)
  }
  return s
}

function truncateTo(value: number, decimals: number): number {
  const scale = 10 ** decimals
  return Math.floor(value * scale + EPS) / scale
}

function roundTo(value: number, decimals: number): number {
  const scale = 10 ** decimals
  return Math.round(value * scale) / scale
}

function evaluatePipelineStep(
  spec: WorkshopFormulaSpec,
  step: WorkshopFormulaStep,
  acc: number | undefined,
  operandValues: Readonly<Record<string, number>>,
): number {
  switch (step.op) {
    case 'add': {
      const delta = sumRefs(spec, step.refs, operandValues)
      return acc === undefined ? delta : acc + delta
    }
    case 'mul': {
      const factor = productRefs(spec, step.refs, operandValues)
      return acc === undefined ? factor : acc * factor
    }
    case 'truncateTo':
      return truncateTo(acc ?? 0, step.decimals)
    case 'roundTo':
      return roundTo(acc ?? 0, step.decimals)
    case 'clampMax':
      return Math.min(acc ?? 0, step.value)
  }
}

export function evaluateWorkshopFormulaPipeline(
  spec: WorkshopFormulaSpec,
  operandValues: Readonly<Record<string, number>>,
): number {
  if (!spec.pipeline?.length) {
    throw new Error(`Formula ${spec.workshopKey} has no pipeline`)
  }
  let acc: number | undefined
  for (const step of spec.pipeline) {
    acc = evaluatePipelineStep(spec, step, acc, operandValues)
  }
  return acc ?? 0
}

export function formatWorkshopFormulaValue(value: number, format: WorkshopFormulaFormat): string {
  switch (format) {
    case 'percent2':
      return `${value.toFixed(2)}%`
    case 'multiplierX2':
      return `x${value.toFixed(2)}`
    case 'multiplierTimes2':
      return `×${value.toFixed(2)}`
    case 'multiplierTimes3':
      return `×${value.toFixed(3)}`
    case 'integerRound':
      return String(Math.round(value))
    case 'decimal2':
      return value.toFixed(2)
    case 'rangeMeters':
      return `${value.toFixed(2)}M`
    case 'metersLower':
      return `${value.toFixed(2)}m`
    case 'seconds2':
      return `${value.toFixed(2)} sec`
    case 'perMeterTrim': {
      if (Math.abs(value - 1) < EPS) return 'x1.000 / m'
      const s = value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
      return `x${s} / m`
    }
    case 'coinAbbrev':
      return formatCoinAbbrev(value)
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
  if (spec.pipeline?.length) {
    return evaluateWorkshopFormulaPipeline(spec, operandValues)
  }
  let sum = 0
  for (const ref of spec.additiveTerms ?? []) {
    sum += operandValues[ref] ?? spec.operands[ref]?.default ?? 0
  }
  let product = 1
  for (const ref of spec.multiplicativeFactors ?? []) {
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

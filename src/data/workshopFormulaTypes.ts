/**
 * GOD workshop display-card formula specs (`tables/workshop/formulas/`).
 * Sum additive terms, then multiply factors; format for UI.
 */

export type WorkshopFormulaFormat = 'percent2' | 'multiplierX2' | 'integerRound'

export type WorkshopFormulaOperandActiveRule =
  | 'multiplierAboveOne'
  | 'positive'
  | 'definedAboveOne'

export type WorkshopFormulaOperandKind =
  | 'base'
  | 'optsNumber'
  | 'optsMultiplier'
  | 'relicPercentToMultiplier'
  | 'freeUpgradesEnhancement'
  | 'submoduleNumber'

export type WorkshopFormulaOperand = {
  kind: WorkshopFormulaOperandKind
  /** `WorkshopUtilityLabDisplayOpts` field for opts/submodule kinds. */
  field?: string
  default?: number
  /** When set, this operand can trigger enriched display (see evaluator fallback). */
  activeRule?: WorkshopFormulaOperandActiveRule
}

export type WorkshopFormulaSourceConstant = {
  hex: string
  value: number
  usedFor: string
}

export type WorkshopFormulaSource = {
  binaryFunction: string
  virtualAddress?: string
  constants?: WorkshopFormulaSourceConstant[]
  verifiedAgainst?: string
  notes?: string
}

export type WorkshopFormulaSpec = {
  name: string
  /** `workshopUtilityStatDisplay` key when category is utility. */
  workshopKey: string
  category: 'utility'
  format: WorkshopFormulaFormat
  additiveTerms: string[]
  multiplicativeFactors: string[]
  /** Optional upper bound in display units (binary clamps level-skip chance to 100%). */
  clampMax?: number
  operands: Record<string, WorkshopFormulaOperand>
  source: WorkshopFormulaSource
}

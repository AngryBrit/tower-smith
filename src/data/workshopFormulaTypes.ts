/**
 * GOD workshop display-card formula specs (`tables/workshop/formulas/`).
 * Legacy: sum additive terms, then multiply factors.
 * Pipeline: ordered steps for attack (and future defense) shapes.
 */

export type WorkshopFormulaFormat =
  | 'percent2'
  | 'multiplierX2'
  | 'multiplierTimes2'
  | 'multiplierTimes3'
  | 'integerRound'
  | 'decimal2'
  | 'rangeMeters'
  | 'metersLower'
  | 'seconds2'
  | 'perMeterTrim'
  | 'coinAbbrev'

export type WorkshopFormulaOperandActiveRule =
  | 'multiplierAboveOne'
  | 'positive'
  | 'definedAboveOne'

export type WorkshopFormulaOperandKind =
  | 'base'
  | 'const'
  | 'optsNumber'
  | 'optsMultiplier'
  | 'relicPercentToMultiplier'
  | 'relicMultiplierField'
  | 'freeUpgradesEnhancement'
  | 'submoduleNumber'
  | 'perkMultiplier'
  | 'berserkerAdd'
  | 'enhanceHalfRate'
  | 'damagePerMeterLabExcess'
  | 'onePlusRelicFraction'

export type WorkshopFormulaOperand = {
  kind: WorkshopFormulaOperandKind
  /** `Workshop*LabDisplayOpts` field for opts/submodule kinds. */
  field?: string
  default?: number
  /** Literal for `const` kind. */
  value?: number
  /** When set, this operand can trigger enriched display (see evaluator fallback). */
  activeRule?: WorkshopFormulaOperandActiveRule
}

export type WorkshopFormulaStep =
  | { op: 'add'; refs: string[] }
  | { op: 'mul'; refs: string[] }
  | { op: 'truncateTo'; decimals: number }
  | { op: 'roundTo'; decimals: number }
  | { op: 'clampMax'; value: number }

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
  /** Workshop persisted level field key. */
  workshopKey: string
  category: 'utility' | 'attack'
  format: WorkshopFormulaFormat
  /** Legacy sum-then-product (utility). Ignored when `pipeline` is set. */
  additiveTerms?: string[]
  multiplicativeFactors?: string[]
  /** Ordered evaluation steps (attack). */
  pipeline?: WorkshopFormulaStep[]
  /** Optional upper bound in display units (binary clamps level-skip chance to 100%). */
  clampMax?: number
  operands: Record<string, WorkshopFormulaOperand>
  source: WorkshopFormulaSource
}

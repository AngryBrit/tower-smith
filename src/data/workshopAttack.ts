/**
 * Attack workshop upgrade display via GOD formula registry.
 */

import {
  workshopAttackFormulaStatDisplay,
  workshopAttackLegacyStatDisplay,
  type WorkshopAttackFormulaOpts,
  type WorkshopAttackUpgradeKey,
} from './workshopFormulaContextAttack'

export type { WorkshopAttackFormulaOpts, WorkshopAttackUpgradeKey } from './workshopFormulaContextAttack'

function attackFormulaDisplay(
  key: WorkshopAttackUpgradeKey,
  completedLevels: number,
  opts: WorkshopAttackFormulaOpts | undefined,
  fallback: () => string,
): string {
  return workshopAttackFormulaStatDisplay(key, completedLevels, opts) ?? fallback()
}

export function workshopAttackStatDisplay(
  key: WorkshopAttackUpgradeKey,
  completedLevels: number,
  opts?: WorkshopAttackFormulaOpts,
): string {
  return attackFormulaDisplay(key, completedLevels, opts, () =>
    workshopAttackLegacyStatDisplay(key, completedLevels, opts),
  )
}

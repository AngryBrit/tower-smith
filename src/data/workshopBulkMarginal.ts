import { applyWorkshopDiscountToCoins } from '../types/research'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'

export type WorkshopBulkMultiplier = WorkshopPersistedV1['multiplier']

function discountedWorkshopMarginal(
  raw: number | undefined,
  discountPercent: number,
): number | undefined {
  if (raw == null) return undefined
  if (!(discountPercent > 0)) return raw
  return applyWorkshopDiscountToCoins(raw, discountPercent)
}

/** Levels moved by one +/− click for the current buy multiplier. */
export function workshopBulkStepCount(
  multiplier: WorkshopBulkMultiplier,
  level: number,
  maxLevel: number,
): number {
  if (multiplier === 'max') return Math.max(0, maxLevel - level)
  return Math.min(multiplier, Math.max(0, maxLevel - level))
}

/** Signed level delta for one +/− click (`MAX` → cap on +, 0 on −). */
export function workshopBulkBumpDelta(
  direction: -1 | 1,
  multiplier: WorkshopBulkMultiplier,
  level: number,
  maxLevel: number,
): number {
  if (multiplier === 'max') {
    return direction === 1 ? maxLevel - level : -level
  }
  return direction * multiplier
}

export function formatWorkshopBulkStepLabel(multiplier: WorkshopBulkMultiplier): string {
  return multiplier === 'max' ? 'MAX' : `×${multiplier}`
}

/** Sum of discounted marginals for the next +/− click at `bulkStep` (capped at max level). */
export function discountedWorkshopBulkMarginal(
  level: number,
  maxLevel: number,
  bulkStep: WorkshopBulkMultiplier,
  nextAt: (completedLevels: number) => number | undefined,
  discountPercent: number,
): number | undefined {
  if (level >= maxLevel) return undefined
  const steps = workshopBulkStepCount(bulkStep, level, maxLevel)
  if (steps <= 0) return undefined
  let sum = 0
  for (let L = level; L < level + steps; L += 1) {
    const c = discountedWorkshopMarginal(nextAt(L), discountPercent)
    if (c == null) return undefined
    sum += c
  }
  return sum
}

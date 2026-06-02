import { applyWorkshopDiscountToCoins } from '../types/research'

function discountedWorkshopMarginal(
  raw: number | undefined,
  discountPercent: number,
): number | undefined {
  if (raw == null) return undefined
  if (!(discountPercent > 0)) return raw
  return applyWorkshopDiscountToCoins(raw, discountPercent)
}

/** Sum of discounted marginals for the next +/− click at `bulkStep` (capped at max level). */
export function discountedWorkshopBulkMarginal(
  level: number,
  maxLevel: number,
  bulkStep: number,
  nextAt: (completedLevels: number) => number | undefined,
  discountPercent: number,
): number | undefined {
  if (level >= maxLevel) return undefined
  const steps = Math.min(bulkStep, maxLevel - level)
  let sum = 0
  for (let L = level; L < level + steps; L += 1) {
    const c = discountedWorkshopMarginal(nextAt(L), discountPercent)
    if (c == null) return undefined
    sum += c
  }
  return sum
}

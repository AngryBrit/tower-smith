import { parseWorkshopAmount } from './parse-workshop-amount.mjs'
import { normalizeLabDisplayText } from './parse-lab-god-duration.mjs'

/** @param {string} raw */
export function parseLabCoinAmount(raw) {
  const display = normalizeLabDisplayText(raw)
  if (!display) throw new Error('empty coin amount')
  const parsed = parseWorkshopAmount(display, 'coins')
  if (parsed.maxed || parsed.coins == null || !Number.isFinite(parsed.coins)) {
    throw new Error(`bad coin amount: ${raw}`)
  }
  return Math.round(parsed.coins)
}

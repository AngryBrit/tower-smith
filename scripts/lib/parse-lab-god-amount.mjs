import { parseWorkshopAmount } from './parse-workshop-amount.mjs'
import { normalizeLabDisplayText } from './parse-lab-god-duration.mjs'

/**
 * Lab calculator exports some battle-condition ladders with uppercase `Q` only
 * (no lowercase `q`) where the value is quindecillion (1e15), not quintillion.
 */
export function detectLabCoinSuffixMode(tsvText) {
  const lines = tsvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').slice(1)
  let hasUpperQ = false
  let hasLowerQ = false
  for (const line of lines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    for (const col of [4, 7]) {
      const cell = String(cols[col] ?? '').trim()
      if (/Q$/.test(cell)) hasUpperQ = true
      if (/q$/.test(cell)) hasLowerQ = true
    }
  }
  if (hasUpperQ && !hasLowerQ) return 'Q-as-q'
  return 'standard'
}

/** @param {string} raw @param {'standard' | 'Q-as-q'} mode */
export function parseLabCoinAmount(raw, mode) {
  const display = normalizeLabDisplayText(raw)
  if (!display) throw new Error('empty coin amount')
  const normalized =
    mode === 'Q-as-q' ? display.replace(/Q$/, 'q') : display
  const parsed = parseWorkshopAmount(normalized, 'coins')
  if (parsed.maxed || parsed.coins == null || !Number.isFinite(parsed.coins)) {
    throw new Error(`bad coin amount: ${raw}`)
  }
  return Math.round(parsed.coins)
}

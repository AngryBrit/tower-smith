/** Suffix multipliers for workshop calculator coin/cash display strings. */
export const WORKSHOP_AMOUNT_MULT = {
  K: 1e3,
  M: 1e6,
  B: 1e9,
  T: 1e12,
  q: 1e15,
  Q: 1e18,
  s: 1e21,
}

/**
 * @param {string} raw
 * @param {'coins' | 'cash'} kind
 */
export function parseWorkshopAmount(raw, kind) {
  const display = String(raw ?? '').trim()
  if (/^maxed$/i.test(display)) {
    return { display, [kind]: null, maxed: true }
  }
  const m = display.match(/^([\d.]+)([KMBTqQs])?$/)
  if (m) {
    const n = parseFloat(m[1])
    const amount = m[2] ? n * WORKSHOP_AMOUNT_MULT[m[2]] : n
    return { display, [kind]: amount }
  }
  const direct = Number(display)
  if (Number.isFinite(direct)) {
    return { display, [kind]: direct }
  }
  throw new Error(`bad ${kind}: ${raw}`)
}

/** @param {string} raw */
export function parseWorkshopValue(raw) {
  const display = String(raw ?? '').trim()
  if (/^maxed$/i.test(display)) {
    return { display, value: null, maxed: true }
  }

  const suffixMatch = display.match(/^([\d.]+)([KMBTqQs])(x|%)?$/i)
  if (suffixMatch) {
    const n = parseFloat(suffixMatch[1])
    const mult = WORKSHOP_AMOUNT_MULT[suffixMatch[2]]
    const value = n * mult
    const row = { display, value }
    if (suffixMatch[3]) row.valueDisplay = display
    return row
  }

  const cleaned = display.replace(/x$/i, '').replace(/%$/, '').trim()
  const value = Number(cleaned)
  if (!Number.isFinite(value)) throw new Error(`bad value: ${raw}`)
  const row = { display, value }
  if (display !== cleaned && display !== String(value)) {
    row.valueDisplay = display
  }
  return row
}

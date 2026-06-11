/** Parse TRUE/FALSE checkbox cells from Effective Paths sheets. */
export function parseSheetBoolCell(raw: unknown): boolean {
  if (raw === true) return true
  if (raw === false) return false
  const text = String(raw ?? '').trim().toUpperCase()
  return text === 'TRUE' || text === '1' || text === 'YES'
}

export function cellValueToString(raw: unknown): string {
  if (raw == null) return ''
  if (typeof raw === 'boolean') return raw ? 'TRUE' : 'FALSE'
  if (typeof raw === 'number') return String(raw)
  return String(raw).trim()
}

export function parseSheetLevelCell(raw: unknown): number | null {
  const text = cellValueToString(raw)
  if (!text) return 0
  if (/^locked$/i.test(text)) return 0
  const n = Number(text)
  if (!Number.isFinite(n)) return null
  return Math.max(0, Math.round(n))
}

/**
 * Parse numeric level from Bots/UWs v3.x column G dropdown labels.
 * Examples: `06 | 32m | Cost 300 ⧓ | Next 340 ⧓`, `Lo | Locked 00 | ...`
 */
export function farmingDropdownLevelFromLabel(
  label: string,
  options?: { plusLockedValue?: number },
): number | null {
  const trimmed = label.trim()
  if (!trimmed) return 0

  if (/^lo\s*\|\s*locked\b/i.test(trimmed)) {
    return options?.plusLockedValue ?? 0
  }

  const match = /^(\d{2})\s*\|/.exec(trimmed)
  if (match) return Number(match[1])

  const n = Number(trimmed)
  if (Number.isFinite(n)) return Math.max(0, Math.round(n))
  return null
}

/**
 * Workshop **Health Regen** base stat from `Main::GetOutOfRoundHealthRegen` (libil2cpp.so).
 *
 * Provenance: disassembly of VA `0x15368B0` — bracket polynomial + optional L5000+ tail.
 *   0.004·(L−1) + 0.0045·(L−1)^2.39 + 0.04·L
 *   + 0.02·(L−249)^2.25  (L > 249)
 *   + 0.02·(L−499)^2.85  (L > 499)
 *   × 1.0024^(L−5000)    (L ≥ 5001)
 *
 * The game evaluates the `^` terms with single-precision `powf`, so the default `float32-pow`
 * mode is **bit-exact** to the binary: L5840 → `6373117241.88554` vs game `6373117241.88547`.
 * The committed GOD `tables/workshop/defense/health-regen.json` `value` rows are 2-decimal
 * display exports (e.g. 6.37B), so they drift ≤~0.5% from this true curve at high levels.
 */

export type WorkshopBinaryFloatMode = 'float64' | 'float32-pow'

/** ARM64 `powf` — operands rounded to f32 before libm pow, result f32. */
export function workshopBinaryPowf(base: number, exponent: number): number {
  return Math.fround(Math.pow(Math.fround(base), Math.fround(exponent)))
}

export function workshopBinaryHealthRegenBase(
  completedLevels: number,
  floatMode: WorkshopBinaryFloatMode = 'float32-pow',
): number {
  const L = Math.max(0, Math.trunc(completedLevels))
  if (L <= 0) return 0

  const pow = floatMode === 'float32-pow' ? workshopBinaryPowf : Math.pow

  const seg1 = 0.004 * (L - 1)
  const seg2 = 0.0045 * pow(L - 1, 2.39)
  const seg3 = 0.04 * L
  const seg4 = L > 249 ? 0.02 * pow(L - 249, 2.25) : 0
  const seg5 = L > 499 ? 0.02 * pow(L - 499, 2.85) : 0
  const bracket = seg1 + seg2 + seg3 + seg4 + seg5
  const tail = L >= 5001 ? pow(1.0024, L - 5000) : 1
  return bracket * tail
}

/** Calibration anchors from in-game workshop Health Regen card (relics/card held constant). */
export const WORKSHOP_HEALTH_REGEN_DISPLAY_CALIBRATION = [
  { level: 5820, gameDisplayPerSec: 46.1e9, regenPlusTier: 1.6 },
  { level: 5830, gameDisplayPerSec: 47.47e9, regenPlusTier: 1.61 },
  { level: 5840, gameDisplayPerSec: 48.88e9, regenPlusTier: 1.61 },
] as const

export function impliedHealthRegenDisplayEnhance(opts: {
  level: number
  gameDisplayPerSec: number
  cardMultiplier: number
  relicsBonusFraction: number
  floatMode?: WorkshopBinaryFloatMode
}): number {
  const base = workshopBinaryHealthRegenBase(opts.level, opts.floatMode)
  const denom = base * opts.cardMultiplier * (1 + opts.relicsBonusFraction)
  if (denom <= 0) return 1
  return opts.gameDisplayPerSec / denom
}

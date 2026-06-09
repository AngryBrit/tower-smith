/**
 * Workshop **Damage / Meter** from `tables/workshop/attack/damage-meter.json`.
 * Workshop UI shows **`x1 / m`** … **`x1.059 / m`** (baseline ×1 plus the GOD bonus).
 * Attack **Damage / Meter** research lab adds a **fraction** of **(labMult − 1)** to this card.
 */
import { workshopToolkitMarginalCoins, workshopToolkitStatValue } from '../workshopCosts'

/** Calibrated: workshop DPM +5.5% (L180) + lab ×1.28 (L14) → in-game ×1.1429 / m. */
export const WORKSHOP_DAMAGE_PER_METER_LAB_EXCESS_FRACTION = 0.0879 / (1.28 - 1)

export const WORKSHOP_DAMAGE_PER_METER_MAX_LEVEL = 200 as const

/** GOD **Value** is bonus ×1000 (e.g. **59** → **0.059** bonus → **×1.059 / m** display). */
const DAMAGE_PER_METER_GOD_VALUE_SCALE = 1 / 1000

export function workshopDamagePerMeterStatMultiplier(completedLevels: number): number {
  return workshopToolkitStatValue('Damage - Meter', completedLevels)! * DAMAGE_PER_METER_GOD_VALUE_SCALE
}

export function workshopDamagePerMeterResearchLabDisplayAdd(
  damagePerMeterLabMultiplier: number | undefined,
): number {
  if (
    damagePerMeterLabMultiplier == null ||
    !Number.isFinite(damagePerMeterLabMultiplier) ||
    damagePerMeterLabMultiplier <= 1 + 1e-9
  ) {
    return 0
  }
  return (damagePerMeterLabMultiplier - 1) * WORKSHOP_DAMAGE_PER_METER_LAB_EXCESS_FRACTION
}

function formatDamagePerMeterMultiplier(n: number): string {
  if (Math.abs(n - 1) < 1e-9) return 'x1.000'
  const s = n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
  return `x${s}`
}

export function workshopDamagePerMeterStatDisplay(
  completedLevels: number,
  damagePerMeterLabMultiplier?: number,
): string {
  const workshopBonus = workshopDamagePerMeterStatMultiplier(completedLevels)
  const labAdd = workshopDamagePerMeterResearchLabDisplayAdd(damagePerMeterLabMultiplier)
  const n = 1 + workshopBonus + labAdd
  return `${formatDamagePerMeterMultiplier(n)} / m`
}

export function workshopDamagePerMeterNextMarginalCoins(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('Damage - Meter', completedLevels)
}

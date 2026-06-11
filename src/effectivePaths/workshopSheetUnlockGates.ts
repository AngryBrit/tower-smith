import { workshopGodTableMaxLevel } from '../workshopCosts'
import type { WorkshopEpUpgradeKey } from './workshopSheetNames'
import {
  workshopUpgradeIdFromSheetName,
  workshopUpgradeSheetNameFromId,
} from './workshopSheetNames'

/** Strip Effective Paths unlock-cost suffixes, e.g. " (50 ¢)" or " (500B ¢)". */
export function normalizeWorkshopUpgradeSheetLabel(sheetName: string): string {
  return sheetName.replace(/\s*\([^)]*\)\s*$/g, '').trim()
}

export function isWorkshopUnlockGateSheetLabel(sheetName: string): boolean {
  return /^unlock\b/i.test(normalizeWorkshopUpgradeSheetLabel(sheetName))
}

/** Ordered upgrade keys for duplicate unlock-gate labels on the EP Master Sheet. */
const UNLOCK_GATE_UPGRADE_SEQUENCES: Readonly<Record<string, readonly WorkshopEpUpgradeKey[]>> = {
  'unlock range': ['attackRangeLevel', 'damagePerMeterLevel'],
  'unlock multishot': ['multishotChanceLevel', 'multishotTargetsLevel'],
  'unlock rapid fire': ['rapidFireChanceLevel', 'rapidFireDurationLevel'],
  'unlock bounce shot': [
    'bounceShotChanceLevel',
    'bounceShotTargetsLevel',
    'bounceShotRangeLevel',
  ],
  'unlock super critical hits': ['superCritChanceLevel', 'superCritMultLevel'],
  'unlock rend armor': ['rendArmorChanceLevel', 'rendArmorMultLevel'],
  'unlock defense': ['defensePercentLevel', 'defenseAbsoluteLevel'],
  'unlock thorn': ['thornDamageLevel'],
  'unlock lifesteal': ['lifestealLevel'],
  'unlock knockback': ['knockbackChanceLevel', 'knockbackForceLevel'],
  'unlock orbs': ['orbSpeedLevel', 'orbsLevel'],
  'unlock shockwave': ['shockwaveSizeLevel', 'shockwaveFrequencyLevel'],
  'unlock land mines': ['landMineChanceLevel', 'landMineDamageLevel', 'landMineRadiusLevel'],
  'unlock death defy': ['deathDefyLevel'],
  'unlock wall': ['wallHealthLevel', 'wallRebuildLevel'],
  'unlock cash bonuses': ['cashBonusLevel', 'cashPerWaveLevel'],
  'unlock coin bonuses': ['coinsKillBonusLevel', 'coinsWaveLevel'],
  'unlock upgrade chances': [
    'freeAttackUpgradeLevel',
    'freeDefenseUpgradeLevel',
    'freeUtilityUpgradeLevel',
  ],
  'unlock interest / wave': ['interestPerWaveLevel'],
  'unlock recovery packages': ['recoveryAmountLevel', 'maxRecoveryLevel', 'packageChanceLevel'],
  'unlock enemy level skips': ['enemyAttackLevelSkipLevel', 'enemyHealthLevelSkipLevel'],
}

function godMaxForUpgradeId(id: WorkshopEpUpgradeKey): number | undefined {
  return workshopGodTableMaxLevel(workshopUpgradeSheetNameFromId(id))
}

function pickByMaxHint(
  candidates: readonly WorkshopEpUpgradeKey[],
  maxLevelHint: number,
): WorkshopEpUpgradeKey | null {
  const matches = candidates.filter((id) => godMaxForUpgradeId(id) === maxLevelHint)
  return matches.length === 1 ? matches[0]! : null
}

export function workshopUpgradeIdFromUnlockGateLabel(
  sheetName: string,
  options?: { maxLevelHint?: number; occurrence?: number },
): WorkshopEpUpgradeKey | null {
  const normalized = normalizeWorkshopUpgradeSheetLabel(sheetName).toLowerCase()
  const sequence = UNLOCK_GATE_UPGRADE_SEQUENCES[normalized]
  if (!sequence || sequence.length === 0) return null

  if (options?.maxLevelHint != null) {
    const byMax = pickByMaxHint(sequence, options.maxLevelHint)
    if (byMax) return byMax
  }

  const index = options?.occurrence ?? 0
  return sequence[index] ?? null
}

export function workshopUpgradeIdFromSheetLabel(
  sheetName: string,
  options?: { maxLevelHint?: number; occurrence?: number },
): WorkshopEpUpgradeKey | null {
  const direct = workshopUpgradeIdFromSheetName(sheetName)
  if (direct) return direct
  if (!isWorkshopUnlockGateSheetLabel(sheetName)) return null
  return workshopUpgradeIdFromUnlockGateLabel(sheetName, options)
}

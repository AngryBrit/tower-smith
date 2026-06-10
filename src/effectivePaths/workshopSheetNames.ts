import {
  WORKSHOP_DEFENSE_GOD_NAMES,
  WORKSHOP_ENHANCE_ATTACK_GOD_NAMES,
  WORKSHOP_ENHANCE_DEFENSE_GOD_NAMES,
  WORKSHOP_ENHANCE_UTILITY_GOD_NAMES,
  WORKSHOP_GOD_NAME_ALIASES,
  WORKSHOP_UTILITY_GOD_NAMES,
} from '../workshopCosts'
import type { WorkshopEnhanceAttackUpgradeKey } from '../data/workshopEnhanceAttack'
import type { WorkshopEnhanceDefenseUpgradeKey } from '../data/workshopEnhanceDefense'
import type { WorkshopEnhanceUtilityUpgradeKey } from '../data/workshopEnhanceUtility'
import type { WorkshopDefenseUpgradeKey } from '../data/workshopDefense'
import type { WorkshopUtilityUpgradeKey } from '../data/workshopUtility'

/** Workshop upgrade persisted keys synced to Effective Paths Master Sheet (B/C/D block). */
export const WORKSHOP_ATTACK_GOD_NAMES = {
  damageLevel: 'Damage',
  attackSpeedLevel: 'Attack Speed',
  critChanceLevel: 'Critical Chance',
  critFactorLevel: 'Critical Factor',
  attackRangeLevel: 'Range',
  damagePerMeterLevel: 'Damage - Meter',
  multishotChanceLevel: 'Multishot Chance',
  multishotTargetsLevel: 'Multishot Targets',
  rapidFireChanceLevel: 'Rapid Fire Chance',
  rapidFireDurationLevel: 'Rapid Fire Duration',
  bounceShotChanceLevel: 'Bounce Shot Chance',
  bounceShotTargetsLevel: 'Bounce Shot Targets',
  bounceShotRangeLevel: 'Bounce Shot Range',
  superCritChanceLevel: 'Super Crit Chance',
  superCritMultLevel: 'Super Crit Mult',
  rendArmorChanceLevel: 'Rend Armor Chance',
  rendArmorMultLevel: 'Rend Armor Mult',
} as const

export type WorkshopAttackUpgradeKey = keyof typeof WORKSHOP_ATTACK_GOD_NAMES

export type WorkshopEpUpgradeKey =
  | WorkshopAttackUpgradeKey
  | WorkshopDefenseUpgradeKey
  | WorkshopUtilityUpgradeKey

export const WORKSHOP_EP_UPGRADE_KEYS: readonly WorkshopEpUpgradeKey[] = [
  ...Object.keys(WORKSHOP_ATTACK_GOD_NAMES),
  ...Object.keys(WORKSHOP_DEFENSE_GOD_NAMES),
  ...Object.keys(WORKSHOP_UTILITY_GOD_NAMES),
] as WorkshopEpUpgradeKey[]

export type WorkshopEpEnhanceKey =
  | WorkshopEnhanceAttackUpgradeKey
  | WorkshopEnhanceDefenseUpgradeKey
  | WorkshopEnhanceUtilityUpgradeKey

export const WORKSHOP_EP_ENHANCE_KEYS: readonly WorkshopEpEnhanceKey[] = [
  ...Object.keys(WORKSHOP_ENHANCE_ATTACK_GOD_NAMES),
  ...Object.keys(WORKSHOP_ENHANCE_DEFENSE_GOD_NAMES),
  ...Object.keys(WORKSHOP_ENHANCE_UTILITY_GOD_NAMES),
] as WorkshopEpEnhanceKey[]

const NAME_TO_UPGRADE_ID = new Map<string, WorkshopEpUpgradeKey>()
const NAME_TO_ENHANCE_ID = new Map<string, WorkshopEpEnhanceKey>()

function registerName(name: string, id: WorkshopEpUpgradeKey) {
  const trimmed = name.trim()
  if (!trimmed) return
  NAME_TO_UPGRADE_ID.set(trimmed.toLowerCase(), id)
}

for (const [id, name] of Object.entries(WORKSHOP_ATTACK_GOD_NAMES)) {
  registerName(name, id as WorkshopAttackUpgradeKey)
}
for (const [id, name] of Object.entries(WORKSHOP_DEFENSE_GOD_NAMES)) {
  registerName(name, id as WorkshopDefenseUpgradeKey)
}
for (const [id, name] of Object.entries(WORKSHOP_UTILITY_GOD_NAMES)) {
  registerName(name, id as WorkshopUtilityUpgradeKey)
}

for (const [alias, canonical] of Object.entries(WORKSHOP_GOD_NAME_ALIASES)) {
  const id = NAME_TO_UPGRADE_ID.get(canonical.toLowerCase())
  if (id) registerName(alias, id)
}

/** Extra Effective Paths / calculator spellings not in GOD alias table. */
const WORKSHOP_SHEET_NAME_ALIASES: Readonly<Record<string, WorkshopEpUpgradeKey>> = {
  'Crit Chance': 'critChanceLevel',
  'Crit Factor': 'critFactorLevel',
  'Damage/Meter': 'damagePerMeterLevel',
  'Cash/Wave': 'cashPerWaveLevel',
  'Coins/Kill': 'coinsKillBonusLevel',
  'Coins/Kill Bonus': 'coinsKillBonusLevel',
  'Coin / Kill Bonus': 'coinsKillBonusLevel',
  'Coins/Wave': 'coinsWaveLevel',
  'Coin / Wave': 'coinsWaveLevel',
  'Interest/Wave': 'interestPerWaveLevel',
  'Defense %': 'defensePercentLevel',
  'Thorn Damage': 'thornDamageLevel',
  'Super Critical Chance': 'superCritChanceLevel',
  'Super Critical Mult': 'superCritMultLevel',
  'Max Amount': 'maxRecoveryLevel',
}

for (const [alias, id] of Object.entries(WORKSHOP_SHEET_NAME_ALIASES)) {
  registerName(alias, id)
}

function registerEnhanceName(name: string, id: WorkshopEpEnhanceKey) {
  const trimmed = name.trim()
  if (!trimmed) return
  NAME_TO_ENHANCE_ID.set(trimmed.toLowerCase(), id)
}

for (const [id, name] of Object.entries(WORKSHOP_ENHANCE_ATTACK_GOD_NAMES)) {
  registerEnhanceName(name, id as WorkshopEnhanceAttackUpgradeKey)
}
for (const [id, name] of Object.entries(WORKSHOP_ENHANCE_DEFENSE_GOD_NAMES)) {
  registerEnhanceName(name, id as WorkshopEnhanceDefenseUpgradeKey)
}
for (const [id, name] of Object.entries(WORKSHOP_ENHANCE_UTILITY_GOD_NAMES)) {
  registerEnhanceName(name, id as WorkshopEnhanceUtilityUpgradeKey)
}

/** Effective Paths v3.x enhancement spellings and unlock-gate row labels. */
const WORKSHOP_ENHANCE_SHEET_ALIASES: Readonly<Record<string, WorkshopEpEnhanceKey>> = {
  'Rend Armor Mult +': 'enhanceRendArmorLevel',
  'Damage / Meter +': 'enhanceDamagePerMeterLevel',
  'Damage/Meter +': 'enhanceDamagePerMeterLevel',
  'Unlock SCM +': 'enhanceSuperCritMultLevel',
  'Unlock ASPD +': 'enhanceAttackSpeedLevel',
  'Unlock Orb Size +': 'enhanceOrbSizeLevel',
  'Super Crit Multi +': 'enhanceSuperCritMultLevel',
  'Orb Size +': 'enhanceOrbSizeLevel',
}

for (const [alias, id] of Object.entries(WORKSHOP_ENHANCE_SHEET_ALIASES)) {
  registerEnhanceName(alias, id)
}

function normalizeSheetName(value: string): string {
  return value.trim().toLowerCase()
}

/** Strip Effective Paths unlock-cost suffixes, e.g. " (35.52 T)". */
export function normalizeWorkshopEnhanceSheetLabel(sheetName: string): string {
  return sheetName.replace(/\s*\([^)]*\)\s*$/g, '').trim()
}

export function workshopUpgradeIdFromSheetName(sheetName: string): WorkshopEpUpgradeKey | null {
  const key = normalizeSheetName(sheetName)
  if (!key) return null
  return NAME_TO_UPGRADE_ID.get(key) ?? null
}

export function workshopEnhanceIdFromSheetName(sheetName: string): WorkshopEpEnhanceKey | null {
  const key = normalizeSheetName(normalizeWorkshopEnhanceSheetLabel(sheetName))
  if (!key) return null
  return NAME_TO_ENHANCE_ID.get(key) ?? null
}

export function workshopUpgradeSheetNameFromId(
  id: WorkshopEpUpgradeKey,
  sheetLabels?: ReadonlyMap<WorkshopEpUpgradeKey, string>,
): string {
  if (sheetLabels?.get(id)) return sheetLabels.get(id)!
  if (id in WORKSHOP_ATTACK_GOD_NAMES) {
    return WORKSHOP_ATTACK_GOD_NAMES[id as WorkshopAttackUpgradeKey]
  }
  if (id in WORKSHOP_DEFENSE_GOD_NAMES) {
    return WORKSHOP_DEFENSE_GOD_NAMES[id as WorkshopDefenseUpgradeKey]
  }
  return WORKSHOP_UTILITY_GOD_NAMES[id as WorkshopUtilityUpgradeKey]
}

export function effectivePathsWorkshopSheetLabelsFromRows(
  rows: readonly (readonly string[])[],
  workshopRows: readonly { rowIndex: number; name: string }[],
  nameCol: number,
): ReadonlyMap<WorkshopEpUpgradeKey, string> {
  const out = new Map<WorkshopEpUpgradeKey, string>()
  for (const row of workshopRows) {
    const name = rows[row.rowIndex - 1]?.[nameCol]?.trim() ?? row.name.trim()
    const id = workshopUpgradeIdFromSheetName(name)
    if (id && name) out.set(id, name)
  }
  return out
}

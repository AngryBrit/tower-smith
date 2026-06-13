import type { WorkshopChassisModuleMergeTier } from '../data/workshopChassisModuleShared'
import type { WorkshopSubmoduleRarity } from '../data/workshopSubmoduleEffects'

/** Modules v6.1.2 Inventory — main module rarity dropdown labels. */
const MODULE_EP_MERGE_TIER_SHEET_LABEL: Record<WorkshopChassisModuleMergeTier, string> = {
  rare: 'Rare',
  rare_plus: 'Rare+',
  epic: 'Epic',
  epic_plus: 'Epic+',
  legendary: 'Legendary',
  legendary_plus: 'Legendary+',
  mythic: 'Mythic',
  mythic_plus: 'Mythic+',
  ancestral: 'Ancestral',
  star_1: 'Ancestral 1*',
  star_2: 'Ancestral 2*',
  star_3: 'Ancestral 3*',
  star_4: 'Ancestral 4*',
  star_5: 'Ancestral 5*',
}

const MODULE_EP_SUBMODULE_RARITY_SHEET_LABEL: Record<WorkshopSubmoduleRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
  ancestral: 'Ancestral',
}

/** Wiki / catalog label → Inventory substat name dropdown spelling. */
const MODULE_EP_SUBMODULE_SHEET_LABEL_OVERRIDES: Record<string, string> = {
  'Crit Chance [%]': 'Critical Chance',
  'Crit Factor': 'Critical Factor',
  'Multishot Chance [%]': 'MultiShot Chance',
  'Defense [%]': 'Defense %',
  'Health Regen [%]': 'Health Regen',
  'Defense Absolute [%]': 'Defense Absolute',
  'Lifesteal [%]': 'Lifesteal',
  'Knockback Chance [%]': 'Knockback Chance',
  'Shockwave Frequency [s]': 'Shockwave Frequency',
  'Land Mine Damage [%]': 'Land Mine Damage',
  'Land Mine Chance [%]': 'Land Mine Chance',
  'Wall Health [%]': 'Wall Health',
  'Wall Rebuild [s]': 'Wall Rebuild',
  'Free Attack Upgrade [%]': 'Free Attack Upgrade',
  'Free Defense Upgrade [%]': 'Free Defense Upgrade',
  'Free Utility Upgrade [%]': 'Free Utility Upgrade',
  'Interest / Wave [%]': 'Interest / Wave',
  'Recovery Amount [%]': 'Recovery Amount',
  'Package Chance [%]': 'Package Chance',
  'Enemy Attack Level Skip [%]': 'Enemy Attack Level Skip',
  'Enemy Health Level Skip [%]': 'Enemy Health Level Skip',
}

function defaultSubmoduleSheetLabel(catalogLabel: string): string {
  return catalogLabel
    .replace(/\s*\[[^\]]*\]\s*\*?\s*$/i, '')
    .replace(/\*+\s*$/, '')
    .trim()
}

/** Inventory dropdown value for an empty module or substat rarity cell. */
export const MODULE_EP_EMPTY_RARITY_SHEET_LABEL = 'None'

export function moduleEpMergeTierSheetLabel(merge: WorkshopChassisModuleMergeTier): string {
  return MODULE_EP_MERGE_TIER_SHEET_LABEL[merge]
}

export function moduleEpSubmoduleRaritySheetLabel(rarity: WorkshopSubmoduleRarity): string {
  return MODULE_EP_SUBMODULE_RARITY_SHEET_LABEL[rarity]
}

/** Inventory substat name column — matches Modules v6.1.2 dropdown validation. */
export function moduleEpSubmoduleSheetLabel(catalogLabel: string): string {
  return MODULE_EP_SUBMODULE_SHEET_LABEL_OVERRIDES[catalogLabel] ?? defaultSubmoduleSheetLabel(catalogLabel)
}

/** Inventory spare-row dropdown label for an equipped assist chassis module. */
export function moduleEpSpareModuleSheetLabel(displayName: string): string {
  return `Spare ${displayName}`
}

export const MODULE_EP_MERGE_TIER_SHEET_LABELS = Object.values(MODULE_EP_MERGE_TIER_SHEET_LABEL)
export const MODULE_EP_SUBMODULE_RARITY_SHEET_LABELS = Object.values(
  MODULE_EP_SUBMODULE_RARITY_SHEET_LABEL,
)

const MERGE_TIER_FROM_SHEET_LABEL = new Map<string, WorkshopChassisModuleMergeTier>(
  Object.entries(MODULE_EP_MERGE_TIER_SHEET_LABEL).map(([tier, label]) => [
    label.trim().toLowerCase(),
    tier as WorkshopChassisModuleMergeTier,
  ]),
)

const SUBMODULE_RARITY_FROM_SHEET_LABEL = new Map<string, WorkshopSubmoduleRarity>(
  Object.entries(MODULE_EP_SUBMODULE_RARITY_SHEET_LABEL).map(([rarity, label]) => [
    label.trim().toLowerCase(),
    rarity as WorkshopSubmoduleRarity,
  ]),
)

export function moduleEpMergeTierFromSheetLabel(label: string): WorkshopChassisModuleMergeTier | null {
  const key = label.trim().toLowerCase()
  if (!key || key === MODULE_EP_EMPTY_RARITY_SHEET_LABEL.toLowerCase()) return null
  return MERGE_TIER_FROM_SHEET_LABEL.get(key) ?? null
}

export function moduleEpSubmoduleRarityFromSheetLabel(
  label: string,
): WorkshopSubmoduleRarity | null {
  const key = label.trim().toLowerCase()
  if (!key) return null
  return SUBMODULE_RARITY_FROM_SHEET_LABEL.get(key) ?? null
}

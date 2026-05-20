/**
 * Shared chassis module catalog types (Cannon, Armor, …).
 */

/** Wiki module ability columns (Epic … Ancestral module families). */
export type WorkshopChassisModuleEffectTier = 'epic' | 'legendary' | 'mythic' | 'ancestral'

export const WORKSHOP_CHASSIS_MODULE_EFFECT_TIERS: readonly WorkshopChassisModuleEffectTier[] = [
  'epic',
  'legendary',
  'mythic',
  'ancestral',
] as const

/**
 * In-game merge / upgrade tier (Rare … Ancestral 5★). Sets max module level.
 * Persisted on workshop presets as `sim*ChassisModuleRarity`.
 */
export type WorkshopChassisModuleMergeTier =
  | 'rare'
  | 'rare_plus'
  | 'epic'
  | 'epic_plus'
  | 'legendary'
  | 'legendary_plus'
  | 'mythic'
  | 'mythic_plus'
  | 'ancestral'
  | 'star_1'
  | 'star_2'
  | 'star_3'
  | 'star_4'
  | 'star_5'

/** @deprecated Alias for merge tier (picker / persistence). */
export type WorkshopChassisModuleRarity = WorkshopChassisModuleMergeTier

export const WORKSHOP_CHASSIS_MODULE_MERGE_TIERS: readonly WorkshopChassisModuleMergeTier[] = [
  'rare',
  'rare_plus',
  'epic',
  'epic_plus',
  'legendary',
  'legendary_plus',
  'mythic',
  'mythic_plus',
  'ancestral',
  'star_1',
  'star_2',
  'star_3',
  'star_4',
  'star_5',
] as const

/** @deprecated Use WORKSHOP_CHASSIS_MODULE_MERGE_TIERS. */
export const WORKSHOP_CHASSIS_MODULE_RARITIES = WORKSHOP_CHASSIS_MODULE_MERGE_TIERS

const MERGE_TIER_SET = new Set<string>(WORKSHOP_CHASSIS_MODULE_MERGE_TIERS)

/** Wiki module upgrade max level by merge tier. */
export const WORKSHOP_CHASSIS_MODULE_MAX_LEVEL_BY_MERGE: Record<
  WorkshopChassisModuleMergeTier,
  number
> = {
  rare: 30,
  rare_plus: 40,
  epic: 60,
  epic_plus: 80,
  legendary: 100,
  legendary_plus: 120,
  mythic: 140,
  mythic_plus: 160,
  ancestral: 200,
  star_1: 220,
  star_2: 240,
  star_3: 260,
  star_4: 280,
  star_5: 300,
}

/** @deprecated Use WORKSHOP_CHASSIS_MODULE_MAX_LEVEL_BY_MERGE. */
export const WORKSHOP_CHASSIS_MODULE_MAX_LEVEL_BY_RARITY = WORKSHOP_CHASSIS_MODULE_MAX_LEVEL_BY_MERGE

export function workshopChassisModuleMaxLevel(merge: WorkshopChassisModuleMergeTier): number {
  return WORKSHOP_CHASSIS_MODULE_MAX_LEVEL_BY_MERGE[merge]
}

export function clampWorkshopChassisModuleLevel(
  level: number,
  merge: WorkshopChassisModuleMergeTier,
): number {
  if (!Number.isFinite(level)) return 0
  const max = workshopChassisModuleMaxLevel(merge)
  return Math.max(0, Math.min(max, Math.trunc(level)))
}

/** Maps merge tier to wiki ability value column. */
export function resolveChassisModuleEffectTier(
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): WorkshopChassisModuleEffectTier {
  if (MERGE_TIER_SET.has(tier)) {
    return workshopChassisModuleEffectTier(tier as WorkshopChassisModuleMergeTier)
  }
  return tier as WorkshopChassisModuleEffectTier
}

export function workshopChassisModuleEffectTier(
  merge: WorkshopChassisModuleMergeTier,
): WorkshopChassisModuleEffectTier {
  if (merge === 'rare' || merge === 'rare_plus' || merge === 'epic' || merge === 'epic_plus') {
    return 'epic'
  }
  if (merge === 'legendary' || merge === 'legendary_plus') return 'legendary'
  if (merge === 'mythic' || merge === 'mythic_plus') return 'mythic'
  return 'ancestral'
}

/** Default merge tier when picking a catalog effect column (Ancestral → 5★ for max 300). */
export function defaultMergeTierForEffectTier(
  effect: WorkshopChassisModuleEffectTier,
): WorkshopChassisModuleMergeTier {
  switch (effect) {
    case 'legendary':
      return 'legendary'
    case 'mythic':
      return 'mythic'
    case 'ancestral':
      return 'star_5'
    default:
      return 'epic'
  }
}

export function sanitizeChassisModuleMergeTier(raw: unknown): WorkshopChassisModuleMergeTier {
  if (typeof raw === 'string' && MERGE_TIER_SET.has(raw)) {
    return raw as WorkshopChassisModuleMergeTier
  }
  return 'epic'
}

/**
 * Old saves used `ancestral` for max level 300 (now 5★). Bump when level exceeds Ancestral cap (200).
 */
export function coerceChassisMergeTierForModuleLevel(
  merge: WorkshopChassisModuleMergeTier,
  moduleLevel: number,
): WorkshopChassisModuleMergeTier {
  if (
    merge === 'ancestral' &&
    moduleLevel > workshopChassisModuleMaxLevel('ancestral')
  ) {
    return 'star_5'
  }
  return merge
}

/** @deprecated Use sanitizeChassisModuleMergeTier. */
export const sanitizeChassisModuleRarity = sanitizeChassisModuleMergeTier

export function sanitizeChassisModuleEffectTier(raw: unknown): WorkshopChassisModuleEffectTier {
  return raw === 'legendary' || raw === 'mythic' || raw === 'ancestral' ? raw : 'epic'
}

type ChassisRarityCss =
  | 'modules-rarity--rare'
  | 'modules-rarity--epic'
  | 'modules-rarity--legendary'
  | 'modules-rarity--mythic'
  | 'modules-rarity--ancestral'

export function workshopChassisModuleMergeTierCssClass(
  merge: WorkshopChassisModuleMergeTier,
): ChassisRarityCss {
  if (merge === 'rare' || merge === 'rare_plus') return 'modules-rarity--rare'
  const effect = workshopChassisModuleEffectTier(merge)
  return `modules-rarity--${effect}` as ChassisRarityCss
}

export function workshopChassisModuleEffectTierCssClass(
  effect: WorkshopChassisModuleEffectTier,
): ChassisRarityCss {
  return `modules-rarity--${effect}` as ChassisRarityCss
}

/** @deprecated Use workshopChassisModuleMergeTierCssClass. */
export const WORKSHOP_CHASSIS_MODULE_RARITY_CLASS: Record<
  WorkshopChassisModuleMergeTier,
  ChassisRarityCss
> = Object.fromEntries(
  WORKSHOP_CHASSIS_MODULE_MERGE_TIERS.map((tier) => [
    tier,
    workshopChassisModuleMergeTierCssClass(tier),
  ]),
) as Record<WorkshopChassisModuleMergeTier, ChassisRarityCss>

export type WorkshopChassisModuleValueKind =
  | 'percent'
  | 'count'
  | 'seconds'
  | 'mult'
  | 'damageMult'
  | 'addMeters'

export type WorkshopChassisModuleDef = {
  name: string
  /** Wiki ability; `[x]` is replaced with the tier value. */
  description: string
  kind: WorkshopChassisModuleValueKind
  values: Record<WorkshopChassisModuleEffectTier, number>
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const t = n.toFixed(2)
  return t.replace(/\.?0+$/, '')
}

export function formatWorkshopChassisModuleValue(
  kind: WorkshopChassisModuleValueKind,
  value: number,
): string {
  switch (kind) {
    case 'percent':
      return `${formatNum(value)}%`
    case 'seconds':
      return `${formatNum(value)}s`
    case 'mult':
      return `×${formatNum(value)}`
    case 'damageMult':
      return `${formatNum(value)}x`
    case 'addMeters':
      return `+${formatNum(value)}m`
    case 'count':
    default:
      return formatNum(value)
  }
}

/** Ability text with `[x]` filled for the given effect or merge tier. */
export function formatWorkshopChassisModuleAbility(
  def: WorkshopChassisModuleDef,
  tier: WorkshopChassisModuleEffectTier | WorkshopChassisModuleMergeTier,
): string {
  const v = def.values[resolveChassisModuleEffectTier(tier)]
  return def.description.replace('[x]', formatWorkshopChassisModuleValue(def.kind, v))
}

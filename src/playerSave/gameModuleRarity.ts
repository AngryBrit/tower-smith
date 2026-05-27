import type { WorkshopChassisModuleMergeTier } from '../data/workshopChassisModuleShared'

/** `ModuleRarity` in Assembly-CSharp (game enum ordinal). */
const GAME_MODULE_RARITY_TO_MERGE: readonly (WorkshopChassisModuleMergeTier | null)[] = [
  null,
  'rare',
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
]

export function gameModuleRarityToMergeTier(
  rarity: number,
): WorkshopChassisModuleMergeTier | null {
  if (!Number.isFinite(rarity) || rarity < 0) return null
  return GAME_MODULE_RARITY_TO_MERGE[Math.trunc(rarity)] ?? null
}

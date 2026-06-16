/**
 * Wiki tier order for submodule effect rows (reference).
 * Save import uses calibrated sparse indices in `gameModuleEffectIndex.ts`.
 */

import type { WorkshopSubmoduleEffectRow } from './workshopSubmoduleCatalog'
import type { WorkshopSubmoduleRarity } from './workshopSubmoduleEffects'

export const SUBMODULE_WIKI_RARITIES = [
  'common',
  'rare',
  'epic',
  'legendary',
  'mythic',
  'ancestral',
] as const satisfies readonly WorkshopSubmoduleRarity[]

/** Present wiki tiers for a row, in order common → … → ancestral (null cells skipped). */
export function wikiTiersPresent(
  row: WorkshopSubmoduleEffectRow,
): WorkshopSubmoduleRarity[] {
  return SUBMODULE_WIKI_RARITIES.filter((r) => row.cells[r] != null)
}

/**
 * Conceptual tier when walking backward from the highest present wiki tier.
 * Offset 0 = highest (Ancestral when the row has it, else Mythic, etc.).
 */
export function conceptualTierFromEnd(
  row: WorkshopSubmoduleEffectRow,
  offsetFromEnd: number,
): WorkshopSubmoduleRarity | null {
  const tiers = wikiTiersPresent(row)
  if (tiers.length === 0) return null
  const idx = tiers.length - 1 - offsetFromEnd
  return idx >= 0 ? tiers[idx]! : null
}

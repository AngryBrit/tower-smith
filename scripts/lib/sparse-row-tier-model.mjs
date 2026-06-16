/**
 * Conceptual wiki tier order for submodule effect rows (reference / docs).
 *
 * Each row only includes tiers that exist in the wiki table. Order is always:
 *   common → rare → epic → legendary → mythic → ancestral
 *
 * When reasoning about partial rows, anchor from the **last present tier** and walk backward
 * (Ancestral if the row has it, else Mythic, else Legendary, …). The game's physical
 * ModuleManager.effects sparse table may insert duplicate picks or drop the top tier — see
 * `gameValueRarityForSparseRowEntry` in gen-game-module-effect-index.mjs for save indices.
 */

export const SUBMODULE_RARITIES = [
  'common',
  'rare',
  'epic',
  'legendary',
  'mythic',
  'ancestral',
]

/** Present wiki tiers for a submodule row, lowest → highest. */
export function wikiTiersPresent(row) {
  return SUBMODULE_RARITIES.filter((r) => row.cells[r] != null)
}

/**
 * Conceptual tier when counting backward from the highest present wiki tier.
 * `offsetFromEnd` 0 = highest (Ancestral when present), 1 = next down, etc.
 */
export function conceptualTierFromEnd(row, offsetFromEnd) {
  const tiers = wikiTiersPresent(row)
  if (tiers.length === 0) return null
  const idx = tiers.length - 1 - offsetFromEnd
  return idx >= 0 ? tiers[idx] : null
}

/** Human-readable summary for maintainer scripts / docs. */
export function describeSubmoduleRowTiers(row) {
  const present = wikiTiersPresent(row)
  return {
    label: row.label,
    presentTiers: present,
    highest: present[present.length - 1] ?? null,
    lowest: present[0] ?? null,
    anchoredFromEnd: present
      .slice()
      .reverse()
      .map((rarity, offsetFromEnd) => ({ offsetFromEnd, rarity })),
  }
}

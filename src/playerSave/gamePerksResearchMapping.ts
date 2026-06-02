/**
 * Perks lab ↔ game `researchLevel[id]`.
 * Perks labs use scattered ids (see MANUAL_ANCHORS in gen-game-research-index.mjs).
 */
export const PERKS_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Unlock Perks': 80,
  'Waves Required': 81,
  'Auto Pick Perks': 82,
  'Standard Perks Bonus': 83,
  'Perk Option Quantity': 84,
  'First Perk Choice': 85,
  'Ban Perks': 87,
  'Improve Trade-off Perks': 88,
  'Auto Pick Ranking': 153,
} as const satisfies Record<string, number>

export type PerksResearchLabName = keyof typeof PERKS_RESEARCH_LEVEL_ID_BY_LAB_NAME

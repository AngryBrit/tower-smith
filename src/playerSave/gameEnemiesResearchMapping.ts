/**
 * Enemies lab ↔ game `researchLevel[id]`.
 * First eleven enemy labs use ids 110–120; ray/vampire/scatter/range block uses 220–226.
 */
export const ENEMIES_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Common Enemy Health': 110,
  'Common Enemy Attack': 111,
  'Fast Enemy Health': 112,
  'Fast Enemy Attack': 113,
  'Fast Enemy Speed': 114,
  'Tank Enemy Health': 115,
  'Tank Enemy Attack': 116,
  'Ranged Enemy Health': 117,
  'Ranged Enemy Attack': 118,
  'Boss Health': 119,
  'Boss Attack': 120,
  'Ray Enemy Attack': 220,
  'Ray Enemy Health': 221,
  'Vampire Enemy Attack': 222,
  'Vampire Enemy Health': 223,
  'Scatter Enemy Attack': 224,
  'Scatter Enemy Health': 225,
  'Ranged Enemy Range': 226,
} as const satisfies Record<string, number>

export type EnemiesResearchLabName = keyof typeof ENEMIES_RESEARCH_LEVEL_ID_BY_LAB_NAME

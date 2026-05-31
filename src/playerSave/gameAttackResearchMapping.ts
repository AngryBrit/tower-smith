/**
 * Attack lab ↔ game `researchLevel[id]`.
 * First seven attack labs use sequential ids 0–6 (UI order); later labs use scattered ids.
 */
export const ATTACK_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  Damage: 0,
  'Attack Speed': 1,
  'Critical Factor': 2,
  Range: 3,
  'Damage / Meter': 4,
  'Super Crit Chance': 5,
  'Super Crit Mult': 6,
  'Max Rend Armor Multiplier': 131,
  'Light Speed Shots': 150,
} as const satisfies Record<string, number>

export type AttackResearchLabName = keyof typeof ATTACK_RESEARCH_LEVEL_ID_BY_LAB_NAME

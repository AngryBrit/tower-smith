/**
 * Defense lab ↔ game `researchLevel[id]`.
 * First nine defense labs use sequential ids 10–18 (UI order).
 * Wall labs (UI order): Wall Health 126, Wall Rebuild 127, Wall Regen 128, Wall Thorns 129.
 */
export const DEFENSE_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  Health: 10,
  'Health Regen': 11,
  'Defense Absolute': 12,
  'Defense %': 13,
  'Orbs Speed': 14,
  'Land Mine Damage': 15,
  'Land Mine Decay': 16,
  'Shockwave Size': 17,
  'Orb Boss Hit': 18,
  'Wall Health': 126,
  'Wall Rebuild': 127,
  'Wall Regen': 128,
  'Wall Thorns': 129,
  'Wall Fortification': 144,
  'Garlic Thorns': 193,
} as const satisfies Record<string, number>

export type DefenseResearchLabName = keyof typeof DEFENSE_RESEARCH_LEVEL_ID_BY_LAB_NAME

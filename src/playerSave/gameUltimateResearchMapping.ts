/**
 * Ultimate weapon lab ↔ game `researchLevel[id]`.
 * Golden tower / chain lightning / death wave block: ids 60–66 (UI order after first ten ult labs).
 * Black hole damage labs and others use scattered ids (see MANUAL_ANCHORS in gen script).
 */
export const ULTIMATE_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Golden Tower Bonus': 60,
  'Golden Tower Duration': 61,
  'Chain Lightning Shock': 62,
  'Shock Chance': 63,
  'Shock Multiplier': 64,
  'Death Wave Health': 65,
  'Death Wave Coin Bonus': 66,
  'Black Hole Damage': 94,
  'Extra Black Hole': 95,
  'Black Hole Coin Bonus': 96,
  'Spotlight Coin Bonus': 97,
  'Spotlight Missiles': 98,
  'Black Hole Disable Ranged Enemies': 132,
} as const satisfies Record<string, number>

export type UltimateResearchLabName = keyof typeof ULTIMATE_RESEARCH_LEVEL_ID_BY_LAB_NAME

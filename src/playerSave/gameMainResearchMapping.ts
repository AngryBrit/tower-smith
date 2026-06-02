/**
 * Main research lab ↔ game `researchLevel[id]`.
 * First twelve main labs use sequential ids 30–41 (UI order).
 * Workshop Enhancements unlock uses save id 133; Reroll Daily Mission uses id 151.
 */
export const MAIN_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Game Speed': 30,
  'Starting Cash': 31,
  'Workshop Attack Discount': 32,
  'Workshop Defense Discount': 33,
  'Workshop Utility Discount': 34,
  'Labs Coin Discount': 35,
  'Labs Speed': 36,
  'Buy Multiplier': 37,
  'More Round Stats': 38,
  'Target Priority': 39,
  'Card Presets': 40,
  'Workshop Respec': 41,
  'Reroll Daily Mission': 151,
  'Workshop Enhancements': 133,
  'Enhancement Attack - Coin Discount': 134,
  'Enhancement Defense - Coin Discount': 135,
  'Enhancement Utility - Coin Discount': 136,
} as const satisfies Record<string, number>

export type MainResearchLabName = keyof typeof MAIN_RESEARCH_LEVEL_ID_BY_LAB_NAME

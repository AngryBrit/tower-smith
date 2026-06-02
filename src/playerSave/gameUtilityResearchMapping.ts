/**
 * Utility lab ↔ game `researchLevel[id]`.
 * Cash Bonus–Package After Boss use ids 20–26; Recovery Package labs use 19, 28–29 (UI order).
 */
export const UTILITY_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Cash Bonus': 20,
  'Cash / Wave': 21,
  'Coins / Kill Bonus': 22,
  'Coins / Wave': 23,
  Interest: 24,
  'Max Interest': 25,
  'Package After Boss': 26,
  'Recovery Package Amount': 19,
  'Recovery Package Max': 28,
  'Recovery Package Chance': 29,
  'Enemy Attack Level Skip': 124,
  'Enemy Health Level Skip': 125,
} as const satisfies Record<string, number>

export type UtilityResearchLabName = keyof typeof UTILITY_RESEARCH_LEVEL_ID_BY_LAB_NAME
